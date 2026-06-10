"use client";

import { useEffect, useState, useRef } from "react";
import { getDashboardStats } from "@/lib/api";
import Link from "next/link";
import { ArrowLeft, Leaf } from "lucide-react";
import { motion, useInView } from "framer-motion";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";

function AnimCount({ value }: { value: number }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });
  const [n, setN] = useState(0);
  useEffect(() => {
    if (!inView) return;
    let s = 0;
    const d = 1200;
    const step = (ts: number) => { s = s || ts; const p = Math.min((ts - s) / d, 1); setN(Math.floor(p * value)); if (p < 1) requestAnimationFrame(step); };
    requestAnimationFrame(step);
  }, [inView, value]);
  return <span ref={ref}>{n.toLocaleString("id-ID")}</span>;
}

const PIE_COLORS = ["#22c55e", "#f97316", "#fbbf24"];

export default function ImpactPage() {
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    const load = () => getDashboardStats().then(setStats).catch(() => {});
    load();
    const iv = setInterval(load, 30000);
    return () => clearInterval(iv);
  }, []);

  const pieData = stats ? [
    { name: "Panti Asuhan", value: stats.orphanage_count || 0 },
    { name: "Pakan Ternak", value: stats.livestock_count || 0 },
    { name: "Pupuk Kompos", value: stats.compost_count || 0 },
  ] : [];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <div className="bg-green-900 text-white py-20 text-center">
        <div className="max-w-4xl mx-auto px-4">
          <Link href="/" className="inline-flex items-center text-green-200 hover:text-white mb-6 text-sm"><ArrowLeft className="w-4 h-4 mr-1" /> Beranda</Link>
          <h1 className="font-[var(--font-heading)] text-4xl md:text-5xl font-bold mb-4">Dampak Nyata FruityRescue AI</h1>
          <p className="text-green-200 text-lg">Setiap kilogram buah yang diselamatkan memberi manfaat nyata</p>
          <div className="flex items-center justify-center gap-2 mt-4 text-sm text-green-300">
            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" /> Diperbarui otomatis setiap 30 detik
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 -mt-10">
        {/* Impact cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
          {[
            { icon: "🍊", label: "Buah Diselamatkan", value: stats?.total_kg || 0, suffix: " kg", sub: "Diselamatkan dari tempat sampah" },
            { icon: "🌱", label: "CO₂ Dikurangi", value: stats?.co2_saved_kg || 0, suffix: " kg", sub: "Emisi karbon yang dicegah" },
            { icon: "🏠", label: "Panti Terbantu", value: stats?.orphanage_count || 0, suffix: "", sub: "Panti asuhan mendapat donasi" },
            { icon: "🐄", label: "Peternak & Petani", value: (stats?.livestock_count || 0) + (stats?.compost_count || 0), suffix: "", sub: "Menerima buah untuk diolah" },
          ].map((c, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} className="bg-white rounded-2xl shadow-sm border p-6 text-center">
              <div className="text-3xl mb-2">{c.icon}</div>
              <div className="text-2xl md:text-3xl font-[var(--font-heading)] font-bold text-gray-900"><AnimCount value={c.value} />{c.suffix}</div>
              <div className="text-sm font-medium text-gray-700 mt-1">{c.label}</div>
              <div className="text-xs text-gray-400 mt-1">{c.sub}</div>
            </motion.div>
          ))}
        </div>

        {/* Charts */}
        <div className="grid md:grid-cols-2 gap-8 mb-12">
          <div className="bg-white rounded-2xl shadow-sm border p-6">
            <h3 className="font-bold text-gray-900 mb-4">Tren Donasi 7 Hari Terakhir</h3>
            <ResponsiveContainer width="100%" height={250}>
              <AreaChart data={stats?.daily_donations || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} tickFormatter={v => v?.slice(5)} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Area type="monotone" dataKey="fresh_kg" stroke="#22c55e" fill="#dcfce7" name="Segar (kg)" />
                <Area type="monotone" dataKey="rotten_kg" stroke="#f97316" fill="#ffedd5" name="Busuk (kg)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="bg-white rounded-2xl shadow-sm border p-6">
            <h3 className="font-bold text-gray-900 mb-4">Distribusi Alokasi</h3>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} dataKey="value" label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}>
                  {pieData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i]} />)}
                </Pie>
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Activity feed */}
        {stats?.recent_activity?.length > 0 && (
          <div className="bg-white rounded-2xl shadow-sm border p-6 mb-12">
            <div className="flex items-center gap-2 mb-4">
              <h3 className="font-bold text-gray-900">Aktivitas Terkini</h3>
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span className="text-xs text-green-600 font-medium">Live</span>
            </div>
            <div className="space-y-2">
              {stats.recent_activity.map((a: any, i: number) => (
                <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }} className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50">
                  <div className="w-9 h-9 rounded-full bg-green-100 flex items-center justify-center text-sm font-bold text-green-700">{a.donor_name?.charAt(0)}</div>
                  <div className="flex-1 text-sm"><span className="font-medium">{a.donor_name}</span> — {a.quantity_kg}kg {a.fruit_name}</div>
                  <span className={`text-xs font-semibold px-3 py-1 rounded-full ${a.status === "fresh" ? "bg-green-100 text-green-800" : a.status === "rotten" ? "bg-orange-100 text-orange-700" : "bg-amber-100 text-amber-700"}`}>{a.status?.toUpperCase()}</span>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* SDGs */}
        <div className="grid md:grid-cols-2 gap-6 mb-16">
          <div className="bg-white rounded-2xl shadow-sm border p-6">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4 text-2xl">🎯</div>
            <h3 className="font-bold text-gray-900 mb-2">SDGs 2: Zero Hunger</h3>
            <p className="text-sm text-gray-600 leading-relaxed">FruityRescue AI membantu mengalirkan buah segar surplus ke panti asuhan dan komunitas yang membutuhkan, berkontribusi langsung pada pengurangan kelaparan.</p>
          </div>
          <div className="bg-white rounded-2xl shadow-sm border p-6">
            <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mb-4 text-2xl">♻️</div>
            <h3 className="font-bold text-gray-900 mb-2">SDGs 12: Responsible Consumption</h3>
            <p className="text-sm text-gray-600 leading-relaxed">Dengan mengalokasikan buah busuk ke pakan ternak dan kompos, platform ini menerapkan prinsip ekonomi sirkular dan mengurangi food waste secara signifikan.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
