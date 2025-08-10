import { imprimirProductos } from "./functionsProductos.js";
import { listadoProductos } from "./domElements.js";
import { botonesCategorias } from "./domElements.js";
import { supabase } from "../../src/config/supabase.js";

/**
 * Función de búsqueda mejorada que busca en la base de datos
 * Busca sin considerar acentos ni mayúsculas en description, description_large y subcategory
 * @param {Event} event - Evento del formulario de búsqueda
 * @param {Array} productos - Array de productos (no se usa, se busca directamente en BD)
 */
export async function buscar(event, productos) {
    event.preventDefault();
    listadoProductos.scrollIntoView();
    let busqueda = buscadorTop.children[0].value;
    
    if (!busqueda || busqueda.trim() === "") {
        // Si no hay búsqueda, mostrar todos los productos
        const todosLosProductos = await obtenerTodosLosProductos();
        imprimirProductos(listadoProductos, todosLosProductos);
        return;
    }
    
    try {
        // Realizar búsqueda en base de datos sin considerar acentos ni mayúsculas
        const result = await buscarEnBaseDatos(busqueda);
        imprimirProductos(listadoProductos, result);

        // Si no hay resultados, muestra el mensaje de error
        if(result.length === 0) {
            listadoProductos.innerHTML = "";
            let noHayCoincidencias = document.createElement("div");
            noHayCoincidencias.className = "noHayCoincidencias";
            noHayCoincidencias.innerHTML = `
            <h4>No hay productos que coincidan con la búsqueda "${busqueda}".</h4>
            <button class="ver-todos" onclick="location.reload()">Ver todos los productos</button>
            `;
            listadoProductos.appendChild(noHayCoincidencias);
        } else {
            // Si hay resultados, muestra el título de búsqueda
            let tituloBusqueda = document.createElement("h3");
            tituloBusqueda.className = "nombreCategoria";
            tituloBusqueda.innerHTML = `Resultados de búsqueda para "${busqueda}" (${result.length} productos encontrados)`;
            listadoProductos.prepend(tituloBusqueda);
        }
    } catch (error) {
        console.error('Error en búsqueda:', error);
        listadoProductos.innerHTML = `
            <div class="error-message">
                <h4>Error al realizar la búsqueda</h4>
                <p>Por favor, intenta nuevamente</p>
            </div>
        `;
    }
    
    // Limpiar el input del buscador
    buscadorTop.children[0].value = "";
}

// SUPABASE INTEGRATION: Filtro por categoría desde base de datos
// Filtra por product.category (categoria)
export function categoriaClick(event, productos) {
    listadoProductos.scrollIntoView();
    botonesCategorias.forEach((botonCategoria) => {
        botonCategoria.children[0].classList.remove("active");
    });
    event.target.classList.add("active");
    
    const subcategoriasContainer = document.getElementById('subcategoriasContainer');
    const subcategoriasBotones = document.getElementById('subcategoriasBotones');
    
    // SUPABASE INTEGRATION: Filtrar por categoria (product.category)
    const result = productos.filter(producto => producto.categoria === event.target.textContent);
    
    // Obtener subcategorías únicas para esta categoría
    const subcategorias = [...new Set(result.map(producto => producto.subcategoria).filter(sub => sub && sub.trim() !== ''))];
    
    if (subcategorias.length > 1) {
        // Mostrar botones de subcategorías
        subcategoriasContainer.style.display = 'block';
        subcategoriasBotones.innerHTML = `
            <button class="subcategoria-btn active" data-subcategoria="todas">Todas</button>
            ${subcategorias.map(subcategoria => 
                `<button class="subcategoria-btn" data-subcategoria="${subcategoria}">${subcategoria}</button>`
            ).join('')}
        `;
        
        // Agregar eventos a los botones de subcategorías
        subcategoriasBotones.addEventListener('click', function(e) {
            if (e.target.classList.contains('subcategoria-btn')) {
                // Remover clase active de todos los botones
                subcategoriasBotones.querySelectorAll('.subcategoria-btn').forEach(btn => {
                    btn.classList.remove('active');
                });
                
                // Agregar clase active al botón clickeado
                e.target.classList.add('active');
                
                const subcategoriaSeleccionada = e.target.dataset.subcategoria;
                
                if (subcategoriaSeleccionada === 'todas') {
                    imprimirProductos(listadoProductos, result);
                } else {
                    const productosFiltrados = result.filter(producto => 
                        producto.subcategoria === subcategoriaSeleccionada
                    );
                    imprimirProductos(listadoProductos, productosFiltrados);
                }
            }
        });
    } else {
        // Ocultar subcategorías si no hay suficientes
        subcategoriasContainer.style.display = 'none';
    }
    
    imprimirProductos(listadoProductos, result);

    // Si es la categoría de Todos, solamente imprime nuevamente todos los productos fetcheados
    if(event.target.textContent === "Todos los productos") {
        subcategoriasContainer.style.display = 'none';
        imprimirProductos(listadoProductos, productos);
    // Si la categoría está vacía, imprime el mensaje de error
    } else if(result.length === 0) {
        subcategoriasContainer.style.display = 'none';
        let noHayCoincidencias = document.createElement("div");
        noHayCoincidencias.className = "noHayCoincidencias";
        noHayCoincidencias.innerHTML = `
        <h4>De momento no hay productos en esta categoría ${event.target.textContent}.</h4>`;
        
        listadoProductos.appendChild(noHayCoincidencias);
    }
}

/**
 * Función para obtener todos los productos de la base de datos
 * @returns {Array} Array de productos transformados al formato esperado
 */
async function obtenerTodosLosProductos() {
    try {
        const { data, error } = await supabase
            .from('products')
            .select('*')
            .order('created_at', { ascending: false });
        
        if (error) throw error;
        
        return transformarProductos(data);
    } catch (error) {
        console.error('Error obteniendo todos los productos:', error);
        return [];
    }
}

/**
 * Función mejorada para búsqueda directa en base de datos
 * Busca sin considerar acentos ni mayúsculas en description, description_large y subcategory
 * @param {string} termino - Término de búsqueda
 * @returns {Array} Array de productos que coinciden con la búsqueda
 */
export async function buscarEnBaseDatos(termino) {
    try {
        // Normalizar el término de búsqueda (sin acentos y en minúsculas)
        const terminoNormalizado = normalizarTexto(termino);
        
        // Buscar en description, description_large y subcategory
        const { data, error } = await supabase
            .from('products')
            .select('*')
            .or(`description.ilike.%${termino}%,description_large.ilike.%${termino}%,subcategory.ilike.%${termino}%`)
            .order('description');
        
        if (error) throw error;
        
        // Filtrar resultados localmente para búsqueda más precisa sin acentos
        const resultadosFiltrados = data.filter(product => {
            const description = normalizarTexto(product.description || '');
            const descriptionLarge = normalizarTexto(product.description_large || '');
            const subcategory = normalizarTexto(product.subcategory || '');
            
            return description.includes(terminoNormalizado) ||
                   descriptionLarge.includes(terminoNormalizado) ||
                   subcategory.includes(terminoNormalizado);
        });
        
        return transformarProductos(resultadosFiltrados);
    } catch (error) {
        console.error('Error en búsqueda:', error);
        return [];
    }
}

/**
 * Función para normalizar texto (quitar acentos y convertir a minúsculas)
 * @param {string} texto - Texto a normalizar
 * @returns {string} Texto normalizado
 */
function normalizarTexto(texto) {
    return texto
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, ''); // Quitar acentos
}

/**
 * Función para transformar productos de Supabase al formato esperado
 * @param {Array} products - Array de productos de Supabase
 * @returns {Array} Array de productos transformados
 */
function transformarProductos(products) {
    return products.map(product => ({
        sku: product.id,                    // product.id -> sku
        titulo: product.description,        // product.description -> titulo
        imagen: product.image_url,          // product.image_url -> imagen
        precio: product.price,              // product.price -> precio
        categoria: product.category,        // product.category -> categoria
        subcategoria: product.subcategory,  // product.subcategory -> subcategoria
        installments: product.installments || 12,
        sale_price: product.sale_price,
        on_sale: product.on_sale || false,
        stock: product.stock || 0,
        description_large: product.description_large || product.description || ''
    }));
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