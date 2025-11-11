-- ============================================================
-- COMPLETE FIX SCRIPT: Menu Items & Promotions Schema
-- ============================================================
-- COPY SELURUH SCRIPT INI ke Supabase SQL Editor dan RUN
-- Script ini akan:
-- 1. Verifikasi & tambah kolom image_url
-- 2. Perbaiki RLS policies
-- 3. Refresh schema cache
-- 4. Verifikasi hasil
-- ============================================================

-- ============================================================
-- PART 1: Verifikasi & Tambah Kolom image_url
-- ============================================================

-- Tampilkan struktur tabel saat ini
SELECT 'Current menu_items structure:' as info;
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'menu_items' AND table_schema = 'public'
ORDER BY ordinal_position;

-- Tambahkan kolom image_url jika belum ada
ALTER TABLE menu_items 
ADD COLUMN IF NOT EXISTS image_url TEXT;

ALTER TABLE promotions 
ADD COLUMN IF NOT EXISTS image_url TEXT;

-- Verifikasi kolom sudah ditambahkan
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'menu_items' AND column_name = 'image_url' AND table_schema = 'public'
  ) THEN
    RAISE NOTICE '✅ Kolom image_url tersedia di tabel menu_items';
  ELSE
    RAISE EXCEPTION '❌ GAGAL: Kolom image_url tidak ada di menu_items';
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'promotions' AND column_name = 'image_url' AND table_schema = 'public'
  ) THEN
    RAISE NOTICE '✅ Kolom image_url tersedia di tabel promotions';
  ELSE
    RAISE EXCEPTION '❌ GAGAL: Kolom image_url tidak ada di promotions';
  END IF;
END $$;

-- ============================================================
-- PART 2: Perbaiki RLS Policies
-- ============================================================

-- Drop old policies
DROP POLICY IF EXISTS "Allow admin full access to menu_items" ON menu_items;
DROP POLICY IF EXISTS "Allow admin full access to promotions" ON promotions;
DROP POLICY IF EXISTS "Allow public read access to menu_items" ON menu_items;
DROP POLICY IF EXISTS "Allow public read access to promotions" ON promotions;

-- Create specific policies for menu_items
CREATE POLICY "Allow public read menu_items"
ON menu_items FOR SELECT TO public USING (true);

CREATE POLICY "Allow authenticated insert menu_items"
ON menu_items FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Allow authenticated update menu_items"
ON menu_items FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Allow authenticated delete menu_items"
ON menu_items FOR DELETE TO authenticated USING (true);

-- Create specific policies for promotions
CREATE POLICY "Allow public read promotions"
ON promotions FOR SELECT TO public USING (true);

CREATE POLICY "Allow authenticated insert promotions"
ON promotions FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Allow authenticated update promotions"
ON promotions FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Allow authenticated delete promotions"
ON promotions FOR DELETE TO authenticated USING (true);

RAISE NOTICE '✅ RLS Policies berhasil diperbaiki';

-- ============================================================
-- PART 3: REFRESH SCHEMA CACHE (PENTING!)
-- ============================================================

NOTIFY pgrst, 'reload schema';

RAISE NOTICE '✅ Schema cache di-refresh dengan NOTIFY pgrst';
RAISE NOTICE '⚠️  Jika masih error, restart Supabase project di Dashboard → Settings → Restart project';

-- ============================================================
-- PART 4: Verifikasi Final
-- ============================================================

-- Tampilkan struktur final tabel menu_items
SELECT 'Final menu_items structure:' as info;
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'menu_items' AND table_schema = 'public'
ORDER BY ordinal_position;

-- Tampilkan semua policies
SELECT 'Current RLS Policies:' as info;
SELECT 
    tablename,
    policyname,
    cmd as operation,
    roles
FROM pg_policies 
WHERE tablename IN ('menu_items', 'promotions')
ORDER BY tablename, policyname;

-- Verifikasi jumlah policies (harus 8: 4 untuk menu_items, 4 untuk promotions)
DO $$
DECLARE
  policy_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO policy_count
  FROM pg_policies 
  WHERE tablename IN ('menu_items', 'promotions');
  
  IF policy_count = 8 THEN
    RAISE NOTICE '✅ SEMUA POLICIES OK: % policies ditemukan', policy_count;
  ELSE
    RAISE WARNING '⚠️  Hanya % policies ditemukan (expected: 8)', policy_count;
  END IF;
END $$;

-- ============================================================
-- SELESAI!
-- ============================================================

RAISE NOTICE '';
RAISE NOTICE '╔════════════════════════════════════════════════════════╗';
RAISE NOTICE '║  ✅ FIX SELESAI!                                      ║';
RAISE NOTICE '║                                                        ║';
RAISE NOTICE '║  Langkah selanjutnya:                                 ║';
RAISE NOTICE '║  1. Restart Next.js dev server (npm run dev)          ║';
RAISE NOTICE '║  2. Clear browser cache (Ctrl+Shift+R)                ║';
RAISE NOTICE '║  3. Test insert menu di /admin/menu                   ║';
RAISE NOTICE '║                                                        ║';
RAISE NOTICE '║  Jika masih error PGRST204:                           ║';
RAISE NOTICE '║  → Restart Supabase project di Dashboard              ║';
RAISE NOTICE '╚════════════════════════════════════════════════════════╝';
RAISE NOTICE '';
