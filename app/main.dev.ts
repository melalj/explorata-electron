/* eslint-disable no-param-reassign */
/* eslint global-require: off, no-console: off */

/**
 * This module executes inside of electron's main process. You can start
 * electron renderer process from here and communicate with the other processes
 * through IPC.
 *
 * When running `yarn build` or `yarn build-main`, this file is compiled to
 * `./app/main.prod.js` using webpack. This gives us some performance wins.
 */
import fs from 'fs-extra';
import path from 'path';
import Database from 'better-sqlite3';
import url from 'url';
import { app, BrowserWindow, ipcMain } from 'electron';
import MenuBuilder from './menu';

let mainWindow: BrowserWindow | null = null;

if (process.env.NODE_ENV === 'production') {
  const sourceMapSupport = require('source-map-support');
  sourceMapSupport.install();
}

if (
  process.env.NODE_ENV === 'development' ||
  process.env.DEBUG_PROD === 'true'
) {
  require('electron-debug')();
}

const installExtensions = async () => {
  const installer = require('electron-devtools-installer');
  const forceDownload = !!process.env.UPGRADE_EXTENSIONS;
  const extensions = ['REACT_DEVELOPER_TOOLS', 'REDUX_DEVTOOLS'];

  return Promise.all(
    extensions.map(name => installer.default(installer[name], forceDownload))
  ).catch(console.log);
};

const createWindow = async () => {
  if (
    process.env.NODE_ENV === 'development' ||
    process.env.DEBUG_PROD === 'true'
  ) {
    await installExtensions();
  }

  mainWindow = new BrowserWindow({
    show: false,
    width: 1100,
    height: 980,
    enableRemoteModule: false,
    minWidth: 1100,
    backgroundColor: '#f5f5f5',
    webPreferences:
      process.env.NODE_ENV === 'development' || process.env.E2E_BUILD === 'true'
        ? {
            nodeIntegration: true
          }
        : {
            preload: path.join(__dirname, 'dist/renderer.prod.js')
          }
  });

  mainWindow.loadURL(
    url.format({
      pathname: path.join(__dirname, 'app.html'),
      protocol: 'file:',
      slashes: true
    })
  );

  // @TODO: Use 'ready-to-show' event
  //        https://github.com/electron/electron/blob/master/docs/api/browser-window.md#using-ready-to-show-event
  mainWindow.webContents.on('did-finish-load', () => {
    if (!mainWindow) {
      throw new Error('"mainWindow" is not defined');
    }
    if (process.env.START_MINIMIZED) {
      mainWindow.minimize();
    } else {
      mainWindow.show();
      mainWindow.focus();
    }
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  const menuBuilder = new MenuBuilder(mainWindow);
  menuBuilder.buildMenu();
};

/**
 * Add event listeners...
 */

app.on('window-all-closed', () => {
  app.quit();
});

app.on('ready', createWindow);

app.on('activate', () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) createWindow();
});

//
// IPC

// DB
let db;
let insertMany;
ipcMain.handle('dbInit', async (event, settings) => {
  const datasetName = settings.name;
  const dbPath = path.join(app.getPath('appData'), `${datasetName}.sqlite`);
  await fs.remove(dbPath);

  db = new Database(dbPath);
  db.exec(settings.schema);

  insertMany = (table, columns) => {
    const insert = db.prepare(`
      INSERT INTO ${table} (${columns.join(', ')})
      VALUES (@${columns.join(', @')})
    `);
    return db.transaction(msgs => {
      for (let i = 0; i < msgs.length; i += 1) insert.run(msgs[i]);
    });
  };
  return true;
});

ipcMain.handle('dbInsertMany', async (event, table, columns, data) => {
  if (!insertMany) return null; // TODO: Improve error handling
  insertMany(table, columns)(data);
  return true;
});

ipcMain.handle('dbFetchOne', async (event, query, params) => {
  if (!db) return null; // TODO: Improve error handling
  const res = await db.prepare(query).get(params || {});
  return res;
});

ipcMain.handle('dbFetchMany', async (event, query, params) => {
  if (!db) return null; // TODO: Improve error handling
  const res = await db.prepare(query).all(params || {});
  return res;
});

// FILESYSTEM
ipcMain.handle('readFile', async (event, ...args) => {
  const res = await fs.readFile(...args);
  return res;
});

ipcMain.handle('readJSON', async (event, ...args) => {
  const res = await fs.readJSON(...args);
  return res;
});
