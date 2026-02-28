// 🛠️ UTILS - FONCTIONS AVANCÉES (DYNAMIQUE)
// Gestion des ContextInfos, AdReply et Newsletter

const config = require('../config');

function getNewsletterContext(settings = {}) {
    return {
        forwardingScore: 999,
        isForwarded: true,
        forwardedNewsletterMessageInfo: {
            // Priorité : DB > Config > Défaut
            newsletterJid: settings.newsletterJid || config.newsletterJid || '120363161513685998@newsletter',
            newsletterName: settings.botName || config.botName,
            serverMessageId: -1
        }
    };
}

function getAdReplyContext(settings = {}) {
    return {
        externalAdReply: {
            title: settings.botName || config.botName,
            body: "ʙʏ ꜱᴛᴇᴘʜᴛᴇᴄʜ",
            thumbnailUrl: config.logoUrl || 'https://i.postimg.cc/8cKZBMZw/lv-0-20251105211949.jpg',
            sourceUrl: 'https://whatsapp.com/channel/0029Vb6DrnUHAdNQtz2GC307',
            mediaType: 1,
            mediaUrl: 'https://whatsapp.com/channel/0029Vb6DrnUHAdNQtz2GC307',
            renderLargerThumbnail: true,
            showAdAttribution: true
        }
    };
}

function buildMessageOptions(command, settings = {}) {
    let contextInfo = {};

    if (command.newsletterShow) {
        Object.assign(contextInfo, getNewsletterContext(settings));
    }

    if (command.contextInfo) {
        Object.assign(contextInfo, getAdReplyContext(settings));
    }

    return Object.keys(contextInfo).length > 0 ? { contextInfo } : {};
}

// Extracteur robuste de média pour Baileys
function extractMedia(message) {
    if (!message) return null;
    
    const msg = message.message || message;
    const quoted = msg?.extendedTextMessage?.contextInfo?.quotedMessage;
    const target = quoted || msg;
    
    if (!target) return null;

    const mediaKeys = ['imageMessage', 'videoMessage', 'stickerMessage', 'audioMessage', 'documentMessage'];
    
    for (const key of Object.keys(target)) {
        if (mediaKeys.includes(key)) {
            return {
                type: key,
                message: target[key],
                mime: target[key]?.mimetype || ''
            };
        }
        if (key === 'viewOnceMessageV2' || key === 'viewOnceMessage') {
            const voMsg = target[key]?.message;
            if (voMsg) {
                for (const voKey of Object.keys(voMsg)) {
                    if (mediaKeys.includes(voKey)) {
                        return {
                            type: voKey,
                            message: voMsg[voKey],
                            mime: voMsg[voKey]?.mimetype || ''
                        };
                    }
                }
            }
        }
    }
    
    return null;
}

module.exports = {
    getNewsletterContext,
    getAdReplyContext,
    buildMessageOptions,
    extractMedia
};