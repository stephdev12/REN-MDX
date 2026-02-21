// 🚀 NEXUS - HANDLER (OPTIMISÉ v5 - DYNAMIQUE & MINIMALISTE)
const path = require('path');
const fs = require('fs');
const config = require('../config');
const chalk = require('chalk');
const { isAdmin, isOwner: checkIsOwner, isSudo, normalizeJid } = require('../lib/authHelper');
const { buildMessageOptions } = require('../lib/utils');
const { getSettings } = require('../lib/database');
const { getRequest, deleteRequest } = require('../lib/store'); // Import Store
const { t } = require('../lib/language'); // Import t()

// Chargement des plugins
const plugins = {};
const aliases = {};

function loadPlugins() {
    console.log(chalk.cyan('📥 Chargement des plugins...'));
    const pluginDir = path.join(__dirname, '../plugins');
    
    if (!fs.existsSync(pluginDir)) fs.mkdirSync(pluginDir);

    const categories = fs.readdirSync(pluginDir);
    categories.forEach(category => {
        const catPath = path.join(pluginDir, category);
        if (fs.lstatSync(catPath).isDirectory()) {
            fs.readdirSync(catPath).forEach(file => {
                if (file.endsWith('.js')) {
                    try {
                        const pluginModule = require(path.join(catPath, file));
                        // Supporte export unique OU tableau de commandes
                        const commands = Array.isArray(pluginModule) ? pluginModule : [pluginModule];

                        commands.forEach(plugin => {
                            if (plugin && plugin.name) {
                                plugins[plugin.name] = plugin;
                                if (plugin.aliases) {
                                    plugin.aliases.forEach(alias => aliases[alias] = plugin.name);
                                }
                            }
                        });
                    } catch (err) {
                        console.error(chalk.red(`Erreur chargement ${file}:`), err);
                    }
                }
            });
        }
    });
    console.log(chalk.cyan(`✅ ${Object.keys(plugins).length} plugins chargés.\n`));
}

// Handler de message
async function messageHandler(sock, m) {
    try {
        const message = m.messages[0];
        if (!message) return;

        // DEBUG : Voir ce qui arrive (à supprimer plus tard)
        // if (message.key.fromMe) console.log(`[FROM ME] Body: ${message.message?.conversation}`);

        // On accepte les messages du bot s'ils sont du texte (pour les choix interactifs)
        if (message.key.fromMe && !message.message?.conversation && !message.message?.extendedTextMessage) return;

        const chatId = message.key.remoteJid;
        const isGroup = chatId.endsWith('@g.us');
        
        // Détermination propre de l'expéditeur
        let sender;
        if (message.key.fromMe) {
            // Pour le bot, on prend l'ID de base sans suffixe (:device)
            sender = sock.user.id.split(':')[0] + '@s.whatsapp.net';
        } else {
            sender = isGroup ? (message.key.participant || message.participant) : chatId;
        }

        const body = message.message?.conversation || message.message?.extendedTextMessage?.text || message.message?.imageMessage?.caption || "";
        
        // --- 1. GESTION DES RÉPONSES INTERACTIVES (Store) ---
        let senderNum;
        if (message.key.fromMe) {
            senderNum = normalizeJid(sock.user?.id || "");
        } else {
            senderNum = normalizeJid(sender);
        }
        
        console.log(`[DEBUG STORE] Sender: ${senderNum} | Chat: ${chatId}`);
        const pendingRequest = getRequest(senderNum, chatId);
        console.log(`[DEBUG STORE] Result:`, pendingRequest ? "TROUVÉ" : "NULL");

        if (pendingRequest) {
            // Si c'est une nouvelle commande (commence par .), on annule la requête en cours
            const settings = getSettings();
            const prefix = settings.prefix || config.prefix;
            
            if (body.startsWith(prefix)) {
                deleteRequest(senderNum, chatId);
            } else {
                // Sinon, on traite la réponse
                const plugin = plugins[pendingRequest.command];
                if (plugin && plugin.handleResponse) {
                    await plugin.handleResponse(sock, message, body, pendingRequest);
                    return; // Stop ici, on a traité la réponse
                }
            }
        }

        // --- 2. GESTION DES COMMANDES CLASSIQUES ---
        const settings = getSettings();
        const prefix = settings.prefix || config.prefix;

        if (!body.startsWith(prefix)) return;

        const args = body.slice(prefix.length).trim().split(/ +/);
        const commandName = args.shift().toLowerCase();
        const pluginName = plugins[commandName] ? commandName : aliases[commandName];
        
        if (pluginName) {
            const plugin = plugins[pluginName];
            const senderNum = normalizeJid(sender);
            const isOwner = checkIsOwner(sock, message);
            const isUserSudo = isSudo(sender);

            // --- GESTION DU MODE PUBLIC/PRIVÉ ---
            // Si mode privé : Owner OU Sudo autorisé
            if (settings.mode === 'private' && !isOwner && !isUserSudo) {
                return; // Ignorer silencieusement
            }

            // --- VÉRIFICATIONS ---

            // 1. Owner Only (SILENT FAIL)
            if (plugin.ownerOnly && !isOwner) {
                return; // On ne fait RIEN. On ignore.
            }

            // 2. Group Only
            if (plugin.groupOnly && !isGroup) {
                return sock.sendMessage(chatId, { text: t('system.group_only') }, { quoted: message });
            }

            // 3. Admin Only
            if (plugin.adminOnly && isGroup) {
                const userIsAdmin = await isAdmin(sock, chatId, sender);
                if (!userIsAdmin && !isOwner) {
                    return sock.sendMessage(chatId, { text: t('system.admin_only') }, { quoted: message });
                }
            }

            // --- OPTIONS DE MESSAGE ---
            // On passe 'settings' à buildMessageOptions pour avoir les noms dynamiques
            const msgOptions = buildMessageOptions(plugin, settings);

            // 🚀 EXÉCUTION
            console.log(chalk.yellow(`[EXEC] ${pluginName} par ${senderNum}`));
            await plugin.execute(sock, message, args, msgOptions);
        }

    } catch (e) {
        console.error(chalk.red("Erreur Handler:"), e);
    }
}

module.exports = { loadPlugins, messageHandler };