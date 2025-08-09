import { ProductService } from '../services/productService.js'
import { ProductModal } from './ProductModal.js'

export class ProductDisplay {
  constructor() {
    this.currentCategory = null
    this.currentSubcategory = null
    this.productModal = new ProductModal()
    this.isValidDatabase = false
    this.init()
  }

  async init() {
    await this.validateDatabase()
    if (this.isValidDatabase) {
      this.setupStaticCategories()
    }
    await this.loadAllProducts()
    this.setupEventListeners()
  }

  async validateDatabase() {
    try {
      // Test database connection and validate table structure
      console.log('Starting database validation...')
      const testQuery = await supabase
        .from('products')
        .select('id, name, description, description_large, price, sale_price, on_sale, installments, image_url, image1_url, image2_url, image3_url, category, subcategory, stock, featured')
        .limit(1)
      
      if (testQuery.error) {
        console.error('Database validation failed:', testQuery.error)
        this.showError('Error de conexión a la base de datos: ' + testQuery.error.message)
        return
      }
      
      console.log('Database test query successful:', testQuery.data)
      
      // Validate that we have the expected columns
      const expectedColumns = [
        'id', 'name', 'description', 'description_large', 'price', 'sale_price', 
        'on_sale', 'installments', 'image_url', 'image1_url', 'image2_url', 
        'image3_url', 'category', 'subcategory', 'stock', 'featured'
      ]
      
      if (testQuery.data && testQuery.data.length > 0) {
        const firstRow = testQuery.data[0]
        const missingColumns = expectedColumns.filter(col => !(col in firstRow))
        
        if (missingColumns.length > 0) {
          console.warn('Missing columns in database:', missingColumns)
        }
      }
      
      this.isValidDatabase = true
      console.log('Database validation successful')
      
    } catch (error) {
      console.error('Database validation error:', error)
      this.showError('Error validando la base de datos: ' + error.message)
    }
  }

  setupStaticCategories() {
    // Map static categories from HTML to database categories
    const categoryMapping = {
      'Climatización': 'Climatización',
      'Tecnología': 'Tecnología', 
      'Tv Audio y video': 'Tv Audio y video',
      'Electrodomésticos': 'Electrodomesticos',
      'Deportes y exterior': 'Deportes y exterior',
      'Deco Hogar': 'Deco Hogar',
      'Cuidado Personal': 'Cuidado Personal',
      'Herramientas y construcción': 'Herramientas y construcción'
    }
    
    // Add data attributes to existing category links
    const categoryLinks = document.querySelectorAll('.cat a')
    categoryLinks.forEach(link => {
      const categoryText = link.textContent.trim()
      if (categoryMapping[categoryText]) {
        link.setAttribute('data-category', categoryMapping[categoryText])
      }
    })
  }

  setupEventListeners() {
    // Category clicks
    document.addEventListener('click', async (e) => {
      if (e.target.closest('.category-item a')) {
        e.preventDefault()
        const categoryElement = e.target.closest('.category-item a')
        const category = categoryElement.dataset.category

        if (category) {
          console.log('Category clicked:', category)
          await this.loadProductsByCategory(category)
        } else if (categoryElement.textContent === 'Todos los productos') {
          console.log('Loading all products')
          await this.loadAllProducts()
        }

        // Update active state
        document.querySelectorAll('.category-item a').forEach(a => a.classList.remove('active'))
        categoryElement.classList.add('active')
      }
      
      // **MANEJO DE CLICKS EN BOTONES "AGREGAR AL PEDIDO"**
      // Detecta cuando se hace clic en los botones de agregar producto desde las tarjetas
      if (e.target.classList.contains('producto__agregar')) {
        e.preventDefault()
        
        // Obtener el ID del producto desde el atributo data
        const productId = e.target.dataset.productId
        
        if (productId) {
          console.log('Agregando producto al carrito desde tarjeta, ID:', productId)
          
          try {
            // Obtener los datos completos del producto desde la base de datos
            const { data: product, error } = await supabase
              .from('products')
              .select('*')
              .eq('id', productId)
              .single()

            if (error) throw error
            
            // Agregar el producto al carrito usando la misma función que el modal
            this.addProductToCart(product)
            
          } catch (error) {
            console.error('Error obteniendo producto para carrito:', error)
            this.showCartNotification('Error al agregar producto', 'error')
          }
        }
      }
    })

    // Product "Ver más" clicks
    document.addEventListener('click', (e) => {
      if (e.target.classList.contains('producto__ver-mas')) {
        const productId = e.target.closest('.producto').id
        this.openProductModal(productId)
      }
    })

    // Add to cart from modal
    document.addEventListener('addToCart', (e) => {
      this.addProductToCart(e.detail.product)
    })
  }

  async loadAllProducts() {
    if (!this.isValidDatabase) {
      console.log('Database not valid, skipping product load')
      this.showError('Base de datos no disponible')
      return
    }
    
    try {
      console.log('Loading all products...')
      const products = await ProductService.getAllProducts()
      console.log('Loaded products:', products.length)
      this.renderProducts(products, 'Todos los productos')
    } catch (error) {
      console.error('Error loading all products:', error)
      this.showError('Error cargando productos')
    }
  }

  async loadProductsByCategory(category) {
    if (!this.isValidDatabase) {
      console.log('Database not valid, skipping category load')
      this.showError('Base de datos no disponible')
      return
    }
    
    try {
      console.log('Loading products for category:', category)
      const products = await ProductService.getProductsByCategory(category)
      console.log('Products loaded for category:', products.length)
      const subcategories = await ProductService.getSubcategories(category)
      console.log('Subcategories found:', subcategories)
      
      this.currentCategory = category
      
      if (subcategories.length > 1) {
        console.log('Rendering subcategories for:', category)
        this.renderSubcategoriesWithProducts(category, subcategories, products)
      } else {
        console.log('Rendering products directly for:', category)
        this.renderProducts(products, category)
      }
    } catch (error) {
      console.error('Error loading products by category:', error)
      this.showError('Error cargando productos de la categoría')
    }
  }

  renderSubcategoriesWithProducts(category, subcategories, products) {
    const container = document.getElementById('listadoProductos')
    if (!container) return
        // <h3 class="nombreCategoria">${category}</h3     (esto iba en la fila 179)>
         // <button class="subcategory-btn show-all-btn" data-category="${category}">
          //   Ver todos
          // </button> (estas 3 ultimas lineas son el boton para ver todos los productos de una categoría y estaban en el hueco actual 186)
    container.innerHTML = `
      <div class="subcategories-container">        
        <div class="subcategories-buttons-wrapper">
          <div class="subcategories-buttons">
         
            ${subcategories.map(subcategory => `
              <button class="subcategory-btn" data-category="${category}" data-subcategory="${subcategory}">
                ${subcategory}
              </button>
            `).join('')}
          </div>
        </div>
        <div class="products-grid">
          ${products.map(product => this.renderProductCard(product)).join('')}
        </div>
      </div>
    `

    // Add event listeners for subcategory cards
    container.addEventListener('click', async (e) => {
      const subcategoryBtn = e.target.closest('.subcategory-btn')
      if (subcategoryBtn) {
        const category = subcategoryBtn.dataset.category
        const subcategory = subcategoryBtn.dataset.subcategory
        
        // Remove active class from all buttons
        container.querySelectorAll('.subcategory-btn').forEach(btn => btn.classList.remove('active'))
        subcategoryBtn.classList.add('active')
        
        if (subcategory) {
        await this.loadProductsBySubcategory(category, subcategory)
        } else {
          // Show all products for this category
          this.renderProducts(products, category)
        }
      }
    })
  }

  async loadProductsBySubcategory(category, subcategory) {
    if (!this.isValidDatabase) {
      this.showError('Base de datos no disponible')
      return
    }
    
    try {
      const products = await ProductService.getProductsBySubcategory(category, subcategory)
      
      // Update the products grid within the existing subcategories container
      const container = document.getElementById('listadoProductos')
      const productsGrid = container.querySelector('.products-grid')
      
      if (productsGrid) {
        productsGrid.innerHTML = products.map(product => this.renderProductCard(product)).join('')
        
        // Update the category title to show subcategory
        const categoryTitle = container.querySelector('.nombreCategoria')
        if (categoryTitle) {
          categoryTitle.textContent = `${category} - ${subcategory}`
        }
      } else {
        // Fallback to regular render if grid not found
        this.renderProducts(products, `${category} - ${subcategory}`)
      }
    } catch (error) {
      console.error('Error loading products by subcategory:', error)
      this.showError('Error cargando productos de la subcategoría')
    }
  }

  renderProducts(products, title) {
    const container = document.getElementById('listadoProductos')
    if (!container) return

    console.log('Rendering products:', products.length, 'Title:', title)

    if (products.length === 0) {
      container.innerHTML = `
        <div class="no-products">
          <h4>De momento no hay productos disponibles en ${title}</h4> `
        //   <button class="ver-todos" onclick="location.reload()">Ver todos los productos</button>
        // </div>
     
      return
    }

    container.innerHTML = `
      <h3 class="nombreCategoria">${title}</h3>
      ${products.map(product => this.renderProductCard(product)).join('')}
    `
  }

  renderProductCard(product) {
    console.log('Rendering product card for:', product.description)
    const installmentPrice = product.price && product.installments 
      ? (product.price / product.installments).toFixed(2)
      : '0.00'

    const displayPrice = product.on_sale && product.sale_price 
      ? product.sale_price 
      : product.price

    const installmentDisplayPrice = displayPrice && product.installments
      ? (displayPrice / product.installments).toFixed(2)
      : '0.00'

    return `
      <div class="producto" id="${product.id}">
        <div class="producto__img">
          <img src="${product.image_url || 'https://via.placeholder.com/200'}" alt="${product.description}">
        </div>
        <h4 class="producto__titulo">${(product.description || 'Producto sin nombre').toUpperCase()}</h4>
        <div class="producto__precio-cuotas">
          ${product.installments || 12} cuotas de $<span>${this.formatPrice(installmentDisplayPrice)}</span>
        </div>
        ${product.on_sale ? '<div class="producto__oferta-badge">EN OFERTA</div>' : ''}
        ${product.featured ? '<div class="producto__destacado-badge">DESTACADO</div>' : ''}
        <div class="producto__agregar" data-product-id="${product.id}">AGREGAR AL PEDIDO</div>
        <div class="producto__ver-mas">VER MÁS</div>
      </div>
    `
  }

  formatPrice(price) {
    return new Intl.NumberFormat('es-AR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(price || 0)
  }

  async openProductModal(productId) {
    if (!this.isValidDatabase) {
      console.log('Database not valid, cannot open modal')
      alert('Base de datos no disponible')
      return
    }
    
    try {
      console.log('Opening modal for product ID:', productId)
      // Get product from database
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', productId)
        .single()

      if (error) throw error

      console.log('Product data for modal:', data)
      this.productModal.open(data)
    } catch (error) {
      console.error('Error loading product details:', error)
      alert('Error cargando detalles del producto')
    }
  }

  addProductToCart(product) {
    // **FUNCIONALIDAD DE AGREGAR AL CARRITO**
    // Esta función maneja la adición de productos al carrito de compras
    // Integra con el sistema de carrito existente y actualiza la interfaz
    
    try {
      // Obtener el carrito actual del localStorage
      let carritoAgregados = JSON.parse(localStorage.getItem("productos") || "[]")
      
      // Preparar datos del producto en el formato esperado por el sistema existente
      const productoParaCarrito = {
        sku: product.id,                    // ID único del producto
        titulo: product.description,        // Nombre/descripción del producto
        imagen: product.image_url,          // URL de la imagen del producto
        precio: product.on_sale && product.sale_price ? product.sale_price : product.price, // Precio considerando ofertas
        categoria: product.category,        // Categoría del producto
        installments: product.installments || 12, // Número de cuotas disponibles
        sale_price: product.sale_price,     // Precio de oferta si existe
        on_sale: product.on_sale || false,  // Indicador de si está en oferta
        stock: product.stock || 0,          // Stock disponible
        cantidad: 1                         // Cantidad inicial a agregar
      }
      
      // Verificar si el producto ya existe en el carrito
      const productoExistente = carritoAgregados.find(item => item.sku === product.id)
      
      if (productoExistente) {
        // Si ya existe, incrementar la cantidad
        productoExistente.cantidad++
        console.log('Producto existente, incrementando cantidad:', productoExistente)
      } else {
        // Si no existe, agregarlo al carrito
        carritoAgregados.push(productoParaCarrito)
        console.log('Nuevo producto agregado al carrito:', productoParaCarrito)
      }
      
      // Guardar el carrito actualizado en localStorage
      localStorage.setItem("productos", JSON.stringify(carritoAgregados))
      
      // Calcular y actualizar el número total de productos
      const totalItems = carritoAgregados.reduce((sum, item) => sum + item.cantidad, 0)
      localStorage.setItem("numerito", totalItems)
      
      // Actualizar el numerito en el header
      const numeritoHeader = document.getElementById('numeritoHeader')
      if (numeritoHeader) {
        numeritoHeader.textContent = totalItems
        
        // Agregar animación de shake al numerito
        numeritoHeader.classList.remove("shake")
        void numeritoHeader.offsetWidth // Forzar reflow para reiniciar la animación
        numeritoHeader.classList.add("shake")
        
        console.log('Numerito actualizado:', totalItems)
      }
      
      // Actualizar la visualización del carrito si está disponible
      if (window.imprimirProductosEnCarrito && typeof window.imprimirProductosEnCarrito === 'function') {
        window.carritoAgregados = carritoAgregados
        window.imprimirProductosEnCarrito()
        console.log('Carrito visual actualizado')
      }
      
      // Mostrar notificación de éxito
      this.showCartNotification('Producto agregado al carrito')
      
      // Disparar evento personalizado para compatibilidad con otros sistemas
      const event = new CustomEvent('productAdded', {
        detail: productoParaCarrito
      })
      document.dispatchEvent(event)
      
    } catch (error) {
      console.error('Error agregando producto al carrito:', error)
      this.showCartNotification('Error al agregar producto', 'error')
    }
  }

  /**
   * Muestra una notificación temporal cuando se agrega un producto al carrito
   * @param {string} message - Mensaje a mostrar
   * @param {string} type - Tipo de notificación ('success' o 'error')
   */
  showCartNotification(message, type = 'success') {
    // Crear elemento de notificación
    const notification = document.createElement('div')
    notification.className = `cart-notification ${type}`
    notification.textContent = message
    
    // Estilos inline para la notificación
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: ${type === 'success' ? '#28a745' : '#dc3545'};
      color: white;
      padding: 15px 20px;
      border-radius: 8px;
      font-weight: 600;
      z-index: 10000;
      transform: translateX(100%);
      transition: transform 0.3s ease;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    `
    
    document.body.appendChild(notification)
    
    // Mostrar la notificación con animación
    setTimeout(() => {
      notification.style.transform = 'translateX(0)'
    }, 100)
    
    // Ocultar y remover la notificación después de 3 segundos
    setTimeout(() => {
      notification.style.transform = 'translateX(100%)'
      setTimeout(() => {
        if (notification.parentElement) {
          document.body.removeChild(notification)
        }
      }, 300)
    }, 3000)
  }

  showError(message) {
    const container = document.getElementById('listadoProductos')
    if (container) {
      container.innerHTML = `
        <div class="error-message">
          <h4>${message}</h4>
          <button class="ver-todos" onclick="location.reload()">Reintentar</button>
          <p style="margin-top: 20px; color: #666; font-size: 14px;">
            Asegúrate de que la base de datos esté configurada correctamente con la tabla 'products' 
            y las columnas requeridas.
          </p>
        </div>
      `
    }
  }
}
