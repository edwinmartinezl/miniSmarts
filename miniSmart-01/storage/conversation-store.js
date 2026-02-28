const fs = require('node:fs');
const path = require('node:path');
const { PROJECT_ROOT } = require('./files');

const USERS_CONVERSATIONS_DIR = path.join(PROJECT_ROOT, 'users');

function ensureUserConversationPath(instanceId) {
  if (!instanceId || typeof instanceId !== 'string') {
    throw new Error('instanceId es requerido y debe ser string.');
  }

  const userDir = path.join(USERS_CONVERSATIONS_DIR, instanceId);
  fs.mkdirSync(userDir, { recursive: true });

  return userDir;
}

function getConversationFilePath(instanceId) {
  const userDir = ensureUserConversationPath(instanceId);
  const conversationFile = path.join(userDir, 'conversation.jsonl');
  
  // Crear archivo si no existe
  if (!fs.existsSync(conversationFile)) {
    fs.closeSync(fs.openSync(conversationFile, 'a'));
  }

  return conversationFile;
}

function appendConversationEntry(instanceId, entry) {
  if (!instanceId || !entry || typeof entry !== 'object') {
    throw new Error('instanceId y entry son requeridos.');
  }

  // Validar estructura mínima
  if (!entry.timestamp || !entry.actor) {
    throw new Error('entry requiere timestamp y actor.');
  }

  const filePath = getConversationFilePath(instanceId);
  
  // Crear entrada normalizada
  const normalizedEntry = {
    timestamp: String(entry.timestamp),
    actor: String(entry.actor).toLowerCase(), // "user" o "model"
    model_name: entry.model_name || null,
    message: entry.message || '',
    chat_id: entry.chat_id !== undefined ? entry.chat_id : null,
    message_id: entry.message_id !== undefined ? entry.message_id : null,
    meta: (entry.meta && typeof entry.meta === 'object') ? entry.meta : {},
  };

  // Validar que actor sea "user" o "model"
  if (!['user', 'model'].includes(normalizedEntry.actor)) {
    throw new Error('actor debe ser "user" o "model".');
  }

  fs.appendFileSync(filePath, `${JSON.stringify(normalizedEntry)}\n`, 'utf8');

  return normalizedEntry;
}

function readConversationHistory(instanceId) {
  if (!instanceId || typeof instanceId !== 'string') {
    return [];
  }

  const filePath = path.join(USERS_CONVERSATIONS_DIR, instanceId, 'conversation.jsonl');
  
  if (!fs.existsSync(filePath)) {
    return [];
  }

  const raw = fs.readFileSync(filePath, 'utf8').trim();
  if (!raw) {
    return [];
  }

  const entries = [];
  const lines = raw.split('\n');
  
  for (const line of lines) {
    if (!line.trim()) continue;
    try {
      const entry = JSON.parse(line);
      entries.push(entry);
    } catch (error) {
      console.warn(`[conversation-store] Linea invalida en ${filePath}: ${line.substring(0, 50)}`);
    }
  }

  return entries;
}

function getConversationStats(instanceId) {
  const entries = readConversationHistory(instanceId);
  
  const stats = {
    total_entries: entries.length,
    user_messages: entries.filter(e => e.actor === 'user').length,
    model_messages: entries.filter(e => e.actor === 'model').length,
    first_message_at: entries.length > 0 ? entries[0].timestamp : null,
    last_message_at: entries.length > 0 ? entries[entries.length - 1].timestamp : null,
  };

  return stats;
}

module.exports = {
  ensureUserConversationPath,
  getConversationFilePath,
  appendConversationEntry,
  readConversationHistory,
  getConversationStats,
  USERS_CONVERSATIONS_DIR,
};
