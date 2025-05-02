export const waitForChrome = async (): Promise<void> => {
  const url = 'http://127.0.0.1:9222/json/version';
  for (let i = 0; i < 10; i++) {
    try {
      const res = await fetch(url);
      if (res.ok) return;
    } catch (_) {}
    await new Promise((r) => setTimeout(r, 500));
  }
  throw new Error('Chrome did not start in time.');
};
