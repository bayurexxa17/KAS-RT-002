import { NextResponse } from "next/server";
import { db } from "@/db";
import { users, warga } from "@/db/schema";
import { asc, eq } from "drizzle-orm";
import { getSessionUser } from "@/lib/auth";

export async function GET() {
  const user = await getSessionUser();
  if (!user || user.role !== "admin")
    return NextResponse.json({ error: "Hanya admin" }, { status: 403 });
  const rows = await db
    .select({
      id: users.id,
      username: users.username,
      role: users.role,
      wargaId: users.wargaId,
      nama: warga.nama,
      noRumah: warga.noRumah,
      createdAt: users.createdAt,
    })
    .from(users)
    .leftJoin(warga, eq(users.wargaId, warga.id))
    .orderBy(asc(users.id));
  return NextResponse.json({ data: rows });
}
