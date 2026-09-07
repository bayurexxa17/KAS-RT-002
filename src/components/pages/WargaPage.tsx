"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/utils";

type Warga = {
  id: number;
  nama: string;
  nik?: string;
  wa?: string;
  alamat?: string;
  rumah?: string;
  status?: string;
};

export function WargaPage({ notify }: { notify: (m: string, t?: "success" | "error") => void }) {
  const [data, setData] = useState<Warga[]>([]);
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState<Warga | null>(null);
  const [showModal, setShowModal] = useState(false);

  const load = () => api<Warga[]>("/api/data?table=warga").then(setData);
  useEffect(() => {
    load();
  }, []);

  const filtered = data.filter((w) =>
    (w.nama + w.nik + w.alamat + w.rumah + w.wa).toLowerCase().includes(search.toLowerCase())
  );

  const statusCounts = {
    TETAP: data.filter((w) => w.status === "TETAP").length,
    KOST: data.filter((w) => w.status === "KOST").length,
    KONTRAK: data.filter((w) => w.status === "KONTRAK").length,
  };

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const payload = {
      id: editing?.id,
      nama: form.get("nama"),
      nik: form.get("nik"),
      wa: form.get("wa"),
      alamat: form.get("alamat"),
      rumah: form.get("rumah"),
      status: form.get("status"),
    };
    await api("/api/data?table=warga", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    setShowModal(false);
    setEditing(null);
    notify("Data warga berhasil disimpan");
    load();
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Hapus warga ini?")) return;
    await api(`/api/data?table=warga&id=${id}`, { method: "DELETE" });
    notify("Warga dihapus", "success");
    load();
  };

  const openNew = () => {
    setEditing(null);
    setShowModal(true);
  };

  const openEdit = (w: Warga) => {
    setEditing(w);
    setShowModal(true);
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border-l-4 border-indigo-500 shadow-sm">
          <p className="text-[10px] font-bold text-slate-400 uppercase">Total</p>
          <h4 className="text-xl font-bold text-slate-800">{data.length} <span className="text-xs font-normal text-slate-400">WA</span></h4>
        </div>
        <div className="bg-white p-4 rounded-xl border-l-4 border-emerald-500 shadow-sm">
          <p className="text-[10px] font-bold text-slate-400 uppercase">Tetap</p>
          <h4 className="text-xl font-bold text-slate-800">{statusCounts.TETAP}</h4>
        </div>
        <div className="bg-white p-4 rounded-xl border-l-4 border-sky-500 shadow-sm">
          <p className="text-[10px] font-bold text-slate-400 uppercase">Kost</p>
          <h4 className="text-xl font-bold text-slate-800">{statusCounts.KOST}</h4>
        </div>
        <div className="bg-white p-4 rounded-xl border-l-4 border-orange-500 shadow-sm">
          <p className="text-[10px] font-bold text-slate-400 uppercase">Kontrak</p>
          <h4 className="text-xl font-bold text-slate-800">{statusCounts.KONTRAK}</h4>
        </div>
      </div>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Manajemen Data Warga</h2>
          <p className="text-slate-400 text-sm">Kelola data administrasi Rukun Tetangga</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <i className="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-slate-300"></i>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari warga..."
              className="pl-10 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none w-64"
            />
          </div>
          <button
            onClick={openNew}
            className="px-5 py-2 bg-indigo-600 text-white rounded-lg font-bold text-sm shadow-lg hover:bg-indigo-700 flex items-center gap-2"
          >
            <i className="fas fa-user-plus"></i> Tambah Warga
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 card-shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50/50 border-b border-slate-100">
              <tr>
                <th className="px-6 py-4 text-[10px] font-bold text-indigo-600 uppercase">Nama / NIK</th>
                <th className="px-6 py-4 text-[10px] font-bold text-indigo-600 uppercase">WhatsApp</th>
                <th className="px-6 py-4 text-[10px] font-bold text-indigo-600 uppercase">Alamat</th>
                <th className="px-6 py-4 text-[10px] font-bold text-indigo-600 uppercase">Rumah</th>
                <th className="px-6 py-4 text-[10px] font-bold text-indigo-600 uppercase">Status</th>
                <th className="px-6 py-4 text-[10px] font-bold text-indigo-600 uppercase text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filtered.map((w) => (
                <tr key={w.id} className="hover:bg-indigo-50/20 transition-colors">
                  <td className="px-6 py-4">
                    <p className="font-bold text-slate-700">{w.nama}</p>
                    <p className="text-[10px] text-slate-400">{w.nik}</p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-emerald-500 font-bold text-xs">+{w.wa}</p>
                  </td>
                  <td className="px-6 py-4 text-xs text-slate-500">{w.alamat}</td>
                  <td className="px-6 py-4 text-xs font-bold text-slate-700">{w.rumah}</td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-3 py-1 rounded-full text-[10px] font-bold ${
                        w.status === "TETAP"
                          ? "bg-emerald-100 text-emerald-600"
                          : w.status === "KOST"
                            ? "bg-sky-100 text-sky-600"
                            : "bg-orange-100 text-orange-600"
                      }`}
                    >
                      {w.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => openEdit(w)}
                        className="w-8 h-8 rounded-lg bg-slate-100 text-slate-400 hover:bg-emerald-50 hover:text-emerald-600"
                      >
                        <i className="fas fa-pen text-xs"></i>
                      </button>
                      <button
                        onClick={() => handleDelete(w.id)}
                        className="w-8 h-8 rounded-lg bg-slate-100 text-slate-400 hover:bg-rose-50 hover:text-rose-600"
                      >
                        <i className="fas fa-trash text-xs"></i>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center py-10 text-slate-400 text-sm">
                    Tidak ada data
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <WargaModal
          warga={editing}
          onClose={() => setShowModal(false)}
          onSave={handleSave}
        />
      )}
    </div>
  );
}

function WargaModal({
  warga,
  onClose,
  onSave,
}: {
  warga: Warga | null;
  onClose: () => void;
  onSave: (e: React.FormEvent<HTMLFormElement>) => void;
}) {
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 card-shadow">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-slate-800">
            {warga ? "Edit Warga" : "Tambah Warga Baru"}
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <i className="fas fa-times"></i>
          </button>
        </div>
        <form onSubmit={onSave} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-500 mb-1">Nama Lengkap</label>
            <input
              name="nama"
              defaultValue={warga?.nama ?? ""}
              required
              className="input-soft w-full"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1">NIK</label>
              <input name="nik" defaultValue={warga?.nik ?? ""} className="input-soft w-full" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1">No. WhatsApp</label>
              <input name="wa" defaultValue={warga?.wa ?? ""} className="input-soft w-full" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 mb-1">Alamat</label>
            <input name="alamat" defaultValue={warga?.alamat ?? ""} className="input-soft w-full" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1">Rumah/Blok</label>
              <input name="rumah" defaultValue={warga?.rumah ?? ""} className="input-soft w-full" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1">Status</label>
              <select name="status" defaultValue={warga?.status ?? "TETAP"} className="input-soft w-full">
                <option value="TETAP">TETAP</option>
                <option value="KOST">KOST</option>
                <option value="KONTRAK">KONTRAK</option>
              </select>
            </div>
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
