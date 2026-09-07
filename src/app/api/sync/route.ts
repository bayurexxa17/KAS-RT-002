import { NextRequest, NextResponse } from "next/server";
import {
  syncToSupabase,
  syncFromSupabase,
  isSupabaseEnabled,
} from "@/lib/supabase";
import {
  syncToGoogleSheets,
  syncFromGoogleSheets,
  isGoogleSheetsEnabled,
  getSyncHistory,
} from "@/lib/google-sheets";

const VALID_TABLES = ["warga", "iuran", "transaksi", "tagihan", "marketplace", "settings"];

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const action = searchParams.get("action");

  if (action === "status") {
    return NextResponse.json({
      supabase: {
        enabled: isSupabaseEnabled(),
        url: process.env.SUPABASE_URL ?? null,
      },
      googleSheets: {
        enabled: isGoogleSheetsEnabled(),
        sheetId: process.env.GOOGLE_SHEET_ID ?? null,
      },
    });
  }

  if (action === "history") {
    const history = await getSyncHistory(50);
    return NextResponse.json(history);
  }

  return NextResponse.json({ error: "Unknown action" }, { status: 400 });
}

export async function POST(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const target = searchParams.get("target"); // supabase | google_sheets
  const action = searchParams.get("action"); // push | pull
  const table = searchParams.get("table"); // optional; all tables if not specified
  const body = await req.json().catch(() => ({}));
  const tables = body.tables ?? (table ? [table] : VALID_TABLES);

  const results: any[] = [];
  for (const t of tables) {
    if (!VALID_TABLES.includes(t)) {
      results.push({ table: t, ok: false, error: "Invalid table" });
      continue;
    }
    if (target === "supabase") {
      if (!isSupabaseEnabled()) {
        results.push({ table: t, ok: false, error: "Supabase not configured" });
        continue;
      }
      const res =
        action === "pull"
          ? await syncFromSupabase(t as any)
          : await syncToSupabase(t as any);
      results.push({ table: t, ...res });
    } else if (target === "google_sheets") {
      if (!isGoogleSheetsEnabled()) {
        results.push({ table: t, ok: false, error: "Google Sheets not configured" });
        continue;
      }
      const res =
        action === "pull"
          ? await syncFromGoogleSheets(t)
          : await syncToGoogleSheets(t);
      results.push({ table: t, ...res });
    } else {
      return NextResponse.json({ error: "Invalid target" }, { status: 400 });
    }
  }
  return NextResponse.json({ ok: true, results });
}
