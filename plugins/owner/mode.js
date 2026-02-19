// 👑 Plugin: MODE
const { updateSetting } = require('../../lib/database');
const { t } = require('../../lib/language');

module.exports = {
  name: 'mode',
  aliases: [],
  category: 'owner',
  description: 'Change le mode du bot (public/private)',
  usage: '.mode <public/private>',
  
  ownerOnly: true,

  execute: async (client, message, args) => {
    const newMode = args[0]?.toLowerCase();

    if (!['public', 'private'].includes(newMode)) {
      return client.sendMessage(message.key.remoteJid, { 
        text: t('owner.usage', { usage: '.mode <public/private>' })
      }, { quoted: message });
    }

    updateSetting('mode', newMode);

    await client.sendMessage(message.key.remoteJid, { text: t('owner.mode_changed', { mode: newMode }) }, { quoted: message });
  }
};