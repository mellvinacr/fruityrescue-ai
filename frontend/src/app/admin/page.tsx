"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { isAdmin, isLoggedIn, getUser, clearToken } from "@/lib/auth";
import { getDashboardStats, getFruits, getRecipients, createRecipient, updateRecipient, deleteRecipient } from "@/lib/api";
import { BarChart3, Apple, Users, FileText, LogOut, Plus, X } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

type Tab = "overview" | "donasi" | "penerima" | "laporan";

export default function AdminPage() {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("overview");
  const [stats, setStats] = useState<any>(null);
  const [fruits, setFruits] = useState<any[]>([]);
  const [recipients, setRecipients] = useState<any[]>([]);
  const [user, setUser] = useState<any>(null);
  const [filterStatus, setFilterStatus] = useState("");
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editRec, setEditRec] = useState<any>(null);
  const [recForm, setRecForm] = useState({ name: "", type: "orphanage", address: "", contact: "", capacity_kg: 100 });

  useEffect(() => {
    if (!isLoggedIn() || !isAdmin()) { router.push("/login"); return; }
    setUser(getUser());
    getDashboardStats().then(setStats).catch(() => {});
    getFruits().then(setFruits).catch(() => {});
    getRecipients().then(setRecipients).catch(() => {});
  }, [router]);

  const filteredFruits = fruits.filter(f => {
    if (filterStatus && f.status !== filterStatus) return false;
    if (search && !f.donor_name?.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const handleSaveRecipient = async () => {
    try {
      if (editRec) {
        await updateRecipient(editRec.id, recForm);
      } else {
        await createRecipient(recForm);
      }
      setShowModal(false);
      setEditRec(null);
      setRecForm({ name: "", type: "orphanage", address: "", contact: "", capacity_kg: 100 });
      getRecipients().then(setRecipients);
    } catch (e) { alert("Gagal menyimpan"); }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Nonaktifkan penerima ini?")) return;
    await deleteRecipient(id);
    getRecipients().then(setRecipients);
  };

  const openEdit = (r: any) => {
    setEditRec(r);
    setRecForm({ name: r.name, type: r.type, address: r.address, contact: r.contact || "", capacity_kg: r.capacity_kg });
    setShowModal(true);
  };

  const navItems: { id: Tab; icon: React.ReactNode; label: string }[] = [
    { id: "overview", icon: <BarChart3 size={18} />, label: "Overview" },
    { id: "donasi", icon: <Apple size={18} />, label: "Semua Donasi" },
    { id: "penerima", icon: <Users size={18} />, label: "Penerima" },
    { id: "laporan", icon: <FileText size={18} />, label: "Laporan" },
  ];

  const Badge = ({ status }: { status: string }) => {
    const c = status === "fresh" ? "bg-green-100 text-green-800" : status === "rotten" ? "bg-red-100 text-red-800" : "bg-amber-100 text-amber-700";
    return <span className={`text-xs font-semibold px-3 py-1 rounded-full ${c}`}>{status.toUpperCase()}</span>;
  };

  const TypeBadge = ({ type }: { type: string }) => {
    const c = type === "orphanage" ? "bg-green-100 text-green-800" : type === "livestock" ? "bg-blue-100 text-blue-700" : "bg-amber-100 text-amber-700";
    const label = type === "orphanage" ? "Panti" : type === "livestock" ? "Peternak" : "Kompos";
    return <span className={`text-xs font-semibold px-3 py-1 rounded-full ${c}`}>{label}</span>;
  };

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="w-64 bg-green-900 text-white flex flex-col fixed h-full">
        <div className="p-6 font-[var(--font-heading)] font-bold text-xl">🍊 FruityRescue</div>
        <nav className="flex-1 px-3 space-y-1">
          {navItems.map(n => (
            <button key={n.id} onClick={() => setTab(n.id)} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${tab === n.id ? "bg-green-800" : "hover:bg-green-800/50"}`}>
              {n.icon} {n.label}
            </button>
          ))}
        </nav>
        <div className="p-4 border-t border-green-800">
          <div className="text-sm font-medium">{user?.name}</div>
          <div className="text-xs text-green-300">{user?.email}</div>
          <button onClick={() => { clearToken(); router.push("/login"); }} className="flex items-center gap-2 text-sm text-green-300 hover:text-white mt-3">
            <LogOut size={14} /> Keluar
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="ml-64 flex-1 bg-gray-50 p-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Selamat datang, {user?.name}</h1>
          <p className="text-sm text-gray-500">{new Date().toLocaleDateString("id-ID", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}</p>
        </div>

        {/* OVERVIEW */}
        {tab === "overview" && stats && (
          <>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
              {[
                { label: "Total Buah", value: stats.total_fruits, color: "text-gray-900" },
                { label: "Segar", value: stats.fresh_count, color: "text-green-700" },
                { label: "Busuk", value: stats.rotten_count, color: "text-orange-600" },
                { label: "Pending", value: stats.pending_count, color: "text-amber-600" },
                { label: "Total kg", value: `${stats.total_kg?.toFixed(1)}`, color: "text-blue-700" },
              ].map((s, i) => (
                <div key={i} className="bg-white rounded-2xl shadow-sm border p-5">
                  <div className="text-sm text-gray-500 mb-1">{s.label}</div>
                  <div className={`text-2xl font-bold ${s.color}`}>{s.value}</div>
                </div>
              ))}
            </div>
            <div className="bg-white rounded-2xl shadow-sm border p-6 mb-8">
              <h3 className="font-bold text-gray-900 mb-4">Donasi 7 Hari Terakhir</h3>
              <ResponsiveContainer width="100%" height={250}>
                <AreaChart data={stats.daily_donations}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="date" tick={{ fontSize: 11 }} tickFormatter={v => v?.slice(5)} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Area type="monotone" dataKey="fresh_kg" stroke="#22c55e" fill="#dcfce7" name="Segar" />
                  <Area type="monotone" dataKey="rotten_kg" stroke="#f97316" fill="#ffedd5" name="Busuk" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <div className="bg-white rounded-2xl shadow-sm border overflow-hidden">
              <div className="p-4 border-b font-bold text-gray-900">Donasi Terbaru</div>
              <table className="w-full text-sm">
                <thead><tr className="bg-gray-50 text-gray-500"><th className="p-3 text-left">Foto</th><th className="p-3 text-left">Donatur</th><th className="p-3 text-left">Buah</th><th className="p-3 text-left">Berat</th><th className="p-3 text-left">Status</th><th className="p-3 text-left">Waktu</th></tr></thead>
                <tbody>{fruits.slice(0, 10).map(f => (
                  <tr key={f.id} className="border-t hover:bg-gray-50">
                    <td className="p-3">{f.photo_url ? <img src={f.photo_url} className="w-12 h-12 rounded-lg object-cover" alt="" /> : <div className="w-12 h-12 bg-gray-100 rounded-lg" />}</td>
                    <td className="p-3 font-medium">{f.donor_name || "Anonim"}</td>
                    <td className="p-3">{f.fruit_name || "-"}</td>
                    <td className="p-3">{f.quantity_kg} kg</td>
                    <td className="p-3"><Badge status={f.status} /></td>
                    <td className="p-3 text-gray-500">{new Date(f.created_at).toLocaleDateString("id-ID")}</td>
                  </tr>
                ))}</tbody>
              </table>
            </div>
          </>
        )}

        {/* DONASI */}
        {tab === "donasi" && (
          <div className="bg-white rounded-2xl shadow-sm border overflow-hidden">
            <div className="p-4 border-b flex gap-3 flex-wrap">
              <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="px-3 py-2 border rounded-lg text-sm">
                <option value="">Semua Status</option>
                <option value="fresh">Fresh</option>
                <option value="rotten">Rotten</option>
                <option value="pending">Pending</option>
              </select>
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Cari donatur..." className="px-3 py-2 border rounded-lg text-sm flex-1" />
            </div>
            <table className="w-full text-sm">
              <thead><tr className="bg-gray-50 text-gray-500"><th className="p-3 text-left">Foto</th><th className="p-3 text-left">Donatur</th><th className="p-3 text-left">Buah</th><th className="p-3 text-left">Berat</th><th className="p-3 text-left">Status</th><th className="p-3 text-left">Alokasi</th><th className="p-3 text-left">Tanggal</th></tr></thead>
              <tbody>{filteredFruits.map(f => (
                <tr key={f.id} className="border-t hover:bg-gray-50">
                  <td className="p-3">{f.photo_url ? <img src={f.photo_url} className="w-12 h-12 rounded-lg object-cover" alt="" /> : <div className="w-12 h-12 bg-gray-100 rounded-lg" />}</td>
                  <td className="p-3 font-medium">{f.donor_name || "Anonim"}</td>
                  <td className="p-3">{f.fruit_name || "-"}</td>
                  <td className="p-3">{f.quantity_kg} kg</td>
                  <td className="p-3"><Badge status={f.status} /></td>
                  <td className="p-3">{f.ai_recommendation || "-"}</td>
                  <td className="p-3 text-gray-500">{new Date(f.created_at).toLocaleDateString("id-ID")}</td>
                </tr>
              ))}</tbody>
            </table>
          </div>
        )}

        {/* PENERIMA */}
        {tab === "penerima" && (
          <>
            <div className="flex justify-end mb-4">
              <button onClick={() => { setEditRec(null); setRecForm({ name: "", type: "orphanage", address: "", contact: "", capacity_kg: 100 }); setShowModal(true); }} className="bg-green-700 hover:bg-green-800 text-white font-semibold px-5 py-2.5 rounded-xl text-sm flex items-center gap-2">
                <Plus size={16} /> Tambah Penerima
              </button>
            </div>
            <div className="bg-white rounded-2xl shadow-sm border overflow-hidden">
              <table className="w-full text-sm">
                <thead><tr className="bg-gray-50 text-gray-500"><th className="p-3 text-left">Nama</th><th className="p-3 text-left">Tipe</th><th className="p-3 text-left">Alamat</th><th className="p-3 text-left">Kapasitas</th><th className="p-3 text-left">Aksi</th></tr></thead>
                <tbody>{recipients.map(r => (
                  <tr key={r.id} className="border-t hover:bg-gray-50">
                    <td className="p-3 font-medium">{r.name}</td>
                    <td className="p-3"><TypeBadge type={r.type} /></td>
                    <td className="p-3 text-gray-600">{r.address}</td>
                    <td className="p-3">{r.capacity_kg} kg</td>
                    <td className="p-3 flex gap-2">
                      <button onClick={() => openEdit(r)} className="text-blue-600 hover:underline text-xs">Edit</button>
                      <button onClick={() => handleDelete(r.id)} className="text-red-600 hover:underline text-xs">Hapus</button>
                    </td>
                  </tr>
                ))}</tbody>
              </table>
            </div>

            {/* Modal */}
            {showModal && (
              <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
                <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-bold text-gray-900">{editRec ? "Edit Penerima" : "Tambah Penerima"}</h3>
                    <button onClick={() => setShowModal(false)}><X size={20} /></button>
                  </div>
                  <div className="space-y-4">
                    <input value={recForm.name} onChange={e => setRecForm({ ...recForm, name: e.target.value })} placeholder="Nama" className="w-full px-4 py-3 border rounded-xl" />
                    <select value={recForm.type} onChange={e => setRecForm({ ...recForm, type: e.target.value })} className="w-full px-4 py-3 border rounded-xl">
                      <option value="orphanage">Panti Asuhan</option>
                      <option value="livestock">Peternak</option>
                      <option value="compost">Kompos</option>
                    </select>
                    <input value={recForm.address} onChange={e => setRecForm({ ...recForm, address: e.target.value })} placeholder="Alamat" className="w-full px-4 py-3 border rounded-xl" />
                    <input value={recForm.contact} onChange={e => setRecForm({ ...recForm, contact: e.target.value })} placeholder="Kontak" className="w-full px-4 py-3 border rounded-xl" />
                    <input type="number" value={recForm.capacity_kg} onChange={e => setRecForm({ ...recForm, capacity_kg: +e.target.value })} placeholder="Kapasitas (kg)" className="w-full px-4 py-3 border rounded-xl" />
                    <button onClick={handleSaveRecipient} className="w-full bg-green-700 hover:bg-green-800 text-white font-semibold py-3 rounded-xl">Simpan</button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        {/* LAPORAN */}
        {tab === "laporan" && stats && (
          <div className="bg-white rounded-2xl shadow-sm border p-6">
            <h3 className="font-bold text-gray-900 mb-4">Ringkasan Laporan</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="p-4 bg-gray-50 rounded-xl"><span className="text-gray-500">Total Buah:</span> <span className="font-bold">{stats.total_fruits}</span></div>
              <div className="p-4 bg-gray-50 rounded-xl"><span className="text-gray-500">Total Berat:</span> <span className="font-bold">{stats.total_kg?.toFixed(1)} kg</span></div>
              <div className="p-4 bg-gray-50 rounded-xl"><span className="text-gray-500">CO₂ Dikurangi:</span> <span className="font-bold">{stats.co2_saved_kg} kg</span></div>
              <div className="p-4 bg-gray-50 rounded-xl"><span className="text-gray-500">Penerima Aktif:</span> <span className="font-bold">{stats.recipients_helped}</span></div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
