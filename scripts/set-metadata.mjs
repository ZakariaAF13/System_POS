import { createClient } from '@supabase/supabase-js';

async function main() {
  const url = process.env.SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceKey) {
    console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY environment variables.');
    console.error('Create .env file with these variables.');
    process.exit(1);
  }

  const supabase = createClient(url, serviceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });

  console.log('Setting user metadata for admin and kasir...\n');

  // Get all users
  const { data: list } = await supabase.auth.admin.listUsers();
  
  // Update admin
  const adminUser = list?.users.find(u => u.email === 'admin@example.com');
  if (adminUser) {
    const { error } = await supabase.auth.admin.updateUserById(
      adminUser.id,
      { 
        user_metadata: { role: 'admin', full_name: 'Admin' }
      }
    );
    
    if (error) {
      console.error('❌ Failed to update admin metadata:', error.message);
    } else {
      console.log('✓ admin@example.com metadata updated');
    }
  } else {
    console.log('⚠ admin@example.com not found');
  }

  // Update kasir
  const kasirUser = list?.users.find(u => u.email === 'kasir@example.com');
  if (kasirUser) {
    const { error } = await supabase.auth.admin.updateUserById(
      kasirUser.id,
      { 
        user_metadata: { role: 'kasir', full_name: 'Kasir' }
      }
    );
    
    if (error) {
      console.error('❌ Failed to update kasir metadata:', error.message);
    } else {
      console.log('✓ kasir@example.com metadata updated');
    }
  } else {
    console.log('⚠ kasir@example.com not found');
  }

  console.log('\n✅ Done! Logout and login again to see changes.');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
