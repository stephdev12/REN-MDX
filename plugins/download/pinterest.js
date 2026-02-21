// 📌 Plugin: PINTEREST
// Recherche d'images

const axios = require('axios');
const { t } = require('../../lib/language');

module.exports = {
    name: 'pinterest',
    aliases: ['pin'],
    category: 'download',
    description: 'Recherche Pinterest',
    usage: '.pin <recherche>',

    execute: async (client, message, args) => {
        const query = args.join(' ');
        if (!query) return client.sendMessage(message.key.remoteJid, { text: t('download.no_query') });

        await client.sendMessage(message.key.remoteJid, { react: { text: '🔍', key: message.key } });

        try {
            // API Publique (via Gifted ou autre)
            const { data } = await axios.get(`https://api.giftedtech.co.ke/api/search/pinterest?apikey=gifted&query=${encodeURIComponent(query)}`);
            
            if (!data.success || !data.result || data.result.length === 0) throw new Error();

            // Envoi des 5 premières images
            const images = data.result.slice(0, 5);
            for (const img of images) {
                await client.sendMessage(message.key.remoteJid, { image: { url: img } }, { quoted: message });
            }

        } catch (e) {
            client.sendMessage(message.key.remoteJid, { text: t('download.no_result') });
        }
    }
};