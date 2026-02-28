function detectMessageType(message) {
  if (typeof message.text === 'string') return 'text';
  if (Array.isArray(message.photo) && message.photo.length > 0) return 'image';
  if (message.document) return 'document';
  if (message.audio) return 'audio';
  if (message.voice) return 'voice_note';
  if (message.video) return 'video';
  if (message.sticker) return 'sticker';
  return 'other';
}

function extractBasicContent(message, type) {
  switch (type) {
    case 'text':
      return { text: message.text };
    case 'image': {
      const largestPhoto = message.photo[message.photo.length - 1];
      return {
        caption: message.caption || null,
        file_id: largestPhoto ? largestPhoto.file_id : null,
      };
    }
    case 'document':
      return {
        file_id: message.document.file_id,
        file_name: message.document.file_name || null,
        mime_type: message.document.mime_type || null,
      };
    case 'audio':
      return {
        file_id: message.audio.file_id,
        duration: message.audio.duration || null,
        title: message.audio.title || null,
        performer: message.audio.performer || null,
      };
    case 'voice_note':
      return {
        file_id: message.voice.file_id,
        duration: message.voice.duration || null,
        mime_type: message.voice.mime_type || null,
      };
    case 'video':
      return {
        file_id: message.video.file_id,
        duration: message.video.duration || null,
        mime_type: message.video.mime_type || null,
      };
    case 'sticker':
      return {
        file_id: message.sticker.file_id,
        emoji: message.sticker.emoji || null,
        set_name: message.sticker.set_name || null,
      };
    default:
      return {
        summary: 'Mensaje recibido en formato no cubierto por el MVP inicial.',
      };
  }
}

function normalizeTelegramUpdate(update) {
  if (!update || !update.message) {
    return null;
  }

  const message = update.message;
  const type = detectMessageType(message);
  const content = extractBasicContent(message, type);

  return {
    source: 'telegram',
    received_at: new Date().toISOString(),
    update_id: update.update_id,
    message_id: message.message_id || null,
    chat_id: message.chat ? message.chat.id : null,
    user_id: message.from ? message.from.id : null,
    type,
    content,
    message_date_unix: message.date || null,
  };
}

module.exports = {
  normalizeTelegramUpdate,
};
