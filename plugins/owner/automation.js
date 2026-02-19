// 🤖 Plugin: AUTOMATION (Owner)
// Gère les automatisations globales (Status, Présence)

const { updateSetting, getSettings } = require('../../lib/database');
const { t } = require('../../lib/language');

const AUTOMATIONS = [
    { cmd: 'autostatusview', name: 'AUTO-STATUS-VIEW', desc: 'Vue auto des statuts' },
    { cmd: 'autostatusreact', name: 'AUTO-STATUS-REACT', desc: 'Réaction auto des statuts' },
    { cmd: 'autotyping', name: 'AUTO-TYPING', desc: 'Simule l\'écriture' },
    { cmd: 'autorecord', name: 'AUTO-RECORD', desc: 'Simule l\'enregistrement vocal' }
];

const commands = AUTOMATIONS.map(auto => ({
    name: auto.cmd,
    aliases: [],
    category: 'owner',
    description: auto.desc,
    usage: `.${auto.cmd} <on/off>`,
    
    ownerOnly: true,

    execute: async (client, message, args) => {
        const setting = args[0]?.toLowerCase();
        const currentConfig = getSettings();

        // Gestion conflit Typing/Record (un seul actif à la fois)
        if (setting === 'on') {
            if (auto.cmd === 'autotyping') updateSetting('autorecord', false);
            if (auto.cmd === 'autorecord') updateSetting('autotyping', false);
        }

        if (!setting) {
            return client.sendMessage(message.key.remoteJid, { 
                text: t('owner.auto_status', { cmd: auto.name, status: currentConfig[auto.cmd] ? 'on' : 'off' })
            }, { quoted: message });
        }

        if (setting === 'on') {
            updateSetting(auto.cmd, true);
            return client.sendMessage(message.key.remoteJid, { text: t('owner.auto_on', { cmd: auto.name }) }, { quoted: message });
        }

        if (setting === 'off') {
            updateSetting(auto.cmd, false);
            return client.sendMessage(message.key.remoteJid, { text: t('owner.auto_off', { cmd: auto.name }) }, { quoted: message });
        }

        client.sendMessage(message.key.remoteJid, { text: t('owner.usage', { usage: `.${auto.cmd} <on/off>` }) }, { quoted: message });
    }
}));

module.exports = commands;