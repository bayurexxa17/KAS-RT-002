"use client";

import { useEffect, useState } from "react";
import { formatDate } from "@/lib/utils";
import * as store from "@/lib/store";

export function KwitansiPage() {
  const [settings, setSettings] = useState<Record<string, string>>({});

  useEffect(() => {
    store.seedIfEmpty().then(() => store.getAll<store.Setting>("settings")).then((rows) => {
      const obj: Record<string, string> = {};
      rows.forEach((r) => {
        obj[r.key] = r.value ?? "";
      });
      setSettings(obj);
    });
  }, []);

  const handlePrint = () => window.print();

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fadeIn">
      <div className="flex items-center justify-between no-print">
        <div className="text-center flex-1">
          <h2 className="text-2xl font-bold text-slate-800 leading-tight">Pratinjau Kwitansi</h2>
          <p className="text-slate-400 text-[10px] font-bold tracking-widest uppercase">
            Dokumen Bukti Pembayaran Sah
          </p>
        </div>
        <button
          onClick={handlePrint}
          className="px-8 py-2 bg-slate-800 text-white rounded-lg font-bold text-sm shadow-lg flex items-center gap-3"
        >
          <i className="fas fa-print"></i> CETAK
        </button>
      </div>

      <div className="bg-white rounded-[40px] border border-slate-100 card-shadow p-12 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8">
          <p className="text-[10px] font-bold text-slate-300 border px-3 py-1 rounded-full uppercase tracking-widest">
            No: {new Date().toISOString().substring(0, 10).replace(/-/g, "")}
          </p>
        </div>

        <div className="flex items-center justify-between mb-16">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-emerald-500 rounded-3xl flex items-center justify-center text-white shadow-xl shadow-emerald-200">
              <i className="fas fa-money-bill-wave text-2xl"></i>
            </div>
            <div>
              <h1 className="text-2xl font-black text-slate-800 leading-none">KWITANSI RESMI</h1>
              <p className="text-[10px] text-indigo-400 font-bold uppercase tracking-widest mt-2">
                Sistem Kas Digital RT
              </p>
            </div>
          </div>
          <div className="text-right">
            <h2 className="text-xl font-black text-slate-800">
              RT {settings.rt ?? "00"} / RW {settings.rw ?? "00"}
            </h2>
            <p className="text-[10px] text-slate-400 font-medium uppercase mt-1">
              {settings.address ?? ""}
            </p>
          </div>
        </div>

        <div className="space-y-12">
          <div className="flex items-baseline gap-8">
            <p className="text-[10px] font-bold text-slate-300 uppercase w-32 tracking-widest">Diterima Dari</p>
            <div className="flex-1 border-b-2 border-slate-100 text-xl font-black text-slate-800 pb-2 min-h-[2rem]">
              [Nama Penerima]
            </div>
          </div>
          <div className="flex items-baseline gap-8">
            <p className="text-[10px] font-bold text-slate-300 uppercase w-32 tracking-widest">Uang Sejumlah</p>
            <div className="flex-1 border-b-2 border-slate-100 text-xl font-bold text-slate-800 italic pb-2 min-h-[2rem]">
              [Nominal dalam huruf]
            </div>
          </div>
          <div className="flex items-baseline gap-8">
            <p className="text-[10px] font-bold text-slate-300 uppercase w-32 tracking-widest">Keperluan</p>
            <div className="flex-1 border-b-2 border-slate-100 text-sm font-bold text-slate-600 pb-2 min-h-[2rem]">
              [Pembayaran iuran / donasi / dll]
            </div>
          </div>
        </div>

        <div className="mt-20 flex items-end justify-between">
          <div className="bg-indigo-50/50 p-8 rounded-[30px] border border-indigo-100 w-64 text-center">
            <p className="text-[10px] font-bold text-indigo-300 uppercase mb-2 tracking-widest">Total Terbayar</p>
            <h3 className="text-3xl font-black text-indigo-600">Rp 0</h3>
            <span className="mt-3 px-4 py-1 bg-amber-100 text-amber-700 rounded-full text-[10px] font-bold uppercase tracking-wider inline-block">
              Template
            </span>
          </div>
          <div className="text-center pb-4 relative">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-16">
              {formatDate(new Date().toISOString())}
            </p>
            <h4 className="text-lg font-black text-slate-800 underline decoration-indigo-200 underline-offset-8 decoration-4">
              {settings.bendahara ?? "Bendahara RT"}
            </h4>
            <p className="text-[10px] font-bold text-slate-300 uppercase mt-2">Bendahara RT</p>
            <div className="absolute -right-10 bottom-0 opacity-20 rotate-12">
              <div className="w-24 h-24 border-4 border-emerald-400 rounded-full flex items-center justify-center text-emerald-400 font-bold text-xs text-center p-2">
                DIGITAL STAMP
              </div>
            </div>
          </div>
        </div>

        <div className="absolute inset-0 pointer-events-none flex items-center justify-center opacity-[0.02]">
          <i className="fas fa-check-circle text-[400px]"></i>
        </div>
      </div>

      <div className="flex items-center justify-between no-print px-4">
        <p className="text-[10px] text-slate-300 font-medium italic">
          Kwitansi ini dihasilkan secara otomatis oleh Sistem Kas RT Digital dan merupakan bukti pembayaran yang sah.
        </p>
      </div>
    </div>
  );
}
