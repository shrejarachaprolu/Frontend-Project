"use client";
import OrderBook from "@/app/OrderBook/page";
import RecentTrades from "@/app/RecentTrades/page";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();
  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-950 via-gray-900 to-black text-white p-8 grid md:grid-cols-2 gap-8">
      {/* ---------- ORDER BOOK PANEL ---------- */}
      <div className="bg-gradient-to-br from-gray-900/70 to-black/70 border border-green-400/20 rounded-xl p-6 shadow-[0_0_25px_rgba(34,197,94,0.15)] hover:shadow-[0_0_30px_rgba(34,197,94,0.25)] transition-all duration-300 backdrop-blur-xl">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-extrabold bg-gradient-to-r from-green-400 via-yellow-300 to-green-500 bg-clip-text text-transparent tracking-wide animate-gradient-x">
            Order Book
          </h1>
          <span className="text-xs text-green-300 font-semibold uppercase tracking-widest bg-green-900/30 px-2 py-1 rounded-md border border-green-600/30">
            BTC/USDT
          </span>
        </div>
        <OrderBook />
      </div>

      {/* ---------- LIVE TRADES PANEL ---------- */}
      <div className="bg-gradient-to-br from-gray-900/70 to-black/70 border border-cyan-400/20 rounded-xl p-6 shadow-[0_0_25px_rgba(6,182,212,0.15)] hover:shadow-[0_0_30px_rgba(6,182,212,0.25)] transition-all duration-300 backdrop-blur-xl">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-extrabold bg-gradient-to-r from-purple-400 via-blue-400 to-cyan-400 bg-clip-text text-transparent tracking-wide animate-gradient-x">
            Live Trades
          </h1>
          <span className="text-xs text-cyan-300 font-semibold uppercase tracking-widest bg-cyan-900/30 px-2 py-1 rounded-md border border-cyan-600/30">
            Real-Time
          </span>
        </div>
        <RecentTrades />
      </div>
      <button
        onClick={() => router.push("/")}
        className="mt-8 text-sm text-gray-400 hover:text-yellow-300 transition-colors"
      >
        ← Back to Selection
      </button>
    </main>
  );
}
