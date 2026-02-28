const { appendConversationEntry } = require('../storage/conversation-store');

function createReplyHandler() {
  async function saveModelReply(instanceId, message, metadata = {}) {
    if (!instanceId || typeof instanceId !== 'string') {
      throw new Error('instanceId es requerido.');
    }

    if (!message || typeof message !== 'string') {
      throw new Error('message es requerido y debe ser string.');
    }

    const conversationEntry = {
      timestamp: new Date().toISOString(),
      actor: 'model',
      model_name: 'miniSmart-01',
      message: message.trim(),
      chat_id: metadata.chat_id || null,
      message_id: metadata.message_id || null,
      meta: {
        source: metadata.source || 'unknown',
        replying_to_update_id: metadata.replying_to_update_id || null,
        ...metadata,
      },
    };

    appendConversationEntry(instanceId, conversationEntry);
    return conversationEntry;
  }

  return {
    saveModelReply,
  };
}

module.exports = {
  createReplyHandler,
};
