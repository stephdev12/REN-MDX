// 🏷️ Plugin: TAGGING
const { t } = require('../../lib/language');

module.exports = [
    {
        name: 'tagall',
        aliases: ['everyone'],
        category: 'group',
        description: 'Tag tout le monde',
        groupOnly: true, adminOnly: true,
        execute: async (client, message, args) => {
            const metadata = await client.groupMetadata(message.key.remoteJid);
            const participants = metadata.participants.map(p => p.id);
            const msg = args.join(' ');
            
            let list = '';
            participants.forEach(p => list += `@${p.split('@')[0]}\n`);
            
            await client.sendMessage(message.key.remoteJid, { 
                text: t('group.tagall', { msg, list }), 
                mentions: participants 
            }, { quoted: message });
        }
    },
    {
        name: 'hidetag',
        aliases: ['ht'],
        category: 'group',
        description: 'Tag invisible',
        groupOnly: true, adminOnly: true,
        execute: async (client, message, args) => {
            const metadata = await client.groupMetadata(message.key.remoteJid);
            const participants = metadata.participants.map(p => p.id);
            const quoted = message.message?.extendedTextMessage?.contextInfo?.quotedMessage;
            
            if (quoted) {
                // Pour faire simple, on renvoie le texte s'il y en a
                const text = args.join(' ') || "Start";
                await client.sendMessage(message.key.remoteJid, { text, mentions: participants });
            } else {
                const text = args.join(' ') || "Tag";
                await client.sendMessage(message.key.remoteJid, { text, mentions: participants });
            }
        }
    }
];