import { imprimirProductos } from "./functionsProductos.js";
import { listadoProductos } from "./domElements.js";
// import { asignarBotonVerTodos } from "./botones.js";
import { botonesCategorias } from "./domElements.js";
import { supabase } from "../../src/config/supabase.js";

// SUPABASE INTEGRATION: Búsqueda en base de datos
// Busca en product.name (titulo) y product.category (categoria)
export function buscar(event, productos) {
    event.preventDefault();
    listadoProductos.scrollIntoView();
    let busqueda = buscadorTop.children[0].value;
    
    // SUPABASE INTEGRATION: Filtrar productos de base de datos
    // Busca en titulo (product.description) y categoria (product.category)
    const result = productos.filter(
        producto =>
        producto.categoria.toLowerCase().includes(busqueda.toLowerCase()) ||
        producto.titulo.toLowerCase().includes(busqueda.toLowerCase())
    );
    imprimirProductos(listadoProductos, result);

    // Si no hay resultados, muestra el mensaje de error
    if(result.length === 0 || busqueda === "" || busqueda === " ") {
        listadoProductos.innerHTML = "";
        let noHayCoincidencias = document.createElement("div");
        noHayCoincidencias.className = "noHayCoincidencias";
        noHayCoincidencias.innerHTML = `
        <h4>No hay productos que coincidan con la búsqueda "${busqueda}".</h4>
        <a class="verTodos">Ver todos los productos</a>
        `;
        listadoProductos.appendChild(noHayCoincidencias);
    // Si hay, muestra el mensaje de resultados de la búsqueda
    } else {
        let tituloBusqueda = document.createElement("h3");
        tituloBusqueda.className = "nombreCategoria";
        tituloBusqueda.innerHTML = `
        Resultados de búsqueda para "${busqueda}"
        <a class="verTodos">Ver todos los productos</a>
        `;
        listadoProductos.prepend(tituloBusqueda);
    }

    // asignarBotonVerTodos(productos);
    // buscadorTop.children[0].value = ""; // Se vacía el input del buscador
}

// SUPABASE INTEGRATION: Filtro por categoría desde base de datos
// Filtra por product.category (categoria)
export function categoriaClick(event, productos) {
    listadoProductos.scrollIntoView();
    botonesCategorias.forEach((botonCategoria) => {
        botonCategoria.children[0].classList.remove("active");
    });
    event.target.classList.add("active");
    
    // SUPABASE INTEGRATION: Filtrar por categoria (product.category)
    const result = productos.filter(producto => producto.categoria === event.target.textContent);
    imprimirProductos(listadoProductos, result);

    // Si es la categoría de Todos, solamente imprime nuevamente todos los productos fetcheados
    if(event.target.textContent === "Todos los productos") {
        imprimirProductos(listadoProductos, productos);
    // Si la categoría está vacía, imprime el mensaje de error
    } else if(result.length === 0) {
        let noHayCoincidencias = document.createElement("div");
        noHayCoincidencias.className = "noHayCoincidencias";
        noHayCoincidencias.innerHTML = `
        <h4>De momento no hay productos en esta categoría ${event.target.textContent}.</h4>`;
        // <a class="verTodos">Ver todos los productos</a>
        
        listadoProductos.appendChild(noHayCoincidencias);
    // Si hay resultados, imprime los productos en esa categoría con su título
    } else {
        // let nombreCategoria = document.createElement("h3");
        // nombreCategoria.className = "nombreCategoria";
        // nombreCategoria.innerHTML = `
        // ${event.target.textContent}
        // <a class="verTodos">Ver todos los productos</a>
        // `;
        // listadoProductos.prepend(nombreCategoria);

    }

    // asignarBotonVerTodos(productos);
}

// SUPABASE INTEGRATION: Nueva función para búsqueda directa en base de datos
export async function buscarEnBaseDatos(termino) {
    try {
        const { data, error } = await supabase
            .from('products')
            .select('*')
            .or(`description.ilike.%${termino}%,category.ilike.%${termino}%,description_large.ilike.%${termino}%`);
        
        if (error) throw error;
        
        // Transformar a formato esperado
        return data.map(product => ({
            sku: product.name,                  // product.name -> sku
            titulo: product.description,        // product.description -> titulo
            imagen: product.image_url,          // product.image_url -> imagen
            precio: product.price,              // product.price -> precio
            categoria: product.category,        // product.category -> categoria
            installments: product.installments || 12,
            sale_price: product.sale_price,
            on_sale: product.on_sale || false,
            stock: product.stock || 0
        }));
    } catch (error) {
        console.error('Error en búsqueda:', error);
        return [];
    }
}

// SUPABASE INTEGRATION: Filtrar por categoría directamente en base de datos
export async function filtrarPorCategoria(categoria) {
    try {
        const { data, error } = await supabase
            .from('products')
            .select('*')
            .eq('category', categoria);
        
        if (error) throw error;
        
        // Transformar a formato esperado
        return data.map(product => ({
            sku: product.name,                  // product.id -> sku
            titulo: product.description,        // product.name -> titulo
            imagen: product.image_url,          // product.image_url -> imagen
            precio: product.price,              // product.price -> precio
            categoria: product.category,        // product.category -> categoria
            installments: product.installments || 12,
            sale_price: product.sale_price,
            on_sale: product.on_sale || false,
            stock: product.stock || 0
        }));
    } catch (error) {
        console.error('Error filtrando por categoría:', error);
        return [];
    }
}