// 🖼️ Plugin: MEDIA TOOLS
// Conversions d'images/stickers

const { downloadContentFromMessage } = require('gifted-baileys');
const { t } = require('../../lib/language');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const { getRandom } = require('../../lib/functions');

module.exports = [
    {
        name: 'toimg',
        aliases: ['img'],
        category: 'media',
        description: 'Sticker vers Image',
        usage: '.toimg (répondre à un sticker)',
        execute: async (client, message, args) => {
            const quoted = message.message?.extendedTextMessage?.contextInfo?.quotedMessage;
            if (!quoted || !quoted.stickerMessage) return client.sendMessage(message.key.remoteJid, { text: t('tools.no_media') });

            await client.sendMessage(message.key.remoteJid, { react: { text: '🔄', key: message.key } });

            try {
                const stream = await downloadContentFromMessage(quoted.stickerMessage, 'sticker');
                let buffer = Buffer.from([]);
                for await (const chunk of stream) buffer = Buffer.concat([buffer, chunk]);

                const inputPath = path.join(__dirname, `../../temp/${Math.floor(Math.random() * 10000)}.webp`);
                const outputPath = path.join(__dirname, `../../temp/${Math.floor(Math.random() * 10000)}.png`);

                fs.writeFileSync(inputPath, buffer);

                exec(`ffmpeg -i "${inputPath}" "${outputPath}"`, async (err) => {
                    fs.unlinkSync(inputPath);
                    if (err) return client.sendMessage(message.key.remoteJid, { text: t('tools.sticker_error') });

                    await client.sendMessage(message.key.remoteJid, { image: { url: outputPath } }, { quoted: message });
                    fs.unlinkSync(outputPath);
                });

            } catch (e) {
                client.sendMessage(message.key.remoteJid, { text: t('tools.sticker_error') });
            }
        }
    }
];