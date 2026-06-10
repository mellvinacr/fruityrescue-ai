"use client";

// MODIFIED
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { uploadFruit } from "@/lib/api";
import { isLoggedIn, getUser } from "@/lib/auth";
import Link from "next/link";
import { Upload, Loader2, CheckCircle } from "lucide-react";
import AuthenticatedLayout from "@/components/AuthenticatedLayout";

const LOADING_TEXTS = [
  "Mendeteksi kesegaran buah...",
  "Menganalisis kondisi visual...",
  "Menentukan alokasi terbaik...",
];

export default function UploadPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({ donor_name: "", contact: "", location: "", quantity_kg: "", notes: "" });
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingText, setLoadingText] = useState(0);
  const [result, setResult] = useState<any>(null);

  useEffect(() => {
    if (!isLoggedIn()) { router.push("/login"); return; }
    const u = getUser();
    if (u) setForm(f => ({ ...f, donor_name: u.name || "" }));
  }, [router]);

  useEffect(() => {
    if (!loading) return;
    const iv = setInterval(() => setLoadingText(p => (p + 1) % LOADING_TEXTS.length), 2000);
    return () => clearInterval(iv);
  }, [loading]);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setFile(e.target.files[0]);
      setPreview(URL.createObjectURL(e.target.files[0]));
    }
  };

  const handleSubmit = async () => {
    if (!file) return;
    setStep(3);
    setLoading(true);
    const data = new FormData();
    data.append("file", file);
    Object.entries(form).forEach(([k, v]) => data.append(k, v));
    try {
      const res = await uploadFruit(data);
      setResult(res);
    } catch {
      alert("Terjadi kesalahan saat mengupload.");
      setStep(2);
    } finally {
      setLoading(false);
    }
  };

  const isFresh = result?.status === "fresh";
  const progressPercent = result?.freshness_score || 0;

  return (
    <AuthenticatedLayout>
      <div className="max-w-2xl mx-auto space-y-6">
        <h1 className="font-[var(--font-heading)] text-3xl font-bold text-gray-900 mb-2">Donasikan Buah</h1>

        {/* Progress indicator */}
        <div className="flex items-center gap-2 mb-8">
          {[1, 2, 3].map(s => (
            <div key={s} className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${step >= s ? "bg-green-700 text-white" : "bg-gray-200 text-gray-500"}`}>
                {step > s ? <CheckCircle size={16} /> : s}
              </div>
              {s < 3 && <div className={`w-12 h-0.5 ${step > s ? "bg-green-700" : "bg-gray-200"}`} />}
            </div>
          ))}
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          {/* STEP 1 */}
          {step === 1 && (
            <div className="space-y-5">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Informasi Donatur</h2>
              {[
                { label: "Nama Lengkap", key: "donor_name", type: "text" },
                { label: "Nomor Kontak (WhatsApp)", key: "contact", type: "text" },
                { label: "Alamat Pickup Lengkap", key: "location", type: "text" },
                { label: "Estimasi Berat (kg)", key: "quantity_kg", type: "number" },
              ].map(f => (
                <div key={f.key}>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">{f.label}</label>
                  <input required type={f.type} value={(form as any)[f.key]} onChange={e => setForm({ ...form, [f.key]: e.target.value })} className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-green-500 outline-none" />
                </div>
              ))}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Catatan (opsional)</label>
                <textarea value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-green-500 outline-none" rows={2} />
              </div>
              <button onClick={() => setStep(2)} className="w-full bg-green-700 hover:bg-green-800 text-white font-semibold py-3 rounded-xl transition-all">
                Lanjut →
              </button>
            </div>
          )}

          {/* STEP 2 */}
          {step === 2 && (
            <div className="space-y-5">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Upload Foto Buah</h2>
              <div className="border-2 border-dashed border-green-200 rounded-2xl p-8 text-center hover:bg-green-50 transition-colors cursor-pointer relative">
                <input type="file" accept="image/*" onChange={handleFile} className="absolute inset-0 opacity-0 cursor-pointer" />
                {!preview ? (
                  <>
                    <Upload className="w-12 h-12 text-green-300 mx-auto mb-3" />
                    <p className="font-medium text-gray-700">Drag & drop foto buah di sini</p>
                    <p className="text-sm text-gray-400 mt-1">atau klik untuk memilih file • JPG, PNG, WEBP • Maks 10MB</p>
                  </>
                ) : (
                  <div>
                    <img src={preview} alt="Preview" className="max-h-48 mx-auto rounded-xl object-cover" />
                    <p className="text-sm text-gray-500 mt-3">{file?.name} ({((file?.size || 0) / 1024).toFixed(0)} KB)</p>
                    <button onClick={e => { e.stopPropagation(); setFile(null); setPreview(null); }} className="text-sm text-green-700 font-medium mt-2 hover:underline">Ganti foto</button>
                  </div>
                )}
              </div>
              <div className="bg-green-50 rounded-xl p-4 text-sm text-green-800">
                💡 Tips foto terbaik: ambil dari jarak 30cm, pencahayaan cukup, satu jenis buah per foto
              </div>
              <div className="flex gap-3">
                <button onClick={() => setStep(1)} className="flex-1 border-2 border-gray-200 text-gray-600 font-semibold py-3 rounded-xl hover:bg-gray-50">← Kembali</button>
                <button onClick={handleSubmit} disabled={!file} className="flex-1 bg-green-700 hover:bg-green-800 text-white font-semibold py-3 rounded-xl disabled:opacity-50 transition-all">Kirim Donasi</button>
              </div>
            </div>
          )}

          {/* STEP 3 - Loading */}
          {step === 3 && loading && (
            <div className="text-center py-16">
              <div className="w-16 h-16 border-4 border-green-200 border-t-green-700 rounded-full animate-spin mx-auto mb-6" />
              <p className="text-xl font-semibold text-gray-800 mb-2">AI sedang menganalisis foto...</p>
              <p className="text-gray-500 transition-all">{LOADING_TEXTS[loadingText]}</p>
            </div>
          )}

          {/* STEP 3 - Result */}
          {step === 3 && !loading && result && (
            <div>
              {/* Status header */}
              <div className="text-center mb-6">
                <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full mb-3 ${isFresh ? "bg-green-100" : "bg-orange-100"}`}>
                  <span className="text-3xl">{isFresh ? "✅" : "⚠️"}</span>
                </div>
                <span className={`inline-block text-xs font-semibold px-4 py-1.5 rounded-full ${isFresh ? "bg-green-100 text-green-800" : "bg-orange-100 text-orange-700"}`}>
                  {isFresh ? "BUAH SEGAR TERDETEKSI" : "BUAH BUSUK TERDETEKSI"}
                </span>
              </div>

              {/* AI Analysis */}
              <div className={`rounded-xl border p-5 mb-4 ${isFresh ? "bg-green-50 border-green-200" : "bg-orange-50 border-orange-200"}`}>
                <div className="grid grid-cols-2 gap-3 text-sm mb-3">
                  <div><span className="text-gray-500">Nama Buah:</span> <span className="font-semibold">{result.fruit_name}</span></div>
                  <div><span className="text-gray-500">Skor:</span> <span className="font-semibold">{result.freshness_score}/100</span></div>
                </div>
                <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden mb-3">
                  <div className={`h-full rounded-full transition-all duration-1000 ${isFresh ? "bg-gradient-to-r from-green-400 to-green-600" : "bg-gradient-to-r from-red-400 to-orange-500"}`} style={{ width: `${progressPercent}%` }} />
                </div>
                <p className="text-sm"><span className="text-gray-500">Kondisi:</span> {result.visual_condition}</p>
                <p className="text-sm"><span className="text-gray-500">Estimasi sisa:</span> {result.estimated_days || 0} hari</p>
                <p className="text-sm font-medium mt-2">{result.quick_recommendation}</p>
                {result.storage_tips && <div className="mt-2 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 text-sm text-amber-800">💡 {result.storage_tips}</div>}
              </div>

              {/* Allocation */}
              <div className="rounded-xl border bg-white p-5 mb-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xl">{isFresh ? "🏠" : "🔄"}</span>
                  <span className="font-bold text-gray-900">{isFresh ? "Dialokasikan ke Panti Asuhan" : "Rekomendasi Daur Ulang"}</span>
                </div>
                {!isFresh && (
                  <>
                    <p className="text-lg font-bold text-orange-700 mb-1">{result.ai_recommendation === "livestock" ? "Pakan Ternak" : "Pupuk Kompos"}</p>
                    <p className="text-sm text-gray-600">{result.ai_reason}</p>
                  </>
                )}
                {result.allocations?.[0]?.recipient && (
                  <div className="mt-3 text-sm text-gray-600">
                    <p className="font-medium">{result.allocations[0].recipient.name}</p>
                    <p>{result.allocations[0].recipient.address}</p>
                  </div>
                )}
              </div>

              <div className="flex gap-3">
                <button onClick={() => { setStep(1); setResult(null); setFile(null); setPreview(null); }} className="flex-1 border-2 border-green-700 text-green-700 font-semibold py-3 rounded-xl hover:bg-green-50">Donasi Lagi</button>
                <Link href="/profile" className="flex-1 bg-green-700 hover:bg-green-800 text-white font-semibold py-3 rounded-xl text-center">Lihat Histori</Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </AuthenticatedLayout>
  );
}
