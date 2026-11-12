"use client";

import type { LucideIcon } from "lucide-react";
import { cx } from "@/components/ui";

export interface ItemNavegacion<T extends string> {
  id: T;
  etiqueta: string;
  icono: LucideIcon;
  /** Número que se muestra sobre el icono (por ejemplo, solicitudes nuevas). */
  insignia?: number;
  descripcionInsignia?: string;
}

/** Barra de navegación inferior de YPRI, compartida por todos los roles en móvil. */
export function BottomNav<T extends string>({
  items,
  activa,
  onCambiar,
  className,
}: {
  items: readonly ItemNavegacion<T>[];
  activa: T;
  onCambiar: (id: T) => void;
  className?: string;
}) {
  return (
    <nav aria-label="Principal" className={cx("fixed inset-x-0 bottom-0 z-40 border-t border-border bg-card/95 backdrop-blur-md", className)}>
      <div className="pb-safe mx-auto flex max-w-[1180px] items-stretch justify-around px-1 pt-1.5 sm:px-6">
        {items.map(({ id, etiqueta, icono: Icono, insignia, descripcionInsignia }) => {
          const seleccionada = id === activa;
          return (
            <button
              key={id}
              type="button"
              onClick={() => onCambiar(id)}
              aria-current={seleccionada ? "page" : undefined}
              className="touch-feedback relative flex min-w-0 flex-1 flex-col items-center gap-0.5 px-1 py-1.5"
            >
              <span
                className={cx(
                  "relative flex h-8 w-14 items-center justify-center rounded-full transition-colors duration-300",
                  seleccionada ? "bg-primary-soft" : "bg-transparent",
                )}
              >
                <Icono
                  className={cx("h-[22px] w-[22px] transition-all duration-300", seleccionada ? "scale-110 text-primary" : "text-muted-foreground")}
                  aria-hidden
                />
                {insignia !== undefined && insignia > 0 && (
                  <span
                    key={insignia}
                    className="absolute right-1.5 top-0 flex h-4 min-w-4 animate-pop items-center justify-center rounded-full bg-accent px-1 text-[9px] font-bold text-accent-foreground ring-2 ring-card"
                  >
                    {insignia > 9 ? "9+" : insignia}
                    {descripcionInsignia && <span className="sr-only"> {descripcionInsignia}</span>}
                  </span>
                )}
              </span>
              <span className={cx("max-w-full truncate text-[11px] font-medium transition-colors", seleccionada ? "text-primary" : "text-muted-foreground")}>
                {etiqueta}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
