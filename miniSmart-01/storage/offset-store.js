const fs = require('node:fs');
const { OFFSET_FILE } = require('./files');

function loadOffset() {
  if (!fs.existsSync(OFFSET_FILE)) {
    return 0;
  }

  const raw = fs.readFileSync(OFFSET_FILE, 'utf8').trim();
  if (!raw) {
    return 0;
  }

  const parsed = Number.parseInt(raw, 10);
  if (Number.isNaN(parsed) || parsed < 0) {
    return 0;
  }

  return parsed;
}

function saveOffset(offset) {
  fs.writeFileSync(OFFSET_FILE, String(offset), 'utf8');
}

module.exports = {
  loadOffset,
  saveOffset,
};
