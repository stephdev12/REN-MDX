const axios = require('axios');
const API_KEY = 'gifted';
const { uploadMedia } = require('../../lib/mediaUpload');
const { t } = require('../../lib/language');

module.exports = [
    {
        name: 'ssweb',
        aliases: ['screen'],
        category: 'tools',
        description: 'Screenshot d\'un site web',
        usage: '.ssweb <url>',
        execute: async (client, message, args) => {
            const url = args[0];
            if (!url) return client.sendMessage(message.key.remoteJid, { text: t('tools.ssweb_error') });
            
            const imgUrl = `https://api.giftedtech.co.ke/api/tools/ssweb?apikey=${API_KEY}&url=${encodeURIComponent(url)}`;
            await client.sendMessage(message.key.remoteJid, { image: { url: imgUrl } }, { quoted: message });
        }
    },
    {
        name: 'tourl',
        aliases: ['upload'],
        category: 'tools',
        description: 'Upload image vers URL',
        usage: '.tourl (réponse image)',
        execute: async (client, message, args) => {
            const quoted = message.message?.extendedTextMessage?.contextInfo?.quotedMessage || message.message;
            if (!quoted) return client.sendMessage(message.key.remoteJid, { text: t('tools.no_media') });

            // On cherche l'objet image/video dans le message (qu'il soit quoted ou direct)
            const type = Object.keys(quoted).find(key => key === 'imageMessage' || key === 'videoMessage');
            if (!type) {
                return client.sendMessage(message.key.remoteJid, { text: t('tools.no_media') });
            }

            await client.sendMessage(message.key.remoteJid, { react: { text: '⬆️', key: message.key } });

            try {
                // On passe un objet "propre" à l'uploader qui attend { imageMessage: ... }
                const mediaMsg = {};
                mediaMsg[type] = quoted[type];
                
                const url = await uploadMedia(mediaMsg);
                if (!url) throw new Error('Upload failed');
                
                await client.sendMessage(message.key.remoteJid, { text: `> *URL* : ${url}` }, { quoted: message });
            } catch (e) {
                client.sendMessage(message.key.remoteJid, { text: t('tools.sticker_error') });
            }
        }
    },
    {
        name: 'getpp',
        aliases: [],
        category: 'tools',
        description: 'Récupère la photo de profil',
        usage: '.getpp (@user)',
        execute: async (client, message, args) => {
            // Cible : Cité > Mentionné > Expéditeur (Soi-même) > Groupe (si arg 'group')
            const quoted = message.message?.extendedTextMessage?.contextInfo?.quotedMessage?.participant;
            const mentioned = message.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0];
            const sender = message.key.participant || message.key.remoteJid;
            
            let target = quoted || mentioned || sender;
            
            // Si l'utilisateur tape ".getpp group", on prend le groupe
            if (args[0] === 'group') target = message.key.remoteJid;

            try {
                const pp = await client.profilePictureUrl(target, 'image');
                await client.sendMessage(message.key.remoteJid, { image: { url: pp } }, { quoted: message });
            } catch (e) {
                // Fallback: Image par défaut si pas de PP
                await client.sendMessage(message.key.remoteJid, { text: t('tools.no_pp') });
            }
        }
    },
    {
        name: 'delete',
        aliases: ['del'],
        category: 'tools',
        description: 'Supprime un message du bot',
        usage: '.del (réponse)',
        execute: async (client, message, args) => {
            const quoted = message.message?.extendedTextMessage?.contextInfo?.quotedMessage;
            if (!quoted) return;
            
            const key = {
                remoteJid: message.key.remoteJid,
                fromMe: true, // On suppose qu'on supprime un message du bot, ou alors il faut être admin
                id: message.message.extendedTextMessage.contextInfo.stanzaId,
                participant: message.message.extendedTextMessage.contextInfo.participant
            };
            
            await client.sendMessage(message.key.remoteJid, { delete: key });
        }
    }
];