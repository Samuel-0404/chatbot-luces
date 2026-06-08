/**
 * DECOM - Chat Main Controller
 * Controlador principal del asistente de chat
 */

import { ChatUI } from './modules/chatUI.js';
import { ChatAPI } from './modules/chatAPI.js';
import { MESSAGES, QUICK_REPLIES } from './modules/config.js';

class ChatController {
  constructor() {
    this.ui = new ChatUI(
      document.getElementById('messages'),
      document.getElementById('user-input'),
      document.getElementById('send-btn')
    );
    this.api = new ChatAPI();
    this.isProcessing = false;

    this.init();
  }

  /**
   * Inicializa el chat
   */
  init() {
    this.setupEventListeners();
    this.showWelcomeMessage();
  }

  /**
   * Configura los event listeners
   */
  setupEventListeners() {
    // Click en botón enviar
    this.ui.sendButton.addEventListener('click', () => {
      this.handleUserMessage();
    });

    // Enter en el input (sin Shift)
    this.ui.inputElement.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        this.handleUserMessage();
      }
    });

    // Quick replies
    this.ui.inputElement.addEventListener('quickreply', (e) => {
      this.handleUserMessage(e.detail.text);
    });
  }

  /**
   * Muestra el mensaje de bienvenida
   */
  showWelcomeMessage() {
    this.ui.addMessage('bot', MESSAGES.WELCOME, QUICK_REPLIES);
  }

  /**
   * Maneja el envío de un mensaje del usuario
   */
  async handleUserMessage(customText = null) {
    const text = customText || this.ui.inputElement.value.trim();
    
    if (!text || this.isProcessing) {
      return;
    }

    this.isProcessing = true;
    this.ui.setButtonEnabled(false);

    // Mostrar mensaje del usuario
    const sanitizedText = this.ui.sanitizeUserInput(text);
    this.ui.addMessage('user', sanitizedText);
    
    if (!customText) {
      this.ui.clearInput();
    }

    // Mostrar indicador de escritura
    this.ui.showTyping();

    try {
      // Obtener respuesta de la API
      const reply = await this.api.sendMessage(text);
      
      // Ocultar indicador y mostrar respuesta
      this.ui.hideTyping();
      const { html, quickReplies } = this.ui.parseResponse(reply);
      this.ui.addMessage('bot', html, quickReplies);

    } catch (error) {
      // Mostrar error
      this.ui.hideTyping();
      this.ui.addMessage('bot', error.message);
    } finally {
      this.isProcessing = false;
      this.ui.setButtonEnabled(true);
      this.ui.inputElement.focus();
    }
  }
}

// Iniciar la aplicación cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
  new ChatController();
});
