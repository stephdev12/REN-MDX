// ⚙️ Plugin: SETPREFIX
const { updateSetting } = require('../../lib/database');
const { t } = require('../../lib/language');

module.exports = {
  name: 'setprefix',
  aliases: ['prefix'],
  category: 'owner',
  description: 'Change le préfixe du bot',
  usage: '.setprefix <symbole>',
  
  ownerOnly: true,

  execute: async (client, message, args) => {
    const newPrefix = args[0];
    if (!newPrefix) return client.sendMessage(message.key.remoteJid, { text: t('owner.error_arg') }, { quoted: message });

    updateSetting('prefix', newPrefix);
    await client.sendMessage(message.key.remoteJid, { text: t('owner.prefix_changed', { prefix: newPrefix }) }, { quoted: message });
  }
};