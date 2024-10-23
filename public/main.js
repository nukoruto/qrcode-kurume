const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');
const child_process = require('child_process');

// サーバーをバックグラウンドで実行
let serverProcess;

function createWindow() {
  // メインウィンドウの作成
  let mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
        preload: path.join(__dirname, 'preload.js'),  // preloadスクリプトを指定
        nodeIntegration: true,  // RendererプロセスでNode.jsモジュールを使用
        contextIsolation: true,
    }
  });

  // ローカルサーバー上のアプリケーションをロード
  mainWindow.loadURL('http://localhost:3002');  // Electronがローカルサーバーを参照
  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// Electronの初期化が完了したら実行
app.on('ready', () => {
  // server.js のパスを一つ上のディレクトリから取得
  const serverPath = path.join(__dirname, '..', 'server.js');

  // サーバーを起動
  serverProcess = child_process.spawn('node', [serverPath]);

  serverProcess.stdout.on('data', (data) => {
    console.log(`stdout: ${data}`);
  });

  serverProcess.stderr.on('data', (data) => {
    console.error(`stderr: ${data}`);
  });

  createWindow();
});


// 画像保存ディレクトリの設定（例：ユーザーのピクチャフォルダ）
const saveDirectory = 'C:\\Users\\df360\\Pictures\\demo';

// Electronの初期化が完了したときにディレクトリがなければ作成
app.on('ready', () => {
  if (!fs.existsSync(saveDirectory)) {
    fs.mkdirSync(saveDirectory, {recursive: true});
  }
});

// 画像保存処理
ipcMain.on('save-image', (event, imageDataUrl) => {
    console.log("Received image data");  // イベントがトリガーされたか確認
  
    const base64Data = imageDataUrl.replace(/^data:image\/png;base64,/, "");
    const filePath = path.join(saveDirectory, `image_${Date.now()}.png`);
  
    fs.writeFile(filePath, base64Data, 'base64', (err) => {
      if (err) {
        console.error('Failed to save image:', err);
      } else {
        console.log('Image saved to', filePath);
      }
    });
  });
  

// 全てのウィンドウが閉じられた時の処理
app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
      app.quit();
    }
    if (serverProcess) {
      serverProcess.kill();
    }
  });