"use client";

import type { PageKey } from "./AppShell";
import { useState } from "react";

const NAV: { key: PageKey; label: string; icon: string }[] = [
  { key: "dashboard", label: "Dashboard", icon: "fa-th-large" },
  { key: "warga", label: "Data Warga", icon: "fa-users" },
  { key: "iuran", label: "Jenis Iuran", icon: "fa-wallet" },
  { key: "pemasukan", label: "Pemasukan", icon: "fa-arrow-circle-down" },
  { key: "pengeluaran", label: "Pengeluaran", icon: "fa-arrow-circle-up" },
  { key: "tagihan", label: "Tagihan", icon: "fa-file-invoice-dollar" },
  { key: "whatsapp", label: "Kirim WhatsApp", icon: "fa-brands fa-whatsapp" },
  { key: "kwitansi", label: "Kwitansi", icon: "fa-receipt" },
  { key: "laporan", label: "Laporan", icon: "fa-chart-line" },
  { key: "marketplace", label: "Marketplace", icon: "fa-store" },
  { key: "pengaturan", label: "Pengaturan", icon: "fa-cog" },
];

export function Sidebar({
  current,
  onSelect,
  open,
  onSyncClick,
}: {
  current: PageKey;
  onSelect: (p: PageKey) => void;
  open: boolean;
  onSyncClick: () => void;
}) {
  return (
    <aside
      className={`bg-white border-r border-slate-200 flex flex-col no-print transition-all duration-300 ${
        open ? "w-64" : "w-0"
      } overflow-hidden`}
    >
      <div className="p-6 border-b border-slate-100 flex items-center gap-3">
        <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center text-white shadow-lg flex-shrink-0">
          <i className="fas fa-home text-xl"></i>
        </div>
        <div>
          <h1 className="font-bold text-slate-800 leading-none">FORUM RT</h1>
          <p className="text-[10px] text-slate-400 mt-1 uppercase tracking-wider">Sistem Kas Digital</p>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto p-4 space-y-1 custom-scrollbar">
        {NAV.map((item) => (
          <button
            key={item.key}
            onClick={() => onSelect(item.key)}
            className={`nav-link w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
              current === item.key
                ? "sidebar-active"
                : "text-slate-600 hover:bg-slate-50"
            }`}
          >
            <i className={`fas ${item.icon} w-5`}></i>
            <span className="font-medium text-sm">{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="p-4 border-t border-slate-100 space-y-2">
        <button
          onClick={onSyncClick}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-indigo-50 text-indigo-700 hover:bg-indigo-100 transition-all"
        >
          <i className="fas fa-sync w-5"></i>
          <span className="font-medium text-sm">Sinkronisasi</span>
        </button>
        <div className="bg-indigo-50 rounded-xl p-4">
          <p className="text-xs text-indigo-600 font-semibold mb-1">Butuh Bantuan?</p>
          <p className="text-[10px] text-indigo-400">Hubungi pengembang untuk support sistem.</p>
        </div>
      </div>
    </aside>
  );
}
