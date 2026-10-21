let escenaActual = 0;
let graficaDeciles = null;

// Datos exactos extraídos de tu último query SQL
const DATOS_DECILES = [
  { corte: 'Dic 2024', pequenos: 40.99, medianos: 12.56, corporativos: 46.44 },
  { corte: 'Mar 2025', pequenos: 40.79, medianos: 12.59, corporativos: 46.61 },
  { corte: 'Jun 2025', pequenos: 40.72, medianos: 12.72, corporativos: 46.56 },
  { corte: 'Sep 2025', pequenos: 40.32, medianos: 12.80, corporativos: 46.89 },
  { corte: 'Dic 2025', pequenos: 41.02, medianos: 13.27, corporativos: 45.71 },
  { corte: 'Mar 2026', pequenos: 40.60, medianos: 13.06, corporativos: 46.34 },
  { corte: 'Jun 2026', pequenos: 40.47, medianos: 12.62, corporativos: 46.90 },
  { corte: 'Sep 2026', pequenos: 39.86, medianos: 12.84, corporativos: 47.30 }
];

function renderizarEscena(index) {
  const escena = ESCENAS[index];
  if (!escena) return;
  escenaActual = index;

  document.getElementById('carousel-counter').textContent = String(index + 1).padStart(2, '0') + ' / ' + String(ESCENAS.length).padStart(2, '0');
  document.getElementById('carousel-title').textContent = escena.titulo;

  // 1. Construir el HTML
  let html = '<article class="scene">';
  
  // Texto y alertas
  escena.texto.forEach(p => html += '<p class="scene-text">' + p + '</p>');
  if (escena.alerta) html += '<div class="scene-alerta">⚠️ ' + escena.alerta + '</div>';

  // Imagen (si la escena la tiene)
  if (escena.imagen) {
    html += `
      <div class="scene-imagen-contenedor" style="margin: 1.5rem 0; text-align: center;">
        <img src="${escena.imagen}" alt="Análisis de datos" style="max-width: 100%; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
      </div>
    `;
  }

  // Contenedor para la gráfica de deciles (si aplica)
  if (escena.graficaDeciles) {
    html += '<div id="contenedor-grafica-escena" style="height: 260px; width: 100%; margin: 1.5rem 0; position: relative;"></div>';
  }

  if (escena.kpis) {
    html += '<div class="kpis">';
    escena.kpis.forEach(kpi => {
      html += '<div class="kpi"><div class="kpi-value">' + kpi.valor + '</div><div class="kpi-label">' + kpi.label + '</div>';
      if (kpi.cambio) html += '<div class="kpi-change ' + kpi.direccion + '">' + kpi.cambio + '</div>';
      html += '</div>';
    });
    html += '</div>';
  }

  if (escena.tabla) {
    html += '<div class="scene-tabla"><h4>' + escena.tabla.titulo + '</h4><table><thead><tr>';
    escena.tabla.columnas.forEach(col => html += '<th>' + col + '</th>');
    html += '</tr></thead><tbody>';
    escena.tabla.filas.forEach(fila => {
      html += '<tr>';
      fila.forEach(celda => html += '<td>' + celda + '</td>');
      html += '</tr>';
    });
    html += '</tbody></table></div>';
  }
  
  html += '</article>';
  document.getElementById('carousel-content').innerHTML = html;
  
  // 2. Destruir la gráfica anterior si existe
  if (graficaDeciles) {
    graficaDeciles.destroy();
    graficaDeciles = null;
  }

  // 3. Crear la nueva gráfica de barras (Deciles)
  if (escena.graficaDeciles) {
    setTimeout(() => {
      const contenedor = document.getElementById('contenedor-grafica-escena');
      if (!contenedor) return;

      const canvas = document.createElement('canvas');
      contenedor.appendChild(canvas);

      graficaDeciles = new Chart(canvas.getContext('2d'), {
        type: 'bar',
        data: {
          labels: DATOS_DECILES.map(d => d.corte),
          datasets: [
            {
              label: '80% Pequeños (Deciles 1-8)',
              data: DATOS_DECILES.map(d => d.pequenos),
              backgroundColor: '#D4AF37', // Oro UNAM
            },
            {
              label: '10% Medianos (Decil 9)',
              data: DATOS_DECILES.map(d => d.medianos),
              backgroundColor: '#888888', // Gris
            },
            {
              label: '10% Corporativos (Decil 10)',
              data: DATOS_DECILES.map(d => d.corporativos),
              backgroundColor: '#002B5C', // Azul UNAM
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { 
              position: 'bottom', 
              labels: { boxWidth: 12, font: { size: 10, family: 'Georgia' } } 
            },
            title: {
              display: true,
              text: 'Control de la Oferta de Alojamientos por Tipo de Anfitrión (%)',
              font: { size: 12, family: 'Georgia' },
              color: '#002B5C',
              padding: { bottom: 15 }
            },
            tooltip: {
              callbacks: {
                label: function(context) {
                  return `${context.dataset.label}: ${context.raw}%`;
                }
              }
            }
          },
          scales: {
            x: { 
              stacked: true, 
              grid: { display: false },
              ticks: { font: { size: 10, family: 'Georgia' } }
            },
            y: { 
              stacked: true, 
              min: 0, 
              max: 100,
              title: { display: true, text: '% del total de alojamientos', font: { size: 10, family: 'Georgia' } },
              ticks: { font: { size: 9 } }
            }
          }
        }
      });
    }, 150); 
  }

  actualizarDots();
}

function actualizarDots() {
  const container = document.getElementById('carousel-dots');
  let html = '';
  ESCENAS.forEach((_, i) => {
    html += '<button class="dot' + (i === escenaActual ? ' active' : '') + '" data-index="' + i + '"></button>';
  });
  container.innerHTML = html;
  container.querySelectorAll('.dot').forEach(dot => {
    dot.addEventListener('click', () => renderizarEscena(parseInt(dot.dataset.index)));
  });
}

function irAnterior() { if (escenaActual > 0) renderizarEscena(escenaActual - 1); }
function irSiguiente() { if (escenaActual < ESCENAS.length - 1) renderizarEscena(escenaActual + 1); }

// INICIALIZACIÓN DEL CARRUSEL
window.addEventListener('load', () => {
  document.getElementById('btn-prev').addEventListener('click', irAnterior);
  document.getElementById('btn-next').addEventListener('click', irSiguiente);

  setTimeout(() => {
    if (typeof ESCENAS !== 'undefined' && ESCENAS.length > 0) {
      renderizarEscena(0);
    } else {
      console.error("Error: El array ESCENAS no está definido.");
    }
  }, 100);
});