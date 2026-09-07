import { db, databaseUrl } from "@/db";
import { warga, iuran, transaksi, tagihan, marketplace, settings } from "@/db/schema";
import { count } from "drizzle-orm";

export async function seedIfEmpty() {
  if (!databaseUrl) {
    console.warn("[Seed] Database not configured, skipping");
    return;
  }

  const existing = await db.select({ count: count() }).from(warga);
  if (existing[0].count > 0) return;

  console.log("[Seed] Populating demo data...");

  await db.insert(settings).values([
    { key: "appName", value: "FORUM MAUMERE B" },
    { key: "description", value: "Sistem Manajemen Kas Forum" },
    { key: "rt", value: "05" },
    { key: "rw", value: "02" },
    { key: "address", value: "Perumahan Harmoni Indah, Jakarta" },
    { key: "bankInfo", value: "Bank BCA 123456789 a/n Forum RT" },
    { key: "bendahara", value: "Jessica Jones" },
  ]);

  await db.insert(warga).values([
    { nama: "Junardi", nik: "7371031234560004", wa: "6282189146404", alamat: "Blok K 27", status: "TETAP", rumah: "K27 Perumahan Pesona Barombong Indah" },
    { nama: "Kadir", nik: "7371032345670006", wa: "628123456789", alamat: "Blok A 9", status: "TETAP", rumah: "A9 Perumahan Harmoni" },
    { nama: "Siti Aminah", nik: "7371033456780007", wa: "6281345678901", alamat: "Blok B 12", status: "TETAP", rumah: "B12 Perumahan Harmoni" },
    { nama: "Budi Santoso", nik: "7371034567890008", wa: "6281456789012", alamat: "Blok C 5", status: "KOST", rumah: "C5 Kost Harmoni" },
    { nama: "Dewi Lestari", nik: "7371035678900009", wa: "6281567890123", alamat: "Blok D 3", status: "KONTRAK", rumah: "D3 Kontrak Harmoni" },
    { nama: "Ahmad Fauzi", nik: "7371036789010010", wa: "6281678901234", alamat: "Blok E 8", status: "TETAP", rumah: "E8 Perumahan Harmoni" },
    { nama: "Rina Susanti", nik: "7371037890120011", wa: "6281789012345", alamat: "Blok F 15", status: "TETAP", rumah: "F15 Perumahan Harmoni" },
  ]);

  await db.insert(iuran).values([
    { kategori: "Iuran Bulanan Anggota Formab", nominal: 10000, deskripsi: "Iuran wajib bulanan anggota forum", status: "AKTIF" },
    { kategori: "Iuran Keamanan", nominal: 20000, deskripsi: "Siskamling & pos keamanan", status: "AKTIF" },
    { kategori: "Iuran Kebersihan", nominal: 15000, deskripsi: "Pengelolaan sampah & kebersihan lingkungan", status: "AKTIF" },
    { kategori: "Iuran RW", nominal: 5000, deskripsi: "Kontribusi ke RW", status: "AKTIF" },
  ]);

  await db.insert(transaksi).values([
    { tanggal: "2026-02-11", tipe: "MASUK", kategori: "Saldo Awal", keterangan: "Saldo Kas Awal", jumlah: 5777000 },
    { tanggal: "2026-02-11", tipe: "KELUAR", kategori: "Perbaikan", keterangan: "Perbaikan MC Las Pos", jumlah: 375000 },
    { tanggal: "2026-02-11", tipe: "KELUAR", kategori: "Iuran RW", keterangan: "Iuran RW Bulan Januari", jumlah: 50000 },
    { tanggal: "2026-02-11", tipe: "KELUAR", kategori: "Operasional", keterangan: "Fee petugas kutip iuran", jumlah: 218000 },
    { tanggal: "2026-03-15", tipe: "MASUK", kategori: "Iuran Bulanan", keterangan: "Iuran bulan Maret - Junardi", jumlah: 10000, wargaId: 1 },
    { tanggal: "2026-03-20", tipe: "MASUK", kategori: "Iuran Keamanan", keterangan: "Iuran keamanan Maret - Kadir", jumlah: 20000, wargaId: 2 },
    { tanggal: "2026-04-01", tipe: "MASUK", kategori: "Donasi", keterangan: "Donasi pembangunan pos", jumlah: 500000 },
  ]);

  await db.insert(tagihan).values([
    { wargaId: 1, periode: "Mei 2026", nominal: 10000, status: "PENDING" },
    { wargaId: 2, periode: "Mei 2026", nominal: 10000, status: "LUNAS" },
    { wargaId: 3, periode: "Mei 2026", nominal: 10000, status: "PENDING" },
    { wargaId: 4, periode: "Mei 2026", nominal: 10000, status: "PENDING" },
    { wargaId: 5, periode: "Mei 2026", nominal: 10000, status: "LUNAS" },
    { wargaId: 6, periode: "Mei 2026", nominal: 10000, status: "PENDING" },
  ]);

  await db.insert(marketplace).values([
    { nama: "Jasa Pembuatan Website", harga: 4999999, penjual: "Junardi", img: "https://placehold.co/400x300/6366f1/ffffff?text=Web+Service", label: "Donasi", deskripsi: "Jasa pembuatan website UMKM & profil RT" },
    { nama: "Nasi Uduk Spesial", harga: 15000, penjual: "Bu Siti", img: "https://placehold.co/400x300/f59e0b/ffffff?text=Nasi+Uduk", label: "Tersedia", deskripsi: "Nasi uduk dengan lauk lengkap" },
    { nama: "Jasa Cuci Sepatu", harga: 35000, penjual: "Mas Budi", img: "https://placehold.co/400x300/10b981/ffffff?text=Cuci+Sepatu", label: "Tersedia", deskripsi: "Deep clean sepatu semua bahan" },
    { nama: "Kue Kering Lebaran", harga: 75000, penjual: "Bu Rina", img: "https://placehold.co/400x300/ec4899/ffffff?text=Kue+Kering", label: "Pre-Order", deskripsi: "Aneka kue kering homemade" },
  ]);

  console.log("[Seed] Done");
}
