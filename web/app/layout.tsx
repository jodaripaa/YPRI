import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { ToastProvider } from "@/components/ui";
import { AppStoreProvider } from "@/store/AppStore";
import "./globals.css";

export const metadata: Metadata = {
  title: "YPRI | Servicios a domicilio",
  description: "Encuentra y contrata profesionales de electricidad, plomería, limpieza, climatización y cerrajería a domicilio.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0F172A",
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="es">
      <body className="min-h-screen bg-slate-100 text-slate-900 antialiased">
        <AppStoreProvider>
          <ToastProvider>{children}</ToastProvider>
        </AppStoreProvider>
      </body>
    </html>
  );
}
