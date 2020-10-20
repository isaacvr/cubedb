import { app, BrowserWindow, ipcMain } from 'electron';
import * as path from 'path';
import * as url from 'url';
let NeDB = require('nedb');

let win: BrowserWindow = null;
const args = process.argv.slice(1),
  serve = args.some(val => val === '--serve');

let Algorithms = new NeDB({ filename: __dirname + '/database/algs.db', autoload: true });
let Cards = new NeDB({ filename: __dirname + '/database/cards.db', autoload: true });
let Tutorials = new NeDB({ filename: __dirname + '/database/tutorials.db', autoload: true });
  
/// Algorithms handler
ipcMain.on('algorithms', (event, arg) => {
  // console.log('ARGS: ', arg);

  Algorithms.find({
    parentPath: arg
  }, (err: Error, algs) => {
    if ( err ) {
      console.error('Server error :(');
      event.sender.send('algorithms', []);
      return;
    }

    event.sender.send('algorithms', algs);
  });

});

/// Cards handler
ipcMain.on('cards', (event, arg) => {
  console.log('ARGS: ', arg);

  Cards.find({}, (err: Error, algs) => {
    if ( err ) {
      console.error('Server error :(');
      event.sender.send('cards', []);
      return;
    }

    event.sender.send('cards', algs);
  });
  
});

/// Tutorials handler
ipcMain.on('tutorials', (event) => {
  Tutorials.find({}, (err, list) => {
    if ( err ) {
      console.log('Tutorials Get ERROR: ', err);
      return event.sender.send('tutorials', []);
    }
    let l1 = list.map(e => { return {
      title: e.title,
      titleLower: e.titleLower,
      puzzle: e.puzzle,
      algs: e.algs
    } });
    return event.sender.send('tutorials', l1);
  });
});

/// Other Stuff
ipcMain.on('minimize', () => {
  win.minimize();
});

ipcMain.on('maximize', () => {
  if ( win.isMaximized ) {
    win.unmaximize();
  } else {
    win.maximize();
  }
});

ipcMain.on('close', () => {
  app.exit();
});

function createWindow(): BrowserWindow {

  win = new BrowserWindow({
    x: 0,
    y: 0,
    fullscreen: true,
    frame: false,
    closable: true,
    webPreferences: {
      nodeIntegration: true,
      // allowRunningInsecureContent: (serve) ? true : false,
      allowRunningInsecureContent: false,
      enableRemoteModule : true // true if you want to use remote module in renderer context (ie. Angular)
    },
  });

  if (serve) {

    win.webContents.openDevTools();

    require('electron-reload')(__dirname, {
      electron: require(`${__dirname}/node_modules/electron`)
    });
    win.loadURL('http://localhost:4200');

  } else {
    win.loadURL(url.format({
      pathname: path.join(__dirname, 'dist/index.html'),
      protocol: 'file:',
      slashes: true
    }));
  }

  win.on('closed', () => win = null);

  return win;
}

try {
  app.on('ready', () => setTimeout(createWindow, 400));

  app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
      app.quit();
    }
  });

  app.on('activate', () => {
    if (win === null) {
      createWindow();
    }
  });

} catch (e) {
}
