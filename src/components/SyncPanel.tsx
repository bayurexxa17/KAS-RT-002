"use client";

import { useEffect, useState } from "react";
import { api, rupiah } from "@/lib/utils";

type SyncHistory = {
  id: number;
  target: string;
  table: string;
  action: string;
  status: string;
  message?: string;
  rows?: number;
  createdAt: string;
};

type Status = {
  supabase: { enabled: boolean; url?: string };
  googleSheets: { enabled: boolean; sheetId?: string };
};

export function SyncPanel({
  onClose,
  notify,
}: {
  onClose: () => void;
  notify: (m: string, t?: "success" | "error") => void;
}) {
  const [status, setStatus] = useState<Status | null>(null);
  const [history, setHistory] = useState<SyncHistory[]>([]);
  const [running, setRunning] = useState(false);

  const load = async () => {
    const [s, h] = await Promise.all([
      api<Status>("/api/sync?action=status"),
      api<SyncHistory[]>("/api/sync?action=history"),
    ]);
    setStatus(s);
    setHistory(h);
  };

  useEffect(() => {
    load();
  }, []);

  const runSync = async (target: string, action: "push" | "pull") => {
    setRunning(true);
    try {
      const res = await api<any>(`/api/sync?target=${target}&action=${action}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      if (res.ok) {
        const ok = res.results.filter((r: any) => r.ok).length;
        const fail = res.results.length - ok;
        notify(`Sinkronisasi selesai: ${ok} berhasil, ${fail} gagal`);
      } else {
        notify("Sinkronisasi gagal", "error");
      }
      await load();
    } catch (e: any) {
      notify(e?.message ?? "Error", "error");
    } finally {
      setRunning(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-end">
      <div className="bg-white w-full max-w-md h-full overflow-y-auto custom-scrollbar">
        <div className="sticky top-0 bg-white border-b border-slate-200 p-6 flex items-center justify-between z-10">
          <div>
            <h3 className="text-xl font-bold text-slate-800">Sinkronisasi Data</h3>
            <p className="text-xs text-slate-400">Kelola koneksi ke layanan eksternal</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-500">
            <i className="fas fa-times"></i>
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Status Services */}
          <div>
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Status Layanan</h4>
            <div className="space-y-3">
              <ServiceCard
                name="Supabase"
                icon="fa-cloud"
                enabled={!!status?.supabase?.enabled}
                detail={status?.supabase?.url ?? "Belum dikonfigurasi"}
              />
              <ServiceCard
                name="Google Sheets"
                icon="fa-table"
                enabled={!!status?.googleSheets?.enabled}
                detail={status?.googleSheets?.sheetId ? `Sheet ID: ${status.googleSheets.sheetId}` : "Belum dikonfigurasi"}
              />
            </div>
          </div>

          {/* Actions */}
          <div>
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">
              Aksi Sinkronisasi
            </h4>
            <div className="grid grid-cols-2 gap-3">
              <button
                disabled={!status?.supabase?.enabled || running}
                onClick={() => runSync("supabase", "push")}
                className="p-4 rounded-xl bg-indigo-50 text-indigo-700 hover:bg-indigo-100 disabled:opacity-40 disabled:cursor-not-allowed flex flex-col items-center gap-2"
              >
                <i className="fas fa-cloud-upload-alt text-xl"></i>
                <span className="text-xs font-bold">Push → Supabase</span>
              </button>
              <button
                disabled={!status?.supabase?.enabled || running}
                onClick={() => runSync("supabase", "pull")}
                className="p-4 rounded-xl bg-indigo-50 text-indigo-700 hover:bg-indigo-100 disabled:opacity-40 disabled:cursor-not-allowed flex flex-col items-center gap-2"
              >
                <i className="fas fa-cloud-download-alt text-xl"></i>
                <span className="text-xs font-bold">Pull ← Supabase</span>
              </button>
              <button
                disabled={!status?.googleSheets?.enabled || running}
                onClick={() => runSync("google_sheets", "push")}
                className="p-4 rounded-xl bg-emerald-50 text-emerald-700 hover:bg-emerald-100 disabled:opacity-40 disabled:cursor-not-allowed flex flex-col items-center gap-2"
              >
                <i className="fas fa-file-export text-xl"></i>
                <span className="text-xs font-bold">Push → Sheets</span>
              </button>
              <button
                disabled={!status?.googleSheets?.enabled || running}
                onClick={() => runSync("google_sheets", "pull")}
                className="p-4 rounded-xl bg-emerald-50 text-emerald-700 hover:bg-emerald-100 disabled:opacity-40 disabled:cursor-not-allowed flex flex-col items-center gap-2"
              >
                <i className="fas fa-file-import text-xl"></i>
                <span className="text-xs font-bold">Pull ← Sheets</span>
              </button>
            </div>
            {running && (
              <div className="mt-3 text-center">
                <div className="inline-block animate-spin rounded-full h-5 w-5 border-b-2 border-indigo-600"></div>
                <p className="text-xs text-slate-500 mt-2">Sinkronisasi sedang berjalan...</p>
              </div>
            )}
          </div>

          {/* History */}
          <div>
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">
              Riwayat Sinkronisasi
            </h4>
            {history.length === 0 ? (
              <p className="text-xs text-slate-400 italic text-center py-6">Belum ada riwayat</p>
            ) : (
              <div className="space-y-2">
                {history.slice(0, 10).map((h) => (
                  <div key={h.id} className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <i className={`fas ${h.target === "SUPABASE" ? "fa-cloud" : "fa-table"} text-xs text-slate-500`}></i>
                        <span className="text-xs font-bold text-slate-700">{h.target}</span>
                        <span className="text-[10px] text-slate-400">•</span>
                        <span className="text-[10px] font-bold text-slate-500 uppercase">{h.action}</span>
                      </div>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${h.status === "SUCCESS" ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"}`}>
                        {h.status}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-[10px] text-slate-500">
                      <span>
                        {h.table} • {h.rows ?? 0} baris
                      </span>
                      <span>{new Date(h.createdAt).toLocaleString("id-ID")}</span>
                    </div>
                    {h.message && <p className="text-[10px] text-rose-500 mt-1 truncate">{h.message}</p>}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function ServiceCard({ name, icon, enabled, detail }: { name: string; icon: string; enabled: boolean; detail: string }) {
  return (
    <div className={`p-4 rounded-xl border ${enabled ? "bg-emerald-50 border-emerald-200" : "bg-slate-50 border-slate-200"} flex items-center gap-3`}>
      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${enabled ? "bg-emerald-500 text-white" : "bg-slate-300 text-white"}`}>
        <i className={`fas ${icon}`}></i>
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-bold text-slate-800 text-sm">{name}</p>
        <p className="text-[10px] text-slate-500 truncate">{detail}</p>
      </div>
      <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${enabled ? "bg-emerald-200 text-emerald-800" : "bg-slate-200 text-slate-600"}`}>
        {enabled ? "TERHUBUNG" : "NONAKTIF"}
      </span>
    </div>
  );
}
