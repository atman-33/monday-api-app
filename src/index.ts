import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

// monday.com APIのアクセストークンとエンドポイントを.envファイルから取得
const API_TOKEN = process.env.API_TOKEN || '';
const API_URL = process.env.API_URL || 'https://api.monday.com/v2';

// GraphQLクエリでボードのアイテム情報を取得
const query = `
query {
  boards(ids: [9044506668]) {
    name
    columns {
      id
      title
      type
    }
    items_page(limit: 100) {
      items {
        id
        name
        column_values {
          id
          type
          text
          value
        }
      }
    }
  }
}
`;

// fetchBoardItems関数を定数関数の形式に修正
const fetchBoardItems = async () => {
  try {
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

    // 結果をコンソールに出力
    console.log('取得したデータ:');
    console.dir(response.data, { depth: null, colors: true });
  } catch (error) {
    console.error('データ取得中にエラーが発生:', error);
    
    // エラー詳細をログに出力
    if (error instanceof Error) {
      console.error('エラー詳細:', error.message);
    }
  }
}

// 実行
fetchBoardItems();