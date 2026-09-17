"use client";

import { ArrowDownLeft, ArrowUpRight, Cpu } from "lucide-react";
import type { LogEntry } from "@/lib/mock-backend/types";

const STYLE = {
  in: { color: "var(--ok)", label: "entrada", Icon: ArrowDownLeft },
  out: { color: "var(--accent)", label: "salida", Icon: ArrowUpRight },
  internal: { color: "var(--warn)", label: "interno", Icon: Cpu },
} as const;

export default function EventLog({ logs }: { logs: LogEntry[] }) {
  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-[var(--line-soft)] px-4 py-3.5 sm:px-5">
        <p className="text-[13.5px] font-semibold">Registro de la conversación</p>
        <p className="mt-0.5 text-[12.5px] leading-snug text-[var(--text-muted)]">
          Cada mensaje que entra y cada respuesta que sale queda registrada con su contenido exacto.
        </p>
      </div>

      <div className="scrollarea min-h-0 flex-1 overflow-y-auto p-3 sm:p-4">
        {logs.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center gap-3 py-14 text-center">
            <div className="skeleton h-3 w-40" />
            <div className="skeleton h-3 w-56" />
            <div className="skeleton h-3 w-28" />
            <p className="mt-2 max-w-[260px] text-[12.5px] text-[var(--text-dim)]">
              Todavía no hay movimiento. El registro se llena solo cuando llega el primer mensaje.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-2.5">
            {logs
              .slice()
              .reverse()
              .map((log, index) => {
                const style = STYLE[log.direction];
                return (
                  <details
                    key={log.id}
                    className="anim-up group overflow-hidden rounded-xl border border-[var(--line-soft)] bg-[var(--surface)]"
                    style={{ animationDelay: `${Math.min(index, 6) * 30}ms` }}
                    open={index === 0}
                  >
                    <summary className="flex cursor-pointer list-none items-center gap-2.5 px-3.5 py-2.5 transition hover:bg-[var(--surface-2)]">
                      <span
                        className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg"
                        style={{ background: "var(--surface-3)", color: style.color }}
                      >
                        <style.Icon size={14} />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="mono block truncate font-semibold text-[var(--text)]">{log.label}</span>
                        <span className="text-[11px] text-[var(--text-dim)]">
                          {style.label} · {new Date(log.at).toLocaleTimeString("es-PE", { hour12: false })}
                        </span>
                      </span>
                    </summary>
                    <pre className="scrollarea mono overflow-x-auto border-t border-[var(--line-soft)] bg-[var(--bg)] p-3 leading-[1.6] text-[var(--text-muted)]">
{JSON.stringify(log.payload, null, 2)}
                    </pre>
                  </details>
                );
              })}
          </div>
        )}
      </div>
    </div>
  );
}
