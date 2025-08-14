import { AuthService } from '../services/authService.js'
import { ProductService } from '../services/productService.js'

export class AdminPanel {
  constructor() {
    this.isOpen = false
    this.isAuthenticated = false
    this.currentUser = null
    this.init()
  }

  async init() {
    this.createAdminIcon()
    this.createAdminPanel()
    this.setupEventListeners()
    
    // Validate database on initialization
    await this.validateDatabase()
    
    // Check if user is already authenticated
    this.currentUser = await AuthService.getCurrentUser()
    if (this.currentUser) {
      this.isAuthenticated = true
      this.showAdminContent()
    }

    // Listen for auth state changes
    AuthService.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN') {
        this.isAuthenticated = true
        this.currentUser = session.user
        this.showAdminContent()
      } else if (event === 'SIGNED_OUT') {
        this.isAuthenticated = false
        this.currentUser = null
        this.showLoginForm()
      }
    })
  }

  async validateDatabase() {
    try {
      const validation = await ProductService.validateTableStructure()
      
      if (!validation.valid) {
        console.error('Database validation failed:', validation.message)
        this.showDatabaseError(validation.message)
      } else {
        console.log('Database validation successful:', validation.message)
      }
    } catch (error) {
      console.error('Error validating database:', error)
      this.showDatabaseError('Error connecting to database: ' + error.message)
    }
  }

  showDatabaseError(message) {
    // Show a notification about database issues
    const notification = document.createElement('div')
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: #dc3545;
      color: white;
      padding: 15px 20px;
      border-radius: 8px;
      z-index: 10000;
      max-width: 300px;
      font-size: 14px;
    `
    notification.innerHTML = `
      <strong>Database Error:</strong><br>
      ${message}
      <button onclick="this.parentElement.remove()" style="
        background: none;
        border: none;
        color: white;
        float: right;
        cursor: pointer;
        font-size: 16px;
        margin-top: -5px;
      ">×</button>
    `
    
    document.body.appendChild(notification)
    
    // Auto remove after 10 seconds
    setTimeout(() => {
      if (notification.parentElement) {
        notification.remove()
      }
    }, 10000)
  }

  createAdminIcon() {
    // Admin icon is now in footer HTML - no need to create it dynamically
    console.log('Admin icon functionality transferred to footer')
  }

  createAdminPanel() {
    const panel = document.createElement('div')
    panel.className = 'admin-panel'
    panel.id = 'adminPanel'
    panel.innerHTML = `
      <div class="admin-panel-content">
        <div class="admin-panel-header">
          <h3>Panel de Administración</h3>
          <button class="admin-close-btn" id="adminCloseBtn">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <div class="admin-panel-body" id="adminPanelBody">
          ${this.getLoginFormHTML()}
        </div>
      </div>
    `
    
    document.body.appendChild(panel)
  }

  getLoginFormHTML() {
    return `
      <div class="admin-login-form">
        <h4>Iniciar Sesión</h4>
        <form id="adminLoginForm">
          <div class="form-group">
            <label for="adminEmail">Email:</label>
            <input type="email" id="adminEmail" required>
          </div>
          <div class="form-group">
            <label for="adminPassword">Contraseña:</label>
            <input type="password" id="adminPassword" required>
          </div>
          <button type="submit" class="admin-btn admin-btn-primary">Ingresar</button>
        </form>
        <div class="admin-error" id="adminError"></div>
      </div>
    `
  }

  getAdminContentHTML() {
    return `
      <div class="admin-content">
        <div class="admin-user-info">
          <span>Bienvenido, ${this.currentUser?.email}</span>
          <button class="admin-btn admin-btn-secondary" id="adminLogoutBtn">Cerrar Sesión</button>
        </div>
        
        <div class="admin-tabs">
          <button class="admin-tab-btn active" data-tab="products">Productos</button>
          <button class="admin-tab-btn" data-tab="upload">Subir Archivos</button>
          <button class="admin-tab-btn" data-tab="download">Descargar</button>
        </div>

        <div class="admin-tab-content">
          <div class="admin-tab-pane active" id="products-tab">
            <div class="admin-actions">
              <button class="admin-btn admin-btn-primary" id="addProductBtn">Agregar Producto</button>
              <button class="admin-btn admin-btn-secondary" id="refreshProductsBtn">Actualizar</button>
            </div>
            <div class="admin-products-list" id="adminProductsList">
              <div class="loading">Cargando productos...</div>
            </div>
          </div>

          <div class="admin-tab-pane" id="upload-tab">
            <div class="upload-section">
              <h4>Subir Archivo CSV</h4>
              <form id="uploadForm" enctype="multipart/form-data">
                <div class="form-group">
                  <label for="csvFile">Seleccionar archivo CSV:</label>
                  <input type="file" id="csvFile" accept=".csv" required>
                </div>
                <button type="submit" class="admin-btn admin-btn-primary">Subir Archivo</button>
              </form>
            </div>
          </div>

          <div class="admin-tab-pane" id="download-tab">
            <div class="download-section">
              <h4>Descargar Datos</h4>
              <button class="admin-btn admin-btn-primary" id="downloadCsvBtn">Descargar CSV</button>
              <button class="admin-btn admin-btn-secondary" id="downloadJsonBtn">Descargar JSON</button>
            </div>
          </div>
        </div>
      </div>
    `
  }

  setupEventListeners() {
    // Admin icon click
    document.addEventListener('click', (e) => {
      if (e.target.closest('.admin-icon-footer')) {
        this.togglePanel()
      }
    })

    // Close panel
    document.addEventListener('click', (e) => {
      if (e.target.id === 'adminCloseBtn' || e.target.closest('#adminCloseBtn')) {
        this.closePanel()
      }
    })

    // Close panel when clicking outside
    document.addEventListener('click', (e) => {
      const panel = document.getElementById('adminPanel')
      if (panel && this.isOpen && !panel.contains(e.target) && !e.target.closest('.admin-icon-footer')) {
        this.closePanel()
      }
    })

    // Dynamic event delegation for admin panel content
    document.addEventListener('submit', (e) => {
      if (e.target.id === 'adminLoginForm') {
        e.preventDefault()
        this.handleLogin()
      } else if (e.target.id === 'uploadForm') {
        e.preventDefault()
        this.handleFileUpload()
      }
    })

    document.addEventListener('click', (e) => {
      if (e.target.id === 'adminLogoutBtn') {
        this.handleLogout()
      } else if (e.target.classList.contains('admin-tab-btn')) {
        this.switchTab(e.target.dataset.tab)
      } else if (e.target.id === 'addProductBtn') {
        this.showAddProductForm()
      } else if (e.target.id === 'refreshProductsBtn') {
        this.loadProducts()
      } else if (e.target.id === 'downloadCsvBtn') {
        this.downloadCSV()
      } else if (e.target.id === 'downloadJsonBtn') {
        this.downloadJSON()
      }
    })
  }

  togglePanel() {
    if (this.isOpen) {
      this.closePanel()
    } else {
      this.openPanel()
    }
  }

  openPanel() {
    const panel = document.getElementById('adminPanel')
    if (panel) {
      panel.classList.add('active')
      this.isOpen = true
    }
  }

  closePanel() {
    const panel = document.getElementById('adminPanel')
    if (panel) {
      panel.classList.remove('active')
      this.isOpen = false
    }
  }

  async handleLogin() {
    const email = document.getElementById('adminEmail').value
    const password = document.getElementById('adminPassword').value
    const errorDiv = document.getElementById('adminError')

    try {
      await AuthService.signIn(email, password)
      errorDiv.textContent = ''
    } catch (error) {
      errorDiv.textContent = 'Error de autenticación: ' + error.message
    }
  }

  async handleLogout() {
    try {
      await AuthService.signOut()
    } catch (error) {
      console.error('Error logging out:', error)
    }
  }

  showLoginForm() {
    const body = document.getElementById('adminPanelBody')
    if (body) {
      body.innerHTML = this.getLoginFormHTML()
    }
  }

  showAdminContent() {
    const body = document.getElementById('adminPanelBody')
    if (body) {
      body.innerHTML = this.getAdminContentHTML()
      this.loadProducts()
    }
  }

  switchTab(tabName) {
    // Update tab buttons
    document.querySelectorAll('.admin-tab-btn').forEach(btn => {
      btn.classList.remove('active')
    })
    document.querySelector(`[data-tab="${tabName}"]`).classList.add('active')

    // Update tab content
    document.querySelectorAll('.admin-tab-pane').forEach(pane => {
      pane.classList.remove('active')
    })
    document.getElementById(`${tabName}-tab`).classList.add('active')
  }

  async loadProducts() {
    const container = document.getElementById('adminProductsList')
    if (!container) return

    container.innerHTML = '<div class="loading">Cargando productos...</div>'

    try {
      const products = await ProductService.getAllProducts()
      this.renderProductsList(products)
    } catch (error) {
      container.innerHTML = '<div class="error">Error cargando productos: ' + error.message + '</div>'
    }
  }

  renderProductsList(products) {
    const container = document.getElementById('adminProductsList')
    if (!container) return

    if (products.length === 0) {
      container.innerHTML = '<div class="no-products">No hay productos disponibles</div>'
      return
    }

    const html = `
      <div class="products-table">
        <div class="products-header">
          <div>Imagen</div>
          <div>Nombre</div>
          <div>Categoría</div>
          <div>Precio</div>
          <div>Stock</div>
          <div>Acciones</div>
        </div>
        ${products.map(product => `
          <div class="product-row" data-id="${product.id}">
            <div class="product-image">
              <img src="${product.image_url || 'https://via.placeholder.com/50'}" alt="${product.name}" />
            </div>
            <div class="product-name">${product.name || 'Sin nombre'}</div>
            <div class="product-category">${product.category || 'Sin categoría'}</div>
            <div class="product-price">$${this.formatPrice(product.price)}</div>
            <div class="product-stock">${product.stock || 0}</div>
            <div class="product-actions">
              <button class="admin-btn-small edit-product" data-id="${product.id}">Editar</button>
              <button class="admin-btn-small delete-product" data-id="${product.id}">Eliminar</button>
            </div>
          </div>
        `).join('')}
      </div>
    `

    container.innerHTML = html

    // Add event listeners for edit and delete buttons
    container.addEventListener('click', (e) => {
      if (e.target.classList.contains('edit-product')) {
        this.editProduct(e.target.dataset.id)
      } else if (e.target.classList.contains('delete-product')) {
        this.deleteProduct(e.target.dataset.id)
      }
    })
  }

  formatPrice(price) {
    return new Intl.NumberFormat('es-AR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(price || 0)
  }

  showAddProductForm() {
    // Implementation for add product form
    alert('Funcionalidad de agregar producto en desarrollo')
  }

  editProduct(id) {
    // Implementation for edit product
    alert(`Editar producto ID: ${id}`)
  }

  async deleteProduct(id) {
    if (!confirm('¿Estás seguro de que quieres eliminar este producto?')) {
      return
    }

    try {
      await ProductService.deleteProduct(id)
      this.loadProducts() // Refresh the list
    } catch (error) {
      alert('Error eliminando producto: ' + error.message)
    }
  }

  async handleFileUpload() {
    const fileInput = document.getElementById('csvFile')
    const file = fileInput.files[0]

    if (!file) {
      alert('Por favor selecciona un archivo')
      return
    }

    try {
      const text = await file.text()
      const products = this.parseCSV(text)
      
      for (const product of products) {
        await ProductService.addProduct(product)
      }
      
      alert(`Se subieron ${products.length} productos exitosamente`)
      this.loadProducts()
    } catch (error) {
      alert('Error subiendo archivo: ' + error.message)
    }
  }

  parseCSV(text) {
    const lines = text.split('\n')
    const headers = lines[0].split(';')
    const products = []

    for (let i = 1; i < lines.length; i++) {
      if (lines[i].trim() === '') continue
      
      const values = lines[i].split(';')
      const product = {}
      
      headers.forEach((header, index) => {
        const value = values[index]?.trim()
        switch (header.trim()) {
          case 'price':
          case 'sale_price':
          case 'stock':
          case 'installments':
            product[header.trim()] = value ? parseFloat(value) : null
            break
          case 'on_sale':
          case 'featured':
            product[header.trim()] = value === 'true'
            break
          default:
            product[header.trim()] = value || null
        }
      })
      
      products.push(product)
    }

    return products
  }

  async downloadCSV() {
    try {
      const products = await ProductService.getAllProducts()
      const csv = this.convertToCSV(products)
      this.downloadFile(csv, 'productos.csv', 'text/csv')
    } catch (error) {
      alert('Error descargando CSV: ' + error.message)
    }
  }

  async downloadJSON() {
    try {
      const products = await ProductService.getAllProducts()
      const json = JSON.stringify(products, null, 2)
      this.downloadFile(json, 'productos.json', 'application/json')
    } catch (error) {
      alert('Error descargando JSON: ' + error.message)
    }
  }

  convertToCSV(products) {
    if (products.length === 0) return ''

    const headers = Object.keys(products[0])
    const csvContent = [
      headers.join(';'),
      ...products.map(product => 
        headers.map(header => {
          const value = product[header]
          return value !== null && value !== undefined ? String(value) : ''
        }).join(';')
      )
    ].join('\n')

    return csvContent
  }

  downloadFile(content, filename, contentType) {
    const blob = new Blob([content], { type: contentType })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    window.URL.revokeObjectURL(url)
  }
}