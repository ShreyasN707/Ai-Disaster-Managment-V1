const fs = require('fs');
const path = require('path');
const multer = require('multer');
const mime = require('mime-types');
const config = require('../config');

function ensureDir(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(process.cwd(), config.uploadsDir);
    ensureDir(dir);
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const ext = mime.extension(file.mimetype) || 'bin';
    const name = `${Date.now()}-${Math.round(Math.random() * 1e9)}.${ext}`;
    cb(null, name);
  },
});

const fileFilter = (req, file, cb) => {
  // Allow common media types; fallback allow
  const allowed = ['image/', 'video/', 'application/pdf', 'text/plain'];
  if (allowed.some((a) => file.mimetype.startsWith(a))) return cb(null, true);
  return cb(null, true);
};

const upload = multer({ storage, fileFilter, limits: { fileSize: 20 * 1024 * 1024 } });

module.exports = upload;
