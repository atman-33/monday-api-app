import axios from 'axios';

// monday.com APIのアクセストークンをここに設定
const API_TOKEN = 'your_monday_api_token_here';

// monday.com APIのエンドポイント
const API_URL = 'https://api.monday.com/v2';

// GraphQLクエリでボードのアイテム情報を取得
const query = `
  query {
    boards {
      id
      name
      items {
        id
        name
      }
    }
  }
`;

async function fetchBoardItems() {
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
    console.log('取得したデータ:', response.data);
  } catch (error) {
    console.error('データ取得中にエラーが発生:', error);
  }
}

// 実行
fetchBoardItems();