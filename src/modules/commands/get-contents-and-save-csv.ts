import fs from 'node:fs';
import axios from 'axios';
import { stringify } from 'csv-stringify/sync';
import Iconv from 'iconv-lite';
import puppeteer from 'puppeteer';
import { env } from '../../config';
import { getGroupId } from '../../lib/get-group-id';
import type { Item, ParsedDocColumnValue } from '../../types';

export const getContentsAndSaveCsv = async () => {
  const items = await fetchBoardItems();
  const docLinks: { itemName: string; docName: string; url: string }[] = [];

  for (const item of items) {
    // Docカラムを取得
    // NOTE: MONDAY_DOC_COLUMN_IDが指定されている場合、そのカラムのみを対象とする
    const docColumn = item.column_values.find(
      (col) =>
        col.type === 'doc' &&
        (!env.MONDAY_DOC_COLUMN_ID || col.id === env.MONDAY_DOC_COLUMN_ID),
    );

    if (docColumn?.value) {
      try {
        const parsed = JSON.parse(docColumn.value) as ParsedDocColumnValue;
        const files = parsed.files || [];

        for (const file of files) {
          docLinks.push({
            itemName: item.name,
            docName: file.name,
            url: file.linkToFile,
          });
        }
      } catch {
        console.warn(`⚠️ JSONパース失敗: ${item.name}`);
      }
    }
  }

  await readDocContents(docLinks);
};

const createQuery = (boardId: string, groupId: string) => `
query {
  boards(ids: [${boardId}]) {
    groups(ids: ["${groupId}"]) {
      id
      title
      items_page(limit: ${env.ITEMS_PAGE_LIMIT}) {
        items{
          id
          name
          column_values{
            id
            type
            value
          }
        }
      }
    }
  }
}`;

/**
 * ボードのアイテムを取得します。
 *
 * @returns {Promise<Item[]>} アイテムの配列
 */
const fetchBoardItems = async (): Promise<Item[]> => {
  const response = await axios.post(
    env.API_URL,
    { query: createQuery(env.BOARD_ID, getGroupId()) },
    {
      headers: {
        Authorization: env.API_TOKEN,
        'Content-Type': 'application/json',
      },
    },
  );

  const board = response.data.data.boards[0];
  return board.groups[0].items_page.items;
};

/**
 * Docの内容を読み込みます。
 *
 * @param {Array<{ itemName: string; docName: string; url: string }>} docUrls DocのURL配列
 */
const readDocContents = async (
  docUrls: { itemName: string; docName: string; url: string }[],
) => {
  const browser = await puppeteer.launch({
    headless: false,
  });

  // Cookieを読み込み
  const cookies = JSON.parse(fs.readFileSync(env.COOKIES_PATH, 'utf-8'));

  const dataArray = [];
  let id = 1;
  for (const doc of docUrls) {
    console.log(`\n📄 アイテム: ${doc.itemName}`);
    console.log(`🔗 Doc名: ${doc.docName}`);
    console.log(`🌐 URL: ${doc.url}`);

    const page = await browser.newPage();
    try {
      // Cookieをセット
      await browser.setCookie(...cookies);

      console.log('🔄 読み込み中...');
      await page.goto(doc.url, { waitUntil: 'networkidle2' });
      console.log('✅ 読み込み完了。内容を取得中...');

      const content = await page.evaluate(() => {
        const container = document.querySelector('.blocks-list');
        return container ? (container as HTMLElement).innerText : '';
      });

      console.log(`📝 内容:\n${content.slice(0, 1000)}\n...`);

      // CSVデータを作成
      const data = {
        id: id++,
        itemName: doc.itemName,
        docName: doc.docName,
        url: doc.url,
        content: content,
      };

      dataArray.push(data);
    } catch (err) {
      console.error(`❌ 読み込み失敗: ${doc.url}`);
      console.error(err);
    } finally {
      await page.close();
    }
  }

  const csvString = stringify(dataArray, {
    header: true,
    quoted_string: true,
  });

  const csvStringSjis = Iconv.encode(csvString, 'Shift_JIS');
  fs.writeFileSync('output.csv', csvStringSjis);

  await browser.close();
};
