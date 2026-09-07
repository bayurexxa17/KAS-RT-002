"use client";

import { useEffect, useState } from "react";
import { rupiah } from "@/lib/utils";
import * as store from "@/lib/store";

export function MarketplacePage({ notify }: { notify: (m: string, t?: "success" | "error") => void }) {
  const [data, setData] = useState<store.Marketplace[]>([]);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<store.Marketplace | null>(null);

  const load = async () => {
    setData(await store.getAll<store.Marketplace>("marketplace"));
  };

  useEffect(() => {
    store.seedIfEmpty().then(load);
  }, []);

  const filtered = data.filter((m) =>
    (m.nama + (m.penjual ?? "") + (m.deskripsi ?? "")).toLowerCase().includes(search.toLowerCase())
  );

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const payload: any = {
      nama: form.get("nama"),
      harga: Number(form.get("harga")),
      penjual: form.get("penjual"),
      img: form.get("img") || `https://placehold.co/400x300/6366f1/ffffff?text=${encodeURIComponent(String(form.get("nama")))}`,
      label: form.get("label"),
      deskripsi: form.get("deskripsi"),
    };
    if (editing?.id) {
      await store.update("marketplace", editing.id, payload);
    } else {
      await store.insert("marketplace", payload);
    }
    setShowModal(false);
    setEditing(null);
    notify("Produk disimpan");
    load();
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Hapus produk ini?")) return;
    await store.remove("marketplace", id);
    notify("Produk dihapus");
    load();
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Marketplace Warga</h2>
          <p className="text-slate-400 text-[10px] font-bold tracking-widest uppercase">
            Mendukung UMKM & Ekonomi Lokal Antar Warga
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative">
            <i className="fas fa-search absolute left-4 top-1/2 -translate-y-1/2 text-slate-300"></i>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari produk..."
              className="pl-12 pr-6 py-3 bg-white border border-slate-100 rounded-2xl shadow-sm focus:ring-2 focus:ring-indigo-500 outline-none w-80 text-sm"
            />
          </div>
          <button
            onClick={() => {
              setEditing(null);
              setShowModal(true);
            }}
            className="px-8 py-3 bg-indigo-600 text-white rounded-2xl font-bold shadow-lg hover:bg-indigo-700 flex items-center gap-3 transition-all hover:scale-105"
          >
            <i className="fas fa-plus"></i> Jual Produk
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {filtered.map((m) => (
          <div key={m.id} className="bg-white rounded-[35px] overflow-hidden card-shadow group transition-all hover:-translate-y-2 relative">
            <button
              onClick={() => handleDelete(m.id!)}
              className="absolute top-4 right-4 w-8 h-8 bg-white/90 rounded-full flex items-center justify-center text-rose-500 hover:bg-rose-500 hover:text-white z-10 opacity-0 group-hover:opacity-100 transition"
            >
              <i className="fas fa-trash text-xs"></i>
            </button>
            <div className="h-56 relative overflow-hidden">
              <img
                src={m.img}
                alt={m.nama}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
              <div className="absolute top-4 left-4 bg-white/90 backdrop-blur px-4 py-1.5 rounded-full shadow-lg">
                <p className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">
                  {rupiah(m.harga)}
                </p>
              </div>
              {m.label && (
                <div className="absolute bottom-4 right-4 bg-amber-400 px-4 py-1 rounded-full">
                  <p className="text-[10px] font-black text-white uppercase tracking-widest">{m.label}</p>
                </div>
              )}
            </div>
            <div className="p-8">
              <h4 className="text-xl font-black text-slate-800 leading-tight mb-2">{m.nama}</h4>
              <p className="text-xs text-slate-400 font-medium mb-2">{m.deskripsi}</p>
              <p className="text-xs text-slate-500 font-bold mb-6">{m.penjual}</p>
              <button
                onClick={() => {
                  setEditing(m);
                  setShowModal(true);
                }}
                className="w-full py-3 mb-2 bg-slate-100 text-slate-700 rounded-2xl font-bold text-xs uppercase tracking-widest hover:bg-slate-200 flex items-center justify-center gap-2"
              >
                <i className="fas fa-pen text-xs"></i> Edit
              </button>
              <button className="w-full py-4 bg-emerald-400 text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-lg shadow-emerald-100 hover:bg-emerald-500 flex items-center justify-center gap-3 transition-all">
                <i className="fab fa-whatsapp text-lg"></i> Hubungi Penjual
              </button>
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="col-span-full text-center py-20 text-slate-400">Tidak ada produk</div>
        )}
      </div>

      {showModal && (
        <MarketModal market={editing} onClose={() => setShowModal(false)} onSave={handleSave} />
      )}
    </div>
  );
}

function MarketModal({
  market,
  onClose,
  onSave,
}: {
  market: store.Marketplace | null;
  onClose: () => void;
  onSave: (e: React.FormEvent<HTMLFormElement>) => void;
}) {
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 card-shadow">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-slate-800">
            {market ? "Edit Produk" : "Tambah Produk"}
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <i className="fas fa-times"></i>
          </button>
        </div>
        <form onSubmit={onSave} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-500 mb-1">Nama Produk</label>
            <input name="nama" defaultValue={market?.nama ?? ""} required className="input-soft w-full" />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 mb-1">Harga</label>
            <input name="harga" type="number" defaultValue={market?.harga ?? 0} required className="input-soft w-full" />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 mb-1">Penjual</label>
            <input name="penjual" defaultValue={market?.penjual ?? ""} className="input-soft w-full" />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 mb-1">Deskripsi</label>
            <textarea name="deskripsi" rows={2} defaultValue={market?.deskripsi ?? ""} className="input-soft w-full" />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 mb-1">URL Gambar</label>
            <input name="img" defaultValue={market?.img ?? ""} placeholder="Kosongkan untuk otomatis" className="input-soft w-full" />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 mb-1">Label</label>
            <select name="label" defaultValue={market?.label ?? "Tersedia"} className="input-soft w-full">
              <option value="Tersedia">Tersedia</option>
              <option value="Pre-Order">Pre-Order</option>
              <option value="Donasi">Donasi</option>
              <option value="Limited">Limited</option>
            </select>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 text-slate-600 hover:bg-slate-50 rounded-lg">Batal</button>
            <button type="submit" className="px-6 py-2 bg-indigo-600 text-white rounded-lg font-bold shadow hover:bg-indigo-700">Simpan</button>
          </div>
        </form>
      </div>
    </div>
  );
}
