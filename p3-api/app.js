const form = document.getElementById('form-clima');
const inputCiudad = document.getElementById('ciudad');
const btn = document.getElementById('btn-buscar');
const estado = document.getElementById('estado');
const resultado = document.getElementById('resultado');

// 1) Geocodificación: nombre -> coordenadas
async function buscarCiudad(nombre) {
  const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(nombre)}&count=1&language=es`;
  const resp = await fetch(url, { cache: 'no-store' });
  if (!resp.ok) throw new Error(`Error HTTP ${resp.status} en geocodificación`); // fetch NO lanza en 404/500
  const data = await resp.json();
  if (!data.results || data.results.length === 0) {                          // sin resultados: no existe "results"
    throw new Error(`No se encontró la ciudad "${nombre}"`);
  }
  return data.results[0]; // { name, admin1, latitude, longitude, ... }
}

// 2) Clima actual: coordenadas -> datos
async function obtenerClima(lat, lon) {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,wind_speed_10m`;
  const resp = await fetch(url, { cache: 'no-store' });
  if (!resp.ok) throw new Error(`Error HTTP ${resp.status} en clima`);
  const data = await resp.json();
  return data.current; // { temperature_2m, wind_speed_10m }
}

const climaDeCiudad = async (nombre) => {
  const ciudad = await buscarCiudad(nombre);
  const actual = await obtenerClima(ciudad.latitude, ciudad.longitude);
  return { ciudad, actual };
};

function mostrar({ ciudad, actual }) {
  resultado.replaceChildren();
  const lineas = [
    `Ciudad: ${ciudad.name}`,
    `Región: ${ciudad.admin1 ?? 'N/D'}`,
    `Temperatura: ${actual.temperature_2m} °C`,
    `Viento: ${actual.wind_speed_10m} km/h`
  ];
  lineas.forEach(t => { const p = document.createElement('p'); p.textContent = t; resultado.append(p); });
}

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const nombre = inputCiudad.value.trim();
  if (!nombre) { estado.className = 'error'; estado.textContent = 'Escribe una ciudad.'; return; }

  estado.className = '';
  estado.textContent = 'Cargando…';
  btn.disabled = true;
  resultado.replaceChildren();
  try {
    mostrar(await climaDeCiudad(nombre));
    estado.textContent = '';
  } catch (err) {
    estado.className = 'error';
    estado.textContent = err instanceof TypeError
      ? 'Sin conexión: revisa tu internet e inténtalo de nuevo.'   // fallo de red => TypeError
      : err.message;
  } finally {
    btn.disabled = false;   // siempre se rehabilita
  }
});

// ---------- Mediciones ----------
const CIUDADES = ['Lima', 'Cusco', 'Arequipa'];

async function secuencial() {
  const t0 = performance.now();
  await climaDeCiudad(CIUDADES[0]);
  await climaDeCiudad(CIUDADES[1]);
  await climaDeCiudad(CIUDADES[2]);
  return performance.now() - t0;
}
async function paralelo() {
  const t0 = performance.now();
  await Promise.all(CIUDADES.map(climaDeCiudad));
  return performance.now() - t0;
}

document.getElementById('btn-medir').addEventListener('click', async () => {
  const cont = document.getElementById('tabla-tiempos');
  cont.textContent = 'Midiendo…';
  const filas = [];
  for (let i = 1; i <= 3; i++) filas.push([i, await secuencial(), await paralelo()]);
  const prom = (k) => filas.reduce((a, f) => a + f[k], 0) / filas.length;

  const tabla = document.createElement('table');
  tabla.innerHTML = '<tr><th>Medición</th><th>Secuencial (ms)</th><th>Promise.all (ms)</th></tr>';
  filas.forEach(([n, s, p]) => {
    const tr = tabla.insertRow();
    [n, s.toFixed(0), p.toFixed(0)].forEach(v => (tr.insertCell().textContent = v));
  });
  const tr = tabla.insertRow();
  ['Promedio', prom(1).toFixed(0), prom(2).toFixed(0)].forEach(v => (tr.insertCell().textContent = v));
  cont.replaceChildren(tabla);
});

document.getElementById('btn-settled').addEventListener('click', async () => {
  const salida = document.getElementById('salida-settled');
  salida.textContent = 'Cargando…';
  const nombres = ['Lima', 'Cusco', 'Xyzabc'];
  const res = await Promise.allSettled(nombres.map(climaDeCiudad));
  salida.textContent = res.map((r, i) =>
    r.status === 'fulfilled'
      ? `${nombres[i]}: OK ${r.value.actual.temperature_2m} °C`
      : `${nombres[i]}: ERROR ${r.reason.message}`).join('\n');
});
