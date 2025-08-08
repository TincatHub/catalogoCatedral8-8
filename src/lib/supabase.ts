import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

console.log('🔧 INICIALIZANDO SUPABASE CLIENT:', {
  url: supabaseUrl,
  key: supabaseAnonKey ? `${supabaseAnonKey.substring(0, 20)}...` : 'No configurada'
});

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Database = {
  public: {
    Tables: {
      products: {
        Row: {
          id: string;
          name: string;
          description: string;
          description_large: string;
          price: number;
          sale_price: number | null;
          on_sale: boolean;
          installments: number;
          image_url: string;
          image1_url: string;
          image2_url: string;
          image3_url: string;
          category: string;
          subcategory: string;
          stock: number;
          featured: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          name: string;
          description?: string;
          description_large?: string;
          price: number;
          sale_price?: number | null;
          on_sale?: boolean;
          installments?: number;
          image_url?: string;
          image1_url?: string;
          image2_url?: string;
          image3_url?: string;
          category?: string;
          subcategory?: string;
          stock?: number;
          featured?: boolean;
        };
        Update: Partial<Database['public']['Tables']['products']['Insert']>;
      };
     
      subcategories: {
        Row: {
          name: string;
          category_name: string;
          id: string;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['subcategories']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['subcategories']['Insert']>;
      };
      orders: {
        Row: {
          id: string;
          user_email: string;
          user_name: string;
          user_doc: string;
          user_phone: string;
          user_address: string;
          user_postalcode: string;
          user_recept: string;
          items: any;
          total: number;
          status: string;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['orders']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['orders']['Insert']>;
      };
    };
  };
};
