import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "F1 Friends",
  description: "Liga privada de Fórmula 1",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
