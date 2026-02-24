// 💾 Plugin: MEDIA STORAGE (Personnel)
// Sauvegarde et relecture de médias (Audio/Vidéo)

const fs = require('fs-extra');
const path = require('path');
const { downloadContentFromMessage } = require('gifted-baileys');
const { t } = require('../../lib/language');
const { normalizeJid } = require('../../lib/authHelper');

const MEDIA_BASE_DIR = path.join(__dirname, '../../data/user_media');

// Helper pour le dossier utilisateur
const ensureDir = async (userId) => {
    const cleanId = normalizeJid(userId);
    const userDir = path.join(MEDIA_BASE_DIR, cleanId);
    await fs.ensureDir(userDir);
    return userDir;
};

module.exports = [
    {
        name: 'store',
        aliases: ['save'],
        category: 'media',
        description: 'Sauvegarde un média (Owner uniquement)',
        usage: '.store <nom>',
        ownerOnly: true,

        execute: async (client, message, args) => {
            const quoted = message.message?.extendedTextMessage?.contextInfo?.quotedMessage;
            
            // Vérification média
            if (!quoted || (!quoted.audioMessage && !quoted.videoMessage)) {
                return client.sendMessage(message.key.remoteJid, { text: t('tools.no_media') });
            }

            const name = args[0];
            if (!name) {
                return client.sendMessage(message.key.remoteJid, { text: t('owner.error_arg') });
            }

            await client.sendMessage(message.key.remoteJid, { react: { text: '💾', key: message.key } });
            
            const sender = message.key.fromMe 
                ? client.user.id
                : (message.key.participant || message.key.remoteJid);

            const userDir = await ensureDir(sender);
            
            const isVideo = !!quoted.videoMessage;
            const ext = isVideo ? '.mp4' : '.mp3';
            const filePath = path.join(userDir, name.toLowerCase() + ext);

            // Téléchargement
            const type = isVideo ? 'video' : 'audio';
            const stream = await downloadContentFromMessage(quoted[type + 'Message'], type);
            let buffer = Buffer.from([]);
            for await (const chunk of stream) {
                buffer = Buffer.concat([buffer, chunk]);
            }

            await fs.writeFile(filePath, buffer);
            
            await client.sendMessage(message.key.remoteJid, { text: `> *STORE* : ${name}${ext} sauvegardé.` }, { quoted: message });
        }
    },
    {
        name: 'ad',
        aliases: [],
        category: 'media',
        description: 'Joue un audio sauvegardé',
        usage: '.ad <nom>',
        ownerOnly: true,

        execute: async (client, message, args) => {
            const name = args[0];
            if (!name) return client.sendMessage(message.key.remoteJid, { text: t('owner.error_arg') });
            
            const sender = message.key.fromMe 
                ? client.user.id
                : (message.key.participant || message.key.remoteJid);

            const userDir = await ensureDir(sender);
            const mp3Path = path.join(userDir, name.toLowerCase() + '.mp3');
            
            if (!fs.existsSync(mp3Path)) {
                return client.sendMessage(message.key.remoteJid, { text: '> *ERREUR* : Fichier introuvable.' });
            }

            await client.sendMessage(message.key.remoteJid, { react: { text: '🎵', key: message.key } });

            const fileBuffer = await fs.readFile(mp3Path);
            await client.sendMessage(message.key.remoteJid, { 
                audio: fileBuffer, 
                mimetype: 'audio/mpeg', 
                ptt: false 
            }, { quoted: message });
        }
    },
    {
        name: 'vd',
        aliases: ['video'],
        category: 'media',
        description: 'Joue une vidéo sauvegardée',
        usage: '.vd <nom>',
        ownerOnly: true,

        execute: async (client, message, args) => {
            const name = args[0];
            if (!name) return client.sendMessage(message.key.remoteJid, { text: t('owner.error_arg') });
            
            const sender = message.key.fromMe 
                ? client.user.id
                : (message.key.participant || message.key.remoteJid);

            const userDir = await ensureDir(sender);
            const mp4Path = path.join(userDir, name.toLowerCase() + '.mp4');
            
            if (!fs.existsSync(mp4Path)) {
                return client.sendMessage(message.key.remoteJid, { text: '> *ERREUR* : Fichier introuvable.' });
            }

            await client.sendMessage(message.key.remoteJid, { react: { text: '🎬', key: message.key } });

            const fileBuffer = await fs.readFile(mp4Path);
            await client.sendMessage(message.key.remoteJid, { 
                video: fileBuffer, 
                caption: `> *VIDEO* : ${name}`,
                gifPlayback: false
            }, { quoted: message });
        }
    },
    {
        name: 'listmedia',
        aliases: ['medialist'],
        category: 'media',
        description: 'Liste les médias sauvegardés',
        usage: '.listmedia',
        ownerOnly: true,

        execute: async (client, message, args) => {
            const sender = message.key.fromMe 
                ? client.user.id
                : (message.key.participant || message.key.remoteJid);

            const userDir = await ensureDir(sender);
            const files = await fs.readdir(userDir);

            if (files.length === 0) {
                return client.sendMessage(message.key.remoteJid, { text: '> *MEDIA* : Vide.' });
            }
            
            let text = `> *LISTE MEDIA* (${files.length})\n\n`;
            files.forEach((f, i) => {
                text += `*${i + 1}.* ${f}\n`;
            });
            
            await client.sendMessage(message.key.remoteJid, { text }, { quoted: message });
        }
    },
    {
        name: 'delmedia',
        aliases: ['deletemedia'],
        category: 'media',
        description: 'Supprime un média',
        usage: '.delmedia <nom>',
        ownerOnly: true,

        execute: async (client, message, args) => {
            const name = args[0];
            if (!name) return client.sendMessage(message.key.remoteJid, { text: t('owner.error_arg') });
            
            const sender = message.key.fromMe 
                ? client.user.id
                : (message.key.participant || message.key.remoteJid);
                
            const userDir = await ensureDir(sender);
            
            let deleted = false;
            
            // Tente de supprimer mp3 et mp4
            try { 
                if (fs.existsSync(path.join(userDir, name + '.mp3'))) {
                    await fs.unlink(path.join(userDir, name + '.mp3'));
                    deleted = true;
                }
            } catch {} 
            
            try { 
                if (fs.existsSync(path.join(userDir, name + '.mp4'))) {
                    await fs.unlink(path.join(userDir, name + '.mp4'));
                    deleted = true;
                }
            } catch {} 

            if (deleted) {
                await client.sendMessage(message.key.remoteJid, { text: `> *SUCCÈS* : ${name} supprimé.` }, { quoted: message });
            } else {
                await client.sendMessage(message.key.remoteJid, { text: '> *ERREUR* : Fichier introuvable.' });
            }
        }
    }
];