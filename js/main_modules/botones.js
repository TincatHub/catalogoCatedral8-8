import { toastify } from "./toastify.js";
import { carritoAgregados } from "./functionsProductos.js";
import { imprimirProductos } from "./functionsProductos.js";
import { imprimirProductosEnCarrito } from "./functionsProductos.js";
import { numerito } from "./functionsProductos.js";
import * as DomElements from "./domElements.js";
import { supabase } from "../../src/config/supabase.js";

// SUPABASE INTEGRATION: Botones agregar al carrito con datos de base de datos
// Busca productos por product.id (sku) en lugar de array local
export function asignarBotonesAgregar(productos) {
    const botonesAgregar = document.querySelectorAll('.producto__agregar');
    botonesAgregar.forEach((botonAgregar) => {
      botonAgregar.addEventListener('click', function() {
          botonAgregarClicked(event, productos);
      }, false);
    });
  };
  
function botonAgregarClicked(event, productos) {
    const productoAgregadoPadre = event.target.closest('.producto');
    // SUPABASE INTEGRATION: Busca producto por ID (sku = product.name)
    const productoAgregado = productos.find((buscarProducto) => buscarProducto.sku == productoAgregadoPadre.id);

    // Busca en carrito por sku (product.name)
    const estaEnCarrito = carritoAgregados.find((buscarSiEsta) => buscarSiEsta.sku == productoAgregadoPadre.id);
    if (estaEnCarrito) {
        estaEnCarrito.cantidad++; // Si está en el Carrito, solo aumenta la cantidad
    } else {
        Object.assign(productoAgregado, {cantidad: 1}); // Si no está, le setea cantidad
        carritoAgregados.push(productoAgregado); // y lo agrega
    }

    imprimirProductosEnCarrito();
    toastify("agregado");
}

// Asigna los botones + y - de los productos del Carrito y su evento
export function asignarBotonesMasMenos() {
    const botonesMas = document.querySelectorAll('.mas');
    const botonesMenos = document.querySelectorAll('.menos');

    botonesMas.forEach((botonMas) => {
        botonMas.addEventListener('click', botonMasClicked);
    });

    botonesMenos.forEach((botonMenos) => {
        botonMenos.addEventListener('click', botonMenosClicked);
    });
};

function botonMasClicked(event) {
    const productoAgregadoPadre = event.target.closest('.nuevoProducto');
    // SUPABASE INTEGRATION: Busca por sku (product.id)
    const productoAgregado = carritoAgregados.find((buscarProducto) => "agregado" + buscarProducto.sku == productoAgregadoPadre.id);
  
    productoAgregado.cantidad++;
    imprimirProductosEnCarrito();
}

function botonMenosClicked(event) {
    const productoAgregadoPadre = event.target.closest('.nuevoProducto');
    // SUPABASE INTEGRATION: Busca por sku (product.name)
    const productoAgregado = carritoAgregados.find((buscarProducto) => "agregado" + buscarProducto.sku == productoAgregadoPadre.id);
    
    if (productoAgregado.cantidad > 1) {
        productoAgregado.cantidad--;
        imprimirProductosEnCarrito();
    }
}

// Reasigna todos los botones de borrar producto en el Carrito
export function asignarBotonesBorrar() {
    const botonesBorrar = document.querySelectorAll('.carritoBorrar i');

    botonesBorrar.forEach((botonBorrar) => {
        botonBorrar.addEventListener('click', botonBorrarClicked);
    });
};

function botonBorrarClicked(event) {
    const productoAgregadoPadre = event.target.closest('.nuevoProducto');

    // SUPABASE INTEGRATION: Busca por sku (product.name)
    const productoAgregado = carritoAgregados.find((buscarProducto) => "agregado" + buscarProducto.sku == productoAgregadoPadre.id);

    const index = carritoAgregados.indexOf(productoAgregado); // Busca el index de este producto en el array
    if (index > -1) {
        carritoAgregados.splice(index, 1); // y lo elimina
    }
    imprimirProductosEnCarrito();
    toastify("borrado");
}

// Evento de Vaciar Carrito, dispara un SweetAlert
DomElements.botonVaciar.addEventListener('click', popUpVaciarCarrito);
function popUpVaciarCarrito() {
    swal(`Tenés ${numerito} ${numerito > 1 ? "productos" : "producto"} en el carrito.`, {
        title: "¿Estás seguro?",
        icon: "warning",
        buttons: {
        cancel: "Cancelar",
        aceptar: {
            text: "Aceptar",
            value: "aceptar",
        },
        },
    })
    .then((value) => {
        switch (value) {

        case "aceptar":
            numerito > 1 ? swal(`Carrito vaciado. Se eliminaron ${numerito} productos.`,{icon: "success",}) : swal(`Carrito vaciado. Se eliminó ${numerito} producto.`,{icon: "success",});
            botonVaciarClicked();
            break; 
        }
    });
}

function botonVaciarClicked() {
    // Borra todos los productos del array del Carrito
    while (carritoAgregados.length) {
        carritoAgregados.pop();
    }
    imprimirProductosEnCarrito(); 
}


// SUPABASE INTEGRATION: Eventos carrito header (nuevo botón en encabezado)
/**
 * Evento para manejar el click en el botón del carrito en el header
 * Si el carrito está vacío muestra mensaje, si tiene productos abre el carrito lateral
 */
DomElements.botonCarritoHeader.addEventListener("click", function(){
    console.log("Botón carrito header clickeado");
    
    // Obtener el número actual de productos en el carrito
    const numeritoActual = parseInt(DomElements.numeritoHeader.textContent) || 0;
    console.log("Numerito actual:", numeritoActual);
    
    if (numeritoActual === 0) {
        // Si el carrito está vacío, mostrar mensaje emergente
        mostrarMensajeCarritoVacio();
    } else {
        // Si hay productos, abrir el carrito lateral
        if (DomElements.carrito) {
            DomElements.carrito.classList.remove("cerrado");
            console.log("Carrito abierto con", numeritoActual, "productos");
        } else {
            console.error("Elemento carrito no encontrado");
        }
    }
}); 

/**
 * Función para mostrar mensaje emergente cuando el carrito está vacío
 */
function mostrarMensajeCarritoVacio() {
    // Crear elemento de notificación
    const notificacion = document.createElement('div');
    notificacion.className = 'carrito-vacio-notification';
    notificacion.innerHTML = `
        <div class="notification-content">
            <i class="fas fa-shopping-cart"></i>
            <p>El carrito se encuentra vacío</p>
        </div>
    `;
    
    // Agregar estilos inline para la notificación
    notificacion.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #170ad8;
        color: white;
        padding: 15px 20px;
        border-radius: 12px;
        box-shadow: 0 8px 25px rgba(23, 10, 216, 0.3);
        z-index: 10000;
        opacity: 0;
        transform: translateX(100%);
        transition: all 0.3s ease;
        font-family: 'Kanit', sans-serif;
        min-width: 250px;
    `;
    
    // Estilos para el contenido
    const content = notificacion.querySelector('.notification-content');
    content.style.cssText = `
        display: flex;
        align-items: center;
        gap: 10px;
    `;
    
    const icon = notificacion.querySelector('i');
    icon.style.fontSize = '20px';
    
    const text = notificacion.querySelector('p');
    text.style.cssText = `
        margin: 0;
        font-size: 16px;
        font-weight: 500;
    `;
    
    // Agregar al DOM
    document.body.appendChild(notificacion);
    
    // Mostrar con animación
    setTimeout(() => {
        notificacion.style.opacity = '1';
        notificacion.style.transform = 'translateX(0)';
    }, 100);
    
    // Ocultar después de 3 segundos
    setTimeout(() => {
        notificacion.style.opacity = '0';
        notificacion.style.transform = 'translateX(100%)';
        
        // Remover del DOM después de la animación
        setTimeout(() => {
            if (notificacion.parentElement) {
                document.body.removeChild(notificacion);
            }
        }, 300);
    }, 3000);
}
DomElements.cerrarCarrito.addEventListener("click", function(){
/**
 * Evento para el botón del carrito en el menú de categorías
 */
document.addEventListener('DOMContentLoaded', function() {
    const carritoMenuBoton = document.getElementById('carritoMenuBoton');
    const numeritoMenu = document.getElementById('numeritoMenu');
    
    if (carritoMenuBoton) {
        carritoMenuBoton.addEventListener('click', function(e) {
            e.preventDefault();
            console.log("Botón carrito menú clickeado");
            
            // Obtener el número actual de productos en el carrito
            const numeritoActual = parseInt(DomElements.numeritoHeader.textContent) || 0;
            
            if (numeritoActual === 0) {
                // Si el carrito está vacío, mostrar mensaje emergente
                mostrarMensajeCarritoVacio();
            } else {
                // Si hay productos, abrir el carrito lateral
                if (DomElements.carrito) {
                    DomElements.carrito.classList.remove("cerrado");
                    console.log("Carrito abierto desde menú con", numeritoActual, "productos");
                }
            }
        });
    }
    
    // Sincronizar el numerito del menú con el del header
    if (numeritoMenu) {
        const numeritoHeaderActual = DomElements.numeritoHeader.textContent || '0';
        numeritoMenu.textContent = numeritoHeaderActual;
    }
});

    console.log("Cerrando carrito");
    if (DomElements.carrito) {
        DomElements.carrito.classList.add("cerrado");
    }
});

// SUPABASE INTEGRATION: Actualizar numerito en header
export function estaVacioCheck() {
    // Actualizar numerito en header
    if (DomElements.numeritoHeader) {
        DomElements.numeritoHeader.textContent = numerito;
        
        // Animación shake en header
        DomElements.numeritoHeader.classList.remove("shake");
        void DomElements.numeritoHeader.offsetWidth; // Force reflow
        DomElements.numeritoHeader.classList.add("shake");
        
        console.log("Numerito actualizado:", numerito);
    } else {
        console.error("Elemento numeritoHeader no encontrado");
    }
    
    // Actualizar también el numerito del menú
    const numeritoMenu = document.getElementById('numeritoMenu');
    if (numeritoMenu) {
        numeritoMenu.textContent = numerito;
        console.log("Numerito menú actualizado:", numerito);
    }
    
    if(numerito == "0" || numerito == null) {
        if (DomElements.carrito) {
            DomElements.carrito.classList.add("cerrado");
        }
    }
}


// Asigna el botón de Ver todos en las búsquedas y en las categorías
// export function asignarBotonVerTodos(productos) {
//     let verTodos = document.querySelector(".verTodos");
//     verTodos.addEventListener("click", function() {
//         verTodosClicked(productos);
//     }, false);
// };

// Se imprimen todos los productos del array fetcheado
// function verTodosClicked(productos) {
//     DomElements.listadoProductos.scrollIntoView();
//     imprimirProductos(DomElements.listadoProductos, productos);
    
//     DomElements.botonesCategorias.forEach((botonCategoria) => {
//       botonCategoria.children[0].classList.remove("active"); // Quita las classes active que puedan tener las categorías
//     });
// };

DomElements.tituloCategorias.addEventListener("click", function(){
    if ((screen.width < 577)) {
        for(let categoria of DomElements.botonesCategorias) {
            categoria.style.maxHeight = categoria.style.maxHeight === "100px" ? "0px" : "100px";
        }
    }
}); 