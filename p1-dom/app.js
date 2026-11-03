// true  = render seguro (createElement + textContent)
// false = render INSEGURO (innerHTML) -> solo para la prueba de seguridad "antes"
const MODO_SEGURO = true;

   console.log('MODO_SEGURO =', MODO_SEGURO);

const form = document.getElementById('form-pedido');
const mensaje = document.getElementById('mensaje');
const filtro = document.getElementById('filtro');
const lista = document.getElementById('lista-pedidos');
const totalEl = document.getElementById('total');

const pedidos = [];      // única fuente de verdad
let siguienteId = 1;

// Cada pedido es un objeto con propiedades y métodos
function crearPedido(producto, precio, cantidad) {
  return {
    id: siguienteId++,
    producto,
    precio,
    cantidad,
    estado: 'pendiente',
    subtotal() { return this.precio * this.cantidad; },
    marcarEntregado() { this.estado = 'entregado'; }
  };
}

// Dibuja la lista y el total SIEMPRE a partir del arreglo
function render() {
  const visibles = pedidos.filter(p => filtro.value === 'todos' || p.estado === filtro.value);
  lista.innerHTML = '';

  visibles.forEach(p => {
    const li = document.createElement('li');
    li.className = p.estado;
    const texto = `${p.producto} – S/ ${p.precio.toFixed(2)} x ${p.cantidad} = S/ ${p.subtotal().toFixed(2)} [${p.estado}]`;

    if (MODO_SEGURO) {
      const span = document.createElement('span');
      span.textContent = texto;                 // el texto NUNCA se interpreta como HTML
      li.appendChild(span);
    } else {
      li.innerHTML = `<span>${texto}</span>`;   // VULNERABLE a XSS
    }

    if (p.estado === 'pendiente') {
      const bE = document.createElement('button');
      bE.textContent = 'Entregar';
      bE.dataset.id = p.id; bE.dataset.accion = 'entregar';
      li.appendChild(bE);
    }
    const bX = document.createElement('button');
    bX.textContent = 'Eliminar';
    bX.dataset.id = p.id; bX.dataset.accion = 'eliminar';
    li.appendChild(bX);

    lista.appendChild(li);
  });

  const total = visibles.reduce((acc, p) => acc + p.subtotal(), 0);
  totalEl.textContent = `Total a cobrar: S/ ${total.toFixed(2)}`;
}

// submit + validación
form.addEventListener('submit', (e) => {
  e.preventDefault();
  const producto = document.getElementById('producto').value.trim();
  const precio = parseFloat(document.getElementById('precio').value);
  const cantidad = parseInt(document.getElementById('cantidad').value, 10);

  if (producto === '') return (mensaje.textContent = 'El producto no puede estar vacío.');
  if (Number.isNaN(precio) || precio <= 0) return (mensaje.textContent = 'El precio debe ser mayor a 0.');
  if (Number.isNaN(cantidad) || cantidad < 0) return (mensaje.textContent = 'La cantidad no puede ser negativa.');

  mensaje.textContent = '';
  pedidos.push(crearPedido(producto, precio, cantidad));
  form.reset();
  render();
});

// filtro
filtro.addEventListener('change', render);

// DELEGACIÓN: un solo listener para todos los botones
lista.addEventListener('click', (e) => {
  const btn = e.target.closest('button[data-id]');
  if (!btn) return;
  const id = Number(btn.dataset.id);
  if (btn.dataset.accion === 'entregar') {
    pedidos.find(p => p.id === id)?.marcarEntregado();
  } else if (btn.dataset.accion === 'eliminar') {
    const i = pedidos.findIndex(p => p.id === id);
    if (i !== -1) pedidos.splice(i, 1);
  }
  render();
});

render();
