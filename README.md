# Sistem Kas RT Digital

Aplikasi manajemen kas Rukun Tetangga (RT) digital dengan fitur lengkap untuk pencatatan pemasukan, pengeluaran, tagihan warga, dan marketplace UMKM warga.

## ✨ Fitur Utama

- **Dashboard** - Ringkasan keuangan dengan visualisasi chart
- **Data Warga** - Manajemen data warga RT
- **Jenis Iuran** - Konfigurasi kategori iuran
- **Pemasukan & Pengeluaran** - Pencatatan transaksi kas
- **Tagihan** - Monitoring pembayaran iuran warga
- **WhatsApp Broadcast** - Kirim pesan ke warga
- **Kwitansi** - Cetak bukti pembayaran
- **Laporan Keuangan** - Rekapitulasi dengan export CSV
- **Marketplace** - Katalog UMKM warga
- **Sinkronisasi** - Backup/restore data & sync ke Supabase

## 🚀 Deployment

### Cloudflare Pages

1. **Build static export:**
   ```bash
   npm run build:static
   ```

2. **Deploy ke Cloudflare Pages:**
   - Login ke Cloudflare Dashboard
   - Buat project Pages baru
   - Connect ke repository GitHub
   - Build settings:
     - **Build command:** `npm run build:static`
     - **Output directory:** `out`
   - Deploy

3. **Environment Variables (Opsional):**
   - `NEXT_PUBLIC_SUPABASE_URL` - URL Supabase project
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Anon key Supabase

### Vercel (Alternative)

1. Push code ke GitHub
2. Import project di Vercel
3. Deploy (otomatis detect Next.js)

## 💾 Penyimpanan Data

### Mode 1: LocalStorage (Default)
- Data tersimpan di browser masing-masing user
- Cocok untuk single-device usage
- Tidak perlu konfigurasi database

### Mode 2: Supabase (Recommended)
- Data tersinkronisasi ke cloud database
- Multi-device access
- Real-time sync
- Setup:
  1. Buat project di [supabase.com](https://supabase.com)
  2. Buat tabel: `warga`, `iuran`, `transaksi`, `tagihan`, `marketplace`, `settings`
  3. Set environment variables:
     - `NEXT_PUBLIC_SUPABASE_URL`
     - `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## 🛠️ Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Build static export (untuk Cloudflare Pages)
npm run build:static

# Start production server
npm start
```

## 📋 Struktur Data

### Warga
- Nama, NIK, WhatsApp, Alamat, Rumah/Blok, Status (TETAP/KOST/KONTRAK)

### Iuran
- Kategori, Nominal, Deskripsi, Status

### Transaksi
- Tanggal, Tipe (MASUK/KELUAR), Kategori, Keterangan, Jumlah, Warga

### Tagihan
- Warga, Periode, Nominal, Status (PENDING/LUNAS)

### Marketplace
- Nama Produk, Harga, Penjual, Gambar, Label, Deskripsi

## 🔧 Teknologi

- **Next.js 16** - React framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Chart.js** - Data visualization
- **Supabase** - Cloud database (opsional)
- **LocalStorage** - Fallback storage

## 📝 Catatan Penting

- Aplikasi ini adalah **static export** yang bisa di-deploy ke hosting static manapun
- Untuk sync antar perangkat, gunakan Supabase
- Data seed otomatis saat pertama kali dibuka
- Backup data secara berkala via fitur Export JSON

## 🆘 Troubleshooting

### Data hilang setelah refresh
- Pastikan Supabase dikonfigurasi, atau data tersimpan di localStorage browser yang sama

### Build gagal di Cloudflare
- Gunakan command `npm run build:static`
- Output directory: `out`

### Supabase sync error
- Cek environment variables sudah benar
- Pastikan tabel sudah dibuat di Supabase
- Cek Row Level Security (RLS) policies

## 📄 License

MIT

---

Dibuat dengan ❤️ untuk komunitas RT
