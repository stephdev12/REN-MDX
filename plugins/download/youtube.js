// 🎵 Plugin: YOUTUBE (Play & Search) - OPTIMISÉ
const yts = require('yt-search');
const axios = require('axios');
const config = require('../../config');
const { styleText } = require('../../lib/functions');
const { saveRequest, deleteRequest } = require('../../lib/store');
const { normalizeJid } = require('../../lib/authHelper');
const { t } = require('../../lib/language');

// Fonction de téléchargement (Interne)
async function downloadMedia(client, chatId, message, url, type) {
    try {
        // 1. Réaction : Téléchargement en cours
        await client.sendMessage(chatId, { react: { text: '⬇️', key: message.key } });
        
        // API SEN (David Cyril)
        const { data } = await axios.get(`https://apis.davidcyril.name.ng/download/ytmp3?url=${encodeURIComponent(url)}`);
        
        if (!data.success) throw new Error('API Error');

        // 2. Réaction : Envoi en cours
        await client.sendMessage(chatId, { react: { text: '⬆️', key: message.key } });

        const mediaUrl = type === 'video' ? data.result.video_url : data.result.download_url;
        const mimetype = type === 'video' ? 'video/mp4' : 'audio/mpeg';
        const fileName = `${data.result.title}.${type === 'video' ? 'mp4' : 'mp3'}`;

        if (type === 'document') {
            await client.sendMessage(chatId, {
                document: { url: mediaUrl },
                mimetype: mimetype,
                fileName: fileName,
                caption: `> ${data.result.title}`
            }, { quoted: message });
        } else if (type === 'video') {
            await client.sendMessage(chatId, {
                video: { url: mediaUrl },
                caption: `> ${data.result.title}`,
                gifPlayback: false
            }, { quoted: message });
        } else {
            // Audio
            await client.sendMessage(chatId, {
                audio: { url: mediaUrl },
                mimetype: 'audio/mpeg',
                ptt: false 
            }, { quoted: message });
        }

        // 3. Réaction : Terminé
        await client.sendMessage(chatId, { react: { text: '✅', key: message.key } });

    } catch (e) {
        console.error("Youtube DL Error:", e);
        await client.sendMessage(chatId, { react: { text: '❌', key: message.key } });
        client.sendMessage(chatId, { text: t('download.error') }, { quoted: message });
    }
}

module.exports = [
    {
        name: 'play',
        aliases: ['song'],
        category: 'download',
        description: 'Télécharge une musique/vidéo via recherche',
        usage: '.play <titre>',

        execute: async (client, message, args) => {
            const query = args.join(' ');
            if (!query) return client.sendMessage(message.key.remoteJid, { text: t('download.no_query') }, { quoted: message });

            await client.sendMessage(message.key.remoteJid, { react: { text: '🔍', key: message.key } });

            const search = await yts(query);
            if (!search.videos.length) return client.sendMessage(message.key.remoteJid, { text: t('download.no_result') }, { quoted: message });

            const video = search.videos[0];
            const botName = config.botName;

            const text = `*TITRE* : ${video.title}\n` +
                         `*AUTEUR* : ${video.author.name}\n` +
                         `*DURÉE* : ${video.timestamp}\n\n` +
                         `➠ choisissez\n\n` +
                         `1- *audio*\n` +
                         `2- *video*\n` +
                         `3- *document*\n\n` +
                         `> ${styleText('powered by ' + botName)}`;

            // On envoie le message et on récupère son ID
            const msg = await client.sendMessage(message.key.remoteJid, {
                image: { url: video.thumbnail },
                caption: text
            }, { quoted: message });

            // Sauvegarde du contexte (ID Utilisateur + Chat ID)
            const userId = message.key.fromMe 
                ? normalizeJid(client.user?.id || "")
                : normalizeJid(message.key.participant || message.key.remoteJid);

            console.log(`[DEBUG SAVE] Saving for: ${userId}`);

            saveRequest(userId, message.key.remoteJid, {
                command: 'play',
                url: video.url,
                title: video.title,
                originalMsgId: msg.key.id
            });
        },

        // Gestion de la réponse (1, 2, 3)
        handleResponse: async (client, message, body, context) => {
            const choice = body.trim();
            const chatId = message.key.remoteJid;
            
            // Validation du choix
            if (!['1', '2', '3'].includes(choice)) return; // On ignore les mauvaises réponses

            // Feedback immédiat
            await client.sendMessage(chatId, { react: { text: '⏳', key: message.key } });

            if (choice === '1') {
                await client.sendMessage(chatId, { text: t('download.downloading_audio') }, { quoted: message });
                await downloadMedia(client, chatId, message, context.url, 'audio');
            } 
            else if (choice === '2') {
                await client.sendMessage(chatId, { text: t('download.downloading_video') }, { quoted: message });
                await downloadMedia(client, chatId, message, context.url, 'video');
            } 
            else if (choice === '3') {
                await client.sendMessage(chatId, { text: t('download.downloading_doc') }, { quoted: message });
                await downloadMedia(client, chatId, message, context.url, 'document');
            } 
            
            // Nettoyage mémoire
            const userId = normalizeJid(message.key.participant || message.key.remoteJid);
            deleteRequest(userId, chatId);
        }
    },
    {
        name: 'youtube',
        aliases: ['yt', 'search'],
        category: 'download',
        description: 'Recherche YouTube',
        usage: '.yt <query>',

        execute: async (client, message, args) => {
            const query = args.join(' ');
            if (!query) return client.sendMessage(message.key.remoteJid, { text: t('download.no_query') }, { quoted: message });

            await client.sendMessage(message.key.remoteJid, { react: { text: '🔍', key: message.key } });

            const search = await yts(query);
            const videos = search.videos.slice(0, 5);

            let list = "";
            videos.forEach((v, i) => {
                list += `*${i + 1}.* ${v.title} (${v.timestamp})\n`;
            });

            const msg = await client.sendMessage(message.key.remoteJid, {
                text: t('download.yt_caption', { list }),
                contextInfo: { externalAdReply: { title: "YouTube Search", mediaType: 1, thumbnailUrl: videos[0].thumbnail, renderLargerThumbnail: true } }
            }, { quoted: message });

            const userId = normalizeJid(message.key.participant || message.key.remoteJid);
            saveRequest(userId, message.key.remoteJid, {
                command: 'youtube',
                results: videos
            });
        },

        handleResponse: async (client, message, body, context) => {
            const choice = parseInt(body.trim());
            const chatId = message.key.remoteJid;
            const userId = normalizeJid(message.key.participant || message.key.remoteJid);

            if (isNaN(choice) || choice < 1 || choice > context.results.length) return;

            const video = context.results[choice - 1];
            const botName = config.botName;

            // 1. On affiche le message de sélection (Comme .play)
            const text = t('download.play_caption', {
                title: video.title,
                author: video.author.name,
                duration: video.timestamp,
                credit: styleText('powered by ' + botName)
            });

            const msg = await client.sendMessage(chatId, {
                image: { url: video.thumbnail },
                caption: text
            }, { quoted: message });

            // 2. On met à jour le contexte pour passer la main à la commande 'play'
            // Le prochain chiffre (1, 2 ou 3) sera traité par play.handleResponse
            saveRequest(userId, chatId, {
                command: 'play', // Switch de commande !
                url: video.url,
                title: video.title,
                originalMsgId: msg.key.id
            });
        }
    }
];