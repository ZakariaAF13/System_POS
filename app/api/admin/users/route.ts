import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

function getAdminClient() {
  const url = process.env.SUPABASE_URL as string | undefined;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY as string | undefined;
  if (!url || !serviceKey) {
    throw new Error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  }
  return createClient(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

export async function GET() {
  try {
    const supabase = getAdminClient();
    const { data } = await supabase.auth.admin.listUsers();
    const users = (data?.users || []).map((u) => ({
      id: u.id,
      email: u.email ?? '',
      name: (u.user_metadata as any)?.full_name ?? '',
      role: ((u.user_metadata as any)?.role === 'admin' || (u.user_metadata as any)?.role === 'kasir') ? (u.user_metadata as any).role : 'kasir',
      status: 'active',
    }));
    return NextResponse.json({ users });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || 'Failed to list users' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const email = (body?.email || '').trim();
    const password = (body?.password || '').trim();
    const full_name = (body?.full_name || '').trim();
    const role = body?.role === 'admin' ? 'admin' : 'kasir';

    if (!email || !password) {
      return NextResponse.json({ error: 'Email dan password wajib diisi' }, { status: 400 });
    }

    const supabase = getAdminClient();

    const { data: created, error: createErr } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { role, full_name },
    });
    if (createErr || !created?.user) {
      return NextResponse.json({ error: createErr?.message || 'Gagal membuat user' }, { status: 400 });
    }

    const userId = created.user.id;
    const { error: profileErr } = await supabase.from('profiles').insert({ id: userId, role, full_name });
    if (profileErr) {
      // Continue but report that profile insert failed
      return NextResponse.json({
        user: { id: userId, email, name: full_name, role, status: 'active' },
        warning: 'User dibuat, namun gagal menyimpan profil',
      }, { status: 201 });
    }

    return NextResponse.json({ user: { id: userId, email, name: full_name, role, status: 'active' } }, { status: 201 });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || 'Gagal membuat user' }, { status: 500 });
  }
}
