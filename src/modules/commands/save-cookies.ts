import fs from 'node:fs';
import { env } from '@/config';
import { launchChrome } from '@/lib/launch-chrome';
import { waitForChrome } from '@/lib/wait-for-chrome';
import puppeteer from 'puppeteer';

/**
 * Cookieを保存します。
 */
export const saveCookies = async () => {
  // Chromeをデバッグモードで起動
  launchChrome();
  // Chromeが起動するまで待機
  await waitForChrome();
  // PuppeteerでChromeに接続
  const browser = await puppeteer.connect({
    browserURL: 'http://localhost:9222',
  });

  const page = await browser.newPage();
  await page.goto(env.MONDAY_LOGIN_URL, { waitUntil: 'networkidle2' });

  console.log(
    '🔐 ログインしてください。ログイン後、数秒待ってブラウザを閉じます...',
  );
  await new Promise((resolve) => setTimeout(resolve, 20000)); // 20秒待機

  const cookies = await browser.cookies();
  fs.writeFileSync(env.COOKIES_PATH, JSON.stringify(cookies, null, 2));

  console.log('✅ Cookieを保存しました。');
  await browser.close();
};
