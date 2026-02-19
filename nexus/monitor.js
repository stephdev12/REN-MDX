// 🛡️ NEXUS - MONITOR (PROTECTIONS COMPLÈTES)
const { getGroupSettings } = require('../lib/database');
const { isAdmin, normalizeJid } = require('../lib/authHelper');
const { t } = require('../lib/language');

const LINK_REGEX = /(https?:\/\/)?(chat\.whatsapp\.com\/[0-9A-Za-z]{20,24}|wa\.me\/\d+)/i;

// Emojis pour AutoReact
const REACT_EMOJIS = ['👍', '❤️', '😂', '😮', '🙏', '🔥', '✨', '💯', '👀', '🤔'];

// --- 1. SURVEILLANCE DES MESSAGES ---
async function monitorMessage(sock, m) {
    try {
        const message = m.messages[0];
        if (!message) return;

        const chatId = message.key.remoteJid;
        if (!chatId.endsWith('@g.us')) return;

        const sender = message.key.participant || message.participant;
        if (message.key.fromMe) return;

        const body = message.message?.conversation || message.message?.extendedTextMessage?.text || message.message?.imageMessage?.caption || "";
        
        const settings = getGroupSettings(chatId);
        const userIsAdmin = await isAdmin(sock, chatId, sender);
        
        // --- AUTOREACT ---
        if (settings.autoreact && !message.key.fromMe) {
            const randomEmoji = REACT_EMOJIS[Math.floor(Math.random() * REACT_EMOJIS.length)];
            await sock.sendMessage(chatId, { react: { text: randomEmoji, key: message.key } });
        }

        if (userIsAdmin) return;

        // --- A. ANTILINK ---
        if (settings.antilink && LINK_REGEX.test(body)) {
            await sock.sendMessage(chatId, { delete: message.key });
            if (settings.antilinkAction === 'kick') {
                await sock.groupParticipantsUpdate(chatId, [sender], 'remove');
                await sock.sendMessage(chatId, { text: t('group.link_kick', { user: sender.split('@')[0] }) }, { mentions: [sender] });
            } else {
                await sock.sendMessage(chatId, { text: t('group.link_detected') });
            }
            return;
        }

        // --- B. ANTI-BADWORD ---
        if (settings.antibadword && settings.badwords.length > 0) {
            const isBad = settings.badwords.some(word => body.toLowerCase().includes(word.toLowerCase()));
            if (isBad) {
                await sock.sendMessage(chatId, { delete: message.key });
                await sock.sendMessage(chatId, { text: t('group.badword_detected') });
                return;
            }
        }

        // --- C. ANTI-TAG ---
        const mentions = message.message?.extendedTextMessage?.contextInfo?.mentionedJid || [];
        if (settings.antitag && mentions.length > 5) {
            await sock.sendMessage(chatId, { delete: message.key });
            await sock.groupParticipantsUpdate(chatId, [sender], 'remove');
            await sock.sendMessage(chatId, { text: t('group.tag_detected') });
            return;
        }

        // --- D. ANTI-MEDIA ---
        if (settings.antimedia && message.message) {
            const msgType = Object.keys(message.message)[0];
            const mediaTypes = ['imageMessage', 'videoMessage', 'stickerMessage', 'audioMessage', 'documentMessage'];
            if (mediaTypes.includes(msgType)) {
                await sock.sendMessage(chatId, { delete: message.key });
                return;
            }
        }

        // --- E. ANTI-TRANSFERT ---
        const contextInfo = message.message?.extendedTextMessage?.contextInfo || message.message?.imageMessage?.contextInfo || message.message?.videoMessage?.contextInfo;
        if (settings.antitransfert && contextInfo?.isForwarded) {
             await sock.sendMessage(chatId, { delete: message.key });
             await sock.sendMessage(chatId, { text: t('group.transfer_detected') });
             return;
        }

        // --- F. ANTI-SPAM ---
        if (settings.antispam && body.length > 3000) {
            await sock.sendMessage(chatId, { delete: message.key });
            await sock.groupParticipantsUpdate(chatId, [sender], 'remove');
            return;
        }

    } catch (e) {
        console.error("Erreur Monitor Message:", e);
    }
}

// --- 2. SURVEILLANCE DES ÉVÉNEMENTS GROUPE ---
async function monitorGroupUpdate(sock, update) {
    try {
        const { id, participants, action } = update;
        const settings = getGroupSettings(id);
        
        // --- G. ANTI-PROMOTE ---
        if (settings.antipromote && action === 'promote') {
            const author = update.author || update.actor; 
            if (!author) return;

            const botId = normalizeJid(sock.user.id);
            if (normalizeJid(author) === botId) return;

            const config = require('../config');
            if (config.ownerNumber.some(n => author.includes(n))) return;

            for (const participant of participants) {
                await sock.groupParticipantsUpdate(id, [participant], 'demote');
            }
            await sock.groupParticipantsUpdate(id, [author], 'demote');
            await sock.sendMessage(id, { text: t('group.promote_detected') });
        }

        // --- H. ANTI-DEMOTE ---
        if (settings.antidemote && action === 'demote') {
            const author = update.author || update.actor;
            if (!author) return;

            const botId = normalizeJid(sock.user.id);
            if (normalizeJid(author) === botId) return;

            const config = require('../config');
            if (config.ownerNumber.some(n => author.includes(n))) return;

            for (const participant of participants) {
                await sock.groupParticipantsUpdate(id, [participant], 'promote');
            }
            await sock.groupParticipantsUpdate(id, [author], 'demote');
            await sock.sendMessage(id, { text: t('group.demote_detected') });
        }

        // --- I. WELCOME ---
        if (settings.welcome && action === 'add') {
            for (const participant of participants) {
                const ppUrl = await sock.profilePictureUrl(participant, 'image').catch(() => 'https://i.postimg.cc/8cKZBMZw/lv-0-20251105211949.jpg');
                const metadata = await sock.groupMetadata(id);
                
                let text = settings.welcomeMessage || "Bienvenue @user dans @group !";
                text = text.replace('@user', `@${participant.split('@')[0]}`);
                text = text.replace('@group', metadata.subject);
                text = text.replace('@desc', metadata.desc || 'Pas de description');

                await sock.sendMessage(id, { 
                    image: { url: ppUrl }, 
                    caption: text,
                    mentions: [participant]
                });
            }
        }

    } catch (e) {
        console.error("Erreur Monitor Group:", e);
    }
}

module.exports = { monitorMessage, monitorGroupUpdate };