export const listadoProductos = document.getElementById("listadoProductos");
export const carritoProductos = document.getElementById("carritoProductos");
export const buscadorTop = document.getElementById("buscadorTop");
export const botonesCategorias = document.querySelectorAll(".category-item");
// SUPABASE INTEGRATION: Nuevo carrito en header reemplaza botón flotante
export const botonCarritoHeader = document.getElementById("botonCarritoHeader");
export const numeritoHeader = document.getElementById("numeritoHeader");
export const cerrarCarrito = document.getElementById("cerrarCarrito");
export const carrito = document.getElementById("carrito");
export const carritoTotal = document.getElementById("carritoTotal");
export const numeritoContenedor = document.getElementById("numerito");
export const botonesAgregar = document.querySelectorAll('.producto__agregar');
export const botonVaciar = document.getElementById("vaciarCarrito");
// export const verTodos = document.querySelector(".verTodos");
export const tituloCategorias = document.querySelector("#listadoCategorias .titulo");
export const botonesWhatsApp = document.querySelectorAll('.producto__whatsapp');
// **VERIFICACIÓN DE ELEMENTOS DEL DOM**
// Verificar que los elementos críticos existan al cargar
console.log('Elementos del DOM cargados:', {
    botonCarritoHeader: !!botonCarritoHeader,
    numeritoHeader: !!numeritoHeader,
    cerrarCarrito: !!cerrarCarrito,
    carrito: !!carrito,
    carritoProductos: !!carritoProductos,
    carritoTotal: !!carritoTotal
});