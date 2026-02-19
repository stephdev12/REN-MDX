const { t } = require('../../lib/language');

module.exports = {
  name: 'ping',
  // ... (header identique)
  execute: async (client, message, args, msgOptions) => {
    const start = Date.now();
    await client.sendMessage(message.key.remoteJid, { react: { text: "♟", key: message.key } });
    const end = Date.now();
    const latency = end - start;

    await client.sendMessage(message.key.remoteJid, { 
        text: t('misc.latency', { ms: latency })
    }, { quoted: message, ...msgOptions });
  }
};