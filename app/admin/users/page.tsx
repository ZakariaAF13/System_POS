'use client';

import { useMemo, useState } from 'react';

export default function UsersPage() {
  const [query, setQuery] = useState('');
  const [role, setRole] = useState<'all' | 'admin' | 'kasir'>('all');

  const users = useMemo(
    () => [
      { id: 'U001', name: 'Ayu Lestari', email: 'ayu@example.com', role: 'admin', status: 'active' },
      { id: 'U002', name: 'Bima Pratama', email: 'bima@example.com', role: 'kasir', status: 'active' },
      { id: 'U003', name: 'Citra Dewi', email: 'citra@example.com', role: 'kasir', status: 'suspended' },
      { id: 'U004', name: 'Dika Putra', email: 'dika@example.com', role: 'admin', status: 'active' },
    ],
    []
  );

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
          <button className="px-4 py-2 bg-slate-900 text-white rounded">Tambah User</button>
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
      </div>
    </main>
  );
}
