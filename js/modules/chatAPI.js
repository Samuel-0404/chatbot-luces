/**
 * DECOM - Chat API Module
 * Comunicación con la API de Groq
 */

import { CONFIG, MESSAGES } from './config.js';
import { SYSTEM_PROMPT } from './manuals.js';

export class ChatAPI {
  constructor() {
    this.history = [];
  }

  /**
   * Respuestas locales para mensajes sociales simples (sin llamar a la API)
   */
  getLocalResponse(message) {
    const msg = message.toLowerCase().trim();
    const gracias = /^(muchas\s+)?gracias[.!]?$|^gracias\s+(hermano|hermana)[.!]?$/;
    const ok = /^(ok|okay|perfecto|listo|entendido|claro|de\s+acuerdo|👍)[.!]?$/;
    const hola = /^(hola|buenas|buenos\s+días|buenas\s+tardes|buenas\s+noches)[.!]?$/;

    if (gracias.test(msg)) {
      const respuestas = [
        '¡Con gusto, hermano! Si necesitas algo más, aquí estoy. ¡Bendiciones!',
        '¡De nada! Que Dios te ayude en el servicio. 🙏',
        '¡Para eso estamos! Cualquier otra duda me avisas.',
      ];
      return respuestas[Math.floor(Math.random() * respuestas.length)];
    }
    if (ok.test(msg)) {
      return '¡Perfecto! Si surge algo más, con gusto te ayudo.';
    }
    if (hola.test(msg)) {
      return '¡Dios te bendiga, hermano! ¿En qué te puedo ayudar hoy?';
    }
    return null;
  }

  /**
   * Envía un mensaje a la API y retorna la respuesta
   */
  async sendMessage(userMessage) {
    // Verificar si es un mensaje social simple (responder sin llamar a la API)
    const localReply = this.getLocalResponse(userMessage);
    if (localReply) return localReply;

    // Agregar mensaje del usuario al historial
    this.history.push({
      role: 'user',
      content: userMessage 
    });

    const maxRetries = 3;
    const retryDelay = 2000;
    const fallbackReply = 'Eso no lo tengo claro todavía. Cuéntame qué ves exactamente en pantalla o qué paso hiciste, y te guío.';

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const response = await this.fetchGroqAPI();

        if (!response.ok) {
          if (response.status === 401) throw new Error('INVALID_API_KEY');
          // Si es rate limit (429) y quedan intentos, esperar y reintentar
          if (response.status === 429 && attempt < maxRetries) {
            await new Promise(r => setTimeout(r, retryDelay * attempt));
            continue;
          }
          throw new Error(`HTTP ${response.status}`);
        }

        const data = await response.json();
        const reply = data.choices?.[0]?.message?.content || fallbackReply;

        this.history.push({ role: 'assistant', content: reply });
        return reply;

      } catch (error) {
        console.error(`Chat API Error (intento ${attempt}):`, error);

        if (error.message === 'INVALID_API_KEY') {
          throw new Error(MESSAGES.ERROR_NO_API_KEY);
        }

        // Si quedan intentos, esperar y reintentar
        if (attempt < maxRetries) {
          await new Promise(r => setTimeout(r, retryDelay * attempt));
          continue;
        }

        this.history.push({ role: 'assistant', content: fallbackReply });
        return fallbackReply;
      }
    }
  }

  /**
   * Realiza la petición HTTP al proxy serverless (Vercel)
   * La API key de Groq nunca sale del servidor
   */
  async fetchGroqAPI() {
    return fetch('/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: CONFIG.MODEL,
        max_tokens: CONFIG.MAX_TOKENS,
        temperature: CONFIG.TEMPERATURE,
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          ...this.history.slice(-6) // Solo los últimos 6 mensajes para no exceder el límite de tokens
        ]
      })
    });
  }

  /**
   * Limpia el historial de conversación
   */
  clearHistory() {
    this.history = [];
  }

  /**
   * Obtiene el historial actual
   */
  getHistory() {
    return [...this.history];
  }
}
