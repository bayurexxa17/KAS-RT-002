"use client";

import { useEffect, useState } from "react";
import { rupiah, formatDate } from "@/lib/utils";
import * as store from "@/lib/store";

export function TransaksiPage({
  tipe,
  notify,
}: {
  tipe: "MASUK" | "KELUAR";
  notify: (m: string, t?: "success" | "error") => void;
}) {
  const [data, setData] = useState<store.Transaksi[]>([]);
  const [warga, setWarga] = useState<store.Warga[]>([]);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<store.Transaksi | null>(null);
  const [filterMonth, setFilterMonth] = useState("");
  const [filterYear, setFilterYear] = useState(String(new Date().getFullYear()));

  const load = async () => {
    const [tx, w] = await Promise.all([
      store.getAll<store.Transaksi>("transaksi"),
      store.getAll<store.Warga>("warga"),
    ]);
    setData(tx);
    setWarga(w);
  };

  useEffect(() => {
    store.seedIfEmpty().then(load);
  }, []);

  const filtered = data
    .filter((t) => t.tipe === tipe)
    .filter((t) =>
      ((t.keterangan ?? "") + (t.kategori ?? "")).toLowerCase().includes(search.toLowerCase())
    )
    .filter((t) => {
      if (!filterMonth) return true;
      return t.tanggal.substring(5, 7) === filterMonth;
    })
    .filter((t) => {
      if (!filterYear) return true;
      return t.tanggal.startsWith(filterYear);
    })
    .sort((a, b) => b.tanggal.localeCompare(a.tanggal));

  const color = tipe === "MASUK" ? "emerald" : "rose";
  const title = tipe === "MASUK" ? "Pemasukan Kas" : "Pengeluaran Kas";
  const total = filtered.reduce((a, b) => a + b.jumlah, 0);

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const payload: any = {
      tanggal: form.get("tanggal"),
      tipe,
      kategori: form.get("kategori"),
      keterangan: form.get("keterangan"),
      jumlah: Number(form.get("jumlah")),
      wargaId: form.get("wargaId") ? Number(form.get("wargaId")) : null,
    };
    if (editing?.id) {
      await store.update("transaksi", editing.id, payload);
    } else {
      await store.insert("transaksi", payload);
    }
    setShowModal(false);
    setEditing(null);
    notify("Transaksi disimpan");
    load();
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Hapus transaksi ini?")) return;
    await store.remove("transaksi", id);
    notify("Transaksi dihapus");
    load();
  };

  const exportCSV = () => {
    const header = "Tanggal,Kategori,Keterangan,Jumlah\n";
    const rows = filtered
      .map((t) => `${t.tanggal},"${t.kategori}","${t.keterangan}",${t.jumlah}`)
      .join("\n");
    const blob = new Blob([header + rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${tipe.toLowerCase()}-${new Date().toISOString().substring(0, 10)}.csv`;
    a.click();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">{title}</h2>
          <p className="text-slate-400 text-[10px] font-bold tracking-widest uppercase">
            ARUS KAS {tipe === "MASUK" ? "MASUK" : "KELUAR"} LINGKUNGAN RT
          </p>
          <p className="mt-2 text-sm font-bold text-slate-700">
            Total: <span className={`text-${color}-600`}>{rupiah(total)}</span>
          </p>
        </div>
        <div className="flex items-center gap-2 bg-white p-1 rounded-xl shadow-sm border border-slate-100">
          <select
            value={filterMonth}
            onChange={(e) => setFilterMonth(e.target.value)}
            className="px-4 py-2 rounded-lg text-xs font-bold text-slate-600 bg-transparent outline-none"
          >
            <option value="">Semua Bulan</option>
            {Array.from({ length: 12 }).map((_, i) => (
              <option key={i} value={String(i + 1).padStart(2, "0")}>
                {["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"][i]}
              </option>
            ))}
          </select>
          <select
            value={filterYear}
            onChange={(e) => setFilterYear(e.target.value)}
            className="px-4 py-2 rounded-lg text-xs font-bold text-slate-600 bg-transparent outline-none"
          >
            <option value="">Semua Tahun</option>
            {[2024, 2025, 2026].map((y) => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <i className="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-slate-300"></i>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari transaksi..."
              className="pl-10 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
            />
          </div>
          <button
            onClick={exportCSV}
            className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-slate-600 font-medium text-sm flex items-center gap-2 hover:bg-slate-50"
          >
            <i className="fas fa-file-export"></i> CSV
          </button>
          <button
            onClick={() => {
              setEditing(null);
              setShowModal(true);
            }}
            className="px-5 py-2 bg-indigo-600 text-white rounded-lg font-bold text-sm shadow-lg hover:bg-indigo-700 flex items-center gap-2"
          >
            <i className="fas fa-plus-circle"></i> Tambah
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 card-shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50/50 border-b border-slate-100">
              <tr>
                <th className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase">Tanggal</th>
                <th className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase">Kategori / Keterangan</th>
                <th className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase text-right">Jumlah</th>
                <th className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filtered.map((t) => {
                const w = warga.find((x) => x.id === t.wargaId);
                return (
                  <tr key={t.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-3">
                        <i className="far fa-calendar text-slate-300"></i>
                        <span className="text-xs font-bold text-slate-700">{formatDate(t.tanggal)}</span>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <p className="font-bold text-slate-800 text-sm">{t.keterangan}</p>
                      <p className="text-[10px] text-slate-400 uppercase font-bold">
                        {t.kategori} {w ? `• ${w.nama}` : ""}
                      </p>
                    </td>
                    <td className="px-8 py-5 text-right">
                      <p className={`font-bold text-${color}-500 text-sm`}>
                        {tipe === "MASUK" ? "+" : "-"} {rupiah(t.jumlah)}
                      </p>
                    </td>
                    <td className="px-8 py-5">
                      <div className="flex items-center justify-center gap-3">
                        <button
                          onClick={() => {
                            setEditing(t);
                            setShowModal(true);
                          }}
                          className="text-slate-300 hover:text-emerald-500"
                        >
                          <i className="fas fa-pen text-xs"></i>
                        </button>
                        <button
                          onClick={() => handleDelete(t.id!)}
                          className="text-slate-300 hover:text-rose-500"
                        >
                          <i className="fas fa-trash text-xs"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={4} className="text-center py-10 text-slate-400 text-sm">
                    Tidak ada transaksi
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <TxModal
          tipe={tipe}
          tx={editing}
          warga={warga}
          onClose={() => setShowModal(false)}
          onSave={handleSave}
        />
      )}
    </div>
  );
}

function TxModal({
  tipe,
  tx,
  warga,
  onClose,
  onSave,
}: {
  tipe: "MASUK" | "KELUAR";
  tx: store.Transaksi | null;
  warga: store.Warga[];
  onClose: () => void;
  onSave: (e: React.FormEvent<HTMLFormElement>) => void;
}) {
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 card-shadow">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-slate-800">
            {tx ? "Edit Transaksi" : `Tambah ${tipe === "MASUK" ? "Pemasukan" : "Pengeluaran"}`}
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <i className="fas fa-times"></i>
          </button>
        </div>
        <form onSubmit={onSave} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-500 mb-1">Tanggal</label>
            <input
              name="tanggal"
              type="date"
              required
              defaultValue={tx?.tanggal ?? new Date().toISOString().substring(0, 10)}
              className="input-soft w-full"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 mb-1">Kategori</label>
            <input
              name="kategori"
              defaultValue={tx?.kategori ?? ""}
              required
              className="input-soft w-full"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 mb-1">Keterangan</label>
            <textarea
              name="keterangan"
              rows={2}
              defaultValue={tx?.keterangan ?? ""}
              required
              className="input-soft w-full"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 mb-1">Jumlah (Rp)</label>
            <input
              name="jumlah"
              type="number"
              defaultValue={tx?.jumlah ?? 0}
              required
              className="input-soft w-full"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 mb-1">Warga (Opsional)</label>
            <select name="wargaId" defaultValue={tx?.wargaId ?? ""} className="input-soft w-full">
              <option value="">— Tidak ada —</option>
              {warga.map((w) => (
                <option key={w.id} value={w.id}>
                  {w.nama}
                </option>
              ))}
            </select>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 text-slate-600 hover:bg-slate-50 rounded-lg">
              Batal
            </button>
            <button type="submit" className="px-6 py-2 bg-indigo-600 text-white rounded-lg font-bold shadow hover:bg-indigo-700">
              Simpan
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
