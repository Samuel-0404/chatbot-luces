/**
 * DECOM - Configuration Module
 * Configuración centralizada de la aplicación
 */

import { GROQ_API_KEY } from './env.js';

export const CONFIG = {
  // API Configuration
  GROQ_API_KEY: GROQ_API_KEY, // Definida en js/modules/env.js (no se sube a GitHub)
  GROQ_API_URL: 'https://api.groq.com/openai/v1/chat/completions',
  MODEL: 'llama-3.1-8b-instant',
  MAX_TOKENS: 400,
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
  '💡 Las luces no encienden',
  '💡 ¿Cómo enciendo las luces paso a paso?',
  '💡 No puedo crear una escena',
  '📡 Problema con la transmisión',
  '🎥 Problema con la proyección',
];
