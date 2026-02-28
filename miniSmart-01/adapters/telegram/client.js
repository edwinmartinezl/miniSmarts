function serializeParamValue(value) {
  if (Array.isArray(value) || (value && typeof value === 'object')) {
    return JSON.stringify(value);
  }
  return String(value);
}

function createTelegramClient(botToken) {
  const baseUrl = `https://api.telegram.org/bot${botToken}`;

  async function telegramGet(method, params = {}) {
    const url = new URL(`${baseUrl}/${method}`);

    for (const [key, value] of Object.entries(params)) {
      if (value === undefined || value === null) {
        continue;
      }
      url.searchParams.set(key, serializeParamValue(value));
    }

    const response = await fetch(url, { method: 'GET' });
    if (!response.ok) {
      throw new Error(`HTTP ${response.status} en ${method}`);
    }

    const body = await response.json();
    if (!body.ok) {
      throw new Error(`Telegram API error ${body.error_code}: ${body.description}`);
    }

    return body.result;
  }

  async function telegramPost(method, params = {}) {
    const url = `${baseUrl}/${method}`;
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status} en ${method}`);
    }

    const body = await response.json();
    if (!body.ok) {
      throw new Error(`Telegram API error ${body.error_code}: ${body.description}`);
    }

    return body.result;
  }

  async function getMe() {
    return telegramGet('getMe');
  }

  async function getUpdates({ timeout = 30, offset = 0, allowedUpdates = ['message'] } = {}) {
    return telegramGet('getUpdates', {
      timeout,
      offset,
      allowed_updates: allowedUpdates,
    });
  }

  async function sendText(chatId, text) {
    return telegramPost('sendMessage', {
      chat_id: chatId,
      text,
    });
  }

  return {
    getMe,
    getUpdates,
    sendText,
  };
}

module.exports = {
  createTelegramClient,
};
