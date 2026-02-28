// 🛠️ Plugin: STICKER (Version FFMPEG native)
// Convertit images/vidéos en stickers sans dépendances lourdes

const { downloadContentFromMessage } = require('gifted-baileys');
const { t } = require('../../lib/language');
const { extractMedia } = require('../../lib/utils');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

module.exports = {
    name: 'sticker',
    aliases: ['s', 'stick'],
    category: 'tools',
    description: 'Convertit une image/vidéo en sticker',
    usage: '.sticker (en réponse)',

    execute: async (client, message, args) => {
        try {
            const media = extractMedia(message);
            if (!media || !['imageMessage', 'videoMessage', 'stickerMessage'].includes(media.type)) {
                return client.sendMessage(message.key.remoteJid, { text: t('tools.no_media') });
            }

            await client.sendMessage(message.key.remoteJid, { react: { text: '⏳', key: message.key } });

            // Téléchargement
            const stream = await downloadContentFromMessage(media.message, media.type.replace('Message', ''));
            let buffer = Buffer.from([]);
            for await (const chunk of stream) {
                buffer = Buffer.concat([buffer, chunk]);
            }

            // Conversion FFMPEG "Manuelle" (Plus robuste sur les panels)
            const randomName = Math.floor(Math.random() * 10000);
            const inputPath = path.join(__dirname, `../../temp/${randomName}.${media.mime.split('/')[1] || 'jpeg'}`);
            const outputPath = path.join(__dirname, `../../temp/${randomName}.webp`);

            if (!fs.existsSync(path.join(__dirname, '../../temp'))) fs.mkdirSync(path.join(__dirname, '../../temp'));
            fs.writeFileSync(inputPath, buffer);

            // Commande FFMPEG magique pour WhatsApp Sticker
            // -vcodec libwebp : Codec WebP
            // -vf : Redimensionne en 512x512 en gardant le ratio et ajoute du padding transparent
            // -loop 0 : Animation infinie (pour les GIFs)
            // -ss 00:00:00 -t 00:00:05 : Max 5 secondes pour éviter les stickers trop lourds
            const ffmpegCmd = `ffmpeg -i "${inputPath}" -vcodec libwebp -filter:v "scale='min(320,iw)':min'(320,ih)':force_original_aspect_ratio=decrease,fps=15, pad=320:320:-1:-1:color=white@0.0, split [a][b]; [a] palettegen=reserve_transparent=on:transparency_color=ffffff [p]; [b][p] paletteuse" -loop 0 -ss 00:00:00 -t 00:00:05 -preset default -an -vsync 0 "${outputPath}"`;

            exec(ffmpegCmd, async (error) => {
                if (error) {
                    console.error("FFMPEG Error:", error);
                    try { fs.unlinkSync(inputPath); } catch (e) {}
                    return client.sendMessage(message.key.remoteJid, { text: t('tools.sticker_error') });
                }

                const stickerBuffer = fs.readFileSync(outputPath);
                await client.sendMessage(message.key.remoteJid, { sticker: stickerBuffer });
                
                // Nettoyage
                try {
                    fs.unlinkSync(inputPath);
                    fs.unlinkSync(outputPath);
                } catch (e) {}
            });

        } catch (error) {
            console.error(error);
            client.sendMessage(message.key.remoteJid, { text: t('tools.sticker_error') });
        }
    }
};