// 🔞 Plugin: NSFW RANDOM (Images/Videos)
// APIs: PrinceTech & David Cyril (Comme SEN)

const axios = require('axios');
const { t } = require('../../lib/language');

// Configuration des APIs
const APIS = {
    // PrinceTech (Images Anime)
    ass: 'https://api.princetechn.com/api/anime/ass?apikey=prince',
    hwaifu: 'https://api.princetechn.com/api/anime/hwaifu?apikey=prince',
    hneko: 'https://api.princetechn.com/api/anime/hneko?apikey=prince',
    milf: 'https://api.princetechn.com/api/anime/milf?apikey=prince',
    
    // PrinceTech (Real)
    naija: 'https://api.princetechn.com/api/nsfw/naija?apikey=prince',
    
    // David Cyril (Real Video)
    celeb: 'https://apis.davidcyril.name.ng/celeb'
};

const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

const commands = Object.keys(APIS).map(cmd => ({
    name: cmd,
    aliases: [],
    category: 'adult',
    description: `Random ${cmd}`,
    usage: `.${cmd}`,

    execute: async (client, message, args) => {
        try {
            await client.sendMessage(message.key.remoteJid, { react: { text: '🔞', key: message.key } });

            // Appel API
            const { data } = await axios.get(APIS[cmd], { headers: { 'User-Agent': UA } });

            // Cas spécifique : CELEB (David Cyril)
            if (cmd === 'celeb') {
                if (!data.success || !data.data) throw new Error('API Error');
                
                await client.sendMessage(message.key.remoteJid, { 
                    video: { url: data.data.downloadUrl }, 
                    caption: `> *CELEB EXPOSED*\n> ${data.data.title}`,
                    gifPlayback: false 
                }, { quoted: message });
                return;
            }

            // Cas spécifique : NAIJA (PrinceTech) - Peut être image ou vidéo
            if (cmd === 'naija') {
                if (!data.success || !data.result) throw new Error('API Error');
                const url = data.result;
                
                if (url.endsWith('.mp4')) {
                    await client.sendMessage(message.key.remoteJid, { 
                        video: { url: url }, 
                        caption: `> *NAIJA LEAK*`,
                        gifPlayback: false 
                    }, { quoted: message });
                } else {
                    await client.sendMessage(message.key.remoteJid, { 
                        image: { url: url }, 
                        caption: `> *NAIJA LEAK*` 
                    }, { quoted: message });
                }
                return;
            }

            // Cas général : IMAGES ANIME (PrinceTech)
            if (!data.success || !data.result) throw new Error('API Error');
            
            await client.sendMessage(message.key.remoteJid, { 
                image: { url: data.result }, 
                caption: `> *${cmd.toUpperCase()}*` 
            }, { quoted: message });

        } catch (error) {
            console.error(`Erreur ${cmd}:`, error.message);
            client.sendMessage(message.key.remoteJid, { text: t('tools.sticker_error') }, { quoted: message });
        }
    }
}));

module.exports = commands;