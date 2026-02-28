// 📤 LIB: MEDIA UPLOADER
// Upload images/vidéos vers une URL publique

const axios = require('axios');
const fs = require('fs');
const FormData = require('form-data');
const { downloadContentFromMessage } = require('gifted-baileys');

// Service 1: Telegra.ph (Images < 5MB)
async function telegraph(buffer, ext = 'jpeg') {
    try {
        const form = new FormData();
        form.append('file', buffer, `file.${ext}`);
        
        const { data } = await axios.post('https://telegra.ph/upload', form, {
            headers: form.getHeaders()
        });
        
        if (data && data[0] && data[0].src) {
            return 'https://telegra.ph' + data[0].src;
        }
        throw new Error('Telegra.ph failed');
    } catch (e) {
        throw e;
    }
}

// Service 2: Catbox.moe (Fichiers < 200MB, temporaire 1h-24h selon service)
async function catbox(buffer, ext = 'bin') {
    try {
        const form = new FormData();
        form.append('reqtype', 'fileupload');
        form.append('fileToUpload', buffer, `file.${ext}`);
        
        const { data } = await axios.post('https://catbox.moe/user/api.php', form, {
            headers: form.getHeaders()
        });
        
        if (data && data.startsWith('http')) {
            return data.trim();
        }
        throw new Error('Catbox failed');
    } catch (e) {
        throw e;
    }
}

// Fonction principale (Auto-switch)
async function uploadMedia(message) {
    try {
        const type = Object.keys(message)[0];
        const mediaObj = message[type];
        
        // Déduire l'extension depuis le mimetype au lieu d'utiliser file-type (plus robuste)
        const mime = mediaObj?.mimetype || 'image/jpeg';
        let ext = mime.split('/')[1]?.split(';')[0] || 'bin';
        if (ext === 'jpeg') ext = 'jpg';

        const stream = await downloadContentFromMessage(mediaObj, type.replace('Message', ''));
        let buffer = Buffer.from([]);
        for await (const chunk of stream) {
            buffer = Buffer.concat([buffer, chunk]);
        }

        // Essayer Telegra.ph (Images uniquement)
        if (type === 'imageMessage') {
            try {
                return await telegraph(buffer, ext);
            } catch (e) {
                console.error('Telegraph fail, trying Catbox...');
            }
        }

        // Fallback Catbox (Tout type)
        return await catbox(buffer, ext);

    } catch (error) {
        console.error('Upload Error:', error);
        return null;
    }
}

module.exports = { uploadMedia };