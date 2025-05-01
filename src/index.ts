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

    const board = response.data.data.boards[0];
    console.log(`📋 ボード名: ${board.name}`);
    console.log('📄 monday Docリンク一覧:\n');

    board.items_page.items.forEach((item: any) => {
      const docColumn = item.column_values.find((col: any) => col.type === 'doc');

      if (docColumn?.value) {
        try {
          const value = JSON.parse(docColumn.value);
          const files = value.files || [];

          files.forEach((file: any) => {
            console.log(`✅ アイテム: ${item.name}`);
            console.log(`   🔗 Doc名: ${file.name}`);
            console.log(`   🌐 URL: ${file.linkToFile}\n`);
          });
        } catch (e) {
          console.warn(`⚠️ JSONパース失敗: ${item.name}`);
        }
      }
    });
  } catch (error) {
    console.error('データ取得中にエラーが発生:', error);

    if (error instanceof Error) {
      console.error('エラー詳細:', error.message);
    }
  }
};

// 実行
fetchBoardItems();
