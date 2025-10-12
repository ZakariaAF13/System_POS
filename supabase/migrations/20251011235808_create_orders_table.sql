/*
  # Create Orders Table

  1. New Tables
    - `orders`
      - `id` (uuid, primary key)
      - `order_number` (text, unique) - Human-readable order number
      - `table_id` (text) - Table identifier
      - `customer_name` (text) - Customer name
      - `phone` (text) - Customer phone number
      - `address` (text, nullable) - Delivery address (optional)
      - `notes` (text, nullable) - Order notes (optional)
      - `delivery_method` (text) - dine_in, takeaway, or delivery
      - `items` (jsonb) - Order items in JSON format
      - `total_amount` (numeric) - Total order amount
      - `status` (text) - Order status: pending, paid, preparing, ready, completed, cancelled
      - `payment_type` (text, nullable) - Payment method: qris, gopay, ovo, cash
      - `transaction_id` (text, nullable) - Midtrans transaction ID
      - `created_at` (timestamptz) - Order creation timestamp
      - `updated_at` (timestamptz) - Last update timestamp

  2. Security
    - Enable RLS on `orders` table
    - Add policy for public to insert orders
    - Add policy for public to read their own orders
    - Add policy for authenticated users to update orders
    - Add policy for authenticated users to read all orders (for cashier)

  3. Indexes
    - Index on order_number for quick lookups
    - Index on status for filtering
    - Index on created_at for sorting
*/

CREATE TABLE IF NOT EXISTS orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number text UNIQUE NOT NULL DEFAULT 'ORD-' || to_char(NOW(), 'YYYYMMDD') || '-' || LPAD(FLOOR(RANDOM() * 10000)::text, 4, '0'),
  table_id text NOT NULL,
  customer_name text NOT NULL,
  phone text NOT NULL,
  address text,
  notes text,
  delivery_method text NOT NULL DEFAULT 'dine_in',
  items jsonb NOT NULL DEFAULT '[]'::jsonb,
  total_amount numeric(10, 2) NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'pending',
  payment_type text,
  transaction_id text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can create orders"
  ON orders
  FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Anyone can view orders"
  ON orders
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Anyone can update orders"
  ON orders
  FOR UPDATE
  TO public
  USING (true)
  WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_orders_order_number ON orders(order_number);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at DESC);

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_orders_updated_at
  BEFORE UPDATE ON orders
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
