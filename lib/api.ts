import { route } from "./mock-backend/engine";
import type { Conversation, KnowledgeEntry, LogEntry, RouteDecision } from "./mock-backend/types";

let sequence = 0;
export function uid(prefix = "id"): string {
  sequence += 1;
  return `${prefix}-${Date.now().toString(36)}-${sequence}`;
}

function wait(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function waId(): string {
  return `wamid.HBgLNTE5${Math.random().toString(36).slice(2, 10).toUpperCase()}`;
}

export interface InboundResult {
  decision: RouteDecision;
  logs: LogEntry[];
  latency: number;
}

export async function deliverInbound(params: {
  text: string;
  conversation: Conversation;
  businessOpen: boolean;
  knowledge: KnowledgeEntry[];
  onStage?: (stageId: string) => void;
}): Promise<InboundResult> {
  const { text, conversation, businessOpen, knowledge, onStage } = params;
  const started = Date.now();
  const logs: LogEntry[] = [];

  logs.push({
    id: uid("log"),
    direction: "in",
    label: "POST /webhook/mensajes",
    at: Date.now(),
    payload: {
      object: "whatsapp_business_account",
      entry: [
        {
          id: "104938201938472",
          changes: [
            {
              field: "messages",
              value: {
                messaging_product: "whatsapp",
                metadata: {
                  display_phone_number: "51999118240",
                  phone_number_id: "398201938472019",
                },
                contacts: [{ profile: { name: conversation.name }, wa_id: conversation.phone.replace(/\D/g, "") }],
                messages: [
                  {
                    from: conversation.phone.replace(/\D/g, ""),
                    id: waId(),
                    timestamp: Math.floor(Date.now() / 1000).toString(),
                    type: "text",
                    text: { body: text },
                  },
                ],
              },
            },
          ],
        },
      ],
    },
  });

  const decision = route({ text, conversation, businessOpen, knowledge });

  for (const step of decision.steps) {
    onStage?.(step.id);
    await wait(Math.max(160, Math.min(step.ms * 4, 520)));
  }

  logs.push({
    id: uid("log"),
    direction: "internal",
    label: "Clasificación",
    at: Date.now(),
    payload: {
      intencion: decision.intent,
      confianza: decision.confidence,
      accion: decision.action,
      origen: decision.knowledgeId ?? "sin coincidencia",
      derivacion: decision.escalationReason ?? null,
    },
  });

  if (decision.reply) {
    logs.push({
      id: uid("log"),
      direction: "out",
      label: "POST /mensajes",
      at: Date.now(),
      payload: {
        messaging_product: "whatsapp",
        recipient_type: "individual",
        to: conversation.phone.replace(/\D/g, ""),
        type: "text",
        text: { preview_url: false, body: decision.reply },
      },
    });
  }

  const latency = Date.now() - started;
  return { decision, logs, latency };
}

export async function deliverOutbound(params: {
  conversation: Conversation;
  body: string;
  templateName?: string;
}): Promise<LogEntry> {
  await wait(320);
  const { conversation, body, templateName } = params;
  return {
    id: uid("log"),
    direction: "out",
    label: templateName ? "POST /mensajes (plantilla)" : "POST /mensajes",
    at: Date.now(),
    payload: templateName
      ? {
          messaging_product: "whatsapp",
          to: conversation.phone.replace(/\D/g, ""),
          type: "template",
          template: { name: templateName, language: { code: "es" } },
        }
      : {
          messaging_product: "whatsapp",
          to: conversation.phone.replace(/\D/g, ""),
          type: "text",
          text: { preview_url: false, body },
        },
  };
}
