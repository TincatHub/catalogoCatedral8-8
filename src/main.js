import { AdminPanel } from './components/AdminPanel.js'
import { ProductDisplay } from './components/ProductDisplay.js'
import { supabase } from './config/supabase.js'

// Make supabase available globally for compatibility
window.supabase = supabase

// Initialize components
document.addEventListener('DOMContentLoaded', async () => {
  try {
    // Initialize admin panel
    new AdminPanel()
    
    // Initialize product display with database integration
    new ProductDisplay()
    
    console.log('Application initialized successfully')
  } catch (error) {
    console.error('Error initializing application:', error)
    
    // Fallback to original functionality if database is not available
    const script = document.createElement('script')
    script.type = 'module'
    script.src = 'js/main.js'
    document.head.appendChild(script)
  }
})

// Integrate with existing cart functionality
document.addEventListener('productAdded', (e) => {
  const productData = e.detail
  console.log('Producto agregado al carrito:', productData)
  
  // Try to integrate with existing cart system
  const carritoAgregados = JSON.parse(localStorage.getItem("productos") || "[]")
  
  // Check if product already exists in cart
  const existingProductIndex = carritoAgregados.findIndex(p => p.sku == productData.sku)
  
  if (existingProductIndex !== -1) {
    carritoAgregados[existingProductIndex].cantidad++
  } else {
    carritoAgregados.push({
      ...productData,
      cantidad: 1
    })
  }
  
  // Save to localStorage
  localStorage.setItem("productos", JSON.stringify(carritoAgregados))
  
  // Update header cart number
  const totalItems = carritoAgregados.reduce((sum, item) => sum + item.cantidad, 0)
  localStorage.setItem("numerito", totalItems)
  
  const numeritoHeader = document.getElementById('numeritoHeader')
  if (numeritoHeader) {
    numeritoHeader.textContent = totalItems
    console.log('Numerito header actualizado:', totalItems)
    
    // Add shake animation
    numeritoHeader.classList.remove("shake")
    void numeritoHeader.offsetWidth // Force reflow
    numeritoHeader.classList.add("shake")
  }
  
  // Try to update existing cart if available
  if (window.carritoAgregados && typeof window.imprimirProductosEnCarrito === 'function') {
    // Check if product already exists in cart
    const existingProduct = window.carritoAgregados.find(p => p.sku == productData.sku)
    
    if (existingProduct) {
      existingProduct.cantidad++
    } else {
      window.carritoAgregados.push({
        ...productData,
        cantidad: 1
      })
    }
    
    window.imprimirProductosEnCarrito()
  }
  
  // Show toast notification if available
  if (window.Toastify) {
    window.Toastify({
      text: "Producto agregado",
      duration: 3000,
      close: true,
      className: "toastifyToast"
    }).showToast()
  }
  
  console.log('Carrito actualizado correctamente')
})