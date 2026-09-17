# Hilo, atención automática en WhatsApp

Demostración funcional de un sistema de respuestas automáticas para WhatsApp: el mensaje del
cliente entra, el sistema decide qué hacer con él y, cuando hace falta una persona, la
conversación llega a la bandeja del equipo con todo el historial.

## Qué se puede probar

La pantalla tiene tres paneles que trabajan juntos:

1. **Cliente.** El teléfono del cliente. Se escribe como en cualquier conversación.
2. **Motor.** El recorrido completo del mensaje: entrada, cola, clasificación, nivel de
   confianza y la acción final. Incluye la base de respuestas editable y el registro de la
   conversación con el contenido exacto de cada entrada y cada salida.
3. **Equipo.** La bandeja donde entra una persona cuando el sistema decide no responder solo.

Tres pruebas que muestran el comportamiento completo:

- Preguntar algo cubierto por la base, por ejemplo el horario. La respuesta sale sola y se ve
  con qué confianza.
- Pedir el estado de un pedido y responder con el código `A-4821`. La respuesta se arma con
  datos, no con un texto guardado.
- Escribir que hubo un cobro duplicado. El sistema se detiene, no improvisa y deriva la
  conversación con el historial.

También se puede apagar el horario de atención, editar cualquier respuesta y ver cómo cambia al
instante, y simular 24 horas de silencio para que aparezca el bloqueo de la ventana de
conversación y el envío por plantilla aprobada.

## Cómo se ejecuta

```bash
npm install
npm run dev
```

Para la versión publicable:

```bash
npm run build
```

La salida queda en `out/` como sitio estático.

## Stack

Next.js con App Router, TypeScript y Tailwind. Iconos de Lucide, tipografía Lexend y fotografías
de Unsplash. El backend está simulado: la clasificación, la base de respuestas, los pedidos y
las conversaciones viven en `lib/mock-backend/`, y `lib/api.ts` es la capa que simula el
transporte y arma los mismos payloads que usa la plataforma oficial de mensajería. Reemplazar
esa capa por llamadas reales es un cambio contenido en un solo lugar.

## Nota

Todos los datos son simulados. No hay conexión con WhatsApp ni números, pedidos o clientes
reales. Distribuidora Andes es una empresa ficticia creada para la demostración.
