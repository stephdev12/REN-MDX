// 🌸 Plugin: ANIME
// APIs: GiftedTech

const axios = require('axios');
const { t } = require('../../lib/language');
const API_KEY = 'gifted';

module.exports = [
    {
        name: 'loli',
        aliases: [],
        category: 'anime',
        description: 'Image aléatoire de Loli',
        usage: '.loli',

        execute: async (client, message, args) => {
            try {
                await client.sendMessage(message.key.remoteJid, { react: { text: '🌸', key: message.key } });

                // L'API renvoie directement l'image
                const imageUrl = `https://api.giftedtech.co.ke/api/anime/loli?apikey=${API_KEY}`;

                await client.sendMessage(message.key.remoteJid, { 
                    image: { url: imageUrl }, 
                    caption: `> *LOLI* 🌸` 
                }, { quoted: message });

            } catch (error) {
                console.error("Loli Error:", error.message);
                client.sendMessage(message.key.remoteJid, { text: '> *ERREUR* : Image introuvable.' }, { quoted: message });
            }
        }
    },
    {
        name: 'awoo',
        aliases: [],
        category: 'anime',
        description: 'Image aléatoire Awoo',
        usage: '.awoo',

        execute: async (client, message, args) => {
            try {
                await client.sendMessage(message.key.remoteJid, { react: { text: '🐺', key: message.key } });

                const { data } = await axios.get(`https://api.giftedtech.co.ke/api/anime/awoo?apikey=${API_KEY}`);
                
                if (!data.success || !data.result) throw new Error('API Error');

                await client.sendMessage(message.key.remoteJid, { 
                    image: { url: data.result }, 
                    caption: `> *AWOO* 🐺` 
                }, { quoted: message });

            } catch (error) {
                console.error("Awoo Error:", error.message);
                client.sendMessage(message.key.remoteJid, { text: '> *ERREUR* : Image introuvable.' }, { quoted: message });
            }
        }
    },
    {
        name: 'animequote',
        aliases: ['quote', 'quotes'],
        category: 'anime',
        description: 'Citation d\'anime aléatoire',
        usage: '.animequote',

        execute: async (client, message, args) => {
            try {
                await client.sendMessage(message.key.remoteJid, { react: { text: '💬', key: message.key } });

                const { data } = await axios.get(`https://api.giftedtech.co.ke/api/anime/quotes?apikey=${API_KEY}`);
                
                if (!data.success || !data.result) throw new Error('API Error');

                const { character, show, quote } = data.result;
                const text = `> *ANIME QUOTE*\n\n" *${quote}* "\n\n— _${character}_ (${show})`;

                await client.sendMessage(message.key.remoteJid, { text: text }, { quoted: message });

            } catch (error) {
                console.error("Quote Error:", error.message);
                client.sendMessage(message.key.remoteJid, { text: '> *ERREUR* : Citation introuvable.' }, { quoted: message });
            }
        }
    },
    {
        name: 'kusonime',
        aliases: ['kuso'],
        category: 'anime',
        description: 'Recherche ou Infos récentes Kusonime',
        usage: '.kusonime [recherche]',

        execute: async (client, message, args) => {
            try {
                await client.sendMessage(message.key.remoteJid, { react: { text: '📺', key: message.key } });

                const query = args.join(' ');
                let apiUrl = `https://api.giftedtech.co.ke/api/anime/kusonime-info?apikey=${API_KEY}`;
                
                if (query) {
                    apiUrl = `https://api.giftedtech.co.ke/api/anime/kusonime-search?apikey=${API_KEY}&query=${encodeURIComponent(query)}`;
                }

                const { data } = await axios.get(apiUrl);
                
                if (!data.success || !data.result || data.result.length === 0) throw new Error('API Error');

                // On prend les 3 premiers résultats pour ne pas spammer
                const animes = data.result.slice(0, 3);
                
                for (const anime of animes) {
                    let caption = `> *KUSONIME ${query ? 'SEARCH' : 'LATEST'}*\n\n`;
                    caption += `*Titre* : ${anime.title}\n`;
                    caption += `🎭 Genres : ${anime.genres.join(', ')}\n`;
                    caption += `🕒 Sortie : ${anime.releaseTime}\n`;
                    caption += `🔗 ${anime.url}`;

                    await client.sendMessage(message.key.remoteJid, { 
                        image: { url: anime.thumbnail },
                        caption: caption
                    }, { quoted: message });
                }

            } catch (error) {
                console.error("Kusonime Error:", error.message);
                client.sendMessage(message.key.remoteJid, { text: '> *ERREUR* : Infos introuvables.' }, { quoted: message });
            }
        }
    }
];