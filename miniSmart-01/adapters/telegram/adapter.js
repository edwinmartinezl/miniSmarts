const { createTelegramClient } = require('./client');
const { normalizeTelegramUpdate } = require('./translator');

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function createTelegramAdapter({ botToken, internalApiBaseUrl, apiPrefix, loadOffset, saveOffset }) {
  if (!botToken) {
    throw new Error('createTelegramAdapter requiere botToken');
  }

  if (!apiPrefix) {
    throw new Error('createTelegramAdapter requiere apiPrefix');
  }

  const client = createTelegramClient(botToken);
  const status = {
    source: 'telegram',
    bot_connected: false,
    polling_active: false,
    last_error: null,
    bot_username: null,
    bot_id: null,
  };

  let running = false;

  async function forwardEventToInternalApi(event) {
    const endpoint = `${internalApiBaseUrl}${apiPrefix}/message`;
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(event),
    });

    const body = await response.json().catch(() => null);

    if (!response.ok) {
      const errorMessage = body && body.error ? body.error : `HTTP ${response.status} en ${apiPrefix}/message`;
      throw new Error(errorMessage);
    }

    return body;
  }

  async function runLoop() {
    let offset = loadOffset();
    let retryDelayMs = 1000;

    console.log(`[miniSmart-01][telegram] Offset inicial cargado: ${offset}`);

    while (running) {
      try {
        if (!status.bot_connected) {
          const me = await client.getMe();
          status.bot_connected = true;
          status.bot_username = me.username || null;
          status.bot_id = me.id || null;
          status.last_error = null;
          console.log(`[miniSmart-01][telegram] Bot conectado: @${status.bot_username} (id ${status.bot_id})`);
        }

        const updates = await client.getUpdates({
          timeout: 30,
          offset,
          allowedUpdates: ['message'],
        });

        for (const update of updates) {
          if (typeof update.update_id === 'number') {
            offset = update.update_id + 1;
            saveOffset(offset);
          }

          if (!update.message) {
            continue;
          }

          if (update.message.from && update.message.from.is_bot) {
            continue;
          }

          const event = normalizeTelegramUpdate(update);
          if (!event) {
            continue;
          }

          const apiResponse = await forwardEventToInternalApi(event);
          console.log(`[miniSmart-01][telegram] ${apiPrefix}/message OK: ${JSON.stringify(apiResponse)}`);
        }

        retryDelayMs = 1000;
      } catch (error) {
        status.bot_connected = false;
        status.last_error = error.message;
        console.error(`[miniSmart-01][telegram] Error en polling: ${error.message}`);
        await sleep(retryDelayMs);
        retryDelayMs = Math.min(retryDelayMs * 2, 15000);
      }
    }

    status.polling_active = false;
  }

  function startPolling() {
    if (running) {
      return;
    }

    running = true;
    status.polling_active = true;

    runLoop().catch((error) => {
      status.last_error = error.message;
      status.polling_active = false;
      running = false;
      console.error(`[miniSmart-01][telegram] Loop finalizado con error fatal: ${error.message}`);
    });
  }

  async function sendMessage(chatId, message) {
    return client.sendText(chatId, message);
  }

  function getStatus() {
    return {
      ...status,
      polling_active: Boolean(status.polling_active && running),
    };
  }

  return {
    startPolling,
    sendMessage,
    getStatus,
  };
}

module.exports = {
  createTelegramAdapter,
};
