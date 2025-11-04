"use client";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  const options = [
    { label: "View Order Book", color: "from-emerald-500/20 via-green-600/20 to-emerald-800/20", glow: "shadow-[0_0_25px_rgba(16,185,129,0.6)] hover:shadow-[0_0_40px_rgba(16,185,129,0.9)]", text: "text-emerald-300" , route: "/OrderBook"},
    { label: "View Recent Trades", color: "from-cyan-500/20 via-blue-600/20 to-indigo-800/20", glow: "shadow-[0_0_25px_rgba(6,182,212,0.6)] hover:shadow-[0_0_40px_rgba(6,182,212,0.9)]", text: "text-cyan-300", route: "/RecentTrades" },
    { label: "View Both", color: "from-fuchsia-500/20 via-purple-600/20 to-indigo-800/20", glow: "shadow-[0_0_25px_rgba(217,70,239,0.6)] hover:shadow-[0_0_40px_rgba(217,70,239,0.9)]", text: "text-fuchsia-300", route: "/Both" },
  ];

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-950 via-gray-900 to-black text-white flex flex-col items-center justify-center p-8">
      <h1 className="text-4xl font-extrabold mb-10 bg-gradient-to-r from-green-400 via-cyan-400 to-purple-400 bg-clip-text text-transparent tracking-wide animate-gradient-x">
        Welcome to the pulse of the market
      </h1>

      <div className="grid gap-6 md:grid-cols-3 w-full max-w-4xl">
        {options.map((opt) => (
          <button
            key={opt.route}
            onClick={() => router.push(opt.route)}
            className={`p-8 rounded-2xl bg-gradient-to-br ${opt.color} bg-opacity-20 border border-white/10 
              hover:scale-105 hover:shadow-[0_0_25px_rgba(255,255,255,0.15)] 
              transition-all duration-300 backdrop-blur-xl font-extrabold text-xl tracking-wide`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      <p className="mt-10 text-sm text-gray-400">Where every trade lights up the board.</p>
    </main>
  );
}
