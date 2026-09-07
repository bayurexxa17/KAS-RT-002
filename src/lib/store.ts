import { createClient, SupabaseClient } from "@supabase/supabase-js";

// Types
export type Warga = {
  id?: number;
  nama: string;
  nik?: string;
  wa?: string;
  alamat?: string;
  rumah?: string;
  status?: string;
};

export type Iuran = {
  id?: number;
  kategori: string;
  nominal: number;
  deskripsi?: string;
  status?: string;
};

export type Transaksi = {
  id?: number;
  tanggal: string;
  tipe: "MASUK" | "KELUAR";
  kategori?: string;
  keterangan?: string;
  jumlah: number;
  wargaId?: number;
};

export type Tagihan = {
  id?: number;
  wargaId: number;
  periode: string;
  nominal: number;
  status: string;
  warga?: Warga;
};

export type Marketplace = {
  id?: number;
  nama: string;
  harga: number;
  penjual?: string;
  img?: string;
  label?: string;
  deskripsi?: string;
};

export type Setting = {
  id?: number;
  key: string;
  value?: string;
};

// Supabase client (optional)
let supabase: SupabaseClient | null = null;

if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
  supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}

// LocalStorage fallback
const STORAGE_KEYS = {
  warga: "kasrt_warga",
  iuran: "kasrt_iuran",
  transaksi: "kasrt_transaksi",
  tagihan: "kasrt_tagihan",
  marketplace: "kasrt_marketplace",
  settings: "kasrt_settings",
};

function getLocalStorage<T>(key: string, defaultValue: T[]): T[] {
  if (typeof window === "undefined") return defaultValue;
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : defaultValue;
  } catch {
    return defaultValue;
  }
}

function setLocalStorage<T>(key: string, value: T[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error("Failed to save to localStorage", e);
  }
}

// Generic CRUD functions
export async function getAll<T extends { id?: number }>(
  table: string
): Promise<T[]> {
  if (supabase) {
    const { data, error } = await supabase.from(table).select();
    if (error) throw error;
    return data || [];
  }

  // LocalStorage fallback
  const key = STORAGE_KEYS[table as keyof typeof STORAGE_KEYS];
  if (!key) return [];
  return getLocalStorage<T>(key, []);
}

export async function getById<T extends { id?: number }>(
  table: string,
  id: number
): Promise<T | null> {
  if (supabase) {
    const { data, error } = await supabase
      .from(table)
      .select()
      .eq("id", id)
      .single();
    if (error) throw error;
    return data;
  }

  const key = STORAGE_KEYS[table as keyof typeof STORAGE_KEYS];
  if (!key) return null;
  const items = getLocalStorage<T>(key, []);
  return items.find((item) => item.id === id) || null;
}

export async function insert<T extends { id?: number }>(
  table: string,
  data: Omit<T, "id">
): Promise<T> {
  if (supabase) {
    const { data: result, error } = await supabase
      .from(table)
      .insert(data as any)
      .select()
      .single();
    if (error) throw error;
    return result as T;
  }

  // LocalStorage fallback
  const key = STORAGE_KEYS[table as keyof typeof STORAGE_KEYS];
  if (!key) throw new Error("Invalid table");
  const items = getLocalStorage<T>(key, []);
  const newId = items.length > 0 ? Math.max(...items.map((i) => i.id || 0)) + 1 : 1;
  const newItem = { ...data, id: newId } as T;
  items.push(newItem);
  setLocalStorage(key, items);
  return newItem;
}

export async function update<T extends { id?: number }>(
  table: string,
  id: number,
  data: Partial<T>
): Promise<T> {
  if (supabase) {
    const { data: result, error } = await supabase
      .from(table)
      .update(data as any)
      .eq("id", id)
      .select()
      .single();
    if (error) throw error;
    return result as T;
  }

  // LocalStorage fallback
  const key = STORAGE_KEYS[table as keyof typeof STORAGE_KEYS];
  if (!key) throw new Error("Invalid table");
  const items = getLocalStorage<T>(key, []);
  const index = items.findIndex((item) => item.id === id);
  if (index === -1) throw new Error("Item not found");
  items[index] = { ...items[index], ...data };
  setLocalStorage(key, items);
  return items[index];
}

export async function remove(table: string, id: number): Promise<void> {
  if (supabase) {
    const { error } = await supabase.from(table).delete().eq("id", id);
    if (error) throw error;
    return;
  }

  // LocalStorage fallback
  const key = STORAGE_KEYS[table as keyof typeof STORAGE_KEYS];
  if (!key) throw new Error("Invalid table");
  const items = getLocalStorage<any>(key, []);
  const filtered = items.filter((item) => item.id !== id);
  setLocalStorage(key, filtered);
}

// Dashboard aggregate
export async function getDashboardStats() {
  const warga = await getAll<Warga>("warga");
  const transaksi = await getAll<Transaksi>("transaksi");
  const tagihan = await getAll<Tagihan>("tagihan");

  const masuk = transaksi
    .filter((t) => t.tipe === "MASUK")
    .reduce((a, b) => a + b.jumlah, 0);
  const keluar = transaksi
    .filter((t) => t.tipe === "KELUAR")
    .reduce((a, b) => a + b.jumlah, 0);

  const monthly: Record<string, { masuk: number; keluar: number }> = {};
  for (let m = 0; m < 12; m++) {
    const key = m.toString().padStart(2, "0");
    monthly[key] = { masuk: 0, keluar: 0 };
  }
  for (const t of transaksi) {
    const month = t.tanggal.substring(5, 7);
    if (monthly[month]) {
      if (t.tipe === "MASUK") monthly[month].masuk += t.jumlah;
      else monthly[month].keluar += t.jumlah;
    }
  }

  const categoryMap: Record<string, number> = {};
  for (const t of transaksi.filter((x) => x.tipe === "KELUAR")) {
    categoryMap[t.kategori ?? "Lainnya"] =
      (categoryMap[t.kategori ?? "Lainnya"] ?? 0) + t.jumlah;
  }

  return {
    totalWarga: warga.length,
    pemasukan: masuk,
    pengeluaran: keluar,
    saldo: masuk - keluar,
    tagihanPending: tagihan.filter((t) => t.status === "PENDING").length,
    monthly,
    categoryBreakdown: categoryMap,
  };
}

// Seed data
export async function seedIfEmpty() {
  const warga = await getAll<Warga>("warga");
  if (warga.length > 0) return;

  console.log("[Seed] Populating demo data...");

  // Settings
  const settings: Setting[] = [
    { key: "appName", value: "FORUM MAUMERE B" },
    { key: "description", value: "Sistem Manajemen Kas Forum" },
    { key: "rt", value: "05" },
    { key: "rw", value: "02" },
    { key: "address", value: "Perumahan Harmoni Indah, Jakarta" },
    { key: "bankInfo", value: "Bank BCA 123456789 a/n Forum RT" },
    { key: "bendahara", value: "Jessica Jones" },
  ];
  for (const s of settings) {
    await insert<Setting>("settings", s);
  }

  // Warga
  const wargaData: Warga[] = [
    { nama: "Junardi", nik: "7371031234560004", wa: "6282189146404", alamat: "Blok K 27", status: "TETAP", rumah: "K27 Perumahan Pesona Barombong Indah" },
    { nama: "Kadir", nik: "7371032345670006", wa: "628123456789", alamat: "Blok A 9", status: "TETAP", rumah: "A9 Perumahan Harmoni" },
    { nama: "Siti Aminah", nik: "7371033456780007", wa: "6281345678901", alamat: "Blok B 12", status: "TETAP", rumah: "B12 Perumahan Harmoni" },
    { nama: "Budi Santoso", nik: "7371034567890008", wa: "6281456789012", alamat: "Blok C 5", status: "KOST", rumah: "C5 Kost Harmoni" },
    { nama: "Dewi Lestari", nik: "7371035678900009", wa: "6281567890123", alamat: "Blok D 3", status: "KONTRAK", rumah: "D3 Kontrak Harmoni" },
    { nama: "Ahmad Fauzi", nik: "7371036789010010", wa: "6281678901234", alamat: "Blok E 8", status: "TETAP", rumah: "E8 Perumahan Harmoni" },
    { nama: "Rina Susanti", nik: "7371037890120011", wa: "6281789012345", alamat: "Blok F 15", status: "TETAP", rumah: "F15 Perumahan Harmoni" },
  ];
  for (const w of wargaData) {
    await insert<Warga>("warga", w);
  }

  // Iuran
  const iuranData: Iuran[] = [
    { kategori: "Iuran Bulanan Anggota Formab", nominal: 10000, deskripsi: "Iuran wajib bulanan anggota forum", status: "AKTIF" },
    { kategori: "Iuran Keamanan", nominal: 20000, deskripsi: "Siskamling & pos keamanan", status: "AKTIF" },
    { kategori: "Iuran Kebersihan", nominal: 15000, deskripsi: "Pengelolaan sampah & kebersihan lingkungan", status: "AKTIF" },
    { kategori: "Iuran RW", nominal: 5000, deskripsi: "Kontribusi ke RW", status: "AKTIF" },
  ];
  for (const i of iuranData) {
    await insert<Iuran>("iuran", i);
  }

  // Transaksi
  const transaksiData: Transaksi[] = [
    { tanggal: "2026-02-11", tipe: "MASUK", kategori: "Saldo Awal", keterangan: "Saldo Kas Awal", jumlah: 5777000 },
    { tanggal: "2026-02-11", tipe: "KELUAR", kategori: "Perbaikan", keterangan: "Perbaikan MC Las Pos", jumlah: 375000 },
    { tanggal: "2026-02-11", tipe: "KELUAR", kategori: "Iuran RW", keterangan: "Iuran RW Bulan Januari", jumlah: 50000 },
    { tanggal: "2026-02-11", tipe: "KELUAR", kategori: "Operasional", keterangan: "Fee petugas kutip iuran", jumlah: 218000 },
    { tanggal: "2026-03-15", tipe: "MASUK", kategori: "Iuran Bulanan", keterangan: "Iuran bulan Maret - Junardi", jumlah: 10000, wargaId: 1 },
    { tanggal: "2026-03-20", tipe: "MASUK", kategori: "Iuran Keamanan", keterangan: "Iuran keamanan Maret - Kadir", jumlah: 20000, wargaId: 2 },
    { tanggal: "2026-04-01", tipe: "MASUK", kategori: "Donasi", keterangan: "Donasi pembangunan pos", jumlah: 500000 },
  ];
  for (const t of transaksiData) {
    await insert<Transaksi>("transaksi", t);
  }

  // Tagihan
  const tagihanData: Tagihan[] = [
    { wargaId: 1, periode: "Mei 2026", nominal: 10000, status: "PENDING" },
    { wargaId: 2, periode: "Mei 2026", nominal: 10000, status: "LUNAS" },
    { wargaId: 3, periode: "Mei 2026", nominal: 10000, status: "PENDING" },
    { wargaId: 4, periode: "Mei 2026", nominal: 10000, status: "PENDING" },
    { wargaId: 5, periode: "Mei 2026", nominal: 10000, status: "LUNAS" },
    { wargaId: 6, periode: "Mei 2026", nominal: 10000, status: "PENDING" },
  ];
  for (const t of tagihanData) {
    await insert<Tagihan>("tagihan", t);
  }

  // Marketplace
  const marketplaceData: Marketplace[] = [
    { nama: "Jasa Pembuatan Website", harga: 4999999, penjual: "Junardi", img: "https://placehold.co/400x300/6366f1/ffffff?text=Web+Service", label: "Donasi", deskripsi: "Jasa pembuatan website UMKM & profil RT" },
    { nama: "Nasi Uduk Spesial", harga: 15000, penjual: "Bu Siti", img: "https://placehold.co/400x300/f59e0b/ffffff?text=Nasi+Uduk", label: "Tersedia", deskripsi: "Nasi uduk dengan lauk lengkap" },
    { nama: "Jasa Cuci Sepatu", harga: 35000, penjual: "Mas Budi", img: "https://placehold.co/400x300/10b981/ffffff?text=Cuci+Sepatu", label: "Tersedia", deskripsi: "Deep clean sepatu semua bahan" },
    { nama: "Kue Kering Lebaran", harga: 75000, penjual: "Bu Rina", img: "https://placehold.co/400x300/ec4899/ffffff?text=Kue+Kering", label: "Pre-Order", deskripsi: "Aneka kue kering homemade" },
  ];
  for (const m of marketplaceData) {
    await insert<Marketplace>("marketplace", m);
  }

  console.log("[Seed] Done");
}
