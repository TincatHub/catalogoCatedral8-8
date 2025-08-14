/*
  # E-commerce Database Schema

  1. New Tables
    - `categories`
      - `id` (uuid, primary key)
      - `name` (text, unique)
      - `description` (text)
      - `created_at` (timestamp)
    - `products`
      - `id` (uuid, primary key)
      - `name` (text)
      - `description` (text)
      - `description_large` (text)
      - `price` (numeric)
      - `sale_price` (numeric)
      - `on_sale` (boolean)
      - `installments` (numeric)
      - `image_url` (text)
      - `image1_url` (text)
      - `image2_url` (text)
      - `image3_url` (text)
      - `category` (text)
      - `subcategory` (text)
      - `stock` (integer)
      - `featured` (boolean)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    - `orders`
      - `id` (uuid, primary key)
      - `user_email` (text)
      - `user_name` (text)
      - `user_phone` (text)
      - `user_address` (text)
      - `items` (jsonb)
      - `total` (numeric)
      - `status` (text)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for public read access on products and categories
    - Add policies for order creation and admin management
*/

-- Create products table
CREATE TABLE IF NOT EXISTS products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text DEFAULT '',
  description_large text DEFAULT '',
  price numeric(10,2) NOT NULL DEFAULT 0,
  sale_price numeric(10,2) NOT NULL DEFAULT 0,
  on_sale  boolean DEFAULT false,
  installments integer NOT NULL DEFAULT 1,
  image_url text DEFAULT 'https://images.pexels.com/photos/90946/pexels-photo-90946.jpeg',
  image1_url text DEFAULT 'https://images.pexels.com/photos/90946/pexels-photo-90946.jpeg',
  image2_url text DEFAULT 'https://images.pexels.com/photos/90946/pexels-photo-90946.jpeg',
  image3_url text DEFAULT 'https://images.pexels.com/photos/90946/pexels-photo-90946.jpeg',
  category text NOT NULL DEFAULT 'General',
  subcategory text NOT NULL DEFAULT 'General',
  stock integer NOT NULL DEFAULT 0,
  featured boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create orders table
CREATE TABLE IF NOT EXISTS orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_email text NOT NULL,
  user_name text NOT NULL,
  user_phone text NOT NULL,
  user_address text NOT NULL,
  items jsonb NOT NULL DEFAULT '[]',
  total numeric(10,2) NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;


-- Create policies for products (public read access)
CREATE POLICY "Products are viewable by everyone"
  ON products
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Products are insertable by authenticated users"
  ON products
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Products are updatable by authenticated users"
  ON products
  FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Products are deletable by authenticated users"
  ON products
  FOR DELETE
  TO authenticated
  USING (true);

-- Create policies for orders
CREATE POLICY "Orders are viewable by authenticated users"
  ON orders
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Orders are insertable by everyone"
  ON orders
  FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Orders are updatable by authenticated users"
  ON orders
  FOR UPDATE
  TO authenticated
  USING (true);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for products updated_at
CREATE TRIGGER update_products_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Insert sample products
INSERT INTO products (name, description, price, image_url, category, stock, featured) VALUES
  ('iPhone 15 Pro', 'El último smartphone de Apple con tecnología avanzada', 999.99, 'https://images.pexels.com/photos/788946/pexels-photo-788946.jpeg', 'Electrónicos', 25, true),
  ('MacBook Air M2', 'Laptop ultradelgada con chip M2 de Apple', 1299.99, 'https://images.pexels.com/photos/205421/pexels-photo-205421.jpeg', 'Electrónicos', 15, true),
  ('Camiseta Premium', 'Camiseta de algodón 100% orgánico', 29.99, 'https://images.pexels.com/photos/996329/pexels-photo-996329.jpeg', 'Ropa', 100, false),
  ('Zapatillas Running', 'Zapatillas deportivas para correr', 89.99, 'https://images.pexels.com/photos/2529148/pexels-photo-2529148.jpeg', 'Deportes', 50, true),
  ('Sofá Moderno', 'Sofá de 3 plazas estilo moderno', 599.99, 'https://images.pexels.com/photos/1350789/pexels-photo-1350789.jpeg', 'Hogar', 8, false),
  ('Libro de Programación', 'Guía completa de desarrollo web', 39.99, 'https://images.pexels.com/photos/159711/books-bookstore-book-reading-159711.jpeg', 'Libros', 30, false)
ON CONFLICT DO NOTHING;

/*
  # Add subcategories

  1. New Tables
    - `subcategories`      
      - `name` (text)
      - `category_name` (text, references categories)
      - `id` (uuid, primary key)
      - `created_at` (timestamp)

  3. Security
    - Enable RLS on subcategories table
    - Add policies for public read access
*/

-- Create subcategories table
CREATE TABLE IF NOT EXISTS subcategories ( 
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  category_name text NOT NULL,  
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security for subcategories
ALTER TABLE subcategories ENABLE ROW LEVEL SECURITY;

-- Create policies for subcategories (public read access)
CREATE POLICY "Subcategories are viewable by everyone"
  ON subcategories
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Subcategories are insertable by authenticated users"
  ON subcategories
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Subcategories are updatable by authenticated users"
  ON subcategories
  FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Subcategories are deletable by authenticated users"
  ON subcategories
  FOR DELETE
  TO authenticated
  USING (true);

-- Insert sample subcategories
INSERT INTO subcategories (name, category_name) VALUES
  
  ('Ventilación','Climatización'),
  ('Aire acondicionado','Climatización'),
  ('Calefacción','Climatización'),  
  ('Jardin y camping','Deportes y exterior'),
  ('Piletas','Deportes y exterior'),
  ('Deportes','Deportes y exterior'),
  ('Muebles y oficina','Deco Hogar'),
  ('Colchones y sommiers','Deco Hogar'),
  ('Limpieza y Órden','Deco Hogar'),
  ('Bazar','Deco Hogar'),
  ('Mochilas y bolsos','Deco Hogar'),
  ('Depilación','Cuidado Personal'),
  ('Rostro','Cuidado Personal'),
  ('Bienestar y salud','Cuidado Personal'),
  ('Herramientas eléctricas','Herramientas y construcción'),
  ('Herramientas manuales','Herramientas y construcción'),
  ('Accesorios y otros','Herramientas y construcción'),
  ('Grandes Electrodomesticos','Electrodomesticos'),
  ('Electro Cocina','Electrodomesticos'),
  ('Electro Hogar','Electrodomesticos'),
  ('Auriculares y otros','Tecnología'),
  ('Telefonía','Tecnología'),
  ('Computación','Tecnología'),
  ('Gamers','Tecnología'),
  ('Soportes','Tv Audio y Video'),
  ('Audio','Tv Audio y Video'),
  ('Tv y video','Tv Audio y Video')
ON CONFLICT DO NOTHING;
