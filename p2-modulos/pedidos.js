export const IGV = 0.18;                      // export nombrado: constante/utilidad

// export default: este módulo "es" la clase Pedido
export default class Pedido {
  constructor({ id, producto, precio, cantidad, estado = 'pendiente', cliente } = {}) {
    Object.assign(this, { id, producto, precio, cantidad, estado, cliente });
  }
  subtotal() { return this.precio * (this.cantidad ?? 1); }   // ?? respeta el 0
  // No muta: devuelve un Pedido nuevo (spread)
  marcarEntregado() { return new Pedido({ ...this, estado: 'entregado' }); }
}

export const calcularSubtotal = (pedidos) =>
  pedidos.reduce((acc, { precio, cantidad }) => acc + precio * (cantidad ?? 1), 0);

export const calcularTotal = (pedidos) => calcularSubtotal(pedidos) * (1 + IGV);

export const resumen = ({ producto, cantidad = 1, cliente }) =>
  `Pedido de ${cliente?.nombre ?? 'Anónimo'}: ${producto} x${cantidad}`;
