import { supabase } from '@/lib/supabase';

export async function uploadMenuImage(file: File, menuId: string | null) {
  const ext = file.name.split('.').pop() || 'jpg';
  const key = `${menuId ?? 'new'}/${Date.now()}.${ext}`;
  const { error } = await supabase.storage.from('menu-images').upload(key, file, { upsert: true });
  if (error) throw error;
  const { data } = supabase.storage.from('menu-images').getPublicUrl(key);
  return data.publicUrl as string;
}
