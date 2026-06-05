/**
 * DECOM - Sidebar Component
 * Modern vertical sidebar navigation
 */

class Sidebar {
  constructor() {
    this.sidebar = document.querySelector('.sidebar');
    this.toggle = document.querySelector('.sidebar__toggle');
    this.mobileToggle = document.querySelector('.mobile-menu-toggle');
    this.init();
  }

  init() {
    if (!this.sidebar) return;

    // Toggle sidebar en mobile (botón toggle original si existe)
    if (this.toggle) {
      this.toggle.addEventListener('click', (e) => {
        e.stopPropagation();
        this.sidebar.classList.toggle('open');
      });
    }

    // Toggle sidebar con botón móvil
    if (this.mobileToggle) {
      this.mobileToggle.addEventListener('click', (e) => {
        e.stopPropagation();
        this.sidebar.classList.toggle('open');
      });
    }

    // Cerrar sidebar al hacer click fuera (solo mobile)
    document.addEventListener('click', (e) => {
      if (window.innerWidth <= 768) {
        const isToggle = this.toggle && this.toggle.contains(e.target);
        const isMobileToggle = this.mobileToggle && this.mobileToggle.contains(e.target);
        
        if (!this.sidebar.contains(e.target) && !isToggle && !isMobileToggle) {
          this.sidebar.classList.remove('open');
        }
      }
    });

    // Cerrar sidebar al cambiar tamaño de ventana
    window.addEventListener('resize', () => {
      if (window.innerWidth > 768) {
        this.sidebar.classList.remove('open');
      }
    });

    // Prevenir cierre al hacer click dentro del sidebar
    this.sidebar.addEventListener('click', (e) => {
      e.stopPropagation();
    });
  }
}

// Inicializar sidebar
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => new Sidebar());
} else {
  new Sidebar();
}
