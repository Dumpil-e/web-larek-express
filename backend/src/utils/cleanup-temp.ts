import cron from 'node-cron';
import * as fs from 'fs/promises';
import * as path from 'path';

const TEMP_DIR = path.join(process.cwd(), 'src', 'public', 'temp');
const MAX_AGE_MS = 24 * 60 * 60 * 1000; // 24 часа

function startTempCleanup() {
  cron.schedule('0 * * * *', async () => {
    try {
      const files = await fs.readdir(TEMP_DIR);
      const now = Date.now();

      const deletePromises = files.map(async (file) => {
        const filePath = path.join(TEMP_DIR, file);
        const stats = await fs.stat(filePath);

        if (now - stats.mtimeMs > MAX_AGE_MS) {
          await fs.unlink(filePath);
          return 1;
        }
        return 0;
      });

      const results = await Promise.all(deletePromises);
      // ✅ Явная типизация аккумулятора
      const deletedCount = results.reduce<number>((acc, val) => acc + val, 0);

      if (deletedCount > 0) {
        // eslint-disable-next-line no-console
        console.log(`[Cron] Удалено старых файлов: ${deletedCount}`);
      }
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('[Cron] Ошибка при очистке temp/:', err);
    }
  });

  // eslint-disable-next-line no-console
  console.log('[Cron] Задача очистки temp/ запущена: каждый час, файлы старше 24ч');
}

export default startTempCleanup;
