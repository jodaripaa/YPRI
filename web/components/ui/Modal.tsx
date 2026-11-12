"use client";

import { useEffect, useId, useRef, type ReactNode } from "react";
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

const ANCHOS = { sm: "max-w-sm", md: "max-w-md", lg: "max-w-lg" };

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

  if (!abierto) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/50 sm:items-center sm:p-4" onClick={onCerrar}>
      <div
        ref={panel}
        role="dialog"
        aria-modal="true"
        aria-labelledby={idTitulo}
        className={cx("max-h-[92vh] w-full overflow-y-auto rounded-t-xl bg-white shadow-xl sm:rounded-xl", ANCHOS[ancho])}
        onClick={(evento) => evento.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4 border-b border-slate-200 px-5 py-4">
          <div>
            <h2 id={idTitulo} className="text-base font-semibold text-slate-900">
              {titulo}
            </h2>
            {descripcion && <p className="mt-0.5 text-sm text-slate-500">{descripcion}</p>}
          </div>
          <button
            type="button"
            data-cerrar
            onClick={onCerrar}
            className="-mr-1 rounded-md p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
            aria-label="Cerrar"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="px-5 py-4">{children}</div>
        {pie && <div className="flex justify-end gap-2 border-t border-slate-200 bg-slate-50 px-5 py-3">{pie}</div>}
      </div>
    </div>
  );
}
