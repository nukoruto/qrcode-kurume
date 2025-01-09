const express = require('express');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const os = require('os');

const app = express();
const upload = multer({ dest: 'uploads/' });

const baseDir = path.join(__dirname, 'data', 'daily');

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

app.get('/files', (req, res) => {
  const dir = req.query.dir;
  const filePath = path.join(baseDir, dir);
  if (fs.existsSync(filePath)) {
    const files = fs.readdirSync(filePath);
    res.json(files);
  } else {
    res.status(404).send('Directory not found');
  }
});

app.post('/upload', upload.single('file'), (req, res) => {
  const today = new Date().toISOString().split('T')[0];
  const uploadDir = path.join(baseDir, today);
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }
  const destPath = path.join(uploadDir, req.file.originalname);
  fs.renameSync(req.file.path, destPath);
  res.send('File uploaded');
});

app.listen(3002, serverIP, () => {
  console.log(`Server is running on http://${serverIP}:3002`);
});
