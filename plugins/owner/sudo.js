const { updateSetting, getSettings } = require('../../lib/database');
const { normalizeJid } = require('../../lib/authHelper');
const { t } = require('../../lib/language');

module.exports = [
    {
        name: 'setsudo',
        aliases: ['addsudo'],
        category: 'owner',
        description: 'Ajoute un utilisateur Sudo',
        usage: '.setsudo (@tag ou réponse)',
        ownerOnly: true,

        execute: async (client, message, args) => {
            const mentioned = message.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0];
            const quoted = message.message?.extendedTextMessage?.contextInfo?.quotedMessage?.participant || message.message?.extendedTextMessage?.contextInfo?.participant;
            const target = mentioned || quoted;

            if (!target) return client.sendMessage(message.key.remoteJid, { text: t('owner.no_target') }, { quoted: message });

            const targetId = normalizeJid(target);
            const settings = getSettings();
            let sudos = settings.sudo || [];

            if (sudos.includes(targetId)) {
                return client.sendMessage(message.key.remoteJid, { text: t('owner.already_sudo') }, { quoted: message });
            }

            sudos.push(targetId);
            updateSetting('sudo', sudos);
            
            await client.sendMessage(message.key.remoteJid, { text: t('owner.sudo_added', { user: targetId }), mentions: [target] }, { quoted: message });
        }
    },
    {
        name: 'delsudo',
        aliases: ['rmsudo'],
        category: 'owner',
        description: 'Retire un utilisateur Sudo',
        usage: '.delsudo (@tag ou réponse)',
        ownerOnly: true,

        execute: async (client, message, args) => {
            const mentioned = message.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0];
            const quoted = message.message?.extendedTextMessage?.contextInfo?.quotedMessage?.participant;
            const target = mentioned || quoted;

            if (!target) return client.sendMessage(message.key.remoteJid, { text: t('owner.no_target') }, { quoted: message });

            const targetId = normalizeJid(target);
            const settings = getSettings();
            let sudos = settings.sudo || [];

            if (!sudos.includes(targetId)) {
                return client.sendMessage(message.key.remoteJid, { text: t('owner.not_sudo') }, { quoted: message });
            }

            sudos = sudos.filter(id => id !== targetId);
            updateSetting('sudo', sudos);
            
            await client.sendMessage(message.key.remoteJid, { text: t('owner.sudo_removed', { user: targetId }), mentions: [target] }, { quoted: message });
        }
    },
    {
        name: 'listsudo',
        aliases: ['sudos'],
        category: 'owner',
        description: 'Liste les utilisateurs Sudo',
        usage: '.listsudo',
        ownerOnly: true,

        execute: async (client, message, args) => {
            const settings = getSettings();
            const sudos = settings.sudo || [];

            if (sudos.length === 0) {
                return client.sendMessage(message.key.remoteJid, { text: t('owner.no_sudo') }, { quoted: message });
            }

            let list = '';
            sudos.forEach(s => list += `• @${s}\n`);

            await client.sendMessage(message.key.remoteJid, { 
                text: t('owner.sudo_list', { list }), 
                mentions: sudos.map(s => s + '@s.whatsapp.net') 
            }, { quoted: message });
        }
    }
];