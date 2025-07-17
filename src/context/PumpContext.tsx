// src/context/PumpContext.tsx
import React, { createContext, useState, useEffect, useRef, useCallback } from "react";

export interface PumpFrame {
  pump_id: number;
  status: string;
  realtime?: {
    volume: number;
    price_per_unit: number;
    total_amount: number;
    grade: number;
  };
  transaction?: {
    volume: number;
    price_per_unit: number;
    total_amount: number;
    grade: number;
  };
  last_transaction?: {
    volume: number;
    price_per_unit: number;
    total_amount: number;
    grade: number;
  };
}

type PumpStore = Record<number, PumpFrame>;

export const PumpContext = createContext<PumpStore>({});

export const PumpProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [frames, setFrames] = useState<PumpStore>({});
  const wsRef = useRef<WebSocket | null>(null);

  const connect = useCallback(() => {
      if (wsRef.current) return;
  
      const ws = new WebSocket("ws://localhost:3000/ws/pumps");
      wsRef.current = ws;
  
      ws.onmessage = (evt) => {
        const { pumps: frames } = JSON.parse(evt.data) as { pumps: PumpFrame[] };
        setFrames((prev) => {
          const next = { ...prev };
          frames.forEach((f) => (next[f.pump_id] = f));
          return next;
        });
      };
  
      ws.onclose = () => {
        console.warn("WS closed – reconnecting in 3 s …");
        setTimeout(() => {
          if (wsRef.current === ws) {
            wsRef.current = null;
            connect();
          }
        }, 3000);
      };
  
      ws.onerror = (evt) => {
        console.error("WS error", evt);
      };
      ws.onopen = () => console.log("WS connected");
    }, []);
  
    useEffect(() => {
      connect();
      return () => wsRef.current?.close();
    }, [connect]);

  return <PumpContext.Provider value={frames}>{children}</PumpContext.Provider>;
};
