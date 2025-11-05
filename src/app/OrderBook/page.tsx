"use client";
import { useRouter } from "next/navigation";
import React, { useEffect, useMemo, useState, useCallback } from "react";
import { useOrderBook } from "@/hooks/useOrderBook";

//  Memoized row component to avoid re-rendering unchanged levels
const OrderRow = React.memo(function OrderRow({
  price,
  qty,
  total,
  width,
  side,
  onEnter,
  onLeave,
}: {
  price: number;
  qty: number;
  total: number;
  width: number;
  side: "bid" | "ask";
  onEnter: (e: React.MouseEvent, price: number, side: "bid" | "ask") => void;
  onLeave: () => void;
}) {
  return (
    <div
      className="relative flex justify-between text-sm px-2 py-0.5 cursor-pointer"
      onMouseEnter={(e) => onEnter(e, price, side)}
      onMouseLeave={onLeave}
    >
      <div
        className={`absolute ${
          side === "bid" ? "left-0 bg-green-900" : "right-0 bg-red-900"
        } top-0 h-full opacity-30 rounded-sm`}
        style={{ width: `${width}%` }}
      />
      <span
        className={`relative w-1/3 text-left ${
          side === "bid" ? "text-green-400" : "text-red-400"
        }`}
      >
        {price.toFixed(2)}
      </span>
      <span className="relative w-1/3 text-right">{qty.toFixed(4)}</span>
      <span className="relative w-1/3 text-right">{total.toFixed(4)}</span>
    </div>
  );
});

export default function OrderBook() {
  const { bids, asks } = useOrderBook("btcusdt");

  const [tooltip, setTooltip] = useState<{
    x: number;
    y: number;
    side: "bid" | "ask";
    price: number;
  } | null>(null);

  const [inSync, setInSync] = useState(true);
  const [depth, setDepth] = useState(30); //  selected depth (default 30)

  //  useMemo to avoid recomputing lists unless hook data changes
  const bidList = bids.slice(0, depth);
  const askList = asks.slice(0, depth);

  const [highestBid, highestBidQty] = bidList.length ? bidList[0] : [0, 0];
  const [lowestAsk, lowestAskQty] = askList.length ? askList[0] : [0, 0];
  const spread = useMemo(() => lowestAsk - highestBid, [lowestAsk, highestBid]);

  //  Memoize cumulative totals
  const bidTotals = useMemo(() => {
    let totals: number[] = [];
    let acc = 0;
    for (const [, qty] of bidList) {
      acc += qty;
      totals.push(acc);
    }
    return totals;
  }, [bidList]);

  const askTotals = useMemo(() => {
    let totals: number[] = [];
    let acc = 0;
    for (const [, qty] of askList) {
      acc += qty;
      totals.push(acc);
    }
    return totals;
  }, [askList]);

  const maxBidTotal = useMemo(() => Math.max(...bidTotals, 1), [bidTotals]);
  const maxAskTotal = useMemo(() => Math.max(...askTotals, 1), [askTotals]);

  //  Correctness check (throttled)
  useEffect(() => {
    const check = async () => {
      if (!bids.length || !asks.length) return;
      try {
        const res = await fetch(
          "https://api.binance.com/api/v3/depth?symbol=BTCUSDT&limit=5"
        );
        const data = await res.json();
        const restBid = parseFloat(data.bids[0][0]);
        const restAsk = parseFloat(data.asks[0][0]);
        const hookBid = bids[0]?.[0] ?? 0;
        const hookAsk = asks[0]?.[0] ?? 0;
        const diffBid = Math.abs(restBid - hookBid);
        const diffAsk = Math.abs(restAsk - hookAsk);
        setInSync(diffBid < 0.5 && diffAsk < 0.5);
      } catch (err) {
        console.error("Correctness check error:", err);
      }
    };
    const interval = setInterval(check, 7000);
    return () => clearInterval(interval);
  }, [bids, asks]);

  //  Memoize callbacks
  const handleMouseEnter = useCallback(
    (e: React.MouseEvent, price: number, side: "bid" | "ask") => {
      setTooltip({
        x: e.pageX + 12,
        y: e.pageY - 20,
        price,
        side,
      });
    },
    []
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (tooltip)
        setTooltip((prev) => prev && { ...prev, x: e.pageX + 12, y: e.pageY - 20 });
    },
    [tooltip]
  );

  const handleMouseLeave = useCallback(() => setTooltip(null), []);

  //  Tooltip data
  const tooltipData = useMemo(() => {
    if (!tooltip) return null;
    const list = tooltip.side === "bid" ? bidList : askList;
    const totals = tooltip.side === "bid" ? bidTotals : askTotals;
    const i = list.findIndex(([price]) => price === tooltip.price);
    if (i === -1) return null;
    const [price, qty] = list[i];
    const total = totals[i];
    return { ...tooltip, price, qty, total };
  }, [tooltip, bidList, askList, bidTotals, askTotals]);

  return (
    <div
      className="relative grid grid-cols-[1fr_auto_1fr] gap-4 bg-black text-white p-4 rounded-lg items-start"
      onMouseMove={handleMouseMove}
    >

      {/* ---------- SPREAD ---------- */}
      <div className="absolute top-8 right-4 transform -translate-xs">
        <div className="bg-yellow-500/10 border border-yellow-400/30 text-yellow-300 font-semibold text-sm px-4 py-1 rounded-md shadow-md backdrop-blur-sm transition-all duration-300">
          Spread: {spread.toFixed(2)} USDT
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

      {/* ---------- DEPTH SELECTOR ---------- */}
      <div className="absolute top-2 left-4 flex items-center gap-2 text-xs bg-gray-900/40 border border-gray-800 rounded-lg px-2 py-1 backdrop-blur-sm shadow-sm">
        <span className="text-gray-400 font-semibold pr-1">Depth:</span>
        <div className="flex gap-1">
          {[15, 30, 50, 100].map((d) => (
            <button
              key={d}
              onClick={() => setDepth(d)}
              className={`px-2 py-0.5 rounded-md border transition-all duration-200 font-semibold
                ${
                  depth === d
                    ? "bg-yellow-400/20 border-yellow-400/40 text-yellow-300 shadow-[0_0_8px_rgba(255,255,0,0.2)]"
                    : "bg-gray-950/40 border-gray-800 text-gray-400 hover:text-yellow-300 hover:border-yellow-400/40"
                }`}
            >
              {d}
            </button>
          ))}
        </div>
      </div>

      {/* ---------- BIDS ---------- */}
      <div className="pt-16">
        <h2 className="text-green-400 font-bold mb-2">Bids (Buy Orders)</h2>
        <div className="mb-3 p-2 bg-green-900/40 border border-green-700 rounded-md text-sm text-green-300 flex justify-between font-semibold">
          <span>Highest Bid:</span>
          <span>{highestBid.toFixed(2)} USDT</span>
          <span className="text-xs text-green-400">
            Qty: {highestBidQty.toFixed(4)}
          </span>
        </div>
        <div className="flex text-xs text-gray-400 border-b border-gray-700 pb-1 mb-1">
          <span className="w-1/3 text-left">Price (USDT)</span>
          <span className="w-1/3 text-right">Amount (BTC)</span>
          <span className="w-1/3 text-right">Total</span>
        </div>
        <div className="space-y-1">
          {bidList.map(([price, qty], i) => (
            <OrderRow
              key={price}
              price={price}
              qty={qty}
              total={bidTotals[i]}
              width={(bidTotals[i] / maxBidTotal) * 100}
              side="bid"
              onEnter={handleMouseEnter}
              onLeave={handleMouseLeave}
            />
          ))}
        </div>
      </div>

      {/* ---------- DIVIDER ---------- */}
      <div className="flex flex-col items-center justify-center">
        <div className="h-full w-[2px] bg-gradient-to-b from-green-500 via-yellow-400 to-red-500 animate-pulse rounded-full opacity-70"></div>
      </div>

      {/* ---------- ASKS ---------- */}
      <div className="pt-16">
        <h2 className="text-red-400 font-bold mb-2">Asks (Sell Orders)</h2>
        <div className="mb-3 p-2 bg-red-900/40 border border-red-700 rounded-md text-sm text-red-300 flex justify-between font-semibold">
          <span>Lowest Ask:</span>
          <span>{lowestAsk.toFixed(2)} USDT</span>
          <span className="text-xs text-red-400">
            Qty: {lowestAskQty.toFixed(4)}
          </span>
        </div>
        <div className="flex text-xs text-gray-400 border-b border-gray-700 pb-1 mb-1">
          <span className="w-1/3 text-left">Price (USDT)</span>
          <span className="w-1/3 text-right">Amount (BTC)</span>
          <span className="w-1/3 text-right">Total</span>
        </div>
        <div className="space-y-1">
          {askList.map(([price, qty], i) => (
            <OrderRow
              key={price}
              price={price}
              qty={qty}
              total={askTotals[i]}
              width={(askTotals[i] / maxAskTotal) * 100}
              side="ask"
              onEnter={handleMouseEnter}
              onLeave={handleMouseLeave}
            />
          ))}
        </div>
      </div>

      {/* ---------- TOOLTIP ---------- */}
      {tooltipData && (
        <div
          className={`absolute z-50 pointer-events-none text-xs px-3 py-2 rounded-md shadow-lg backdrop-blur-md border ${
            tooltipData.side === "bid"
              ? "bg-green-900/80 border-green-400/40 text-green-100"
              : "bg-red-900/80 border-red-400/40 text-red-100"
          }`}
          style={{ top: tooltipData.y, left: tooltipData.x }}
        >
          <div>Price: {tooltipData.price.toFixed(2)}</div>
          <div>Qty: {tooltipData.qty.toFixed(4)}</div>
          <div>Total: {tooltipData.total.toFixed(4)}</div>
        </div>
      )}
    </div>
  );
}
