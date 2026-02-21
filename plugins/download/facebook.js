// 📘 Plugin: FACEBOOK
const axios = require('axios');
const { t } = require('../../lib/language');
const API_KEY = 'gifted';

module.exports = {
    name: 'facebook',
    aliases: ['fb', 'fbdl'],
    category: 'download',
    description: 'Télécharge une vidéo Facebook',
    usage: '.fb <url>',

    execute: async (client, message, args) => {
        const url = args[0];
        if (!url) return client.sendMessage(message.key.remoteJid, { text: t('download.no_url') });

        await client.sendMessage(message.key.remoteJid, { react: { text: '⏳', key: message.key } });

        try {
            const { data } = await axios.get(`https://api.giftedtech.co.ke/api/download/facebook?apikey=${API_KEY}&url=${encodeURIComponent(url)}`);
            
            if (data.success) {
                const hdUrl = data.result.hd_video || data.result.sd_video;
                const caption = t('download.fb_caption', { title: data.result.title || 'Video' });

                await client.sendMessage(message.key.remoteJid, { 
                    video: { url: hdUrl }, 
                    caption: caption 
                }, { quoted: message });
                
                await client.sendMessage(message.key.remoteJid, { react: { text: '✅', key: message.key } });
            } else {
                throw new Error('API Fail');
            }
        } catch (e) {
            client.sendMessage(message.key.remoteJid, { text: t('download.error') });
        }
    }
};