const { appendEvent } = require('../storage/event-store');
const { upsertUser, countUsers } = require('../storage/user-store');
const { appendConversationEntry } = require('../storage/conversation-store');
const { printIncomingEvent } = require('./console-view');

function toIsoTimestamp(input) {
  if (typeof input === 'string') {
    const parsed = Date.parse(input);
    if (!Number.isNaN(parsed)) {
      return new Date(parsed).toISOString();
    }
  }

  return new Date().toISOString();
}

function normalizeMessageEvent(rawEvent) {
  if (!rawEvent || typeof rawEvent !== 'object' || Array.isArray(rawEvent)) {
    throw new Error('Evento invalido: se esperaba un objeto JSON.');
  }

  const source = String(rawEvent.source || '').trim().toLowerCase();
  if (!source) {
    throw new Error('Evento invalido: falta source.');
  }

  if (rawEvent.user_id === null || rawEvent.user_id === undefined || String(rawEvent.user_id).trim() === '') {
    throw new Error('Evento invalido: falta user_id.');
  }

  return {
    source,
    received_at: toIsoTimestamp(rawEvent.received_at),
    update_id: rawEvent.update_id ?? null,
    message_id: rawEvent.message_id ?? null,
    chat_id: rawEvent.chat_id ?? null,
    user_id: rawEvent.user_id,
    type: typeof rawEvent.type === 'string' && rawEvent.type ? rawEvent.type : 'other',
    content: rawEvent.content && typeof rawEvent.content === 'object' ? rawEvent.content : {},
    message_date_unix: rawEvent.message_date_unix ?? null,
  };
}

function createMessageGateway() {
  function ingestEvent(rawEvent) {
    const event = normalizeMessageEvent(rawEvent);
    appendEvent(event);

    const userRecord = upsertUser(event.source, event.user_id, event.received_at);
    
    // Guardar en conversation.jsonl si el usuario fue creado/actualizado
    if (userRecord) {
      try {
        const conversationEntry = {
          timestamp: event.received_at,
          actor: 'user',
          model_name: null,
          message: event.content.text || '',
          chat_id: event.chat_id,
          message_id: event.message_id,
          meta: {
            source: event.source,
            type: event.type,
            update_id: event.update_id,
            message_date_unix: event.message_date_unix,
          },
        };
        appendConversationEntry(userRecord.instance_id, conversationEntry);
      } catch (error) {
        console.warn(`[miniSmart-01][message-gateway] Error guardando en conversation.jsonl: ${error.message}`);
      }
    }

    printIncomingEvent(event, userRecord);

    return {
      ok: true,
      status: 'accepted',
      source: event.source,
      instance_id: userRecord ? userRecord.instance_id : null,
      total_messages: userRecord ? userRecord.total_messages : 0,
    };
  }

  function getUsersCount() {
    return countUsers();
  }

  return {
    ingestEvent,
    getUsersCount,
  };
}

module.exports = {
  createMessageGateway,
};
