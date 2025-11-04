import { useEffect, useRef, useState } from "react";

export interface Trade {
  id: number;
  price: number;
  quantity: number;
  isBuyerMaker: boolean; // true => seller initiated (red), false => buyer initiated (green)
  time: number;
}

export function useTrades(symbol: string = "btcusdt") {
  const [trades, setTrades] = useState<Trade[]>([]);
  const ws = useRef<WebSocket | null>(null);

  useEffect(() => {
    const url = `wss://stream.binance.com:9443/ws/${symbol}@aggTrade`;
    const socket = new WebSocket(url);
    ws.current = socket;

    socket.onopen = () => console.log("Connected to Trades stream");
    socket.onclose = () => console.log("Disconnected from Trades stream");
    socket.onerror = (err) => console.error(" Trade socket error:", err);

    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      const trade: Trade = {
        id: data.a,
        price: parseFloat(data.p),
        quantity: parseFloat(data.q),
        isBuyerMaker: data.m,
        time: data.T,
      };
      // Add new trade to the top of the list
      setTrades((prev) => [trade, ...prev.slice(0, 49)]);
    };

    return () => socket.close();
  }, [symbol]);

  return trades;
}
