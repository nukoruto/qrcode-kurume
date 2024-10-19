const { app, BrowserWindow } = require('electron');
const path = require('path');
const child_process = require('child_process');

// サーバーをバックグラウンドで実行
let serverProcess;

function createWindow() {
  // メインウィンドウの作成
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true,  // RendererプロセスでNode.jsモジュールを使用
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

// 全てのウィンドウが閉じられた時の処理
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
  if (serverProcess) {
    serverProcess.kill();
  }
});
