import type { HTMLAttributes, ReactNode } from "react";
import { cx } from "./cx";

export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cx("rounded-2xl border border-border bg-card shadow-suave", className)} {...props} />;
}

interface CardHeaderProps {
  titulo: string;
  descripcion?: string;
  acciones?: ReactNode;
}

export function CardHeader({ titulo, descripcion, acciones }: CardHeaderProps) {
  return (
    <div className="flex flex-col gap-3 border-b border-border px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h3 className="text-base font-semibold">{titulo}</h3>
        {descripcion && <p className="mt-0.5 text-sm text-muted-foreground">{descripcion}</p>}
      </div>
      {acciones && <div className="flex shrink-0 items-center gap-2">{acciones}</div>}
    </div>
  );
}
