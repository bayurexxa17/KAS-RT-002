import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import {
  warga,
  iuran,
  transaksi,
  tagihan,
  marketplace,
  settings,
} from "@/db/schema";
import { eq, and, sql, count as drizzleCount } from "drizzle-orm";
import { seedIfEmpty } from "@/lib/seed";

const TABLES: Record<string, any> = {
  warga,
  iuran,
  transaksi,
  tagihan,
  marketplace,
  settings,
};

export async function GET(req: NextRequest) {
  await seedIfEmpty();
  const { searchParams } = new URL(req.url);
  const table = searchParams.get("table") ?? "warga";
  const id = searchParams.get("id");
  const key = searchParams.get("key");

  if (!TABLES[table]) {
    return NextResponse.json({ error: "Invalid table" }, { status: 400 });
  }

  if (table === "settings" && key) {
    const row = await db
      .select()
      .from(settings)
      .where(eq(settings.key, key))
      .limit(1);
    return NextResponse.json(row[0] ?? null);
  }

  if (id) {
    const rows = await db
      .select()
      .from(TABLES[table])
      .where(sql`${TABLES[table]}.id = ${id}`)
      .limit(1);
    return NextResponse.json(rows[0] ?? null);
  }

  const rows = await db.select().from(TABLES[table]);
  return NextResponse.json(rows);
}

export async function POST(req: NextRequest) {
  await seedIfEmpty();
  const { searchParams } = new URL(req.url);
  const table = searchParams.get("table") ?? "warga";
  if (!TABLES[table]) {
    return NextResponse.json({ error: "Invalid table" }, { status: 400 });
  }
  const body = await req.json();
  const id = body.id;

  try {
    if (id) {
      // Update
      const { id: _id, ...updateData } = body;
      if (table === "settings" && updateData.key) {
        // upsert by key
        const existing = await db
          .select()
          .from(settings)
          .where(eq(settings.key, updateData.key))
          .limit(1);
        if (existing.length === 0) {
          await db.insert(settings).values(updateData);
        } else {
          await db
            .update(settings)
            .set({ value: updateData.value })
            .where(eq(settings.key, updateData.key));
        }
      } else {
        await db.update(TABLES[table]).set(updateData).where(eq(TABLES[table].id, id as number));
      }
      return NextResponse.json({ ok: true, action: "update" });
    } else {
      // Insert
      const result = (await db.insert(TABLES[table]).values(body).returning()) as any[];
      return NextResponse.json({ ok: true, action: "insert", data: result[0] });
    }
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? String(e) }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  await seedIfEmpty();
  const { searchParams } = new URL(req.url);
  const table = searchParams.get("table") ?? "warga";
  const id = searchParams.get("id");
  if (!TABLES[table] || !id) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
  await db.delete(TABLES[table]).where(eq(TABLES[table].id, Number(id)));
  return NextResponse.json({ ok: true });
}

// Dashboard aggregate
export async function PUT(req: NextRequest) {
  await seedIfEmpty();
  const { searchParams } = new URL(req.url);
  const view = searchParams.get("view");

  if (view === "dashboard") {
    const totalWarga = await db.select({ count: drizzleCount() }).from(warga);
    const allTx = await db.select().from(transaksi);
    const masuk = allTx.filter((t) => t.tipe === "MASUK").reduce((a, b) => a + b.jumlah, 0);
    const keluar = allTx.filter((t) => t.tipe === "KELUAR").reduce((a, b) => a + b.jumlah, 0);
    const tagihanPending = await db
      .select({ count: drizzleCount() })
      .from(tagihan)
      .where(eq(tagihan.status, "PENDING"));

    // Monthly aggregation
    const monthly: Record<string, { masuk: number; keluar: number }> = {};
    for (let m = 0; m < 12; m++) {
      const key = m.toString().padStart(2, "0");
      monthly[key] = { masuk: 0, keluar: 0 };
    }
    for (const t of allTx) {
      const month = t.tanggal.substring(5, 7);
      if (monthly[month]) {
        if (t.tipe === "MASUK") monthly[month].masuk += t.jumlah;
        else monthly[month].keluar += t.jumlah;
      }
    }

    // Category breakdown
    const categoryMap: Record<string, number> = {};
    for (const t of allTx.filter((x) => x.tipe === "KELUAR")) {
      categoryMap[t.kategori ?? "Lainnya"] =
        (categoryMap[t.kategori ?? "Lainnya"] ?? 0) + t.jumlah;
    }

    return NextResponse.json({
      totalWarga: totalWarga[0].count,
      pemasukan: masuk,
      pengeluaran: keluar,
      saldo: masuk - keluar,
      tagihanPending: tagihanPending[0].count,
      monthly,
      categoryBreakdown: categoryMap,
    });
  }

  return NextResponse.json({ error: "Unknown view" }, { status: 400 });
}
