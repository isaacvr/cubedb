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
let Sessions = new NeDB({ filename: __dirname + '/database/sessions.db', autoload: true });
let Solves = new NeDB({ filename: __dirname + '/database/solves.db', autoload: true });
  
/// Algorithms handler
ipcMain.on('algorithms', (event, arg) => {

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
ipcMain.on('cards', (event) => {
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
ipcMain.on('get-tutorials', (event) => {
  Tutorials.find({}, (err, tutorials) => {
    return event.sender.send('tutorial', ['get-tutorials', err ? null : tutorials]);
  });
});

ipcMain.on('add-tutorial', (event, arg) => {
  Tutorials.insert(arg, function(err, tutorial) {
    return event.sender.send('tutorial', [ 'add-tutorial', err ? null: tutorial ]);
  });
});

ipcMain.on('remove-tutorial', (event, arg) => {
  Tutorials.remove({ _id: arg._id }, function(err, tutorial) {
    return event.sender.send('tutorial', [ 'remove-tutorial', err ? null : tutorial ]);
  });
});

ipcMain.on('update-tutorial', (event, arg) => {
  Tutorials.update({ _id: arg._id }, {
    $set: {
      title: arg.title,
      titleLower: arg.titleLower,
      puzzle: arg.puzzle,
      algs: arg.algs,
      content: arg.content
    }
  }, function(err) {
    return event.sender.send('tutorial', [ 'update-tutorial', err ? null : arg ]);
  });
});

/// Sessions handler
ipcMain.on('get-sessions', (event) => {
  Sessions.find({}, function(err, sessions) {
    return event.sender.send('session', ['get-sessions', err ? null : sessions]);
  });
});

ipcMain.on('add-session', (event, arg) => {
  Sessions.insert({ name: arg.name }, function(err, session) {
    return event.sender.send('session', [ 'add-session', err ? null: session ]);
  });
});

ipcMain.on('remove-session', (event, arg) => {
  Solves.remove({ session: arg._id }, function(err) {
    Sessions.remove({ _id: arg._id }, function(err1, session) {
      return event.sender.send('session', [ 'remove-session', err1 ? null : session ]);
    });
  });
});

ipcMain.on('rename-session', (event, arg) => {
  Sessions.update({ _id: arg._id }, { $set: { name: arg.name } }, function(err, session) {
    return event.sender.send('session', [ 'rename-session', err ? null : arg ]);
  });
});

/// Solves handler
ipcMain.on('get-solves', (event) => {
  Solves.find({}, (err, solves) => {
    return event.sender.send('solves', ['get-solves', err ? null : solves ]);
  });
});

ipcMain.on('add-solve', (event, arg) => {
  Solves.insert(arg, function(err, solve) {
    return event.sender.send('solves', ['add-solve', err ? null : [solve] ]);
  });
});

ipcMain.on('update-solve', (event, arg) => {
  Solves.update({ _id: arg._id }, {
    $set: {
      comments: arg.comments,
      penalty: arg.penalty
    }
  }, (err, n, solve) => {
    return event.sender.send('solves', ['update-solve', err ? null : true ]);
  });
});

ipcMain.on('remove-solves', (event, arg) => {
  Solves.remove({ _id: { $in: arg } }, { multi: true }, function(err, solves) {
    return event.sender.send('solves', ['remove-solves', err ? null : arg ]);
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
      // devTools: false,
      nodeIntegration: true,
      // allowRunningInsecureContent: (serve) ? true : false,
      allowRunningInsecureContent: false,
      enableRemoteModule : true // true if you want to use remote module in renderer context (ie. Angular)
    },
    icon: __dirname + '/logo.png'
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

  Sessions.count({}, function(err, count) {
    if ( !count ) {
      Sessions.insert({
        name: "Session 1"
      });
    }
  }); 

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
