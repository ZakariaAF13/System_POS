-- ============================================================
-- FIX: Rename 'image' to 'image_url' in promotions table
-- ============================================================
-- Jalankan script ini di Supabase SQL Editor
-- ============================================================

-- Step 1: Cek struktur tabel promotions saat ini
SELECT 'Current promotions table structure:' as info;
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'promotions' AND table_schema = 'public'
ORDER BY ordinal_position;

-- Step 2: Rename kolom 'image' menjadi 'image_url' (jika ada)
DO $$
BEGIN
  -- Cek apakah kolom 'image' ada
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'promotions' 
    AND column_name = 'image'
    AND table_schema = 'public'
  ) THEN
    -- Rename kolom
    ALTER TABLE promotions RENAME COLUMN image TO image_url;
    RAISE NOTICE '✅ Kolom "image" berhasil diubah menjadi "image_url"';
    
    -- Hapus constraint NOT NULL (agar image_url bisa kosong/optional)
    ALTER TABLE promotions ALTER COLUMN image_url DROP NOT NULL;
    RAISE NOTICE '✅ Constraint NOT NULL dihapus dari image_url (sekarang optional)';
    
  ELSIF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'promotions' 
    AND column_name = 'image_url'
    AND table_schema = 'public'
  ) THEN
    RAISE NOTICE 'ℹ️  Kolom "image_url" sudah ada — tidak perlu rename';
    
    -- Pastikan NOT NULL dihapus
    ALTER TABLE promotions ALTER COLUMN image_url DROP NOT NULL;
    RAISE NOTICE '✅ Constraint NOT NULL dihapus dari image_url';
    
  ELSE
    RAISE EXCEPTION '❌ Tidak ada kolom "image" atau "image_url" di tabel promotions!';
  END IF;
END $$;

-- Step 3: Verifikasi struktur tabel setelah perubahan
SELECT 'Updated promotions table structure:' as info;
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'promotions' AND table_schema = 'public'
ORDER BY ordinal_position;

-- Step 4: REFRESH SCHEMA CACHE (PENTING!)
NOTIFY pgrst, 'reload schema';

RAISE NOTICE '';
RAISE NOTICE '╔════════════════════════════════════════════════════════╗';
RAISE NOTICE '║  ✅ FIX SELESAI!                                      ║';
RAISE NOTICE '║                                                        ║';
RAISE NOTICE '║  Perubahan:                                           ║';
RAISE NOTICE '║  • Kolom "image" → "image_url"                        ║';
RAISE NOTICE '║  • Constraint NOT NULL dihapus                        ║';
RAISE NOTICE '║  • Schema cache di-refresh                            ║';
RAISE NOTICE '║                                                        ║';
RAISE NOTICE '║  Langkah selanjutnya:                                 ║';
RAISE NOTICE '║  1. Restart dev server: npm run dev                   ║';
RAISE NOTICE '║  2. Clear browser cache: Ctrl+Shift+R                 ║';
RAISE NOTICE '║  3. Test insert promo di /admin/menu                  ║';
RAISE NOTICE '║                                                        ║';
RAISE NOTICE '║  Jika masih error:                                    ║';
RAISE NOTICE '║  → Restart Supabase project di Dashboard              ║';
RAISE NOTICE '╚════════════════════════════════════════════════════════╝';
RAISE NOTICE '';

-- Step 5: Test query (optional - uncomment untuk test)
/*
-- Test insert dengan image_url
INSERT INTO promotions (title, description, discount, active, image_url)
VALUES ('Test Promo', 'Test Description', 10, true, 'https://example.com/test.jpg')
RETURNING *;

-- Test insert tanpa image_url (harus berhasil karena sudah optional)
INSERT INTO promotions (title, description, discount, active)
VALUES ('Test Promo 2', 'No Image', 15, true)
RETURNING *;

-- Cleanup
DELETE FROM promotions WHERE title LIKE 'Test Promo%';
*/
