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

// ファイルを直接取得するエンドポイント
app.get('/file', (req, res) => {
  const filePath = req.query.filePath; // クエリパラメータでファイルパスを取得

  if (!filePath) {
    return res.status(400).send('File path parameter is missing');
  }

  // `filePath` の先頭スラッシュを削除し、`baseDir`に接続
  const fullPath = path.join(baseDir, filePath);

  if (!fs.existsSync(fullPath)) {
    return res.status(404).send('File not found');
  }

  // ファイルを送信
  res.download(fullPath, (err) => {
    if (err) {
      console.error('File download error:', err);
      res.status(500).send('Error occurred while downloading the file');
    }
  });
});

//ファイル一覧を参照するエンドポイント
app.get('/files', (req, res) => {
  const dir = req.query.dir; // クエリパラメータでディレクトリパスを取得

  if (!dir) {
    return res.status(400).send('Directory parameter is missing');
  }

  // ベースディレクトリを接続し、ディレクトリパスを構築
  const directoryPath = path.join(baseDir, dir.replace(/^\//, '').replace(/\//g, path.sep));
  
  // ディレクトリが存在しない場合のエラーハンドリング
  if (!fs.existsSync(directoryPath)) {
    return res.status(404).send('Directory not found');
  }

  try {
    // ディレクトリ内のすべてのファイルを取得し、拡張子をフィルタリング
    const files = fs.readdirSync(directoryPath).filter(file => {
      const ext = path.extname(file).toLowerCase();
      return ext === '.xlsx' || ext === '.pdf';
    });

    if (files.length === 0) {
      return res.status(404).send('No .xlsx or .pdf files found in the specified directory.');
    }

    // ファイルリストをJSONとして返す
    res.json(files);
  } catch (error) {
    console.error('Error reading directory:', error);
    res.status(500).send('Error reading directory.');
  }
});


// ファイルアップロード
app.post('/upload', upload.single('file'), (req, res) => {
  try {
      // 日付を取得してフォルダ名を生成
      const today = new Date();
      const yyyyMMdd = today.toISOString().slice(0, 10).replace(/-/g, '');

      // 保存先ディレクトリ: baseDirの親フォルダの中にdailyフォルダを作成
      const dailyDir = path.join(path.dirname(baseDir), 'daily', yyyyMMdd);

      // 必要ならフォルダを再帰的に作成
      if (!fs.existsSync(dailyDir)) {
          fs.mkdirSync(dailyDir, { recursive: true });
      }

      // アップロードされたファイルの保存先パス
      const destPath = path.join(dailyDir, req.file.originalname);

      // ファイルを指定した場所に移動
      fs.renameSync(req.file.path, destPath);

      console.log(`File uploaded to: ${destPath}`);
      res.status(200).send('File uploaded successfully');
  } catch (err) {
      console.error('Error during file upload:', err);
      res.status(500).send('File upload failed');
  }
});


app.listen(port, serverIP, () => {
  console.log(`Server is running on http://${serverIP}:${port}`);
});
