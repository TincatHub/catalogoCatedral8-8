import { imprimirProductos } from "./functionsProductos.js";
import { listadoProductos } from "./domElements.js";
import { botonesCategorias } from "./domElements.js";
import { supabase } from "../../src/config/supabase.js";

export async function buscar(event, productos) {
    event.preventDefault();
    listadoProductos.scrollIntoView();
    let busqueda = buscadorTop.children[0].value;
    
    // SUPABASE INTEGRATION: Filtrar productos por búsqueda
    const result = productos.filter(producto => 
        producto.titulo.toLowerCase().includes(busqueda.toLowerCase()) ||
        producto.categoria.toLowerCase().includes(busqueda.toLowerCase())
    );
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
    }
    
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