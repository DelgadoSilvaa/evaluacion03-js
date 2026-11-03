import Pedido, { calcularTotal, resumen } from './pedidos.js';
import { render, mostrarMensaje } from './ui.js';

const form = document.getElementById('form-pedido');
const mensaje = document.getElementById('mensaje');
const filtro = document.getElementById('filtro');
const lista = document.getElementById('lista-pedidos');
const totalEl = document.getElementById('total');

let pedidos = [];
let siguienteId = 1;
const dibujar = () => render({ lista, totalEl, pedidos, filtro: filtro.value });

form.addEventListener('submit', (e) => {
  e.preventDefault();
  const producto = document.getElementById('producto').value.trim();
  const precio = parseFloat(document.getElementById('precio').value);
  const cantidad = parseInt(document.getElementById('cantidad').value, 10);

  if (producto === '') return mostrarMensaje(mensaje, 'El producto no puede estar vacío.');
  if (Number.isNaN(precio) || precio <= 0) return mostrarMensaje(mensaje, 'El precio debe ser mayor a 0.');
  if (Number.isNaN(cantidad) || cantidad < 0) return mostrarMensaje(mensaje, 'La cantidad no puede ser negativa.');

  mostrarMensaje(mensaje, '');
  pedidos = [...pedidos, new Pedido({ id: siguienteId++, producto, precio, cantidad })]; // spread, sin mutar
  form.reset();
  dibujar();
});

filtro.addEventListener('change', dibujar);

lista.addEventListener('click', (e) => {
  const btn = e.target.closest('button[data-id]');
  if (!btn) return;
  const id = Number(btn.dataset.id);
  pedidos = btn.dataset.accion === 'entregar'
    ? pedidos.map(p => (p.id === id ? p.marcarEntregado() : p))   // nuevo arreglo
    : pedidos.filter(p => p.id !== id);
  dibujar();
});

// Demostración con el arreglo del enunciado (ver consola)
const demo = [
  { producto: 'Café', precio: 6, cantidad: 2, cliente: { nombre: 'Ana' } },
  { producto: 'Croissant', precio: 4.5, cantidad: 0 },
  { producto: 'Jugo', precio: 8 }
];
console.log('Total correcto con IGV:', calcularTotal(demo).toFixed(2)); // 23.60
demo.forEach(p => console.log(resumen(p)));

dibujar();
