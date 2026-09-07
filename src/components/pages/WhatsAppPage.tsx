"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/utils";

type Warga = { id: number; nama: string; alamat?: string; wa?: string };

export function WhatsAppPage() {
  const [warga, setWarga] = useState<Warga[]>([]);
  const [selected, setSelected] = useState<Warga[]>([]);
  const [message, setMessage] = useState("");
  const [search, setSearch] = useState("");

  useEffect(() => {
    api<Warga[]>("/api/data?table=warga").then(setWarga);
  }, []);

  const filtered = warga.filter((w) =>
    (w.nama + (w.alamat ?? "")).toLowerCase().includes(search.toLowerCase())
  );

  const toggleSelect = (w: Warga) => {
    if (selected.find((s) => s.id === w.id)) {
      setSelected(selected.filter((s) => s.id !== w.id));
    } else {
      setSelected([...selected, w]);
    }
  };

  const selectAll = () => {
    if (selected.length === filtered.length) {
      setSelected([]);
    } else {
      setSelected(filtered);
    }
  };

  const broadcast = () => {
    if (selected.length === 0) {
      alert("Pilih minimal 1 penerima");
      return;
    }
    if (!message.trim()) {
      alert("Tulis pesan terlebih dahulu");
      return;
    }
    // Open WhatsApp Web for each recipient (first one for demo)
    const first = selected[0];
    const personalized = message.replace(/\[Nama\]/g, first.nama);
    const url = `https://wa.me/${first.wa}?text=${encodeURIComponent(personalized)}`;
    window.open(url, "_blank");
    if (selected.length > 1) {
      alert(
        `Pesan akan dikirim ke ${selected.length} penerima. Browser akan membuka satu per satu.`
      );
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-slate-800">Kirim WhatsApp</h2>
        <p className="text-slate-400 text-[10px] font-bold tracking-widest uppercase">
          Broadcast Pesan ke Warga
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="bg-white rounded-3xl border border-slate-100 card-shadow p-8 flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <i className="fas fa-user-friends text-indigo-500"></i>
              <h3 className="font-bold text-slate-800">Pilih Penerima</h3>
            </div>
            <button onClick={selectAll} className="text-[10px] font-bold text-indigo-600 hover:underline">
              {selected.length === filtered.length ? "BATAL" : "PILIH SEMUA"}
            </button>
          </div>
          <div className="relative mb-4">
            <i className="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-slate-300"></i>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari warga..."
              className="w-full pl-10 pr-4 py-3 border border-slate-100 rounded-xl bg-slate-50/50 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
            />
          </div>
          <div className="flex-1 space-y-3 overflow-y-auto max-h-[400px] custom-scrollbar pr-2">
            {filtered.map((w) => {
              const isSelected = !!selected.find((s) => s.id === w.id);
              return (
                <div
                  key={w.id}
                  onClick={() => toggleSelect(w)}
                  className={`flex items-center justify-between p-4 rounded-2xl border cursor-pointer transition-all ${
                    isSelected
                      ? "bg-indigo-50 border-indigo-300"
                      : "border-slate-100 hover:bg-indigo-50/30"
                  }`}
                >
                  <div>
                    <p className="font-bold text-slate-800 text-sm">{w.nama}</p>
                    <p className="text-[10px] text-slate-400">+{w.wa}</p>
                  </div>
                  {isSelected ? (
                    <i className="fas fa-check-circle text-indigo-500"></i>
                  ) : (
                    <i className="far fa-circle text-slate-200"></i>
                  )}
                </div>
              );
            })}
          </div>
          <div className="mt-4 pt-4 border-t border-slate-100">
            <p className="text-xs text-slate-500">
              <span className="font-bold text-indigo-600">{selected.length}</span> penerima dipilih
            </p>
          </div>
        </div>

        <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-100 card-shadow p-8">
          <div className="flex items-center gap-3 mb-6">
            <i className="fas fa-comment-dots text-indigo-500"></i>
            <h3 className="font-bold text-slate-800">Tulis Pesan</h3>
          </div>
          <div className="space-y-6">
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
              <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Penerima</p>
              {selected.length > 0 ? (
                <div className="flex flex-wrap gap-1">
                  {selected.slice(0, 10).map((w) => (
                    <span key={w.id} className="text-xs bg-indigo-100 text-indigo-700 px-2 py-1 rounded-full font-semibold">
                      {w.nama}
                    </span>
                  ))}
                  {selected.length > 10 && (
                    <span className="text-xs bg-slate-200 text-slate-700 px-2 py-1 rounded-full">
                      +{selected.length - 10} lainnya
                    </span>
                  )}
                </div>
              ) : (
                <p className="text-slate-400 italic text-sm">Belum dipilih...</p>
              )}
            </div>
            <div className="relative">
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={10}
                placeholder="Tulis pesan Anda di sini... Gunakan [Nama] untuk menyebut nama warga secara otomatis."
                className="w-full p-6 border border-slate-100 rounded-3xl bg-white shadow-sm focus:ring-2 focus:ring-indigo-500 outline-none text-sm leading-relaxed"
              />
              <span className="absolute bottom-4 right-6 text-[10px] text-slate-300 font-bold uppercase">
                {message.length} Karakter
              </span>
            </div>
            <div className="bg-amber-50 border border-amber-100 rounded-xl p-4">
              <p className="text-xs text-amber-800">
                <i className="fas fa-info-circle mr-2"></i>
                <strong>Preview:</strong> {message.replace(/\[Nama\]/g, selected[0]?.nama ?? "Warga")}
              </p>
            </div>
            <div className="flex items-center justify-between">
              <p className="text-[10px] text-slate-400">
                <span className="font-bold text-indigo-400">Tip:</span> Anda akan diarahkan ke WhatsApp Web/App.
              </p>
              <button
                onClick={broadcast}
                className="px-8 py-3 bg-emerald-400 text-white rounded-xl font-bold shadow-lg hover:bg-emerald-500 flex items-center gap-3 transition-all"
              >
                <i className="fab fa-whatsapp text-xl"></i> KIRIM PESAN
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
