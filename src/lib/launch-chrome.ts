import { spawn } from 'child_process';
import os from 'os';
import path from 'path';

export const launchChrome = (): void => {
  const chromePath = `"C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe"`;

  const userDataDir = path.join(os.tmpdir(), 'remote-profile');

  const args = [
    '--remote-debugging-port=9222',
    `--user-data-dir=${userDataDir}`,
  ];

  const chrome = spawn(chromePath, args, {
    shell: true,
    detached: true,
    stdio: 'inherit',
  });

  chrome.unref();
};
