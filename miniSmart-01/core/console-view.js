function trimText(input, maxLength = 220) {
  const value = String(input || '');
  if (value.length <= maxLength) {
    return value;
  }
  return `${value.slice(0, maxLength)}...`;
}

function printIncomingEvent(event, userRecord) {
  const source = event && event.source ? String(event.source) : 'unknown';
  const instanceId = userRecord ? userRecord.instance_id : `${source}:desconocido`;
  const totalMessages = userRecord ? userRecord.total_messages : 0;

  console.log('[miniSmart-01]');
  console.log(`Usuario: ${instanceId}`);
  console.log(`Mensajes totales: ${totalMessages}`);
  console.log(`chat_id: ${event.chat_id}`);
  console.log(`Tipo: ${event.type}`);

  if (event.type === 'text') {
    console.log(`Contenido: "${trimText(event.content.text || '')}"`);
  } else {
    console.log(`Contenido: ${JSON.stringify(event.content)}`);
  }

  console.log('---');
}

module.exports = {
  printIncomingEvent,
};
