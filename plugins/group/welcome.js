const { updateGroupSetting, getGroupSettings } = require('../../lib/database');
const { t } = require('../../lib/language');

module.exports = [
    {
        name: 'welcome',
        aliases: [],
        category: 'group',
        description: 'Active/Désactive le message de bienvenue',
        usage: '.welcome <on/off>',
        
        groupOnly: true,
        adminOnly: true,

        execute: async (client, message, args) => {
            const chatId = message.key.remoteJid;
            const setting = args[0]?.toLowerCase();
            const currentConfig = getGroupSettings(chatId);

            if (!setting) {
                return client.sendMessage(chatId, { text: t('group.welcome_init', { status: currentConfig.welcome ? 'on' : 'off' }) }, { quoted: message });
            }

            if (setting === 'on') {
                updateGroupSetting(chatId, 'welcome', true);
                return client.sendMessage(chatId, { text: t('group.welcome_on') }, { quoted: message });
            }

            if (setting === 'off') {
                updateGroupSetting(chatId, 'welcome', false);
                return client.sendMessage(chatId, { text: t('group.welcome_off') }, { quoted: message });
            }
        }
    },
    {
        name: 'setwelcome',
        aliases: [],
        category: 'group',
        description: 'Configure le message de bienvenue',
        usage: '.setwelcome <message> (@user, @group, @desc)',
        
        groupOnly: true,
        adminOnly: true,

        execute: async (client, message, args) => {
            const chatId = message.key.remoteJid;
            const text = args.join(' ');

            if (!text) return client.sendMessage(chatId, { text: t('owner.error_arg') }, { quoted: message });

            updateGroupSetting(chatId, 'welcomeMessage', text);
            client.sendMessage(chatId, { text: t('group.welcome_set') }, { quoted: message });
        }
    }
];