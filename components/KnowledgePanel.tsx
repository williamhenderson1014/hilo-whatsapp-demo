"use client";

import { useState } from "react";
import { BadgeCheck, ChevronDown, Pencil, Save, Sparkles, X } from "lucide-react";
import type { KnowledgeEntry } from "@/lib/mock-backend/types";

export default function KnowledgePanel({
  knowledge,
  onSave,
  highlightId,
}: {
  knowledge: KnowledgeEntry[];
  onSave: (id: string, answer: string) => void;
  highlightId?: string;
}) {
  const [openId, setOpenId] = useState<string | null>(null);
  const [draft, setDraft] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);

  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-[var(--line-soft)] px-4 py-3.5 sm:px-5">
        <p className="text-[13.5px] font-semibold">Base de respuestas</p>
        <p className="mt-0.5 text-[12.5px] leading-snug text-[var(--text-muted)]">
          El contenido lo edita tu equipo. Lo que guardes aquí cambia la respuesta del chat al instante.
        </p>
      </div>

      <div className="scrollarea min-h-0 flex-1 overflow-y-auto p-3 sm:p-4">
        <div className="flex flex-col gap-2">
          {knowledge.map((entry, index) => {
            const isOpen = openId === entry.id;
            const isEditing = editingId === entry.id;
            const isHighlight = highlightId === entry.id;
            return (
              <article
                key={entry.id}
                className="anim-up overflow-hidden rounded-xl border transition"
                style={{
                  animationDelay: `${index * 30}ms`,
                  background: "var(--surface)",
                  borderColor: isHighlight ? "rgba(99,102,241,0.55)" : "var(--line-soft)",
                  boxShadow: isHighlight ? "0 0 0 3px rgba(99,102,241,0.12)" : undefined,
                }}
              >
                <button
                  type="button"
                  onClick={() => {
                    setOpenId(isOpen ? null : entry.id);
                    setEditingId(null);
                  }}
                  className="flex w-full items-center gap-3 px-3.5 py-3 text-left transition hover:bg-[var(--surface-2)]"
                >
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center gap-2">
                      <span className="truncate text-[13.5px] font-semibold">{entry.title}</span>
                      {entry.editedByTeam && (
                        <span className="chip" style={{ color: "var(--ok)", borderColor: "rgba(16,185,129,0.35)", background: "var(--ok-soft)" }}>
                          <BadgeCheck size={12} />
                          editado
                        </span>
                      )}
                    </span>
                    <span className="mt-0.5 flex flex-wrap items-center gap-2 text-[11.5px] text-[var(--text-dim)]">
                      <span>{entry.category}</span>
                      <span>·</span>
                      <span>{entry.patterns.length} formas de preguntarlo</span>
                      {entry.dynamic && (
                        <>
                          <span>·</span>
                          <span style={{ color: "var(--accent)" }}>usa datos reales</span>
                        </>
                      )}
                    </span>
                  </span>
                  <ChevronDown
                    size={16}
                    className="shrink-0 text-[var(--text-dim)] transition-transform duration-200"
                    style={{ transform: isOpen ? "rotate(180deg)" : undefined }}
                  />
                </button>

                {isOpen && (
                  <div className="border-t border-[var(--line-soft)] px-3.5 py-3">
                    {isEditing ? (
                      <>
                        <textarea
                          value={draft}
                          onChange={(event) => setDraft(event.target.value)}
                          rows={5}
                          className="w-full resize-none rounded-lg border border-[var(--line)] bg-[var(--bg-soft)] p-3 text-[13px] leading-snug text-[var(--text)] focus:border-[var(--accent)] focus:outline-none"
                        />
                        <div className="mt-2.5 flex flex-wrap gap-2">
                          <button
                            type="button"
                            className="btn btn-primary"
                            style={{ minHeight: 38, fontSize: 13 }}
                            onClick={() => {
                              onSave(entry.id, draft.trim() || entry.answer);
                              setEditingId(null);
                            }}
                          >
                            <Save size={14} />
                            Guardar
                          </button>
                          <button
                            type="button"
                            className="btn btn-ghost"
                            style={{ minHeight: 38, fontSize: 13 }}
                            onClick={() => setEditingId(null)}
                          >
                            <X size={14} />
                            Cancelar
                          </button>
                        </div>
                      </>
                    ) : (
                      <>
                        <p className="rounded-lg bg-[var(--surface-2)] p-3 text-[13px] leading-snug text-[var(--text-muted)]">
                          {entry.answer}
                        </p>
                        <div className="mt-2.5 flex flex-wrap items-center gap-2">
                          <button
                            type="button"
                            className="btn btn-ghost"
                            style={{ minHeight: 36, fontSize: 12.5, padding: "0 12px" }}
                            onClick={() => {
                              setDraft(entry.answer);
                              setEditingId(entry.id);
                            }}
                          >
                            <Pencil size={13} />
                            Editar respuesta
                          </button>
                          <span className="flex items-center gap-1.5 text-[11.5px] text-[var(--text-dim)]">
                            <Sparkles size={12} />
                            se aplica al instante
                          </span>
                        </div>
                      </>
                    )}
                  </div>
                )}
              </article>
            );
          })}
        </div>
      </div>
    </div>
  );
}
