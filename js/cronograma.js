/**
 * DECOM - Cronograma Page Controller
 * Controlador de la página de cronograma con Google Sheets
 */

import { CONFIG } from './modules/config.js';

// Constantes
const VALID_DAYS = ['MARTES', 'JUEVES', 'VIERNES', 'SÁBADO', 'SABADO', 'DOMINGO'];
const MONTHS_ES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

/**
 * Obtiene la fecha actual en formato DD-MM-YYYY
 */
function todayStr() {
  const now = new Date();
  const d = String(now.getDate()).padStart(2, '0');
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const y = now.getFullYear();
  return `${d}-${m}-${y}`;
}

/**
 * Normaliza cualquier representación de fecha a DD-MM-YYYY
 */
function normDate(raw) {
  if (!raw) return '';
  const s = String(raw);

  // Google Sheets Date object: Date(2026,5,2) — mes 0-indexado
  const gd = s.match(/^Date\((\d+),(\d+),(\d+)\)$/);
  if (gd) {
    const [, y, m, d] = gd;
    return `${String(d).padStart(2, '0')}-${String(+m + 1).padStart(2, '0')}-${y}`;
  }
  
  // Ya está en formato DD-MM-YYYY
  return s.trim();
}

/**
 * Compara si una fecha ya pasó
 * @param {string} dateStr - Fecha en formato DD-MM-YYYY
 * @returns {boolean} true si la fecha ya pasó
 */
function isPastDate(dateStr) {
  if (!dateStr) return false;
  const [d, m, y] = dateStr.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return date < today;
}

/**
 * Obtiene los datos de Google Sheets
 */
function fetchSheet() {
  return new Promise((resolve, reject) => {
    let settled = false;
    
    function done(fn) {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      fn();
    }

    const timer = setTimeout(() => {
      done(() => reject(new Error(
        'Google Sheets no respondió. Verifica que el Sheet está compartido como "Cualquier persona con el enlace → Lector".'
      )));
    }, 10000);

    // Configurar callback global
    if (!window.google) window.google = {};
    if (!window.google.visualization) window.google.visualization = {};
    if (!window.google.visualization.Query) window.google.visualization.Query = {};
    
    window.google.visualization.Query.setResponse = function (data) {
      done(() => {
        if (data.status === 'error') {
          reject(new Error(data.errors?.[0]?.detailed_message || 'Error al cargar datos'));
        } else {
          resolve(data.table);
        }
      });
    };

    // Cargar script
    document.getElementById('gviz-script')?.remove();
    
    const sheetParam = CONFIG.SHEET_GID
      ? `gid=${CONFIG.SHEET_GID}`
      : `sheet=${encodeURIComponent(CONFIG.SHEET_NAME)}`;
    
    const script = document.createElement('script');
    script.id = 'gviz-script';
    script.src = `https://docs.google.com/spreadsheets/d/${CONFIG.SHEET_ID}/gviz/tq?tqx=out:json&${sheetParam}`;
    script.onerror = () => done(() => reject(new Error('No se pudo cargar el script de Google Sheets.')));
    document.head.appendChild(script);
  });
}

/**
 * Parsea la tabla de Google Sheets
 */
function parseTable(table) {
  const labels = table.cols.map(c => (c.label || '').trim());
  const cols = table.cols.map(c => c.label || c.id || '');

  const rows = (table.rows || []).map(row =>
    (row.c || []).map(cell => {
      if (!cell || cell.v === null) return '';
      return cell.f ?? String(cell.v);
    })
  );

  // Salta columnas iniciales sin label
  const start = labels.findIndex(label => label !== '');
  if (start > 0) {
    return { 
      cols: cols.slice(start), 
      rows: rows.map(r => r.slice(start)) 
    };
  }
  
  return { cols, rows };
}

/**
 * Filtra solo las filas con días válidos
 */
function filterRows(rows) {
  return rows.filter(row => {
    const day = (row[0] || '').toString().trim().toUpperCase();
    return VALID_DAYS.includes(day);
  });
}

/**
 * Obtiene información del mes a partir de las fechas
 */
function getMonthInfo(rows) {
  for (const row of rows) {
    const date = normDate(row[1]);
    const parts = date.match(/^(\d{2})-(\d{2})-(\d{4})$/);
    if (parts) {
      return { month: parseInt(parts[2]) - 1, year: parseInt(parts[3]) };
    }
  }
  
  const now = new Date();
  return { month: now.getMonth(), year: now.getFullYear() };
}

/**
 * Crea badges de roles para móvil
 */
function createRoleBadge(role) {
  const roleMap = {
    'supervisor': { class: 'supervisor', label: 'SUP' },
    'lider_transmision': { class: 'lider', label: 'LID' },
    'aprendiz_transmision': { class: 'aprendiz', label: 'APR' },
    'proyeccion': { class: 'proyeccion', label: 'PRO' },
    'aprendiz_proyeccion': { class: 'aprendiz', label: 'A-PRO' },
    'interaccion': { class: 'interaccion', label: 'INT' },
    'aprendiz_interaccion': { class: 'aprendiz', label: 'A-INT' },
    'sonido': { class: 'sonido', label: 'SON' },
    'apoyo_sonido': { class: 'apoyo', label: 'APO' }
  };
  
  const config = roleMap[role] || { class: '', label: role.substring(0, 3).toUpperCase() };
  const badge = document.createElement('span');
  badge.className = `role-badge role-badge--${config.class}`;
  badge.textContent = config.label;
  return badge;
}

/**
 * Agrupa personas con roles para vista móvil
 */
function createGroupedPersons(row, cols) {
  // Producción: índices 2-8 (Supervisor, Líder Transmisión, Aprendiz Transmisión, Proyección, Aprendiz Proyección, Interacción, Aprendiz Interacción)
  const produccion = [];
  const roles = ['supervisor', 'lider_transmision', 'aprendiz_transmision', 'proyeccion', 'aprendiz_proyeccion', 'interaccion', 'aprendiz_interaccion'];
  
  for (let i = 2; i <= 8 && i < row.length; i++) {
    const person = (row[i] || '').trim();
    if (person && person !== '') {
      const item = document.createElement('div');
      item.className = 'person-item';
      item.appendChild(createRoleBadge(roles[i - 2]));
      const name = document.createElement('span');
      name.textContent = person;
      item.appendChild(name);
      produccion.push(item);
    }
  }
  
  // Sonido: índices 9-10 (Sonido, Apoyo Sonido)
  const sonido = [];
  const soundRoles = ['sonido', 'apoyo_sonido'];
  
  for (let i = 9; i <= 10 && i < row.length; i++) {
    const person = (row[i] || '').trim();
    if (person && person !== '') {
      const item = document.createElement('div');
      item.className = 'person-item';
      item.appendChild(createRoleBadge(soundRoles[i - 9]));
      const name = document.createElement('span');
      name.textContent = person;
      item.appendChild(name);
      sonido.push(item);
    }
  }
  
  return { produccion, sonido };
}

/**
 * Construye la tabla HTML
 */
function buildTable(cols, rows) {
  const today = todayStr();
  const container = document.getElementById('table-container');

  const scroll = document.createElement('div');
  scroll.className = 'table-scroll';

  const table = document.createElement('table');
  table.className = 'cronograma-table';

  // Header
  const thead = document.createElement('thead');
  const headerRow = document.createElement('tr');
  cols.forEach(label => {
    const th = document.createElement('th');
    th.textContent = label;
    headerRow.appendChild(th);
  });
  thead.appendChild(headerRow);
  table.appendChild(thead);

  // Body
  const tbody = document.createElement('tbody');
  rows.forEach(row => {
    const dateVal = normDate(row[1]);
    const isToday = dateVal === today;
    const isPast = isPastDate(dateVal);

    const tr = document.createElement('tr');
    if (isToday) tr.classList.add('row-today');
    if (isPast) tr.classList.add('row-past');

    row.forEach((cell, i) => {
      const td = document.createElement('td');

      // Agregar data-label para responsive
      if (i < cols.length) {
        td.setAttribute('data-label', cols[i]);
      }

      if (!cell || cell === '') {
        td.textContent = '—';
        td.classList.add('empty');
      } else if (i === 0) {
        // Columna día
        const dayUpper = cell.toUpperCase();
        const dayNorm = dayUpper
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '')
          .toLowerCase();
        
        const wrapper = document.createElement('div');
        wrapper.className = 'day-cell-wrapper';
        
        const badge = document.createElement('span');
        badge.className = `day-badge day-badge--${dayNorm}`;
        badge.textContent = cell;
        wrapper.appendChild(badge);

        if (isToday) {
          const tag = document.createElement('span');
          tag.className = 'today-tag';
          tag.innerHTML = '★ Hoy';
          wrapper.appendChild(tag);
        }
        
        td.appendChild(wrapper);
      } else {
        td.textContent = cell;
      }
      
      // Agregar clases especiales para agrupar en móvil
      if (i === 0) {
        td.classList.add('col-dia');
      } else if (i === 1) {
        td.classList.add('col-fecha');
      } else if (i >= 2 && i <= 7) {
        td.classList.add('col-produccion');
        // Agregar contenido agrupado para móvil (solo visible en CSS móvil)
        if (i === 2) {
          const grouped = createGroupedPersons(row, cols);
          const mobileContent = document.createElement('div');
          mobileContent.className = 'mobile-grouped-content';
          grouped.produccion.forEach(item => mobileContent.appendChild(item));
          td.appendChild(mobileContent);
        }
      } else if (i >= 8) {
        td.classList.add('col-sonido');
        // Agregar contenido agrupado para móvil (solo visible en CSS móvil)
        if (i === 8) {
          const grouped = createGroupedPersons(row, cols);
          const mobileContent = document.createElement('div');
          mobileContent.className = 'mobile-grouped-content';
          grouped.sonido.forEach(item => mobileContent.appendChild(item));
          td.appendChild(mobileContent);
        }
      }

      tr.appendChild(td);
    });

    tbody.appendChild(tr);
  });
  table.appendChild(tbody);

  scroll.appendChild(table);
  container.innerHTML = '';
  container.appendChild(scroll);
}

/**
 * Construye los stats cards
 */
function buildStatsUI(rows, cols) {
  const today = todayStr();
  const total = rows.length;
  const todayRow = rows.find(r => normDate(r[1]) === today);

  const statsEl = document.getElementById('stats-row');
  statsEl.style.display = 'flex';

  const items = [
    { val: total, lbl: 'servicios este mes', cls: '' },
  ];

  if (todayRow) {
    // Buscar el índice de la columna "Líder Transmisión" o "Lider Transmisión"
    // Normalizar removiendo tildes para comparación
    const normalizeText = (text) => text
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');
    
    const liderTransmisionIndex = cols.findIndex(col => {
      const normalized = normalizeText(col);
      return normalized.includes('lider') && normalized.includes('transmision');
    });
    
    const lider = liderTransmisionIndex >= 0 
      ? (todayRow[liderTransmisionIndex] || '').trim()
      : '—';
    
    items.push({ 
      val: lider || '—', 
      lbl: 'líder transmisión hoy', 
      cls: 'stat-card--today' 
    });
  }

  statsEl.innerHTML = items.map(i => `
    <div class="stat-card ${i.cls}">
      <div class="stat-card__value">${i.val}</div>
      <div class="stat-card__label">${i.lbl}</div>
    </div>
  `).join('');
}

/**
 * Muestra un error
 */
function showError(msg) {
  document.getElementById('table-container').innerHTML = `
    <div class="state-box">
      <div class="state-box__icon">⚠️</div>
      <div class="state-box__title">Error al cargar</div>
      <div class="state-box__message">${msg}</div>
    </div>
  `;
}

/**
 * Carga el cronograma desde Google Sheets
 */
async function loadCronograma() {
  if (!CONFIG.SHEET_ID.trim()) {
    document.getElementById('setup-card').classList.add('visible');
    document.getElementById('table-container').innerHTML = `
      <div class="state-box">
        <div class="state-box__icon">⚙️</div>
        <div class="state-box__title">Configuración requerida</div>
        <div class="state-box__message">Edita el archivo <strong>js/modules/config.js</strong> y configura el SHEET_ID</div>
      </div>
    `;
    return;
  }

  // Start loading
  const btn = document.getElementById('refresh-btn');
  btn.classList.add('spinning');
  btn.disabled = true;

  document.getElementById('table-container').innerHTML = `
    <div class="state-box">
      <div class="spinner"></div>
      <div class="state-box__title">Cargando cronograma...</div>
    </div>
  `;

  try {
    const table = await fetchSheet();
    const { cols, rows: allRows } = parseTable(table);
    const rows = filterRows(allRows);

    if (rows.length === 0) {
      showError('No se encontraron servicios en el cronograma.');
      return;
    }

    // Actualizar título del mes
    const { month, year } = getMonthInfo(rows);
    document.getElementById('month-label').textContent = `${MONTHS_ES[month]} ${year}`;
    document.getElementById('month-sub').textContent = 'Departamento de Comunicaciones · IPUC Central Cali';

    // Link al sheet
    const sheetLink = document.getElementById('sheet-link');
    sheetLink.href = `https://docs.google.com/spreadsheets/d/${CONFIG.SHEET_ID}`;
    sheetLink.style.display = 'flex';

    // Renderizar
    buildTable(cols, rows);
    buildStatsUI(rows, cols);

    // Inicializar búsqueda después de cargar la tabla
    initPersonSearch();

    // Timestamp
    const now = new Date();
    document.getElementById('last-update').textContent =
      `Actualizado: ${now.toLocaleDateString('es-CO')} ${now.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })}`;

  } catch (err) {
    const m = err.message;
    const msg = (m.includes('403') || m.includes('401'))
      ? 'No tienes permiso para ver este documento. Asegúrate de que el Sheet esté compartido como "Cualquier persona con el enlace → Lector".'
      : m.includes('404')
      ? 'No se encontró el documento. Verifica el SHEET_ID en la configuración.'
      : `Error: ${m}`;
    showError(msg);
  } finally {
    btn.classList.remove('spinning');
    btn.disabled = false;
  }
}

/**
 * Funcionalidad de búsqueda por persona
 */
function initPersonSearch() {
  const searchInput = document.getElementById('person-search');
  const clearBtn = document.getElementById('clear-search');
  const resultsDiv = document.getElementById('search-results');
  
  if (!searchInput || !clearBtn || !resultsDiv) return;

  // Limpiar event listeners anteriores (clonar y reemplazar)
  const newSearchInput = searchInput.cloneNode(true);
  searchInput.parentNode.replaceChild(newSearchInput, searchInput);
  const newClearBtn = clearBtn.cloneNode(true);
  clearBtn.parentNode.replaceChild(newClearBtn, clearBtn);

  // Usar referencias a los nuevos elementos
  const input = newSearchInput;
  const clear = newClearBtn;

  // Función de búsqueda
  function performSearch() {
    const query = input.value.trim().toLowerCase();
    const tbody = document.querySelector('.cronograma-table tbody');
    
    if (!tbody) {
      console.log('No se encontró tbody');
      return;
    }

    const rows = Array.from(tbody.querySelectorAll('tr'));
    console.log(`Buscando "${query}" en ${rows.length} filas`);
    
    // Si no hay búsqueda, mostrar todas las filas
    if (!query) {
      rows.forEach(row => {
        row.classList.remove('hidden', 'highlight');
      });
      clear.style.display = 'none';
      resultsDiv.textContent = '';
      resultsDiv.className = 'search-bar__results';
      return;
    }

    // Mostrar botón de limpiar
    clear.style.display = 'flex';

    // Filtrar filas
    let visibleCount = 0;
    rows.forEach(row => {
      const cells = Array.from(row.querySelectorAll('td'));
      const rowText = cells.map(cell => cell.textContent.toLowerCase()).join(' ');
      
      if (rowText.includes(query)) {
        row.classList.remove('hidden');
        row.classList.add('highlight');
        visibleCount++;
      } else {
        row.classList.add('hidden');
        row.classList.remove('highlight');
      }
    });

    // Actualizar mensaje de resultados
    if (visibleCount > 0) {
      resultsDiv.textContent = `${visibleCount} ${visibleCount === 1 ? 'resultado encontrado' : 'resultados encontrados'}`;
      resultsDiv.className = 'search-bar__results has-results';
    } else {
      resultsDiv.textContent = 'No se encontraron resultados';
      resultsDiv.className = 'search-bar__results no-results';
    }
  }

  // Limpiar búsqueda
  function clearSearch() {
    input.value = '';
    performSearch();
    input.focus();
  }

  // Event listeners
  input.addEventListener('input', performSearch);
  clear.addEventListener('click', clearSearch);
  
  // Enter para buscar, Escape para limpiar
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      clearSearch();
    }
  });
}

// Inicializar al cargar la página
document.addEventListener('DOMContentLoaded', () => {
  loadCronograma();
  
  // Botón refresh
  document.getElementById('refresh-btn')?.addEventListener('click', loadCronograma);
});
