// NEW COMPONENT
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { isLoggedIn, getUser } from "@/lib/auth";
import { getMyStats, getFruits } from "@/lib/api";
import Link from "next/link";
import AuthenticatedLayout from "@/components/AuthenticatedLayout";
import { Camera, Heart, Package, BarChart3, ChevronRight } from "lucide-react";

const BADGES = [
  { icon: "🌱", title: "Pendatang Baru", desc: "Donasi pertama", req: (s: any) => s.total_donations >= 1 },
  { icon: "🌿", title: "Aktif", desc: "3+ donasi", req: (s: any) => s.total_donations >= 3 },
  { icon: "🌳", title: "Pahlawan", desc: "10+ kg diselamatkan", req: (s: any) => s.total_kg >= 10 },
  { icon: "⭐", title: "Veteran", desc: "10+ donasi", req: (s: any) => s.total_donations >= 10 },
];

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [stats, setStats] = useState<any>(null);
  const [fruits, setFruits] = useState<any[]>([]);

  useEffect(() => {
    if (!isLoggedIn()) {
      router.push("/login");
      return;
    }
    setUser(getUser());
    getMyStats().then(setStats).catch(() => {});
    getFruits().then(setFruits).catch(() => {});
  }, [router]);

  if (!user) return null;

  // Extract first name
  const firstName = user.name ? user.name.split(" ")[0] : "Donatur";

  return (
    <AuthenticatedLayout>
      <div className="space-y-6">
        {/* A. GREETING SECTION */}
        <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-2xl p-6 md:p-8 text-white shadow-sm relative overflow-hidden">
          <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-white/10 rounded-full blur-xl" />
          <h1 className="font-[var(--font-heading)] text-2xl md:text-3xl font-bold mb-1">
            Selamat datang, {firstName}! 👋
          </h1>
          <p className="text-green-50 text-sm md:text-base font-medium">
            Apa yang ingin kamu lakukan hari ini?
          </p>
        </div>

        {/* B. QUICK ACTION BUTTONS */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="grid grid-cols-2 gap-4">
            <Link
              href="/upload"
              className="flex flex-col items-center justify-center p-5 rounded-2xl border-2 border-green-600/30 text-green-700 bg-white hover:bg-green-50/50 hover:border-green-600 transition-all font-semibold shadow-sm group gap-2 text-center"
            >
              <Camera className="w-8 h-8 text-green-600 group-hover:scale-110 transition-transform" />
              <span>🔍 Scan Buah</span>
            </Link>
            <Link
              href="/profile"
              className="flex flex-col items-center justify-center p-5 rounded-2xl border-2 border-green-600/30 text-green-700 bg-white hover:bg-green-50/50 hover:border-green-600 transition-all font-semibold shadow-sm group gap-2 text-center"
            >
              <Package className="w-8 h-8 text-green-600 group-hover:scale-110 transition-transform" />
              <span>📦 Cek Stok Saya</span>
            </Link>
            <Link
              href="/profile"
              className="flex flex-col items-center justify-center p-5 rounded-2xl border-2 border-green-600/30 text-green-700 bg-white hover:bg-green-50/50 hover:border-green-600 transition-all font-semibold shadow-sm group gap-2 text-center col-span-2"
            >
              <BarChart3 className="w-8 h-8 text-green-600 group-hover:scale-110 transition-transform" />
              <span>📊 Lihat Riwayat</span>
            </Link>
          </div>

          <Link
            href="/upload"
            className="flex flex-col items-center justify-center p-8 rounded-2xl bg-[#16a34a] hover:bg-[#15803d] text-white font-bold transition-all shadow-md hover:shadow-lg gap-3 text-center"
          >
            <Heart className="w-12 h-12 animate-pulse" />
            <span className="text-xl">🤝 Donasi Sekarang</span>
            <span className="text-xs text-green-100 font-normal max-w-xs leading-relaxed">
              Bantu panti asuhan, kurangi pemborosan pangan, dan selamatkan bumi hari ini!
            </span>
          </Link>
        </div>

        {/* C. MINI STATS ROW */}
        {stats && (
          <div>
            <h2 className="font-bold text-gray-900 mb-3 text-lg">Dampak Donasimu</h2>
            <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-none snap-x snap-mandatory -mx-4 px-4 md:mx-0 md:px-0">
              {[
                { label: "Total Donasi", value: stats.total_donations },
                { label: "Total kg", value: `${stats.total_kg?.toFixed(1)}` },
                { label: "CO₂ Saved", value: `${stats.co2_saved_kg} kg` },
                { label: "Penerima Terbantu", value: stats.recipients_helped },
              ].map((s, i) => (
                <div
                  key={i}
                  className="bg-white rounded-2xl shadow-sm border p-4 text-center min-w-[150px] flex-1 snap-start"
                >
                  <div className="text-xl font-bold text-green-700">{s.value}</div>
                  <div className="text-xs text-gray-500 mt-0.5">{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* D. RECENT ACTIVITY STRIP */}
          <div className="bg-white rounded-2xl shadow-sm border p-5 flex flex-col">
            <div className="flex justify-between items-center mb-4">
              <h2 className="font-bold text-gray-900 text-lg">Donasi Terbaru</h2>
              {fruits.length > 0 && (
                <Link
                  href="/profile"
                  className="text-xs font-semibold text-green-700 hover:text-green-800 hover:underline flex items-center gap-0.5"
                >
                  Lihat Semua <ChevronRight size={14} />
                </Link>
              )}
            </div>

            <div className="flex-1 space-y-3">
              {fruits.length === 0 ? (
                <div className="text-center py-8 text-gray-500 text-sm">
                  <div className="text-4xl mb-2">🍊</div>
                  <p>Kamu belum memiliki riwayat donasi.</p>
                </div>
              ) : (
                fruits.slice(0, 3).map((f) => (
                  <div key={f.id} className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-xl transition-colors">
                    {f.photo_url ? (
                      <img src={encodeURI(f.photo_url)} className="w-10 h-10 rounded-lg object-cover" alt="" />
                    ) : (
                      <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center text-lg">
                        🍎
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold text-gray-800 truncate">{f.fruit_name || "Buah"}</div>
                      <div className="text-xs text-gray-500">{f.quantity_kg} kg • {new Date(f.created_at).toLocaleDateString("id-ID")}</div>
                    </div>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        f.status === "fresh"
                          ? "bg-green-100 text-green-800"
                          : f.status === "rotten"
                          ? "bg-red-100 text-red-800"
                          : "bg-amber-100 text-amber-700"
                      }`}
                    >
                      {f.status?.toUpperCase()}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* E. PENCAPAIAN TEASER */}
          <div className="bg-white rounded-2xl shadow-sm border p-5 flex flex-col">
            <div className="flex justify-between items-center mb-4">
              <h2 className="font-bold text-gray-900 text-lg">Pencapaian</h2>
              <Link
                href="/profile"
                className="text-xs font-semibold text-green-700 hover:text-green-800 hover:underline flex items-center gap-0.5"
              >
                Lihat semua pencapaian <ChevronRight size={14} />
              </Link>
            </div>

            <div className="flex-1 grid grid-cols-2 gap-3">
              {BADGES.map((b, i) => {
                const unlocked = stats && b.req(stats);
                return (
                  <div
                    key={i}
                    className={`p-3 rounded-xl border text-center flex flex-col items-center justify-center ${
                      unlocked ? "bg-green-50/50 border-green-200" : "bg-gray-50/50 border-gray-150 opacity-60"
                    }`}
                  >
                    <div className="text-2xl mb-1">{unlocked ? b.icon : "🔒"}</div>
                    <div className="text-xs font-bold text-gray-800">{b.title}</div>
                    <div className="text-[10px] text-gray-500">{b.desc}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </AuthenticatedLayout>
  );
}
