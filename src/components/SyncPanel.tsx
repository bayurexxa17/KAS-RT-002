"use client";

import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";

export function SyncPanel({
  onClose,
  notify,
}: {
  onClose: () => void;
  notify: (m: string, t?: "success" | "error") => void;
}) {
  const supabaseEnabled = !!(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

  const exportAll = () => {
    const data: Record<string, any> = {};
    ["warga", "iuran", "transaksi", "tagihan", "marketplace", "settings"].forEach((t) => {
      try {
        data[t] = JSON.parse(localStorage.getItem(`kasrt_${t}`) || "[]");
      } catch {
        data[t] = [];
      }
    });
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `kasrt-backup-${new Date().toISOString().substring(0, 10)}.json`;
    a.click();
    notify("Backup berhasil diunduh");
  };

  const importData = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const data = JSON.parse(ev.target?.result as string);
        Object.entries(data).forEach(([key, value]) => {
          localStorage.setItem(`kasrt_${key}`, JSON.stringify(value));
        });
        notify("Data berhasil diimpor");
        setTimeout(() => window.location.reload(), 1000);
      } catch (err) {
        notify("File tidak valid", "error");
      }
    };
    reader.readAsText(file);
  };

  const clearAll = () => {
    if (!confirm("Hapus semua data lokal? Data yang sudah disimpan akan hilang.")) return;
    ["warga", "iuran", "transaksi", "tagihan", "marketplace", "settings"].forEach((t) => {
      localStorage.removeItem(`kasrt_${t}`);
    });
    notify("Semua data lokal dihapus");
    setTimeout(() => window.location.reload(), 1000);
  };

  const syncToSupabase = async () => {
    if (!supabaseEnabled) {
      notify("Supabase belum dikonfigurasi", "error");
      return;
    }
    const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);
    const tables = ["warga", "iuran", "transaksi", "tagihan", "marketplace", "settings"];
    let total = 0;
    for (const t of tables) {
      try {
        const data = JSON.parse(localStorage.getItem(`kasrt_${t}`) || "[]");
        if (data.length > 0) {
          const { error } = await sb.from(t).upsert(data);
          if (error) throw error;
          total += data.length;
        }
      } catch (e: any) {
        notify(`Sync ${t} gagal: ${e.message}`, "error");
        return;
      }
    }
    notify(`Sync ke Supabase berhasil: ${total} baris`);
  };

  const syncFromSupabase = async () => {
    if (!supabaseEnabled) {
      notify("Supabase belum dikonfigurasi", "error");
      return;
    }
    const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);
    const tables = ["warga", "iuran", "transaksi", "tagihan", "marketplace", "settings"];
    let total = 0;
    for (const t of tables) {
      try {
        const { data, error } = await sb.from(t).select();
        if (error) throw error;
        localStorage.setItem(`kasrt_${t}`, JSON.stringify(data || []));
        total += (data || []).length;
      } catch (e: any) {
        notify(`Sync ${t} gagal: ${e.message}`, "error");
        return;
      }
    }
    notify(`Sync dari Supabase berhasil: ${total} baris`);
    setTimeout(() => window.location.reload(), 1000);
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-end">
      <div className="bg-white w-full max-w-md h-full overflow-y-auto custom-scrollbar">
        <div className="sticky top-0 bg-white border-b border-slate-200 p-6 flex items-center justify-between z-10">
          <div>
            <h3 className="text-xl font-bold text-slate-800">Sinkronisasi Data</h3>
            <p className="text-xs text-slate-400">Backup, restore, & sync</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-500">
            <i className="fas fa-times"></i>
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div>
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Status Layanan</h4>
            <div className={`p-4 rounded-xl border flex items-center gap-3 ${supabaseEnabled ? "bg-emerald-50 border-emerald-200" : "bg-slate-50 border-slate-200"}`}>
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${supabaseEnabled ? "bg-emerald-500 text-white" : "bg-slate-300 text-white"}`}>
                <i className="fas fa-cloud"></i>
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-slate-800 text-sm">Supabase</p>
                <p className="text-[10px] text-slate-500 truncate">
                  {supabaseEnabled ? process.env.NEXT_PUBLIC_SUPABASE_URL : "Belum dikonfigurasi"}
                </p>
              </div>
              <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${supabaseEnabled ? "bg-emerald-200 text-emerald-800" : "bg-slate-200 text-slate-600"}`}>
                {supabaseEnabled ? "TERHUBUNG" : "NONAKTIF"}
              </span>
            </div>
          </div>

          <div>
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Backup & Restore</h4>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={exportAll}
                className="p-4 rounded-xl bg-indigo-50 text-indigo-700 hover:bg-indigo-100 flex flex-col items-center gap-2"
              >
                <i className="fas fa-download text-xl"></i>
                <span className="text-xs font-bold">Export JSON</span>
              </button>
              <label className="p-4 rounded-xl bg-indigo-50 text-indigo-700 hover:bg-indigo-100 flex flex-col items-center gap-2 cursor-pointer">
                <i className="fas fa-upload text-xl"></i>
                <span className="text-xs font-bold">Import JSON</span>
                <input type="file" accept=".json" onChange={importData} className="hidden" />
              </label>
            </div>
          </div>

          {supabaseEnabled && (
            <div>
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Sinkronisasi Supabase</h4>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={syncToSupabase}
                  className="p-4 rounded-xl bg-emerald-50 text-emerald-700 hover:bg-emerald-100 flex flex-col items-center gap-2"
                >
                  <i className="fas fa-cloud-upload-alt text-xl"></i>
                  <span className="text-xs font-bold">Push → Supabase</span>
                </button>
                <button
                  onClick={syncFromSupabase}
                  className="p-4 rounded-xl bg-emerald-50 text-emerald-700 hover:bg-emerald-100 flex flex-col items-center gap-2"
                >
                  <i className="fas fa-cloud-download-alt text-xl"></i>
                  <span className="text-xs font-bold">Pull ← Supabase</span>
                </button>
              </div>
            </div>
          )}

          <div>
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Zona Bahaya</h4>
            <button
              onClick={clearAll}
              className="w-full p-4 rounded-xl bg-rose-50 text-rose-700 hover:bg-rose-100 flex items-center justify-center gap-2"
            >
              <i className="fas fa-trash-alt"></i>
              <span className="text-xs font-bold">Hapus Semua Data Lokal</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
