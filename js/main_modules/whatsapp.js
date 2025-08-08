import { supabase } from "../../src/config/supabase.js";

export function asignarBotonesWhatsApp(productos) {
    const botonesWhatsApp = document.querySelectorAll('.producto__whatsapp');
    botonesWhatsApp.forEach((botonWhatsApp) => {
        botonWhatsApp.addEventListener('click', function() {
            botonWhatsAppClicked(event, productos);
      }, false);
    });
}

// SUPABASE INTEGRATION: WhatsApp con datos de base de datos
// Usa sku (product.id), titulo (product.name), precio (product.price)
function botonWhatsAppClicked(event, productos) {
    const productoAgregadoID = event.target.closest('.producto').id;
    // SUPABASE INTEGRATION: Buscar por sku (product.id)
    const productoAgregado = productos.find(function(buscarProducto) {
        return buscarProducto.sku == productoAgregadoID;
    });

    if (productoAgregado) {
        // SUPABASE INTEGRATION: Usar precio con ofertas y mostrar cuotas
        const precioMostrar = productoAgregado.on_sale && productoAgregado.sale_price ? 
            productoAgregado.sale_price : productoAgregado.precio;
        const installmentPrice = precioMostrar / (productoAgregado.installments || 12);
        
        // Mensaje con información de cuotas
        const mensaje = `Hola, quiero consultar sobre el producto *${productoAgregado.titulo}*, que tiene un precio de *$${precioMostrar.toFixed(2)}* en *${productoAgregado.installments || 12} cuotas de $${installmentPrice.toFixed(2)}*. Muchas gracias!`;
        
        window.open(
            "https://api.whatsapp.com/send?phone=++5491158102407&text=" + encodeURIComponent(mensaje),
            "_blank"
        );
    }
}

// SUPABASE INTEGRATION: Nueva función para WhatsApp directo desde base de datos
export async function whatsappDirectoDesdeBaseDatos(productId) {
    try {
        const { data, error } = await supabase
            .from('products')
            .select('*')
            .eq('id', productId)
            .single();
        
        if (error) throw error;
        
        const precioMostrar = data.on_sale && data.sale_price ? data.sale_price : data.price;
        const installmentPrice = precioMostrar / (data.installments || 12);
        
        const mensaje = `Hola, quiero consultar sobre el producto *${data.name}*, que tiene un precio de *$${precioMostrar.toFixed(2)}* en *${data.installments || 12} cuotas de $${installmentPrice.toFixed(2)}*. Muchas gracias!`;
        
        window.open(
            "https://api.whatsapp.com/send?phone=++5491158102407&text=" + encodeURIComponent(mensaje),
            "_blank"
        );
    } catch (error) {
        console.error('Error cargando producto para WhatsApp:', error);
    }
}