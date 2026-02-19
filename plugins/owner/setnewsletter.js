// ⚙️ Plugin: SETNEWSLETTER
const { updateSetting } = require('../../lib/database');
const { t } = require('../../lib/language');

module.exports = {
  name: 'setnewsletter',
  aliases: ['setnews'],
  category: 'owner',
  description: 'Change l\'ID de la newsletter',
  usage: '.setnewsletter <jid>',
  
  ownerOnly: true,

  execute: async (client, message, args) => {
    const newJid = args[0];
    if (!newJid) return client.sendMessage(message.key.remoteJid, { text: t('owner.error_arg') }, { quoted: message });

    updateSetting('newsletterJid', newJid);
    await client.sendMessage(message.key.remoteJid, { text: t('owner.news_changed', { jid: newJid }) }, { quoted: message });
  }
};