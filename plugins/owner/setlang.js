// 🌐 Plugin: SETLANG
const { updateSetting } = require('../../lib/database');
const { t } = require('../../lib/language');
const fs = require('fs');
const path = require('path');

module.exports = {
  name: 'setlang',
  aliases: ['lang'],
  category: 'owner',
  description: 'Change la langue du bot',
  usage: '.setlang <fr/en>',
  
  ownerOnly: true,

  execute: async (client, message, args) => {
    const newLang = args[0]?.toLowerCase();
    
    // Lister les langues disponibles
    const localesDir = path.join(__dirname, '../../locales');
    const availableLangs = fs.readdirSync(localesDir)
        .filter(f => f.endsWith('.json'))
        .map(f => f.replace('.json', ''));

    if (!availableLangs.includes(newLang)) {
      return client.sendMessage(message.key.remoteJid, { 
        text: t('owner.usage', { usage: `.setlang <${availableLangs.join('/')}>` })
      }, { quoted: message });
    }

    updateSetting('lang', newLang);

    await client.sendMessage(message.key.remoteJid, { 
        text: t('owner.lang_changed', { lang: newLang.toUpperCase() })
    }, { quoted: message });
  }
};