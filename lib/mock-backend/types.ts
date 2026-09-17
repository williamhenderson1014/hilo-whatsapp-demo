export type Role = "customer" | "bot" | "agent" | "system";

export type Delivery = "sending" | "sent" | "delivered" | "read";

export type ConversationState = "bot" | "queue" | "agent" | "closed";

export type Action =
  | "auto_reply"
  | "ask_data"
  | "dynamic_reply"
  | "escalate"
  | "after_hours"
  | "template_required";

export interface MessageMeta {
  intent?: string;
  confidence?: number;
  source?: string;
  template?: string;
}

export interface Message {
  id: string;
  role: Role;
  text: string;
  at: number;
  delivery?: Delivery;
  meta?: MessageMeta;
}

export interface KnowledgeEntry {
  id: string;
  intent: string;
  title: string;
  category: string;
  patterns: string[];
  answer: string;
  dynamic?: boolean;
  handoff?: boolean;
  editedByTeam?: boolean;
}

export interface Order {
  code: string;
  customer: string;
  status: string;
  carrier: string;
  eta: string;
  total: string;
  updatedAt: string;
}

export interface Conversation {
  id: string;
  name: string;
  phone: string;
  avatar: string;
  state: ConversationState;
  messages: Message[];
  lastCustomerAt: number;
  tags: string[];
  awaiting?: "order_code" | null;
  escalationReason?: string;
  unread?: number;
}

export interface PipelineStep {
  id: string;
  label: string;
  detail: string;
  status: "ok" | "warn" | "danger";
  ms: number;
}

export interface RouteDecision {
  action: Action;
  intent: string;
  intentTitle: string;
  confidence: number;
  reply: string | null;
  reason: string;
  escalationReason?: string;
  awaiting?: "order_code" | null;
  steps: PipelineStep[];
  knowledgeId?: string;
  matchedOrder?: Order;
}

export interface RouteInput {
  text: string;
  conversation: Conversation;
  businessOpen: boolean;
  knowledge: KnowledgeEntry[];
}

export interface LogEntry {
  id: string;
  direction: "in" | "out" | "internal";
  label: string;
  payload: unknown;
  at: number;
  ms?: number;
}

export interface TemplateMessage {
  id: string;
  name: string;
  status: "aprobada" | "en revisión";
  category: string;
  body: string;
}
