import Image from "next/image";
import {
  ArrowDown,
  CalendarClock,
  CircleCheckBig,
  CornerUpRight,
  Database,
  Inbox,
  MessageSquareText,
  PhoneCall,
  ScrollText,
  ShieldCheck,
} from "lucide-react";
import Console from "@/components/Console";
import Reveal from "@/components/Reveal";

const CAPABILITIES = [
  {
    icon: PhoneCall,
    title: "Tu número en el canal oficial",
    text: "El mismo número que ya usan tus clientes, conectado a la plataforma oficial de mensajería para empresas.",
  },
  {
    icon: Inbox,
    title: "Ningún mensaje se pierde",
    text: "Cada mensaje entrante se confirma y se encola. Si algo falla en el camino, se reintenta solo.",
  },
  {
    icon: MessageSquareText,
    title: "Las preguntas de siempre, resueltas solas",
    text: "Horarios, precios, formas de pago, envíos y garantía se responden al instante con el contenido de tu equipo.",
  },
  {
    icon: Database,
    title: "Respuestas con datos reales",
    text: "El estado de un pedido no es un texto fijo. Se consulta y se responde con la información del momento.",
  },
  {
    icon: CornerUpRight,
    title: "Derivación con el historial completo",
    text: "Cuando la confianza baja o el caso es delicado, entra una persona y lee todo lo que ya se dijo.",
  },
  {
    icon: CalendarClock,
    title: "Dentro y fuera de horario",
    text: "De noche el sistema sigue resolviendo lo que sabe y ordena la fila para la primera hora del día siguiente.",
  },
  {
    icon: ScrollText,
    title: "Registro de cada conversación",
    text: "Queda guardado qué entró, qué se respondió y por qué se tomó esa decisión.",
  },
  {
    icon: ShieldCheck,
    title: "Nunca responde a medias",
    text: "Si la consulta no está cubierta, no improvisa. Prefiere pasar el caso antes que dar una respuesta equivocada.",
  },
];

const STEPS = [
  {
    title: "Pregunta algo común",
    text: "Toca una de las preguntas sugeridas en el teléfono. Mira cómo la respuesta sale sola y con qué nivel de confianza.",
  },
  {
    title: "Pide el estado de un pedido",
    text: "Escribe que quieres saber dónde está tu pedido y responde con el código A-4821. La respuesta se arma con datos, no con un texto guardado.",
  },
  {
    title: "Fuerza un caso delicado",
    text: "Escribe que te cobraron dos veces. El sistema se detiene, no improvisa y la conversación aparece en la bandeja del equipo con todo el historial.",
  },
];

export default function Home() {
  return (
    <main className="min-h-screen">
      <header className="sticky top-0 z-40 border-b border-[var(--line-soft)] bg-[rgba(8,10,17,0.82)] backdrop-blur-xl">
        <div className="mx-auto flex h-16 w-full max-w-[1400px] items-center gap-3 px-4 sm:px-6">
          <span
            className="flex h-9 w-9 items-center justify-center rounded-xl text-[15px] font-black text-white"
            style={{ background: "linear-gradient(135deg, var(--accent), var(--accent-2))" }}
          >
            H
          </span>
          <div className="min-w-0">
            <p className="text-[15px] font-bold leading-none">Hilo</p>
            <p className="mt-1 hidden text-[11.5px] leading-none text-[var(--text-dim)] sm:block">
              Atención automática en WhatsApp
            </p>
          </div>
          <nav className="ml-auto flex items-center gap-2">
            <a href="#capacidades" className="btn btn-ghost hidden sm:inline-flex" style={{ minHeight: 40, fontSize: 13 }}>
              Qué incluye
            </a>
            <a href="#consola" className="btn btn-primary" style={{ minHeight: 40, fontSize: 13 }}>
              Probar la demostración
            </a>
          </nav>
        </div>
      </header>

      <section className="relative overflow-hidden">
        <div
          className="pointer-events-none absolute inset-0 opacity-70"
          style={{
            background:
              "radial-gradient(900px 420px at 18% -10%, rgba(99,102,241,0.22), transparent 60%), radial-gradient(700px 380px at 92% 0%, rgba(139,92,246,0.16), transparent 62%)",
          }}
        />
        <div className="relative mx-auto grid w-full max-w-[1400px] gap-10 px-4 py-14 sm:px-6 sm:py-20 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
          <Reveal>
            <span className="chip" style={{ color: "var(--accent)", borderColor: "rgba(99,102,241,0.4)", background: "var(--accent-soft)" }}>
              <CircleCheckBig size={13} />
              Demostración interactiva
            </span>
            <h1 className="mt-5 text-[34px] font-extrabold leading-[1.1] tracking-[-0.02em] sm:text-[46px] lg:text-[54px]">
              Las preguntas de siempre se responden solas.
              <br />
              <span
                style={{
                  background: "linear-gradient(120deg, var(--accent) 10%, var(--accent-2) 70%)",
                  WebkitBackgroundClip: "text",
                  backgroundClip: "text",
                  color: "transparent",
                }}
              >
                Las que importan llegan a tu equipo.
              </span>
            </h1>
            <p className="mt-5 max-w-[560px] text-[15.5px] leading-relaxed text-[var(--text-muted)]">
              Esta es una simulación funcional de la atención automática en WhatsApp. A la izquierda está el teléfono
              del cliente, al centro lo que el sistema decide con cada mensaje y a la derecha la bandeja donde entra
              una persona del equipo cuando hace falta.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <a href="#consola" className="btn btn-primary">
                Abrir la consola
                <ArrowDown size={16} />
              </a>
              <a href="#capacidades" className="btn btn-ghost">
                Ver qué incluye
              </a>
            </div>
            <div className="mt-8 flex flex-wrap gap-2.5">
              <span className="chip">Respuesta en menos de 2 segundos</span>
              <span className="chip">Derivación con historial</span>
              <span className="chip">Contenido editable por tu equipo</span>
            </div>
          </Reveal>

          <Reveal delay={120}>
            <div className="relative">
              <div
                className="absolute -inset-4 rounded-[36px] opacity-60 blur-2xl"
                style={{ background: "linear-gradient(140deg, rgba(99,102,241,0.35), rgba(139,92,246,0.08))" }}
              />
              <Image
                src="https://images.unsplash.com/photo-1611606063065-ee7946f0787a?w=1100&h=880&fit=crop&q=80"
                alt="Persona atendiendo mensajes de clientes desde el teléfono"
                width={1100}
                height={880}
                priority
                unoptimized
                className="relative h-[280px] w-full rounded-[28px] border border-[var(--line)] object-cover sm:h-[380px] lg:h-[460px]"
              />
              <div className="relative -mt-12 ml-4 w-[min(300px,86%)] rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-4 shadow-[var(--shadow)] sm:-mt-16">
                <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--text-dim)]">
                  Consulta entrante
                </p>
                <p className="mt-1.5 text-[13.5px] leading-snug">Hasta que hora atienden hoy?</p>
                <div className="mt-3 flex items-center gap-2">
                  <span className="chip" style={{ color: "var(--ok)", borderColor: "rgba(16,185,129,0.35)", background: "var(--ok-soft)" }}>
                    respondida sola
                  </span>
                  <span className="mono text-[var(--text-dim)]">1.2 s</span>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      <section id="consola" className="mx-auto w-full max-w-[1400px] scroll-mt-20 px-4 pb-16 sm:px-6">
        <Reveal>
          <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 className="text-[24px] font-extrabold tracking-[-0.01em] sm:text-[30px]">La consola en vivo</h2>
              <p className="mt-1.5 max-w-[620px] text-[14.5px] leading-relaxed text-[var(--text-muted)]">
                Todo lo que ves funciona. Escribe desde el teléfono y sigue el recorrido completo del mensaje.
              </p>
            </div>
            <span className="chip">Datos de demostración</span>
          </div>
        </Reveal>
        <Console />
      </section>

      <section className="border-y border-[var(--line-soft)] bg-[var(--bg-soft)]">
        <div className="mx-auto w-full max-w-[1400px] px-4 py-14 sm:px-6">
          <Reveal>
            <h2 className="text-[24px] font-extrabold tracking-[-0.01em] sm:text-[30px]">Tres pruebas que vale la pena hacer</h2>
          </Reveal>
          <div className="mt-7 grid gap-4" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))" }}>
            {STEPS.map((step, index) => (
              <Reveal key={step.title} delay={index * 90}>
                <article className="card lift h-full p-5">
                  <span
                    className="mono flex h-8 w-8 items-center justify-center rounded-lg font-bold"
                    style={{ background: "var(--accent-soft)", color: "var(--accent)", fontSize: 13 }}
                  >
                    {index + 1}
                  </span>
                  <h3 className="mt-3.5 text-[16px] font-bold">{step.title}</h3>
                  <p className="mt-1.5 text-[13.5px] leading-relaxed text-[var(--text-muted)]">{step.text}</p>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section id="capacidades" className="mx-auto w-full max-w-[1400px] scroll-mt-20 px-4 py-16 sm:px-6">
        <Reveal>
          <h2 className="text-[24px] font-extrabold tracking-[-0.01em] sm:text-[30px]">Qué incluye esta primera etapa</h2>
          <p className="mt-1.5 max-w-[640px] text-[14.5px] leading-relaxed text-[var(--text-muted)]">
            El alcance de la demostración es el mismo que el de la propuesta. Nada de lo que ves aquí queda fuera.
          </p>
        </Reveal>
        <div className="mt-8 grid gap-4" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(270px, 1fr))" }}>
          {CAPABILITIES.map((capability, index) => (
            <Reveal key={capability.title} delay={(index % 4) * 70}>
              <article className="card lift h-full p-5">
                <span
                  className="flex h-10 w-10 items-center justify-center rounded-xl"
                  style={{ background: "var(--accent-soft)", color: "var(--accent)" }}
                >
                  <capability.icon size={19} />
                </span>
                <h3 className="mt-4 text-[15.5px] font-bold leading-snug">{capability.title}</h3>
                <p className="mt-1.5 text-[13.5px] leading-relaxed text-[var(--text-muted)]">{capability.text}</p>
              </article>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="mx-auto w-full max-w-[1400px] px-4 pb-16 sm:px-6">
        <Reveal>
          <div className="card grid gap-0 overflow-hidden lg:grid-cols-[1fr_0.85fr]">
            <div className="p-7 sm:p-10">
              <h2 className="text-[22px] font-extrabold leading-tight sm:text-[27px]">
                El contenido de las respuestas es tuyo
              </h2>
              <p className="mt-3 text-[14.5px] leading-relaxed text-[var(--text-muted)]">
                En la pestaña de respuestas puedes editar cualquier texto y guardarlo. El chat lo usa en el siguiente
                mensaje, sin esperar a nadie. Así queda el sistema al final de esta etapa: tu equipo cambia lo que dice
                el negocio y el sistema solo decide cuándo decirlo.
              </p>
              <div className="mt-6 flex flex-wrap gap-2.5">
                <span className="chip">Edición inmediata</span>
                <span className="chip">Sin depender del desarrollador</span>
                <span className="chip">Historial de cada cambio</span>
              </div>
            </div>
            <Image
              src="https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=900&h=700&fit=crop&q=80"
              alt="Almacén de distribución con pedidos preparados para despacho"
              width={900}
              height={700}
              unoptimized
              className="h-full min-h-[240px] w-full object-cover"
            />
          </div>
        </Reveal>
      </section>

      <footer className="border-t border-[var(--line-soft)] bg-[var(--bg-soft)]">
        <div className="mx-auto w-full max-w-[1400px] px-4 py-10 sm:px-6">
          <div className="flex flex-wrap items-center gap-3">
            <span
              className="flex h-8 w-8 items-center justify-center rounded-lg text-[13px] font-black text-white"
              style={{ background: "linear-gradient(135deg, var(--accent), var(--accent-2))" }}
            >
              H
            </span>
            <p className="text-[14px] font-bold">Hilo</p>
          </div>
          <p className="mt-4 max-w-[720px] text-[12.5px] leading-relaxed text-[var(--text-dim)]">
            Demostración con datos simulados. No hay conexión real con WhatsApp, ni números, pedidos o clientes
            reales. La empresa Distribuidora Andes y todas las conversaciones fueron creadas solo para mostrar el
            comportamiento del sistema.
          </p>
        </div>
      </footer>
    </main>
  );
}
