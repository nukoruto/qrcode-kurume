const express = require('express');
const fs = require('fs');
const path = require('path');
const multer = require('multer');
const os = require('os');
const sqlite3 = require('sqlite3').verbose();
const bodyParser = require('body-parser');

const app = express();
const port = 3002;

app.use(express.static('public'));
app.use(bodyParser.json());

// 実行中のユーザーのホームディレクトリを取得
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

// POSTリクエストを処理してtenken用データベースに保存
app.post('/submit-inspection', (req, res) => {
    const { item, result, filename } = req.body;

    if (!item || !result || !filename) {
        return res.status(400).json({ message: 'Item, result, and filename are required' });
    }

    // ディレクトリのパスを定義（デスクトップに保存）
    const tenkenDbDirectory = path.join(userHomeDir, 'Desktop', 'data', 'tenken');

    // ディレクトリが存在しない場合は再帰的に作成
    if (!fs.existsSync(tenkenDbDirectory)) {
        fs.mkdirSync(tenkenDbDirectory, { recursive: true });
        console.log(`tenkenディレクトリを作成しました: ${tenkenDbDirectory}`);
    }

    // ファイル名として静的テキストボックスに入力された値を使用
    const tenkenDbPath = path.join(tenkenDbDirectory, `${filename}.sqlite3`);

    // データベースに接続
    let tenkenDb = new sqlite3.Database(tenkenDbPath, (err) => {
        if (err) {
            console.error('tenkenデータベースに接続できませんでした', err);
            return res.status(500).json({ message: 'データベースに接続できませんでした' });
        }
        console.log(`${filename}.sqlite3データベースに接続しました`);

        // テーブル作成処理
        tenkenDb.run(`CREATE TABLE IF NOT EXISTS inspections (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            item TEXT,
            result TEXT
        )`, function(err) {
            if (err) {
                return res.status(500).json({ message: 'テーブルの作成に失敗しました' });
            }

            // データベースに挿入
            const sql = 'INSERT INTO inspections (item, result) VALUES (?, ?)';
            tenkenDb.run(sql, [item, result], function(err) {
                if (err) {
                    return res.status(500).json({ message: 'データの保存に失敗しました' });
                }
                res.json({ message: `${filename}.sqlite3にデータが正常に保存されました` });
            });

            // データベース接続をクローズ
            tenkenDb.close((err) => {
                if (err) {
                    console.error('データベースのクローズ中にエラーが発生しました:', err);
                } else {
                    console.log('データベース接続をクローズしました');
                }
            });
        });
    });
});

// サーバー起動
app.listen(port, '0.0.0.0', () => {
  console.log(`Server running at http://localhost:${port}/`);
});
