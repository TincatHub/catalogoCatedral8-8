import { supabase } from '../config/supabase.js'

export class ProductService {
  static async validateTableStructure() {
    try {
      // Test if the products table exists and has the correct structure
      console.log('Validating database structure...')
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .limit(1)
      
      if (error) {
        console.error('Database validation error:', error)
        throw new Error(`Table validation failed: ${error.message}`)
      }
      
      console.log('Database validation successful, sample data:', data)
      
      // Check if we have data to validate structure
      if (data && data.length > 0) {
        const requiredColumns = [
          'id', 'name', 'description', 'description_large', 'price', 
          'sale_price', 'on_sale', 'installments', 'image_url', 
          'image1_url', 'image2_url', 'image3_url', 'category', 
          'subcategory', 'stock', 'featured'
        ]
        
        const firstRow = data[0]
        const missingColumns = requiredColumns.filter(col => !(col in firstRow))
        
        if (missingColumns.length > 0) {
          console.warn('Missing columns:', missingColumns)
          return {
            valid: false,
            missingColumns,
            message: `Missing required columns: ${missingColumns.join(', ')}`
          }
        }
        
        console.log('All required columns present')
        return {
          valid: true,
          message: 'Table structure is valid'
        }
      }
      
      console.log('Table exists but is empty')
      return {
        valid: true,
        message: 'Table exists but is empty'
      }
      
    } catch (error) {
      console.error('Validation error:', error)
      return {
        valid: false,
        message: error.message
      }
    }
  }

  static async getAllProducts() {
    try {
      console.log('Fetching all products from Supabase...')
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false })
      
      if (error) {
        console.error('Supabase error:', error)
        throw error
      }
      
      console.log('Products fetched:', data?.length || 0, 'items')
      console.log('Sample product:', data?.[0])
      return data || []
    } catch (error) {
      console.error('Error fetching products:', error)
      throw error
    }
  }

  static async getProductsByCategory(category) {
    try {
      console.log('Fetching products for category:', category)
      
      // First, let's see what categories exist in the database
      const { data: allProducts, error: allError } = await supabase
        .from('products')
        .select('category')
        .limit(5)
      
      if (allError) {
        console.error('Error fetching sample categories:', allError)
      } else {
        console.log('Sample categories in database:', allProducts.map(p => p.category))
      }
      
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('category', category)
        .order('name')
      
      if (error) {
        console.error('Supabase error for category:', error)
        throw error
      }
      
      console.log('Products found for category "' + category + '":', data?.length || 0)
      if (data && data.length > 0) {
        console.log('Sample product:', data[0])
      }
      return data || []
    } catch (error) {
      console.error('Error fetching products by category:', error)
      throw error
    }
  }

  static async getProductsBySubcategory(category, subcategory) {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('category', category)
        .eq('subcategory', subcategory)
      
      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Error fetching products by subcategory:', error)
      throw error
    }
  }

  static async getCategories() {
    try {
      // Return static categories instead of querying database
      return [
        'Climatización',
        'Tecnología', 
        'Tv Audio y video',
        'Electrodomesticos',
        'Deportes y exterior',
        'Deco Hogar',
        'Cuidado Personal',
        'Herramientas y construcción'
      ]
    } catch (error) {
      console.error('Error getting categories:', error)
      throw error
    }
  }

  static async getCategoriesFromDatabase() {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('category')
        .not('category', 'is', null)
      
      if (error) throw error
      
      const uniqueCategories = [...new Set(data.map(item => item.category))]
      return uniqueCategories
    } catch (error) {
      console.error('Error fetching categories from database:', error)
      throw error
    }
  }

  static async getSubcategories(category) {
    try {
      console.log('Fetching subcategories for:', category)
      const { data, error } = await supabase
        .from('products')
        .select('subcategory')
        .eq('category', category)
        .not('subcategory', 'is', null)
      
      if (error) {
        console.error('Error fetching subcategories:', error)
        throw error
      }
      
      const uniqueSubcategories = [...new Set(data.map(item => item.subcategory))]
      console.log('Subcategories found:', uniqueSubcategories)
      return uniqueSubcategories
    } catch (error) {
      console.error('Error fetching subcategories:', error)
      throw error
    }
  }

  static async addProduct(productData) {
    try {
      const { data, error } = await supabase
        .from('products')
        .insert([productData])
        .select()
      
      if (error) throw error
      return data[0]
    } catch (error) {
      console.error('Error adding product:', error)
      throw error
    }
  }

  static async updateProduct(id, productData) {
    try {
      const { data, error } = await supabase
        .from('products')
        .update(productData)
        .eq('id', id)
        .select()
      
      if (error) throw error
      return data[0]
    } catch (error) {
      console.error('Error updating product:', error)
      throw error
    }
  }

  static async deleteProduct(id) {
    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id)
      
      if (error) throw error
      return true
    } catch (error) {
      console.error('Error deleting product:', error)
      throw error
    }
  }
}