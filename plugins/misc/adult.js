// 🔞 Plugin: ADULT (NSFW)
// Contenu adulte

const axios = require('axios');
const { t } = require('../../lib/language');
const API_KEY = 'gifted';

module.exports = [
    {
        name: 'xvideo',
        aliases: ['xv'],
        category: 'adult',
        description: 'Recherche XVideo',
        usage: '.xvideo <recherche>',
        
        execute: async (client, message, args) => {
            const query = args.join(' ');
            if (!query) return client.sendMessage(message.key.remoteJid, { text: t('download.no_query') }, { quoted: message });

            try {
                await client.sendMessage(message.key.remoteJid, { react: { text: '🔞', key: message.key } });
                const { data } = await axios.get(`https://api.giftedtech.co.ke/api/search/xvideos?apikey=${API_KEY}&query=${encodeURIComponent(query)}`);
                
                // Pour faire simple, on prend le premier résultat
                if (!data.success || data.result.length === 0) throw new Error('Not found');
                const video = data.result[0];

                await client.sendMessage(message.key.remoteJid, { 
                    text: `> *XVIDEO*\n\n*Titre* : ${video.title}\n*Lien* : ${video.url}`
                }, { quoted: message });

            } catch (e) {
                client.sendMessage(message.key.remoteJid, { text: t('download.no_result') }, { quoted: message });
            }
        }
    },
    {
        name: 'xnxx',
        aliases: [],
        category: 'adult',
        description: 'Téléchargement XNXX',
        usage: '.xnxx <url>',
        
        execute: async (client, message, args) => {
            const url = args[0];
            if (!url) return client.sendMessage(message.key.remoteJid, { text: t('download.no_url') }, { quoted: message });

            try {
                await client.sendMessage(message.key.remoteJid, { react: { text: '🍑', key: message.key } });
                const { data } = await axios.get(`https://api.giftedtech.co.ke/api/download/xnxxdl?apikey=${API_KEY}&url=${encodeURIComponent(url)}`);
                
                if (!data.success) throw new Error('DL Fail');

                await client.sendMessage(message.key.remoteJid, { 
                    video: { url: data.result.files.high }, 
                    caption: t('download.xnxx_caption', { title: data.result.title })
                }, { quoted: message });

            } catch (e) {
                client.sendMessage(message.key.remoteJid, { text: t('download.error') }, { quoted: message });
            }
        }
    }
];