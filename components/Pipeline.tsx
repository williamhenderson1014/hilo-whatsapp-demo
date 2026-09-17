"use client";

import {
  ArrowDownRight,
  BrainCircuit,
  CheckCircle2,
  CornerUpRight,
  Database,
  Gauge,
  Inbox,
  Loader2,
  MessageSquareText,
  ShieldAlert,
  Webhook,
} from "lucide-react";
import type { RouteDecision } from "@/lib/mock-backend/types";
import { CONFIDENCE_FLOOR } from "@/lib/mock-backend/engine";

const ICONS: Record<string, typeof Webhook> = {
  webhook: Webhook,
  queue: Inbox,
  classify: BrainCircuit,
  confidence: Gauge,
  context: ArrowDownRight,
  lookup: Database,
  policy: ShieldAlert,
  reply: MessageSquareText,
  handoff: CornerUpRight,
};

const TONE: Record<string, { color: string; bg: string; border: string }> = {
  ok: { color: "var(--ok)", bg: "var(--ok-soft)", border: "rgba(16,185,129,0.35)" },
  warn: { color: "var(--warn)", bg: "var(--warn-soft)", border: "rgba(245,158,11,0.35)" },
  danger: { color: "var(--danger)", bg: "var(--danger-soft)", border: "rgba(244,63,94,0.35)" },
};

const ACTION_LABEL: Record<string, string> = {
  auto_reply: "Respuesta automática",
  after_hours: "Respuesta fuera de horario",
  dynamic_reply: "Respuesta con datos reales",
  ask_data: "Pregunta de seguimiento",
  escalate: "Derivado a una persona",
  template_required: "Requiere plantilla aprobada",
};

export default function Pipeline({
  decision,
  activeStage,
  running,
}: {
  decision: RouteDecision | null;
  activeStage: string | null;
  running: boolean;
}) {
  if (!decision && !running) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-4 px-6 py-12 text-center">
        <span
          className="flex h-14 w-14 items-center justify-center rounded-2xl"
          style={{ background: "var(--accent-soft)", color: "var(--accent)" }}
        >
          <BrainCircuit size={26} />
        </span>
        <div>
          <p className="text-[15px] font-semibold">El motor está en reposo</p>
          <p className="mt-1 max-w-[280px] text-[13px] text-[var(--text-muted)]">
            Envía un mensaje desde el teléfono y sigue aquí, paso por paso, qué hace el sistema con él.
          </p>
        </div>
      </div>
    );
  }

  const steps = decision?.steps ?? [];
  const confidence = decision?.confidence ?? 0;
  const total = steps.reduce((sum, step) => sum + step.ms, 0);
  const activeIndex = steps.findIndex((step) => step.id === activeStage);

  return (
    <div className="flex h-full flex-col gap-4 p-4 sm:p-5">
      <div className="rounded-2xl border border-[var(--line)] bg-[var(--surface-2)] p-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="min-w-0">
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--text-dim)]">
              Intención detectada
            </p>
            <p className="truncate text-[15px] font-bold">{decision?.intentTitle ?? "Analizando"}</p>
          </div>
          <span
            className="chip"
            style={{
              color: decision?.action === "escalate" ? "var(--warn)" : "var(--ok)",
              borderColor: decision?.action === "escalate" ? "rgba(245,158,11,0.35)" : "rgba(16,185,129,0.35)",
              background: decision?.action === "escalate" ? "var(--warn-soft)" : "var(--ok-soft)",
            }}
          >
            {running ? <Loader2 size={13} className="animate-spin" /> : <CheckCircle2 size={13} />}
            {running ? "Procesando" : ACTION_LABEL[decision?.action ?? "auto_reply"]}
          </span>
        </div>

        <div className="mt-4">
          <div className="mb-1.5 flex items-center justify-between text-[12px]">
            <span className="text-[var(--text-muted)]">Confianza</span>
            <span className="mono font-semibold" style={{ color: confidence >= CONFIDENCE_FLOOR ? "var(--ok)" : "var(--warn)" }}>
              {Math.round(confidence * 100)}%
            </span>
          </div>
          <div className="relative h-2.5 w-full overflow-hidden rounded-full bg-[var(--surface-3)]">
            <div
              className="h-full rounded-full transition-[width] duration-700 ease-out"
              style={{
                width: `${Math.max(confidence * 100, 3)}%`,
                background:
                  confidence >= CONFIDENCE_FLOOR
                    ? "linear-gradient(90deg, #059669, #10b981)"
                    : "linear-gradient(90deg, #b45309, #f59e0b)",
              }}
            />
            <span
              className="absolute top-0 h-full w-[2px] bg-[var(--text)]/60"
              style={{ left: `${CONFIDENCE_FLOOR * 100}%` }}
              title="Umbral mínimo"
            />
          </div>
          <p className="mt-1.5 text-[11.5px] text-[var(--text-dim)]">
            Umbral mínimo {Math.round(CONFIDENCE_FLOOR * 100)}%. Por debajo, el sistema no responde solo.
          </p>
        </div>
      </div>

      <div className="scrollarea min-h-0 flex-1 overflow-y-auto pr-1">
        <ol className="relative flex flex-col gap-2.5">
          {steps.map((step, index) => {
            const Icon = ICONS[step.id] ?? MessageSquareText;
            const tone = TONE[step.status];
            const isActive = running && step.id === activeStage;
            const isDone = !running || (activeIndex >= 0 && index < activeIndex);
            return (
              <li
                key={step.id}
                className="anim-up flex items-start gap-3 rounded-xl border p-3 transition"
                style={{
                  animationDelay: `${index * 40}ms`,
                  background: isActive ? tone.bg : "var(--surface)",
                  borderColor: isActive ? tone.border : "var(--line-soft)",
                  opacity: isDone || isActive ? 1 : 0.45,
                }}
              >
                <span
                  className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg"
                  style={{
                    background: tone.bg,
                    color: tone.color,
                    animation: isActive ? "pulseRing 1.2s infinite" : undefined,
                  }}
                >
                  <Icon size={15} />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-baseline justify-between gap-2">
                    <p className="truncate text-[13.5px] font-semibold">{step.label}</p>
                    <span className="mono shrink-0 text-[var(--text-dim)]">{step.ms} ms</span>
                  </div>
                  <p className="mt-0.5 text-[12.5px] leading-snug text-[var(--text-muted)]">{step.detail}</p>
                </div>
              </li>
            );
          })}
        </ol>
      </div>

      {decision && !running && (
        <div
          className="anim-up rounded-xl border p-3.5"
          style={{ borderColor: "var(--line)", background: "var(--surface-2)" }}
        >
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--text-dim)]">
            Por qué se resolvió así
          </p>
          <p className="mt-1 text-[13px] leading-snug text-[var(--text-muted)]">{decision.reason}</p>
          <p className="mono mt-2 text-[var(--text-dim)]">Tiempo total del recorrido: {total} ms</p>
        </div>
      )}
    </div>
  );
}
