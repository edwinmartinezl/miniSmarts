const http = require('node:http');
const fs = require('node:fs');

function sendText(res, statusCode, contentType, bodyText) {
  const body = typeof bodyText === 'string' ? bodyText : String(bodyText);
  res.writeHead(statusCode, {
    'Content-Type': contentType,
    'Content-Length': Buffer.byteLength(body),
  });
  res.end(body);
}

function sendJson(res, statusCode, payload) {
  const body = `${JSON.stringify(payload)}\n`;
  res.writeHead(statusCode, {
    'Content-Type': 'application/json; charset=utf-8',
    'Content-Length': Buffer.byteLength(body),
  });
  res.end(body);
}

function readJsonBody(req) {
  return new Promise((resolve, reject) => {
    let raw = '';

    req.on('data', (chunk) => {
      raw += chunk;
      if (raw.length > 1024 * 1024) {
        reject(new Error('Body demasiado grande (maximo 1MB).'));
        req.destroy();
      }
    });

    req.on('end', () => {
      if (!raw.trim()) {
        resolve({});
        return;
      }

      try {
        resolve(JSON.parse(raw));
      } catch (error) {
        reject(new Error('JSON invalido en request body.'));
      }
    });

    req.on('error', (error) => {
      reject(error);
    });
  });
}

function createInternalApiServer({
  host,
  port,
  apiPrefix,
  docsFilePath,
  onMessage,
  onReply,
  onHealth,
  onCapabilities,
  onContract,
  onSend,
}) {
  if (typeof onMessage !== 'function' || typeof onReply !== 'function' || typeof onHealth !== 'function') {
    throw new Error('createInternalApiServer requiere handlers onMessage, onReply y onHealth.');
  }

  if (!apiPrefix) {
    throw new Error('createInternalApiServer requiere apiPrefix.');
  }

  const healthPath = `${apiPrefix}/health`;
  const docsPath = `${apiPrefix}/docs`;
  const capabilitiesPath = `${apiPrefix}/capabilities`;
  const contractPath = `${apiPrefix}/contract`;
  const messagePath = `${apiPrefix}/message`;
  const replyPath = `${apiPrefix}/reply`;
  const sendPath = `${apiPrefix}/send`;

  const server = http.createServer(async (req, res) => {
    try {
      const url = new URL(req.url || '/', `http://${host}:${port}`);

      if (req.method === 'GET' && url.pathname === healthPath) {
        const response = await onHealth();
        sendJson(res, 200, response);
        return;
      }

      if (req.method === 'GET' && url.pathname === capabilitiesPath) {
        if (typeof onCapabilities !== 'function') {
          sendJson(res, 404, {
            ok: false,
            error: 'Endpoint no disponible.',
          });
          return;
        }

        const response = await onCapabilities();
        sendJson(res, 200, response);
        return;
      }

      if (req.method === 'GET' && url.pathname === contractPath) {
        if (typeof onContract !== 'function') {
          sendJson(res, 404, {
            ok: false,
            error: 'Endpoint no disponible.',
          });
          return;
        }

        const response = await onContract();
        sendJson(res, 200, response);
        return;
      }

      if (req.method === 'GET' && (url.pathname === docsPath || url.pathname === `${docsPath}/`)) {
        if (!docsFilePath || !fs.existsSync(docsFilePath)) {
          sendJson(res, 404, {
            ok: false,
            error: 'Documentacion no disponible.',
          });
          return;
        }

        const html = fs.readFileSync(docsFilePath, 'utf8');
        sendText(res, 200, 'text/html; charset=utf-8', html);
        return;
      }

      if (req.method === 'POST' && url.pathname === messagePath) {
        const body = await readJsonBody(req);
        const source = String(body.source || '').trim().toLowerCase();
        const userId = body.user_id;

        if (!source || userId === null || userId === undefined || String(userId).trim() === '') {
          sendJson(res, 400, {
            ok: false,
            error: 'Body invalido. Requiere source y user_id en evento normalizado.',
          });
          return;
        }

        const response = await onMessage(body);
        console.log(`[miniSmart-01][api] ${messagePath} response: ${JSON.stringify(response)}`);
        sendJson(res, 200, response);
        return;
      }

      if (req.method === 'POST' && url.pathname === replyPath) {
        const body = await readJsonBody(req);
        const source = String(body.source || '').trim().toLowerCase();
        const chatId = body.chat_id;
        const message = typeof body.message === 'string' ? body.message.trim() : '';

        if (!source || chatId === null || chatId === undefined || !message) {
          sendJson(res, 400, {
            ok: false,
            error: 'Body invalido. Requiere source, chat_id y message.',
          });
          return;
        }

        const response = await onReply({ source, chat_id: chatId, message });
        sendJson(res, 200, response);
        return;
      }

      if (req.method === 'POST' && url.pathname === sendPath) {
        const body = await readJsonBody(req);
        const source = String(body.source || '').trim().toLowerCase();
        const chatId = body.chat_id;
        const message = typeof body.message === 'string' ? body.message.trim() : '';

        if (!source || chatId === null || chatId === undefined || !message) {
          sendJson(res, 400, {
            ok: false,
            error: 'Body invalido. Requiere source, chat_id y message.',
          });
          return;
        }

        const sendHandler = typeof onSend === 'function' ? onSend : onReply;
        const response = await sendHandler({ source, chat_id: chatId, message });
        sendJson(res, 200, response);
        return;
      }

      sendJson(res, 404, {
        ok: false,
        error: 'Endpoint no encontrado.',
      });
    } catch (error) {
      sendJson(res, 500, {
        ok: false,
        error: error.message,
      });
    }
  });

  function start() {
    return new Promise((resolve, reject) => {
      server.once('error', reject);
      server.listen(port, host, () => {
        server.removeListener('error', reject);
        resolve();
      });
    });
  }

  function stop() {
    return new Promise((resolve, reject) => {
      server.close((error) => {
        if (error) {
          reject(error);
          return;
        }
        resolve();
      });
    });
  }

  return {
    start,
    stop,
  };
}

module.exports = {
  createInternalApiServer,
};
