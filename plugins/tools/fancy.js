// ✨ Plugin: FANCY TEXT
// Formatte le texte avec des polices spéciales

const axios = require('axios');
const API_KEY = 'gifted';

module.exports = {
    name: 'fancy',
    aliases: ['font', 'style'],
    category: 'tools',
    description: 'Affiche un texte avec plusieurs styles',
    usage: '.fancy <texte>',
    execute: async (client, message, args) => {
        const text = args.join(' ');
        
        if (!text) return client.sendMessage(message.key.remoteJid, { text: '> *ERREUR* : Texte manquant.' });

        await client.sendMessage(message.key.remoteJid, { react: { text: '✨', key: message.key } });

        try {
            const apiUrl = `https://api.giftedtech.co.ke/api/tools/fancy?apikey=${API_KEY}&text=${encodeURIComponent(text)}`;
            const { data } = await axios.get(apiUrl);

            if (!data.success || !data.results) throw new Error('API Fail');

            let replyText = `> *FANCY TEXT*\n\n`;
            
            // Affiche tous les styles
            data.results.forEach((item, index) => {
                replyText += `*${index + 1}.* ${item.result}\n`;
            });

            await client.sendMessage(message.key.remoteJid, { text: replyText.trim() }, { quoted: message });

        } catch (e) {
            console.error(e);
            client.sendMessage(message.key.remoteJid, { text: '> *ERREUR* : Échec du formatage.' });
        }
    }
};