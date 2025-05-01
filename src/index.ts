import axios from 'axios';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import puppeteer from 'puppeteer';

dotenv.config();

const MONDAY_LOGIN_URL = process.env.MONDAY_LOGIN_URL || 'https://auth.monday.com/auth/login_monday';
const API_TOKEN = process.env.API_TOKEN || '';
const API_URL = process.env.API_URL || 'https://api.monday.com/v2';
const COOKIES_PATH = path.resolve(__dirname, 'cookies.json');

type Item = {
  id: string;
  name: string;
  column_values: Array<{
    id: string;
    type: string;
    text?: string;
    value?: string;
  }>;
};

const query = `
query {
  boards(ids: [9044506668]) {
    name
    items_page(limit: 100) {
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
}
`;

const fetchBoardItems = async (): Promise<Item[]> => {
  const response = await axios.post(
    API_URL,
    { query },
    {
      headers: {
        Authorization: API_TOKEN,
        'Content-Type': 'application/json',
      },
    }
  );

  const board = response.data.data.boards[0];
  return board.items_page.items;
};

const saveCookies = async () => {
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();
  await page.goto(MONDAY_LOGIN_URL, { waitUntil: 'networkidle2' });

  console.log('🔐 ログインしてください。ログイン後、数秒待ってブラウザを閉じます...');
  await new Promise((resolve) => setTimeout(resolve, 20000)); // 20秒待機

  const cookies = await page.cookies();
  fs.writeFileSync(COOKIES_PATH, JSON.stringify(cookies, null, 2));

  console.log('✅ Cookieを保存しました。');
  await browser.close();
};

const readDocContents = async (docUrls: { itemName: string; docName: string; url: string }[]) => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  // Cookieを読み込んでセット
  const cookies = JSON.parse(fs.readFileSync(COOKIES_PATH, 'utf-8'));
  await page.setCookie(...cookies);

  for (const doc of docUrls) {
    console.log(`\n📄 アイテム: ${doc.itemName}`);
    console.log(`🔗 Doc名: ${doc.docName}`);
    console.log(`🌐 URL: ${doc.url}`);

    try {
      await page.goto(doc.url, { waitUntil: 'networkidle2' });

      const content = await page.evaluate(() => {
        const container = document.querySelector('[data-testid="doc-container"]') || document.body;
        return (container as HTMLElement).innerText;
      });

      console.log(`📝 内容:\n${content.slice(0, 1000)}\n...`); // 長すぎると困るので1000字まで
    } catch (err) {
      console.error(`❌ 読み込み失敗: ${doc.url}`);
    }
  }

  await browser.close();
};

const main = async () => {
  const saveCookiesMode = process.argv.includes('--save-cookies');

  if (saveCookiesMode) {
    await saveCookies();
    return;
  }

  const items = await fetchBoardItems();
  const docLinks: { itemName: string; docName: string; url: string }[] = [];

  for (const item of items) {
    const docColumn = item.column_values.find((col) => col.type === 'doc');
    if (docColumn?.value) {
      try {
        const parsed = JSON.parse(docColumn.value);
        const files = parsed.files || [];

        files.forEach((file: any) => {
          docLinks.push({
            itemName: item.name,
            docName: file.name,
            url: file.linkToFile,
          });
        });
      } catch {
        console.warn(`⚠️ JSONパース失敗: ${item.name}`);
      }
    }
  }

  await readDocContents(docLinks);
};

main();
