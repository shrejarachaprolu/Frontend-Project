import { useEffect, useMemo, useRef, useState } from "react";

type Order = [string, string];
interface DepthData {
  b: Order[];
  a: Order[];
}

export function useOrderBook(symbol: string = "btcusdt") {
  // keep the real data in refs (mutate directly for O(1) updates)
  const bidsRef = useRef<Map<number, number>>(new Map());
  const asksRef = useRef<Map<number, number>>(new Map());
  const ws = useRef<WebSocket | null>(null);

  // this small counter just forces a React render every frame
  const [frame, setFrame] = useState(0);
  const rafRef = useRef<number | null>(null);

  // helper to trigger batched re-render
  const scheduleRender = () => {
    if (rafRef.current) return; // already scheduled for this frame
    rafRef.current = requestAnimationFrame(() => {
      rafRef.current = null;
      setFrame((v) => v + 1);
    });
  };

  useEffect(() => {
    const url = `wss://stream.binance.com:9443/ws/${symbol.toLowerCase()}@depth`;
    const socket = new WebSocket(url);
    ws.current = socket;

    socket.onopen = () => console.log(" Connected to Order Book");
    socket.onclose = () => console.log(" Disconnected from Order Book");
    socket.onerror = (e) => console.error(" WebSocket error:", e);

    socket.onmessage = (event) => {
      const data: DepthData = JSON.parse(event.data);
      applyDeltas(bidsRef.current, data.b);
      applyDeltas(asksRef.current, data.a);
      scheduleRender(); // batch UI updates once per frame (~60 fps)
    };

    return () => {
      socket.close();
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [symbol]);

  // only recompute sorted arrays when a new frame is triggered
  const bids = useMemo(
    () => Array.from(bidsRef.current.entries()).sort((a, b) => b[0] - a[0]),
    [frame]
  );
  const asks = useMemo(
    () => Array.from(asksRef.current.entries()).sort((a, b) => a[0] - b[0]),
    [frame]
  );

  return { bids: bids, asks: asks };
}

// update only affected price levels (no full rebuild)
function applyDeltas(map: Map<number, number>, deltas: Order[]) {
  for (const [priceStr, qtyStr] of deltas) {
    const price = parseFloat(priceStr);
    const qty = parseFloat(qtyStr);
    if (qty === 0) map.delete(price);
    else map.set(price, qty);
  }
}
