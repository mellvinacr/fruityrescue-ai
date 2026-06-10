"use client";

// MODIFIED
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { isLoggedIn, getUser } from "@/lib/auth";
import { getMyStats, getFruits } from "@/lib/api";
import Link from "next/link";
import AuthenticatedLayout from "@/components/AuthenticatedLayout";

const BADGES = [
  { icon: "🌱", title: "Pendatang Baru", desc: "Donasi pertama", req: (s: any) => s.total_donations >= 1 },
  { icon: "🌿", title: "Aktif", desc: "3+ donasi", req: (s: any) => s.total_donations >= 3 },
  { icon: "🌳", title: "Pahlawan", desc: "10+ kg diselamatkan", req: (s: any) => s.total_kg >= 10 },
  { icon: "⭐", title: "Veteran", desc: "10+ donasi", req: (s: any) => s.total_donations >= 10 },
];

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [stats, setStats] = useState<any>(null);
  const [fruits, setFruits] = useState<any[]>([]);

  useEffect(() => {
    if (!isLoggedIn()) { router.push("/login"); return; }
    setUser(getUser());
    getMyStats().then(setStats).catch(() => {});
    getFruits().then(setFruits).catch(() => {});
  }, [router]);

  if (!user) return null;

  return (
    <AuthenticatedLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Profile header */}
        <div className="bg-white rounded-2xl shadow-sm border p-8 flex items-center gap-6">
          <div className="w-20 h-20 rounded-full bg-green-700 text-white flex items-center justify-center text-4xl font-bold font-[var(--font-heading)]">
            {user.name?.charAt(0)}
          </div>
          <div>
            <h1 className="font-[var(--font-heading)] text-2xl font-bold text-gray-900">{user.name}</h1>
            <p className="text-gray-500">{user.email}</p>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs font-semibold px-3 py-1 rounded-full bg-green-100 text-green-800">{user.role?.toUpperCase()}</span>
            </div>
          </div>
        </div>

        {/* Stats */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: "Total Donasi", value: stats.total_donations },
              { label: "Total kg", value: `${stats.total_kg?.toFixed(1)}` },
              { label: "CO₂ Saved", value: `${stats.co2_saved_kg} kg` },
              { label: "Penerima Terbantu", value: stats.recipients_helped },
            ].map((s, i) => (
              <div key={i} className="bg-white rounded-2xl shadow-sm border p-5 text-center">
                <div className="text-2xl font-bold text-green-700">{s.value}</div>
                <div className="text-sm text-gray-500 mt-1">{s.label}</div>
              </div>
            ))}
          </div>
        )}

        {/* Badges */}
        <div className="bg-white rounded-2xl shadow-sm border p-6">
          <h2 className="font-bold text-gray-900 mb-4">Pencapaian</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {BADGES.map((b, i) => {
              const unlocked = stats && b.req(stats);
              return (
                <div key={i} className={`p-4 rounded-xl border text-center ${unlocked ? "bg-green-50 border-green-200" : "bg-gray-50 border-gray-200 opacity-50"}`}>
                  <div className="text-3xl mb-2">{unlocked ? b.icon : "🔒"}</div>
                  <div className="text-sm font-bold">{b.title}</div>
                  <div className="text-xs text-gray-500">{b.desc}</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Donation History */}
        <div className="bg-white rounded-2xl shadow-sm border overflow-hidden">
          <div className="p-4 border-b font-bold text-gray-900">Riwayat Donasimu</div>
          {fruits.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <div className="text-5xl mb-4">🍊</div>
              <p className="mb-4">Kamu belum pernah berdonasi. Yuk mulai!</p>
              <Link href="/upload" className="bg-green-700 hover:bg-green-800 text-white font-semibold px-6 py-3 rounded-xl inline-block">Donasi Sekarang</Link>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead><tr className="bg-gray-50 text-gray-500"><th className="p-3 text-left">Foto</th><th className="p-3 text-left">Buah</th><th className="p-3 text-left">Berat</th><th className="p-3 text-left">Status</th><th className="p-3 text-left">Alokasi</th><th className="p-3 text-left">Tanggal</th></tr></thead>
              <tbody>{fruits.map(f => (
                <tr key={f.id} className="border-t hover:bg-gray-50">
                  <td className="p-3">{f.photo_url ? <img src={f.photo_url} className="w-12 h-12 rounded-lg object-cover" alt="" /> : <div className="w-12 h-12 bg-gray-100 rounded-lg" />}</td>
                  <td className="p-3 font-medium">{f.fruit_name || "-"}</td>
                  <td className="p-3">{f.quantity_kg} kg</td>
                  <td className="p-3">
                    <span className={`text-xs font-semibold px-3 py-1 rounded-full ${f.status === "fresh" ? "bg-green-100 text-green-800" : f.status === "rotten" ? "bg-red-100 text-red-800" : "bg-amber-100 text-amber-700"}`}>{f.status?.toUpperCase()}</span>
                  </td>
                  <td className="p-3">{f.ai_recommendation || "-"}</td>
                  <td className="p-3 text-gray-500">{new Date(f.created_at).toLocaleDateString("id-ID")}</td>
                </tr>
              ))}</tbody>
            </table>
          )}
        </div>
      </div>
    </AuthenticatedLayout>
  );
}
