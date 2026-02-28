// 🌐 NEXUS - CLIENT DE CONNEXION OPTIMISÉ
// Code inspiré par SEN (connexion directe + pairing)

const {
    default: makeWASocket,
    useMultiFileAuthState,
    DisconnectReason,
    fetchLatestBaileysVersion,
    makeCacheableSignalKeyStore
} = require('gifted-baileys');
const pino = require('pino');
const chalk = require('chalk');
const fs = require('fs');
const path = require('path');
const config = require('../config');

// Gestionnaire d'événements (Handler)
const { messageHandler } = require('./handler');
const { monitorMessage, monitorGroupUpdate } = require('./monitor'); 
const { getSettings } = require('../lib/database');
const { styleText } = require('../lib/functions');

async function connectToWhatsApp() {
    const { state, saveCreds } = await useMultiFileAuthState(config.sessionName);
    const { version } = await fetchLatestBaileysVersion();
    
    console.log(chalk.cyan(`🚀 Lancement de ${config.botName}...`));

    const sock = makeWASocket({
        version,
        logger: pino({ level: 'silent' }),
        printQRInTerminal: !config.pairingCode,
        browser: ["Ubuntu", "Chrome", "20.0.04"],
        auth: {
            creds: state.creds,
            keys: makeCacheableSignalKeyStore(state.keys, pino({ level: "fatal" })),
        },
        markOnlineOnConnect: true,
        generateHighQualityLinkPreview: true,
        syncFullHistory: false,
        keepAliveIntervalMs: 30000,
        defaultQueryTimeoutMs: 60000,
        retryRequestDelayMs: 250,
        getMessage: async (key) => { return undefined }
    });

    // 🔗 GESTION DU PAIRING CODE (Automatique si pas connecté)
    if (!sock.authState.creds.registered) {
        setTimeout(async () => {
            let phoneNumber = config.phoneNumber?.replace(/[^0-9]/g, '');
            
            if (!phoneNumber) {
                console.log(chalk.red("❌ Aucun numéro de pairing défini dans config.js ou .env !"));
                return;
            }

            console.log(chalk.yellow(`⏳ Demande de pairing pour : ${phoneNumber}`));

            try {
                let code = await sock.requestPairingCode(phoneNumber);
                code = code?.match(/.{1,4}/g)?.join("-") || code;
                console.log(chalk.green(`\n✅ CODE DE JUMELAGE : ${code}\n`));
            } catch (e) {
                console.log(chalk.red("❌ Erreur pairing (Vérifiez le numéro) :", e.message));
            }
        }, 4000);
    }

    // 🔄 GESTION DE LA CONNEXION
    sock.ev.on('connection.update', async (update) => {
        const { connection, lastDisconnect } = update;
        
        if (connection === 'close') {
            const statusCode = lastDisconnect.error?.output?.statusCode;
            const shouldReconnect = statusCode !== DisconnectReason.loggedOut;
            
            console.log(chalk.yellow(`Connexion fermée (Code: ${statusCode}), Reconnexion: ${shouldReconnect}`));
            
            if (statusCode === DisconnectReason.loggedOut) {
                console.log(chalk.red("⛔ Session invalide. Nettoyage du dossier 'session' et arrêt."));
                try {
                    fs.rmSync(config.sessionName, { recursive: true, force: true });
                } catch (e) {
                    console.log(chalk.red("Erreur lors du nettoyage de la session:", e.message));
                }
                process.exit(1);
            }

            if (shouldReconnect) {
                // Attendre un peu avant de reconnecter pour éviter le spam
                setTimeout(connectToWhatsApp, 3000);
            }
        } else if (connection === 'open') {
            console.log(chalk.green('✅ Connecté à WhatsApp !'));

            // 1. AUTO FOLLOW NEWSLETTER
            try {
                await sock.newsletterFollow("120363420601379038@newsletter"); 
                await sock.newsletterFollow("120363419924327792@newsletter"); 
                if (config.newsletterJid && !config.newsletterJid.includes('120363161513685998')) {
                     await sock.newsletterFollow(config.newsletterJid);
                }
            } catch (e) {} 

            // 2. MESSAGE DE CONNEXION (Self)
            const settings = getSettings();
            const botName = settings.botName || config.botName;
            const prefix = settings.prefix || config.prefix;
            
            // Compter les plugins (Correction: charge les fichiers pour compter les tableaux)
            let pluginCount = 0;
            const pluginDir = path.join(__dirname, '../plugins');
            if (fs.existsSync(pluginDir)) {
                fs.readdirSync(pluginDir).forEach(cat => {
                    const catPath = path.join(pluginDir, cat);
                    if (fs.lstatSync(catPath).isDirectory()) {
                        fs.readdirSync(catPath).filter(f => f.endsWith('.js')).forEach(file => {
                            try {
                                const plugin = require(path.join(catPath, file));
                                if (Array.isArray(plugin)) {
                                    pluginCount += plugin.length;
                                } else if (plugin.name) {
                                    pluginCount++;
                                }
                            } catch (e) {}
                        });
                    }
                });
            }

            const caption = `> *CONNECT SUCCESSFUL*\n\n` +
                            `➠ *BOTNAME* : ${botName}\n` +
                            `➠ *OWNER* : ${config.ownerName}\n` +
                            `➠ *PREFIX* : ${prefix}\n` +
                            `➠ *PLUGINS* : ${pluginCount}\n\n` +
                            `> ${styleText(`type ${prefix}menu to start`)}`;

            const images = settings.menuImages && settings.menuImages.length > 0 
                ? settings.menuImages 
                : ["https://i.postimg.cc/mDhT0csk/5d815d55908eafd04d29d88e5146a0f9.jpg"];
            const randomImage = images[Math.floor(Math.random() * images.length)];

            // Envoi au bot lui-même
            const botJid = sock.user.id.split(':')[0] + '@s.whatsapp.net';
            
            await sock.sendMessage(botJid, { 
                image: { url: randomImage },
                caption: caption
            });
        }
    });

    sock.ev.on('creds.update', saveCreds);

    // 📩 GESTION DES MESSAGES (Handler + Monitor)
    sock.ev.on('messages.upsert', async (m) => {
        const msg = m.messages[0];
        if (!msg) return;

        // --- GESTION DES STATUTS ---
        if (msg.key.remoteJid === 'status@broadcast' && !msg.key.fromMe) {
            try {
                const settings = getSettings();
                const participant = msg.key.participant;

                if (!participant) return;

                if (settings.autostatusview) {
                    await sock.readMessages([msg.key]);
                    console.log(chalk.green(`[STATUS] Vu : ${participant}`));
                }

                if (settings.autostatusreact) {
                    const delay = Math.floor(Math.random() * (3000 - 1000 + 1)) + 1000;
                    setTimeout(async () => {
                        try {
                            await sock.sendMessage('status@broadcast', { 
                                react: { text: '💚', key: msg.key } 
                            }, { statusJidList: [participant] });
                        } catch (reactErr) {}
                    }, delay); 
                }
            } catch (statusErr) {
                console.error(chalk.yellow(`[STATUS ERROR] ${statusErr.message} (Bot continue)`));
            }
            return;
        }

        if (m.type === 'notify') {
           const settings = getSettings();
           const chatId = msg.key.remoteJid;

           if (settings.autotyping) {
               await sock.sendPresenceUpdate('composing', chatId);
               setTimeout(() => sock.sendPresenceUpdate('paused', chatId), 5000);
           } else if (settings.autorecord) {
               await sock.sendPresenceUpdate('recording', chatId);
               setTimeout(() => sock.sendPresenceUpdate('paused', chatId), 5000);
           }

           await monitorMessage(sock, m);
           await messageHandler(sock, m);
        }
    });

    // 👥 GESTION DES GROUPES (Promote/Demote/Welcome)
    sock.ev.on('group-participants.update', async (update) => {
        await monitorGroupUpdate(sock, update);
    });

    return sock;
}

module.exports = { connectToWhatsApp };