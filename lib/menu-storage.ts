import { supabase } from '@/lib/supabase';

/**
 * Normalize storage URL to ensure it has /public/ segment for public buckets
 * Validates URLs to prevent 400 errors from invalid image paths
 */
export function normalizeStorageUrl(url: string | null | undefined): string | null {
  if (!url) return null;
  
  // If already has /public/, validate it's complete
  if (url.includes('/storage/v1/object/public/')) {
    // Check if URL is complete and has bucket name
    if (url.includes('/storage/v1/object/public/menu-images/')) {
      return url;
    }
    // If incomplete, try to extract path after /public/
    const match = url.match(/\/storage\/v1\/object\/public\/(.+)$/);
    if (match && match[1]) {
      const { data } = supabase.storage.from('menu-images').getPublicUrl(match[1]);
      return data.publicUrl;
    }
  }
  
  // If has /storage/v1/object/ but no /public/, add it
  if (url.includes('/storage/v1/object/')) {
    return url.replace('/storage/v1/object/', '/storage/v1/object/public/');
  }
  
  // If it's just a path (e.g., "new/123.jpg"), generate full public URL
  if (!url.startsWith('http')) {
    // Validate path doesn't start with invalid characters
    const cleanPath = url.replace(/^\/+/, '');
    if (cleanPath) {
      const { data } = supabase.storage.from('menu-images').getPublicUrl(cleanPath);
      return data.publicUrl;
    }
    return null;
  }
  
  // If it's a full URL but from a different source, return as is
  // (e.g., external image URLs)
  return url;
}

/**
 * Upload menu image and return public URL
 */
export async function uploadMenuImage(file: File, menuId: string | null) {
  // Check authentication first
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    console.error('❌ Not authenticated! Please login first.');
    throw new Error('You must be logged in to upload images');
  }
  console.log('✅ User authenticated:', session.user.email);
  
  // Validate file
  if (!file || !(file instanceof File)) {
    throw new Error('Invalid file: must be a File object');
  }
  
  if (file.size === 0) {
    throw new Error('File is empty');
  }
  
  if (file.size > 5 * 1024 * 1024) { // 5MB limit
    throw new Error('File too large (max 5MB)');
  }
  
  const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg';
  const allowedExts = ['jpg', 'jpeg', 'png', 'gif', 'webp'];
  if (!allowedExts.includes(ext)) {
    throw new Error(`Invalid file type. Allowed: ${allowedExts.join(', ')}`);
  }
  
  // Use flat structure: menuId-timestamp.ext or timestamp.ext
  // This avoids nested folder RLS issues
  const timestamp = Date.now();
  const key = menuId ? `${menuId}-${timestamp}.${ext}` : `${timestamp}.${ext}`;
  
  console.log('📤 Uploading:', { key, size: file.size, type: file.type, bucket: 'menu-images' });
  
  const { data, error } = await supabase.storage
    .from('menu-images')
    .upload(key, file, { 
      cacheControl: '3600',
      upsert: true 
    });
  
  if (error) {
    console.error('❌ Upload error:', error);
    throw new Error(`Upload failed: ${error.message}`);
  }
  
  console.log('✅ Upload success:', data);
  
  const { data: urlData } = supabase.storage.from('menu-images').getPublicUrl(key);
  return urlData.publicUrl as string;
}
