// 📤 LIB: MEDIA UPLOADER
// Upload images/vidéos vers une URL publique

const axios = require('axios');
const fs = require('fs');
const FormData = require('form-data');
const { downloadContentFromMessage } = require('gifted-baileys');

// Fonction pour importer dynamiquement file-type (gère ESM et CJS)
async function getFileType(buffer) {
    try {
        // Tente d'importer dynamiquement (pour ESM file-type v17+)
        const ft = await import('file-type');
        const fileTypeFromBuffer = ft.fileTypeFromBuffer || ft.default?.fileTypeFromBuffer;
        return await fileTypeFromBuffer(buffer);
    } catch (e) {
        // Fallback CJS (pour file-type v16)
        const ft = require('file-type');
        return await ft.fileTypeFromBuffer(buffer);
    }
}

// Service 1: Telegra.ph (Images < 5MB)
async function telegraph(buffer) {
    try {
        const type = await getFileType(buffer);
        const ext = type ? type.ext : 'jpeg';

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
// Note: Catbox normal garde les fichiers, Litterbox les supprime. On utilise Catbox si possible.
async function catbox(buffer) {
    try {
        const type = await getFileType(buffer);
        const ext = type ? type.ext : 'bin';

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
        const stream = await downloadContentFromMessage(message[type], type.replace('Message', ''));
        let buffer = Buffer.from([]);
        for await (const chunk of stream) {
            buffer = Buffer.concat([buffer, chunk]);
        }

        // Essayer Telegra.ph (Images uniquement)
        if (type === 'imageMessage') {
            try {
                return await telegraph(buffer);
            } catch (e) {
                console.error('Telegraph fail, trying Catbox...');
            }
        }

        // Fallback Catbox (Tout type)
        return await catbox(buffer);

    } catch (error) {
        console.error('Upload Error:', error);
        return null;
    }
}

module.exports = { uploadMedia };