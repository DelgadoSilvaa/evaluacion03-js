// Código antiguo del practicante (CON el error de lógica). Ejecutar: node antiguo.js
var IGV = 0.18;
function calcularTotal(pedidos) {
  var total = 0;
  for (var i = 0; i < pedidos.length; i++) {
    var cantidad = pedidos[i].cantidad || 1;   // <-- ERROR: 0 es falsy, se convierte en 1
    total = total + pedidos[i].precio * cantidad;
  }
  return total + total * IGV;
}
var pedidos = [
  { producto: "Café", precio: 6, cantidad: 2, cliente: { nombre: "Ana" } },
  { producto: "Croissant", precio: 4.5, cantidad: 0 },
  { producto: "Jugo", precio: 8 }
];
console.log("Total antiguo:", calcularTotal(pedidos).toFixed(2)); // 28.91 (incorrecto)
