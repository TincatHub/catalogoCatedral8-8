import * as Botones from "./botones.js";
import * as DomElements from "./domElements.js";
import * as WhatsApp from "./whatsapp.js";
import { supabase } from "../../src/config/supabase.js";

// Setea los precios con los decimales separados por coma, en lugar de por punto
export function toLocaleFixed (num) {
    return num.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
};

// SUPABASE INTEGRATION: Imprime productos desde base de datos
// Relaciones: product.id->sku, product.name->titulo, product.price->precio, product.category->categoria
// Nuevos campos: product.installments, installmentPrice calculado
export function imprimirProductos(listadoProductos, productos) {
    listadoProductos.innerHTML = "";
    for (const producto of productos) {
        // Calcular precio de cuota (installmentPrice = precio / cuotas)
        const installmentPrice = producto.precio / (producto.installments || 12);
        const precioMostrar = producto.on_sale && producto.sale_price ? producto.sale_price : producto.precio;
        const installmentPriceMostrar = precioMostrar / (producto.installments || 12);
        
        let contenedorProducto = document.createElement("div");
        contenedorProducto.className = "producto";
        contenedorProducto.id = producto.sku; // product.id
        contenedorProducto.innerHTML = `
        <div class="producto__img">
            <img src="${producto.imagen}" alt="${producto.titulo}">
        </div>
        <h4 class="producto__titulo">${producto.titulo.toUpperCase()}</h4>
        <div class="producto__cuotas">${producto.installments || 12} cuotas de $${toLocaleFixed(installmentPriceMostrar)}</div>
        <h4 class="producto__precio">$<span>${toLocaleFixed(precioMostrar)}</span></h4>
        ${producto.on_sale ? '<div class="producto__oferta">EN OFERTA</div>' : ''}
        <div class="producto__agregar">AGREGAR AL PEDIDO</div>
        ${producto.stock <= 0 ? '<div class="producto__sinStock">SIN STOCK</div>' : ''}
        <div class="producto__whatsapp">
            <i class="fab fa-whatsapp"></i>
            <p>CONSULTAR POR WHATSAPP</p>
        </div>
        `;
        listadoProductos.appendChild(contenedorProducto);
    }

    Botones.asignarBotonesAgregar(productos);
    WhatsApp.asignarBotonesWhatsApp(productos);
}

// SUPABASE INTEGRATION: Función para cargar productos desde base de datos
export async function loadProductsFromDatabase() {
    try {
        const { data, error } = await supabase
            .from('products')
            .select('*')
            .order('created_at', { ascending: false });
        
        if (error) throw error;
        
        // Transformar datos de Supabase al formato esperado
        return data.map(product => ({
            sku: product.id,                    // product.id -> sku
            titulo: product.description,               // product.description -> titulo
            imagen: product.image_url,          // product.image_url -> imagen
            precio: product.price,              // product.price -> precio
            categoria: product.category,        // product.category -> categoria
            installments: product.installments || 12,
            sale_price: product.sale_price,
            on_sale: product.on_sale || false,
            stock: product.stock || 0
        }));
    } catch (error) {
        console.error('Error cargando productos:', error);
        return [];
    }
}

export let carritoAgregados = []; // Declara el array de los productos agregados al Carrito

// **FUNCIÓN PARA IMPRIMIR PRODUCTOS EN EL CARRITO**
// Esta función actualiza la visualización del carrito lateral con todos los productos agregados
// Muestra: imagen, título, cuotas, cantidad, precio total y botones de control
// SUPABASE INTEGRATION: Imprime productos en carrito con información de cuotas
// Muestra: cantidad de cuotas, precio por cuota (installmentPrice), precio total
export function imprimirProductosEnCarrito() {
    const carritoProductos = document.getElementById("carritoProductos");
    if (!carritoProductos) {
        console.error('Elemento carritoProductos no encontrado');
        return;
    }
    
    carritoProductos.innerHTML = "";
    
    // Si no hay productos en el carrito, mostrar mensaje
    if (!carritoAgregados || carritoAgregados.length === 0) {
        carritoProductos.innerHTML = '<div class="carrito-vacio">Tu carrito está vacío</div>';
        return;
    }
    
    carritoAgregados.forEach((productoAgregado) => {
        // Calcular precio por cuota para mostrar en carrito
        const precioUnitario = productoAgregado.on_sale && productoAgregado.sale_price ? 
            productoAgregado.sale_price : productoAgregado.precio;
        const installmentPrice = precioUnitario / (productoAgregado.installments || 12);
        const precioTotalProducto = precioUnitario * productoAgregado.cantidad;
        
        let nuevoProducto = document.createElement("div");
        nuevoProducto.className = "nuevoProducto";
        nuevoProducto.id = "agregado" + productoAgregado.sku; // product.id
        nuevoProducto.innerHTML = `
            <div class="carritoImagen">
                <img src="${productoAgregado.imagen}" alt="${productoAgregado.titulo}">
            </div>
            <div class="carritoTitulo">${productoAgregado.titulo}</div>
            <div class="carritoCuotas">${productoAgregado.installments || 12} x $${toLocaleFixed(installmentPrice)}</div>
            <div class="carritoCantidad">
                <div class="menos">-</div>
                <div class="cant">${productoAgregado.cantidad}</div>
                <div class="mas">+</div>
            </div>
            <div class="carritoPrecio">$${toLocaleFixed(precioTotalProducto)}</div>
            <div class="carritoBorrar"><i class="fas fa-trash-alt"></i></div>
        `;
        carritoProductos.appendChild(nuevoProducto);
    });

    Botones.asignarBotonesMasMenos();
    Botones.asignarBotonesBorrar();
    actualizarPrecioTotal();
    actualizarNumerito();
    Botones.estaVacioCheck(); // Chequea si el Carrito quedó vacío para ocultarlo
    localStorage.setItem("productos", JSON.stringify(carritoAgregados));
}

// **FUNCIÓN PARA ACTUALIZAR PRECIO TOTAL DEL CARRITO**
// Calcula el precio total considerando ofertas y cantidades de cada producto
// SUPABASE INTEGRATION: Actualizar precio total considerando ofertas y precios de venta
function actualizarPrecioTotal() {
    const carritoTotal = document.getElementById("carritoTotal");
    if (!carritoTotal) {
        console.error('Elemento carritoTotal no encontrado');
        return;
    }
    
    // Suma precios considerando ofertas (sale_price si on_sale es true)
    const precioTotal = carritoAgregados.reduce((suma, producto) => {
        const precioUnitario = producto.on_sale && producto.sale_price ? 
            producto.sale_price : producto.precio;
        return suma + (precioUnitario * producto.cantidad);
    }, 0); 
    carritoTotal.textContent = toLocaleFixed(precioTotal);
    
    localStorage.setItem("precioTotal", precioTotal);
}

export let numerito = 0;

// **FUNCIÓN PARA ACTUALIZAR EL NUMERITO DEL CARRITO**
// Actualiza el contador de productos en el header y aplica animación
function actualizarNumerito() {
    const numeritoHeader = document.getElementById('numeritoHeader');
    
    if (numeritoHeader) {
        // Se agregan y quitan clases para generar la animación CSS
        numeritoHeader.classList.remove("shake");
        numeritoHeader.offsetWidth; // Forzar reflow
        numeritoHeader.classList.add("shake");
    }
    
    // También actualizar el numerito del botón flotante si existe
    if (DomElements.numeritoContenedor) {
        DomElements.numeritoContenedor.classList.remove("shake");
        DomElements.numeritoContenedor.offsetWidth;
        DomElements.numeritoContenedor.classList.add("shake");
    }

    // Suma todas las cantidades de los productos agregados en el array del carrito
    numerito = carritoAgregados.reduce((suma, productoAgregado) => suma + parseInt(productoAgregado.cantidad), 0);
    
    // Actualizar ambos numeritos
    if (numeritoHeader) {
        numeritoHeader.textContent = numerito;
    }
    if (DomElements.numeritoContenedor) {
        DomElements.numeritoContenedor.textContent = numerito;
    }

    localStorage.setItem("numerito", numerito);
};

// **INICIALIZACIÓN DEL CARRITO AL CARGAR LA PÁGINA**
// Carga el carrito desde localStorage y actualiza la interfaz
// SUPABASE INTEGRATION: Cargar carrito desde localStorage manteniendo compatibilidad
// Los productos guardados mantienen la estructura: sku=product.id, titulo=product.name, etc.
numerito = localStorage.getItem("numerito");
DomElements.numeritoHeader.textContent = numerito || 0;

// **HACER FUNCIONES DISPONIBLES GLOBALMENTE**
// Permite que otros módulos accedan a estas funciones
window.carritoAgregados = carritoAgregados;
window.imprimirProductosEnCarrito = imprimirProductosEnCarrito;
window.numerito = numerito;
if(numerito > 0) {
    carritoAgregados = localStorage.getItem("productos");
    carritoAgregados = JSON.parse(carritoAgregados);
    imprimirProductosEnCarrito();
} else {
    // Inicializar numerito si no existe
    numerito = 0;
    localStorage.setItem("numerito", numerito);
    DomElements.numeritoHeader.textContent = numerito;
}