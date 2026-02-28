// 🤖 Plugin: CHATBOT
// Gestion du chatbot IA (Auto-reply)

const { updateSetting } = require('../../lib/database');
const { saveRequest, deleteRequest } = require('../../lib/store');
const { normalizeJid } = require('../../lib/authHelper');
const { t } = require('../../lib/language');

module.exports = {
    name: 'chatbot',
    aliases: ['botauto'],
    category: 'owner',
    description: 'Configure le mode chatbot',
    usage: '.chatbot',
    ownerOnly: true,

    execute: async (client, message, args) => {
        const chatId = message.key.remoteJid;
        
        // Afficher le menu
        await client.sendMessage(chatId, { text: t('ai.chatbot_menu') }, { quoted: message });

        // Sauvegarder la requête pour la réponse interactive
        const userId = message.key.fromMe 
            ? normalizeJid(client.user?.id || "")
            : normalizeJid(message.key.participant || chatId);

        saveRequest(userId, chatId, {
            command: 'chatbot'
        });
    },

    // Gestion de la réponse (1, 2, 3, 4)
    handleResponse: async (client, message, body, context) => {
        const choice = body.trim();
        const chatId = message.key.remoteJid;
        
        if (!['1', '2', '3', '4'].includes(choice)) return;

        let mode = 'off';
        let responseText = '';

        if (choice === '1') {
            mode = 'private';
            responseText = t('ai.chatbot_mode_private');
        } else if (choice === '2') {
            mode = 'group';
            responseText = t('ai.chatbot_mode_group');
        } else if (choice === '3') {
            mode = 'both';
            responseText = t('ai.chatbot_mode_both');
        } else if (choice === '4') {
            mode = 'off';
            responseText = t('ai.chatbot_mode_off');
        }

        updateSetting('chatbotMode', mode);
        await client.sendMessage(chatId, { text: responseText }, { quoted: message });

        const userId = message.key.fromMe 
            ? normalizeJid(client.user?.id || "")
            : normalizeJid(message.key.participant || chatId);
        deleteRequest(userId, chatId);
    }
};