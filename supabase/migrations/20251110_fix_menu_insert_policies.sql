/*
  # Fix menu_items and promotions INSERT policies
  
  Ensures authenticated users can INSERT into menu_items and promotions tables.
  This fixes the 400 Bad Request error during menu/promo creation.
*/

-- Drop existing overly permissive policies
DROP POLICY IF EXISTS "Allow admin full access to menu_items" ON menu_items;
DROP POLICY IF EXISTS "Allow admin full access to promotions" ON promotions;

-- Create specific policies for better control
-- menu_items policies
CREATE POLICY "Allow public read menu_items"
ON menu_items
FOR SELECT
TO public
USING (true);

CREATE POLICY "Allow authenticated insert menu_items"
ON menu_items
FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Allow authenticated update menu_items"
ON menu_items
FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "Allow authenticated delete menu_items"
ON menu_items
FOR DELETE
TO authenticated
USING (true);

-- promotions policies
CREATE POLICY "Allow public read promotions"
ON promotions
FOR SELECT
TO public
USING (true);

CREATE POLICY "Allow authenticated insert promotions"
ON promotions
FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Allow authenticated update promotions"
ON promotions
FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "Allow authenticated delete promotions"
ON promotions
FOR DELETE
TO authenticated
USING (true);
