const path = require('node:path');
const { version: packageVersion } = require('./package.json');
const { loadEnvFile, maskToken } = require('./core/env');
const { createInternalApiServer } = require('./core/internal-api-server');
const { createMessageGateway } = require('./core/message-gateway');
const { createTelegramAdapter } = require('./adapters/telegram/adapter');
const { createReplyHandler } = require('./core/reply-handler');
const { ensureStoragePaths } = require('./storage/files');
const { loadOffset, saveOffset } = require('./storage/offset-store');
const { findUserBySourceAndChatId } = require('./storage/user-store');

const MINI_ID = '01';
const MINI_NAME = 'miniSmart-01';
const MINI_TYPE = 'gateway';
const API_PREFIX = `/api/${MINI_ID}`;
const API_HOST = '127.0.0.1';
const API_PORT = 7000;
const MINI_ENV_PATH = '/etc/minismarts/01.env';

async function start() {
  ensureStoragePaths();

  const envValues = loadEnvFile(MINI_ENV_PATH);
  if (envValues.BOT_TOKEN) {
    process.env.BOT_TOKEN = envValues.BOT_TOKEN;
    console.log(`[miniSmart-01] Token leido desde ${MINI_ENV_PATH}: ${maskToken(process.env.BOT_TOKEN)}`);
  }

  const botToken = process.env.BOT_TOKEN;
  if (!botToken) {
    console.error(`[miniSmart-01] Falta BOT_TOKEN en ${MINI_ENV_PATH}. Ejecuta: minismarts token set 01`);
    process.exit(1);
  }

  const internalApiBaseUrl = `http://${API_HOST}:${API_PORT}`;
  const docsFilePath = path.join(__dirname, 'public', 'index.html');

  const messageGateway = createMessageGateway();
  const replyHandler = createReplyHandler();

  const telegramAdapter = createTelegramAdapter({
    botToken,
    internalApiBaseUrl,
    apiPrefix: API_PREFIX,
    loadOffset,
    saveOffset,
  });

  const adapters = {
    telegram: {
      sendMessage: telegramAdapter.sendMessage,
      getStatus: telegramAdapter.getStatus,
    },
  };

  async function sendBySource({ source, chat_id: chatId, message }) {
    const adapter = adapters[source];
    if (!adapter) {
      throw new Error(`No existe adapter para source: ${source}`);
    }

    await adapter.sendMessage(chatId, message);

    // Guardar respuesta del modelo en conversation.jsonl
    try {
      const userRecord = findUserBySourceAndChatId(source, chatId);
      if (userRecord && userRecord.instance_id) {
        await replyHandler.saveModelReply(userRecord.instance_id, message, {
          source,
          chat_id: chatId,
        });
      }
    } catch (error) {
      console.warn(`[miniSmart-01] Error guardando respuesta del modelo en conversation.jsonl: ${error.message}`);
    }

    return {
      ok: true,
      status: 'sent',
      source,
      chat_id: chatId,
    };
  }

  const apiServer = createInternalApiServer({
    host: API_HOST,
    port: API_PORT,
    apiPrefix: API_PREFIX,
    docsFilePath,
    onMessage: async (event) => messageGateway.ingestEvent(event),
    onReply: async (payload) => sendBySource(payload),
    onSend: async (payload) => sendBySource(payload),
    onCapabilities: async () => ({
      ok: true,
      mini_id: MINI_ID,
      mini_name: MINI_NAME,
      supports: {
        inbound_sources: ['telegram'],
        outbound_sources: ['telegram'],
        token_management_cli: true,
        systemd_service: true,
      },
    }),
    onContract: async () => ({
      ok: true,
      mini_id: MINI_ID,
      api_prefix: API_PREFIX,
      endpoints: [
        `${API_PREFIX}/capabilities`,
        `${API_PREFIX}/contract`,
        `${API_PREFIX}/send`,
        `${API_PREFIX}/health`,
        `${API_PREFIX}/docs`,
      ],
    }),
    onHealth: async () => {
      const telegramStatus = telegramAdapter.getStatus();

      return {
        ok: true,
        mini_id: MINI_ID,
        mini_name: MINI_NAME,
        mini_type: MINI_TYPE,
        version: packageVersion,
        bot_conectado: telegramStatus.bot_connected,
        usuarios_registrados: messageGateway.getUsersCount(),
        polling_activo: telegramStatus.polling_active,
      };
    },
  });

  await apiServer.start();
  console.log(`[miniSmart-01] API interna activa en ${internalApiBaseUrl}${API_PREFIX}`);

  telegramAdapter.startPolling();
  console.log(`[miniSmart-01] Adapter Telegram activo y desacoplado via ${API_PREFIX}/message`);
}

start().catch((error) => {
  console.error(`[miniSmart-01] Error fatal al iniciar el gateway: ${error.message}`);
  process.exit(1);
});
