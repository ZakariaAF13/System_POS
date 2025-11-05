import { supabase } from '@/lib/supabase';

/**
 * Normalize storage URL to ensure it has /public/ segment for public buckets
 */
export function normalizeStorageUrl(url: string | null | undefined): string | null {
  if (!url) return null;
  
  // If already has /public/, return as is
  if (url.includes('/storage/v1/object/public/')) return url;
  
  // If has /storage/v1/object/ but no /public/, add it
  if (url.includes('/storage/v1/object/')) {
    return url.replace('/storage/v1/object/', '/storage/v1/object/public/');
  }
  
  // If it's just a path (e.g., "new/123.jpg"), generate full public URL
  if (!url.startsWith('http')) {
    const { data } = supabase.storage.from('menu-images').getPublicUrl(url);
    return data.publicUrl;
  }
  
  return url;
}

/**
 * Upload menu image and return public URL
 */
export async function uploadMenuImage(file: File, menuId: string | null) {
  const ext = file.name.split('.').pop() || 'jpg';
  const key = `${menuId ?? 'new'}/${Date.now()}.${ext}`;
  const { error } = await supabase.storage.from('menu-images').upload(key, file, { upsert: true });
  if (error) throw error;
  const { data } = supabase.storage.from('menu-images').getPublicUrl(key);
  return data.publicUrl as string;
}
