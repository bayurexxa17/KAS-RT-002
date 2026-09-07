"use client";

import { useEffect, useState } from "react";
import { api, rupiah } from "@/lib/utils";

type Tagihan = {
  id: number;
  wargaId: number;
  periode: string;
  nominal: number;
  status: string;
};

type Warga = { id: number; nama: string; alamat?: string; wa?: string };
type Iuran = { id: number; kategori: string; nominal: number };

export function TagihanPage({ notify }: { notify: (m: string, t?: "success" | "error") => void }) {
  const [data, setData] = useState<(Tagihan & { warga?: Warga })[]>([]);
  const [warga, setWarga] = useState<Warga[]>([]);
  const [iuranList, setIuranList] = useState<Iuran[]>([]);
  const [search, setSearch] = useState("");
  const [filterPeriode, setFilterPeriode] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [showGenerate, setShowGenerate] = useState(false);

  const load = async () => {
    const [t, w, i] = await Promise.all([
      api<Tagihan[]>("/api/data?table=tagihan"),
      api<Warga[]>("/api/data?table=warga"),
      api<Iuran[]>("/api/data?table=iuran"),
    ]);
    setWarga(w);
    setIuranList(i);
    const enriched = t.map((tg) => ({ ...tg, warga: w.find((x) => x.id === tg.wargaId) }));
    setData(enriched);
  };

  useEffect(() => {
    load();
  }, []);

  const filtered = data.filter((t) => {
    const name = t.warga?.nama ?? "";
    if (search && !name.toLowerCase().includes(search.toLowerCase())) return false;
    if (filterPeriode && t.periode !== filterPeriode) return false;
    if (filterStatus && t.status !== filterStatus) return false;
    return true;
  });

  const periodeSet = Array.from(new Set(data.map((d) => d.periode)));

  const toggleStatus = async (id: number, current: string) => {
    const newStatus = current === "LUNAS" ? "PENDING" : "LUNAS";
    await api("/api/data?table=tagihan", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status: newStatus }),
    });
    notify(`Tagihan ditandai ${newStatus}`);
    load();
  };

  const generateTagihan = async (periode: string, iuranId: number) => {
    const i = iuranList.find((x) => x.id === iuranId);
    if (!i) return;
    for (const w of warga) {
      await api("/api/data?table=tagihan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          wargaId: w.id,
          periode,
          nominal: i.nominal,
          status: "PENDING",
        }),
      });
    }
    notify(`Tagihan ${periode} berhasil digenerate untuk ${warga.length} warga`);
    setShowGenerate(false);
    load();
  };

  const totalPending = filtered.filter((t) => t.status === "PENDING").reduce((a, b) => a + b.nominal, 0);
  const totalLunas = filtered.filter((t) => t.status === "LUNAS").reduce((a, b) => a + b.nominal, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Monitoring Tagihan</h2>
          <p className="text-slate-400 text-[10px] font-bold tracking-widest uppercase">
            Kelola Status Pembayaran Kas Warga
          </p>
          <div className="flex gap-4 mt-3">
            <div className="px-4 py-2 bg-rose-50 rounded-lg">
              <p className="text-[10px] text-rose-400 font-bold">Pending</p>
              <p className="text-sm font-bold text-rose-600">{rupiah(totalPending)}</p>
            </div>
            <div className="px-4 py-2 bg-emerald-50 rounded-lg">
              <p className="text-[10px] text-emerald-400 font-bold">Lunas</p>
              <p className="text-sm font-bold text-emerald-600">{rupiah(totalLunas)}</p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowGenerate(true)}
            className="px-6 py-2 bg-slate-800 text-white rounded-lg font-bold text-sm shadow-lg flex items-center gap-2"
          >
            <i className="fas fa-plus"></i> GENERATE
          </button>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 border rounded-lg text-xs font-bold text-slate-600 bg-white"
          >
            <option value="">Semua Status</option>
            <option value="PENDING">Pending</option>
            <option value="LUNAS">Lunas</option>
          </select>
          <select
            value={filterPeriode}
            onChange={(e) => setFilterPeriode(e.target.value)}
            className="px-4 py-2 border rounded-lg text-xs font-bold text-slate-600 bg-white"
          >
            <option value="">Semua Periode</option>
            {periodeSet.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
          <div className="relative">
            <i className="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-slate-300"></i>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari nama..."
              className="pl-10 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none w-48"
            />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 card-shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50/50 border-b border-slate-100">
              <tr>
                <th className="px-8 py-4 text-[10px] font-bold text-slate-400 uppercase">Warga</th>
                <th className="px-8 py-4 text-[10px] font-bold text-slate-400 uppercase">Periode</th>
                <th className="px-8 py-4 text-[10px] font-bold text-slate-400 uppercase text-right">Nominal</th>
                <th className="px-8 py-4 text-[10px] font-bold text-slate-400 uppercase text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filtered.map((t) => (
                <tr key={t.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-8 py-4">
                    <p className="font-bold text-slate-800 text-sm">{t.warga?.nama ?? "—"}</p>
                    <p className="text-[10px] text-slate-400">{t.warga?.alamat}</p>
                  </td>
                  <td className="px-8 py-4 text-sm text-slate-600">{t.periode}</td>
                  <td className="px-8 py-4 text-right font-bold text-slate-800 text-sm">{rupiah(t.nominal)}</td>
                  <td className="px-8 py-4 text-center">
                    <button
                      onClick={() => toggleStatus(t.id, t.status)}
                      className={`px-4 py-1 rounded-full text-[10px] font-bold ${
                        t.status === "LUNAS"
                          ? "bg-emerald-100 text-emerald-600 hover:bg-emerald-200"
                          : "bg-rose-100 text-rose-600 hover:bg-rose-200"
                      }`}
                    >
                      {t.status}
                    </button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={4} className="text-center py-10 text-slate-400 text-sm">
                    Tidak ada data tagihan
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showGenerate && (
        <GenerateModal
          iuranList={iuranList}
          onClose={() => setShowGenerate(false)}
          onGenerate={generateTagihan}
        />
      )}
    </div>
  );
}

function GenerateModal({
  iuranList,
  onClose,
  onGenerate,
}: {
  iuranList: Iuran[];
  onClose: () => void;
  onGenerate: (periode: string, iuranId: number) => void;
}) {
  const [periode, setPeriode] = useState("");
  const [iuranId, setIuranId] = useState<number | "">("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!periode || !iuranId) return;
    onGenerate(periode, Number(iuranId));
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 card-shadow">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-slate-800">Generate Tagihan</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <i className="fas fa-times"></i>
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-500 mb-1">Periode (contoh: Mei 2026)</label>
            <input
              value={periode}
              onChange={(e) => setPeriode(e.target.value)}
              required
              placeholder="Mei 2026"
              className="input-soft w-full"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 mb-1">Jenis Iuran</label>
            <select
              value={iuranId}
              onChange={(e) => setIuranId(e.target.value ? Number(e.target.value) : "")}
              required
              className="input-soft w-full"
            >
              <option value="">— Pilih iuran —</option>
              {iuranList.map((i) => (
                <option key={i.id} value={i.id}>
                  {i.kategori} — Rp {i.nominal.toLocaleString("id-ID")}
                </option>
              ))}
            </select>
          </div>
          <p className="text-xs text-slate-500">
            Tagihan akan dibuat untuk seluruh warga aktif.
          </p>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 text-slate-600 hover:bg-slate-50 rounded-lg">
              Batal
            </button>
            <button type="submit" className="px-6 py-2 bg-indigo-600 text-white rounded-lg font-bold shadow hover:bg-indigo-700">
              Generate
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
