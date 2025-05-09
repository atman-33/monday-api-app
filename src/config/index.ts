import path from 'node:path';
import dotenv from 'dotenv';

dotenv.config();

const MONDAY_LOGIN_URL =
  process.env.MONDAY_LOGIN_URL || 'https://auth.monday.com/auth/login_monday';
const API_TOKEN = process.env.API_TOKEN || '';
const API_URL = process.env.API_URL || 'https://api.monday.com/v2';
const BOARD_ID = process.env.BOARD_ID || '';
const MONDAY_DOC_COLUMN_ID = process.env.MONDAY_DOC_COLUMN_ID || '';
const ITEMS_PAGE_LIMIT = process.env.ITEMS_PAGE_LIMIT || 100;

const COOKIES_PATH = path.resolve(process.cwd(), 'cookies.json');
const GROUP_ID_PATH = path.resolve(process.cwd(), 'selected-group.json');

export const env = {
  MONDAY_LOGIN_URL,
  API_TOKEN,
  API_URL,
  BOARD_ID,
  MONDAY_DOC_COLUMN_ID,
  ITEMS_PAGE_LIMIT,
  COOKIES_PATH,
  GROUP_ID_PATH,
};
