// 🖼️ Plugin: SETMENUIMAGE
const { updateSetting } = require('../../lib/database');
const { t } = require('../../lib/language');

module.exports = {
    name: 'setmenuimage',
    aliases: ['setmenu'],
    category: 'owner',
    description: 'Change les images du menu',
    usage: '.setmenu <url1> <url2> ...',
    
    ownerOnly: true,

    execute: async (client, message, args) => {
        if (args.length === 0) return client.sendMessage(message.key.remoteJid, { text: t('owner.error_arg') }, { quoted: message });

        const urls = args.filter(arg => arg.startsWith('http'));
        
        if (urls.length === 0) return client.sendMessage(message.key.remoteJid, { text: t('tools.ssweb_error') }, { quoted: message });

        updateSetting('menuImages', urls);
        await client.sendMessage(message.key.remoteJid, { 
            text: t('owner.menu_img_changed', { count: urls.length })
        }, { quoted: message });
    }
};