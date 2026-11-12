import { forwardRef, type ButtonHTMLAttributes } from "react";
import type { LucideIcon } from "lucide-react";
import { cx } from "./cx";

type Variante = "primary" | "secondary" | "ghost" | "danger" | "success";
type Tamano = "sm" | "md";

const VARIANTES: Record<Variante, string> = {
  primary: "bg-blue-600 text-white hover:bg-blue-700 disabled:bg-slate-200 disabled:text-slate-400",
  secondary: "border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 disabled:text-slate-400",
  ghost: "text-slate-600 hover:bg-slate-100 hover:text-slate-900 disabled:text-slate-300",
  danger: "border border-red-200 bg-white text-red-600 hover:bg-red-50 disabled:text-red-300",
  success: "bg-emerald-600 text-white hover:bg-emerald-700 disabled:bg-slate-200 disabled:text-slate-400",
};

const TAMANOS: Record<Tamano, string> = {
  sm: "h-8 px-3 text-xs gap-1.5",
  md: "h-10 px-4 text-sm gap-2",
};

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variante?: Variante;
  tamano?: Tamano;
  icono?: LucideIcon;
  bloque?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variante = "primary", tamano = "md", icono: Icono, bloque, className, children, type = "button", ...props },
  ref,
) {
  return (
    <button
      ref={ref}
      type={type}
      className={cx(
        "inline-flex items-center justify-center rounded-lg font-medium transition-colors",
        "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600",
        "disabled:cursor-not-allowed",
        VARIANTES[variante],
        TAMANOS[tamano],
        bloque && "w-full",
        className,
      )}
      {...props}
    >
      {Icono && <Icono className={tamano === "sm" ? "h-3.5 w-3.5" : "h-4 w-4"} aria-hidden />}
      {children}
    </button>
  );
});
