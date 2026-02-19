// 🧠 STORE - Mémoire Temporaire
// Sert à gérer les commandes interactives (réponses 1, 2, 3...)

const commandStore = new Map();

// Sauvegarder un contexte (ex: l'utilisateur X attend un choix pour la vidéo Y)
function saveRequest(userId, chatId, data) {
    const key = `${userId}-${chatId}`;
    commandStore.set(key, { ...data, timestamp: Date.now() });
}

// Récupérer le contexte
function getRequest(userId, chatId) {
    const key = `${userId}-${chatId}`;
    return commandStore.get(key);
}

// Supprimer le contexte
function deleteRequest(userId, chatId) {
    const key = `${userId}-${chatId}`;
    commandStore.delete(key);
}

// Nettoyage automatique toutes les 5 minutes
setInterval(() => {
    const now = Date.now();
    commandStore.forEach((value, key) => {
        if (now - value.timestamp > 5 * 60 * 1000) { // 5 minutes
            commandStore.delete(key);
        }
    });
}, 60000);

module.exports = { saveRequest, getRequest, deleteRequest };