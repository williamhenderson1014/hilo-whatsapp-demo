import type { Conversation, KnowledgeEntry, Order, TemplateMessage } from "./types";

export const BUSINESS = {
  name: "Distribuidora Andes",
  hours: "Lunes a viernes, 9:00 a 18:00",
  number: "+51 999 118 240",
  agentName: "Rocío Palma",
  agentRole: "Atención al cliente",
  agentPhoto:
    "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=160&h=160&fit=crop&crop=face&q=80",
};

export const knowledgeBase: KnowledgeEntry[] = [
  {
    id: "kb-horario",
    intent: "horarios",
    title: "Horarios de atención",
    category: "Información",
    patterns: [
      "a que hora atienden",
      "horario de atencion",
      "estan abiertos",
      "hasta que hora",
      "atienden sabados",
    ],
    answer:
      "Atendemos de lunes a viernes de 9:00 a 18:00 y sábados de 9:00 a 13:00. Los pedidos por este chat quedan registrados a cualquier hora.",
  },
  {
    id: "kb-precios",
    intent: "precios",
    title: "Precios y lista mayorista",
    category: "Ventas",
    patterns: [
      "cuanto cuesta",
      "cual es el precio",
      "tienen lista de precios",
      "precio por mayor",
      "descuento por volumen",
    ],
    answer:
      "El precio depende del volumen. Desde 12 unidades aplicamos precio mayorista y desde 50 unidades hay un descuento adicional del 8 por ciento. Dime qué producto te interesa y te paso el valor exacto.",
  },
  {
    id: "kb-pago",
    intent: "pagos",
    title: "Formas de pago",
    category: "Ventas",
    patterns: [
      "como puedo pagar",
      "formas de pago",
      "aceptan tarjeta",
      "puedo pagar en cuotas",
      "hacen transferencia",
    ],
    answer:
      "Aceptamos transferencia bancaria, Yape, Plin y tarjeta de crédito hasta en 6 cuotas. Para empresas con cuenta abierta trabajamos con factura a 30 días.",
  },
  {
    id: "kb-envio",
    intent: "envios",
    title: "Tiempos de entrega y cobertura",
    category: "Logística",
    patterns: [
      "cuanto demora el envio",
      "hacen envios",
      "llegan a provincia",
      "tiempo de entrega",
      "costo de envio",
    ],
    answer:
      "En Lima entregamos en 24 a 48 horas. A provincias el despacho sale el mismo día si el pedido entra antes de las 15:00 y llega entre 2 y 4 días hábiles.",
  },
  {
    id: "kb-pedido",
    intent: "estado_pedido",
    title: "Estado de un pedido",
    category: "Logística",
    dynamic: true,
    patterns: [
      "donde esta mi pedido",
      "estado de mi pedido",
      "ya salio mi envio",
      "seguimiento",
      "cuando llega mi compra",
    ],
    answer:
      "Claro, reviso el estado ahora mismo. Pásame el código de tu pedido, tiene la forma A-0000 y aparece en el correo de confirmación.",
  },
  {
    id: "kb-garantia",
    intent: "garantia",
    title: "Garantía y cambios",
    category: "Postventa",
    patterns: [
      "tiene garantia",
      "puedo cambiar el producto",
      "llego fallado",
      "politica de devolucion",
      "cuanto dura la garantia",
    ],
    answer:
      "Todos los productos tienen 12 meses de garantía de fábrica. Si llegó con falla, el cambio es dentro de los primeros 7 días sin costo de envío para ti.",
  },
  {
    id: "kb-ubicacion",
    intent: "ubicacion",
    title: "Ubicación del almacén",
    category: "Información",
    patterns: [
      "donde estan ubicados",
      "cual es la direccion",
      "tienen tienda fisica",
      "puedo recoger",
      "como llego",
    ],
    answer:
      "Nuestro almacén está en Av. Argentina 2450, Cercado de Lima. El recojo en tienda funciona de 9:00 a 17:00 avisando con dos horas de anticipación.",
  },
  {
    id: "kb-asesor",
    intent: "asesor_humano",
    title: "Hablar con una persona",
    category: "Derivación",
    handoff: true,
    patterns: [
      "quiero hablar con una persona",
      "me pasas con un asesor",
      "necesito hablar con alguien",
      "atencion humana",
      "un vendedor",
    ],
    answer: "Te paso con una persona del equipo ahora mismo.",
  },
];

export const orders: Order[] = [
  {
    code: "A-4821",
    customer: "Carmen Rojas",
    status: "En reparto",
    carrier: "Olva Courier",
    eta: "Hoy antes de las 19:00",
    total: "S/ 1,240.00",
    updatedAt: "hace 40 minutos",
  },
  {
    code: "A-4790",
    customer: "Ferretería Sur",
    status: "Entregado",
    carrier: "Flota propia",
    eta: "Entregado el martes 09:40",
    total: "S/ 3,980.00",
    updatedAt: "hace 2 días",
  },
  {
    code: "A-4855",
    customer: "Luis Vargas",
    status: "En preparación",
    carrier: "Pendiente de asignar",
    eta: "Despacho mañana temprano",
    total: "S/ 620.00",
    updatedAt: "hace 15 minutos",
  },
];

export const templates: TemplateMessage[] = [
  {
    id: "tpl-seguimiento",
    name: "seguimiento_cotizacion",
    status: "aprobada",
    category: "Utilidad",
    body: "Hola {{1}}, te escribimos de Distribuidora Andes por la cotización {{2}}. Sigue vigente hasta el {{3}}. Respóndenos por aquí si quieres confirmarla.",
  },
  {
    id: "tpl-despacho",
    name: "aviso_despacho",
    status: "aprobada",
    category: "Utilidad",
    body: "Hola {{1}}, tu pedido {{2}} salió de nuestro almacén y llega {{3}}. Puedes responder este mensaje si necesitas cambiar la dirección.",
  },
  {
    id: "tpl-reactivacion",
    name: "reactivacion_cliente",
    status: "en revisión",
    category: "Marketing",
    body: "Hola {{1}}, hace tiempo no compras con nosotros. Tenemos precios nuevos para tu rubro.",
  },
];

const HOUR = 60 * 60 * 1000;

export function buildInbox(now: number): Conversation[] {
  return [
    {
      id: "conv-carmen",
      name: "Carmen Rojas",
      phone: "+51 987 441 220",
      avatar:
        "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=120&h=120&fit=crop&crop=face&q=80",
      state: "agent",
      lastCustomerAt: now - 2 * HOUR,
      tags: ["Reclamo", "Cobro duplicado"],
      escalationReason: "Intención sensible detectada",
      unread: 0,
      messages: [
        {
          id: "m1",
          role: "customer",
          text: "Buenos días, me cobraron dos veces el pedido A-4821",
          at: now - 2 * HOUR,
        },
        {
          id: "m2",
          role: "bot",
          text: "Entiendo, esto lo ve una persona del equipo. Ya le paso tu caso con todo el historial.",
          at: now - 2 * HOUR + 4000,
          meta: { intent: "reclamo_cobro", confidence: 0.38, source: "Derivación" },
        },
        {
          id: "m3",
          role: "agent",
          text: "Carmen, soy Rocío. Ya veo el doble cargo, estoy pidiendo la reversión al banco.",
          at: now - 100 * 60 * 1000,
        },
      ],
    },
    {
      id: "conv-luis",
      name: "Luis Vargas",
      phone: "+51 954 220 118",
      avatar:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&h=120&fit=crop&crop=face&q=80",
      state: "bot",
      lastCustomerAt: now - 26 * HOUR,
      tags: ["Cotización"],
      unread: 0,
      messages: [
        {
          id: "m1",
          role: "customer",
          text: "Cuánto cuesta el pack de 50 unidades?",
          at: now - 26 * HOUR,
        },
        {
          id: "m2",
          role: "bot",
          text: "Desde 50 unidades aplicamos un descuento adicional del 8 por ciento. Te paso el valor exacto por producto.",
          at: now - 26 * HOUR + 3000,
          meta: { intent: "precios", confidence: 0.91, source: "Base de respuestas" },
        },
      ],
    },
    {
      id: "conv-ferreteria",
      name: "Ferretería Sur",
      phone: "+51 933 887 004",
      avatar:
        "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=120&h=120&fit=crop&crop=face&q=80",
      state: "closed",
      lastCustomerAt: now - 5 * HOUR,
      tags: ["Resuelto por el sistema"],
      unread: 0,
      messages: [
        {
          id: "m1",
          role: "customer",
          text: "Ya salió el pedido A-4790?",
          at: now - 5 * HOUR,
        },
        {
          id: "m2",
          role: "bot",
          text: "Pedido A-4790: entregado el martes a las 09:40 por flota propia.",
          at: now - 5 * HOUR + 2000,
          meta: { intent: "estado_pedido", confidence: 0.96, source: "Datos de pedidos" },
        },
        {
          id: "m3",
          role: "customer",
          text: "Perfecto, gracias",
          at: now - 5 * HOUR + 60000,
        },
      ],
    },
  ];
}

export const suggestions = [
  "Hasta qué hora atienden hoy?",
  "Cuánto demora el envío a provincia?",
  "Dónde está mi pedido?",
  "Me cobraron dos veces, quiero un reclamo",
  "Quiero hablar con una persona",
  "Aceptan tarjeta en cuotas?",
];
