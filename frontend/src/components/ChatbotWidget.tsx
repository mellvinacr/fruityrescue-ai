"use client";

import { useState, useRef, useEffect } from "react";
import { sendChatMessage } from "@/lib/api";
import { MessageCircle, X, Send, Loader2 } from "lucide-react";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const QUICK_REPLIES = ["Cara donasi", "Buah apa saja?", "Info SDGs", "Cara kompos"];

export default function ChatbotWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", content: "Halo! Saya FruityAssist 👋 Ada yang bisa saya bantu tentang donasi buah atau FruityRescue AI?" },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  const send = async (text: string) => {
    if (!text.trim()) return;
    const userMsg: Message = { role: "user", content: text.trim() };
    const newHistory = [...messages, userMsg];
    setMessages(newHistory);
    setInput("");
    setLoading(true);
    try {
      const res = await sendChatMessage(text, newHistory.map(m => ({ role: m.role, content: m.content })));
      setMessages(prev => [...prev, { role: "assistant", content: res.reply }]);
    } catch {
      setMessages(prev => [...prev, { role: "assistant", content: "Maaf, terjadi kesalahan. Coba lagi nanti." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => setOpen(!open)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-green-700 text-white shadow-lg flex items-center justify-center hover:bg-green-800 transition-all"
      >
        {open ? <X size={24} /> : <MessageCircle size={24} />}
        {!open && <span className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 bg-green-400 rounded-full animate-ping" />}
      </button>

      {/* Chat popup */}
      {open && (
        <div className="fixed bottom-24 right-6 z-50 w-80 bg-white rounded-2xl shadow-2xl border border-gray-200 flex flex-col overflow-hidden">
          <div className="bg-green-700 text-white px-4 py-3 rounded-t-2xl flex items-center gap-2">
            <span className="font-bold">🤖 FruityAssist</span>
            <span className="ml-auto flex items-center gap-1 text-xs opacity-80">
              <span className="w-2 h-2 bg-green-300 rounded-full" /> Online
            </span>
          </div>

          <div className="h-72 overflow-y-auto px-4 py-3 flex flex-col gap-3 bg-gray-50">
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[85%] px-3 py-2 text-sm ${
                  m.role === "user"
                    ? "bg-green-700 text-white rounded-2xl rounded-br-sm"
                    : "bg-gray-200 text-gray-800 rounded-2xl rounded-bl-sm"
                }`}>
                  {m.content}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-gray-200 text-gray-500 rounded-2xl rounded-bl-sm px-4 py-2 text-sm flex items-center gap-1">
                  <Loader2 className="w-3 h-3 animate-spin" /> Mengetik...
                </div>
              </div>
            )}
            <div ref={endRef} />
          </div>

          {/* Quick replies */}
          <div className="px-3 py-2 flex gap-2 overflow-x-auto border-t bg-white">
            {QUICK_REPLIES.map(q => (
              <button key={q} onClick={() => send(q)} className="text-xs whitespace-nowrap px-3 py-1.5 rounded-full bg-green-50 text-green-700 border border-green-200 hover:bg-green-100 transition-colors">
                {q}
              </button>
            ))}
          </div>

          <div className="flex border-t p-2 gap-2 bg-white">
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === "Enter" && send(input)}
              placeholder="Ketik pesan..."
              className="flex-1 text-sm px-3 py-2 rounded-lg border outline-none focus:ring-1 focus:ring-green-500"
            />
            <button onClick={() => send(input)} disabled={loading} className="w-9 h-9 rounded-lg bg-green-700 text-white flex items-center justify-center hover:bg-green-800 disabled:opacity-50">
              <Send size={16} />
            </button>
          </div>
        </div>
      )}
    </>
  );
}
