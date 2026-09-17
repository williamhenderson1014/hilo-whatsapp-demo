import type { Metadata } from "next";
import { Lexend } from "next/font/google";
import "./globals.css";

const lexend = Lexend({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-lexend",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Hilo | Respuestas automaticas en WhatsApp",
  description:
    "Consola de atencion automatica para WhatsApp: respuestas a consultas frecuentes, respuestas con datos reales y derivacion a una persona con el historial completo.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={lexend.variable}>
      <body>{children}</body>
    </html>
  );
}
