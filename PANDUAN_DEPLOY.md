# Panduan Deploy KAS RT — Hostinger

## Penting: Selalu upload kode TERBARU

Build Hostinger membangun kode dari repo GitHub `KAS-RT-002`. Jika ada perbaikan
kode di preview, **download ulang project** lalu upload/push ke repo GitHub
sebelum deploy ulang. Cek kolom "Melakukan" (commit) di Detail Penerapan —
pastikan hash commit berubah setelah upload.

## Langkah Deploy

### 1. Siapkan database PostgreSQL

Aplikasi butuh PostgreSQL saat runtime. Pilihan gratis & mudah:

- **Neon** (https://neon.tech) — daftar, buat project, salin connection string
- **Supabase** (https://supabase.com) — buat project, menu Database → Connection string (mode Session)
- Atau PostgreSQL dari paket hosting Anda (jika tersedia)

### 2. Set Variabel Environment di Hostinger

Menu **Variabel environment** → tambahkan:

| Nama | Nilai |
|------|-------|
| `DATABASE_URL` | connection string PostgreSQL dari langkah 1 |
| `AUTH_SECRET` | teks acak bebas, mis. `kasrt-mawar-002-rahasia-2026` |

> Catatan: build TIDAK membutuhkan `DATABASE_URL` (koneksi dibuat lazy saat
> runtime), tetapi aplikasi tidak akan bisa login tanpa variabel ini.

### 3. Upload kode terbaru ke GitHub

1. Download project terbaru (tombol **Download** di preview)
2. Upload semua file ke repo GitHub `KAS-RT-002` (replace semua file lama)
3. Pastikan commit baru muncul

### 4. Deploy ulang

Klik **Memindahkan / Deploy ulang** di panel Hostinger.

### 5. Selesai — tanpa setup database manual

Saat aplikasi pertama kali diakses, sistem **auto-bootstrap** otomatis:
- Membuat semua tabel database
- Mengisi data awal: akun admin, 10 warga contoh, jenis iuran, tagihan, transaksi

## Akun Default

| Role | Username | Password |
|------|----------|----------|
| Admin RT | `admin` | `admin123` |
| Warga | `budi` | `warga123` |

> Segera ganti password admin setelah live (hapus/ubah lewat database, atau
> daftarkan akun baru dan hapus akun demo).

## Troubleshooting

| Gejala | Penyebab | Solusi |
|--------|----------|--------|
| Build gagal: `DATABASE_URL is required` | Kode lama masih di repo | Upload kode terbaru (commit hash harus berubah) |
| Login gagal / error 500 | `DATABASE_URL` belum diset atau salah | Periksa Variabel environment, deploy ulang |
| Login gagal: username/password salah padahal benar | Database kosong belum ter-bootstrap | Buka halaman utama dulu (memicu bootstrap), lalu login |
