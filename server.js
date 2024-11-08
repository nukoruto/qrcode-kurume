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

const hostname = os.hostname();
const username = os.userInfo().username;
const baseDirectory = `\\\\${hostname}\\Users\\${username}\\Desktop\\data\\tenken`;

const userHomeDir = os.homedir();

// ファイルのコピーとネットワークパスを返すエンドポイント
app.get('/copy-and-share', (req, res) => {
    const originalFileName = req.query.fileName;
    const originalFilePath = path.join(originalFileName);

    // ファイルが存在するか確認
    if (!fs.existsSync(originalFilePath)) {
        console.error('ファイルが見つかりません:', originalFilePath);
        return res.json({ success: false, message: '指定されたファイルが見つかりません' });
    }

    // コピー先のファイル名を生成
    const timestamp = format(new Date(), 'yyyyMMdd_HHmmss');
    const newFileName = `${path.basename(originalFileName, '.xlsx')}_${timestamp}.xlsx`;
    const newFilePath = path.join(newFileName);

    // ファイルコピー
    fs.copyFile(originalFilePath, newFilePath, (err) => {
        if (err) {
            console.error('ファイルコピーエラー:', err);
            return res.json({ success: false, message: 'ファイルのコピーに失敗しました' });
        }

        // コピー先のネットワークパスを返す
        const networkPath = `\\\\${hostname}\\Users\\${username}\\Desktop\\data\\tenken\\${newFileName}`;
        res.json({
            success: true,
            networkPath: networkPath,
            downloadUrl: `/download/${encodeURIComponent(newFileName)}`  // ダウンロードリンクを追加
        });
    });
});

// ダウンロード用エンドポイントを追加
app.get('/download/:fileName', (req, res) => {
    const fileName = req.params.fileName;
    const filePath = path.join(fileName);

    // ファイルが存在するか確認
    if (!fs.existsSync(filePath)) {
        console.error('ダウンロード対象のファイルが見つかりません:', filePath);
        return res.status(404).send('ファイルが見つかりません');
    }

    // ファイルのダウンロード
    res.download(filePath, fileName, (err) => {
        if (err) {
            console.error('ファイルダウンロードエラー:', err);
        } else {
            console.log(`ファイルがダウンロードされました: ${filePath}`);
        }
    });
});


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
  console.log('画像を以下のディレクトリに保存しました', req.file.path);
  res.status(200).send('正常に保存されました');
});

// サーバー起動
app.listen(port, '0.0.0.0', () => {
    console.log(`Server running at http://${localIP}:${port}/`);
  });
