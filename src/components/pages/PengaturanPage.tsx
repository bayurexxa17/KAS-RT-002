"use client";

import { useEffect, useState } from "react";
import * as store from "@/lib/store";

export function PengaturanPage({ notify }: { notify: (m: string, t?: "success" | "error") => void }) {
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [appName, setAppName] = useState("");
  const [description, setDescription] = useState("");
  const [rt, setRt] = useState("");
  const [rw, setRw] = useState("");
  const [address, setAddress] = useState("");
  const [bankInfo, setBankInfo] = useState("");
  const [bendahara, setBendahara] = useState("");

  const supabaseEnabled = !!(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

  useEffect(() => {
    store.seedIfEmpty().then(() => store.getAll<store.Setting>("settings")).then((rows) => {
      const obj: Record<string, string> = {};
      rows.forEach((r) => {
        obj[r.key] = r.value ?? "";
      });
      setSettings(obj);
      setAppName(obj.appName ?? "");
      setDescription(obj.description ?? "");
      setRt(obj.rt ?? "");
      setRw(obj.rw ?? "");
      setAddress(obj.address ?? "");
      setBankInfo(obj.bankInfo ?? "");
      setBendahara(obj.bendahara ?? "");
    });
  }, []);

  const handleSave = async () => {
    const entries: [string, string][] = [
      ["appName", appName],
      ["description", description],
      ["rt", rt],
      ["rw", rw],
      ["address", address],
      ["bankInfo", bankInfo],
      ["bendahara", bendahara],
    ];
    for (const [key, value] of entries) {
      const existing = await store.getAll<store.Setting>("settings");
      const row = existing.find((r) => r.key === key);
      if (row?.id) {
        await store.update("settings", row.id, { value } as any);
      } else {
        await store.insert("settings", { key, value } as any);
      }
    }
    notify("Pengaturan disimpan");
  };

  return (
    <div className="max-w-5xl space-y-8 animate-fadeIn pb-20">
      <div>
        <h2 className="text-3xl font-black text-slate-800">Pengaturan</h2>
        <p className="text-slate-400 text-xs font-bold uppercase tracking-[0.2em] mt-1">
          Konfigurasi Aplikasi & Sinkronisasi
        </p>
      </div>

      <div className="soft-card p-6 card-shadow flex items-center gap-4 border-l-4 border-emerald-500">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${supabaseEnabled ? "bg-emerald-100 text-emerald-600" : "bg-slate-100 text-slate-400"}`}>
          <i className="fas fa-cloud"></i>
        </div>
        <div className="flex-1">
          <p className="font-bold text-slate-800">Supabase Sync</p>
          <p className="text-xs text-slate-500">
            {supabaseEnabled ? `Terhubung: ${process.env.NEXT_PUBLIC_SUPABASE_URL}` : "Belum dikonfigurasi — data tersimpan di browser"}
          </p>
        </div>
        <span className={`text-[10px] font-bold px-3 py-1 rounded-full ${supabaseEnabled ? "bg-emerald-100 text-emerald-600" : "bg-slate-100 text-slate-500"}`}>
          {supabaseEnabled ? "AKTIF" : "LOCAL"}
        </span>
      </div>

      <div className="soft-card p-10 card-shadow">
        <h3 className="text-xl font-black text-slate-800 mb-10">Identitas Aplikasi</h3>

        <div className="space-y-6">
          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Nama Aplikasi</label>
            <input type="text" value={appName} onChange={(e) => setAppName(e.target.value)} className="input-soft w-full font-bold text-slate-700" />
          </div>
          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Keterangan</label>
            <textarea rows={3} value={description} onChange={(e) => setDescription(e.target.value)} className="input-soft w-full text-sm font-medium text-slate-600" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">RT</label>
              <input type="text" value={rt} onChange={(e) => setRt(e.target.value)} className="input-soft w-full font-bold text-slate-700" />
            </div>
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">RW</label>
              <input type="text" value={rw} onChange={(e) => setRw(e.target.value)} className="input-soft w-full font-bold text-slate-700" />
            </div>
          </div>
          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Alamat Lengkap</label>
            <input type="text" value={address} onChange={(e) => setAddress(e.target.value)} className="input-soft w-full font-bold text-slate-700" />
          </div>
          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Informasi Rekening</label>
            <input type="text" value={bankInfo} onChange={(e) => setBankInfo(e.target.value)} className="input-soft w-full font-bold text-slate-700" />
          </div>
          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Nama Bendahara</label>
            <input type="text" value={bendahara} onChange={(e) => setBendahara(e.target.value)} className="input-soft w-full font-bold text-slate-700" />
          </div>
          <div className="flex justify-end pt-4">
            <button
              onClick={handleSave}
              className="px-8 py-3 bg-indigo-600 text-white rounded-xl font-bold shadow-lg hover:bg-indigo-700 flex items-center gap-2"
            >
              <i className="fas fa-save"></i> Simpan Pengaturan
            </button>
          </div>
        </div>
      </div>

      <div className="soft-card p-8 card-shadow bg-amber-50/50 border-amber-100">
        <h3 className="font-bold text-slate-800 mb-2 flex items-center gap-2">
          <i className="fas fa-info-circle text-amber-500"></i>
          Penyimpanan Data
        </h3>
        <div className="text-xs text-slate-600 space-y-2">
          <p>
            {supabaseEnabled ? (
              <>
                Data tersimpan di <strong>Supabase</strong>. Semua perubahan akan otomatis disinkronkan.
              </>
            ) : (
              <>
                Data tersimpan di <strong>localStorage browser</strong>. Untuk sinkronisasi antar perangkat,
                tambahkan variabel <code className="bg-slate-100 px-2 py-0.5 rounded">NEXT_PUBLIC_SUPABASE_URL</code> dan{" "}
                <code className="bg-slate-100 px-2 py-0.5 rounded">NEXT_PUBLIC_SUPABASE_ANON_KEY</code> di environment.
              </>
            )}
          </p>
        </div>
      </div>
    </div>
  );
}
