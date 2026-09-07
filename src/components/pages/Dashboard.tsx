"use client";

import { useEffect, useState } from "react";
import Chart from "chart.js/auto";
import { rupiah, months } from "@/lib/utils";
import { getDashboardStats, seedIfEmpty } from "@/lib/store";

export function Dashboard() {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    seedIfEmpty().then(() => getDashboardStats()).then(setData);
  }, []);

  useEffect(() => {
    if (!data) return;
    const ctx = document.getElementById("dashboardChart") as HTMLCanvasElement | null;
    if (!ctx) return;
    const chart = new Chart(ctx, {
      type: "line",
      data: {
        labels: months,
        datasets: [
          {
            label: "Pemasukan",
            data: months.map((_, i) => data.monthly[i.toString().padStart(2, "0")].masuk),
            borderColor: "#6366f1",
            backgroundColor: "rgba(99,102,241,0.15)",
            borderWidth: 3,
            fill: true,
            tension: 0.4,
            pointRadius: 4,
            pointBackgroundColor: "#6366f1",
          },
          {
            label: "Pengeluaran",
            data: months.map((_, i) => data.monthly[i.toString().padStart(2, "0")].keluar),
            borderColor: "#f43f5e",
            borderDash: [8, 5],
            borderWidth: 2,
            fill: false,
            tension: 0.4,
            pointRadius: 3,
            pointBackgroundColor: "#f43f5e",
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { position: "top" } },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              callback: (v) => "Rp" + Number(v) / 1000000 + "Jt",
              font: { size: 10, weight: "bold" },
            },
          },
        },
      },
    });
    return () => chart.destroy();
  }, [data]);

  const stats = [
    { label: "Total Kas RT", value: data ? rupiah(data.saldo) : "Rp 0", icon: "fa-wallet", color: "bg-indigo-500" },
    { label: "Jumlah Warga", value: data ? String(data.totalWarga) : "0", icon: "fa-users", color: "bg-emerald-400" },
    { label: "Tagihan Pending", value: data ? String(data.tagihanPending) : "0", icon: "fa-clock", color: "bg-orange-500" },
    { label: "Pemasukan Total", value: data ? rupiah(data.pemasukan) : "Rp 0", icon: "fa-chart-line", color: "bg-cyan-400" },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-slate-800">Ringkasan Sistem</h2>
        <p className="text-slate-400 text-xs font-medium uppercase tracking-wider">
          Statistik vital Rukun Tetangga hari ini
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {stats.map((s) => (
          <div key={s.label} className="soft-card p-6 card-shadow flex items-center justify-between">
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{s.label}</p>
              <h3 className="text-xl font-black text-slate-800">{s.value}</h3>
            </div>
            <div className={`w-12 h-12 ${s.color} rounded-2xl flex items-center justify-center text-white shadow-lg`}>
              <i className={`fas ${s.icon}`}></i>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 soft-card p-8 card-shadow">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <i className="fas fa-wave-square text-indigo-500"></i>
              <h3 className="font-bold text-slate-800">Visualisasi Arus Kas</h3>
            </div>
            <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-100">
              <span className="text-xs font-bold text-slate-700 px-2">2026</span>
            </div>
          </div>
          <div className="h-[300px]">
            <canvas id="dashboardChart"></canvas>
          </div>
        </div>

        <div className="soft-card p-8 card-shadow">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold text-slate-800">Alokasi Pengeluaran</h3>
          </div>
          {data && Object.keys(data.categoryBreakdown).length > 0 ? (
            <div className="space-y-3">
              {Object.entries(data.categoryBreakdown)
                .sort((a, b) => (b[1] as number) - (a[1] as number))
                .map(([cat, val]) => {
                  const total = Object.values(data.categoryBreakdown).reduce((a: number, b: any) => a + b, 0);
                  const pct = ((val as number) / total) * 100;
                  return (
                    <div key={cat}>
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="font-semibold text-slate-700">{cat}</span>
                        <span className="text-slate-500">{rupiah(val as number)}</span>
                      </div>
                      <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-indigo-500 to-indigo-600" style={{ width: `${pct}%` }}></div>
                      </div>
                    </div>
                  );
                })}
            </div>
          ) : (
            <p className="text-slate-400 text-sm">Belum ada data pengeluaran</p>
          )}
        </div>
      </div>
    </div>
  );
}
