# DECOM - Sistema de Asistencia Técnica

Sistema web moderno para el Departamento de Comunicaciones de la IPUC Central Cali. Incluye asistente de chat con IA, manuales técnicos y cronograma integrado con Google Sheets.

## Características

### Asistente Técnico (index.html)
- Chat inteligente con IA (Groq API)
- Diagnóstico de problemas de Luces, Transmisión y Proyección
- Respuestas rápidas contextuales
- Interfaz responsive y moderna

### Manuales Técnicos (manuales.html)
- Visualizador de PDFs integrado
- Tres áreas: Transmisión, Proyección y Luces
- Sistema de fallback para PDFs no disponibles

### Cronograma (cronograma.html)
- Integración con Google Sheets en tiempo real
- Identificación automática del día actual
- Estadísticas mensuales
- Actualización manual con botón refresh

## Configuración Inicial

### 1. API de Groq (para el asistente de chat)

1. Regístrate en [groq.com](https://groq.com)
2. Obtén tu API Key desde el dashboard
3. Edita `js/modules/config.js`:

```javascript
export const CONFIG = {
  GROQ_API_KEY: 'TU_API_KEY_AQUI', // ← Reemplaza esto
  // ... resto de la configuración
};
```

### 2. Google Sheets (para el cronograma)

1. Crea una hoja de cálculo en Google Sheets con tu cronograma
2. Compártela: **Archivo → Compartir → Cualquier persona con el enlace → Lector**
3. Copia el ID del Sheet desde la URL:
   ```
   https://docs.google.com/spreadsheets/d/ESTE_ES_EL_ID/edit...
   ```
4. Edita `js/modules/config.js`:

```javascript
export const CONFIG = {
  // ...
  SHEET_ID: 'TU_SHEET_ID_AQUI', // ← Reemplaza esto
  SHEET_NAME: 'IMPRIMIBLE',      // ← Nombre de la pestaña
  SHEET_GID: '1414634577',       // ← GID si lo tienes
};
```

### 3. Manuales PDF (opcional)

1. Crea una carpeta `pdfs/` en la raíz del proyecto
2. Agrega tus PDFs con estos nombres:
   - `manual-transmision.pdf`
   - `manual-proyeccion.pdf`
   - `manual-luces.pdf`

## Estructura del Proyecto

```
chatbot-luces/
├── css/
│   ├── variables.css      # Design system (colores, tipografía)
│   ├── base.css          # Reset y estilos globales
│   ├── navbar.css        # Barra de navegación
│   ├── chat.css          # Interfaz del chat
│   ├── manuales.css      # Página de manuales
│   └── cronograma.css    # Página de cronograma
├── js/
│   ├── modules/
│   │   ├── config.js     # Configuración centralizada
│   │   ├── manuals.js    # Contenido de los manuales
│   │   ├── chatUI.js     # Interfaz del chat
│   │   └── chatAPI.js    # Comunicación con Groq API
│   ├── chat.js           # Controlador del chat
│   ├── manuales.js       # Controlador de manuales
│   ├── cronograma.js     # Controlador del cronograma
│   └── navbar.js         # Menú responsive
├── pdfs/                 # Manuales PDF (crear esta carpeta)
├── index.html            # Asistente de chat
├── manuales.html         # Visualizador de manuales
├── cronograma.html       # Cronograma mensual
└── README.md             # Este archivo
```

## Design System

### Colores Principales
- **Accent**: `#4f7fff` (Azul)
- **Accent 2**: `#7c5cff` (Morado)
- **Gold**: `#f0c060` (Dorado)
- **Teal**: `#0d9488` (Verde azulado)

### Tipografía
- **Títulos**: DM Serif Display
- **Cuerpo**: DM Sans

### Breakpoints
- **Desktop**: > 768px
- **Tablet**: 640px - 768px
- **Mobile**: < 640px

## Personalización

### Modificar los manuales del asistente

Edita `js/modules/manuals.js` y actualiza las constantes:
- `MANUAL_LUCES`
- `MANUAL_TRANSMISION`
- `MANUAL_PROYECCION`

### Cambiar el comportamiento del asistente

Edita el `SYSTEM_PROMPT` en `js/modules/manuals.js` para modificar la personalidad y lógica del bot.

### Agregar nuevas áreas

1. Agrega tu manual en `js/modules/manuals.js`
2. Actualiza el `SYSTEM_PROMPT` con la nueva información
3. Agrega un chip en `index.html` (sección `.chat__chips`)
4. Agrega una tarjeta en `manuales.html` (sección `.cards-grid`)

## Despliegue

Este es un proyecto HTML estático puro. Puede desplegarse en:

- **GitHub Pages**: Sube a un repositorio y activa Pages
- **Netlify**: Arrastra la carpeta al dashboard
- **Vercel**: Conecta tu repositorio
- **Servidor local**: Simplemente abre `index.html` en el navegador

### Importante para producción

Si usas un servidor web (no `file://`), los módulos ES6 funcionarán correctamente. Para abrir localmente, usa un servidor como:

```bash
# Python 3
python -m http.server 8000

# Node.js
npx serve

# VS Code
# Instala la extensión "Live Server" y haz clic derecho → Open with Live Server
```

## Solución de Problemas

### El chat no responde
- Verifica que tu API Key de Groq sea válida
- Revisa la consola del navegador (F12) para ver errores
- Asegúrate de tener conexión a internet

### El cronograma no carga
- Verifica que el SHEET_ID sea correcto
- Asegúrate de que el Sheet esté compartido públicamente
- Revisa que el nombre de la pestaña coincida con `SHEET_NAME`

### Los PDFs no se muestran
- Verifica que los archivos existan en la carpeta `pdfs/`
- Asegúrate de que los nombres coincidan exactamente
- Algunos navegadores bloquean PDFs en `file://`, usa un servidor local

### Los módulos no cargan
- Asegúrate de usar un servidor HTTP (no `file://`)
- Verifica que las rutas sean correctas
- Revisa la consola para errores de CORS

##  Compatibilidad

-  Chrome/Edge (últimas 2 versiones)
-  Firefox (últimas 2 versiones)
-  Safari (últimas 2 versiones)
-  Mobile Safari (iOS 13+)
-  Chrome Mobile (Android 8+)

##  Licencia

Proyecto interno de IPUC Central Cali - Departamento de Comunicaciones.

##  Contribuir

Para reportar problemas o sugerir mejoras, contacta al equipo de DECOM.
