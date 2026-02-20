<p align="center">
  <img src="./ren.jpg" alt="REN-MDX" width="100%" style="border-radius: 10px;"/>
</p>

<h1 align="center">REN-MDX 🚀</h1>

<p align="center">
  <b>The Fast, Modular & Developer-Friendly WhatsApp Bot.</b><br>
  <i>Le Bot WhatsApp rapide, modulaire et facile pour les développeurs.</i>
</p>

<p align="center">
  <a href="https://github.com/stephdev12/REN-MDX/fork">
    <img src="https://img.shields.io/badge/FORK-REPO-black?style=for-the-badge&logo=github" alt="Fork Repo">
  </a>
  <a href="https://github.com/stephdev12/REN-MDX/archive/refs/heads/main.zip">
    <img src="https://img.shields.io/badge/DOWNLOAD-ZIP-blue?style=for-the-badge&logo=download" alt="Download Zip">
  </a>
</p>

<hr/>

## 🌟 Features / Fonctionnalités

- **⚡ Fast & Optimized:** Uses `gifted-baileys` with stripped history sync for instant startup.
- **🔌 Auto-Pairing:** No QR Code scan needed in terminal! Just run and enter your number.
- **🛠️ Modular:** Command structure is simple (`module.exports`).
- **🛡️ Secure:** Built-in Group Protections (AntiLink, AntiSpam, AntiDelete...).
- **🌍 Multi-Language:** Dynamic language switching (`fr`, `en`...).
- **⚙️ Customizable:** Easily editable `config.js` and `.env`.

---

## 🚀 Deployment / Déploiement

### 📦 1. Panel (Pterodactyl, Sen-Host, etc.)

It's the easiest way to host the bot 24/7.
*C'est la façon la plus simple d'héberger le bot 24/7.*

1.  **Upload & Extract:** Upload the `REN-MDX` zip file to your panel and extract it.
2.  **Create Configuration:** Create a file named `.env` in the root folder and fill it:
    *Créez un fichier nommé `.env` à la racine et remplissez-le :*

    ```env
    BOT_NAME=REN-MDX
    OWNER_NAME=TonNom
    OWNER_NUMBER=237xxxxxxxxx
    PREFIX=.
    SESSION_NAME=session
    DEFAULT_LANG=fr
    # Optional / Optionnel
    AUTO_READ=false
    NEWSLETTER_JID=120363420601379038@newsletter
    ```

3.  **Install & Start:**
    *   Go to "Startup" tab (or Console).
    *   Run command: `npm install && npm start`
    *   **Auto-Pairing:** The console will ask for your number if no session exists.

### 📱 2. Termux (Android)

Perfect for testing or local hosting.
*Parfait pour tester ou héberger localement.*

```bash
apt update && apt upgrade
pkg install git nodejs ffmpeg
git clone https://github.com/stephdev12/REN-MDX.git
cd REN-MDX
npm install
npm start
```

---

## 👨‍💻 For Developers / Pour les Devs

Adding a command is super simple. Create a file in `plugins/category/mycmd.js`:
*Ajouter une commande est super simple. Créez un fichier dans `plugins/...` :*

```javascript
module.exports = {
  name: 'mycmd',
  category: 'misc',
  description: 'Test command',
  usage: '.mycmd',
  
  // Flags
  ownerOnly: false,
  groupOnly: false,

  execute: async (client, message, args) => {
    await client.sendMessage(message.key.remoteJid, { text: 'It works!' });
  }
};
```

---

## 📞 Support & Credits

*   **Created by:** SEN STUDIO
*   **Support Channel:** [Join WhatsApp Channel](https://whatsapp.com/channel/0029VbAK3nYEquiZ3Ajpd90f)

---

## ⚠️ Disclaimer

This bot was created for educational purposes using an unofficial WhatsApp API. The developer is not responsible for any misuse, account bans, or damages caused by this software. Use at your own risk.

*Ce bot a été créé à des fins éducatives en utilisant une API WhatsApp non officielle. Le développeur n'est pas responsable des mauvaises utilisations, des bannissements de compte ou des dommages causés par ce logiciel. Utilisez-le à vos propres risques.*
