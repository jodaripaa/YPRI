"use client";

import { useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { useToast } from "@/components/ui";
import { puedeVerVista, vistaInicial, vistasPermitidas, type VistaId } from "@/lib/domain/navigation";
import { useAppStore } from "@/store/AppStore";
import { useSesion } from "@/store/hooks";
import { LoginView } from "./auth/LoginView";
import { RegisterView } from "./auth/RegisterView";
import { REGISTRO_VISTAS } from "./viewRegistry";

export function YpriApp() {
  const { hidratado } = useAppStore();
  const { usuarioActual, cerrarSesion } = useSesion();
  const toast = useToast();
  const [pantallaAcceso, setPantallaAcceso] = useState<"login" | "registro">("login");
  const [vista, setVista] = useState<VistaId | null>(null);

  // Al cambiar de sesión se reinicia la vista a la primera permitida para el rol.
  const claveSesion = usuarioActual ? `${usuarioActual.id}:${usuarioActual.rol}` : null;
  const [claveVista, setClaveVista] = useState(claveSesion);
  if (claveVista !== claveSesion) {
    setClaveVista(claveSesion);
    setVista(vistaInicial(usuarioActual));
  }

  if (!hidratado) return <div className="min-h-screen bg-slate-100" aria-busy="true" />;

  if (!usuarioActual) {
    return pantallaAcceso === "login" ? (
      <LoginView onIrARegistro={() => setPantallaAcceso("registro")} />
    ) : (
      <RegisterView onIrALogin={() => setPantallaAcceso("login")} />
    );
  }

  // Protección de vistas: nunca se renderiza una vista que el rol no tiene permitida.
  const vistaSegura = vista && puedeVerVista(usuarioActual, vista) ? vista : vistaInicial(usuarioActual);
  if (!vistaSegura) return null;

  const navegar = (destino: VistaId) => {
    if (puedeVerVista(usuarioActual, destino)) setVista(destino);
    window.scrollTo({ top: 0 });
  };

  const salir = () => {
    cerrarSesion();
    setPantallaAcceso("login");
    toast.exito("Cerraste sesión correctamente.");
  };

  return (
    <AppShell
      usuario={usuarioActual}
      vistas={vistasPermitidas(usuarioActual)}
      vistaActiva={vistaSegura}
      onNavegar={navegar}
      onCerrarSesion={salir}
    >
      {REGISTRO_VISTAS[vistaSegura]({ usuario: usuarioActual, navegar })}
    </AppShell>
  );
}
