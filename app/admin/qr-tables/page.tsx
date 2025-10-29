'use client';

import { useMemo, useState } from 'react';
import QRCode from 'qrcode';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

export default function QRTablesPage() {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [previewSrc, setPreviewSrc] = useState<string | null>(null);
  const [previewTitle, setPreviewTitle] = useState<string>('');
  const [cache, setCache] = useState<Record<string, string>>({});
  const initialTables = useMemo(
    () => [
      { id: 'A1', seats: 2, status: 'occupied', type: '1_meja_pendek' as const },
      { id: 'A2', seats: 2, status: 'available', type: '1_meja_pendek' as const },
      { id: 'B1', seats: 4, status: 'available', type: '2_meja_pendek' as const },
      { id: 'B2', seats: 4, status: 'occupied', type: '2_meja_pendek' as const },
      { id: 'C1', seats: 6, status: 'available', type: 'meja_panjang' as const },
      { id: 'C2', seats: 6, status: 'available', type: 'meja_panjang' as const },
      { id: 'D1', seats: 8, status: 'occupied', type: 'meja_panjang' as const },
      { id: 'D2', seats: 8, status: 'available', type: 'meja_panjang' as const },
    ],
    []
  );
  const [tables, setTables] = useState(initialTables);
  const [editOpen, setEditOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [editSeats, setEditSeats] = useState<number>(2);
  const [editType, setEditType] = useState<'meja_panjang' | '2_meja_pendek' | '1_meja_pendek'>('1_meja_pendek');

  const filtered = tables.filter((t) => t.id.toLowerCase().includes(query.toLowerCase()));

  const getTableUrl = (id: string) => {
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    return `${origin}/order?tableId=${encodeURIComponent(id)}`;
  };

  const generateQR = async (id: string) => {
    if (cache[id]) return cache[id];
    const url = getTableUrl(id);
    const dataUrl = await QRCode.toDataURL(url, { width: 512, margin: 1 });
    setCache((prev) => ({ ...prev, [id]: dataUrl }));
    return dataUrl;
  };

  const viewQR = async (id: string) => {
    const src = await generateQR(id);
    setPreviewSrc(src);
    setPreviewTitle(`QR Meja ${id}`);
    setOpen(true);
  };

  const downloadQR = async (id: string) => {
    const src = await generateQR(id);
    const a = document.createElement('a');
    a.href = src;
    a.download = `QR-${id}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const openEdit = (id: string) => {
    const t = tables.find((x) => x.id === id);
    if (!t) return;
    setEditId(id);
    setEditSeats(t.seats);
    setEditType(t.type);
    setEditOpen(true);
  };

  const saveEdit = () => {
    if (!editId) return;
    setTables((prev) => prev.map((t) => (t.id === editId ? { ...t, seats: editSeats, type: editType } : t)));
    setEditOpen(false);
  };

  return (
    <main className="min-h-screen bg-background p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-foreground">QR Tables</h1>
          <button className="px-4 py-2 bg-slate-900 text-white rounded">Tambah Meja</button>
        </div>

        <div className="bg-card border border-border rounded-lg shadow-sm p-4 mb-6">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Cari meja (misal: A1)"
            className="w-full border border-border bg-background text-foreground rounded px-3 py-2"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map((t) => (
            <div key={t.id} className="bg-card border border-border rounded-lg shadow-sm p-4">
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-sm text-muted-foreground">Meja</div>
                  <div className="text-2xl font-bold text-foreground">{t.id}</div>
                </div>
                <span className={`px-2 py-1 rounded text-xs font-medium ${
                  t.status === 'available' ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400' : 'bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400'
                }`}>
                  {t.status === 'available' ? 'Tersedia' : 'Dipakai'}
                </span>
              </div>
              <div className="mt-2 text-sm text-muted-foreground">Kursi: {t.seats}</div>
              <div className="mt-1 text-xs text-muted-foreground">Tipe: {t.type === 'meja_panjang' ? 'Meja Panjang' : t.type === '2_meja_pendek' ? '2 Meja Pendek' : '1 Meja Pendek'}</div>

              <div className="mt-4 flex items-center justify-between gap-2">
                <button className="px-3 py-1 border border-border rounded" onClick={() => viewQR(t.id)}>Lihat QR</button>
                <button className="px-3 py-1 border border-border rounded" onClick={() => downloadQR(t.id)}>Unduh</button>
                <button className="px-3 py-1 border border-border rounded" onClick={() => openEdit(t.id)}>Edit</button>
              </div>
            </div>
          ))}

          {filtered.length === 0 && (
            <div className="col-span-full p-6 text-center bg-card border border-border rounded-lg shadow-sm text-muted-foreground text-sm">
              Tidak ada meja
            </div>
          )}
        </div>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>{previewTitle}</DialogTitle>
            </DialogHeader>
            <div className="flex items-center justify-center py-4">
              {previewSrc && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={previewSrc} alt={previewTitle} className="w-60 h-60 object-contain" />
              )}
            </div>
          </DialogContent>
        </Dialog>

        <Dialog open={editOpen} onOpenChange={setEditOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Edit Meja {editId}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Jumlah Kursi</label>
                <input
                  type="number"
                  min={1}
                  value={editSeats}
                  onChange={(e) => setEditSeats(Number(e.target.value))}
                  className="w-full border border-border bg-background text-foreground rounded px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Tipe Meja</label>
                <select
                  value={editType}
                  onChange={(e) => setEditType(e.target.value as any)}
                  className="w-full border border-border bg-background text-foreground rounded px-3 py-2"
                >
                  <option value="meja_panjang">Meja Panjang</option>
                  <option value="2_meja_pendek">2 Meja Pendek</option>
                  <option value="1_meja_pendek">1 Meja Pendek</option>
                </select>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button className="px-3 py-2 border border-border rounded" onClick={() => setEditOpen(false)}>Batal</button>
                <button className="px-3 py-2 bg-slate-900 text-white rounded" onClick={saveEdit}>Simpan</button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </main>
  );
}
