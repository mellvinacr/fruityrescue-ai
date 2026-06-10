// NEW COMPONENT
"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { isLoggedIn, getUser, clearToken } from "@/lib/auth";
import { Leaf, Menu, X, User, LogOut, Settings, Home, Camera, Package, Heart, ChevronDown } from "lucide-react";
import FloatingDonateButton from "./FloatingDonateButton";

export default function AuthenticatedLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showDrawer, setShowDrawer] = useState(false);

  useEffect(() => {
    if (!isLoggedIn()) {
      router.push("/login");
    } else {
      setUser(getUser());
    }
  }, [router]);

  const handleLogout = () => {
    clearToken();
    router.push("/");
  };

  if (!isLoggedIn()) return null;

  const navLinks = [
    { label: "🏠 Beranda", href: "/dashboard", match: "/dashboard", icon: <Home className="w-5 h-5" /> },
    { label: "🔍 Scan Buah", href: "/upload", match: "/upload", icon: <Camera className="w-5 h-5" /> },
    { label: "📦 Stok Saya", href: "/profile", match: "/profile", icon: <Package className="w-5 h-5" /> },
    { label: "🤝 Donasi", href: "/upload", match: "/upload", icon: <Heart className="w-5 h-5" /> },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-[var(--font-body)] pb-16 md:pb-0">
      {/* Top Navbar */}
      <nav className="sticky top-0 z-30 bg-white border-b border-gray-100 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          {/* Left: Brand logo */}
          <Link href="/dashboard" className="flex items-center gap-2 font-[var(--font-heading)] font-bold text-xl text-gray-900">
            <Leaf className="w-6 h-6 text-[#16a34a]" />
            FruityRescue<span className="bg-[#16a34a] text-white text-xs px-1.5 py-0.5 rounded ml-0.5">AI</span>
          </Link>

          {/* Center: Desktop links */}
          <div className="hidden md:flex items-center gap-6 text-sm font-medium">
            {navLinks.map((link, idx) => {
              const active = pathname === link.match;
              return (
                <Link
                  key={idx}
                  href={link.href}
                  className={`transition-colors ${active ? "text-[#16a34a] font-bold" : "text-gray-600 hover:text-[#16a34a]"}`}
                >
                  {link.label}
                </Link>
              );
            })}
          </div>

          {/* Right: User menu & mobile hamburger */}
          <div className="flex items-center gap-3">
            <div className="relative">
              <button
                onClick={() => setShowDropdown(!showDropdown)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-gray-100 hover:bg-gray-50 transition-colors"
              >
                <div className="w-8 h-8 rounded-full bg-[#16a34a] text-white font-bold text-sm flex items-center justify-center">
                  {user?.name?.charAt(0) || "U"}
                </div>
                <ChevronDown className="w-4 h-4 text-gray-500 hidden md:block" />
              </button>

              {/* Dropdown Menu */}
              {showDropdown && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setShowDropdown(false)} />
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-100 py-2 text-sm z-20">
                    <Link
                      href="/profile"
                      onClick={() => setShowDropdown(false)}
                      className="flex items-center gap-2 px-4 py-2 hover:bg-gray-50 text-gray-700"
                    >
                      <User className="w-4 h-4" /> Lihat Profil
                    </Link>
                    <Link
                      href="/settings"
                      onClick={() => setShowDropdown(false)}
                      className="flex items-center gap-2 px-4 py-2 hover:bg-gray-50 text-gray-700"
                    >
                      <Settings className="w-4 h-4" /> Pengaturan
                    </Link>
                    <div className="border-t border-gray-100 my-1" />
                    <button
                      onClick={() => {
                        setShowDropdown(false);
                        handleLogout();
                      }}
                      className="flex items-center gap-2 px-4 py-2 hover:bg-gray-50 text-red-600 w-full text-left font-medium"
                    >
                      <LogOut className="w-4 h-4" /> Logout
                    </button>
                  </div>
                </>
              )}
            </div>

            {/* Mobile Hamburger Button */}
            <button
              onClick={() => setShowDrawer(true)}
              className="md:hidden p-2 rounded-xl text-gray-500 hover:bg-gray-100"
            >
              <Menu className="w-6 h-6" />
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Slide-in Drawer */}
      {showDrawer && (
        <>
          <div className="fixed inset-0 bg-black/40 z-40 transition-opacity" onClick={() => setShowDrawer(false)} />
          <div className="fixed top-0 right-0 bottom-0 w-64 bg-white z-50 p-6 flex flex-col shadow-2xl transition-transform duration-300 transform translate-x-0">
            <div className="flex justify-between items-center mb-8">
              <span className="font-bold text-gray-900 flex items-center gap-2"><Leaf className="w-5 h-5 text-[#16a34a]" /> Navigasi</span>
              <button onClick={() => setShowDrawer(false)} className="p-2 text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
            </div>
            <div className="flex flex-col gap-4 text-lg font-medium">
              {navLinks.map((link, idx) => {
                const active = pathname === link.match;
                return (
                  <Link
                    key={idx}
                    href={link.href}
                    onClick={() => setShowDrawer(false)}
                    className={`flex items-center gap-3 py-2 transition-colors ${active ? "text-[#16a34a] font-bold" : "text-gray-600 hover:text-[#16a34a]"}`}
                  >
                    {link.icon}
                    {link.label.replace(/[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDD10-\uDDFF]/g, "").trim()}
                  </Link>
                );
              })}
            </div>
            <div className="mt-auto border-t pt-6">
              <div className="text-sm font-semibold text-gray-800">{user?.name}</div>
              <div className="text-xs text-gray-500 mb-4">{user?.email}</div>
              <button onClick={handleLogout} className="flex items-center gap-2 text-sm text-red-600 font-medium hover:underline"><LogOut className="w-4 h-4" /> Logout</button>
            </div>
          </div>
        </>
      )}

      {/* Main Content Area */}
      <div className="flex-1 max-w-6xl w-full mx-auto p-4 md:p-6">
        {children}
      </div>

      {/* Mobile Bottom Navigation Bar (fixed bottom) */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 py-2 px-6 flex justify-between items-center z-30 shadow-lg">
        {navLinks.map((link, idx) => {
          const active = pathname === link.match;
          return (
            <Link
              key={idx}
              href={link.href}
              className={`flex flex-col items-center gap-1 text-[10px] font-semibold transition-colors ${active ? "text-[#16a34a]" : "text-gray-400"}`}
            >
              {link.icon}
              <span>{link.label.replace(/[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDD10-\uDDFF]/g, "").trim()}</span>
            </Link>
          );
        })}
      </div>

      {/* Floating Donation Button (FAB) */}
      {pathname !== "/upload" && <FloatingDonateButton />}
    </div>
  );
}
