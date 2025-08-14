import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY

console.log('Supabase config:', {
  url: supabaseUrl ? 'Set' : 'Missing',
  key: supabaseKey ? 'Set' : 'Missing'
})
if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseKey)

// Test connection
supabase.from('products').select('count', { count: 'exact' }).then(({ count, error }) => {
  if (error) {
    console.error('Supabase connection test failed:', error)
  } else {
    console.log('Supabase connected successfully. Products count:', count)
  }
})
