-- ============================================================
-- FIX: image_url Column & Schema Cache Refresh
-- ============================================================
-- Jalankan script ini di Supabase SQL Editor
-- ============================================================

-- Step 1: Verifikasi apakah kolom image_url sudah ada
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'menu_items' AND table_schema = 'public'
ORDER BY ordinal_position;

-- Step 2: Tambahkan kolom image_url jika belum ada (akan diabaikan jika sudah ada)
ALTER TABLE menu_items 
ADD COLUMN IF NOT EXISTS image_url TEXT;

-- Step 3: Verifikasi lagi struktur tabel
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'menu_items' AND table_schema = 'public'
ORDER BY ordinal_position;

-- Step 4: REFRESH SCHEMA CACHE (PENTING!)
NOTIFY pgrst, 'reload schema';

-- Step 5: Verifikasi bahwa kolom image_url sudah ada
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_name = 'menu_items' 
    AND column_name = 'image_url' 
    AND table_schema = 'public'
  ) THEN
    RAISE NOTICE '✅ Kolom image_url sudah tersedia di tabel menu_items';
  ELSE
    RAISE EXCEPTION '❌ Kolom image_url TIDAK ditemukan. Hubungi admin database.';
  END IF;
END $$;

-- ============================================================
-- ALTERNATIF: Jika NOTIFY tidak bekerja, restart Supabase project:
-- Dashboard → Settings → General → Restart project
-- ============================================================

-- Step 6: Test insert (opsional - uncomment untuk test)
/*
INSERT INTO menu_items (name, description, price, category, available, image_url)
VALUES ('Test Menu', 'Test Description', 10000, 'Test Category', true, 'test-url.jpg')
RETURNING *;
*/

-- Step 7: Cleanup test data (jika di-uncomment)
/*
DELETE FROM menu_items WHERE name = 'Test Menu';
*/
