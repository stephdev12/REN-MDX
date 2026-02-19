const { t } = require('../../lib/language');

module.exports = [
    {
        name: 'kick',
        aliases: ['remove', 'ban'],
        category: 'group',
        description: 'Retire un membre',
        groupOnly: true, adminOnly: true,
        execute: async (client, message, args) => {
            const target = message.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0] || message.message?.extendedTextMessage?.contextInfo?.quotedMessage?.participant;
            if (!target) return client.sendMessage(message.key.remoteJid, { text: t('group.error_who') });
            await client.groupParticipantsUpdate(message.key.remoteJid, [target], 'remove');
            await client.sendMessage(message.key.remoteJid, { react: { text: "✅", key: message.key } });
        }
    },
    {
        name: 'add',
        aliases: ['invite'],
        category: 'group',
        description: 'Ajoute un membre',
        groupOnly: true, adminOnly: true,
        execute: async (client, message, args) => {
            const num = args[0]?.replace(/[^0-9]/g, '');
            if (!num) return client.sendMessage(message.key.remoteJid, { text: t('owner.error_arg') });
            const target = num + '@s.whatsapp.net';
            await client.groupParticipantsUpdate(message.key.remoteJid, [target], 'add');
            await client.sendMessage(message.key.remoteJid, { react: { text: "✅", key: message.key } });
        }
    },
    {
        name: 'promote',
        aliases: ['admin'],
        category: 'group',
        description: 'Promeut un membre admin',
        groupOnly: true, adminOnly: true,
        execute: async (client, message, args) => {
            const target = message.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0] || message.message?.extendedTextMessage?.contextInfo?.quotedMessage?.participant;
            if (!target) return client.sendMessage(message.key.remoteJid, { text: t('group.error_who') });
            await client.groupParticipantsUpdate(message.key.remoteJid, [target], 'promote');
            await client.sendMessage(message.key.remoteJid, { react: { text: "✅", key: message.key } });
        }
    },
    {
        name: 'demote',
        aliases: ['unadmin'],
        category: 'group',
        description: 'Rétrograde un admin',
        groupOnly: true, adminOnly: true,
        execute: async (client, message, args) => {
            const target = message.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0] || message.message?.extendedTextMessage?.contextInfo?.quotedMessage?.participant;
            if (!target) return client.sendMessage(message.key.remoteJid, { text: t('group.error_who') });
            await client.groupParticipantsUpdate(message.key.remoteJid, [target], 'demote');
            await client.sendMessage(message.key.remoteJid, { react: { text: "✅", key: message.key } });
        }
    },
    {
        name: 'gname',
        aliases: ['setname'],
        category: 'group',
        description: 'Change le nom du groupe',
        groupOnly: true, adminOnly: true,
        execute: async (client, message, args) => {
            const name = args.join(' ');
            if (!name) return;
            await client.groupUpdateSubject(message.key.remoteJid, name);
            await client.sendMessage(message.key.remoteJid, { react: { text: "✅", key: message.key } });
        }
    },
    {
        name: 'gdesc',
        aliases: ['setdesc'],
        category: 'group',
        description: 'Change la description',
        groupOnly: true, adminOnly: true,
        execute: async (client, message, args) => {
            const desc = args.join(' ');
            if (!desc) return;
            await client.groupUpdateDescription(message.key.remoteJid, desc);
            await client.sendMessage(message.key.remoteJid, { react: { text: "✅", key: message.key } });
        }
    },
    {
        name: 'glink',
        aliases: ['invitelink'],
        category: 'group',
        description: 'Récupère le lien du groupe',
        groupOnly: true, adminOnly: true,
        execute: async (client, message, args) => {
            const code = await client.groupInviteCode(message.key.remoteJid);
            client.sendMessage(message.key.remoteJid, { text: t('group.glink', { link: `https://chat.whatsapp.com/${code}` }) });
        }
    },
    {
        name: 'revoke',
        aliases: ['resetlink'],
        category: 'group',
        description: 'Réinitialise le lien du groupe',
        groupOnly: true, adminOnly: true,
        execute: async (client, message, args) => {
            await client.groupRevokeInvite(message.key.remoteJid);
            await client.sendMessage(message.key.remoteJid, { react: { text: "✅", key: message.key } });
        }
    }
];