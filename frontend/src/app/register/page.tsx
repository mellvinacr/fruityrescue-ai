"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { register as apiRegister } from "@/lib/api";
import { saveToken, saveUser } from "@/lib/auth";
import { Leaf, Loader2 } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await apiRegister(name, email, password);
      saveToken(res.access_token);
      saveUser(res.user);
      router.push("/upload");
    } catch (err: any) {
      setError(err.message || "Pendaftaran gagal");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      <div className="hidden lg:flex lg:w-1/2 bg-green-700 flex-col items-center justify-center text-white p-12 relative overflow-hidden">
        <div className="absolute text-[120px] opacity-10 animate-bounce" style={{ top: "10%", right: "10%" }}>🍋</div>
        <div className="absolute text-[90px] opacity-10 animate-bounce" style={{ bottom: "20%", left: "15%", animationDelay: "0.7s" }}>🍊</div>
        <Leaf className="w-16 h-16 mb-6" />
        <h2 className="font-[var(--font-heading)] text-4xl font-bold text-center mb-4">FruityRescue AI</h2>
        <p className="text-green-100 text-center text-lg max-w-sm italic">&ldquo;Bergabunglah dalam misi menyelamatkan buah dan bumi kita&rdquo;</p>
      </div>

      <div className="flex-1 flex items-center justify-center p-8 bg-white">
        <div className="w-full max-w-md">
          <h1 className="font-[var(--font-heading)] text-3xl font-bold text-gray-900 mb-2">Bergabung Sekarang</h1>
          <p className="text-gray-500 mb-8">Buat akun FruityRescue AI kamu</p>

          {error && <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl mb-6">{error}</div>}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Nama Lengkap</label>
              <input required type="text" value={name} onChange={e => setName(e.target.value)} className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-green-500 outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
              <input required type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-green-500 outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
              <input required type="password" value={password} onChange={e => setPassword(e.target.value)} className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-green-500 outline-none" />
            </div>

            <button type="submit" disabled={loading} className="w-full bg-green-700 hover:bg-green-800 text-white font-semibold py-3 rounded-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2">
              {loading && <Loader2 size={18} className="animate-spin" />} Buat Akun
            </button>
          </form>
          <p className="text-center text-sm text-gray-500 mt-6">
            Sudah punya akun? <Link href="/login" className="text-green-700 font-semibold hover:underline">Masuk</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
