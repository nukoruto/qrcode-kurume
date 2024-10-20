//importみたいなしりーず
const express = require('express');
const os = require('os');
const fs = require('fs');
const path = require('path');
const multer = require('multer');
const app = express();
const port = 3002;

// Wi-FiアダプタのIPv4アドレスを取得する関数
function getWifiIPAddress() {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
      if (name.includes('Wi-Fi') || name.includes('Wireless')) {
          for (const iface of interfaces[name]) {
              if (iface.family === 'IPv4' && !iface.internal) {
                  return iface.address;
              }
          }
      }
  }
  return '127.0.0.1';
}

const localIP = getWifiIPAddress();

// publicディレクトリを静的ファイルのルートディレクトリとして指定
app.use(express.static('public'));

// 画像保存ディレクトリを指定
const saveDirectory = 'C:\\Users\\df360\\Pictures\\demo';

// multerの設定
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, saveDirectory);  // 保存先ディレクトリ
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, `image_${uniqueSuffix}.png`);  // ファイル名を設定
  }
});
const upload = multer({ storage: storage, limits: { fileSize: 50 * 1024 * 1024 } });  // ファイルサイズ制限を50MBに設定

// 画像保存用のPOSTエンドポイント
app.post('/upload-image', upload.single('image'), (req, res) => {
  console.log('Image saved to', req.file.path);
  res.status(200).send('Image saved successfully');
});

// サーバー起動
app.listen(port, '0.0.0.0', () => {
  console.log(`Server running at http://${localIP}:${port}/`);
});

