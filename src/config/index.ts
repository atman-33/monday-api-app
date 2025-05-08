import dotenv from 'dotenv';
import path from 'node:path';

dotenv.config();

const MONDAY_LOGIN_URL =
  process.env.MONDAY_LOGIN_URL || 'https://auth.monday.com/auth/login_monday';
const API_TOKEN = process.env.API_TOKEN || '';
const API_URL = process.env.API_URL || 'https://api.monday.com/v2';
const COOKIES_PATH = path.resolve(__dirname, '../cookies.json');
const BOARD_ID = process.env.BOARD_ID || '';
const MONDAY_DOC_COLUMN_ID = process.env.MONDAY_DOC_COLUMN_ID || '';
const ITEMS_PAGE_LIMIT = process.env.ITEMS_PAGE_LIMIT || 100;

export const env = {
  MONDAY_LOGIN_URL,
  API_TOKEN,
  API_URL,
  COOKIES_PATH,
  BOARD_ID,
  MONDAY_DOC_COLUMN_ID,
  ITEMS_PAGE_LIMIT,
};
