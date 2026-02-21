// 📣 Plugin: GSTATUS (Gifted Baileys Style)
// Envoie un statut directement dans le groupe

const { downloadContentFromMessage } = require('gifted-baileys');

module.exports = {
    name: 'gstatus',
    aliases: ['bg', 'broadcastgroup'],
    category: 'group',
    description: 'Envoie un statut aux membres du groupe',
    usage: '.gstatus (répondre à un média/texte)',
    
    groupOnly: true,
    adminOnly: true,

    execute: async (client, message, args) => {
        const quoted = message.message?.extendedTextMessage?.contextInfo?.quotedMessage;
        const targetMessage = quoted || message.message;
        
        // Pas de message ?
        if (!quoted && !args.length) {
            return client.sendMessage(message.key.remoteJid, { text: '> *ERREUR* : Répondez à un média ou écrivez un texte.' });
        }

        await client.sendMessage(message.key.remoteJid, { react: { text: '⏳', key: message.key } });

        try {
            const chatId = message.key.remoteJid;
            let statusContent = {};

            // 1. Image
            if (targetMessage.imageMessage) {
                const stream = await downloadContentFromMessage(targetMessage.imageMessage, 'image');
                let buffer = Buffer.from([]);
                for await (const chunk of stream) buffer = Buffer.concat([buffer, chunk]);

                statusContent = { 
                    image: buffer, 
                    caption: targetMessage.imageMessage.caption || args.join(' ') 
                };
            } 
            // 2. Vidéo
            else if (targetMessage.videoMessage) {
                const stream = await downloadContentFromMessage(targetMessage.videoMessage, 'video');
                let buffer = Buffer.from([]);
                for await (const chunk of stream) buffer = Buffer.concat([buffer, chunk]);

                statusContent = { 
                    video: buffer, 
                    caption: targetMessage.videoMessage.caption || args.join(' ') 
                };
            }
            // 3. Audio
            else if (targetMessage.audioMessage) {
                const stream = await downloadContentFromMessage(targetMessage.audioMessage, 'audio');
                let buffer = Buffer.from([]);
                for await (const chunk of stream) buffer = Buffer.concat([buffer, chunk]);

                statusContent = { 
                    audio: buffer, 
                    mimetype: 'audio/mp4', // Recommandé pour les statuts audio
                    ptt: true // Note vocale
                };
            }
            // 4. Texte
            else {
                const text = quoted ? (quoted.conversation || quoted.extendedTextMessage?.text) : args.join(' ');
                statusContent = { 
                    text: text,
                    backgroundColor: '#000000', // Fond noir
                    font: 1
                };
            }

            // Envoi via la méthode Gifted Baileys
            await client.sendMessage(chatId, { 
                groupStatusMessage: statusContent 
            });

            await client.sendMessage(message.key.remoteJid, { react: { text: '✅', key: message.key } });

        } catch (e) {
            console.error(e);
            await client.sendMessage(message.key.remoteJid, { text: '> *ERREUR* : Échec de l\'envoi du statut.' });
        }
    }
};