const fs = require('node:fs');

function loadEnvFile(filePath) {
  const values = {};

  if (!fs.existsSync(filePath)) {
    return values;
  }

  let content = '';
  try {
    content = fs.readFileSync(filePath, 'utf8');
  } catch (error) {
    return values;
  }

  const lines = content.split(/\r?\n/);

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line || line.startsWith('#')) {
      continue;
    }

    const separator = line.indexOf('=');
    if (separator === -1) {
      continue;
    }

    const key = line.slice(0, separator).trim();
    let value = line.slice(separator + 1).trim();

    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    if (key) {
      values[key] = value;
    }
  }

  return values;
}

function maskToken(token) {
  if (!token || token.length < 10) {
    return '***';
  }

  return `${token.slice(0, 6)}...${token.slice(-4)}`;
}

module.exports = {
  loadEnvFile,
  maskToken,
};
