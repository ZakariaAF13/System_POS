# Setup Midtrans Payment Integration

## Langkah-langkah Setup

### 1. Daftar Akun Midtrans

1. Kunjungi [https://dashboard.midtrans.com/register](https://dashboard.midtrans.com/register)
2. Daftar akun baru atau login jika sudah punya akun
3. Untuk testing, gunakan akun Sandbox terlebih dahulu

### 2. Dapatkan API Keys

1. Login ke [Midtrans Dashboard](https://dashboard.midtrans.com/)
2. Pilih environment **Sandbox** untuk testing
3. Pergi ke **Settings** > **Access Keys**
4. Copy:
   - **Client Key** (dimulai dengan `SB-Mid-client-`)
   - **Server Key** (dimulai dengan `SB-Mid-server-`)

### 3. Konfigurasi Environment Variables

Buka file `.env` di root project dan update dengan API keys Anda:

```env
NEXT_PUBLIC_MIDTRANS_CLIENT_KEY=SB-Mid-client-xxxxxxxxx
MIDTRANS_SERVER_KEY=SB-Mid-server-xxxxxxxxx
```

### 4. Set Midtrans Server Key di Supabase

Karena kita menggunakan Edge Functions, Server Key perlu di-set di Supabase:

1. Buka [Supabase Dashboard](https://supabase.com/dashboard)
2. Pilih project Anda
3. Pergi ke **Project Settings** > **Edge Functions** > **Secrets**
4. Tambahkan secret baru:
   - Name: `MIDTRANS_SERVER_KEY`
   - Value: Server Key Anda (dari step 2)

### 5. Testing Payment

Gunakan test credentials berikut untuk testing di Sandbox:

#### QRIS
- Akan menampilkan QR Code simulasi
- Status otomatis sukses setelah scan

#### GoPay
- Nomor HP: `081234567890`
- OTP: `112233`

#### OVO
- Nomor HP: `081234567890`
- OTP: `112233`

## Cara Kerja Flow Payment

1. User mengisi form checkout dan klik "Bayar Sekarang"
2. Order dibuat di database Supabase dengan status `pending`
3. Modal payment muncul dengan pilihan QRIS, GoPay, atau OVO
4. Setelah user pilih metode:
   - Request dikirim ke Edge Function `create-payment`
   - Edge Function membuat transaksi via Midtrans API
   - Midtrans Snap popup muncul
5. User melakukan pembayaran di Midtrans Snap
6. Setelah pembayaran sukses:
   - Callback dikirim ke Edge Function `payment-callback`
   - Status order di database diupdate menjadi `paid`
   - User diarahkan ke halaman konfirmasi

## Production Setup

Untuk production:

1. Ganti environment dari Sandbox ke Production di Midtrans Dashboard
2. Dapatkan Production API Keys
3. Update `.env` dengan Production keys
4. Update Supabase Secret dengan Production Server Key
5. Ubah URL Snap script di `checkout/page.tsx`:
   - Dari: `https://app.sandbox.midtrans.com/snap/snap.js`
   - Ke: `https://app.midtrans.com/snap/snap.js`

## Troubleshooting

### Error: "Midtrans not configured"
- Pastikan `MIDTRANS_SERVER_KEY` sudah di-set di Supabase Secrets
- Restart Edge Functions setelah menambahkan secret

### Payment popup tidak muncul
- Check browser console untuk error
- Pastikan Snap.js script sudah ter-load
- Pastikan `NEXT_PUBLIC_MIDTRANS_CLIENT_KEY` sudah di-set

### Order tidak terupdate setelah payment
- Check Edge Function logs di Supabase Dashboard
- Pastikan callback endpoint bisa diakses
- Verify database permissions untuk update orders table
