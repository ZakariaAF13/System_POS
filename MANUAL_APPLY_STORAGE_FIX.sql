-- ============================================================
-- MANUAL FIX: Storage RLS Policies for menu-images
-- ============================================================
-- COPY & PASTE seluruh file ini ke Supabase SQL Editor
-- Dashboard → SQL Editor → New Query → Paste → RUN
-- ============================================================

-- Step 1: Ensure bucket exists and is public
INSERT INTO storage.buckets (id, name, public)
VALUES ('menu-images', 'menu-images', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Step 2: Drop ALL existing conflicting policies
DROP POLICY IF EXISTS "Public read menu-images" ON storage.objects;
DROP POLICY IF EXISTS "Auth upload menu-images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated upload menu-images" ON storage.objects;
DROP POLICY IF EXISTS "Owner update menu-images" ON storage.objects;
DROP POLICY IF EXISTS "Owner delete menu-images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated can insert menu-images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated can update menu-images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated can delete menu-images" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated users to upload to menu-images" ON storage.objects;
DROP POLICY IF EXISTS "Allow public read access to menu-images" ON storage.objects;

-- Step 3: Create FRESH policies
-- SELECT (Read) - Allow PUBLIC to view images
CREATE POLICY "Public read menu-images"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'menu-images');

-- INSERT (Upload) - Allow AUTHENTICATED to upload
CREATE POLICY "Authenticated upload menu-images"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'menu-images');

-- UPDATE - Allow AUTHENTICATED to update
CREATE POLICY "Authenticated update menu-images"
ON storage.objects
FOR UPDATE
TO authenticated
USING (bucket_id = 'menu-images')
WITH CHECK (bucket_id = 'menu-images');

-- DELETE - Allow AUTHENTICATED to delete
CREATE POLICY "Authenticated delete menu-images"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'menu-images');

-- ============================================================
-- VERIFICATION QUERY - Run this after to check policies
-- ============================================================
SELECT 
    policyname,
    cmd as command,
    roles,
    qual as using_clause,
    with_check
FROM pg_policies 
WHERE schemaname = 'storage' 
  AND tablename = 'objects'
  AND policyname LIKE '%menu-images%'
ORDER BY policyname;

-- Expected output: 4 policies
-- 1. Authenticated delete menu-images (DELETE)
-- 2. Authenticated update menu-images (UPDATE)
-- 3. Authenticated upload menu-images (INSERT)
-- 4. Public read menu-images (SELECT)
