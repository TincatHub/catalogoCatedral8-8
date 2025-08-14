/*
  # Estructura Completa de Base de Datos para TiendaOnline

  Este archivo contiene la estructura completa de todas las tablas necesarias
  para el funcionamiento de la aplicación de e-commerce.

  ## Tablas incluidas:
  1. products - Productos del catálogo
  2. categories - Categorías principales
  3. subcategories - Subcategorías organizadas por categoría
  4. orders - Pedidos de clientes
  
  ## Características:
  - RLS (Row Level Security) habilitado
  - Políticas de seguridad configuradas
  - Datos de ejemplo incluidos
  - Índices para optimización
*/

-- ============================================================================
-- 1. TABLA PRODUCTS (Productos)
-- ============================================================================

DROP TABLE IF EXISTS products CASCADE;

CREATE TABLE products (
  -- Identificador único
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Información básica del producto
  name text NOT NULL,
  description text DEFAULT '',
  description_large text DEFAULT '',
  
  -- Precios y ofertas
  price numeric(10,2) NOT NULL,
  sale_price numeric(10,2) NULL,
  on_sale boolean DEFAULT false,
  installments smallint DEFAULT 1,
  
  -- Imágenes del producto (4 imágenes máximo)
  image_url text DEFAULT 'https://images.pexels.com/photos/90946/pexels-photo-90946.jpeg',
  image1_url text DEFAULT 'https://images.pexels.com/photos/90946/pexels-photo-90946.jpeg',
  image2_url text DEFAULT 'https://images.pexels.com/photos/90946/pexels-photo-90946.jpeg',
  image3_url text DEFAULT 'https://images.pexels.com/photos/90946/pexels-photo-90946.jpeg',
  
  -- Categorización
  category text NOT NULL,
  subcategory text DEFAULT '',
  
  -- Inventario y características
  stock integer DEFAULT 0,
  featured boolean DEFAULT false,
  
  -- Timestamps
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Índices para optimización
CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_products_featured ON products(featured);
CREATE INDEX idx_products_stock ON products(stock);
CREATE INDEX idx_products_on_sale ON products(on_sale);

-- RLS y políticas
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Products are viewable by everyone"
  ON products FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Products are insertable by authenticated users"
  ON products FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Products are updatable by authenticated users"
  ON products FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Products are deletable by authenticated users"
  ON products FOR DELETE
  TO authenticated
  USING (true);

-- ============================================================================
-- 2. TABLA CATEGORIES (Categorías)
-- ============================================================================

DROP TABLE IF EXISTS categories CASCADE;

CREATE TABLE categories (
  -- Identificador único
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Información de la categoría
  name text UNIQUE NOT NULL,
  description text DEFAULT '',
  
  -- Timestamp
  created_at timestamptz DEFAULT now()
);

-- RLS y políticas
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Categories are viewable by everyone"
  ON categories FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Categories are insertable by authenticated users"
  ON categories FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Categories are updatable by authenticated users"
  ON categories FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Categories are deletable by authenticated users"
  ON categories FOR DELETE
  TO authenticated
  USING (true);

-- ============================================================================
-- 3. TABLA SUBCATEGORIES (Subcategorías)
-- ============================================================================

DROP TABLE IF EXISTS subcategories CASCADE;

CREATE TABLE subcategories (  
  
  -- Información de la subcategoría
  name text NOT NULL,
  category_name text NOT NULL,
  -- Identificador único
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Timestamp
  created_at timestamptz DEFAULT now()
);

-- Índice para optimización
CREATE INDEX idx_subcategories_category ON subcategories(category_name);

-- RLS y políticas
ALTER TABLE subcategories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Subcategories are viewable by everyone"
  ON subcategories FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Subcategories are insertable by authenticated users"
  ON subcategories FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Subcategories are updatable by authenticated users"
  ON subcategories FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Subcategories are deletable by authenticated users"
  ON subcategories FOR DELETE
  TO authenticated
  USING (true);

-- ============================================================================
-- 4. TABLA ORDERS (Pedidos)
-- ============================================================================

DROP TABLE IF EXISTS orders CASCADE;

CREATE TABLE orders (
  -- Identificador único
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Información del cliente
  user_email text NOT NULL,
  user_name text NOT NULL,
  user_doc text NOT NULL,
  user_phone text NOT NULL,
  user_address text NOT NULL,
  user_postalcode text NOT NULL,
  user_recept text NOT NULL,
  
  -- Información del pedido
  items jsonb NOT NULL DEFAULT '[]'::jsonb,
  total numeric(10,2) NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'pending',
  
  -- Timestamp
  created_at timestamptz DEFAULT now()
);

-- Índices para optimización
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_user_email ON orders(user_email);
CREATE INDEX idx_orders_created_at ON orders(created_at);

-- RLS y políticas
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Orders are insertable by everyone"
  ON orders FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Orders are viewable by authenticated users"
  ON orders FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Orders are updatable by authenticated users"
  ON orders FOR UPDATE
  TO authenticated
  USING (true);

-- ============================================================================
-- DATOS DE EJEMPLO
-- ============================================================================

-- Insertar categorías de ejemplo
INSERT INTO categories (name, description) VALUES
('Climatización', 'Dispositivos electrónicos y tecnología'),
('Tecnología', 'Vestimenta y accesorios de moda'),
('Tv Audio y video', 'Artículos para el hogar y decoración'),
('Electrodomésticos', 'Equipamiento deportivo y fitness'),
('Deportes y exterior', 'Libros y material educativo'),
('Deco Hogar', 'Juguetes y entretenimiento');

-- Insertar subcategorías de ejemplo
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
  ('Tv y video','Tv Audio y Video');

-- Insertar productos de ejemplo
INSERT INTO products (
  name, description, description_large, price, sale_price, on_sale, installments,
  image_url, image1_url, image2_url, image3_url,
  category, subcategory, stock, featured
) VALUES
('iPhone 15 Pro', 'Smartphone premium con tecnología avanzada', 'El iPhone 15 Pro representa la culminación de la innovación de Apple, con un diseño de titanio premium, el potente chip A17 Pro y un sistema de cámaras profesional que redefine la fotografía móvil.', 1450999.99, 1400799.99, true, 16, 'https://images.pexels.com/photos/788946/pexels-photo-788946.jpeg', 'https://images.pexels.com/photos/1092644/pexels-photo-1092644.jpeg', 'https://images.pexels.com/photos/699122/pexels-photo-699122.jpeg', 'https://images.pexels.com/photos/404280/pexels-photo-404280.jpeg', 'Tecnología', 'Telefonía', 25, true),

('MacBook Air M2', 'Laptop ultradelgada con chip M2', 'La MacBook Air con chip M2 ofrece un rendimiento excepcional en un diseño ultradelgado. Perfecta para profesionales que necesitan potencia y portabilidad.', 1000299.99, NULL, false, 18, 'https://images.pexels.com/photos/205421/pexels-photo-205421.jpeg', 'https://images.pexels.com/photos/574071/pexels-photo-574071.jpeg', 'https://images.pexels.com/photos/18105/pexels-photo.jpg', 'https://images.pexels.com/photos/205421/pexels-photo-205421.jpeg', 'Tecnología', 'Computación', 15, true),

('Auriculares Sony WH-1000XM4', 'Auriculares con cancelación de ruido', 'Auriculares inalámbricos premium con la mejor cancelación de ruido del mercado, sonido Hi-Res y hasta 30 horas de batería.', 300299.99, 288239.99, true, 6, 'https://images.pexels.com/photos/3394650/pexels-photo-3394650.jpeg', 'https://images.pexels.com/photos/1649771/pexels-photo-1649771.jpeg', 'https://images.pexels.com/photos/3394650/pexels-photo-3394650.jpeg', 'https://images.pexels.com/photos/1649771/pexels-photo-1649771.jpeg', 'Tecnología', 'Auriculares y otros', 30, true),

('Tablet Samsung Galaxy Tab', 'Tablet Android de 10 pulgadas', 'Tablet Android con pantalla de 10 pulgadas, procesador octa-core, 4GB RAM y 64GB almacenamiento. Perfecta para entretenimiento y productividad.', 559299.99, 5399249.99, true, 12, 'https://images.pexels.com/photos/1334597/pexels-photo-1334597.jpeg', 'https://images.pexels.com/photos/1334597/pexels-photo-1334597.jpeg', 'https://images.pexels.com/photos/1334597/pexels-photo-1334597.jpeg', 'https://images.pexels.com/photos/1334597/pexels-photo-1334597.jpeg', 'Tecnología', 'Computación', 18, true),

('Monitor 4K 27 pulgadas', 'Monitor profesional para diseño', 'Monitor 4K de 27 pulgadas con tecnología IPS, 99% sRGB, HDR10 y conectividad USB-C. Ideal para diseño gráfico y edición de video.', 540399.99, NULL, false, 12, 'https://images.pexels.com/photos/777001/pexels-photo-777001.jpeg', 'https://images.pexels.com/photos/777001/pexels-photo-777001.jpeg', 'https://images.pexels.com/photos/777001/pexels-photo-777001.jpeg', 'https://images.pexels.com/photos/777001/pexels-photo-777001.jpeg', 'Tecnología', 'Computación', 15, true),

('Silla Gaming Ergonómica', 'Silla para largas sesiones de juego', 'Silla gaming ergonómica con soporte lumbar, reposabrazos ajustables, reclinación 180° y materiales de alta calidad. Diseñada para máximo confort.', 419988, 409998, true, 12, 'https://images.pexels.com/photos/4050315/pexels-photo-4050315.jpeg', 'https://images.pexels.com/photos/4050315/pexels-photo-4050315.jpeg', 'https://images.pexels.com/photos/4050315/pexels-photo-4050315.jpeg', 'https://images.pexels.com/photos/4050315/pexels-photo-4050315.jpeg', 'Tecnología', 'Gamers', 12, true),

('Altavoces Bluetooth JBL', 'Altavoces portátiles resistentes al agua', 'Altavoces Bluetooth portátiles con sonido estéreo de alta calidad, resistentes al agua IPX7 y hasta 20 horas de batería. Perfectos para cualquier ocasión.', 89989.99, NULL, false, 3, 'https://images.pexels.com/photos/3394650/pexels-photo-3394650.jpeg', 'https://images.pexels.com/photos/3394650/pexels-photo-3394650.jpeg', 'https://images.pexels.com/photos/3394650/pexels-photo-3394650.jpeg', 'https://images.pexels.com/photos/3394650/pexels-photo-3394650.jpeg', 'Tv Audio y Video', 'Audio', 35, false);

-- Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger para actualizar updated_at en products
CREATE TRIGGER update_products_updated_at 
    BEFORE UPDATE ON products 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();
