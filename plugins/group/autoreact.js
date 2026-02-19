const { updateGroupSetting, getGroupSettings } = require('../../lib/database');
const { t } = require('../../lib/language');

module.exports = {
    name: 'autoreact',
    aliases: [],
    category: 'group',
    description: 'Active/Désactive les réactions auto',
    usage: '.autoreact <on/off>',
    
    groupOnly: true,
    adminOnly: true,

    execute: async (client, message, args) => {
        const chatId = message.key.remoteJid;
        const setting = args[0]?.toLowerCase();
        const currentConfig = getGroupSettings(chatId);

        if (!setting) {
            return client.sendMessage(chatId, { text: t('group.autoreact_status', { status: currentConfig.autoreact ? 'on' : 'off' }) }, { quoted: message });
        }

        if (setting === 'on') {
            updateGroupSetting(chatId, 'autoreact', true);
            return client.sendMessage(chatId, { text: t('group.autoreact_on') }, { quoted: message });
        }

        if (setting === 'off') {
            updateGroupSetting(chatId, 'autoreact', false);
            return client.sendMessage(chatId, { text: t('group.autoreact_off') }, { quoted: message });
        }
    }
};