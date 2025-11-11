'use client';

import { useEffect, useMemo, useState } from 'react';
import { createSupabaseClientWithKey } from '@/lib/supabase';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { uploadMenuImage, normalizeStorageUrl } from '@/lib/menu-storage';
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import ImageCropper from '@/components/ui/ImageCropper';

type MenuItem = {
  id: string;
  name: string;
  description: string | null;
  price: number;
  category: string;
  available: boolean;
  image_url?: string | null;
};

export default function MenuPage() {
  const supabase = useMemo(() => createSupabaseClientWithKey('pos-admin'), []);
  const [items, setItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [menuDialogOpen, setMenuDialogOpen] = useState(false);
  const [form, setForm] = useState<{
    id?: string;
    name: string;
    description: string;
    price: string;
    category: string;
    available: boolean;
    image_url?: string | null;
  }>({ name: '', description: '', price: '', category: '', available: true, image_url: undefined });
  const [error, setError] = useState<string>('');
  const [file, setFile] = useState<File | null>(null);
  const [cropOpen, setCropOpen] = useState(false);
  const [cropSrc, setCropSrc] = useState<string | null>(null);
  const [cropTarget, setCropTarget] = useState<'menu' | 'promo'>('menu');

  type AdminPromotion = {
    id: string;
    title: string;
    description: string | null;
    discount: number;
    active: boolean;
    image_url?: string | null;
  };
  const [promos, setPromos] = useState<AdminPromotion[]>([]);
  const [loadingPromo, setLoadingPromo] = useState(true);
  const [savingPromo, setSavingPromo] = useState(false);
  const [promoDialogOpen, setPromoDialogOpen] = useState(false);
  const [formPromo, setFormPromo] = useState<{
    id?: string;
    title: string;
    description: string;
    discount: string;
    active: boolean;
    image_url?: string | null;
  }>({ title: '', description: '', discount: '', active: true, image_url: undefined });
  const [errorPromo, setErrorPromo] = useState<string>('');
  const [filePromo, setFilePromo] = useState<File | null>(null);

  const resetForm = () => {
    setForm({ name: '', description: '', price: '', category: '', available: true, id: undefined, image_url: undefined });
    setFile(null);
    setMenuDialogOpen(false);
  };

  const fetchItems = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('menu_items')
        .select('*')
        .order('category')
        .order('name');
      if (error) throw error;
      setItems((data as MenuItem[]) || []);
    } catch (e: any) {
      setError(e.message || 'Gagal memuat data menu');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchPromotions = async () => {
    try {
      setLoadingPromo(true);
      const { data, error } = await supabase
        .from('promotions')
        .select('*')
        .order('active', { ascending: false })
        .order('title');
      if (error) throw error;
      setPromos((data as AdminPromotion[]) || []);
    } catch (e: any) {
      setErrorPromo(e.message || 'Gagal memuat data promo');
    } finally {
      setLoadingPromo(false);
    }
  };

  useEffect(() => {
    fetchPromotions();
  }, []);

  const resetPromoForm = () => {
    setFormPromo({ id: undefined, title: '', description: '', discount: '', active: true, image_url: undefined });
    setFilePromo(null);
    setPromoDialogOpen(false);
  };

  const onEditPromo = (p: AdminPromotion) => {
    setFormPromo({
      id: p.id,
      title: p.title,
      description: p.description || '',
      discount: String(p.discount),
      active: p.active,
      image_url: p.image_url ?? undefined,
    });
    setFilePromo(null);
    setPromoDialogOpen(true);
  };

  const onDeletePromo = async (id: string) => {
    if (!confirm('Hapus promo ini?')) return;
    try {
      setSavingPromo(true);
      const { error } = await supabase.from('promotions').delete().eq('id', id);
      if (error) throw error;
      await fetchPromotions();
    } catch (e: any) {
      setErrorPromo(e.message || 'Gagal menghapus promo');
    } finally {
      setSavingPromo(false);
    }
  };

  const onSubmitPromo = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorPromo('');
    try {
      setSavingPromo(true);
      let image_url: string | null | undefined = formPromo.image_url ?? undefined;
      if (filePromo) {
        image_url = await uploadMenuImage(filePromo, formPromo.id ?? null, supabase);
      }
      const payload = {
        title: formPromo.title.trim(),
        description: formPromo.description.trim() || null,
        discount: Number(formPromo.discount),
        active: formPromo.active,
        image_url: image_url ?? null,
      };
      
      // Validate required fields
      if (!payload.title || isNaN(payload.discount) || payload.discount < 0) {
        throw new Error('Judul dan diskon (harus >= 0) wajib diisi');
      }
      
      console.log('📝 Promo payload to save:', payload);
      
      if (formPromo.id) {
        console.log('🔄 Updating promo:', formPromo.id);
        const { data, error } = await supabase
          .from('promotions')
          .update(payload)
          .eq('id', formPromo.id)
          .select();
        
        if (error) {
          console.error('❌ Promo update error:', error);
          throw error;
        }
        console.log('✅ Promo update success:', data);
      } else {
        console.log('➕ Inserting new promo');
        const { data, error } = await supabase
          .from('promotions')
          .insert(payload)
          .select();
        
        if (error) {
          console.error('❌ Promo insert error:', error);
          console.error('📋 Error details:', {
            message: error.message,
            details: error.details,
            hint: error.hint,
            code: error.code
          });
          throw error;
        }
        console.log('✅ Promo insert success:', data);
      }
      resetPromoForm();
      await fetchPromotions();
    } catch (e: any) {
      setErrorPromo(e.message || 'Gagal menyimpan promo');
    } finally {
      setSavingPromo(false);
    }
  };

  const onEdit = (item: MenuItem) => {
    setForm({
      id: item.id,
      name: item.name,
      description: item.description || '',
      price: String(item.price),
      category: item.category,
      available: item.available,
      image_url: item.image_url ?? undefined,
    });
    setFile(null);
    setMenuDialogOpen(true);
  };

  const onDelete = async (id: string) => {
    if (!confirm('Hapus menu ini?')) return;
    try {
      setSaving(true);
      const { error } = await supabase.from('menu_items').delete().eq('id', id);
      if (error) throw error;
      await fetchItems();
    } catch (e: any) {
      setError(e.message || 'Gagal menghapus menu');
    } finally {
      setSaving(false);
    }
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      setSaving(true);
      let image_url: string | null | undefined = form.image_url ?? undefined;
      if (file) {
        image_url = await uploadMenuImage(file, form.id ?? null, supabase);
      }

      const payload = {
        name: form.name.trim(),
        description: form.description.trim() || null,
        price: Number(form.price),
        category: form.category.trim(),
        available: form.available,
        image_url: image_url ?? null,
      };
      
      // Validate required fields
      if (!payload.name || isNaN(payload.price) || payload.price <= 0 || !payload.category) {
        throw new Error('Nama, harga (harus > 0), dan kategori wajib diisi');
      }
      
      console.log('📝 Payload to save:', payload);
      
      if (form.id) {
        console.log('🔄 Updating menu item:', form.id);
        const { data, error } = await supabase
          .from('menu_items')
          .update(payload)
          .eq('id', form.id)
          .select();
        
        if (error) {
          console.error('❌ Update error:', error);
          throw error;
        }
        console.log('✅ Update success:', data);
      } else {
        console.log('➕ Inserting new menu item');
        const { data, error } = await supabase
          .from('menu_items')
          .insert(payload)
          .select();
        
        if (error) {
          console.error('❌ Insert error:', error);
          console.error('📋 Error details:', {
            message: error.message,
            details: error.details,
            hint: error.hint,
            code: error.code
          });
          throw error;
        }
        console.log('✅ Insert success:', data);
      }
      resetForm();
      await fetchItems();
    } catch (e: any) {
      setError(e.message || 'Gagal menyimpan data');
    } finally {
      setSaving(false);
    }
  };

  // File input handlers -> open cropper
  const onSelectMenuImage: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setCropSrc(URL.createObjectURL(f));
    setCropTarget('menu');
    setCropOpen(true);
  };

  const onSelectPromoImage: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setCropSrc(URL.createObjectURL(f));
    setCropTarget('promo');
    setCropOpen(true);
  };

  const onCropConfirm = (blob: Blob) => {
    const cropped = new File([blob], `${Date.now()}.jpg`, { type: 'image/jpeg' });
    if (cropTarget === 'menu') setFile(cropped);
    else setFilePromo(cropped);
    setCropOpen(false);
    setCropSrc(null);
  };

  return (
    <>
    <div className="max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-6 text-foreground">Kelola Menu</h1>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded">{error}</div>
        )}

        <form onSubmit={onSubmit} className="bg-card border border-border rounded-xl p-4 mb-6 grid grid-cols-1 md:grid-cols-6 gap-3 shadow-sm">
          <input
            placeholder="Nama Menu"
            className="md:col-span-2 px-3 py-2 border border-border bg-background text-foreground rounded"
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            required
          />
          <input
            placeholder="Deskripsi"
            className="md:col-span-2 px-3 py-2 border border-border bg-background text-foreground rounded"
            value={form.description}
            onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
          />
          <input
            placeholder="Harga"
            type="number"
            min="0"
            className="px-3 py-2 border border-border bg-background text-foreground rounded"
            value={form.price}
            onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
            required
          />
          <input
            placeholder="Kategori"
            className="px-3 py-2 border border-border bg-background text-foreground rounded"
            value={form.category}
            onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
            required
          />
          <label className="flex items-center gap-2 md:col-span-1">
            <input
              type="checkbox"
              checked={form.available}
              onChange={(e) => setForm((f) => ({ ...f, available: e.target.checked }))}
            />
            <span>Tersedia</span>
          </label>
          <div className="md:col-span-3 flex items-center gap-3">
            <input
              type="file"
              accept="image/*"
              onChange={onSelectMenuImage}
              className="block w-full text-sm text-muted-foreground"
            />
            {form.image_url && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={normalizeStorageUrl(form.image_url, supabase) || ''} alt="preview" className="w-16 h-16 object-cover rounded border border-border" />
            )}
          </div>
          <div className="md:col-span-6 flex gap-2 justify-end">
            {form.id && (
              <button type="button" onClick={resetForm} className="px-4 py-2 border border-border rounded">
                Batal
              </button>
            )}
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 bg-slate-900 text-white rounded disabled:opacity-50"
            >
              {form.id ? 'Simpan Perubahan' : 'Tambah Menu'}
            </button>
          </div>
        </form>

        <div className="bg-card border border-border rounded-xl shadow-sm">
          <div className="p-4 border-b border-border flex items-center justify-between">
            <h2 className="text-lg font-semibold text-foreground">Daftar Menu</h2>
            <button onClick={resetForm} className="flex items-center gap-2 px-3 py-2 border border-border rounded">
              <Plus className="w-4 h-4" /> Baru
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-muted">
                <tr className="border-b border-border">
                  <th className="text-left p-3">Nama</th>
                  <th className="text-left p-3">Deskripsi</th>
                  <th className="text-left p-3">Kategori</th>
                  <th className="text-right p-3">Harga</th>
                  <th className="text-center p-3">Status</th>
                  <th className="text-right p-3">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={6} className="p-6 text-center text-muted-foreground">Memuat...</td>
                  </tr>
                ) : items.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-6 text-center text-muted-foreground">Belum ada data</td>
                  </tr>
                ) : (
                  items.map((item) => (
                    <tr key={item.id} className="border-b border-border hover:bg-muted/50">
                      <td className="p-3 font-medium text-foreground">
                        <div className="flex items-center gap-3">
                          {item.image_url && (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={normalizeStorageUrl(item.image_url, supabase) || ''} alt={item.name} className="w-10 h-10 object-cover rounded border border-border" />
                          )}
                          <span>{item.name}</span>
                        </div>
                      </td>
                      <td className="p-3 text-muted-foreground">{item.description}</td>
                      <td className="p-3">{item.category}</td>
                      <td className="p-3 text-right text-foreground">{new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(item.price)}</td>
                      <td className="p-3 text-center">
                        <span className={`px-2 py-1 rounded text-xs ${item.available ? 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400' : 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300'}`}>
                          {item.available ? 'Tersedia' : 'Tidak'}
                        </span>
                      </td>
                      <td className="p-3 text-right">
                        <button onClick={() => onEdit(item)} className="inline-flex items-center gap-1 px-3 py-1 border border-border rounded mr-2">
                          <Pencil className="w-4 h-4" /> Edit
                        </button>
                        <button disabled={saving} onClick={() => onDelete(item.id)} className="inline-flex items-center gap-1 px-3 py-1 border border-border rounded text-red-600">
                          <Trash2 className="w-4 h-4" /> Hapus
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
    </div>

    {/* Promotions Management */}
    {errorPromo && (
      <div className="max-w-6xl mx-auto mt-8 mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded">{errorPromo}</div>
    )}
    <div className="max-w-6xl mx-auto mt-8">
      <h2 className="text-2xl font-semibold mb-4 text-foreground">Kelola Promo</h2>
      <form onSubmit={onSubmitPromo} className="bg-card border border-border rounded-xl p-4 mb-6 grid grid-cols-1 md:grid-cols-6 gap-3 shadow-sm">
        <input
          placeholder="Judul Promo"
          className="md:col-span-2 px-3 py-2 border border-border bg-background text-foreground rounded"
          value={formPromo.title}
          onChange={(e) => setFormPromo((f) => ({ ...f, title: e.target.value }))}
          required
        />
        <input
          placeholder="Deskripsi"
          className="md:col-span-2 px-3 py-2 border border-border bg-background text-foreground rounded"
          value={formPromo.description}
          onChange={(e) => setFormPromo((f) => ({ ...f, description: e.target.value }))}
        />
        <input
          placeholder="Diskon (%)"
          type="number"
          min="0"
          max="100"
          className="px-3 py-2 border border-border bg-background text-foreground rounded"
          value={formPromo.discount}
          onChange={(e) => setFormPromo((f) => ({ ...f, discount: e.target.value }))}
          required
        />
        <label className="flex items-center gap-2 md:col-span-1">
          <input
            type="checkbox"
            checked={formPromo.active}
            onChange={(e) => setFormPromo((f) => ({ ...f, active: e.target.checked }))}
          />
          <span>Aktif</span>
        </label>
        <div className="md:col-span-3 flex items-center gap-3">
          <input
            type="file"
            accept="image/*"
            onChange={onSelectPromoImage}
            className="block w-full text-sm text-muted-foreground"
          />
          {formPromo.image_url && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={normalizeStorageUrl(formPromo.image_url, supabase) || ''} alt="preview" className="w-16 h-16 object-cover rounded border border-border" />
          )}
        </div>
        <div className="md:col-span-6 flex gap-2 justify-end">
          {formPromo.id && (
            <button type="button" onClick={resetPromoForm} className="px-4 py-2 border border-border rounded">
              Batal
            </button>
          )}
          <button
            type="submit"
            disabled={savingPromo}
            className="px-4 py-2 bg-slate-900 text-white rounded disabled:opacity-50"
          >
            {formPromo.id ? 'Simpan Perubahan' : 'Tambah Promo'}
          </button>
        </div>
      </form>

      <div className="bg-card border border-border rounded-xl shadow-sm">
        <div className="p-4 border-b border-border flex items-center justify-between">
          <h3 className="text-lg font-semibold text-foreground">Daftar Promo</h3>
          <button onClick={resetPromoForm} className="flex items-center gap-2 px-3 py-2 border border-border rounded">
            <Plus className="w-4 h-4" /> Baru
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-muted">
              <tr className="border-b border-border">
                <th className="text-left p-3">Judul</th>
                <th className="text-left p-3">Deskripsi</th>
                <th className="text-right p-3">Diskon</th>
                <th className="text-center p-3">Status</th>
                <th className="text-right p-3">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {loadingPromo ? (
                <tr>
                  <td colSpan={5} className="p-6 text-center text-muted-foreground">Memuat...</td>
                </tr>
              ) : promos.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-6 text-center text-muted-foreground">Belum ada data</td>
                </tr>
              ) : (
                promos.map((p) => (
                  <tr key={p.id} className="border-b border-border hover:bg-muted/50">
                    <td className="p-3 font-medium text-foreground">
                      <div className="flex items-center gap-3">
                        {p.image_url && (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={normalizeStorageUrl(p.image_url, supabase) || ''} alt={p.title} className="w-10 h-10 object-cover rounded border border-border" />
                        )}
                        <span>{p.title}</span>
                      </div>
                    </td>
                    <td className="p-3 text-muted-foreground">{p.description}</td>
                    <td className="p-3 text-right text-foreground">{p.discount}%</td>
                    <td className="p-3 text-center">
                      <span className={`px-2 py-1 rounded text-xs ${p.active ? 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400' : 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300'}`}>
                        {p.active ? 'Aktif' : 'Nonaktif'}
                      </span>
                    </td>
                    <td className="p-3 text-right">
                      <button onClick={() => onEditPromo(p)} className="inline-flex items-center gap-1 px-3 py-1 border border-border rounded mr-2">
                        <Pencil className="w-4 h-4" /> Edit
                      </button>
                      <button disabled={savingPromo} onClick={() => onDeletePromo(p.id)} className="inline-flex items-center gap-1 px-3 py-1 border border-border rounded text-red-600">
                        <Trash2 className="w-4 h-4" /> Hapus
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>

    {cropOpen && cropSrc && (
      <Dialog open={cropOpen} onOpenChange={setCropOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Sesuaikan Gambar</DialogTitle>
          </DialogHeader>
          <ImageCropper src={cropSrc} aspect={1} onCancel={() => setCropOpen(false)} onConfirm={onCropConfirm} />
          <DialogFooter />
        </DialogContent>
      </Dialog>
    )}
    </>
  );
}

