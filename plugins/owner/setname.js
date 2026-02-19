// ⚙️ Plugin: SETNAME
const { updateSetting } = require('../../lib/database');
const { t } = require('../../lib/language');

module.exports = {
  name: 'setname',
  aliases: ['setbotname'],
  category: 'owner',
  description: 'Change le nom du bot',
  usage: '.setname <nom>',
  
  ownerOnly: true,

  execute: async (client, message, args) => {
    const newName = args.join(' ');
    if (!newName) return client.sendMessage(message.key.remoteJid, { text: t('owner.error_arg') }, { quoted: message });

    updateSetting('botName', newName);
    await client.sendMessage(message.key.remoteJid, { text: t('owner.name_changed', { name: newName }) }, { quoted: message });
  }
};