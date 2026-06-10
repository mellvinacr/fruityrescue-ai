"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { login as apiLogin } from "@/lib/api";
import { saveToken, saveUser } from "@/lib/auth";
import { Leaf, Eye, EyeOff, Loader2 } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await apiLogin(email, password);
      saveToken(res.access_token);
      saveUser(res.user);
      router.push(res.user.role === "admin" ? "/admin" : "/dashboard");
    } catch (err: any) {
      setError(err.message || "Login gagal");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left decorative */}
      <div className="hidden lg:flex lg:w-1/2 bg-green-700 flex-col items-center justify-center text-white p-12 relative overflow-hidden">
        <div className="absolute text-[120px] opacity-10 animate-bounce" style={{ top: "10%", left: "10%" }}>🍎</div>
        <div className="absolute text-[100px] opacity-10 animate-bounce" style={{ top: "50%", right: "10%", animationDelay: "0.5s" }}>🥭</div>
        <div className="absolute text-[80px] opacity-10 animate-bounce" style={{ bottom: "10%", left: "30%", animationDelay: "1s" }}>🍊</div>
        <Leaf className="w-16 h-16 mb-6" />
        <h2 className="font-[var(--font-heading)] text-4xl font-bold text-center mb-4">FruityRescue AI</h2>
        <p className="text-green-100 text-center text-lg max-w-sm italic leading-relaxed">
          &ldquo;Setiap buah yang diselamatkan adalah langkah kecil menuju dunia yang lebih baik&rdquo;
        </p>
      </div>

      {/* Right form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-white">
        <div className="w-full max-w-md">
          <h1 className="font-[var(--font-heading)] text-3xl font-bold text-gray-900 mb-2">Selamat Datang Kembali</h1>
          <p className="text-gray-500 mb-8">Masuk ke akun FruityRescue AI kamu</p>

          {error && <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl mb-6">{error}</div>}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
              <input required type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-green-500 outline-none" placeholder="email@example.com" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
              <div className="relative">
                <input required type={showPw ? "text" : "password"} value={password} onChange={e => setPassword(e.target.value)} className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-green-500 outline-none pr-12" placeholder="••••••••" />
                <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
            <button type="submit" disabled={loading} className="w-full bg-green-700 hover:bg-green-800 text-white font-semibold py-3 rounded-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2">
              {loading && <Loader2 size={18} className="animate-spin" />} Masuk
            </button>
          </form>
          <p className="text-center text-sm text-gray-500 mt-6">
            Belum punya akun? <Link href="/register" className="text-green-700 font-semibold hover:underline">Daftar sekarang</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
