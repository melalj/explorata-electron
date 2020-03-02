import { ipcMain } from 'electron';

import readJsonStream from '../utils/readJsonStream';

// DETECT DATASET
ipcMain.handle('detectDataset', async (event, files) => {
  const isFbMessenger = await readJsonStream(
    files[0],
    'participants.*',
    'latin1'
  );
  if (isFbMessenger.length) return 'FB_MESSENGER';
  return null;
});
