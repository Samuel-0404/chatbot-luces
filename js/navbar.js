/**
 * DECOM - Navbar Component
 * Manejo del menú de navegación responsive
 */

class Navbar {
  constructor() {
    this.nav = document.querySelector('.navbar__nav');
    this.toggle = document.querySelector('.navbar__toggle');
    this.init();
  }

  init() {
    if (!this.toggle || !this.nav) return;

    // Toggle menu en mobile
    this.toggle.addEventListener('click', () => {
      this.nav.classList.toggle('open');
      const isOpen = this.nav.classList.contains('open');
      this.toggle.setAttribute('aria-expanded', isOpen);
      this.toggle.innerHTML = isOpen ? '✕' : '☰';
    });

    // Cerrar menú al hacer clic en un link
    this.nav.querySelectorAll('.navbar__link').forEach(link => {
      link.addEventListener('click', () => {
        this.nav.classList.remove('open');
        this.toggle.setAttribute('aria-expanded', 'false');
        this.toggle.innerHTML = '☰';
      });
    });

    // Cerrar menú al hacer clic fuera
    document.addEventListener('click', (e) => {
      if (!this.nav.contains(e.target) && !this.toggle.contains(e.target)) {
        this.nav.classList.remove('open');
        this.toggle.setAttribute('aria-expanded', 'false');
        this.toggle.innerHTML = '☰';
      }
    });

    // Cerrar menú al cambiar de tamaño de ventana
    window.addEventListener('resize', () => {
      if (window.innerWidth > 768) {
        this.nav.classList.remove('open');
        this.toggle.setAttribute('aria-expanded', 'false');
        this.toggle.innerHTML = '☰';
      }
    });
  }
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
  new Navbar();
});
