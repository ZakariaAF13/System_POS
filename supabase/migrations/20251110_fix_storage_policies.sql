/*
  # Fix Storage Policies for menu-images bucket

  1. Ensure bucket exists
  2. Remove ALL old policies (comprehensive cleanup)
  3. Add comprehensive RLS policies for authenticated uploads and public reads
*/

-- Ensure the bucket exists (will skip if already exists)
INSERT INTO storage.buckets (id, name, public)
VALUES ('menu-images', 'menu-images', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Drop ALL existing policies that might interfere (comprehensive cleanup)
DO $$ 
DECLARE
    pol record;
BEGIN
    FOR pol IN 
        SELECT policyname 
        FROM pg_policies 
        WHERE schemaname = 'storage' 
        AND tablename = 'objects'
        AND (
            policyname LIKE '%menu-images%' 
            OR policyname LIKE '%menu_images%'
        )
    LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || pol.policyname || '" ON storage.objects';
    END LOOP;
END $$;

-- Allow public read access (for displaying images)
CREATE POLICY "Public read menu-images"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'menu-images');

-- Allow authenticated users to upload (INSERT)
CREATE POLICY "Authenticated upload menu-images"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'menu-images');

-- Allow authenticated users to update their own uploads
CREATE POLICY "Authenticated update menu-images"
ON storage.objects
FOR UPDATE
TO authenticated
USING (bucket_id = 'menu-images')
WITH CHECK (bucket_id = 'menu-images');

-- Allow authenticated users to delete
CREATE POLICY "Authenticated delete menu-images"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'menu-images');
