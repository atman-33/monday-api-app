import axios from 'axios';
import fs from 'node:fs';
import readline from 'node:readline';
import { env } from '../../config';

/**
 * グループを選択して保存します。
 */
export const selectGroup = async () => {
  const groupQuery = `
  query {
    boards(ids: [${env.BOARD_ID}]) {
      groups {
        id
        title
      }
    }
  }`;

  const response = await axios.post(
    env.API_URL,
    { query: groupQuery },
    {
      headers: {
        Authorization: env.API_TOKEN,
        'Content-Type': 'application/json',
      },
    },
  );

  const groups = response.data.data.boards[0].groups as Array<{
    id: string;
    title: string;
  }>;
  console.log('📋 グループ一覧:');
  groups.forEach((group, index) => {
    console.log(`${index + 1}: ${group.title} (ID: ${group.id})`);
  });

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  const selectedGroupIndex = await new Promise<number>((resolve) => {
    rl.question('選択するグループの番号を入力してください: ', (answer) => {
      resolve(Number.parseInt(answer, 10) - 1);
    });
  });

  rl.close();

  if (
    selectedGroupIndex < 0 ||
    selectedGroupIndex >= groups.length ||
    Number.isNaN(selectedGroupIndex)
  ) {
    console.error('❌ 無効な選択です。');
    return;
  }

  const selectedGroup = groups[selectedGroupIndex];
  fs.writeFileSync(env.GROUP_ID_PATH, JSON.stringify(selectedGroup, null, 2));

  console.log(
    `✅ 選択したグループを保存しました: ${selectedGroup.title} (ID: ${selectedGroup.id})`,
  );
};
