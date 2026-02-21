// 🎵 Plugin: SPOTIFY
// API: GiftedTech

const axios = require('axios');
const { t } = require('../../lib/language');
const API_KEY = 'gifted';

module.exports = {
    name: 'spotify',
    aliases: ['spot'],
    category: 'download',
    description: 'Téléchargement Spotify',
    usage: '.spotify <url>',

    execute: async (client, message, args) => {
        const url = args[0];
        if (!url) return client.sendMessage(message.key.remoteJid, { text: t('download.no_url') });

        await client.sendMessage(message.key.remoteJid, { react: { text: '🎵', key: message.key } });

        try {
            const { data } = await axios.get(`https://api.giftedtech.co.ke/api/download/spotifydl?apikey=${API_KEY}&url=${encodeURIComponent(url)}`);
            
            if (data.success) {
                const info = `> *SPOTIFY*\n\n> *Titre* : ${data.result.title}\n> *Durée* : ${data.result.duration}`;
                
                await client.sendMessage(message.key.remoteJid, { 
                    image: { url: data.result.thumbnail }, 
                    caption: info 
                }, { quoted: message });

                await client.sendMessage(message.key.remoteJid, { 
                    audio: { url: data.result.download_url }, 
                    mimetype: 'audio/mpeg' 
                }, { quoted: message });
            } else {
                throw new Error();
            }
        } catch (e) {
            client.sendMessage(message.key.remoteJid, { text: t('download.error') });
        }
    }
};