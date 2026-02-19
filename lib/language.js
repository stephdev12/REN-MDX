// 🌐 GESTIONNAIRE DE LANGUES DYNAMIQUE (v2)
const fs = require('fs-extra');
const path = require('path');
const config = require('../config.js');
const { getSettings } = require('./database');

const LANG_CACHE = {};

function loadLocale(langCode) {
  if (LANG_CACHE[langCode]) return LANG_CACHE[langCode];
  
  const localePath = path.join(__dirname, `../locales/${langCode}.json`);
  if (!fs.existsSync(localePath)) return null;
  
  const data = JSON.parse(fs.readFileSync(localePath, 'utf8'));
  LANG_CACHE[langCode] = data;
  return data;
}

/**
 * Traduit une clé
 * @param {string} key - La clé (ex: 'group.welcome')
 * @param {Object} params - Les variables (ex: { user: '@steph' })
 */
function t(key, params = {}) {
  // Récupérer la langue active depuis la DB (avec fallback config, puis 'en')
  let currentLang = config.defaultLang;
  try {
      const settings = getSettings();
      if (settings && settings.lang) currentLang = settings.lang;
  } catch(e) {}

  let locale = loadLocale(currentLang);
  if (!locale) locale = loadLocale('en');
  if (!locale) return key; // Si rien n'existe, renvoie la clé

  // Récupération de la valeur (supporte "category.key")
  const keys = key.split('.');
  let value = locale;
  for (const k of keys) {
      value = value?.[k];
  }

  if (!value) return key;

  // Remplacement des paramètres {{param}}
  return value.replace(/{{(\w+)}}/g, (_, k) => {
      return params[k] !== undefined ? params[k] : `{{${k}}}`;
  });
}

module.exports = { t };