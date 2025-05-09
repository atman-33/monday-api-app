import { getContentsAndSaveCsv } from '@/modules/commands/get-contents-and-save-csv';
import { saveCookies } from '@/modules/commands/save-cookies';
import { selectGroup } from '@/modules/commands/select-group';

/**
 * メイン関数
 */
const main = async () => {
  if (process.argv.includes('--save-cookies')) {
    await saveCookies();
    return;
  }

  if (process.argv.includes('--select-group')) {
    await selectGroup();
    return;
  }

  await getContentsAndSaveCsv();
  console.log('✅ CSVファイルを出力しました。');
};

main();
