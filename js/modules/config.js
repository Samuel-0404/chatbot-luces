/**
 * DECOM - Configuration Module
export const CONFIG = {
  // API Configuration
  GROQ_API_URL: 'https://api.groq.com/openai/v1/chat/completions',
  MODEL: 'gpt-oss-20b',
  MAX_TOKENS: 800,
  TEMPERATURE: 0.25,

  // Sheet Configuration (Cronograma)
  SHEET_ID: '1cZOxQGNvj0Tkj615uF38xrSlvOIdy4sruD-9qNQH9nk',
  SHEET_NAME: 'IMPRIMIBLE',
  SHEET_GID: '1414634577',

  // UI Settings
  TYPING_DELAY: 1000,
  AUTO_SCROLL_DELAY: 100,
  MAX_INPUT_HEIGHT: 120,
};

export const MESSAGES = {
  ERROR_NO_API_KEY: '⚠️ La API key no es válida. Abre el archivo <strong>js/modules/config.js</strong> en un editor de texto y reemplaza <code>REEMPLAZA_CON_TU_API_KEY</code> con tu key de Groq.',
  ERROR_CONNECTION: '⚠️ Error de conexión. Verifica que tienes internet e intenta de nuevo.',
  ERROR_UNKNOWN: 'No pude obtener respuesta. Intenta de nuevo.',
  WELCOME: '¡Dios te bendiga! Soy el asistente técnico del DECOM de la <strong>IPUC Central Cali</strong>.<br><br>Puedo ayudarte con <strong>Luces</strong>, <strong>Transmisión</strong> y <strong>Proyección</strong>. Cuéntame qué está pasando, hermano.',
};

export const QUICK_REPLIES = [
  '💡 ¿Cómo puedo prender las luces?',
  '🎥 Paso a paso de como iniciar transmión',
  '🖥️ Problema con la proyección',
];
