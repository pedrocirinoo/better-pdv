import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "PDV — Frente de Caixa",
  description: "Sistema de ponto de venda redesenhado",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Manrope:wght@600;700;800&display=swap" rel="stylesheet" />
      </head>
      <body className="bg-surface text-onsurface h-screen flex flex-col overflow-hidden">
        {children}
      </body>
    </html>
  );
}
