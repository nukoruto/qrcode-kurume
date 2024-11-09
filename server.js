const express = require('express');
const fs = require('fs');
const path = require('path');
const os = require('os');
const sqlite3 = require('sqlite3').verbose();
const bodyParser = require('body-parser');
const multer = require('multer');
const { format } = require('date-fns');
const QRCode = require('qrcode');

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

app.use(express.static('public'));
app.use(bodyParser.json());

// multerの設定（アップロード先ディレクトリを指定）
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      const currentDate = format(new Date(), 'yyyyMMdd');
      const targetDirectory_tenken = path.join(baseDirectory_tenken, 'daily', currentDate);
  
      // ディレクトリが存在しない場合、再帰的に作成
      if (!fs.existsSync(targetDirectory_tenken)) {
          fs.mkdirSync(targetDirectory_tenken, { recursive: true });
      }
      cb(null, targetDirectory_tenken);
    },
    filename: (req, file, cb) => {
      cb(null, file.originalname);  // ファイル名は変更せずそのまま保存
    }
  });

const hostname = os.hostname();
const username = os.userInfo().username;
const baseDirectory_tenken = `\\\\${hostname}\\Users\\${username}\\Desktop\\data\\tenken`;

const userHomeDir = os.homedir();

// ダウンロード用エンドポイントを追加
app.get('/download', (req, res) => {
    const filePath = req.query.filePath;

    // ファイルが存在するか確認
    if (!fs.existsSync(filePath)) {
        console.error('ダウンロード対象のファイルが見つかりません:', filePath);
        return res.status(404).send('ファイルが見つかりません');
    }

    // ファイルのダウンロード
    res.download(filePath, path.basename(filePath), (err) => {
        if (err) {
            console.error('ファイルダウンロードエラー:', err);
        } else {
            console.log(`ファイルがダウンロードされました: ${filePath}`);
        }
    });
});

const upload = multer({ storage: storage, limits: { fileSize: 50 * 1024 * 1024 } });  // ファイルサイズ制限を50MBに設定

// アップロード用エンドポイントを追加
app.post('/upload', upload.single('file'), (req, res) => {
    res.send('ファイルのアップロードが完了しました');
});


// 画像保存ディレクトリを指定（ユーザーのPicturesフォルダ内）
const saveDirectory = path.join(userHomeDir, 'Pictures', 'demo');

// ディレクトリが存在しない場合は作成
if (!fs.existsSync(saveDirectory)) {
    fs.mkdirSync(saveDirectory, { recursive: true });
}


// 画像保存用のPOSTエンドポイント
app.post('/upload-image', upload.single('image'), (req, res) => {
  console.log('画像を以下のディレクトリに保存しました', req.file.path);
  res.status(200).send('正常に保存されました');
});

// サーバー起動
app.listen(port, '0.0.0.0', () => {
    console.log(`Server running at http://${localIP}:${port}/`);
  });
