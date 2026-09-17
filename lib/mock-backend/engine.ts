import { orders } from "./data";
import type { KnowledgeEntry, Order, PipelineStep, RouteDecision, RouteInput } from "./types";

export const WINDOW_MS = 24 * 60 * 60 * 1000;
export const CONFIDENCE_FLOOR = 0.55;

const STOP_WORDS = new Set([
  "de",
  "la",
  "el",
  "los",
  "las",
  "un",
  "una",
  "mi",
  "me",
  "que",
  "por",
  "para",
  "con",
  "en",
  "y",
  "a",
  "es",
  "su",
  "al",
  "del",
  "lo",
  "se",
  "hola",
  "buenas",
  "buenos",
  "dias",
  "tardes",
]);

const SENSITIVE = [
  { token: "reclamo", label: "Reclamo formal" },
  { token: "queja", label: "Queja" },
  { token: "cobraron", label: "Problema de cobro" },
  { token: "cobro", label: "Problema de cobro" },
  { token: "duplicado", label: "Cobro duplicado" },
  { token: "dos veces", label: "Cobro duplicado" },
  { token: "estafa", label: "Acusacion grave" },
  { token: "abogado", label: "Riesgo legal" },
  { token: "denuncia", label: "Riesgo legal" },
  { token: "indignado", label: "Cliente molesto" },
  { token: "pesimo", label: "Cliente molesto" },
  { token: "cancelar", label: "Riesgo de baja" },
  { token: "devolver el dinero", label: "Pedido de reembolso" },
];

export function normalize(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9\s-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function tokens(value: string): string[] {
  return normalize(value)
    .split(" ")
    .filter((word) => word.length > 2 && !STOP_WORDS.has(word));
}

function scorePattern(inputTokens: string[], pattern: string): number {
  const patternTokens = tokens(pattern);
  if (patternTokens.length === 0) return 0;
  let hits = 0;
  for (const token of patternTokens) {
    if (
      inputTokens.some(
        (candidate) =>
          candidate === token ||
          (token.length > 4 && candidate.startsWith(token.slice(0, 4))) ||
          (candidate.length > 4 && token.startsWith(candidate.slice(0, 4))),
      )
    ) {
      hits += 1;
    }
  }
  const coverage = hits / patternTokens.length;
  const density = hits / Math.max(inputTokens.length, 1);
  return coverage * 0.78 + density * 0.22;
}

export function matchKnowledge(text: string, knowledge: KnowledgeEntry[]) {
  const inputTokens = tokens(text);
  let best: { entry: KnowledgeEntry; score: number } | null = null;
  for (const entry of knowledge) {
    let entryScore = 0;
    for (const pattern of entry.patterns) {
      entryScore = Math.max(entryScore, scorePattern(inputTokens, pattern));
    }
    if (!best || entryScore > best.score) {
      best = { entry, score: entryScore };
    }
  }
  if (!best) return null;
  const confidence = Math.min(0.98, Number(best.score.toFixed(2)));
  return { entry: best.entry, confidence };
}

export function findOrder(text: string): Order | undefined {
  const match = normalize(text).match(/\b([a-z])\s?-?\s?(\d{4})\b/);
  if (!match) return undefined;
  const code = `${match[1].toUpperCase()}-${match[2]}`;
  return orders.find((order) => order.code === code);
}

export function windowRemaining(lastCustomerAt: number, now: number): number {
  return Math.max(0, lastCustomerAt + WINDOW_MS - now);
}

export function isWindowOpen(lastCustomerAt: number, now: number): boolean {
  return windowRemaining(lastCustomerAt, now) > 0;
}

export function formatRemaining(ms: number): string {
  if (ms <= 0) return "cerrada";
  const hours = Math.floor(ms / (60 * 60 * 1000));
  const minutes = Math.floor((ms % (60 * 60 * 1000)) / (60 * 1000));
  if (hours === 0) return `${minutes} min`;
  return `${hours} h ${minutes.toString().padStart(2, "0")} min`;
}

function step(
  id: string,
  label: string,
  detail: string,
  status: PipelineStep["status"],
  ms: number,
): PipelineStep {
  return { id, label, detail, status, ms };
}

export function route(input: RouteInput): RouteDecision {
  const { text, conversation, businessOpen, knowledge } = input;
  const steps: PipelineStep[] = [
    step("webhook", "Mensaje recibido", "Entrada verificada y confirmada a WhatsApp", "ok", 38),
    step("queue", "Cola de entrada", "Encolado con reintento automático, sin pérdida", "ok", 12),
  ];

  const sensitive = SENSITIVE.find((item) => normalize(text).includes(item.token));
  const knowledgeHit = matchKnowledge(text, knowledge);
  const order = findOrder(text);

  if (conversation.awaiting === "order_code") {
    if (order) {
      steps.push(
        step("classify", "Dato reconocido", `Código de pedido ${order.code}`, "ok", 22),
        step("lookup", "Consulta de datos", "Estado leído de la base de pedidos", "ok", 96),
        step("reply", "Respuesta dinámica", "Contenido armado con datos del pedido", "ok", 31),
      );
      return {
        action: "dynamic_reply",
        intent: "estado_pedido",
        intentTitle: "Estado de un pedido",
        confidence: 0.96,
        reply: `Pedido ${order.code} a nombre de ${order.customer}. Estado: ${order.status}. Transportista: ${order.carrier}. ${order.eta}. Actualizado ${order.updatedAt}.`,
        reason: "El cliente entregó el código y la respuesta se arma con datos reales del pedido",
        awaiting: null,
        steps,
        knowledgeId: "kb-pedido",
        matchedOrder: order,
      };
    }
    steps.push(
      step("classify", "Dato no reconocido", "El texto no contiene un código válido", "warn", 20),
      step("reply", "Reintento guiado", "Se vuelve a pedir el dato una sola vez", "warn", 18),
    );
    return {
      action: "ask_data",
      intent: "estado_pedido",
      intentTitle: "Estado de un pedido",
      confidence: 0.61,
      reply:
        "No encuentro ese código. Tiene la forma A-0000 y está en el correo de confirmación. Si prefieres, te paso con una persona del equipo.",
      reason: "Falta el dato para poder responder con información real",
      awaiting: "order_code",
      steps,
    };
  }

  if (sensitive) {
    steps.push(
      step("classify", "Intención sensible", sensitive.label, "danger", 26),
      step("policy", "Regla de negocio", "Este tipo de caso no se responde solo", "danger", 9),
      step("handoff", "Derivación", "Enviado a la bandeja con el historial completo", "warn", 40),
    );
    return {
      action: "escalate",
      intent: "caso_sensible",
      intentTitle: sensitive.label,
      confidence: knowledgeHit ? Math.min(knowledgeHit.confidence, 0.44) : 0.32,
      reply: businessOpen
        ? "Entiendo, esto lo ve una persona del equipo. Ya le paso tu caso con todo el historial de esta conversación."
        : "Entiendo, esto lo ve una persona del equipo. Estamos fuera de horario, así que a primera hora de mañana te responden por aquí con el historial ya cargado.",
      reason: "Un cobro o un reclamo mal contestado cuesta más que una respuesta lenta",
      escalationReason: sensitive.label,
      steps,
    };
  }

  if (knowledgeHit && knowledgeHit.entry.handoff) {
    steps.push(
      step("classify", "Pedido explícito", "El cliente pide hablar con una persona", "warn", 21),
      step("handoff", "Derivación", "Enviado a la bandeja con el historial completo", "warn", 37),
    );
    return {
      action: "escalate",
      intent: knowledgeHit.entry.intent,
      intentTitle: knowledgeHit.entry.title,
      confidence: Math.max(knowledgeHit.confidence, 0.9),
      reply: businessOpen
        ? "Claro, te paso con una persona del equipo ahora mismo."
        : "Claro. Estamos fuera de horario, dejo tu caso primero en la fila para mañana a las 9:00.",
      reason: "Cuando lo piden de forma directa, la derivación es inmediata",
      escalationReason: "Pedido explícito de atencion humana",
      steps,
    };
  }

  if (knowledgeHit && knowledgeHit.entry.dynamic && knowledgeHit.confidence >= CONFIDENCE_FLOOR) {
    if (order) {
      steps.push(
        step("classify", "Intención reconocida", knowledgeHit.entry.title, "ok", 24),
        step("lookup", "Consulta de datos", "Estado leído de la base de pedidos", "ok", 88),
        step("reply", "Respuesta dinámica", "Contenido armado con datos del pedido", "ok", 29),
      );
      return {
        action: "dynamic_reply",
        intent: knowledgeHit.entry.intent,
        intentTitle: knowledgeHit.entry.title,
        confidence: 0.95,
        reply: `Pedido ${order.code} a nombre de ${order.customer}. Estado: ${order.status}. Transportista: ${order.carrier}. ${order.eta}.`,
        reason: "La respuesta usa datos del pedido, no un texto fijo",
        awaiting: null,
        steps,
        knowledgeId: knowledgeHit.entry.id,
        matchedOrder: order,
      };
    }
    steps.push(
      step("classify", "Intención reconocida", knowledgeHit.entry.title, "ok", 24),
      step("context", "Falta un dato", "Se pide el código antes de consultar", "warn", 11),
      step("reply", "Pregunta de seguimiento", "Una sola pregunta, sin formulario", "ok", 26),
    );
    return {
      action: "ask_data",
      intent: knowledgeHit.entry.intent,
      intentTitle: knowledgeHit.entry.title,
      confidence: knowledgeHit.confidence,
      reply: knowledgeHit.entry.answer,
      reason: "Sin el código no hay dato real que devolver",
      awaiting: "order_code",
      steps,
      knowledgeId: knowledgeHit.entry.id,
    };
  }

  if (knowledgeHit && knowledgeHit.confidence >= CONFIDENCE_FLOOR) {
    steps.push(
      step("classify", "Intención reconocida", knowledgeHit.entry.title, "ok", 23),
      step(
        "confidence",
        "Confianza sobre el umbral",
        `${Math.round(knowledgeHit.confidence * 100)} por ciento contra un minimo de ${Math.round(
          CONFIDENCE_FLOOR * 100,
        )}`,
        "ok",
        7,
      ),
      step("reply", "Respuesta automática", "Texto tomado de la base de respuestas", "ok", 25),
    );
    const afterHoursNote = businessOpen
      ? ""
      : " Estamos fuera de horario, pero esta consulta ya quedó resuelta por aquí.";
    return {
      action: businessOpen ? "auto_reply" : "after_hours",
      intent: knowledgeHit.entry.intent,
      intentTitle: knowledgeHit.entry.title,
      confidence: knowledgeHit.confidence,
      reply: knowledgeHit.entry.answer + afterHoursNote,
      reason: "La pregunta está cubierta por el contenido que administra el equipo",
      steps,
      knowledgeId: knowledgeHit.entry.id,
    };
  }

  const confidence = knowledgeHit ? knowledgeHit.confidence : 0.18;
  steps.push(
    step(
      "classify",
      "Confianza bajo el umbral",
      `${Math.round(confidence * 100)} por ciento contra un minimo de ${Math.round(
        CONFIDENCE_FLOOR * 100,
      )}`,
      "warn",
      25,
    ),
    step("policy", "Regla de negocio", "Antes que arriesgar una respuesta a medias, deriva", "warn", 8),
    step("handoff", "Derivación", "Enviado a la bandeja con el historial completo", "warn", 39),
  );
  return {
    action: "escalate",
    intent: "sin_cobertura",
    intentTitle: "Consulta fuera de la base",
    confidence,
    reply: businessOpen
      ? "Esa consulta prefiero que te la responda una persona del equipo. Ya le paso la conversación completa."
      : "Esa consulta la ve una persona del equipo. Estamos fuera de horario, a primera hora de mañana te responden por aquí.",
    reason: "Una respuesta equivocada cuesta más que una derivación",
    escalationReason: "Confianza bajo el umbral",
    steps,
  };
}
