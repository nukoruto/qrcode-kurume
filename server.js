//importみたいなしりーず
const express = require('express');
const os = require('os');
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

// ルートパスへのアクセスをindex.htmlにマッピング
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/index.html');
});

// サーバー起動
app.listen(port, localIP, () => {
  console.log(`Server running at http://${localIP}:${port}/`);
});
