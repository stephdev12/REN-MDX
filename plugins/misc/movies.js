// 🎬 Plugin: MOVIES & SERIES
const axios = require('axios');
const { t } = require('../../lib/language');
const API_KEY = 'gifted';

module.exports = [
    {
        name: 'movie',
        aliases: ['film'],
        category: 'misc',
        description: 'Recherche de films',
        usage: '.movie <titre>',
        execute: async (client, message, args) => {
            const query = args.join(' ');
            if (!query) return client.sendMessage(message.key.remoteJid, { text: t('download.no_query') });

            await client.sendMessage(message.key.remoteJid, { react: { text: '🎬', key: message.key } });

            try {
                const { data } = await axios.get(`https://api.giftedtech.co.ke/api/search/movie?apikey=${API_KEY}&query=${encodeURIComponent(query)}`);
                
                if (data.success && data.result.length > 0) {
                    const movie = data.result[0];
                    const caption = `> *FILM* : ${movie.title}\n> *Date* : ${movie.release_date}\n> *Note* : ${movie.vote_average}`;
                    
                    await client.sendMessage(message.key.remoteJid, { 
                        image: { url: `https://image.tmdb.org/t/p/w500${movie.poster_path}` }, 
                        caption: caption 
                    }, { quoted: message });
                } else {
                    throw new Error();
                }
            } catch (e) {
                client.sendMessage(message.key.remoteJid, { text: t('download.no_result') });
            }
        }
    }
];