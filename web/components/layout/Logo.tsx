import Image from "next/image";
import { cx } from "@/components/ui";

/**
 * Logo de YPRI. Sobre fondos claros usa el logotipo completo; sobre el azul
 * marino (claro) usa el ícono con el nombre en blanco.
 */
export function Logo({ claro, className, prioridad }: { claro?: boolean; className?: string; prioridad?: boolean }) {
  if (claro) {
    return (
      <span className={cx("inline-flex items-center gap-2.5", className)}>
        <Image src="/images/ypri-icon.png" alt="" width={36} height={36} priority={prioridad} className="h-9 w-9 rounded-xl ring-1 ring-white/15" />
        <span className="text-xl font-bold tracking-tight text-white">YPRI</span>
      </span>
    );
  }
  return <Image src="/images/ypri-logo.png" alt="YPRI" width={94} height={32} priority={prioridad} className={cx("h-8 w-auto dark:brightness-0 dark:invert", className)} />;
}
