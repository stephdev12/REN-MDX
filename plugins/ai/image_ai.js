// 🎨 Plugin: IMAGE AI
// Différents modèles de génération d'images (Deep, Flux, Sora, MagicStudio)

const axios = require('axios');
const { t } = require('../../lib/language');
const API_KEY = 'gifted';

const imageModels = [
    { name: 'deepimg', endpoint: 'deepimg', desc: 'Génère une image via DeepAI', format: 'json_result' },
    { name: 'flux', endpoint: 'fluximg', desc: 'Génère une image via Flux', format: 'json_result_url', extraParam: '&ratio=1:1' },
    { name: 'sora', endpoint: 'txt2img', desc: 'Génère une image via Sora', format: 'json_result_url' },
    { name: 'magicstudio', endpoint: 'magicstudio', desc: 'Génère une image via MagicStudio', format: 'buffer' }
];

const commands = imageModels.map(model => ({
    name: model.name,
    aliases: [],
    category: 'ai',
    description: model.desc,
    usage: `.${model.name} <prompt>`,

    execute: async (client, message, args) => {
        const text = args.join(' ');
        if (!text) return client.sendMessage(message.key.remoteJid, { text: t('ai.no_query') }, { quoted: message });

        await client.sendMessage(message.key.remoteJid, { react: { text: "🎨", key: message.key } });

        try {
            const url = `https://api.giftedtech.co.ke/api/ai/${model.endpoint}?apikey=${API_KEY}&prompt=${encodeURIComponent(text)}${model.extraParam || ''}`;
            
            let imageUrl;

            if (model.format === 'buffer') {
                // Pour magicstudio, l'API retourne directement l'image
                imageUrl = url; 
            } else {
                const { data } = await axios.get(url);
                if (!data.success) throw new Error('API Error');
                
                if (model.format === 'json_result') {
                    imageUrl = data.result;
                } else if (model.format === 'json_result_url') {
                    imageUrl = data.result.url;
                }
            }

            if (!imageUrl) throw new Error('No Image URL returned');

            await client.sendMessage(message.key.remoteJid, { 
                image: { url: imageUrl }, 
                caption: `> *${model.name.toUpperCase()}*\n> Prompt : ${text}` 
            }, { quoted: message });

            await client.sendMessage(message.key.remoteJid, { react: { text: "✅", key: message.key } });

        } catch (error) {
            console.error(`Erreur ${model.name}:`, error);
            await client.sendMessage(message.key.remoteJid, { react: { text: "❌", key: message.key } });
            client.sendMessage(message.key.remoteJid, { text: t('tools.sticker_error') }, { quoted: message });
        }
    }
}));

module.exports = commands;