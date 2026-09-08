"use client";
import { apiFetch } from "@/lib/api";

import { useEffect, useState } from "react";
import { Save } from "lucide-react";
import {
  Card,
  PageHeader,
  Button,
  Field,
  inputCls,
  Spinner,
} from "@/components/ui";

export default function PengaturanPage() {
  const [form, setForm] = useState<Record<string, string> | null>(null);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    apiFetch("/api/settings")
      .then((r) => (r.ok ? r.json() : { data: {} }))
      .then((d) => setForm(d.data || {}));
  }, []);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (!form) return;
    setSaving(true);
    setMsg("");
    const res = await apiFetch("/api/settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setSaving(false);
    setMsg(res.ok ? "✓ Pengaturan berhasil disimpan" : "Gagal menyimpan pengaturan");
  }

  if (!form) return <Spinner />;

  const set = (k: string, v: string) => setForm({ ...form, [k]: v });

  return (
    <div className="fade-up max-w-3xl">
      <PageHeader title="Pengaturan" subtitle="Identitas & konfigurasi sistem kas RT" />

      <form onSubmit={save} className="space-y-5">
        <Card className="space-y-4 p-6">
          <h2 className="text-base font-extrabold text-slate-800">Identitas RT</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Nama RT">
              <input className={inputCls} value={form.namaRt || ""} onChange={(e) => set("namaRt", e.target.value)} />
            </Field>
            <Field label="Nama Perumahan">
              <input className={inputCls} value={form.namaPerumahan || ""} onChange={(e) => set("namaPerumahan", e.target.value)} />
            </Field>
            <Field label="Nama Ketua RT">
              <input className={inputCls} value={form.namaKetua || ""} onChange={(e) => set("namaKetua", e.target.value)} />
            </Field>
            <Field label="Nama Bendahara">
              <input className={inputCls} value={form.namaBendahara || ""} onChange={(e) => set("namaBendahara", e.target.value)} />
            </Field>
            <Field label="Telepon Bendahara">
              <input className={inputCls} value={form.teleponBendahara || ""} onChange={(e) => set("teleponBendahara", e.target.value)} placeholder="08xxxxxxxxxx" />
            </Field>
            <Field label="Rekening Kas RT">
              <input className={inputCls} value={form.rekening || ""} onChange={(e) => set("rekening", e.target.value)} placeholder="BCA 1234567890 a.n. Kas RT" />
            </Field>
          </div>
        </Card>

        <Card className="space-y-4 p-6">
          <h2 className="text-base font-extrabold text-slate-800">Template Pesan WhatsApp</h2>
          <Field label="Pesan Pengingat (placeholder: {nama} {iuran} {periode} {nominal})">
            <textarea
              className={`${inputCls} min-h-32`}
              value={form.pesanWa || ""}
              onChange={(e) => set("pesanWa", e.target.value)}
            />
          </Field>
        </Card>

        <div className="flex items-center gap-4">
          <Button type="submit" disabled={saving}>
            <Save size={15} /> {saving ? "Menyimpan..." : "Simpan Pengaturan"}
          </Button>
          {msg && <p className="text-sm font-extrabold text-emerald-500">{msg}</p>}
        </div>
      </form>
    </div>
  );
}
