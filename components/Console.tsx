"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Activity,
  Bot,
  CornerUpRight,
  ListTree,
  MessageSquareText,
  Moon,
  ScrollText,
  Smartphone,
  Sun,
  Users,
} from "lucide-react";
import AgentInbox from "./AgentInbox";
import EventLog from "./EventLog";
import KnowledgePanel from "./KnowledgePanel";
import Pipeline from "./Pipeline";
import PhoneChat from "./PhoneChat";
import { deliverInbound, deliverOutbound, uid } from "@/lib/api";
import { BUSINESS, buildInbox, knowledgeBase, suggestions, templates } from "@/lib/mock-backend/data";
import type {
  Conversation,
  KnowledgeEntry,
  LogEntry,
  Message,
  RouteDecision,
  TemplateMessage,
} from "@/lib/mock-backend/types";

const CUSTOMER_ID = "conv-sofia";
const HOUR = 60 * 60 * 1000;

type Tab = "motor" | "base" | "registro";

function buildCustomer(now: number): Conversation {
  return {
    id: CUSTOMER_ID,
    name: "Sofía Méndez",
    phone: "+51 986 330 771",
    avatar:
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&h=120&fit=crop&crop=face&q=80",
    state: "bot",
    lastCustomerAt: now,
    tags: ["Conversación en vivo"],
    awaiting: null,
    unread: 0,
    messages: [
      {
        id: "seed-1",
        role: "customer",
        text: "Hola, buenas tardes",
        at: now - 90000,
        delivery: "read",
      },
      {
        id: "seed-2",
        role: "bot",
        text: "Hola Sofía, gracias por escribir a Distribuidora Andes. Cuéntame en qué te ayudo y te respondo al toque.",
        at: now - 86000,
        meta: { intent: "saludo", confidence: 0.97, source: "Base de respuestas" },
      },
    ],
  };
}

function PanelShell({
  id,
  title,
  icon,
  meta,
  children,
  padded,
}: {
  id?: string;
  title: string;
  icon: React.ReactNode;
  meta?: React.ReactNode;
  children: React.ReactNode;
  padded?: boolean;
}) {
  return (
    <section id={id} className="card flex h-[600px] flex-col overflow-hidden xl:h-[660px]">
      <header className="flex items-center gap-2.5 border-b border-[var(--line-soft)] px-4 py-3 sm:px-5">
        <span
          className="flex h-7 w-7 items-center justify-center rounded-lg"
          style={{ background: "var(--accent-soft)", color: "var(--accent)" }}
        >
          {icon}
        </span>
        <h3 className="whitespace-nowrap text-[13px] font-bold uppercase tracking-[0.1em]">{title}</h3>
        <div className="ml-auto flex items-center gap-2">{meta}</div>
      </header>
      <div className={`min-h-0 flex-1 ${padded ? "p-3 sm:p-4" : ""}`}>{children}</div>
    </section>
  );
}

function Skeleton() {
  return (
    <div
      className="grid gap-4"
      style={{ gridTemplateColumns: "repeat(auto-fit, minmax(330px, 1fr))" }}
    >
      {[0, 1, 2].map((item) => (
        <div key={item} className="card h-[600px] p-5 xl:h-[660px]">
          <div className="skeleton h-4 w-32" />
          <div className="skeleton mt-4 h-3 w-full" />
          <div className="skeleton mt-2 h-3 w-4/5" />
          <div className="skeleton mt-8 h-24 w-full" />
          <div className="skeleton mt-3 h-24 w-full" />
        </div>
      ))}
    </div>
  );
}

export default function Console() {
  const [conversations, setConversations] = useState<Conversation[] | null>(null);
  const [knowledge, setKnowledge] = useState<KnowledgeEntry[]>(knowledgeBase);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [decision, setDecision] = useState<RouteDecision | null>(null);
  const [activeStage, setActiveStage] = useState<string | null>(null);
  const [running, setRunning] = useState(false);
  const [typing, setTyping] = useState(false);
  const [businessOpen, setBusinessOpen] = useState(true);
  const [tab, setTab] = useState<Tab>("motor");
  const [selectedInbox, setSelectedInbox] = useState(CUSTOMER_ID);
  const [draft, setDraft] = useState("");
  const [toast, setToast] = useState<string | null>(null);
  const [now, setNow] = useState(0);
  const [stats, setStats] = useState({ auto: 0, handoff: 0 });
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const start = Date.now();
    setNow(start);
    setConversations([buildCustomer(start), ...buildInbox(start)]);
    setLogs([
      {
        id: "seed-log-1",
        direction: "in",
        label: "POST /webhook/mensajes",
        at: start - 90000,
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
                    contacts: [{ profile: { name: "Sofía Méndez" }, wa_id: "51986330771" }],
                    messages: [{ from: "51986330771", type: "text", text: { body: "Hola, buenas tardes" } }],
                  },
                },
              ],
            },
          ],
        },
      },
      {
        id: "seed-log-2",
        direction: "out",
        label: "POST /mensajes",
        at: start - 86000,
        payload: {
          messaging_product: "whatsapp",
          to: "51986330771",
          type: "text",
          text: {
            preview_url: false,
            body: "Hola Sofía, gracias por escribir a Distribuidora Andes. Cuéntame en qué te ayudo y te respondo al toque.",
          },
        },
      },
    ]);
    const timer = setInterval(() => setNow(Date.now()), 20000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    return () => {
      if (toastTimer.current) clearTimeout(toastTimer.current);
    };
  }, []);

  const flash = useCallback((text: string) => {
    setToast(text);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 3600);
  }, []);

  const customer = useMemo(
    () => conversations?.find((conversation) => conversation.id === CUSTOMER_ID) ?? null,
    [conversations],
  );

  const patch = useCallback((id: string, updater: (conversation: Conversation) => Conversation) => {
    setConversations((previous) =>
      previous ? previous.map((conversation) => (conversation.id === id ? updater(conversation) : conversation)) : previous,
    );
  }, []);

  const pushMessage = useCallback(
    (id: string, message: Message) => {
      patch(id, (conversation) => ({ ...conversation, messages: [...conversation.messages, message] }));
    },
    [patch],
  );

  const handleCustomerSend = useCallback(
    async (text: string) => {
      if (!customer || running) return;
      setDraft("");
      setRunning(true);
      setDecision(null);
      setActiveStage(null);

      const messageId = uid("msg");
      const sentAt = Date.now();
      patch(CUSTOMER_ID, (conversation) => ({
        ...conversation,
        lastCustomerAt: sentAt,
        messages: [
          ...conversation.messages,
          { id: messageId, role: "customer", text, at: sentAt, delivery: "sending" },
        ],
      }));
      setNow(sentAt);

      const markDelivery = (delivery: Message["delivery"]) =>
        patch(CUSTOMER_ID, (conversation) => ({
          ...conversation,
          messages: conversation.messages.map((message) =>
            message.id === messageId ? { ...message, delivery } : message,
          ),
        }));

      setTimeout(() => markDelivery("sent"), 220);
      setTimeout(() => markDelivery("delivered"), 620);
      setTimeout(() => markDelivery("read"), 1100);

      const snapshot: Conversation = {
        ...customer,
        lastCustomerAt: sentAt,
        messages: [...customer.messages, { id: messageId, role: "customer", text, at: sentAt }],
      };

      setTimeout(() => setTyping(true), 700);

      const result = await deliverInbound({
        text,
        conversation: snapshot,
        businessOpen,
        knowledge,
        onStage: (stage) => {
          setActiveStage(stage);
          setDecision((current) => current);
        },
      });

      setDecision(result.decision);
      setActiveStage(null);
      setLogs((previous) => [...previous, ...result.logs]);
      setTyping(false);
      setRunning(false);

      if (result.decision.reply) {
        pushMessage(CUSTOMER_ID, {
          id: uid("msg"),
          role: "bot",
          text: result.decision.reply,
          at: Date.now(),
          meta: {
            intent: result.decision.intent,
            confidence: result.decision.confidence,
            source: result.decision.matchedOrder ? "Datos de pedidos" : "Base de respuestas",
          },
        });
      }

      const escalated = result.decision.action === "escalate";
      patch(CUSTOMER_ID, (conversation) => ({
        ...conversation,
        awaiting: result.decision.awaiting ?? null,
        state: escalated ? (businessOpen ? "agent" : "queue") : "bot",
        escalationReason: escalated ? result.decision.escalationReason : conversation.escalationReason,
        tags: escalated
          ? Array.from(new Set([...conversation.tags, result.decision.intentTitle]))
          : conversation.tags,
        unread: escalated ? (conversation.unread ?? 0) + 1 : conversation.unread,
      }));

      setStats((previous) =>
        escalated ? { ...previous, handoff: previous.handoff + 1 } : { ...previous, auto: previous.auto + 1 },
      );

      if (escalated) {
        setSelectedInbox(CUSTOMER_ID);
        flash(
          businessOpen
            ? "Conversación derivada a la bandeja con el historial completo"
            : "Fuera de horario: queda primera en la fila de mañana",
        );
      }
    },
    [businessOpen, customer, flash, knowledge, patch, pushMessage, running],
  );

  const handleAgentReply = useCallback(
    async (id: string, text: string) => {
      const target = conversations?.find((conversation) => conversation.id === id);
      if (!target) return;
      pushMessage(id, { id: uid("msg"), role: "agent", text, at: Date.now() });
      patch(id, (conversation) => ({ ...conversation, state: "agent", unread: 0 }));
      const log = await deliverOutbound({ conversation: target, body: text });
      setLogs((previous) => [...previous, log]);
    },
    [conversations, patch, pushMessage],
  );

  const handleTemplate = useCallback(
    async (id: string, template: TemplateMessage) => {
      const target = conversations?.find((conversation) => conversation.id === id);
      if (!target) return;
      const body = template.body
        .replace("{{1}}", target.name.split(" ")[0])
        .replace("{{2}}", "A-4821")
        .replace("{{3}}", "el viernes");
      pushMessage(id, {
        id: uid("msg"),
        role: "agent",
        text: body,
        at: Date.now(),
        meta: { template: template.name },
      });
      const log = await deliverOutbound({ conversation: target, body, templateName: template.name });
      setLogs((previous) => [...previous, log]);
      flash(`Plantilla ${template.name} enviada. La ventana vuelve a abrirse si el cliente responde.`);
    },
    [conversations, flash, pushMessage],
  );

  const handleAge = useCallback(
    (id: string) => {
      patch(id, (conversation) => ({ ...conversation, lastCustomerAt: Date.now() - 25 * HOUR }));
      setNow(Date.now());
      flash("Pasaron 24 horas sin respuesta del cliente. Ahora solo salen plantillas aprobadas.");
    },
    [flash, patch],
  );

  const handleKnowledgeSave = useCallback(
    (id: string, answer: string) => {
      setKnowledge((previous) =>
        previous.map((entry) => (entry.id === id ? { ...entry, answer, editedByTeam: true } : entry)),
      );
      flash("Respuesta actualizada. El chat ya la usa en el siguiente mensaje.");
    },
    [flash],
  );

  if (!conversations || !customer) {
    return <Skeleton />;
  }

  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: "motor", label: "Motor", icon: <ListTree size={14} /> },
    { id: "base", label: "Respuestas", icon: <MessageSquareText size={14} /> },
    { id: "registro", label: "Registro", icon: <ScrollText size={14} /> },
  ];

  return (
    <div className="relative">
      <div className="mb-4 flex flex-wrap items-center gap-2.5 rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-3 sm:p-4">
        <span className="chip" style={{ color: "var(--text)" }}>
          <Activity size={13} style={{ color: "var(--ok)" }} />
          {BUSINESS.number}
        </span>
        <button
          type="button"
          onClick={() => {
            setBusinessOpen((previous) => !previous);
            flash(
              businessOpen
                ? "Fuera de horario. El sistema sigue respondiendo lo que ya sabe."
                : "Horario de atención activo.",
            );
          }}
          className="chip transition hover:border-[#33405c]"
          style={{
            cursor: "pointer",
            color: businessOpen ? "var(--ok)" : "var(--warn)",
            borderColor: businessOpen ? "rgba(16,185,129,0.35)" : "rgba(245,158,11,0.35)",
            background: businessOpen ? "var(--ok-soft)" : "var(--warn-soft)",
          }}
        >
          {businessOpen ? <Sun size={13} /> : <Moon size={13} />}
          {businessOpen ? "En horario de atención" : "Fuera de horario"}
        </button>
        <span className="chip">
          <Bot size={13} style={{ color: "var(--accent)" }} />
          Resueltas solas: {stats.auto}
        </span>
        <span className="chip">
          <CornerUpRight size={13} style={{ color: "var(--warn)" }} />
          Derivadas: {stats.handoff}
        </span>
        <span className="chip hidden sm:inline-flex">
          <Users size={13} />
          {BUSINESS.hours}
        </span>
      </div>

      <div className="grid gap-4" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(330px, 1fr))" }}>
        <PanelShell
          id="panel-telefono"
          title="Cliente"
          icon={<Smartphone size={15} />}
          meta={<span className="chip">vista del cliente</span>}
        >
          <div className="h-full p-3 sm:p-4">
            <PhoneChat
              conversation={customer}
              business={{ name: BUSINESS.name, number: BUSINESS.number }}
              typing={typing}
              onSend={handleCustomerSend}
              suggestions={suggestions}
              value={draft}
              onChange={setDraft}
              disabled={running}
            />
          </div>
        </PanelShell>

        <PanelShell
          id="panel-motor"
          title="Motor"
          icon={<ListTree size={15} />}
          meta={
            <div className="flex gap-1.5">
              {tabs.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setTab(item.id)}
                  className="flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-[11.5px] font-semibold transition"
                  style={{
                    background: tab === item.id ? "var(--accent-soft)" : "var(--surface-2)",
                    borderColor: tab === item.id ? "rgba(99,102,241,0.45)" : "var(--line-soft)",
                    color: tab === item.id ? "var(--text)" : "var(--text-muted)",
                  }}
                >
                  {item.icon}
                  <span className="hidden sm:inline">{item.label}</span>
                </button>
              ))}
            </div>
          }
        >
          {tab === "motor" && <Pipeline decision={decision} activeStage={activeStage} running={running} />}
          {tab === "base" && (
            <KnowledgePanel knowledge={knowledge} onSave={handleKnowledgeSave} highlightId={decision?.knowledgeId} />
          )}
          {tab === "registro" && <EventLog logs={logs} />}
        </PanelShell>

        <PanelShell
          id="panel-bandeja"
          title="Equipo"
          icon={<Users size={15} />}
          meta={<span className="chip">{conversations.length} conversaciones</span>}
        >
          <AgentInbox
            conversations={conversations}
            selectedId={selectedInbox}
            onSelect={setSelectedInbox}
            onReply={handleAgentReply}
            onSendTemplate={handleTemplate}
            onAgeConversation={handleAge}
            templates={templates}
            agent={{ name: BUSINESS.agentName, role: BUSINESS.agentRole, photo: BUSINESS.agentPhoto }}
            now={now}
          />
        </PanelShell>
      </div>

      {toast && (
        <div
          className="anim-up fixed bottom-5 left-1/2 z-50 w-[min(92vw,420px)] -translate-x-1/2 rounded-2xl border p-3.5 text-center text-[13px] font-medium shadow-2xl"
          style={{ borderColor: "rgba(99,102,241,0.45)", background: "var(--surface-2)", color: "var(--text)" }}
        >
          {toast}
        </div>
      )}
    </div>
  );
}
