import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Inter } from "next/font/google";
import "./globals.css";
import ChatbotWidget from "@/components/ChatbotWidget";

const plusJakarta = Plus_Jakarta_Sans({
  variable: "--font-heading",
  subsets: ["latin"],
  weight: ["700", "800"],
});

const inter = Inter({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  title: "FruityRescue AI — Selamatkan Buah, Selamatkan Bumi",
  description: "Platform AI untuk menyelamatkan buah surplus dari pemborosan. SDGs 2 & 12.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id" className={`${plusJakarta.variable} ${inter.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col font-[var(--font-body)]">
        {children}
        <ChatbotWidget />
      </body>
    </html>
  );
}
