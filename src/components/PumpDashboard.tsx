import { useEffect, useRef, useState, useCallback } from "react";

/** Frame that arrives via the WS stream */
export interface PumpFrame {
  pump_id: number;
  status: string; // IDLE | AUTHORIZED | DISPENSING | COMPLETE | ERROR ...
  last_updated: string;
  error_message?: string | null;
  raw_status_code?: string;
  wire_format?: string;
  realtime?: PumpMetrics;
  transaction?: PumpMetrics;
  last_transaction?: PumpMetrics;
}

export type PumpMetrics = {
  volume: number;
  price_per_unit: number;
  total_amount: number;
  grade: number;
};

const statusColour: Record<string, string> = {
  IDLE: "bg-gray-200 text-gray-800",
  AUTHORIZED: "bg-amber-200 text-amber-800",
  DISPENSING: "bg-blue-200 text-blue-800",
  COMPLETE: "bg-green-200 text-green-800",
  ERROR: "bg-red-200 text-red-800",
};

// Map from API grade index to actual octane value
const gradeMap: Record<number, number> = {
  0: 80,
  1: 100,
  2: 92,
  3: 95,
};

export default function PumpDashboard() {
  const [pumps, setPumps] = useState<Record<number, PumpFrame>>({});
  const wsRef = useRef<WebSocket | null>(null);

  /** Helper to (re)connect */
  const connect = useCallback(() => {
    if (wsRef.current) return;

    const ws = new WebSocket("ws://localhost:3000/ws/pumps");
    wsRef.current = ws;

    ws.onmessage = (evt) => {
      const { pumps: frames } = JSON.parse(evt.data) as { pumps: PumpFrame[] };
      setPumps((prev) => {
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

  return (
    <div className="grid gap-4 grid-cols-[repeat(auto-fill,minmax(280px,1fr))] mb-8">
      {Object.values(pumps)
        .sort((a, b) => a.pump_id - b.pump_id)
        .map((pump) => {
          // decide which metrics block to show as “primary”
          const metrics: Partial<PumpMetrics> =
            pump.realtime ?? pump.transaction ?? pump.last_transaction ?? {};
          // Convert API grade index to actual octane value
          const displayGrade =
            metrics.grade !== undefined && gradeMap[metrics.grade] !== undefined
              ? gradeMap[metrics.grade]
              : metrics.grade;

          const colour = statusColour[pump.status] ?? statusColour.IDLE;

          return (
            <div
              key={pump.pump_id}
              className="border rounded-lg p-4 flex flex-col space-y-3"
            >
              {/* header */}
              <div className="flex items-center justify-between">
                <h2 className="font-medium text-lg">ТРК-{pump.pump_id}</h2>
                <span className={`px-2 py-0.5 rounded text-sm ${colour}`}>
                  {pump.status}
                </span>
              </div>

              {/* live / txn figures */}
              <div className="text-sm grid grid-cols-[auto_1fr] gap-x-2 gap-y-1">
                <span>Литров:</span>
                <span>{metrics.volume?.toFixed(2) ?? "—"}</span>
                <span>c/л:</span>
                <span>{metrics.price_per_unit?.toLocaleString() ?? "—"}</span>
                <span>Всего:</span>
                <span>{metrics.total_amount?.toLocaleString() ?? "—"}</span>
                <span>Марка:</span>
                <span>{displayGrade ?? "—"}</span>
              </div>

              {/* progress during DISPENSING */}
              {pump.realtime && (
                <progress
                  className="w-full h-2"
                  max={50}
                  value={pump.realtime.volume}
                />
              )}
              {/* last finished transaction (when pump idle) */}
              {pump.last_transaction && (
                <div className="text-xs border-t pt-1 grid grid-cols-[auto_1fr] gap-x-2 gap-y-0.5">
                  <span className="font-medium col-span-2">
                    Последняя заправка
                  </span>
                  <span>Литров:</span>
                  <span>{pump.last_transaction.volume.toFixed(2)}</span>
                  <span>c/л:</span>
                  <span>
                    {pump.last_transaction.price_per_unit.toLocaleString()}
                  </span>
                  <span>Всего:</span>
                  <span>
                    {pump.last_transaction.total_amount.toLocaleString()}
                  </span>
                  <span>Марка:</span>
                  <span>
                    {gradeMap[pump.last_transaction.grade] ??
                      pump.last_transaction.grade}
                  </span>
                </div>
              )}

              {/* meta info */}
              <div className="text-xs text-gray-500 border-t pt-1 grid grid-cols-[auto_1fr] gap-x-2 gap-y-0.5 mt-auto">
                <span>Обновлено:</span>
                <span>{new Date(pump.last_updated).toLocaleTimeString()}</span>
                <span>Raw:</span>
                <span>{pump.raw_status_code ?? "—"}</span>
                <span>Wire:</span>
                <span>{pump.wire_format ?? "—"}</span>
                {pump.error_message && (
                  <>
                    <span>Ошибка:</span>
                    <span className="text-red-600">{pump.error_message}</span>
                  </>
                )}
              </div>
            </div>
          );
        })}
    </div>
  );
}
