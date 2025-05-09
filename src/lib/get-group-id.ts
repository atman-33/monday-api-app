import { env } from '@/config';
import * as fs from 'node:fs';

const getGroupId = (): string => {
  const groupDataPath = env.GROUP_ID_PATH;

  let groupData: { id: string };

  try {
    groupData = JSON.parse(fs.readFileSync(groupDataPath, 'utf-8'));
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code === 'ENOENT') {
      console.error(
        `❌ エラー: ${groupDataPath} が見つかりません！グループを選択して保存してください。\n👉 コマンドを実行してグループを選択: npm run select-group`,
      );
      process.exit(1);
    } else {
      console.error(
        `❌ エラー: ${groupDataPath} の読み込み中に問題が発生しました。`,
      );
      console.error(err);
      process.exit(1);
    }
  }

  return groupData.id;
};

export { getGroupId };
