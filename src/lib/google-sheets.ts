import { google, sheets_v4 } from "googleapis";
import { db } from "@/db";
import {
  warga,
  iuran,
  transaksi,
  tagihan,
  marketplace,
  settings,
  syncLog,
} from "@/db/schema";
import { desc } from "drizzle-orm";

function getAuth() {
  const creds = process.env.GOOGLE_SERVICE_ACCOUNT;
  if (!creds) return null;
  try {
    const parsed = JSON.parse(creds);
    const auth = new google.auth.GoogleAuth({
      credentials: parsed,
      scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    });
    return auth;
  } catch (e) {
    console.error("[GSheets] Invalid service account JSON");
    return null;
  }
}

export function isGoogleSheetsEnabled(): boolean {
  return !!process.env.GOOGLE_SERVICE_ACCOUNT && !!process.env.GOOGLE_SHEET_ID;
}

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

type SheetRow = (string | number | boolean | null)[];

function tableToRows(table: string, data: any[]): SheetRow[] {
  const headerMap: Record<string, string[]> = {
    warga: ["id", "nama", "nik", "wa", "alamat", "rumah", "status"],
    iuran: ["id", "kategori", "nominal", "deskripsi", "status"],
    transaksi: ["id", "tanggal", "tipe", "kategori", "keterangan", "jumlah", "wargaId"],
    tagihan: ["id", "wargaId", "periode", "nominal", "status"],
    marketplace: ["id", "nama", "harga", "penjual", "img", "label"],
    settings: ["id", "key", "value"],
  };
  const headers = headerMap[table] ?? [];
  const rows: SheetRow[] = [headers];
  for (const row of data) {
    rows.push(headers.map((h) => (row as any)[h] ?? ""));
  }
  return rows;
}

export async function syncToGoogleSheets(table: string) {
  if (!isGoogleSheetsEnabled()) {
    return { ok: false, error: "Google Sheets not configured" };
  }
  const auth = getAuth();
  if (!auth) return { ok: false, error: "Invalid credentials" };
  const sheets: sheets_v4.Sheets = google.sheets({ version: "v4", auth });
  const sheetId = process.env.GOOGLE_SHEET_ID!;
  try {
    const localTable =
      table === "warga"
        ? warga
        : table === "iuran"
          ? iuran
          : table === "transaksi"
            ? transaksi
            : table === "tagihan"
              ? tagihan
              : table === "marketplace"
                ? marketplace
                : settings;
    const data = await db.select().from(localTable);
    const values = tableToRows(table, data);
    // Ensure sheet exists (create if not)
    try {
      await sheets.spreadsheets.batchUpdate({
        spreadsheetId: sheetId,
        requestBody: {
          requests: [{ addSheet: { properties: { title: table } } }],
        },
      });
    } catch {
      // sheet may already exist; ignore
    }
    await sheets.spreadsheets.values.clear({
      spreadsheetId: sheetId,
      range: `${table}!A:Z`,
    });
    await sheets.spreadsheets.values.update({
      spreadsheetId: sheetId,
      range: `${table}!A1`,
      valueInputOption: "USER_ENTERED",
      requestBody: { values },
    });
    await logSync("GOOGLE_SHEETS", table, "PUSH", "SUCCESS", null, data.length);
    return { ok: true, rows: data.length };
  } catch (e: any) {
    await logSync("GOOGLE_SHEETS", table, "PUSH", "FAILED", e?.message ?? String(e), 0);
    return { ok: false, error: e?.message ?? String(e) };
  }
}

export async function syncFromGoogleSheets(table: string) {
  if (!isGoogleSheetsEnabled()) {
    return { ok: false, error: "Google Sheets not configured" };
  }
  const auth = getAuth();
  if (!auth) return { ok: false, error: "Invalid credentials" };
  const sheets: sheets_v4.Sheets = google.sheets({ version: "v4", auth });
  const sheetId = process.env.GOOGLE_SHEET_ID!;
  try {
    const resp = await sheets.spreadsheets.values.get({
      spreadsheetId: sheetId,
      range: `${table}!A:Z`,
    });
    const rows = resp.data.values ?? [];
    if (rows.length < 2) {
      return { ok: true, rows: 0 };
    }
    const [headers, ...dataRows] = rows;
    const parsed = dataRows.map((r) => {
      const obj: Record<string, any> = {};
      headers.forEach((h, i) => {
        let v: any = r[i] ?? "";
        // numeric conversion for numeric columns
        if (["id", "nominal", "jumlah", "wargaId", "harga"].includes(h) && v !== "") {
          const n = Number(v);
          v = isNaN(n) ? v : n;
        }
        obj[h] = v;
      });
      return obj;
    });

    const localTable =
      table === "warga"
        ? warga
        : table === "iuran"
          ? iuran
          : table === "transaksi"
            ? transaksi
            : table === "tagihan"
              ? tagihan
              : table === "marketplace"
                ? marketplace
                : settings;
    await db.delete(localTable);
    if (parsed.length > 0) {
      await db.insert(localTable).values(parsed as any);
    }
    await logSync("GOOGLE_SHEETS", table, "PULL", "SUCCESS", null, parsed.length);
    return { ok: true, rows: parsed.length };
  } catch (e: any) {
    await logSync("GOOGLE_SHEETS", table, "PULL", "FAILED", e?.message ?? String(e), 0);
    return { ok: false, error: e?.message ?? String(e) };
  }
}

export async function getSyncHistory(limit = 20) {
  return await db.select().from(syncLog).orderBy(desc(syncLog.createdAt)).limit(limit);
}
