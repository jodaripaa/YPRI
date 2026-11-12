import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { Inter } from "next/font/google";
import { SCRIPT_TEMA } from "@/components/layout/temaScript";
import { ToastProvider } from "@/components/ui";
import { AppStoreProvider } from "@/store/AppStore";
import "./globals.css";

// Tipografía del prototipo de v0, servida por Next.js desde el propio sitio.
const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });

export const metadata: Metadata = {
  title: "YPRI | Servicios a domicilio",
  description: "Encuentra y contrata profesionales de electricidad, plomería, limpieza, climatización y cerrajería a domicilio.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#003151" },
    { media: "(prefers-color-scheme: dark)", color: "#060e15" },
  ],
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    // La clase "dark" la pone el script antes de hidratar; por eso se ignora la diferencia.
    <html lang="es" className={inter.variable} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: SCRIPT_TEMA }} />
      </head>
      <body className="min-h-screen">
        <AppStoreProvider>
          <ToastProvider>{children}</ToastProvider>
        </AppStoreProvider>
      </body>
    </html>
  );
}
