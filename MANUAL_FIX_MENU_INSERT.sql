-- ============================================================
-- MANUAL FIX: menu_items INSERT Policy
-- ============================================================
-- COPY & PASTE ini ke Supabase SQL Editor dan RUN
-- ============================================================

-- Step 1: Drop old policies
DROP POLICY IF EXISTS "Allow admin full access to menu_items" ON menu_items;
DROP POLICY IF EXISTS "Allow admin full access to promotions" ON promotions;
DROP POLICY IF EXISTS "Allow public read access to menu_items" ON menu_items;
DROP POLICY IF EXISTS "Allow public read access to promotions" ON promotions;

-- Step 2: Create specific policies
-- menu_items
CREATE POLICY "Allow public read menu_items"
ON menu_items FOR SELECT TO public USING (true);

CREATE POLICY "Allow authenticated insert menu_items"
ON menu_items FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Allow authenticated update menu_items"
ON menu_items FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Allow authenticated delete menu_items"
ON menu_items FOR DELETE TO authenticated USING (true);

-- promotions
CREATE POLICY "Allow public read promotions"
ON promotions FOR SELECT TO public USING (true);

CREATE POLICY "Allow authenticated insert promotions"
ON promotions FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Allow authenticated update promotions"
ON promotions FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Allow authenticated delete promotions"
ON promotions FOR DELETE TO authenticated USING (true);

-- ============================================================
-- VERIFICATION QUERY
-- ============================================================
SELECT 
    schemaname,
    tablename,
    policyname,
    cmd as operation,
    roles
FROM pg_policies 
WHERE tablename IN ('menu_items', 'promotions')
ORDER BY tablename, policyname;

-- Expected: 8 policies total (4 for menu_items, 4 for promotions)
