-- Migration to fix storage URLs to include /public/ segment
-- This ensures all image URLs in the database have the correct format

-- Fix menu_items image URLs
UPDATE menu_items
SET image_url = REPLACE(image_url, '/storage/v1/object/menu-images/', '/storage/v1/object/public/menu-images/')
WHERE image_url IS NOT NULL 
  AND image_url LIKE '%/storage/v1/object/menu-images/%'
  AND image_url NOT LIKE '%/storage/v1/object/public/%';

-- Fix promotions image URLs
UPDATE promotions
SET image_url = REPLACE(image_url, '/storage/v1/object/menu-images/', '/storage/v1/object/public/menu-images/')
WHERE image_url IS NOT NULL 
  AND image_url LIKE '%/storage/v1/object/menu-images/%'
  AND image_url NOT LIKE '%/storage/v1/object/public/%';

-- Log the changes
DO $$
BEGIN
  RAISE NOTICE 'Storage URLs have been updated to include /public/ segment';
END $$;
