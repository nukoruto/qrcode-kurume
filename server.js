// 必要なモジュールの読み込み
const express = require('express');
const fs = require('fs');
const path = require('path');
const multer = require('multer');
const bonjour = require('bonjour')();  // bonjourパッケージの読み込み
const os = require('os');

const app = express();
const port = 3002;

// publicディレクトリを静的ファイルのルートディレクトリとして指定
app.use(express.static('public'));

// 実行中のユーザーのホームディレクトリを取得
const userHomeDir = os.homedir();

// 画像保存ディレクトリを指定（ユーザーのPicturesフォルダ内）
const saveDirectory = path.join(userHomeDir, 'Pictures', 'demo');

// ディレクトリが存在しない場合は作成
if (!fs.existsSync(saveDirectory)) {
    fs.mkdirSync(saveDirectory, { recursive: true });
}

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
  console.log(`Server running at http://localhost:${port}/`);

  // mDNS (Bonjour) でサービスをアナウンス
  bonjour.publish({ name: 'qr-tenken', type: 'http', port: port });
  console.log(`mDNS service published for qr-tenken.local on port ${port}`);
});
