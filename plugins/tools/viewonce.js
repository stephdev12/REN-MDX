// 👁️ Plugin: VIEWONCE (Logic from SEN)
// Récupère les messages à vue unique (V1, V2, Direct)

const { downloadContentFromMessage } = require('gifted-baileys');
const { t } = require('../../lib/language');
const config = require('../../config');

module.exports = {
    name: 'viewonce',
    aliases: ['vv', 'reveal'],
    category: 'tools',
    description: 'Récupère un message à vue unique',
    usage: '.vv [private]',

    groupOnly: false,
    ownerOnly: false,
    adminOnly: false,

    execute: async (client, message, args) => {
        try {
            const isPrivate = args[0]?.toLowerCase() === 'private' || args[0]?.toLowerCase() === 'p';
            const quoted = message.message?.extendedTextMessage?.contextInfo?.quotedMessage;
            
            if (!quoted) return client.sendMessage(message.key.remoteJid, { text: t('tools.no_viewonce') }, { quoted: message });

            // --- LOGIQUE DE DÉTECTION (SEN) ---
            
            // 1. Vérifier les 3 formats possibles
            const quotedImage = quoted.imageMessage;
            const quotedVideo = quoted.videoMessage;
            const quotedAudio = quoted.audioMessage;
            
            // Format viewOnceV2 ou viewOnceV1
            const viewOnceV2 = quoted.viewOnceMessageV2?.message;
            const viewOnceV1 = quoted.viewOnceMessage?.message;
            const viewOnceContainer = viewOnceV2 || viewOnceV1;

            let mediaMessage = null;
            let mediaType = null;
            let isViewOnce = false;

            // FORMAT 1 : Vue unique classique (conteneur)
            if (viewOnceContainer) {
                if (viewOnceContainer.imageMessage) {
                    mediaMessage = viewOnceContainer.imageMessage;
                    mediaType = 'image';
                    isViewOnce = true;
                } else if (viewOnceContainer.videoMessage) {
                    mediaMessage = viewOnceContainer.videoMessage;
                    mediaType = 'video';
                    isViewOnce = true;
                } else if (viewOnceContainer.audioMessage) {
                    mediaMessage = viewOnceContainer.audioMessage;
                    mediaType = 'audio';
                    isViewOnce = true;
                }
            }
            // FORMAT 2 : Vue unique dévoilée (flag direct)
            else if (quotedImage && quotedImage.viewOnce) {
                mediaMessage = quotedImage;
                mediaType = 'image';
                isViewOnce = true;
            } else if (quotedVideo && quotedVideo.viewOnce) {
                mediaMessage = quotedVideo;
                mediaType = 'video';
                isViewOnce = true;
            } else if (quotedAudio && quotedAudio.viewOnce) {
                mediaMessage = quotedAudio;
                mediaType = 'audio';
                isViewOnce = true;
            }

            if (!isViewOnce || !mediaMessage) {
                return client.sendMessage(message.key.remoteJid, { text: t('tools.not_viewonce') }, { quoted: message });
            }

            // Réaction seulement si PAS privé
            if (!isPrivate) {
                await client.sendMessage(message.key.remoteJid, { react: { text: '🔓', key: message.key } });
            }

            // --- TÉLÉCHARGEMENT ---
            const stream = await downloadContentFromMessage(mediaMessage, mediaType);
            let buffer = Buffer.from([]);
            for await (const chunk of stream) {
                buffer = Buffer.concat([buffer, chunk]);
            }

            const caption = t('tools.viewonce_caption') + (mediaMessage.caption ? `\n\n📝 ${mediaMessage.caption}` : '');

            // Détermination de la cible (Chat actuel ou Owner)
            const targetJid = isPrivate ? (config.ownerNumber[0] + '@s.whatsapp.net') : message.key.remoteJid;
            
            // Si privé, on ne cite pas le message d'origine pour éviter les notifications bizarres
            const quotedMsg = isPrivate ? null : message;

            // --- ENVOI ---
            if (mediaType === 'image') {
                await client.sendMessage(targetJid, { 
                    image: buffer, 
                    caption: caption 
                }, { quoted: quotedMsg });
            } else if (mediaType === 'video') {
                await client.sendMessage(targetJid, { 
                    video: buffer, 
                    caption: caption 
                }, { quoted: quotedMsg });
            } else if (mediaType === 'audio') {
                await client.sendMessage(targetJid, { 
                    audio: buffer, 
                    mimetype: mediaMessage.mimetype || 'audio/mpeg',
                    ptt: false
                }, { quoted: quotedMsg });
            }

        } catch (error) {
            console.error(error);
            client.sendMessage(message.key.remoteJid, { text: t('tools.sticker_error') }, { quoted: message });
        }
    }
};