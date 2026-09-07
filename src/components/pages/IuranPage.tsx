"use client";

import { useEffect, useState } from "react";
import { api, rupiah } from "@/lib/utils";

type Iuran = {
  id: number;
  kategori: string;
  nominal: number;
  deskripsi?: string;
  status: string;
};

export function IuranPage({ notify }: { notify: (m: string, t?: "success" | "error") => void }) {
  const [data, setData] = useState<Iuran[]>([]);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Iuran | null>(null);

  const load = () => api<Iuran[]>("/api/data?table=iuran").then(setData);
  useEffect(() => {
    load();
  }, []);

  const filtered = data.filter((i) => i.kategori.toLowerCase().includes(search.toLowerCase()));

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const payload = {
      id: editing?.id,
      kategori: form.get("kategori"),
      nominal: Number(form.get("nominal")),
      deskripsi: form.get("deskripsi"),
      status: form.get("status"),
    };
    await api("/api/data?table=iuran", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    setShowModal(false);
    setEditing(null);
    notify("Kategori iuran disimpan");
    load();
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Hapus kategori iuran ini?")) return;
    await api(`/api/data?table=iuran&id=${id}`, { method: "DELETE" });
    notify("Kategori dihapus");
    load();
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Kategori Iuran Kas</h2>
          <p className="text-slate-400 text-sm font-medium border-b-2 border-indigo-500 inline-block mt-1 pb-1">
            KONFIGURASI JENIS PENARIKAN DANA WARGA
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <i className="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-slate-300"></i>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari jenis iuran..."
              className="pl-10 pr-4 py-3 border border-slate-100 rounded-xl bg-white shadow-sm focus:ring-2 focus:ring-indigo-500 outline-none w-64"
            />
          </div>
          <button
            onClick={() => {
              setEditing(null);
              setShowModal(true);
            }}
            className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold shadow-lg hover:bg-indigo-700 flex items-center gap-2"
          >
            <i className="fas fa-plus"></i> TAMBAH KATEGORI
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {filtered.map((i) => (
          <div
            key={i.id}
            className="bg-white p-8 rounded-3xl border border-slate-100 card-shadow group relative overflow-hidden transition-all hover:-translate-y-1"
          >
            <div className="flex items-center gap-4 mb-6">
              <div className="w-14 h-14 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 shadow-inner">
                <i className="fas fa-credit-card text-xl"></i>
              </div>
              <div>
                <h3 className="font-bold text-slate-800 leading-tight">{i.kategori}</h3>
                <p className="text-slate-400 font-bold text-xl">{rupiah(i.nominal)}</p>
              </div>
            </div>
            <div className="border-l-2 border-slate-100 pl-4 mb-8">
              <p className="text-xs text-slate-400 italic">{i.deskripsi}</p>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <i className="fas fa-dollar-sign text-emerald-400 text-xs"></i>
                <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest">
                  Status: {i.status}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => {
                    setEditing(i);
                    setShowModal(true);
                  }}
                  className="w-8 h-8 rounded-lg text-slate-400 hover:bg-indigo-50 hover:text-indigo-600"
                >
                  <i className="fas fa-pen text-xs"></i>
                </button>
                <button
                  onClick={() => handleDelete(i.id)}
                  className="w-8 h-8 rounded-lg text-slate-400 hover:bg-rose-50 hover:text-rose-600"
                >
                  <i className="fas fa-trash text-xs"></i>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <IuranModal
          iuran={editing}
          onClose={() => setShowModal(false)}
          onSave={handleSave}
        />
      )}
    </div>
  );
}

function IuranModal({
  iuran,
  onClose,
  onSave,
}: {
  iuran: Iuran | null;
  onClose: () => void;
  onSave: (e: React.FormEvent<HTMLFormElement>) => void;
}) {
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 card-shadow">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-slate-800">
            {iuran ? "Edit Kategori Iuran" : "Tambah Kategori Iuran"}
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <i className="fas fa-times"></i>
          </button>
        </div>
        <form onSubmit={onSave} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-500 mb-1">Kategori</label>
            <input name="kategori" defaultValue={iuran?.kategori ?? ""} required className="input-soft w-full" />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 mb-1">Nominal (Rp)</label>
            <input
              name="nominal"
              type="number"
              defaultValue={iuran?.nominal ?? 0}
              required
              className="input-soft w-full"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 mb-1">Deskripsi</label>
            <textarea name="deskripsi" rows={2} defaultValue={iuran?.deskripsi ?? ""} className="input-soft w-full" />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 mb-1">Status</label>
            <select name="status" defaultValue={iuran?.status ?? "AKTIF"} className="input-soft w-full">
              <option value="AKTIF">AKTIF</option>
              <option value="NONAKTIF">NONAKTIF</option>
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
