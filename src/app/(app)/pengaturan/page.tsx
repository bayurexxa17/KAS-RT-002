"use client";
import { apiFetch } from "@/lib/api";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  Save,
  Settings as SettingsIcon,
  Users,
  ImagePlus,
  Trash2,
  KeyRound,
  X,
} from "lucide-react";
import {
  Card,
  PageHeader,
  Button,
  Field,
  inputCls,
  Spinner,
  Badge,
  Modal,
} from "@/components/ui";
import { useMe } from "@/components/AppShell";
import { tanggalID } from "@/lib/format";

type UserRow = {
  id: number;
  username: string;
  role: string;
  nama: string | null;
  noRumah: string | null;
  createdAt: string;
};

function ImageUpload({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (dataUrl: string) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [err, setErr] = useState("");

  function pick(file: File | undefined) {
    setErr("");
    if (!file) return;
    if (file.size > 500 * 1024) {
      setErr("Ukuran maksimal 500 KB");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => onChange(String(reader.result || ""));
    reader.readAsDataURL(file);
  }

  return (
    <div>
      <p className="mb-1.5 text-[11px] font-extrabold uppercase tracking-widest text-slate-400">
        {label}
      </p>
      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp"
        className="hidden"
        onChange={(e) => pick(e.target.files?.[0])}
      />
      {value ? (
        <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 p-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={value}
            alt={label}
            className="mx-auto max-h-40 rounded-xl object-contain"
          />
          <div className="mt-3 flex justify-center gap-2">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="rounded-xl bg-white px-3 py-1.5 text-xs font-extrabold text-slate-600 shadow-sm border border-slate-200 hover:bg-slate-50"
            >
              Ganti Gambar
            </button>
            <button
              type="button"
              onClick={() => onChange("")}
              className="rounded-xl bg-rose-50 px-3 py-1.5 text-xs font-extrabold text-rose-500 hover:bg-rose-100"
            >
              Hapus
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="flex h-40 w-full flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50/50 text-slate-300 transition hover:border-indigo-300 hover:text-indigo-400"
        >
          <ImagePlus size={28} />
          <span className="text-xs font-bold">Klik untuk upload gambar</span>
          <span className="text-[10px] font-semibold">PNG/JPG maks. 500 KB</span>
        </button>
      )}
      {err && <p className="mt-1 text-xs font-bold text-rose-500">{err}</p>}
    </div>
  );
}

export default function PengaturanPage() {
  const me = useMe();
  const [tab, setTab] = useState<"aplikasi" | "user">("aplikasi");
  const [form, setForm] = useState<Record<string, string> | null>(null);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");

  // user management
  const [userRows, setUserRows] = useState<UserRow[] | null>(null);
  const [resetUser, setResetUser] = useState<UserRow | null>(null);
  const [newPass, setNewPass] = useState("");
  const [resetMsg, setResetMsg] = useState("");

  useEffect(() => {
    apiFetch("/api/settings")
      .then((r) => (r.ok ? r.json() : { data: {} }))
      .then((d) => setForm(d.data || {}));
  }, []);

  const loadUsers = useCallback(async () => {
    const res = await apiFetch("/api/users");
    if (res.ok) setUserRows((await res.json()).data);
  }, []);

  useEffect(() => {
    if (tab === "user" && !userRows) loadUsers();
  }, [tab, userRows, loadUsers]);

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

  async function doReset(e: React.FormEvent) {
    e.preventDefault();
    if (!resetUser) return;
    setResetMsg("");
    const res = await apiFetch(`/api/users/${resetUser.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password: newPass }),
    });
    const data = await res.json();
    if (!res.ok) {
      setResetMsg(data.error || "Gagal reset password");
      return;
    }
    setResetUser(null);
    setNewPass("");
    alert("Password berhasil direset!");
  }

  async function hapusUser(u: UserRow) {
    if (!confirm(`Hapus akun @${u.username}? Warga terkait tetap tersimpan.`)) return;
    const res = await apiFetch(`/api/users/${u.id}`, { method: "DELETE" });
    const data = await res.json();
    if (!res.ok) {
      alert(data.error || "Gagal menghapus");
      return;
    }
    loadUsers();
  }

  if (!form) return <Spinner />;

  const set = (k: string, v: string) => setForm({ ...form, [k]: v });

  return (
    <div className="fade-up max-w-4xl">
      <PageHeader title="Pengaturan" subtitle="Konfigurasi aplikasi & pengguna" />

      {/* Tabs */}
      <div className="mb-6 flex gap-1 border-b border-slate-200">
        <button
          onClick={() => setTab("aplikasi")}
          className={`flex items-center gap-2 border-b-2 px-4 py-2.5 text-sm font-extrabold transition ${
            tab === "aplikasi"
              ? "border-indigo-500 text-indigo-600"
              : "border-transparent text-slate-400 hover:text-slate-600"
          }`}
        >
          <SettingsIcon size={15} /> Aplikasi
        </button>
        <button
          onClick={() => setTab("user")}
          className={`flex items-center gap-2 border-b-2 px-4 py-2.5 text-sm font-extrabold transition ${
            tab === "user"
              ? "border-indigo-500 text-indigo-600"
              : "border-transparent text-slate-400 hover:text-slate-600"
          }`}
        >
          <Users size={15} /> User Management
        </button>
      </div>

      {tab === "aplikasi" ? (
        <form onSubmit={save} className="space-y-5">
          <Card className="space-y-4 p-6">
            <h2 className="text-base font-extrabold text-slate-800">
              Identitas Aplikasi
            </h2>
            <Field label="Nama Aplikasi">
              <input
                className={inputCls}
                value={form.namaAplikasi || ""}
                onChange={(e) => set("namaAplikasi", e.target.value)}
                placeholder="KAS RT — Blok Mawar RT 002 RW 014"
              />
            </Field>
            <Field label="Keterangan Aplikasi">
              <textarea
                className={`${inputCls} min-h-24`}
                value={form.keteranganAplikasi || ""}
                onChange={(e) => set("keteranganAplikasi", e.target.value)}
                placeholder="Sistem Manajemen Kas RT"
              />
            </Field>
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              <ImageUpload
                label="Logo Aplikasi"
                value={form.logoAplikasi || ""}
                onChange={(v) => set("logoAplikasi", v)}
              />
              <ImageUpload
                label="QRIS Pembayaran (Gambar)"
                value={form.qrisPembayaran || ""}
                onChange={(v) => set("qrisPembayaran", v)}
              />
            </div>
            <Field label="Nomor Rekening Lengkap">
              <input
                className={inputCls}
                value={form.rekening || ""}
                onChange={(e) => set("rekening", e.target.value)}
                placeholder="Bank BCA 123456789 a.n. Kas RT"
              />
            </Field>
          </Card>

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
            </div>
          </Card>

          <Card className="space-y-4 p-6">
            <h2 className="text-base font-extrabold text-slate-800">
              Template Pesan WhatsApp
            </h2>
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
      ) : (
        <Card className="overflow-hidden">
          {!userRows ? (
            <Spinner />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-100 text-[10px] font-extrabold uppercase tracking-widest text-slate-400">
                    <th className="px-5 py-3">Username</th>
                    <th className="px-5 py-3">Warga</th>
                    <th className="px-5 py-3">Role</th>
                    <th className="px-5 py-3">Terdaftar</th>
                    <th className="px-5 py-3 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {userRows.map((u) => (
                    <tr
                      key={u.id}
                      className="border-b border-slate-50 transition hover:bg-slate-50/60"
                    >
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-indigo-50 text-xs font-extrabold text-indigo-500">
                            {u.username.charAt(0).toUpperCase()}
                          </div>
                          <span className="font-extrabold text-slate-700">
                            @{u.username}
                          </span>
                        </div>
                      </td>
                      <td className="px-5 py-3.5 font-bold text-slate-500">
                        {u.nama ? `${u.nama} (${u.noRumah})` : "—"}
                      </td>
                      <td className="px-5 py-3.5">
                        <Badge color={u.role === "admin" ? "indigo" : "green"}>
                          {u.role === "admin" ? "Admin RT" : "Warga"}
                        </Badge>
                      </td>
                      <td className="px-5 py-3.5 font-bold text-slate-500">
                        {tanggalID(u.createdAt)}
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex justify-end gap-1">
                          <button
                            onClick={() => {
                              setResetUser(u);
                              setNewPass("");
                              setResetMsg("");
                            }}
                            title="Reset password"
                            className="rounded-lg p-2 text-slate-400 hover:bg-amber-50 hover:text-amber-500"
                          >
                            <KeyRound size={15} />
                          </button>
                          {u.id !== me?.id && (
                            <button
                              onClick={() => hapusUser(u)}
                              title="Hapus akun"
                              className="rounded-lg p-2 text-slate-400 hover:bg-rose-50 hover:text-rose-500"
                            >
                              <Trash2 size={15} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      )}

      <Modal
        open={!!resetUser}
        onClose={() => setResetUser(null)}
        title={`Reset Password @${resetUser?.username || ""}`}
      >
        <form onSubmit={doReset} className="space-y-4">
          <Field label="Password Baru">
            <input
              type="text"
              className={inputCls}
              value={newPass}
              onChange={(e) => setNewPass(e.target.value)}
              placeholder="Minimal 6 karakter"
            />
          </Field>
          {resetMsg && (
            <p className="rounded-xl bg-rose-50 px-4 py-2.5 text-xs font-bold text-rose-500">
              {resetMsg}
            </p>
          )}
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="secondary" onClick={() => setResetUser(null)}>
              <X size={14} /> Batal
            </Button>
            <Button type="submit">
              <KeyRound size={14} /> Reset Password
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
