const { t } = require('../../lib/language');
const axios = require('axios');

module.exports = {
    name: 'tiktok',
    // ...
    execute: async (client, message, args, msgOptions) => {
        const url = args[0];
        if (!url) return client.sendMessage(message.key.remoteJid, { text: t('download.no_url') }, { quoted: message });

        await client.sendMessage(message.key.remoteJid, { react: { text: "⬇️", key: message.key } });

        try {
            const { data } = await axios.post('https://www.tikwm.com/api/', { url: url });
            if (!data.data) throw new Error('Vidéo introuvable');

            const caption = t('download.tiktok_caption', {
                author: data.data.author.nickname,
                title: data.data.title
            });

            await client.sendMessage(message.key.remoteJid, { 
                video: { url: data.data.play }, 
                caption: caption 
            }, { quoted: message, ...msgOptions });

        } catch (error) {
            client.sendMessage(message.key.remoteJid, { text: t('download.error') }, { quoted: message });
        }
    }
};