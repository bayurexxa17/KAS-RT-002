"use client";

import { useEffect, useState } from "react";
import Chart from "chart.js/auto";
import { rupiah, months } from "@/lib/utils";

export function LaporanPage() {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    fetch("/api/data?view=dashboard", { method: "PUT" })
      .then((r) => r.json())
      .then(setData);
  }, []);

  useEffect(() => {
    if (!data) return;
    const lineCtx = document.getElementById("laporanLineChart") as HTMLCanvasElement | null;
    const donutCtx = document.getElementById("laporanDonutChart") as HTMLCanvasElement | null;

    const charts: Chart[] = [];

    if (lineCtx) {
      const saldoAkhir: number[] = [];
      let running = 0;
      months.forEach((_, i) => {
        const m = i.toString().padStart(2, "0");
        running += data.monthly[m].masuk - data.monthly[m].keluar;
        saldoAkhir.push(running);
      });

      const g = lineCtx.getContext("2d")!.createLinearGradient(0, 0, 0, 200);
      g.addColorStop(0, "rgba(99,102,241,0.3)");
      g.addColorStop(1, "rgba(99,102,241,0)");

      charts.push(
        new Chart(lineCtx, {
          type: "line",
          data: {
            labels: months,
            datasets: [
              {
                label: "Saldo Akhir",
                data: saldoAkhir,
                borderColor: "#6366f1",
                backgroundColor: g,
                borderWidth: 4,
                tension: 0.3,
                fill: true,
                pointBackgroundColor: "#6366f1",
              },
            ],
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: {
              y: { beginAtZero: true },
            },
          },
        })
      );
    }

    if (donutCtx) {
      const labels = Object.keys(data.categoryBreakdown);
      const values = Object.values(data.categoryBreakdown) as number[];
      charts.push(
        new Chart(donutCtx, {
          type: "doughnut",
          data: {
            labels,
            datasets: [
              {
                data: values,
                backgroundColor: ["#f43f5e", "#f59e0b", "#6366f1", "#10b981", "#cbd5e1", "#8b5cf6"],
                borderWidth: 0,
                hoverOffset: 10,
              },
            ],
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: { position: "bottom", labels: { boxWidth: 12, usePointStyle: true, font: { size: 10 } } },
            },
            cutout: "70%",
          },
        })
      );
    }

    return () => charts.forEach((c) => c.destroy());
  }, [data]);

  const exportCSV = () => {
    if (!data) return;
    const header = "Bulan,Pemasukan,Pengeluaran,Saldo\n";
    const rows = months
      .map((m, i) => {
        const k = i.toString().padStart(2, "0");
        return `${m},${data.monthly[k].masuk},${data.monthly[k].keluar},${data.monthly[k].masuk - data.monthly[k].keluar}`;
      })
      .join("\n");
    const blob = new Blob([header + rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `laporan-${new Date().toISOString().substring(0, 10)}.csv`;
    a.click();
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Laporan Keuangan RT</h2>
          <p className="text-slate-400 text-[10px] font-bold tracking-widest uppercase border-b border-indigo-500 inline-block pb-1">
            REKAPITULASI TRANSPARANSI DANA WARGA
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={exportCSV}
            className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-slate-600 font-bold text-xs flex items-center gap-2 hover:bg-slate-50"
          >
            <i className="far fa-file-alt"></i> EXPORT CSV
          </button>
          <button
            onClick={() => window.print()}
            className="px-6 py-2 bg-slate-800 text-white rounded-xl font-bold text-xs shadow-lg flex items-center gap-2"
          >
            <i className="fas fa-file-download"></i> DOWNLOAD PDF
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-8 rounded-[30px] border-l-[6px] border-emerald-400 card-shadow">
          <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-400 mb-4">
            <i className="fas fa-long-arrow-alt-up"></i>
          </div>
          <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest mb-1">
            Total Pemasukan
          </p>
          <h3 className="text-xl font-black text-slate-800">{rupiah(data?.pemasukan ?? 0)}</h3>
        </div>
        <div className="bg-white p-8 rounded-[30px] border-l-[6px] border-rose-400 card-shadow">
          <div className="w-12 h-12 bg-rose-50 rounded-2xl flex items-center justify-center text-rose-400 mb-4">
            <i className="fas fa-long-arrow-alt-down"></i>
          </div>
          <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest mb-1">
            Total Pengeluaran
          </p>
          <h3 className="text-xl font-black text-slate-800">{rupiah(data?.pengeluaran ?? 0)}</h3>
        </div>
        <div className="bg-white p-8 rounded-[30px] border-l-[6px] border-indigo-500 card-shadow">
          <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-500 mb-4">
            <i className="fas fa-wallet"></i>
          </div>
          <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest mb-1">Saldo</p>
          <h3 className="text-xl font-black text-slate-800">{rupiah(data?.saldo ?? 0)}</h3>
        </div>
        <div className="bg-white p-8 rounded-[30px] border-l-[6px] border-orange-400 card-shadow">
          <div className="w-12 h-12 bg-orange-50 rounded-2xl flex items-center justify-center text-orange-400 mb-4">
            <i className="fas fa-info-circle"></i>
          </div>
          <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest mb-1">
            Tagihan Pending
          </p>
          <h3 className="text-xl font-black text-slate-800">{data?.tagihanPending ?? 0}</h3>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-8 rounded-[30px] card-shadow">
          <h3 className="font-bold text-slate-800 mb-6 flex items-center gap-3">
            <i className="fas fa-chart-area text-indigo-400"></i> Aliran Kas Bulanan
          </h3>
          <div className="h-[300px]">
            <canvas id="laporanLineChart"></canvas>
          </div>
        </div>
        <div className="bg-white p-8 rounded-[30px] card-shadow">
          <h3 className="font-bold text-slate-800 mb-6 flex items-center gap-3">
            <i className="fas fa-chart-pie text-orange-400"></i> Alokasi Pengeluaran
          </h3>
          <div className="h-[300px]">
            <canvas id="laporanDonutChart"></canvas>
          </div>
        </div>
      </div>

      <div className="bg-indigo-50 p-10 rounded-[30px] flex flex-col md:flex-row items-center justify-between border border-indigo-100 gap-4">
        <div className="flex items-center gap-6">
          <div className="w-16 h-16 bg-indigo-600 rounded-3xl flex items-center justify-center text-white shadow-xl">
            <i className="fas fa-file-contract text-2xl"></i>
          </div>
          <div>
            <h4 className="text-xl font-black text-indigo-900 leading-tight">
              Laporan Transparansi Digital
            </h4>
            <p className="text-sm text-indigo-400 font-medium">
              Dibuat otomatis oleh sistem Kas RT untuk memastikan kejujuran dan kepercayaan seluruh warga.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
