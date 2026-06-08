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
   * Envía un mensaje a la API y retorna la respuesta
   */
  async sendMessage(userMessage) {
    // Agregar mensaje del usuario al historial
    this.history.push({ 
      role: 'user', 
      content: userMessage 
    });

    try {
      const response = await this.fetchGroqAPI();
      
      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('INVALID_API_KEY');
        }
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();
      const reply = data.choices?.[0]?.message?.content || MESSAGES.ERROR_UNKNOWN;
      
      // Agregar respuesta al historial
      this.history.push({ 
        role: 'assistant', 
        content: reply 
      });

      return reply;

    } catch (error) {
      console.error('Chat API Error:', error);
      
      if (error.message === 'INVALID_API_KEY') {
        throw new Error(MESSAGES.ERROR_NO_API_KEY);
      }
      
      throw new Error(MESSAGES.ERROR_CONNECTION);
    }
  }

  /**
   * Realiza la petición HTTP a Groq
   */
  async fetchGroqAPI() {
    return fetch(CONFIG.GROQ_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${CONFIG.GROQ_API_KEY}`
      },
      body: JSON.stringify({
        model: CONFIG.MODEL,
        max_tokens: CONFIG.MAX_TOKENS,
        temperature: CONFIG.TEMPERATURE,
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          ...this.history
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
