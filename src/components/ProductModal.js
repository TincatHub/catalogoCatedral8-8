export class ProductModal {
  constructor() {
    this.modal = null
    this.currentProduct = null
    this.init()
  }

  init() {
    this.createModal()
    this.setupEventListeners()
  }

  createModal() {
    const modal = document.createElement('div')
    modal.className = 'product-modal'
    modal.id = 'productModal'
    modal.innerHTML = `
      <div class="product-modal-overlay">
        <div class="product-modal-content">
          <button class="product-modal-close" id="productModalClose">
            <i class="fas fa-times"></i>
          </button>
          <div class="product-modal-body" id="productModalBody">
            <!-- Content will be dynamically inserted here -->
          </div>
        </div>
      </div>
    `
    
    document.body.appendChild(modal)
    this.modal = modal
  }

  setupEventListeners() {
    // Close modal events
    document.addEventListener('click', (e) => {
      if (e.target.id === 'productModalClose' || 
          e.target.closest('#productModalClose') ||
          e.target.classList.contains('product-modal-overlay')) {
        this.close()
      }
    })

    // Escape key to close
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.modal.classList.contains('active')) {
        this.close()
      }
    })

    // Image gallery navigation
    document.addEventListener('click', (e) => {
      if (e.target.classList.contains('product-image-thumb')) {
        this.changeMainImage(e.target.src)
      }
    })
  }

  open(product) {
    this.currentProduct = product
    this.renderContent()
    this.modal.classList.add('active')
    document.body.style.overflow = 'hidden'
  }

  close() {
    this.modal.classList.remove('active')
    document.body.style.overflow = ''
    this.currentProduct = null
  }

  renderContent() {
    if (!this.currentProduct) return

    const product = this.currentProduct
    const modalBody = document.getElementById('productModalBody')

    // Format description with bullet points
    const formattedDescription = this.formatDescription(product.description_large || product.description || '')
    
    // Calculate installment price
    const installmentPrice = product.price && product.installments 
      ? (product.price / product.installments).toFixed(2)
      : '0.00'

    // Determine badge
    let badge = ''
    if (product.on_sale) {
      badge = '<div class="product-badge sale-badge">EN OFERTA</div>'
    } else if (product.featured) {
      badge = '<div class="product-badge featured-badge">DESTACADO</div>'
    }

    modalBody.innerHTML = `
      <div class="product-modal-grid">
        <div class="product-modal-left">
          <div class="product-main-image">
            <img id="productMainImage" src="${product.image_url || 'https://via.placeholder.com/400'}" alt="${product.description}">
          </div>
          <div class="product-image-gallery">
            ${this.renderImageGallery(product)}
          </div>
              <div class="product-pricing">
            <div class="product-installments">
              ${product.installments || 12} cuotas de $${this.formatPrice(installmentPrice)}
            </div>
      
          </div>
          
        </div>
        
        <div class="product-modal-right">
          ${badge}
          
          <h2 class="product-modal-title">${product.description || 'Producto sin nombre'}</h2>
          
          <div class="product-description">
            ${formattedDescription}
          </div>
          
          <div class="product-actions">
            <button class="product-btn product-btn-primary add-to-cart-btn" data-sku="${product.id}">
              <i class="fas fa-shopping-cart"></i>
              Agregar al pedido
            </button>
            <button class="product-btn product-btn-whatsapp whatsapp-btn" data-sku="${product.id}">
              <i class="fab fa-whatsapp"></i>
              Consultar por WhatsApp
            </button>
          </div>
               ${product.stock !== null ? `
            <div class="product-stock">
              <i class="fas fa-box"></i>
              Stock disponible: ${product.stock} unidades
            </div>
          ` : ''}
    
          
     
        </div>
      </div>
    `

    // Setup action buttons
    this.setupActionButtons()
  }

  renderImageGallery(product) {
    const images = [
      product.image_url,
      product.image1_url,
      product.image2_url,
      product.image3_url
    ].filter(url => url && url.trim() !== '')

    if (images.length <= 1) return ''

    return images.map(url => `
      <img class="product-image-thumb" src="${url}" alt="Imagen del producto">
    `).join('')
  }

  formatDescription(description) {
    if (!description) return '<p>Sin descripción disponible</p>'

    // Split by underscore and create bullet points
    const parts = description.split('_').filter(part => part.trim() !== '')
    
    if (parts.length <= 1) {
      return `<p>• ${description}</p>`
    }

    return parts.map(part => `<p>• ${part.trim()}</p>`).join('')
  }

  formatPrice(price) {
    return new Intl.NumberFormat('es-AR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(price || 0)
  }

  changeMainImage(src) {
    const mainImage = document.getElementById('productMainImage')
    if (mainImage) {
      mainImage.src = src
    }
  }

  setupActionButtons() {
    // Add to cart functionality
    const addToCartBtn = document.querySelector('.add-to-cart-btn')
    if (addToCartBtn) {
      addToCartBtn.addEventListener('click', () => {
        this.addToCart(this.currentProduct)
      })
    }

    // WhatsApp functionality
    const whatsappBtn = document.querySelector('.whatsapp-btn')
    if (whatsappBtn) {
      whatsappBtn.addEventListener('click', () => {
        this.openWhatsApp(this.currentProduct)
      })
    }
  }

  addToCart(product) {
    // Integrate with existing cart functionality
    const event = new CustomEvent('addToCart', {
      detail: { product }
    })
    document.dispatchEvent(event)
    
    // Show confirmation
    this.showNotification('Producto agregado al carrito')
  }

  openWhatsApp(product) {
    const message = `Hola, quiero consultar sobre el producto *${product.description}*, que tiene un precio de *$${this.formatPrice(product.price)}*. Muchas gracias!`
    const whatsappUrl = `https://api.whatsapp.com/send?phone=+5491158102407&text=${encodeURIComponent(message)}`
    window.open(whatsappUrl, '_blank')
  }

  showNotification(message) {
    // Create a simple notification
    const notification = document.createElement('div')
    notification.className = 'product-notification'
    notification.textContent = message
    document.body.appendChild(notification)

    setTimeout(() => {
      notification.classList.add('show')
    }, 100)

    setTimeout(() => {
      notification.classList.remove('show')
      setTimeout(() => {
        document.body.removeChild(notification)
      }, 300)
    }, 3000)
  }
}
