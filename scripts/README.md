# Admin Scripts

## promote-admin.mjs

Script untuk mengatur role admin dan kasir untuk user yang sudah terdaftar.

### Setup

1. Buat file `.env` di root project:
```bash
cp .env.example .env
```

2. Isi dengan credential Supabase (dapatkan dari Settings → API):
```env
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...
```

### Usage

```bash
# Promote user menjadi admin
node scripts/promote-admin.mjs admin@example.com admin

# Set user menjadi kasir
node scripts/promote-admin.mjs kasir@example.com kasir

# Default role adalah admin jika tidak disebutkan
node scripts/promote-admin.mjs newadmin@example.com
```

### Requirements

- Node.js 18+
- `@supabase/supabase-js` package installed
- Valid Supabase service role key

### Notes

- Script menggunakan service role key yang bypass RLS
- User harus sudah terdaftar di Supabase Auth
- Script akan create/update row di table `profiles`
