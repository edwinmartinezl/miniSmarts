const { USERS_FILE, readJson, writeJson } = require('./files');

function loadUsersIndex() {
  const parsed = readJson(USERS_FILE, {});
  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
    return {};
  }
  return parsed;
}

function saveUsersIndex(usersIndex) {
  writeJson(USERS_FILE, usersIndex);
}

function normalizeSource(source) {
  const value = String(source || '').trim().toLowerCase();
  if (!value) {
    return null;
  }
  return value;
}

function normalizeUserId(userId) {
  if (userId === null || userId === undefined) {
    return null;
  }

  const value = String(userId).trim();
  if (!value) {
    return null;
  }
  return value;
}

function upsertUser(source, userId, timestampIso) {
  const normalizedSource = normalizeSource(source);
  const normalizedUserId = normalizeUserId(userId);
  if (!normalizedSource || !normalizedUserId) {
    return null;
  }

  const usersIndex = loadUsersIndex();
  const instanceId = `${normalizedSource}:${normalizedUserId}`;
  const existing = usersIndex[instanceId];

  if (!existing) {
    usersIndex[instanceId] = {
      instance_id: instanceId,
      user_id: normalizedUserId,
      first_seen: timestampIso,
      last_seen: timestampIso,
      total_messages: 1,
    };
  } else {
    usersIndex[instanceId] = {
      ...existing,
      instance_id: instanceId,
      user_id: normalizedUserId,
      last_seen: timestampIso,
      total_messages: Number(existing.total_messages || 0) + 1,
    };
  }

  saveUsersIndex(usersIndex);
  return usersIndex[instanceId];
}

function countUsers() {
  const usersIndex = loadUsersIndex();
  return Object.keys(usersIndex).length;
}

function findUserBySourceAndChatId(source, chatId) {
  if (!source || chatId === null || chatId === undefined) {
    return null;
  }

  const usersIndex = loadUsersIndex();
  const normalizedSource = String(source).trim().toLowerCase();
  const normalizedChatId = String(chatId).trim();

  // Buscar el usuario cuyo instance_id comienza con source: y el user_id es el chatId
  for (const [_key, userRecord] of Object.entries(usersIndex)) {
    if (userRecord.instance_id && userRecord.instance_id.startsWith(`${normalizedSource}:`)) {
      const userIdFromRecord = String(userRecord.user_id).trim();
      if (userIdFromRecord === normalizedChatId) {
        return userRecord;
      }
    }
  }

  return null;
}

module.exports = {
  upsertUser,
  countUsers,
  loadUsersIndex,
  findUserBySourceAndChatId,
};
