"use client";

import { useEffect, useRef } from "react";
import { Check, CheckCheck, Clock3, Paperclip, Send, Smile, Video, Phone as PhoneIcon } from "lucide-react";
import type { Conversation, Message } from "@/lib/mock-backend/types";

function hhmm(at: number) {
  return new Date(at).toLocaleTimeString("es-PE", { hour: "2-digit", minute: "2-digit" });
}

function Ticks({ message }: { message: Message }) {
  if (message.role !== "customer") return null;
  if (message.delivery === "sending") return <Clock3 size={13} className="opacity-60" />;
  if (message.delivery === "read") return <CheckCheck size={14} style={{ color: "#53bdeb" }} />;
  if (message.delivery === "delivered") return <CheckCheck size={14} className="opacity-70" />;
  return <Check size={14} className="opacity-70" />;
}

export default function PhoneChat({
  conversation,
  business,
  typing,
  onSend,
  suggestions,
  value,
  onChange,
  disabled,
}: {
  conversation: Conversation;
  business: { name: string; number: string };
  typing: boolean;
  onSend: (text: string) => void;
  suggestions: string[];
  value: string;
  onChange: (value: string) => void;
  disabled: boolean;
}) {
  const streamRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const node = streamRef.current;
    if (!node) return;
    node.scrollTo({ top: node.scrollHeight, behavior: "smooth" });
  }, [conversation.messages.length, typing]);

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-[22px] border border-[var(--line)] bg-[var(--wa-bg)]">
      <header
        className="flex items-center gap-3 px-4 py-3"
        style={{ background: "var(--wa-header)", borderBottom: "1px solid rgba(255,255,255,0.06)" }}
      >
        <span className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#2a3942] text-sm font-bold text-[#8696a0]">
          DA
          <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-[var(--wa-header)] bg-[#25d366]" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-[15px] font-semibold text-[#e9edef]">{business.name}</p>
          <p className="truncate text-[12px] text-[#8696a0]">
            {typing ? "escribiendo..." : "cuenta de empresa"}
          </p>
        </div>
        <div className="flex items-center gap-4 text-[#8696a0]">
          <Video size={18} />
          <PhoneIcon size={17} />
        </div>
      </header>

      <div
        ref={streamRef}
        className="scrollarea relative flex-1 overflow-y-auto px-3 py-4 sm:px-4"
        style={{
          background:
            "radial-gradient(rgba(255,255,255,0.045) 1px, transparent 1px) 0 0/22px 22px, linear-gradient(180deg, #0b141a 0%, #0a1218 100%)",
        }}
      >
        <div className="mx-auto mb-4 w-fit rounded-md bg-[#182229] px-3 py-1 text-[11px] text-[#8696a0]">
          Los mensajes se responden de forma automática cuando corresponde
        </div>

        <div className="flex flex-col gap-2">
          {conversation.messages.map((message, index) => {
            const mine = message.role === "customer";
            const fromAgent = message.role === "agent";
            return (
              <div
                key={message.id}
                className={`anim-bubble flex ${mine ? "justify-end" : "justify-start"}`}
                style={{ animationDelay: `${Math.min(index, 6) * 25}ms` }}
              >
                <div
                  className="relative max-w-[86%] rounded-[10px] px-3 py-2 text-[14.5px] leading-[1.45] shadow-sm sm:max-w-[78%]"
                  style={{
                    background: mine ? "var(--wa-out)" : "var(--wa-in)",
                    color: "#e9edef",
                    borderTopRightRadius: mine ? 3 : 10,
                    borderTopLeftRadius: mine ? 10 : 3,
                  }}
                >
                  {fromAgent && (
                    <p className="mb-1 text-[11.5px] font-bold" style={{ color: "#53bdeb" }}>
                      Rocío, atención al cliente
                    </p>
                  )}
                  <p className="whitespace-pre-wrap break-words">{message.text}</p>
                  <span className="mt-1 flex items-center justify-end gap-1 text-[10.5px] text-[#8696a0]">
                    {hhmm(message.at)}
                    <Ticks message={message} />
                  </span>
                </div>
              </div>
            );
          })}

          {typing && (
            <div className="flex justify-start">
              <div
                className="flex items-center gap-1.5 rounded-[10px] px-4 py-3"
                style={{ background: "var(--wa-in)", borderTopLeftRadius: 3 }}
              >
                {[0, 1, 2].map((dot) => (
                  <span
                    key={dot}
                    className="h-1.5 w-1.5 rounded-full bg-[#8696a0]"
                    style={{ animation: `dotBounce 1.1s ${dot * 0.15}s infinite ease-in-out` }}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="border-t border-white/5 bg-[var(--wa-panel)] px-3 pb-3 pt-2.5">
        <div className="scrollarea mb-2.5 flex gap-2 overflow-x-auto pb-1">
          {suggestions.map((suggestion) => (
            <button
              key={suggestion}
              type="button"
              disabled={disabled}
              onClick={() => onSend(suggestion)}
              className="shrink-0 rounded-full border border-[#2a3942] bg-[#202c33] px-3 py-1.5 text-[12px] font-medium text-[#8696a0] transition hover:border-[#3b4a54] hover:text-[#d1d7db] disabled:opacity-40"
            >
              {suggestion}
            </button>
          ))}
        </div>
        <form
          onSubmit={(event) => {
            event.preventDefault();
            if (!value.trim() || disabled) return;
            onSend(value.trim());
          }}
          className="flex items-center gap-2"
        >
          <Smile size={21} className="shrink-0 text-[#8696a0]" />
          <Paperclip size={19} className="hidden shrink-0 text-[#8696a0] sm:block" />
          <input
            value={value}
            onChange={(event) => onChange(event.target.value)}
            disabled={disabled}
            placeholder="Escribe un mensaje"
            className="min-w-0 flex-1 rounded-full bg-[#2a3942] px-4 py-2.5 text-[14.5px] text-[#e9edef] placeholder:text-[#8696a0] focus:outline-none disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={disabled || !value.trim()}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#00a884] text-white transition hover:brightness-110 disabled:opacity-40"
            aria-label="Enviar"
          >
            <Send size={17} />
          </button>
        </form>
      </div>
    </div>
  );
}
