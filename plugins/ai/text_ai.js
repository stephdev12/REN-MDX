// 🤖 Plugin: TEXT AI
// Différents modèles d'IA textuels (GPT4o, Gemini, Venice, etc.)

const axios = require('axios');
const { t } = require('../../lib/language');
const API_KEY = 'gifted';

const textModels = [
    { name: 'gpt4o', endpoint: 'gpt4o', desc: 'Chat avec GPT-4o' },
    { name: 'gemini', endpoint: 'gemini', desc: 'Chat avec Gemini' },
    { name: 'venice', endpoint: 'venice', desc: 'Chat avec Venice' },
    { name: 'unlimitedai', endpoint: 'unlimitedai', desc: 'Chat avec UnlimitedAI' },
    { name: 'letme', endpoint: 'letmegpt', desc: 'Let Me GPT That For You', isUrlResponse: true }
];

const commands = textModels.map(model => ({
    name: model.name,
    aliases: [],
    category: 'ai',
    description: model.desc,
    usage: `.${model.name} <question>`,

    execute: async (client, message, args) => {
        const text = args.join(' ');
        if (!text) return client.sendMessage(message.key.remoteJid, { text: t('ai.no_query') }, { quoted: message });

        await client.sendMessage(message.key.remoteJid, { react: { text: "🧠", key: message.key } });

        try {
            const { data } = await axios.get(`https://api.giftedtech.co.ke/api/ai/${model.endpoint}?apikey=${API_KEY}&q=${encodeURIComponent(text)}`);
            
            if (model.isUrlResponse) {
               // Cas spécifique LetMeGPT : renvoie souvent une chaîne ou json.result
               const replyText = typeof data === 'string' ? data : (data.result || data.url || JSON.stringify(data));
               await client.sendMessage(message.key.remoteJid, { text: replyText }, { quoted: message });
               return;
            }

            if (data && data.success && data.result) {
                await client.sendMessage(message.key.remoteJid, { text: data.result }, { quoted: message });
            } else {
                throw new Error('API Error');
            }
        } catch (error) {
            console.error(error);
            client.sendMessage(message.key.remoteJid, { text: t('ai.error') }, { quoted: message });
        }
    }
}));

// Custom AI (REN)
commands.push({
    name: 'ren',
    aliases: ['renai'],
    category: 'ai',
    description: 'Chat avec l\'IA personnalisée REN',
    usage: '.ren <question>',

    execute: async (client, message, args) => {
        const text = args.join(' ');
        if (!text) return client.sendMessage(message.key.remoteJid, { text: t('ai.no_query') }, { quoted: message });

        await client.sendMessage(message.key.remoteJid, { react: { text: "🧠", key: message.key } });

        // Prompt de base pour donner la personnalité au bot (peut être customisé dans config.js plus tard)
        const prompt = "Tu es REN-MDX, un bot WhatsApp ultra-performant créé par SEN STUDIO. Tu es serviable, rapide et tu aimes la technologie.";
        
        try {
            const { data } = await axios.get(`https://api.giftedtech.co.ke/api/ai/custom?apikey=${API_KEY}&q=${encodeURIComponent(text)}&prompt=${encodeURIComponent(prompt)}`);
            
            if (data && data.success && data.result) {
                await client.sendMessage(message.key.remoteJid, { text: data.result }, { quoted: message });
            } else {
                throw new Error('API Error');
            }
        } catch (error) {
            console.error(error);
            client.sendMessage(message.key.remoteJid, { text: t('ai.error') }, { quoted: message });
        }
    }
});

module.exports = commands;