"use client";
import { useRouter } from "next/navigation";
import { useTrades } from "@/hooks/useTrades";
import { useEffect, useMemo, useState } from "react";

// Pulse item type
interface Pulse {
  id: number;
  side: "buy" | "sell";
  width: number;
}

export default function LiveTrades() {
  const trades = useTrades("btcusdt");
  const [pulses, setPulses] = useState<Pulse[]>([]);
  const [flashIds, setFlashIds] = useState<Set<number>>(new Set());
  const [inSync, setInSync] = useState(true);

  //  Correctness check for live trades (throttled)
useEffect(() => {
  const check = async () => {
    if (!trades.length) return; // no trades yet, skip
    try {
      const res = await fetch(
        "https://api.binance.com/api/v3/trades?symbol=BTCUSDT&limit=1"
      );
      const data = await res.json();
      const restTrade = data[0]; // latest trade from REST
      const socketTrade = trades[0]; // latest trade from your WebSocket

      const restPrice = parseFloat(restTrade.price);
      const restQty = parseFloat(restTrade.qty);
      const restTime = restTrade.time;

      const socketPrice = socketTrade.price;
      const socketQty = socketTrade.quantity;
      const socketTime = socketTrade.time;

      const priceDiff = Math.abs(restPrice - socketPrice);
      const qtyDiff = Math.abs(restQty - socketQty);
      const timeDiff = Math.abs(restTime - socketTime);

      //  allow small drift (e.g., a few ms or minor rounding diff)
      const isClose =
        priceDiff < 1 && qtyDiff < 0.001 && timeDiff < 10_000; // 10 seconds

      setInSync(isClose);
    } catch (err) {
      console.error("Trade correctness check error:", err);
    }
  };

  const interval = setInterval(check, 7000);
  return () => clearInterval(interval);
}, [trades]);


  //  Create pulse on each new trade
  useEffect(() => {
    if (trades.length === 0) return;
    const t = trades[0];
    const side = t.isBuyerMaker ? "sell" : "buy";
    const width = Math.min(Math.max(t.quantity * 300), 100);
    const id = t.id;

    setPulses((prev) => [{ id, side, width }, ...prev.slice(0, 12)]);

    const timeout = setTimeout(
      () => setPulses((prev) => prev.filter((p) => p.id !== id)),
      1200
    );
    return () => clearTimeout(timeout);
  }, [trades]);

  //  Flash animation for new trade row
  useEffect(() => {
    if (trades.length > 0) {
      const newestId = trades[0].id;
      setFlashIds((prev) => new Set(prev).add(newestId));
      const timeout = setTimeout(() => {
        setFlashIds((prev) => {
          const next = new Set(prev);
          next.delete(newestId);
          return next;
        });
      }, 400);
      return () => clearTimeout(timeout);
    }
  }, [trades]);

  //  Compute buy/sell ratio for gauge
  const { buyRatio, sellRatio } = useMemo(() => {
    const buys = trades.filter((t) => !t.isBuyerMaker).reduce((s, t) => s + t.quantity, 0);
    const sells = trades.filter((t) => t.isBuyerMaker).reduce((s, t) => s + t.quantity, 0);
    const total = buys + sells || 1;
    return {
      buyRatio: (buys / total) * 100,
      sellRatio: (sells / total) * 100,
    };
  }, [trades]);

  return (
    <div className="bg-black border border-gray-800 rounded-xl shadow-xl p-4 text-white backdrop-blur-md space-y-6">
      {/* ---------- HEADER ---------- */}
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-xl font-extrabold bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-500 bg-clip-text text-transparent tracking-wide drop-shadow-lg">
          Recent 50 Trades
        </h2>
      </div>

      {/* ---------- LIVE PULSE BARS ---------- */}
      <div className="h-32 flex flex-col justify-end overflow-hidden space-y-1 bg-gray-950/40 border border-gray-800 rounded-md p-3">
        <h3 className="text-xs text-gray-400 mb-1">Recent Trade Pulses</h3>
        {pulses.map((p) => (
          <div
            key={p.id}
            className={`h-2 rounded-full transition-all duration-700 ${
              p.side === "buy" ? "bg-green-500/70" : "bg-red-500/70"
            }`}
            style={{
              width: `${p.width}%`,
              opacity: 0.9,
              transition: "width 1s ease-out, opacity 1s ease-out",
            }}
          />
        ))}
      </div>

      {/* ---------- BUY/SELL RATIO GAUGE ---------- */}
      <div className="relative h-6 bg-gray-800 rounded-full overflow-hidden">
        <div
          className="absolute left-0 top-0 h-full bg-green-600 transition-all duration-500"
          style={{ width: `${buyRatio}%` }}
        />
        <div
          className="absolute right-0 top-0 h-full bg-red-600 transition-all duration-500"
          style={{ width: `${sellRatio}%` }}
        />
        <div className="absolute inset-0 flex justify-center items-center text-xs text-gray-300 font-semibold">
          Buy {buyRatio.toFixed(1)}% / Sell {sellRatio.toFixed(1)}%
        </div>
      </div>
      {/* ---------- SYNC STATUS ---------- */}
      <div className="absolute top-2 right-4 flex items-center gap-2 text-xs">
        <div
          className={`w-3 h-3 rounded-full ${
            inSync ? "bg-green-400" : "bg-red-500 animate-pulse"
          }`}
        />
        <span
          className={`${
            inSync ? "text-green-400" : "text-red-400"
          } font-semibold`}
        >
          {inSync ? "In Sync" : "Out of Sync"}
        </span>
      </div>
      {/* ---------- TRADES TABLE ---------- */}
      <div className="overflow-hidden rounded-lg border border-gray-800/50 bg-gray-950/40">
        <table className="w-full text-sm">
          <thead className="bg-gray-800/50 text-gray-400 text-xs uppercase tracking-wide">
            <tr>
              <th className="text-left px-3 py-2">Price (USDT)</th>
              <th className="text-left px-3 py-2">Qty (BTC)</th>
              <th className="text-left px-3 py-2">Side</th>
              <th className="text-left px-3 py-2">Time</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800">
            {trades.map((t) => {
              const isBuy = !t.isBuyerMaker;
              const flash = flashIds.has(t.id);
              return (
                <tr
                  key={t.id}
                  className={`transition-colors duration-300 ${
                    isBuy
                      ? flash
                        ? "bg-green-700/50"
                        : "text-green-400"
                      : flash
                      ? "bg-red-700/50"
                      : "text-red-400"
                  } hover:bg-gray-800/40`}
                >
                  <td className="px-3 py-1.5 font-mono">{t.price.toFixed(2)}</td>
                  <td className="px-3 py-1.5 font-mono">{t.quantity.toFixed(4)}</td>
                  <td className="px-3 py-1.5">{isBuy ? "BUY" : "SELL"}</td>
                  <td className="px-3 py-1.5 text-gray-400">
                    {new Date(t.time).toLocaleTimeString("en-US", {
                      hour12: false,
                      minute: "2-digit",
                      second: "2-digit",
                    })}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
