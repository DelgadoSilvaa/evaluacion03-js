import { calcularSubtotal, calcularTotal, IGV } from './pedidos.js';

export const mostrarMensaje = (el, texto) => { el.textContent = texto; };

export function render({ lista, totalEl, pedidos, filtro }) {
  const visibles = pedidos.filter(p => filtro === 'todos' || p.estado === filtro);
  lista.replaceChildren();
  for (const p of visibles) {
    const li = document.createElement('li');
    li.className = p.estado;
    const span = document.createElement('span');
    span.textContent = `${p.producto} – S/ ${p.precio.toFixed(2)} x ${p.cantidad} = S/ ${p.subtotal().toFixed(2)} [${p.estado}]`;
    li.append(span);
    if (p.estado === 'pendiente') li.append(crearBoton('Entregar', p.id, 'entregar'));
    li.append(crearBoton('Eliminar', p.id, 'eliminar'));
    lista.append(li);
  }
  totalEl.textContent =
    `Subtotal: S/ ${calcularSubtotal(visibles).toFixed(2)} | IGV ${IGV * 100}% | Total: S/ ${calcularTotal(visibles).toFixed(2)}`;
}

function crearBoton(texto, id, accion) {
  const b = document.createElement('button');
  b.textContent = texto;
  b.dataset.id = id;
  b.dataset.accion = accion;
  return b;
}
