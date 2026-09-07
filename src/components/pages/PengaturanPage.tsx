"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/utils";

type Setting = { id: number; key: string; value?: string };

export function PengaturanPage({ notify }: { notify: (m: string, t?: "success" | "error") => void }) {
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [syncStatus, setSyncStatus] = useState<any>(null);

  useEffect(() => {
    api<Setting[]>("/api/data?table=settings").then((rows) => {
      const obj: Record<string, string> = {};
      rows.forEach((r) => {
        obj[r.key] = r.value ?? "";
      });
      setSettings(obj);
    });
    api("/api/sync?action=status").then(setSyncStatus);
  }, []);

  const updateSetting = async (key: string, value: string) => {
    await api("/api/data?table=settings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ key, value }),
    });
    setSettings({ ...settings, [key]: value });
  };

  const [appName, setAppName] = useState(settings.appName ?? "");
  const [description, setDescription] = useState(settings.description ?? "");
  const [rt, setRt] = useState(settings.rt ?? "");
  const [rw, setRw] = useState(settings.rw ?? "");
  const [address, setAddress] = useState(settings.address ?? "");
  const [bankInfo, setBankInfo] = useState(settings.bankInfo ?? "");
  const [bendahara, setBendahara] = useState(settings.bendahara ?? "");

  useEffect(() => {
    setAppName(settings.appName ?? "");
    setDescription(settings.description ?? "");
    setRt(settings.rt ?? "");
    setRw(settings.rw ?? "");
    setAddress(settings.address ?? "");
    setBankInfo(settings.bankInfo ?? "");
    setBendahara(settings.bendahara ?? "");
  }, [settings]);

  const handleSave = async () => {
    await Promise.all([
      updateSetting("appName", appName),
      updateSetting("description", description),
      updateSetting("rt", rt),
      updateSetting("rw", rw),
      updateSetting("address", address),
      updateSetting("bankInfo", bankInfo),
      updateSetting("bendahara", bendahara),
    ]);
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

      {/* Connection Status */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className={`soft-card p-6 card-shadow flex items-center gap-4 ${syncStatus?.supabase?.enabled ? "border-l-4 border-emerald-500" : "border-l-4 border-slate-300"}`}>
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${syncStatus?.supabase?.enabled ? "bg-emerald-100 text-emerald-600" : "bg-slate-100 text-slate-400"}`}>
            <i className="fas fa-cloud"></i>
          </div>
          <div className="flex-1">
            <p className="font-bold text-slate-800">Supabase</p>
            <p className="text-xs text-slate-500">
              {syncStatus?.supabase?.enabled
                ? `Terhubung: ${syncStatus.supabase.url}`
                : "Belum dikonfigurasi"}
            </p>
          </div>
          <span className={`text-[10px] font-bold px-3 py-1 rounded-full ${syncStatus?.supabase?.enabled ? "bg-emerald-100 text-emerald-600" : "bg-slate-100 text-slate-500"}`}>
            {syncStatus?.supabase?.enabled ? "AKTIF" : "NONAKTIF"}
          </span>
        </div>
        <div className={`soft-card p-6 card-shadow flex items-center gap-4 ${syncStatus?.googleSheets?.enabled ? "border-l-4 border-emerald-500" : "border-l-4 border-slate-300"}`}>
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${syncStatus?.googleSheets?.enabled ? "bg-emerald-100 text-emerald-600" : "bg-slate-100 text-slate-400"}`}>
            <i className="fas fa-table"></i>
          </div>
          <div className="flex-1">
            <p className="font-bold text-slate-800">Google Sheets</p>
            <p className="text-xs text-slate-500 truncate">
              {syncStatus?.googleSheets?.enabled
                ? `Sheet: ${syncStatus.googleSheets.sheetId}`
                : "Belum dikonfigurasi"}
            </p>
          </div>
          <span className={`text-[10px] font-bold px-3 py-1 rounded-full ${syncStatus?.googleSheets?.enabled ? "bg-emerald-100 text-emerald-600" : "bg-slate-100 text-slate-500"}`}>
            {syncStatus?.googleSheets?.enabled ? "AKTIF" : "NONAKTIF"}
          </span>
        </div>
      </div>

      <div className="soft-card p-10 card-shadow">
        <h3 className="text-xl font-black text-slate-800 mb-10">Identitas Aplikasi</h3>

        <div className="space-y-6">
          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">
              Nama Aplikasi
            </label>
            <input
              type="text"
              value={appName}
              onChange={(e) => setAppName(e.target.value)}
              className="input-soft w-full font-bold text-slate-700"
            />
          </div>

          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">
              Keterangan Aplikasi
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="input-soft w-full text-sm font-medium text-slate-600"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">
                RT
              </label>
              <input
                type="text"
                value={rt}
                onChange={(e) => setRt(e.target.value)}
                className="input-soft w-full font-bold text-slate-700"
              />
            </div>
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">
                RW
              </label>
              <input
                type="text"
                value={rw}
                onChange={(e) => setRw(e.target.value)}
                className="input-soft w-full font-bold text-slate-700"
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">
              Alamat Lengkap
            </label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="input-soft w-full font-bold text-slate-700"
            />
          </div>

          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">
              Informasi Rekening
            </label>
            <input
              type="text"
              value={bankInfo}
              onChange={(e) => setBankInfo(e.target.value)}
              className="input-soft w-full font-bold text-slate-700"
            />
          </div>

          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">
              Nama Bendahara
            </label>
            <input
              type="text"
              value={bendahara}
              onChange={(e) => setBendahara(e.target.value)}
              className="input-soft w-full font-bold text-slate-700"
            />
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
          Cara Mengaktifkan Sinkronisasi
        </h3>
        <div className="text-xs text-slate-600 space-y-2">
          <p>
            <strong>Supabase:</strong> Tambahkan variabel <code className="bg-slate-100 px-2 py-0.5 rounded">SUPABASE_URL</code> dan{" "}
            <code className="bg-slate-100 px-2 py-0.5 rounded">SUPABASE_KEY</code> di file .env Anda.
          </p>
          <p>
            <strong>Google Sheets:</strong> Tambahkan{" "}
            <code className="bg-slate-100 px-2 py-0.5 rounded">GOOGLE_SERVICE_ACCOUNT</code> (JSON key) dan{" "}
            <code className="bg-slate-100 px-2 py-0.5 rounded">GOOGLE_SHEET_ID</code> di file .env Anda.
          </p>
          <p className="italic text-slate-500">
            Setelah variabel terisi, gunakan tombol "Sinkronisasi" di sidebar atau topbar untuk
            push/pull data.
          </p>
        </div>
      </div>
    </div>
  );
}
