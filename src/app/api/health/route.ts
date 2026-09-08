import { db } from "@/db";
import { sql } from "drizzle-orm";
import { ensureDb } from "@/lib/bootstrap";

export const dynamic = "force-dynamic";

export async function GET() {
  const hasDatabaseUrl = Boolean(process.env.DATABASE_URL);
  try {
    await db.execute(sql`select 1`);
    // bootstrap tabel + data awal (tidak menggagalkan healthcheck jika seed error)
    ensureDb().catch(() => {});
    return Response.json({ ok: true, hasDatabaseUrl, dbConnected: true });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "unknown error";
    return Response.json(
      { ok: false, hasDatabaseUrl, dbConnected: false, dbError: msg },
      { status: 500 }
    );
  }
}
