const express = require('express');
const fs = require('fs');
const path = require('path');
const os = require('os');
const sqlite3 = require('sqlite3').verbose();
const bodyParser = require('body-parser');

const app = express();
const port = 3002;

app.use(express.static('public'));
app.use(bodyParser.json());

const userHomeDir = os.homedir();

// ---- 元の処理: users.sqlite3を使ったデータベースの処理 ----

// SQLite3のデータベースファイルへのパスを設定
const dbDirectory = path.join(userHomeDir, 'Desktop', 'data');
const dbPath = path.join(dbDirectory, 'users.sqlite3');

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
        console.log('users.sqlite3データベースに接続しました');
    }
});

// テーブルの作成（nameとfamilynameのカラムを持つ）
db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    familyname TEXT
)`);

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

// ---- 新しい処理: tenkenデータベースに保存 ----
// POSTリクエストを処理して、複数のテキストボックスデータを一括保存する
app.post('/submit-inspections', (req, res) => {
    const { filename, matters } = req.body;

    // 必要なデータが送信されているか確認
    if (!matters || !filename) {
        return res.status(400).json({ message: 'matters and filename are required' });
    }

    // データベースの保存先ディレクトリを指定
    const tenkenDbDirectory = path.join(userHomeDir, 'Desktop', 'data', 'tenken');
    const tenkenDbPath = path.join(tenkenDbDirectory, `${filename}.sqlite3`);

    // ディレクトリが存在しない場合は作成
    if (!fs.existsSync(tenkenDbDirectory)) {
        fs.mkdirSync(tenkenDbDirectory, { recursive: true });
        console.log(`tenkenディレクトリを作成しました: ${tenkenDbDirectory}`);
    }

    // データベースに接続
    let tenkenDb = new sqlite3.Database(tenkenDbPath, (err) => {
        if (err) {
            console.error('データベース接続に失敗しました:', err);
            return res.status(500).json({ message: 'データベース接続に失敗しました' });
        }
    });

    // データベースにテーブルが存在しない場合は作成
    tenkenDb.run(`CREATE TABLE IF NOT EXISTS koumoku (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        matter TEXT
    )`, function(err) {
        if (err) {
            console.error('テーブル作成に失敗しました:', err);
            return res.status(500).json({ message: 'テーブル作成に失敗しました' });
        }

        // テキストボックスのデータを順番に挿入
        const insertStmt = tenkenDb.prepare('INSERT INTO koumoku (matter) VALUES (?)');
        matters.forEach(({ matter }) => {
            insertStmt.run(matter, function(err) {
                if (err) {
                    console.error('データ挿入に失敗しました:', err);
                }
            });
        });

        // 挿入が完了したらステートメントを閉じる
        insertStmt.finalize();
        res.json({ message: 'データが正常に保存されました' });

        // データベース接続を閉じる
        tenkenDb.close((err) => {
            if (err) {
                console.error('データベースのクローズに失敗しました:', err);
            } else {
                console.log('データベース接続をクローズしました');
            }
        });
    });
});

// サーバー起動
app.listen(port, '0.0.0.0', () => {
    console.log(`Server running at http://localhost:${port}/`);
});
