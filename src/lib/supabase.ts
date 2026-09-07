import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { db } from "@/db";
import { warga, iuran, transaksi, tagihan, marketplace, settings, syncLog } from "@/db/schema";
import { eq, desc } from "drizzle-orm";

let _client: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient | null {
  if (_client) return _client;
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_KEY;
  if (!url || !key) {
    console.log("[Supabase] No credentials configured");
    return null;
  }
  _client = createClient(url, key);
  return _client;
}

export function isSupabaseEnabled(): boolean {
  return !!process.env.SUPABASE_URL && !!process.env.SUPABASE_KEY;
}

const TABLE_MAP: Record<string, any> = {
  warga,
  iuran,
  transaksi,
  tagihan,
  marketplace,
  settings,
};

async function logSync(
  target: string,
  table: string,
  action: string,
  status: string,
  message: string | null,
  rows: number | null,
) {
  try {
    await db.insert(syncLog).values({ target, table, action, status, message, rows });
  } catch (e) {
    console.error("Failed to log sync", e);
  }
}

// Sync from local DB to Supabase (upsert)
export async function syncToSupabase(table: keyof typeof TABLE_MAP) {
  const sb = getSupabase();
  if (!sb) {
    return { ok: false, error: "Supabase not configured" };
  }
  try {
    const rows = await db.select().from(TABLE_MAP[table]);
    // Clear target table first, then insert (simple sync strategy)
    await sb.from(table).delete().neq("id", 0);
    if (rows.length > 0) {
      const { error } = await sb.from(table).insert(rows);
      if (error) throw error;
    }
    await logSync("SUPABASE", table, "UPSERT", "SUCCESS", null, rows.length);
    return { ok: true, rows: rows.length };
  } catch (e: any) {
    await logSync("SUPABASE", table, "UPSERT", "FAILED", e?.message ?? String(e), 0);
    return { ok: false, error: e?.message ?? String(e) };
  }
}

// Sync from Supabase to local DB
export async function syncFromSupabase(table: keyof typeof TABLE_MAP) {
  const sb = getSupabase();
  if (!sb) {
    return { ok: false, error: "Supabase not configured" };
  }
  try {
    const { data, error } = await sb.from(table).select();
    if (error) throw error;
    const localTable = TABLE_MAP[table];
    // Clear local, then insert
    await db.delete(localTable);
    if (data && data.length > 0) {
      await db.insert(localTable).values(data as any);
    }
    await logSync("SUPABASE", table, "PULL", "SUCCESS", null, data?.length ?? 0);
    return { ok: true, rows: data?.length ?? 0 };
  } catch (e: any) {
    await logSync("SUPABASE", table, "PULL", "FAILED", e?.message ?? String(e), 0);
    return { ok: false, error: e?.message ?? String(e) };
  }
}

export async function getSyncHistory(limit = 20) {
  return await db.select().from(syncLog).orderBy(desc(syncLog.createdAt)).limit(limit);
}
