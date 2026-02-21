// ⬇️ Plugin: FILES (GDrive, Mediafire, APK)
// APIs: GiftedTech (Source: SEN)

const axios = require('axios');
const { t } = require('../../lib/language');
const API_KEY = 'gifted';

module.exports = [
    {
        name: 'gdrive',
        aliases: ['drive'],
        category: 'download',
        description: 'Téléchargement Google Drive',
        usage: '.gdrive <url>',
        execute: async (client, message, args) => {
            const url = args[0];
            if (!url) return client.sendMessage(message.key.remoteJid, { text: t('download.no_url') });

            await client.sendMessage(message.key.remoteJid, { react: { text: '⬇️', key: message.key } });

            try {
                const { data } = await axios.get(`https://api.giftedtech.co.ke/api/download/gdrivedl?apikey=${API_KEY}&url=${encodeURIComponent(url)}`);
                if (data.success) {
                    await client.sendMessage(message.key.remoteJid, { 
                        document: { url: data.result.download_url }, 
                        fileName: data.result.name, 
                        mimetype: 'application/octet-stream',
                        caption: `> *GDRIVE* : ${data.result.name}`
                    }, { quoted: message });
                } else throw new Error();
            } catch (e) {
                client.sendMessage(message.key.remoteJid, { text: t('download.error') });
            }
        }
    },
    {
        name: 'mediafire',
        aliases: ['mf'],
        category: 'download',
        description: 'Téléchargement Mediafire',
        usage: '.mediafire <url>',
        execute: async (client, message, args) => {
            const url = args[0];
            if (!url) return client.sendMessage(message.key.remoteJid, { text: t('download.no_url') });

            await client.sendMessage(message.key.remoteJid, { react: { text: '📦', key: message.key } });

            try {
                const { data } = await axios.get(`https://api.giftedtech.co.ke/api/download/mediafire?apikey=${API_KEY}&url=${encodeURIComponent(url)}`);
                if (data.success) {
                    await client.sendMessage(message.key.remoteJid, { 
                        document: { url: data.result.downloadUrl }, 
                        fileName: data.result.fileName, 
                        mimetype: data.result.mimeType,
                        caption: `> *MEDIAFIRE*\n> Fichier : ${data.result.fileName}\n> Taille : ${data.result.fileSize}`
                    }, { quoted: message });
                } else throw new Error();
            } catch (e) {
                client.sendMessage(message.key.remoteJid, { text: t('download.error') });
            }
        }
    },
    {
        name: 'apk',
        aliases: ['app'],
        category: 'download',
        description: 'Recherche & Téléchargement APK',
        usage: '.apk <nom>',
        execute: async (client, message, args) => {
            const name = args.join(' ');
            if (!name) return client.sendMessage(message.key.remoteJid, { text: t('download.no_query') });

            await client.sendMessage(message.key.remoteJid, { react: { text: '🤖', key: message.key } });

            try {
                const { data } = await axios.get(`https://api.giftedtech.co.ke/api/download/apkdl?apikey=${API_KEY}&appName=${encodeURIComponent(name)}`);
                if (data.success) {
                    await client.sendMessage(message.key.remoteJid, { 
                        document: { url: data.result.download_url }, 
                        fileName: `${data.result.appname}.apk`, 
                        mimetype: 'application/vnd.android.package-archive',
                        caption: `> *APK DOWNLOAD*\n> App : ${data.result.appname}\n> Dev : ${data.result.developer}`
                    }, { quoted: message });
                } else throw new Error();
            } catch (e) {
                client.sendMessage(message.key.remoteJid, { text: t('download.no_result') });
            }
        }
    }
];