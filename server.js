const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');
const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

// Ensure ffmpeg binary is executable on every startup
try {
  const ffmpegBin = path.join(__dirname, 'node_modules', 'ffmpeg-static', 'ffmpeg');
  if (fs.existsSync(ffmpegBin)) {
    execSync(`chmod +x "${ffmpegBin}"`);
    console.log('> ffmpeg binary permissions set');
  }
} catch (e) {
  console.warn('> Could not set ffmpeg permissions:', e.message);
}

const dev = process.env.NODE_ENV !== 'production';
const port = parseInt(process.env.PORT || '3000', 10);

const app = next({ dev });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  createServer((req, res) => {
    const parsedUrl = parse(req.url, true);
    handle(req, res, parsedUrl);
  }).listen(port, () => {
    console.log(`> Ready on port ${port}`);
  });
});
