import type { ReactNode } from "react";
import { Card } from "@/components/ui";

export function BloqueCodigo({ lineas }: { lineas: readonly string[] }) {
  return (
    <pre className="overflow-x-auto rounded-xl bg-primary p-4 font-mono text-xs leading-relaxed text-primary-foreground/90">
      {lineas.join("\n")}
    </pre>
  );
}

export function TarjetaSubalgoritmo({
  firma,
  tipo,
  descripcion,
  children,
}: {
  firma: string;
  tipo: string;
  descripcion: string;
  children: ReactNode;
}) {
  return (
    <Card className="animate-fade-up p-5">
      <div className="flex flex-col gap-2 border-b border-border/70 pb-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h3 className="font-mono text-sm font-semibold text-foreground">{firma}</h3>
          <p className="mt-1 text-sm text-muted-foreground">{descripcion}</p>
        </div>
        <span className="shrink-0 rounded-full bg-accent/15 px-2.5 py-0.5 font-mono text-xs text-accent-strong">{tipo}</span>
      </div>
      <div className="pt-4">{children}</div>
    </Card>
  );
}

/** Convierte el texto de un campo numérico respetando un rango, sin producir NaN. */
export function numeroEnRango(texto: string, minimo: number, maximo: number): number {
  const valor = Number(texto);
  if (!Number.isFinite(valor)) return minimo;
  return Math.min(maximo, Math.max(minimo, valor));
}
