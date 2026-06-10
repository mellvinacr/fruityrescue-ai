"use client";

import Link from "next/link";
import { useEffect, useState, useRef } from "react";
import { getDashboardStats } from "@/lib/api";
import { isLoggedIn, isAdmin, getUser, clearToken } from "@/lib/auth";
import { Camera, Zap, Heart, ChevronDown, ChevronRight, Leaf, LogOut, User, LayoutDashboard } from "lucide-react";
import { motion, useInView } from "framer-motion";

function AnimatedNumber({ value }: { value: number }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (!inView) return;
    let start = 0;
    const duration = 1500;
    const step = (ts: number) => {
      start = start || ts;
      const progress = Math.min((ts - start) / duration, 1);
      setDisplay(Math.floor(progress * value));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [inView, value]);

  return <span ref={ref}>{display.toLocaleString("id-ID")}</span>;
}

export default function LandingPage() {
  const [stats, setStats] = useState<any>(null);
  const [logged, setLogged] = useState(false);
  const [admin, setAdmin] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [showMenu, setShowMenu] = useState(false);

  useEffect(() => {
    getDashboardStats().then(setStats).catch(() => {});
    setLogged(isLoggedIn());
    setAdmin(isAdmin());
    setUser(getUser());
  }, []);

  const handleLogout = () => { clearToken(); window.location.reload(); };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-gray-100">
        <div className="max-w-6xl mx-auto flex items-center justify-between px-4 py-3">
          <Link href="/" className="flex items-center gap-2 font-[var(--font-heading)] font-bold text-xl text-gray-900">
            <Leaf className="w-6 h-6 text-green-600" />
            FruityRescue<span className="bg-green-700 text-white text-xs px-1.5 py-0.5 rounded ml-0.5">AI</span>
          </Link>
          <div className="hidden md:flex items-center gap-6 text-sm font-medium text-gray-600">
            <Link href="/" className="hover:text-green-700 transition-colors">Beranda</Link>
            <Link href="/impact" className="hover:text-green-700 transition-colors">Dampak</Link>
            <Link href="/upload" className="hover:text-green-700 transition-colors">Donasikan</Link>
          </div>
          <div className="flex items-center gap-3">
            {!logged ? (
              <>
                <Link href="/login" className="text-sm font-medium text-gray-600 hover:text-green-700">Masuk</Link>
                <Link href="/register" className="text-sm bg-green-700 hover:bg-green-800 text-white font-semibold px-4 py-2 rounded-xl transition-all">Daftar</Link>
              </>
            ) : (
              <div className="relative">
                <button onClick={() => setShowMenu(!showMenu)} className="w-9 h-9 rounded-full bg-green-700 text-white font-bold text-sm flex items-center justify-center">
                  {user?.name?.charAt(0) || "U"}
                </button>
                {showMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border py-2 text-sm">
                    <Link href="/profile" className="flex items-center gap-2 px-4 py-2 hover:bg-gray-50"><User size={14} /> Profil Saya</Link>
                    {admin && <Link href="/admin" className="flex items-center gap-2 px-4 py-2 hover:bg-gray-50"><LayoutDashboard size={14} /> Admin</Link>}
                    <button onClick={handleLogout} className="flex items-center gap-2 px-4 py-2 hover:bg-gray-50 w-full text-left text-red-600"><LogOut size={14} /> Keluar</button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden bg-gradient-to-b from-green-50 via-white to-green-50">
        <div className="absolute w-72 h-72 bg-green-200 rounded-full opacity-20 -top-20 -left-20 animate-pulse" />
        <div className="absolute w-96 h-96 bg-green-100 rounded-full opacity-20 -bottom-32 -right-32 animate-pulse" style={{ animationDelay: "1s" }} />
        <div className="text-center px-4 max-w-3xl mx-auto relative z-10">
          <span className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-green-100 text-green-800 text-sm font-semibold rounded-full mb-6">
            🌱 Mendukung SDGs 2 & 12
          </span>
          <h1 className="font-[var(--font-heading)] text-5xl md:text-6xl font-extrabold text-gray-900 leading-tight mb-6">
            Selamatkan Buah,<br /><span className="text-green-700">Selamatkan Bumi.</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-lg mx-auto mb-10 leading-relaxed">
            Platform AI pertama untuk menyelamatkan buah surplus dari pemborosan. Deteksi otomatis, alokasi cerdas, dampak nyata.
          </p>
          <div className="flex flex-wrap justify-center gap-4 mb-8">
            <Link href="/upload" className="bg-green-700 hover:bg-green-800 text-white font-semibold px-8 py-3.5 rounded-xl transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 inline-flex items-center gap-2">
              Donasikan Buah Sekarang <ChevronRight size={18} />
            </Link>
            <Link href="/impact" className="border-2 border-green-700 text-green-700 hover:bg-green-50 font-semibold px-8 py-3.5 rounded-xl transition-all">
              Lihat Dampak Kami
            </Link>
          </div>
          <p className="text-sm text-gray-500 flex flex-wrap justify-center gap-4">
            <span>✓ Gratis untuk donatur</span><span>✓ AI 3-lapis</span><span>✓ Terverifikasi SDGs</span>
          </p>
        </div>
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce text-gray-400">
          <ChevronDown size={28} />
        </div>
      </section>

      {/* LIVE IMPACT STATS */}
      <section className="bg-green-700 text-white py-12">
        <div className="max-w-5xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          <div>
            <div className="text-3xl md:text-4xl font-[var(--font-heading)] font-bold"><AnimatedNumber value={stats?.total_kg || 0} /></div>
            <div className="text-green-100 text-sm mt-1">🍊 kg Buah Diselamatkan</div>
          </div>
          <div>
            <div className="text-3xl md:text-4xl font-[var(--font-heading)] font-bold"><AnimatedNumber value={stats?.co2_saved_kg || 0} /></div>
            <div className="text-green-100 text-sm mt-1">🌱 kg CO₂ Dikurangi</div>
          </div>
          <div>
            <div className="text-3xl md:text-4xl font-[var(--font-heading)] font-bold"><AnimatedNumber value={stats?.orphanage_count || 0} /></div>
            <div className="text-green-100 text-sm mt-1">🏠 Panti Terbantu</div>
          </div>
          <div>
            <div className="text-3xl md:text-4xl font-[var(--font-heading)] font-bold"><AnimatedNumber value={(stats?.livestock_count || 0) + (stats?.compost_count || 0)} /></div>
            <div className="text-green-100 text-sm mt-1">🐄 Peternak & Petani</div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="py-20 bg-white">
        <div className="max-w-5xl mx-auto px-4 text-center">
          <h2 className="font-[var(--font-heading)] text-3xl font-bold text-gray-900 mb-2">Semudah Tiga Langkah</h2>
          <p className="text-gray-500 text-lg mb-14">Dari foto menjadi dampak nyata</p>
          <div className="grid md:grid-cols-3 gap-12">
            {[
              { icon: <Camera size={28} />, color: "bg-green-100 text-green-600", title: "Upload Foto Buah", desc: "Ambil foto buah surplus dari toko atau kebunmu" },
              { icon: <Zap size={28} />, color: "bg-orange-100 text-orange-600", title: "AI Menganalisis", desc: "3 lapis AI mendeteksi kesegaran dan merekomendasikan alokasi terbaik" },
              { icon: <Heart size={28} />, color: "bg-green-100 text-green-600", title: "Dampak Nyata", desc: "Buah segar ke panti asuhan, buah busuk jadi pakan atau kompos" },
            ].map((s, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.15 }} viewport={{ once: true }} className="flex flex-col items-center">
                <div className={`w-16 h-16 rounded-full ${s.color} flex items-center justify-center mb-5`}>{s.icon}</div>
                <h3 className="text-xl font-bold mb-2 text-gray-900">{s.title}</h3>
                <p className="text-gray-600 leading-relaxed">{s.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* AI TECH SHOWCASE */}
      <section className="py-20 bg-green-50">
        <div className="max-w-5xl mx-auto px-4 text-center">
          <h2 className="font-[var(--font-heading)] text-3xl font-bold text-gray-900 mb-2">Teknologi AI 3 Lapis</h2>
          <p className="text-gray-500 text-lg mb-14">Kombinasi self-hosted model dan Gemini AI untuk akurasi terbaik</p>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { tag: "Self-Hosted • Bonus +5", tagColor: "bg-amber-100 text-amber-700", title: "Deteksi Kesegaran", desc: "Model computer vision berjalan di server kami sendiri, mengklasifikasikan buah sebagai SEGAR atau BUSUK", tech: "dima806/fresh_rotten_fruits" },
              { tag: "Google AI", tagColor: "bg-blue-100 text-blue-700", title: "Analisis Mendalam", desc: "Gemini Vision menganalisis foto untuk identifikasi nama buah, skor kesegaran, kondisi visual, dan tips penyimpanan", tech: "gemini-1.5-flash" },
              { tag: "Gemini AI", tagColor: "bg-blue-100 text-blue-700", title: "Alokasi Cerdas", desc: "Untuk buah busuk, AI menentukan apakah lebih baik sebagai pakan ternak atau pupuk kompos beserta alasannya", tech: "gemini-1.5-flash" },
            ].map((c, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} viewport={{ once: true }} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 text-left hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
                <span className={`inline-block text-xs font-semibold px-3 py-1 rounded-full mb-4 ${c.tagColor}`}>{c.tag}</span>
                <h3 className="text-lg font-bold text-gray-900 mb-2">{c.title}</h3>
                <p className="text-gray-600 text-sm leading-relaxed mb-4">{c.desc}</p>
                <code className="text-xs bg-gray-100 px-2 py-1 rounded text-gray-500">{c.tech}</code>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* LIVE ACTIVITY FEED */}
      {stats?.recent_activity && stats.recent_activity.length > 0 && (
        <section className="py-20 bg-white">
          <div className="max-w-3xl mx-auto px-4">
            <div className="flex items-center gap-2 mb-10">
              <h2 className="font-[var(--font-heading)] text-3xl font-bold text-gray-900">Aktivitas Terkini</h2>
              <span className="w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse" />
            </div>
            <div className="space-y-3">
              {stats.recent_activity.map((a: any, i: number) => (
                <motion.div key={i} initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }} viewport={{ once: true }}
                  className="flex items-center gap-4 p-3 rounded-xl hover:bg-gray-50 transition-colors">
                  <span className="text-2xl">🍊</span>
                  <div className="flex-1 text-sm text-gray-700">
                    <span className="font-semibold">{a.donor_name}</span> mendonasikan <span className="font-semibold">{a.quantity_kg}kg {a.fruit_name}</span>
                  </div>
                  <span className={`text-xs font-semibold px-3 py-1 rounded-full ${a.status === "fresh" ? "bg-green-100 text-green-800" : a.status === "rotten" ? "bg-orange-100 text-orange-700" : "bg-amber-100 text-amber-700"}`}>
                    {a.status?.toUpperCase()}
                  </span>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA BANNER */}
      <section className="px-4 pb-16">
        <div className="max-w-5xl mx-auto bg-green-900 rounded-3xl p-12 text-center text-white">
          <h2 className="font-[var(--font-heading)] text-3xl font-bold mb-3">Siap Menyelamatkan Buah Hari Ini?</h2>
          <p className="text-green-200 mb-8">Bergabung dengan donatur yang sudah berkontribusi mengurangi food waste</p>
          <Link href="/upload" className="inline-flex items-center gap-2 bg-white text-green-900 font-bold px-8 py-3.5 rounded-xl hover:bg-green-50 transition-all">
            Mulai Donasi Sekarang <ChevronRight size={18} />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#14532d] text-white py-12">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-start gap-8">
            <div>
              <div className="font-[var(--font-heading)] font-bold text-xl mb-2 flex items-center gap-2">
                <Leaf size={20} /> FruityRescue AI
              </div>
              <p className="text-green-200 text-sm">Selamatkan buah. Selamatkan bumi.</p>
            </div>
            <div className="flex gap-6 text-sm text-green-200">
              <Link href="/" className="hover:text-white transition-colors">Tentang</Link>
              <Link href="/impact" className="hover:text-white transition-colors">Dampak</Link>
              <Link href="/upload" className="hover:text-white transition-colors">Donasikan</Link>
            </div>
          </div>
          <div className="border-t border-green-800 mt-8 pt-6 text-center text-sm text-green-300">
            FruityRescue AI &copy; 2026 — Mendukung SDGs 2 & 12
          </div>
        </div>
      </footer>
    </div>
  );
}
