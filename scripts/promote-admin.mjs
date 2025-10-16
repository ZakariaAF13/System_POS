import { createClient } from '@supabase/supabase-js';

async function main() {
  const emailArg = process.argv[2] || process.env.ADMIN_EMAIL;
  const url = process.env.SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceKey) {
    console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY environment variables.');
    process.exit(1);
  }
  if (!emailArg) {
    console.error('Usage: node scripts/promote-admin.mjs <email>');
    process.exit(1);
  }

  const admin = createClient(url, serviceKey, { auth: { persistSession: false } });

  const { data: list, error: listErr } = await admin.auth.admin.listUsers();
  if (listErr) {
    console.error('Failed to list users:', listErr);
    process.exit(1);
  }

  const user = list.users.find((u) => u.email === emailArg);
  if (!user) {
    console.error('User not found:', emailArg);
    process.exit(1);
  }

  const nextAppMeta = { ...(user.app_metadata || {}), role: 'admin' };
  const nextUserMeta = { ...(user.user_metadata || {}), role: 'admin' };

  const { error: updErr } = await admin.auth.admin.updateUserById(user.id, {
    app_metadata: nextAppMeta,
    user_metadata: nextUserMeta,
  });
  if (updErr) {
    console.error('Failed to update user metadata:', updErr);
    process.exit(1);
  }

  console.log('Promoted to admin:', emailArg);
  console.log('app_metadata.role =', nextAppMeta.role, '| user_metadata.role =', nextUserMeta.role);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
