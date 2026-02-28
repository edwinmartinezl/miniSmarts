const fs = require('node:fs');
const path = require('node:path');

const PROJECT_ROOT = path.join(__dirname, '..');
const ENV_PATH = path.join(PROJECT_ROOT, '.env');
const DATA_DIR = path.join(PROJECT_ROOT, 'data');
const INBOX_DIR = path.join(DATA_DIR, 'inbox');
const EVENTS_FILE = path.join(DATA_DIR, 'events.jsonl');
const OFFSET_FILE = path.join(DATA_DIR, 'telegram_offset.txt');
const USERS_FILE = path.join(DATA_DIR, 'users.json');

function ensureStoragePaths() {
  fs.mkdirSync(DATA_DIR, { recursive: true });
  fs.mkdirSync(INBOX_DIR, { recursive: true });
  fs.closeSync(fs.openSync(EVENTS_FILE, 'a'));
  fs.closeSync(fs.openSync(OFFSET_FILE, 'a'));

  if (!fs.existsSync(USERS_FILE)) {
    fs.writeFileSync(USERS_FILE, '{}\n', 'utf8');
  }
}

function readJson(filePath, fallbackValue) {
  if (!fs.existsSync(filePath)) {
    return fallbackValue;
  }

  const raw = fs.readFileSync(filePath, 'utf8').trim();
  if (!raw) {
    return fallbackValue;
  }

  try {
    return JSON.parse(raw);
  } catch (error) {
    return fallbackValue;
  }
}

function writeJson(filePath, value) {
  const serialized = `${JSON.stringify(value, null, 2)}\n`;
  fs.writeFileSync(filePath, serialized, 'utf8');
}

module.exports = {
  PROJECT_ROOT,
  ENV_PATH,
  DATA_DIR,
  INBOX_DIR,
  EVENTS_FILE,
  OFFSET_FILE,
  USERS_FILE,
  ensureStoragePaths,
  readJson,
  writeJson,
};
