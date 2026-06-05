/**
 * DECOM - Chat UI Module
 * Manejo de la interfaz del chat
 */

import { CONFIG } from './config.js';

export class ChatUI {
  constructor(messagesContainer, inputElement, sendButton) {
    this.messagesContainer = messagesContainer;
    this.inputElement = inputElement;
    this.sendButton = sendButton;
    this.setupInputAutoResize();
  }

  /**
   * Agrega un mensaje al chat
   */
  addMessage(role, html, quickReplies = null) {
    const messageEl = this.createMessageElement(role, html, quickReplies);
    this.messagesContainer.appendChild(messageEl);
    this.scrollToBottom();
  }

  /**
   * Crea el elemento DOM de un mensaje
   */
  createMessageElement(role, html, quickReplies) {
    const wrapper = document.createElement('div');
    wrapper.className = `message message--${role}`;

    const avatar = document.createElement('div');
    avatar.className = 'message__avatar';
    avatar.textContent = role === 'bot' ? '⚙️' : '👤';

    const bubble = document.createElement('div');
    bubble.className = 'message__bubble';
    bubble.innerHTML = html;

    if (quickReplies && quickReplies.length > 0) {
      const container = document.createElement('div');
      container.style.cssText = 'display:flex;flex-direction:column;gap:8px;';
      container.appendChild(bubble);

      const qrContainer = this.createQuickReplies(quickReplies);
      container.appendChild(qrContainer);

      wrapper.appendChild(avatar);
      wrapper.appendChild(container);
    } else {
      wrapper.appendChild(avatar);
      wrapper.appendChild(bubble);
    }

    return wrapper;
  }

  /**
   * Crea los botones de respuestas rápidas
   */
  createQuickReplies(replies) {
    const container = document.createElement('div');
    container.className = 'quick-replies';

    replies.forEach(label => {
      const button = document.createElement('button');
      button.className = 'quick-replies__btn';
      button.textContent = label;
      button.onclick = () => {
        // Deshabilitar todos los botones después del clic
        container.querySelectorAll('.quick-replies__btn').forEach(btn => {
          btn.classList.add('used');
        });
        // Emitir evento personalizado con el texto seleccionado
        this.inputElement.dispatchEvent(new CustomEvent('quickreply', { 
          detail: { text: label } 
        }));
      };
      container.appendChild(button);
    });

    return container;
  }

  /**
   * Muestra el indicador de "escribiendo..."
   */
  showTyping() {
    const wrapper = document.createElement('div');
    wrapper.className = 'message message--bot';
    wrapper.id = 'typing-indicator';

    const avatar = document.createElement('div');
    avatar.className = 'message__avatar';
    avatar.textContent = '⚙️';

    const bubble = document.createElement('div');
    bubble.className = 'message__bubble typing-indicator';
    bubble.innerHTML = `
      <span class="typing-indicator__dot"></span>
      <span class="typing-indicator__dot"></span>
      <span class="typing-indicator__dot"></span>
    `;

    wrapper.appendChild(avatar);
    wrapper.appendChild(bubble);
    this.messagesContainer.appendChild(wrapper);
    this.scrollToBottom();
  }

  /**
   * Oculta el indicador de "escribiendo..."
   */
  hideTyping() {
    const typing = document.getElementById('typing-indicator');
    if (typing) {
      typing.remove();
    }
  }

  /**
   * Limpia el input
   */
  clearInput() {
    this.inputElement.value = '';
    this.inputElement.style.height = 'auto';
  }

  /**
   * Habilita/deshabilita el botón de enviar
   */
  setButtonEnabled(enabled) {
    this.sendButton.disabled = !enabled;
  }

  /**
   * Scroll automático al final del chat
   */
  scrollToBottom() {
    setTimeout(() => {
      this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight;
    }, CONFIG.AUTO_SCROLL_DELAY);
  }

  /**
   * Configura el auto-resize del textarea
   */
  setupInputAutoResize() {
    this.inputElement.addEventListener('input', () => {
      this.inputElement.style.height = 'auto';
      const newHeight = Math.min(
        this.inputElement.scrollHeight, 
        CONFIG.MAX_INPUT_HEIGHT
      );
      this.inputElement.style.height = `${newHeight}px`;
    });
  }

  /**
   * Parsea la respuesta del bot (markdown simple y quick replies)
   */
  parseResponse(text) {
    // Extraer quick replies [[texto]]
    const qrMatch = text.match(/\[\[(.+?)\]\]/g);
    let quickReplies = null;
    let cleanText = text;

    if (qrMatch) {
      quickReplies = qrMatch.map(m => m.replace(/\[\[|\]\]/g, '').trim());
      cleanText = text.replace(/\[\[.+?\]\]/g, '').trim();
    }

    // Formateo básico de markdown
    cleanText = cleanText
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/^(\d+)\.\s(.+)$/gm, '<li>$2</li>')
      .replace(/(<li>[\s\S]*?<\/li>)/g, m => `<ol>${m}</ol>`)
      .replace(/^[-•]\s(.+)$/gm, '<li>$1</li>')
      .replace(/\n\n/g, '<br><br>')
      .replace(/\n/g, '<br>');

    return { html: cleanText, quickReplies };
  }

  /**
   * Sanitiza texto del usuario (previene XSS)
   */
  sanitizeUserInput(text) {
    return text.replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }
}
