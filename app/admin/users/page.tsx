'use client';

import { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

export default function UsersPage() {
  const [query, setQuery] = useState('');
  const [role, setRole] = useState<'all' | 'admin' | 'kasir'>('all');
  const [users, setUsers] = useState<Array<{ id: string; name: string; email: string; role: 'admin' | 'kasir'; status: string }>>([]);
  const [addOpen, setAddOpen] = useState(false);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [newRole, setNewRole] = useState<'admin' | 'kasir'>('kasir');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let ignore = false;
    const load = async () => {
      try {
        const res = await fetch('/api/admin/users', { cache: 'no-store' });
        const json = await res.json();
        if (!res.ok) throw new Error(json.error || 'Gagal memuat users');
        if (!ignore) setUsers(json.users || []);
      } catch (_e) {
        if (!ignore) setUsers([]);
      }
    };
    load();
    return () => { ignore = true; };
  }, []);

  const filtered = users.filter((u) => {
    const matchQuery = `${u.name} ${u.email}`.toLowerCase().includes(query.toLowerCase());
    const matchRole = role === 'all' ? true : u.role === role;
    return matchQuery && matchRole;
  });

  return (
    <main className="min-h-screen bg-background p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-foreground">Users</h1>
          <button className="px-4 py-2 bg-slate-900 text-white rounded" onClick={() => { setFullName(''); setEmail(''); setPassword(''); setNewRole('kasir'); setError(''); setAddOpen(true); }}>Tambah User</button>
        </div>

        <div className="bg-card border border-border rounded-lg shadow-sm p-4 mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="col-span-1 md:col-span-2">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Cari nama atau email..."
              className="w-full border border-border bg-background text-foreground rounded px-3 py-2"
            />
          </div>
          <div>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as any)}
              className="w-full border border-border bg-background text-foreground rounded px-3 py-2"
            >
              <option value="all">Semua Role</option>
              <option value="admin">Admin</option>
              <option value="kasir">Kasir</option>
            </select>
          </div>
        </div>

        <div className="bg-card border border-border rounded-lg shadow-sm overflow-hidden">
          <table className="min-w-full">
            <thead className="bg-muted">
              <tr>
                <th className="text-left p-3 text-sm font-medium text-muted-foreground">Nama</th>
                <th className="text-left p-3 text-sm font-medium text-muted-foreground">Email</th>
                <th className="text-left p-3 text-sm font-medium text-muted-foreground">Role</th>
                <th className="text-left p-3 text-sm font-medium text-muted-foreground">Status</th>
                <th className="text-right p-3 text-sm font-medium text-muted-foreground">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((u) => (
                <tr key={u.id} className="border-t border-border">
                  <td className="p-3 text-sm text-foreground">{u.name}</td>
                  <td className="p-3 text-sm text-muted-foreground">{u.email}</td>
                  <td className="p-3 text-sm">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${u.role === 'admin' ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400' : 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400'}`}>{u.role}</span>
                  </td>
                  <td className="p-3 text-sm">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${u.status === 'active' ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400' : 'bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400'}`}>{u.status}</span>
                  </td>
                  <td className="p-3 text-sm text-right">
                    <button className="px-3 py-1 border border-border rounded mr-2">Detail</button>
                    <button className="px-3 py-1 border border-border rounded">Edit</button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-6 text-center text-muted-foreground text-sm">Tidak ada data</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <Dialog open={addOpen} onOpenChange={setAddOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Tambah User</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Nama Lengkap</label>
                <input
                  value={fullName}
                  onChange={(e) => { setFullName(e.target.value); setError(''); }}
                  placeholder="Contoh: Budi Santoso"
                  className="w-full border border-border bg-background text-foreground rounded px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setError(''); }}
                  placeholder="nama@email.com"
                  className="w-full border border-border bg-background text-foreground rounded px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setError(''); }}
                  className="w-full border border-border bg-background text-foreground rounded px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Role</label>
                <select
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value as any)}
                  className="w-full border border-border bg-background text-foreground rounded px-3 py-2"
                >
                  <option value="kasir">Kasir</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              {error && <p className="text-sm text-red-600">{error}</p>}
              <div className="flex justify-end gap-2 pt-2">
                <button className="px-3 py-2 border border-border rounded" onClick={() => setAddOpen(false)}>Batal</button>
                <button
                  className="px-3 py-2 bg-slate-900 text-white rounded disabled:opacity-50"
                  disabled={saving}
                  onClick={async () => {
                    if (!email.trim() || !password.trim()) { setError('Email dan password wajib diisi'); return; }
                    setSaving(true);
                    try {
                      const res = await fetch('/api/admin/users', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ email, password, full_name: fullName, role: newRole }),
                      });
                      const json = await res.json();
                      if (!res.ok) throw new Error(json.error || 'Gagal membuat user');
                      setUsers((prev) => [json.user, ...prev]);
                      setAddOpen(false);
                    } catch (e: any) {
                      setError(e.message || 'Gagal membuat user');
                    } finally {
                      setSaving(false);
                    }
                  }}
                >
                  Simpan
                </button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </main>
  );
}
