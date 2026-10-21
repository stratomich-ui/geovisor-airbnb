let mapa = null;
let capaActual = null;
let geojsonData = null;
let geojsonAnfitrionesMenores = null;
let geojsonAnfitrionesProfesionales = null;
let geojsonCargado = false;
let variableActual = 'precio_2024_t4';
let miGrafica = null;

// Capa de transporte (fija, parte del mapa base)
let capaTransporte = null;

const VARIABLES_CONFIG = {
  'precio_2024_t4': { tipo: 'precio', campo: 'precio_2024_t4' },
  'precio_2025_t1': { tipo: 'precio', campo: 'precio_2025_t1' },
  'precio_2025_t2': { tipo: 'precio', campo: 'precio_2025_t2' },
  'precio_2025_t3': { tipo: 'precio', campo: 'precio_2025_t3' },
  'precio_2026_t1': { tipo: 'precio', campo: 'precio_2026_t1' },
  'precio_2026_t2': { tipo: 'precio', campo: 'precio_2026_t2' },
  'precio_2026_t3': { tipo: 'precio', campo: 'precio_2026_t3' },
  'crecimiento_total': { tipo: 'crecimiento', campo: 'cambio_cl_total' }
};

const COLORES_PRECIO = ['#FEF3C7', '#FDE68A', '#F59E0B', '#D97706', '#B45309', '#78350F'];
const COLORES_CRECIMIENTO = ['#991B1B', '#EF4444', '#FCA5A5', '#FEF08A', '#86EFAC', '#22C55E', '#15803D'];

// ============================================
// ALGORITMO DE JENKS
// ============================================
function calcularJenks(valores, numClases) {
  valores.sort((a, b) => a - b);
  const n = valores.length;
  const matrices = Array(numClases + 1).fill(0).map(() => Array(n + 1).fill(0));
  const lowerClassLimits = Array(numClases + 1).fill(0).map(() => Array(n + 1).fill(0));

  for (let i = 1; i <= numClases; i++) {
    matrices[i][1] = 0;
    lowerClassLimits[i][1] = 0;
    for (let j = 2; j <= n; j++) {
      let minVariance = Infinity;
      let sum = 0;
      let sumSquares = 0;
      for (let k = 1; k <= j; k++) {
        sum += valores[j - k];
        sumSquares += valores[j - k] * valores[j - k];
        const variance = sumSquares - (sum * sum) / k;
        if (k === 1) {
          matrices[i][j] = variance + matrices[i - 1][j - 1];
          lowerClassLimits[i][j] = j - 1;
          minVariance = matrices[i][j];
        } else if (variance + matrices[i - 1][j - k] < minVariance) {
          minVariance = variance + matrices[i - 1][j - k];
          matrices[i][j] = minVariance;
          lowerClassLimits[i][j] = j - k;
        }
      }
    }
  }

  const breaks = [];
  let k = n;
  for (let i = numClases; i > 1; i--) {
    k = lowerClassLimits[i][k];
    breaks.unshift(valores[k]);
  }
  breaks.unshift(valores[0]);
  breaks.push(valores[n - 1]);
  return breaks;
}

// ============================================
// INICIALIZACIÓN DEL MAPA Y CARGA DE DATOS
// ============================================
function inicializarMapa() {
  mapa = L.map('map', {
    center: [19.4326, -99.1332],
    zoom: 11,
    zoomControl: true,
    attributionControl: false
  });

  L.tileLayer('https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}.png', { maxZoom: 19 }).addTo(mapa);

  // Pane dedicado para el transporte: encima de tiles (200), debajo de overlays temáticos (400)
  mapa.createPane('transportePane');
  mapa.getPane('transportePane').style.zIndex = 250;
  mapa.getPane('transportePane').style.pointerEvents = 'none'; // no bloquea clics a capas temáticas

  // Grupo donde se renderizan las capas temáticas (Airbnb)
  capaActual = L.layerGroup().addTo(mapa);

  // Cargar el transporte como parte del "mapa base" (asíncrono, no bloqueante)
  cargarTransporte();
}

function cargarGeoJSON(callback) {
  fetch('data/precios_airbnb.geojson')
    .then(res => res.json())
    .then(data => {
      geojsonData = data;
      if (callback) callback();
    })
    .catch(err => console.error('❌ Error GeoJSON Alcaldías:', err));
}

function cargarCapasPoligonos(callback) {
  let cargadas = 0;
  const total = 2;
  function verificar() { cargadas++; if (cargadas === total && callback) callback(); }

  fetch('data/anfitriones_menores.geojson')
    .then(res => res.json())
    .then(data => { geojsonAnfitrionesMenores = data; verificar(); })
    .catch(err => console.error('Error anfitriones_menores:', err));

  fetch('data/anfitriones_profesionales.geojson')
    .then(res => res.json())
    .then(data => { geojsonAnfitrionesProfesionales = data; verificar(); })
    .catch(err => console.error('Error anfitriones_profesionales:', err));
}

// ============================================
// CAPA DE TRANSPORTE (FIJA, MAPA BASE)
// ============================================
function estiloTransporte(feature) {
  const p = feature.properties || {};
  const tipo = parseInt(p.route_type, 10);
  const color = p.route_color ? `#${p.route_color.replace('#', '')}` : '#555555';

  const base = {
    color: color,
    weight: 2.5,
    opacity: 0.9,
    lineCap: 'round',
    lineJoin: 'round',
    pane: 'transportePane'
  };

  switch (tipo) {
    case 1: return { ...base, weight: 3.5, opacity: 1.0,  dashArray: null };       // Metro
    case 3: return { ...base, weight: 2.5, opacity: 0.9,  dashArray: null };       // Metrobús / Trolebús
    case 6: return { ...base, weight: 3.0, opacity: 0.95, dashArray: '6 6' };      // Cablebús
    default: return { ...base, dashArray: '2 4' };
  }
}

function popupTransporte(feature) {
  const p = feature.properties || {};
  const tipoLabel = { 1: 'Metro', 3: 'Metrobús / Trolebús', 6: 'Cablebús' }[p.route_type] || 'Transporte';
  const colorHex = p.route_color ? `#${p.route_color.replace('#', '')}` : '#555';
  const km = p.longitud_km ? Number(p.longitud_km).toFixed(2) : '—';

  return `
    <div style="min-width:200px;">
      <div style="display:flex; align-items:center; gap:8px; margin-bottom:6px;">
        <span style="display:inline-block; width:14px; height:14px; border-radius:3px;
                     background:${colorHex}; border:1px solid #333;"></span>
        <strong>${p.route_short_name || ''} · ${p.route_long_name || ''}</strong>
      </div>
      <div style="font-size:0.8rem; line-height:1.35;">
        <div><b>Tipo:</b> ${tipoLabel}</div>
        <div><b>Longitud:</b> ${km} km</div>
        <div><b>Route ID:</b> ${p.route_id || '—'}</div>
      </div>
    </div>`;
}

function cargarTransporte() {
  fetch('data/transporte.geojson')
    .then(res => {
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return res.json();
    })
    .then(geojson => {
      capaTransporte = L.geoJSON(geojson, {
        style: estiloTransporte,
        renderer: L.canvas({ padding: 0.5, pane: 'transportePane' }),
        onEachFeature: (f, layer) => {
          layer.bindPopup(popupTransporte(f));
          layer.bindTooltip(
            `${f.properties.route_short_name || ''} · ${f.properties.route_long_name || ''}`,
            { sticky: true }
          );
        }
      }).addTo(mapa);

      // Aseguramos que quede encima de los tiles
      capaTransporte.bringToFront();

      // Leyenda fija del transporte
      inyectarLeyendaTransporte();
    })
    .catch(err => console.error('❌ Error transporte.geojson:', err));
}

function inyectarLeyendaTransporte() {
  if (document.getElementById('leyenda-transporte')) return;

  const cont = document.createElement('div');
  cont.id = 'leyenda-transporte';
  cont.className = 'legend legend-base';
  cont.innerHTML = `
    <h4>Red de transporte</h4>
    <div class="legend-item"><span class="legend-line" style="background:#F94F8E; height:4px;"></span> Metro</div>
    <div class="legend-item"><span class="legend-line" style="background:#7A9A01; height:3px;"></span> Metrobús / Trolebús</div>
    <div class="legend-item"><span class="legend-line" style="background:#4EC3E0; height:3px; background-image:repeating-linear-gradient(90deg,#4EC3E0 0 6px,transparent 6px 12px);"></span> Cablebús</div>
  `;

  const mapEl = document.getElementById('map');
  if (mapEl && mapEl.parentNode) {
    mapEl.parentNode.appendChild(cont);
  } else {
    document.body.appendChild(cont);
  }
}

// ============================================
// LÓGICA DE LA GRÁFICA TEMPORAL
// ============================================
function inicializarGrafica() {
  const canvas = document.getElementById('grafica-precios');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  miGrafica = new Chart(ctx, {
    type: 'line',
    data: {
      labels: ['Dic 24', 'Mar 25', 'Jun 25', 'Sep 25', 'Mar 26', 'Jun 26', 'Sep 26'],
      datasets: [{
        label: 'Precio Promedio (MXN)',
        data: [0, 0, 0, 0, 0, 0, 0],
        borderColor: '#002B5C',
        backgroundColor: 'rgba(212, 175, 55, 0.15)',
        borderWidth: 2,
        fill: true,
        tension: 0.4,
        pointBackgroundColor: '#D4AF37',
        pointBorderColor: '#FFF',
        pointBorderWidth: 1.5,
        pointRadius: 4
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: function (context) { return '$' + context.raw.toLocaleString() + ' MXN'; }
          }
        }
      },
      scales: {
        y: { beginAtZero: false, grid: { color: '#F0F0F0' }, ticks: { font: { size: 10, family: 'Georgia' } } },
        x: { grid: { display: false }, ticks: { font: { size: 10, family: 'Georgia' } } }
      }
    }
  });
  actualizarGraficaCDMX();
}

function actualizarGrafica(nombreAlcaldia, propiedades) {
  if (!miGrafica) return;
  const titulo = document.getElementById('chart-title');
  if (nombreAlcaldia && propiedades) {
    titulo.textContent = `Tendencia: ${nombreAlcaldia}`;
    miGrafica.data.datasets[0].data = [
      parseFloat(propiedades.precio_2024_t4) || 0, parseFloat(propiedades.precio_2025_t1) || 0,
      parseFloat(propiedades.precio_2025_t2) || 0, parseFloat(propiedades.precio_2025_t3) || 0,
      parseFloat(propiedades.precio_2026_t1) || 0, parseFloat(propiedades.precio_2026_t2) || 0,
      parseFloat(propiedades.precio_2026_t3) || 0
    ];
  } else {
    actualizarGraficaCDMX();
    return;
  }
  miGrafica.update();
}

function actualizarGraficaCDMX() {
  if (!miGrafica || !geojsonData) return;
  const titulo = document.getElementById('chart-title');
  if (titulo) titulo.textContent = 'Tendencia de Precios (Promedio CDMX)';
  let sumas = [0, 0, 0, 0, 0, 0, 0];
  let conteo = 0;
  geojsonData.features.forEach(f => {
    const p = f.properties;
    if (p.precio_2024_t4) {
      sumas[0] += parseFloat(p.precio_2024_t4) || 0;
      sumas[1] += parseFloat(p.precio_2025_t1) || 0;
      sumas[2] += parseFloat(p.precio_2025_t2) || 0;
      sumas[3] += parseFloat(p.precio_2025_t3) || 0;
      sumas[4] += parseFloat(p.precio_2026_t1) || 0;
      sumas[5] += parseFloat(p.precio_2026_t2) || 0;
      sumas[6] += parseFloat(p.precio_2026_t3) || 0;
      conteo++;
    }
  });
  miGrafica.data.datasets[0].data = sumas.map(s => conteo > 0 ? Math.round(s / conteo) : 0);
  miGrafica.update();
}

// ============================================
// RENDERIZADO PRINCIPAL (SEGÚN LA CAPA SELECCIONADA)
// ============================================
function renderizarMapa(variable, capa) {
  if (!capaActual) return;
  capaActual.clearLayers();

  if (capa === 'alcaldias') {
    if (!geojsonData) return;
    renderizarAlcaldias(variable);
  } else if (capa === 'anfitriones_menores') {
    if (!geojsonAnfitrionesMenores) return;
    renderizarPoligonosMenores(geojsonAnfitrionesMenores);
  } else if (capa === 'anfitriones_profesionales') {
    if (!geojsonAnfitrionesProfesionales) return;
    renderizarPoligonosProfesionales(geojsonAnfitrionesProfesionales);
  }
}

// ============================================
// RENDERIZADO DE ALCALDÍAS (POLÍGONOS JENKS)
// ============================================
function renderizarAlcaldias(variable) {
  const config = VARIABLES_CONFIG[variable];
  if (!config) return;

  let valores = geojsonData.features.map(f => {
    let val = f.properties[config.campo];
    if (val === null || val === undefined || val === '') return null;
    return parseFloat(typeof val === 'string' ? val.replace(/,/g, '') : val);
  }).filter(v => v !== null && !isNaN(v));

  if (valores.length === 0) {
    L.geoJSON(geojsonData, {
      style: { fillColor: '#CCCCCC', weight: 1, color: '#FFF', fillOpacity: 0.8 }
    }).addTo(capaActual);
    document.getElementById('leyenda').innerHTML =
      `<span class="legend-title" style="color:#A01C2E;">Sin datos para este periodo</span>`;
    return;
  }

  const breaks = calcularJenks(valores, 5);
  const coloresUsados = config.tipo === 'precio'
    ? [COLORES_PRECIO[0], COLORES_PRECIO[1], COLORES_PRECIO[2], COLORES_PRECIO[3], COLORES_PRECIO[4]]
    : [COLORES_CRECIMIENTO[0], COLORES_CRECIMIENTO[1], COLORES_CRECIMIENTO[2], COLORES_CRECIMIENTO[3], COLORES_CRECIMIENTO[4]];

  L.geoJSON(geojsonData, {
    style: feature => {
      let rawVal = feature.properties[config.campo];
      let v = (rawVal !== undefined && rawVal !== null && rawVal !== '')
        ? parseFloat(String(rawVal).replace(/,/g, ''))
        : null;
      let color = '#CCCCCC';
      if (v !== null && !isNaN(v)) {
        if (v <= breaks[1]) color = coloresUsados[0];
        else if (v <= breaks[2]) color = coloresUsados[1];
        else if (v <= breaks[3]) color = coloresUsados[2];
        else if (v <= breaks[4]) color = coloresUsados[3];
        else color = coloresUsados[4];
      }
      return { fillColor: color, weight: 1.5, opacity: 0.9, color: '#FFFFFF', fillOpacity: 0.9 };
    },
    onEachFeature: (feature, layer) => {
      let v = feature.properties[config.campo] ? parseFloat(feature.properties[config.campo]) : null;
      layer.bindPopup(
        `<strong>${feature.properties.nomgeo}</strong><br>` +
        (v
          ? (config.tipo === 'precio' ? '$' + v.toLocaleString() + ' MXN' : v.toFixed(1) + '%')
          : 'Sin datos')
      );
      layer.on('mouseover', function () {
        this.setStyle({ weight: 3, color: '#002B5C' });
        actualizarGrafica(feature.properties.nomgeo, feature.properties);
      });
      layer.on('mouseout', function () {
        this.setStyle({ weight: 1.5, color: '#FFFFFF' });
        actualizarGraficaCDMX();
      });
    }
  }).addTo(capaActual);

  const leyenda = document.getElementById('leyenda');
  let html = `<span class="legend-title">${config.tipo === 'precio' ? 'Precio (MXN)' : 'Crecimiento (%)'}</span><div class="legend-group">`;
  for (let i = 0; i < coloresUsados.length; i++) {
    const min = breaks[i];
    const max = breaks[i + 1];
    const label = config.tipo === 'precio'
      ? `$${Math.round(min).toLocaleString()} - $${Math.round(max).toLocaleString()}`
      : `${min.toFixed(1)}% - ${max.toFixed(1)}%`;
    html += `<div class="legend-item"><span class="legend-dot" style="background:${coloresUsados[i]};"></span> ${label}</div>`;
  }
  leyenda.innerHTML = html + `</div>`;
}

// ============================================
// RENDERIZADO DE POLÍGONOS: ANFITRIONES MENORES
// ============================================
function renderizarPoligonosMenores(geojson) {
  function getColor(count) {
    if (count >= 10 && count <= 14) return '#edf8fb';
    if (count > 14 && count <= 20) return '#c6dbeb';
    if (count > 20 && count <= 27) return '#a6bbd9';
    if (count > 27 && count <= 38) return '#8c96c6';
    if (count > 38 && count <= 43) return '#896bb1';
    if (count > 43 && count <= 52) return '#863e99';
    if (count > 52 && count <= 64) return '#810f7c';
    return '#CCCCCC';
  }

  L.geoJSON(geojson, {
    style: function (feature) {
      let c = feature.properties.COUNT || 0;
      return {
        fillColor: getColor(c),
        weight: 1,
        opacity: 1,
        color: '#FFFFFF',
        fillOpacity: 0.9
      };
    },
    onEachFeature: function (feature, layer) {
      let nombre = feature.properties.host_name || feature.properties.nomgeo || 'N/A';
      let count = feature.properties.COUNT || 'N/A';
      layer.bindPopup(`<strong>Anfitrión Menor</strong><br>${nombre}<br>COUNT: ${count}`);
    }
  }).addTo(capaActual);

  document.getElementById('leyenda').innerHTML = `
    <span class="legend-title">Anfitriones Menores (COUNT):</span>
    <div class="legend-group">
      <div class="legend-item"><span class="legend-dot" style="background:#edf8fb;"></span> 10 - 14</div>
      <div class="legend-item"><span class="legend-dot" style="background:#c6dbeb;"></span> 14 - 20</div>
      <div class="legend-item"><span class="legend-dot" style="background:#a6bbd9;"></span> 20 - 27</div>
      <div class="legend-item"><span class="legend-dot" style="background:#8c96c6;"></span> 27 - 38</div>
      <div class="legend-item"><span class="legend-dot" style="background:#896bb1;"></span> 38 - 43</div>
      <div class="legend-item"><span class="legend-dot" style="background:#863e99;"></span> 43 - 52</div>
      <div class="legend-item"><span class="legend-dot" style="background:#810f7c;"></span> 52 - 64</div>
    </div>`;
}

// ============================================
// RENDERIZADO DE POLÍGONOS: ANFITRIONES PROFESIONALES
// ============================================
function renderizarPoligonosProfesionales(geojson) {
  function getColor(count) {
    if (count >= 10 && count <= 36) return '#feebe2';
    if (count > 36 && count <= 75) return '#fcc6c7';
    if (count > 75 && count <= 144) return '#fa9bb1';
    if (count > 144 && count <= 226) return '#f768a1';
    if (count > 226 && count <= 307) return '#d63592';
    if (count > 307 && count <= 479) return '#ac1284';
    if (count > 479 && count <= 816) return '#7a0177';
    return '#CCCCCC';
  }

  L.geoJSON(geojson, {
    style: function (feature) {
      let c = feature.properties.COUNT || 0;
      return {
        fillColor: getColor(c),
        weight: 1,
        opacity: 1,
        color: '#FFFFFF',
        fillOpacity: 0.9
      };
    },
    onEachFeature: function (feature, layer) {
      let nombre = feature.properties.host_name || feature.properties.nomgeo || 'N/A';
      let count = feature.properties.COUNT || 'N/A';
      layer.bindPopup(`<strong>Anfitrión Profesional</strong><br>${nombre}<br>COUNT: ${count}`);
    }
  }).addTo(capaActual);

  document.getElementById('leyenda').innerHTML = `
    <span class="legend-title">Anfitriones Profesionales (COUNT):</span>
    <div class="legend-group">
      <div class="legend-item"><span class="legend-dot" style="background:#feebe2;"></span> 10 - 36</div>
      <div class="legend-item"><span class="legend-dot" style="background:#fcc6c7;"></span> 36 - 75</div>
      <div class="legend-item"><span class="legend-dot" style="background:#fa9bb1;"></span> 75 - 144</div>
      <div class="legend-item"><span class="legend-dot" style="background:#f768a1;"></span> 144 - 226</div>
      <div class="legend-item"><span class="legend-dot" style="background:#d63592;"></span> 226 - 307</div>
      <div class="legend-item"><span class="legend-dot" style="background:#ac1284;"></span> 307 - 479</div>
      <div class="legend-item"><span class="legend-dot" style="background:#7a0177;"></span> 479 - 816</div>
    </div>`;
}

// ============================================
// INICIALIZACIÓN GENERAL
// ============================================
document.addEventListener('DOMContentLoaded', () => {
  inicializarMapa();

  document.querySelectorAll('.map-tab').forEach(tab => {
    tab.addEventListener('click', function () {
      document.querySelectorAll('.map-tab').forEach(t => t.classList.remove('active'));
      document.querySelectorAll('.map-panel').forEach(p => p.classList.remove('active'));
      this.classList.add('active');
      document.getElementById('panel-' + this.dataset.tab).classList.add('active');
    });
  });

  document.getElementById('select-variable').addEventListener('change', function () {
    variableActual = this.value;
    if (geojsonCargado) renderizarMapa(variableActual, document.getElementById('select-capa').value);
  });

  document.getElementById('select-capa').addEventListener('change', function () {
    let capa = this.value;
    document.getElementById('select-variable').disabled = (capa !== 'alcaldias');
    renderizarMapa(variableActual, capa);
  });

  // Cargar todo al inicio
  cargarGeoJSON(() => {
    cargarCapasPoligonos(() => {
      geojsonCargado = true;
      renderizarMapa(variableActual, 'alcaldias');
      inicializarGrafica();
    });
  });
});