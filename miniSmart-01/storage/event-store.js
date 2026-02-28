const fs = require('node:fs');
const { EVENTS_FILE } = require('./files');

function appendEvent(event) {
  fs.appendFileSync(EVENTS_FILE, `${JSON.stringify(event)}\n`, 'utf8');
}

module.exports = {
  appendEvent,
};
