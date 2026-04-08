import type { Metadata } from "next";
import { Titillium_Web } from "next/font/google";
import "./globals.css";

const titillium = Titillium_Web({
  subsets: ["latin"],
  weight: ["300", "400", "600", "700", "900"],
  variable: "--font-titillium",
  display: "swap",
});

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
    <html lang="es" className={titillium.variable}>
      <body>{children}</body>
    </html>
  );
}
