// 必要なモジュールの読み込み
const express = require('express');
const fs = require('fs');
const path = require('path');
const multer = require('multer');
const os = require('os');
const sqlite3 = require('sqlite3').verbose();
const bodyParser = require('body-parser');

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
  console.log('画像を以下のディレクトリに保存しました', req.file.path);
  res.status(200).send('正常に保存されました');
});

// SQLite3のデータベースファイルへのパスを設定
const dbDirectory = path.join(userHomeDir, 'Desktop', 'data');
const dbPath = path.join(dbDirectory, 'database.sqlite3');

// データベースディレクトリが存在しない場合は作成
if (!fs.existsSync(dbDirectory)) {
  fs.mkdirSync(dbDirectory, { recursive: true });
  console.log(`ディレクトリを新規作成しました: ${dbDirectory}`);
}

// データベースファイルが存在しない場合は作成
if (!fs.existsSync(dbPath)) {
  console.log(`sqlite3ファイルが存在しません。以下のディレクトリに新規作成しました。: ${dbPath}`);
}

// データベースに接続
let db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('データベースに接続できませんでした', err);
    } else {
        console.log('sqlite3データベースに接続しました');
    }
});

// テーブルの作成（nameとfamilynameのカラムを持つ）
db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    familyname TEXT
)`);

// body-parserを設定してPOSTデータを処理
app.use(bodyParser.json());

// POSTリクエストを処理してデータベースに保存
app.post('/submit-data', (req, res) => {
    const { name, familyname } = req.body;

    if (!name || !familyname) {
        return res.status(400).json({ message: 'Name and family name are required' });
    }

    // データベースに挿入
    const sql = 'INSERT INTO users (name, familyname) VALUES (?, ?)';
    db.run(sql, [name, familyname], function(err) {
        if (err) {
            return res.status(500).json({ message: 'データの保存に失敗しました' });
        }
        res.json({ message: '正常に保存されました' });
    });
});

// サーバー起動
app.listen(port, '0.0.0.0', () => {
  console.log(`Server running at http://localhost:${port}/`);
});
