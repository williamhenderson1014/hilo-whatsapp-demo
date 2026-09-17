"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { Bot, Clock4, FileCheck2, History, Lock, Send, TimerReset, UserRound } from "lucide-react";
import type { Conversation, TemplateMessage } from "@/lib/mock-backend/types";
import { formatRemaining, windowRemaining } from "@/lib/mock-backend/engine";

const STATE_STYLE: Record<string, { label: string; color: string; bg: string }> = {
  bot: { label: "Resuelto por el sistema", color: "var(--ok)", bg: "var(--ok-soft)" },
  queue: { label: "En espera", color: "var(--warn)", bg: "var(--warn-soft)" },
  agent: { label: "Con una persona", color: "var(--accent)", bg: "var(--accent-soft)" },
  closed: { label: "Cerrada", color: "var(--text-dim)", bg: "var(--surface-3)" },
};

export default function AgentInbox({
  conversations,
  selectedId,
  onSelect,
  onReply,
  onSendTemplate,
  onAgeConversation,
  templates,
  agent,
  now,
}: {
  conversations: Conversation[];
  selectedId: string;
  onSelect: (id: string) => void;
  onReply: (id: string, text: string) => void;
  onSendTemplate: (id: string, template: TemplateMessage) => void;
  onAgeConversation: (id: string) => void;
  templates: TemplateMessage[];
  agent: { name: string; role: string; photo: string };
  now: number;
}) {
  const [draft, setDraft] = useState("");
  const [showTemplates, setShowTemplates] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);

  const selected = conversations.find((conversation) => conversation.id === selectedId) ?? conversations[0];
  const remaining = selected ? windowRemaining(selected.lastCustomerAt, now) : 0;
  const windowOpen = remaining > 0;

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" });
  }, [selected?.messages.length, selectedId]);

  useEffect(() => {
    setShowTemplates(false);
    setDraft("");
  }, [selectedId]);

  if (!selected) return null;

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-3 border-b border-[var(--line-soft)] px-4 py-3 sm:px-5">
        <Image
          src={agent.photo}
          alt={agent.name}
          width={38}
          height={38}
          className="h-9.5 w-9.5 shrink-0 rounded-full object-cover"
          style={{ height: 38, width: 38 }}
          unoptimized
        />
        <div className="min-w-0 flex-1">
          <p className="truncate text-[13.5px] font-semibold">Bandeja del equipo</p>
          <p className="truncate text-[11.5px] text-[var(--text-dim)]">
            {agent.name} · {agent.role}
          </p>
        </div>
        <span className="chip" style={{ color: "var(--ok)", borderColor: "rgba(16,185,129,0.35)", background: "var(--ok-soft)" }}>
          en línea
        </span>
      </div>

      <div className="scrollarea flex gap-2 overflow-x-auto border-b border-[var(--line-soft)] px-3 py-2.5 sm:px-4">
        {conversations.map((conversation) => {
          const state = STATE_STYLE[conversation.state];
          const active = conversation.id === selected.id;
          return (
            <button
              key={conversation.id}
              type="button"
              onClick={() => onSelect(conversation.id)}
              className="flex shrink-0 items-center gap-2 rounded-xl border px-2.5 py-2 transition"
              style={{
                background: active ? "var(--surface-3)" : "var(--surface)",
                borderColor: active ? "rgba(99,102,241,0.5)" : "var(--line-soft)",
              }}
            >
              <span className="relative">
                <Image
                  src={conversation.avatar}
                  alt={conversation.name}
                  width={30}
                  height={30}
                  className="rounded-full object-cover"
                  style={{ height: 30, width: 30 }}
                  unoptimized
                />
                {conversation.unread ? (
                  <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-[var(--danger)] px-1 text-[10px] font-bold text-white">
                    {conversation.unread}
                  </span>
                ) : null}
              </span>
              <span className="text-left">
                <span className="block max-w-[110px] truncate text-[12.5px] font-semibold">{conversation.name}</span>
                <span className="block text-[10.5px]" style={{ color: state.color }}>
                  {state.label}
                </span>
              </span>
            </button>
          );
        })}
      </div>

      <div className="flex flex-wrap items-center gap-2 border-b border-[var(--line-soft)] px-4 py-2.5 sm:px-5">
        {selected.tags.map((tag) => (
          <span key={tag} className="chip">
            {tag}
          </span>
        ))}
        {selected.escalationReason && (
          <span className="chip" style={{ color: "var(--warn)", borderColor: "rgba(245,158,11,0.35)", background: "var(--warn-soft)" }}>
            <History size={12} />
            {selected.escalationReason}
          </span>
        )}
        <span
          className="chip ml-auto"
          style={{
            color: windowOpen ? "var(--ok)" : "var(--danger)",
            borderColor: windowOpen ? "rgba(16,185,129,0.35)" : "rgba(244,63,94,0.35)",
            background: windowOpen ? "var(--ok-soft)" : "var(--danger-soft)",
          }}
        >
          {windowOpen ? <Clock4 size={12} /> : <Lock size={12} />}
          Ventana {windowOpen ? formatRemaining(remaining) : "cerrada"}
        </span>
      </div>

      <div ref={listRef} className="scrollarea min-h-0 flex-1 overflow-y-auto p-3 sm:p-4">
        <div className="flex flex-col gap-2.5">
          {selected.messages.map((message, index) => {
            const isCustomer = message.role === "customer";
            const isBot = message.role === "bot";
            return (
              <div
                key={message.id}
                className="anim-right rounded-xl border p-3"
                style={{
                  animationDelay: `${Math.min(index, 8) * 30}ms`,
                  background: isCustomer ? "var(--surface-2)" : "var(--surface)",
                  borderColor: isCustomer ? "var(--line)" : "var(--line-soft)",
                }}
              >
                <div className="mb-1 flex items-center gap-2">
                  <span
                    className="flex h-5 w-5 items-center justify-center rounded-md"
                    style={{
                      background: isCustomer ? "var(--surface-3)" : isBot ? "var(--accent-soft)" : "var(--ok-soft)",
                      color: isCustomer ? "var(--text-muted)" : isBot ? "var(--accent)" : "var(--ok)",
                    }}
                  >
                    {isCustomer ? <UserRound size={12} /> : isBot ? <Bot size={12} /> : <UserRound size={12} />}
                  </span>
                  <span className="text-[11.5px] font-semibold text-[var(--text-muted)]">
                    {isCustomer ? selected.name : isBot ? "Sistema" : agent.name}
                  </span>
                  <span className="mono ml-auto text-[var(--text-dim)]">
                    {new Date(message.at).toLocaleTimeString("es-PE", { hour: "2-digit", minute: "2-digit" })}
                  </span>
                </div>
                <p className="text-[13px] leading-snug text-[var(--text)]">{message.text}</p>
                {message.meta?.intent && (
                  <p className="mono mt-1.5 text-[var(--text-dim)]">
                    {message.meta.intent} · confianza {Math.round((message.meta.confidence ?? 0) * 100)}% ·{" "}
                    {message.meta.source}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="border-t border-[var(--line-soft)] p-3 sm:p-4">
        {windowOpen ? (
          <form
            onSubmit={(event) => {
              event.preventDefault();
              if (!draft.trim()) return;
              onReply(selected.id, draft.trim());
              setDraft("");
            }}
            className="flex items-center gap-2"
          >
            <input
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              placeholder="Responder como persona del equipo"
              className="min-w-0 flex-1 rounded-xl border border-[var(--line)] bg-[var(--bg-soft)] px-3.5 py-2.5 text-[13px] text-[var(--text)] placeholder:text-[var(--text-dim)] focus:border-[var(--accent)] focus:outline-none"
            />
            <button type="submit" className="btn btn-primary shrink-0" style={{ minHeight: 44, padding: "0 14px" }} aria-label="Enviar respuesta">
              <Send size={15} />
            </button>
          </form>
        ) : (
          <div className="rounded-xl border p-3" style={{ borderColor: "rgba(244,63,94,0.35)", background: "var(--danger-soft)" }}>
            <p className="flex items-center gap-2 text-[13px] font-semibold" style={{ color: "var(--danger)" }}>
              <Lock size={14} />
              Ventana de 24 horas cerrada
            </p>
            <p className="mt-1 text-[12.5px] leading-snug text-[var(--text-muted)]">
              Pasadas 24 horas desde el último mensaje del cliente ya no se puede escribir texto libre. Solo salen
              plantillas aprobadas previamente.
            </p>
            {showTemplates ? (
              <div className="mt-2.5 flex flex-col gap-2">
                {templates.map((template) => {
                  const usable = template.status === "aprobada";
                  return (
                    <button
                      key={template.id}
                      type="button"
                      disabled={!usable}
                      onClick={() => {
                        onSendTemplate(selected.id, template);
                        setShowTemplates(false);
                      }}
                      className="rounded-lg border p-2.5 text-left transition disabled:cursor-not-allowed disabled:opacity-50"
                      style={{ borderColor: "var(--line)", background: "var(--surface)" }}
                    >
                      <span className="flex items-center gap-2">
                        <FileCheck2 size={13} style={{ color: usable ? "var(--ok)" : "var(--warn)" }} />
                        <span className="mono font-semibold">{template.name}</span>
                        <span className="chip ml-auto" style={{ fontSize: 10.5, padding: "3px 8px" }}>
                          {template.status}
                        </span>
                      </span>
                      <span className="mt-1 block text-[12px] leading-snug text-[var(--text-muted)]">{template.body}</span>
                    </button>
                  );
                })}
              </div>
            ) : (
              <button
                type="button"
                className="btn btn-ghost mt-2.5"
                style={{ minHeight: 38, fontSize: 12.5 }}
                onClick={() => setShowTemplates(true)}
              >
                <FileCheck2 size={14} />
                Ver plantillas aprobadas
              </button>
            )}
          </div>
        )}

        {windowOpen && (
          <button
            type="button"
            className="btn btn-ghost mt-2 w-full"
            style={{ minHeight: 38, fontSize: 12.5 }}
            onClick={() => onAgeConversation(selected.id)}
          >
            <TimerReset size={14} />
            Simular 24 horas de silencio
          </button>
        )}
      </div>
    </div>
  );
}
