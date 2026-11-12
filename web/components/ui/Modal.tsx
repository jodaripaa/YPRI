"use client";

import { useEffect, useId, useRef, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { cx } from "./cx";

interface ModalProps {
  abierto: boolean;
  titulo: string;
  descripcion?: string;
  onCerrar: () => void;
  children: ReactNode;
  pie?: ReactNode;
  ancho?: "sm" | "md" | "lg";
}

const ANCHOS = { sm: "sm:max-w-sm", md: "sm:max-w-md", lg: "sm:max-w-lg" };

/** Diálogo: hoja inferior en móvil y ventana centrada en pantallas grandes. */
export function Modal({ abierto, titulo, descripcion, onCerrar, children, pie, ancho = "md" }: ModalProps) {
  const idTitulo = useId();
  const panel = useRef<HTMLDivElement>(null);
  const cerrar = useRef(onCerrar);
  cerrar.current = onCerrar;

  useEffect(() => {
    if (!abierto) return;
    const alPresionar = (evento: KeyboardEvent) => evento.key === "Escape" && cerrar.current();
    document.addEventListener("keydown", alPresionar);
    const desbordeAnterior = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    panel.current?.querySelector<HTMLElement>("input, select, textarea, button:not([data-cerrar])")?.focus();
    return () => {
      document.removeEventListener("keydown", alPresionar);
      document.body.style.overflow = desbordeAnterior;
    };
  }, [abierto]);

  if (!abierto || typeof document === "undefined") return null;

  // Se monta en <body> para quedar por encima de todo: las animaciones de
  // entrada de las vistas crean contextos de apilamiento que lo encerrarían.
  return createPortal(
    <div
      className="fixed inset-0 z-50 flex animate-fade-in items-end justify-center bg-primary/40 backdrop-blur-[2px] sm:items-center sm:p-4"
      onClick={onCerrar}
    >
      <div
        ref={panel}
        role="dialog"
        aria-modal="true"
        aria-labelledby={idTitulo}
        className={cx(
          "max-h-[92vh] w-full animate-slide-up overflow-y-auto rounded-t-3xl bg-card shadow-elevada sm:animate-scale-in sm:rounded-2xl",
          ANCHOS[ancho],
        )}
        onClick={(evento) => evento.stopPropagation()}
      >
        <div className="mx-auto mt-2.5 h-1 w-10 rounded-full bg-border sm:hidden" aria-hidden />
        <div className="flex items-start justify-between gap-4 px-5 pb-3 pt-4">
          <div>
            <h2 id={idTitulo} className="text-lg font-semibold">
              {titulo}
            </h2>
            {descripcion && <p className="mt-0.5 text-sm text-muted-foreground">{descripcion}</p>}
          </div>
          <button
            type="button"
            data-cerrar
            onClick={onCerrar}
            className="touch-feedback -mr-1.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-muted-foreground hover:bg-muted hover:text-foreground"
            aria-label="Cerrar"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="px-5 pb-5">{children}</div>
        {pie && <div className="pb-safe flex justify-end gap-2 border-t border-border bg-muted/40 px-5 pt-3 sm:pb-3">{pie}</div>}
      </div>
    </div>,
    document.body,
  );
}
