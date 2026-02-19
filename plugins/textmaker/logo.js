// 🎨 Plugin: TEXTMAKER (Logos)
// Génération de logos via Mumaker (Ephoto360) - Logique SEN

const mumaker = require('mumaker');
const axios = require('axios');
const { t } = require('../../lib/language');

// URLs Ephoto360
const EFFECTS = {
    'metallic': "https://en.ephoto360.com/impressive-decorative-3d-metal-text-effect-798.html",
    'ice': "https://en.ephoto360.com/ice-text-effect-online-101.html",
    'snow': "https://en.ephoto360.com/create-a-snow-3d-text-effect-free-online-621.html",
    'impressive': "https://en.ephoto360.com/create-3d-colorful-paint-text-effect-online-801.html",
    'matrix': "https://en.ephoto360.com/matrix-text-effect-154.html",
    'light': "https://en.ephoto360.com/light-text-effect-futuristic-technology-style-648.html",
    'neon': "https://en.ephoto360.com/create-colorful-neon-light-text-effects-online-797.html",
    'devil': "https://en.ephoto360.com/neon-devil-wings-text-effect-online-683.html",
    'purple': "https://en.ephoto360.com/purple-text-effect-online-100.html",
    'thunder': "https://en.ephoto360.com/thunder-text-effect-online-97.html",
    'leaves': "https://en.ephoto360.com/green-brush-text-effect-typography-maker-online-153.html",
    '1917': "https://en.ephoto360.com/1917-style-text-effect-523.html",
    'arena': "https://en.ephoto360.com/create-cover-arena-of-valor-by-mastering-360.html",
    'hacker': "https://en.ephoto360.com/create-anonymous-hacker-avatars-cyan-neon-677.html",
    'sand': "https://en.ephoto360.com/write-names-and-messages-on-the-sand-online-582.html",
    'glitch': "https://en.ephoto360.com/create-digital-glitch-text-effects-online-767.html",
    'fire': "https://en.ephoto360.com/flame-lettering-effect-372.html",
    'dragonball': "https://en.ephoto360.com/create-dragon-ball-style-text-effects-online-809.html",
    'foggyglass': "https://en.ephoto360.com/handwritten-text-on-foggy-glass-online-680.html",
    'foggyglassv2': "https://en.ephoto360.com/handwritten-text-on-foggy-glass-online-680.html",
    'naruto': "https://en.ephoto360.com/naruto-shippuden-logo-style-text-effect-online-808.html",
    'typo': "https://en.ephoto360.com/create-online-typography-art-effects-with-multiple-layers-811.html",
    'frost': "https://en.ephoto360.com/create-a-frozen-christmas-text-effect-online-792.html",
    'pixelglitch': "https://en.ephoto360.com/create-pixel-glitch-text-effect-online-769.html",
    'neonglitch': "https://en.ephoto360.com/create-impressive-neon-glitch-text-effects-online-768.html",
    'america': "https://en.ephoto360.com/free-online-american-flag-3d-text-effect-generator-725.html",
    'erase': "https://en.ephoto360.com/create-eraser-deleting-text-effect-online-717.html",
    'blackpink': "https://en.ephoto360.com/create-a-blackpink-neon-logo-text-effect-online-710.html",
    'starwars': "https://en.ephoto360.com/create-star-wars-logo-online-982.html",
    'bearlogo': "https://en.ephoto360.com/free-bear-logo-maker-online-673.html",
    'graffiti': "https://en.ephoto360.com/create-a-cartoon-style-graffiti-text-effect-online-668.html",
    'graffitiv2': "https://en.ephoto360.com/cute-girl-painting-graffiti-text-effect-667.html",
    'futuristic': "https://en.ephoto360.com/light-text-effect-futuristic-technology-style-648.html",
    'clouds': "https://en.ephoto360.com/write-text-effect-clouds-in-the-sky-online-619.html",
    
    // Spéciaux (2 textes)
    'pornhub': "https://en.ephoto360.com/create-pornhub-style-logos-online-free-549.html",
    'marvel': "https://en.ephoto360.com/create-thor-logo-style-text-effects-online-for-free-796.html",
    'captainamerica': "https://en.ephoto360.com/create-a-cinematic-captain-america-text-effect-online-715.html"
};

// Liste des commandes à générer
const COMMAND_NAMES = Object.keys(EFFECTS);

const commands = COMMAND_NAMES.map(effect => ({
    name: effect,
    aliases: [],
    category: 'textmaker',
    description: `Logo style ${effect}`,
    usage: `.${effect} <texte>`,

    execute: async (client, message, args) => {
        const text = args.join(' ');
        
        // Gestion des commandes à 2 textes (séparés par |)
        if (['pornhub', 'marvel', 'captainamerica'].includes(effect)) {
            const [text1, text2] = text.split('|').map(t => t.trim());
            if (!text1 || !text2) {
                return client.sendMessage(message.key.remoteJid, { text: `> *USAGE* : .${effect} Texte1 | Texte2` }, { quoted: message });
            }

            await client.sendMessage(message.key.remoteJid, { react: { text: '🎨', key: message.key } });

            try {
                const result = await mumaker.ephoto(EFFECTS[effect], [text1, text2]);
                if (result && result.image) {
                    await client.sendMessage(message.key.remoteJid, { 
                        image: { url: result.image }, 
                        caption: t('tools.effect_caption', { effect: effect.toUpperCase() })
                    }, { quoted: message });
                } else {
                    throw new Error('API Fail');
                }
            } catch (e) {
                console.error(e);
                client.sendMessage(message.key.remoteJid, { text: t('tools.sticker_error') }, { quoted: message });
            }
            return;
        }

        // Gestion standard (1 texte)
        if (!text) return client.sendMessage(message.key.remoteJid, { text: t('owner.usage', { usage: `.${effect} <texte>` }) }, { quoted: message });

        await client.sendMessage(message.key.remoteJid, { react: { text: '🎨', key: message.key } });

        try {
            const result = await mumaker.ephoto(EFFECTS[effect], text);
            
            if (result && result.image) {
                await client.sendMessage(message.key.remoteJid, { 
                    image: { url: result.image }, 
                    caption: t('tools.effect_caption', { effect: effect.toUpperCase() })
                }, { quoted: message });
            } else {
                throw new Error('API Fail');
            }

        } catch (e) {
            console.error(e);
            client.sendMessage(message.key.remoteJid, { text: t('tools.sticker_error') }, { quoted: message });
        }
    }
}));

module.exports = commands;