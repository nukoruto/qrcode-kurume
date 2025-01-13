const express = require('express');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const os = require('os');

const port = 3002;
const app = express();
const upload = multer({ dest: 'uploads/' });
const username = os.userInfo().username;
const baseDir = path.join(`C:\\Users\\${username}\\Desktop\\data\\data`); // 新しいベースディレクトリ

if (!fs.existsSync(baseDir)) {
  fs.mkdirSync(baseDir, { recursive: true });
}

// Wireless LAN adapter Wi-FiのIPアドレス取得関数
function getWirelessLANIPAddress() {
  const networkInterfaces = os.networkInterfaces();
  for (const interfaceName in networkInterfaces) {
    const networkInterface = networkInterfaces[interfaceName];
    for (const interfaceDetails of networkInterface) {
      if (
        interfaceDetails.family === 'IPv4' &&
        !interfaceDetails.internal &&
        interfaceName.startsWith('Wi-Fi') // Wireless LAN adapter Wi-Fi を探す
      ) {
        return interfaceDetails.address;
      }
    }
  }
  return null;
}

const serverIP = getWirelessLANIPAddress();
if (!serverIP) {
  console.error('Wireless LAN adapter Wi-FiのIPアドレスが見つかりませんでした。');
  process.exit(1);
}

// ルートエンドポイントを定義
app.get('/', (req, res) => {
  res.send('<h1>Welcome to the File Server</h1><p>Use the application to interact with this server.</p>');
});

app.get('/files', (req, res) => {
  const dir = req.query.dir; // クエリパラメータでディレクトリ名を取得
  if (!dir) {
    return res.status(400).send('Directory parameter is missing');
  }

  // `dir`の先頭スラッシュを削除し、`baseDir`に接続
  const directoryPath = path.join(baseDir, dir.replace(/^\//, '').replace(/\//g, path.sep));
  if (!fs.existsSync(directoryPath)) {
    return res.status(404).send('Directory not found');
  }

  const files = fs.readdirSync(directoryPath).filter(file => file.endsWith('.xlsx'));
  if (files.length === 0) {
    return res.status(404).send('No .xlsx files found in the specified directory.');
  }

  res.json(files);
});

// ファイルアップロード
app.post('/upload', upload.single('file'), (req, res) => {
  const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD形式の日付
  const folderName = req.query.folderName; // クエリパラメータでフォルダ名を取得
  if (!folderName) {
    return res.status(400).send('Folder name is missing');
  }

  const uploadDir = path.join(baseDir, folderName, 'daily', today);
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  const destPath = path.join(uploadDir, req.file.originalname);
  fs.renameSync(req.file.path, destPath);

  res.send('File uploaded');
});

app.listen(port, serverIP, () => {
  console.log(`Server is running on http://${serverIP}:${port}`);
});
