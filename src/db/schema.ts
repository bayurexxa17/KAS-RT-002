import {
  pgTable,
  serial,
  varchar,
  text,
  integer,
  boolean,
  timestamp,
  date,
  decimal,
  jsonb,
} from "drizzle-orm/pg-core";

// Settings - konfigurasi aplikasi
export const settings = pgTable("settings", {
  id: serial("id").primaryKey(),
  key: varchar("key", { length: 255 }).notNull().unique(),
  value: text("value"),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Warga - data penduduk RT
export const warga = pgTable("warga", {
  id: serial("id").primaryKey(),
  nama: varchar("nama", { length: 255 }).notNull(),
  nik: varchar("nik", { length: 20 }),
  wa: varchar("wa", { length: 20 }),
  alamat: text("alamat"),
  rumah: varchar("rumah", { length: 100 }),
  status: varchar("status", { length: 50 }).default("TETAP"), // TETAP, KOST, KONTRAK
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Jenis iuran
export const iuran = pgTable("iuran", {
  id: serial("id").primaryKey(),
  kategori: varchar("kategori", { length: 255 }).notNull(),
  nominal: integer("nominal").default(0),
  deskripsi: text("deskripsi"),
  status: varchar("status", { length: 50 }).default("AKTIF"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Transaksi (pemasukan / pengeluaran)
export const transaksi = pgTable("transaksi", {
  id: serial("id").primaryKey(),
  tanggal: date("tanggal").notNull(),
  tipe: varchar("tipe", { length: 10 }).notNull(), // MASUK / KELUAR
  kategori: varchar("kategori", { length: 255 }),
  keterangan: text("keterangan"),
  jumlah: integer("jumlah").notNull(),
  wargaId: integer("warga_id"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Tagihan iuran per warga
export const tagihan = pgTable("tagihan", {
  id: serial("id").primaryKey(),
  wargaId: integer("warga_id").notNull(),
  periode: varchar("periode", { length: 50 }).notNull(),
  nominal: integer("nominal").notNull(),
  status: varchar("status", { length: 50 }).default("PENDING"), // PENDING, LUNAS
  createdAt: timestamp("created_at").defaultNow(),
});

// Marketplace UMKM warga
export const marketplace = pgTable("marketplace", {
  id: serial("id").primaryKey(),
  nama: varchar("nama", { length: 255 }).notNull(),
  harga: integer("harga").notNull(),
  penjual: varchar("penjual", { length: 255 }),
  img: text("img"),
  label: varchar("label", { length: 100 }),
  deskripsi: text("deskripsi"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Sync log - mencatat riwayat sinkronisasi
export const syncLog = pgTable("sync_log", {
  id: serial("id").primaryKey(),
  target: varchar("target", { length: 50 }).notNull(), // SUPABASE / GOOGLE_SHEETS
  table: varchar("table", { length: 100 }).notNull(),
  action: varchar("action", { length: 50 }).notNull(), // UPSERT / DELETE
  status: varchar("status", { length: 50 }).notNull(), // SUCCESS / FAILED
  message: text("message"),
  rows: integer("rows"),
  createdAt: timestamp("created_at").defaultNow(),
});

export type Warga = typeof warga.$inferSelect;
export type Iuran = typeof iuran.$inferSelect;
export type Transaksi = typeof transaksi.$inferSelect;
export type Tagihan = typeof tagihan.$inferSelect;
export type Marketplace = typeof marketplace.$inferSelect;
export type Setting = typeof settings.$inferSelect;
export type SyncLog = typeof syncLog.$inferSelect;
