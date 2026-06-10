// NEW COMPONENT
import React from "react";
import Link from "next/link";
import { Heart } from "lucide-react";

export default function FloatingDonateButton() {
  return (
    <Link
      href="/upload"
      className="fixed bottom-[24px] right-[24px] z-40 flex items-center justify-center w-14 h-14 bg-[#16a34a] hover:bg-[#15803d] text-white rounded-full shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 transition-all duration-200 group"
      title="Donasi Sekarang"
    >
      <Heart className="w-6 h-6 animate-pulse group-hover:scale-110 transition-transform" />
      <span className="absolute right-16 scale-0 group-hover:scale-100 bg-gray-800 text-white text-xs px-2.5 py-1.5 rounded-lg shadow whitespace-nowrap origin-right transition-all duration-200 hidden md:block">
        Donasi Sekarang
      </span>
    </Link>
  );
}
