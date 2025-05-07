import axios from 'axios';
import dotenv from 'dotenv';
import fs from 'node:fs';
import path from 'node:path';
import puppeteer from 'puppeteer';
import { launchChrome } from './lib/launch-chrome';
import { waitForChrome } from './lib/wait-for-chrome';
import type { Item, ParsedDocColumnValue } from './types';

dotenv.config();

const MONDAY_LOGIN_URL =
  process.env.MONDAY_LOGIN_URL || 'https://auth.monday.com/auth/login_monday';
const API_TOKEN = process.env.API_TOKEN || '';
const API_URL = process.env.API_URL || 'https://api.monday.com/v2';
const COOKIES_PATH = path.resolve(__dirname, 'cookies.json');
const BOARD_ID = process.env.BOARD_ID;
const MONDAY_DOC_COLUMN_ID = process.env.MONDAY_DOC_COLUMN_ID || '';
const ITEMS_PAGE_LIMIT = process.env.ITEMS_PAGE_LIMIT || 100;

const query = `
query {
  boards(ids: [${BOARD_ID}]) {
    name
    items_page(limit: ${ITEMS_PAGE_LIMIT}) {
      items {
        id
        name
        column_values {
          id
          type
          value
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
    API_URL,
    { query },
    {
      headers: {
        Authorization: API_TOKEN,
        'Content-Type': 'application/json',
      },
    },
  );

  const board = response.data.data.boards[0];
  return board.items_page.items;
};

/**
 * Cookieを保存します。
 */
const saveCookies = async () => {
  // Chromeをデバッグモードで起動
  launchChrome();
  // Chromeが起動するまで待機
  await waitForChrome();
  // PuppeteerでChromeに接続
  const browser = await puppeteer.connect({
    browserURL: 'http://localhost:9222',
  });

  const page = await browser.newPage();
  await page.goto(MONDAY_LOGIN_URL, { waitUntil: 'networkidle2' });

  console.log(
    '🔐 ログインしてください。ログイン後、数秒待ってブラウザを閉じます...',
  );
  await new Promise((resolve) => setTimeout(resolve, 20000)); // 20秒待機

  const cookies = await browser.cookies();
  fs.writeFileSync(COOKIES_PATH, JSON.stringify(cookies, null, 2));

  console.log('✅ Cookieを保存しました。');
  await browser.close();
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
  const cookies = JSON.parse(fs.readFileSync(COOKIES_PATH, 'utf-8'));

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
    } catch (err) {
      console.error(`❌ 読み込み失敗: ${doc.url}`);
      console.error(err);
    } finally {
      await page.close();
    }
  }

  await browser.close();
};

/**
 * メイン関数
 */
const main = async () => {
  const saveCookiesMode = process.argv.includes('--save-cookies');

  if (saveCookiesMode) {
    await saveCookies();
    return;
  }

  const items = await fetchBoardItems();
  const docLinks: { itemName: string; docName: string; url: string }[] = [];

  for (const item of items) {
    // Docカラムを取得
    // NOTE: MONDAY_DOC_COLUMN_IDが指定されている場合、そのカラムのみを対象とする
    const docColumn = item.column_values.find(
      (col) =>
        col.type === 'doc' &&
        (!MONDAY_DOC_COLUMN_ID || col.id === MONDAY_DOC_COLUMN_ID),
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

main();
