import type { Metadata } from "next";
import "./globals.css";
import { AppProviders } from "@/components/AppProviders";

export const metadata: Metadata = {
  title: "Sistema de Leitura de Temperatura",
  description:
    "Aplicação para cadastro, leitura e visualização de dados de sensores de temperatura.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body>
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}

