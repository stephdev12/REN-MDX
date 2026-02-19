const { updateGroupSetting, getGroupSettings } = require('../../lib/database');
const { t } = require('../../lib/language');

const PROTECTIONS = [
    { cmd: 'antispam', name: 'ANTISPAM', desc: 'Protection anti-spam' },
    { cmd: 'antimedia', name: 'ANTIMEDIA', desc: 'Interdit images/vidéos' },
    { cmd: 'antitag', name: 'ANTITAG', desc: 'Interdit les mentions excessives' },
    { cmd: 'antipromote', name: 'ANTI-PROMOTE', desc: 'Empêche les promotions non-autorisées' },
    { cmd: 'antidemote', name: 'ANTI-DEMOTE', desc: 'Empêche les rétrogradations' },
    { cmd: 'antitransfert', name: 'ANTI-TRANSFERT', desc: 'Interdit les messages transférés' },
    { cmd: 'antibadword', name: 'ANTI-BADWORD', desc: 'Filtre les mots interdits' }
];

const commands = PROTECTIONS.map(prot => ({
    name: prot.cmd,
    aliases: [],
    category: 'group',
    description: prot.desc,
    usage: `.${prot.cmd} <on/off>`,
    
    groupOnly: true,
    adminOnly: true,

    execute: async (client, message, args) => {
        const chatId = message.key.remoteJid;
        const setting = args[0]?.toLowerCase();
        const currentConfig = getGroupSettings(chatId);

        if (!setting) {
            return client.sendMessage(chatId, { 
                text: t('group.prot_status', { prot: prot.name, status: currentConfig[prot.cmd] ? 'on' : 'off' })
            }, { quoted: message });
        }

        if (setting === 'on') {
            updateGroupSetting(chatId, prot.cmd, true);
            return client.sendMessage(chatId, { text: t('group.prot_enabled', { prot: prot.name }) }, { quoted: message });
        }

        if (setting === 'off') {
            updateGroupSetting(chatId, prot.cmd, false);
            return client.sendMessage(chatId, { text: t('group.prot_disabled', { prot: prot.name }) }, { quoted: message });
        }

        client.sendMessage(chatId, { text: t('owner.usage', { usage: `.${prot.cmd} <on/off>` }) }, { quoted: message });
    }
}));

const setBadword = {
    name: 'setbadword',
    aliases: ['addbadword', 'delbadword'],
    category: 'group',
    description: 'Gère la liste des mots interdits',
    usage: '.setbadword <add/del/list> <mot>',
    
    groupOnly: true,
    adminOnly: true,

    execute: async (client, message, args) => {
        const chatId = message.key.remoteJid;
        const action = args[0]?.toLowerCase();
        const word = args.slice(1).join(' ');
        
        let config = getGroupSettings(chatId);
        let badwords = config.badwords || [];

        if (action === 'add' && word) {
            if (badwords.includes(word)) return client.sendMessage(chatId, { text: t('group.badword_exists') }, { quoted: message });
            badwords.push(word);
            updateGroupSetting(chatId, 'badwords', badwords);
            return client.sendMessage(chatId, { text: t('group.badword_add', { word }) }, { quoted: message });
        }

        if (action === 'del' && word) {
            if (!badwords.includes(word)) return client.sendMessage(chatId, { text: t('group.badword_not_found') }, { quoted: message });
            badwords = badwords.filter(w => w !== word);
            updateGroupSetting(chatId, 'badwords', badwords);
            return client.sendMessage(chatId, { text: t('group.badword_del', { word }) }, { quoted: message });
        }

        if (action === 'list') {
            return client.sendMessage(chatId, { text: t('group.badword_list', { list: badwords.join(', ') || 'Aucun' }) }, { quoted: message });
        }

        client.sendMessage(chatId, { text: t('owner.usage', { usage: '.setbadword <add/del/list> <mot>' }) }, { quoted: message });
    }
};

module.exports = [...commands, setBadword];