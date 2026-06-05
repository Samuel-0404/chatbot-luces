/**
 * DECOM - Manuales Page Controller
 * Controlador de la página de manuales
 */

const manuals = {
  transmision: {
    icon: '📡',
    title: 'Manual de Transmisión',
    file: 'pdfs/manual-transmision.pdf',
  },
  proyeccion: {
    icon: '🎥',
    title: 'Manual de Proyección',
    file: 'pdfs/manual-proyeccion.pdf',
  },
  luces: {
    icon: '💡',
    title: 'Manual de Luces',
    file: 'pdfs/manual-luces.pdf',
  },
};

let currentManual = null;

/**
 * Abre un manual
 */
function openManual(key) {
  const manual = manuals[key];
  if (!manual) return;

  // Actualizar tarjeta activa
  document.querySelectorAll('.manual-card').forEach(card => {
    card.classList.remove('active');
  });
  
  const cardElement = document.querySelector(`.manual-card--${key}`);
  if (cardElement) {
    cardElement.classList.add('active');
  }

  // Actualizar barra superior del visor
  document.getElementById('pdf-icon').textContent = manual.icon;
  document.getElementById('pdf-title').textContent = manual.title;
  document.getElementById('pdf-open-link').href = manual.file;

  // Renderizar PDF
  const body = document.getElementById('pdf-body');
  body.innerHTML = '';

  const iframe = document.createElement('iframe');
  iframe.style.cssText = 'width:100%;height:100%;border:none;display:block;';
  iframe.src = manual.file;
  
  // Fallback si el PDF no se puede cargar
  iframe.onerror = () => showPlaceholder(key, manual);

  body.appendChild(iframe);

  // Mostrar el visor
  const viewer = document.getElementById('pdf-viewer');
  viewer.classList.add('open');
  viewer.scrollIntoView({ behavior: 'smooth', block: 'start' });

  currentManual = key;
}

/**
 * Muestra un placeholder cuando el PDF no está disponible
 */
function showPlaceholder(key, manual) {
  const body = document.getElementById('pdf-body');
  const filename = manual.file.split('/').pop();
  
  body.innerHTML = `
    <div class="pdf-placeholder">
      <div class="pdf-placeholder__icon">${manual.icon}</div>
      <h3>Manual no encontrado</h3>
      <p>Para ver este manual, copia el archivo PDF a la carpeta <strong>pdfs/</strong> del proyecto con el nombre:</p>
      <code>${filename}</code>
    </div>
  `;
}

/**
 * Cierra el visor de PDF
 */
function closeManual() {
  document.getElementById('pdf-viewer').classList.remove('open');
  document.querySelectorAll('.manual-card').forEach(card => {
    card.classList.remove('active');
  });
  currentManual = null;
}

// Exponer funciones globalmente para los event handlers inline
window.openManual = openManual;
window.closeManual = closeManual;
