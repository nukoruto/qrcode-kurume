const express = require('express');
const app = express();
const port = 3002;

// publicディレクトリを静的ファイルのルートディレクトリとして指定
app.use(express.static('public'));

// ルートパスへのアクセスをindex.htmlにマッピング
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/index.html');
});

// サーバー起動
app.listen(port, '127.0.0.1', () => {  // ホストを '127.0.0.1' に指定
  console.log(`Server running at http://127.0.0.1:${port}/`);
});
