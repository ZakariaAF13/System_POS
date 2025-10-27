'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

type MenuItem = {
  id: string;
  name: string;
  description: string | null;
  price: number;
  category: string;
  available: boolean;
  image_url: string | null;
};

export default function UserMenuPage() {
  const [items, setItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('menu_items')
      .select('id, name, description, price, category, available, image_url')
      .eq('available', true)
      .order('name', { ascending: true });
    setItems((data as MenuItem[]) || []);
    setLoading(false);
  };

  useEffect(() => {
    load();
    const ch = supabase
      .channel('menu_items-ch')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'menu_items' }, () => load())
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, []);

  return (
    <main className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Menu</h1>
        {loading ? (
          <div>Loading...</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {items.map((m) => (
              <div key={m.id} className="bg-white rounded-lg shadow p-4">
                {m.image_url && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={m.image_url} alt={m.name} className="w-full h-40 object-cover rounded mb-3" />
                )}
                <div className="font-semibold text-lg">{m.name}</div>
                {m.description && <div className="text-sm text-gray-600 mt-1">{m.description}</div>}
                <div className="mt-3 font-bold">Rp {Number(m.price).toLocaleString('id-ID')}</div>
              </div>
            ))}
            {items.length === 0 && (
              <div className="text-sm text-gray-500">Belum ada menu tersedia.</div>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
