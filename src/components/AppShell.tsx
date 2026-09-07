"use client";

import { useEffect, useState } from "react";
import { Sidebar } from "./Sidebar";
import { TopBar } from "./TopBar";
import { Dashboard } from "./pages/Dashboard";
import { WargaPage } from "./pages/WargaPage";
import { IuranPage } from "./pages/IuranPage";
import { TransaksiPage } from "./pages/TransaksiPage";
import { TagihanPage } from "./pages/TagihanPage";
import { WhatsAppPage } from "./pages/WhatsAppPage";
import { KwitansiPage } from "./pages/KwitansiPage";
import { LaporanPage } from "./pages/LaporanPage";
import { MarketplacePage } from "./pages/MarketplacePage";
import { PengaturanPage } from "./pages/PengaturanPage";
import { SyncPanel } from "./SyncPanel";

export type PageKey =
  | "dashboard"
  | "warga"
  | "iuran"
  | "pemasukan"
  | "pengeluaran"
  | "tagihan"
  | "whatsapp"
  | "kwitansi"
  | "laporan"
  | "marketplace"
  | "pengaturan";

const PAGE_TITLES: Record<PageKey, string> = {
  dashboard: "ADMIN / DASHBOARD",
  warga: "ADMIN / DATA WARGA",
  iuran: "ADMIN / JENIS IURAN",
  pemasukan: "ADMIN / PEMASUKAN",
  pengeluaran: "ADMIN / PENGELUARAN",
  tagihan: "ADMIN / MONITORING TAGIHAN",
  whatsapp: "ADMIN / KIRIM WHATSAPP",
  kwitansi: "ADMIN / PRATINJAU KWITANSI",
  laporan: "ADMIN / LAPORAN KEUANGAN",
  marketplace: "ADMIN / MARKETPLACE WARGA",
  pengaturan: "ADMIN / PENGATURAN",
};

export function AppShell() {
  const [page, setPage] = useState<PageKey>("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [syncOpen, setSyncOpen] = useState(false);
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);

  const notify = (msg: string, type: "success" | "error" = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    const handler = () => setSidebarOpen((o) => !o);
    window.addEventListener("toggle-sidebar", handler);
    return () => window.removeEventListener("toggle-sidebar", handler);
  }, []);

  const renderPage = () => {
    switch (page) {
      case "dashboard":
        return <Dashboard />;
      case "warga":
        return <WargaPage notify={notify} />;
      case "iuran":
        return <IuranPage notify={notify} />;
      case "pemasukan":
        return <TransaksiPage tipe="MASUK" notify={notify} />;
      case "pengeluaran":
        return <TransaksiPage tipe="KELUAR" notify={notify} />;
      case "tagihan":
        return <TagihanPage notify={notify} />;
      case "whatsapp":
        return <WhatsAppPage />;
      case "kwitansi":
        return <KwitansiPage />;
      case "laporan":
        return <LaporanPage />;
      case "marketplace":
        return <MarketplacePage notify={notify} />;
      case "pengaturan":
        return <PengaturanPage notify={notify} />;
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      <Sidebar
        current={page}
        onSelect={(p) => setPage(p)}
        open={sidebarOpen}
        onSyncClick={() => setSyncOpen(true)}
      />
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        <TopBar title={PAGE_TITLES[page]} onSyncClick={() => setSyncOpen(true)} />
        <div id="content-container" className="flex-1 overflow-y-auto p-6 md:p-8 custom-scrollbar">
          <div key={page} className="animate-fadeIn">
            {renderPage()}
          </div>
        </div>
      </main>

      {syncOpen && <SyncPanel onClose={() => setSyncOpen(false)} notify={notify} />}

      {toast && (
        <div
          className={`fixed bottom-6 right-6 z-[100] px-6 py-3 rounded-xl shadow-2xl text-white text-sm font-bold ${
            toast.type === "success" ? "bg-emerald-500" : "bg-rose-500"
          }`}
        >
          <i className={`fas ${toast.type === "success" ? "fa-check-circle" : "fa-exclamation-circle"} mr-2`}></i>
          {toast.msg}
        </div>
      )}
    </div>
  );
}
