"use client";

import { useCallback, useEffect, useState } from "react";
import { Monitor, Moon, Sun, type LucideIcon } from "lucide-react";
import { cx } from "@/components/ui";
import { CLAVE_TEMA, CONSULTA_OSCURO } from "./temaScript";

export type Tema = "claro" | "oscuro" | "sistema";

const CLAVE = CLAVE_TEMA;

function leerTema(): Tema {
  try {
    const guardado = localStorage.getItem(CLAVE);
    return guardado === "claro" || guardado === "oscuro" ? guardado : "sistema";
  } catch {
    return "sistema";
  }
}

function aplicar(tema: Tema) {
  const oscuro = tema === "oscuro" || (tema === "sistema" && window.matchMedia(CONSULTA_OSCURO).matches);
  document.documentElement.classList.toggle("dark", oscuro);
}

export function useTema() {
  const [tema, setTemaEstado] = useState<Tema>("sistema");

  useEffect(() => setTemaEstado(leerTema()), []);

  // Con "sistema", sigue los cambios del sistema operativo en vivo.
  useEffect(() => {
    if (tema !== "sistema") return;
    const consulta = window.matchMedia(CONSULTA_OSCURO);
    const alCambiar = () => aplicar("sistema");
    consulta.addEventListener("change", alCambiar);
    return () => consulta.removeEventListener("change", alCambiar);
  }, [tema]);

  const setTema = useCallback((siguiente: Tema) => {
    try {
      localStorage.setItem(CLAVE, siguiente);
    } catch {
      // Sin almacenamiento: el tema se aplica solo en esta visita.
    }
    aplicar(siguiente);
    setTemaEstado(siguiente);
  }, []);

  return { tema, setTema };
}

const OPCIONES: { id: Tema; etiqueta: string; icono: LucideIcon }[] = [
  { id: "claro", etiqueta: "Claro", icono: Sun },
  { id: "oscuro", etiqueta: "Oscuro", icono: Moon },
  { id: "sistema", etiqueta: "Sistema", icono: Monitor },
];

/** Selector de tema de tres posiciones. `sobreOscuro` lo adapta a la barra lateral azul. */
export function SelectorTema({ sobreOscuro, conEtiquetas, className }: { sobreOscuro?: boolean; conEtiquetas?: boolean; className?: string }) {
  const { tema, setTema } = useTema();
  return (
    <div
      role="radiogroup"
      aria-label="Tema de color"
      className={cx("inline-flex gap-1 rounded-xl p-1", sobreOscuro ? "bg-white/10" : "bg-muted", className)}
    >
      {OPCIONES.map(({ id, etiqueta, icono: Icono }) => {
        const activo = tema === id;
        return (
          <button
            key={id}
            type="button"
            role="radio"
            aria-checked={activo}
            aria-label={conEtiquetas ? undefined : `Tema ${etiqueta.toLowerCase()}`}
            title={etiqueta}
            onClick={() => setTema(id)}
            className={cx(
              "flex flex-1 items-center justify-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium transition-all duration-200",
              activo
                ? sobreOscuro
                  ? "bg-white/15 text-white shadow-sm"
                  : "bg-card text-foreground shadow-sm"
                : sobreOscuro
                  ? "text-primary-foreground/60 hover:text-white"
                  : "text-muted-foreground hover:text-foreground",
            )}
          >
            <Icono className="h-4 w-4" aria-hidden />
            {conEtiquetas && etiqueta}
          </button>
        );
      })}
    </div>
  );
}
