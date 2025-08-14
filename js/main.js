import * as DomElements from "./main_modules/domElements.js";
import { imprimirProductos, loadProductsFromDatabase } from "./main_modules/functionsProductos.js";
import { buscar } from "./main_modules/busqueda.js";
import { categoriaClick } from "./main_modules/busqueda.js";
import { supabase } from "../src/config/supabase.js";

// MIGRACIÓN A SUPABASE: Reemplazamos fetch de productos.json por consulta a base de datos
// Relaciones: sku -> product.id, titulo -> product.name, precio -> product.price, categoria -> product.category
const pedirProductos = async () => {
    try {
        const { data, error } = await supabase
            .from('products')
            .select('*')
            .order('created_at', { ascending: false });
        
        if (error) throw error;
        
        // Transformamos los datos de Supabase al formato esperado por el código existente
        return data.map(product => ({
            sku: product.id,                    // product.id -> sku
            titulo: product.description,               // product.description -> titulo  
            imagen: product.image_url,          // product.image_url -> imagen
            precio: product.price,              // product.price -> precio
            categoria: product.category,        // product.category -> categoria
            // Nuevos campos para funcionalidad extendida
            installments: product.installments || 12,
            sale_price: product.sale_price,
            on_sale: product.on_sale || false,
            stock: product.stock || 0,
            description_large: product.description_large || product.description || ''
        }));
    } catch (error) {
        console.error('Error cargando productos desde Supabase:', error);
        return [];
    }
};

// Inicializar aplicación con datos de Supabase
let productos = pedirProductos();
productos.then((productos) => productosFetched(productos));

function productosFetched(productos) {
    imprimirProductos(DomElements.listadoProductos, productos);

    // Evento del buscador del header
    DomElements.buscadorTop.addEventListener("submit", function() {
        buscar(event, productos);
    }, false);

    // Evento de las categorías laterales
    DomElements.botonesCategorias.forEach((botonCategoria) => {
        botonCategoria.addEventListener("click", function() {
            categoriaClick(event, productos);
        }, false);
    });
}