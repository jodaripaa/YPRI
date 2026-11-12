import { forwardRef, type ButtonHTMLAttributes } from "react";
import type { LucideIcon } from "lucide-react";
import { cx } from "./cx";

type Variante = "primary" | "accent" | "secondary" | "ghost" | "danger" | "success";
type Tamano = "sm" | "md" | "lg";

const VARIANTES: Record<Variante, string> = {
  primary: "bg-primary text-primary-foreground shadow-sm hover:bg-primary/90",
  accent: "bg-accent text-accent-foreground shadow-sm hover:bg-accent/90",
  secondary: "border border-border bg-card text-foreground hover:bg-muted",
  ghost: "text-muted-foreground hover:bg-muted hover:text-foreground",
  danger: "border border-red-200 bg-card text-red-600 hover:bg-red-50",
  success: "bg-accent-strong text-white shadow-sm hover:bg-accent-strong/90",
};

const TAMANOS: Record<Tamano, string> = {
  sm: "h-9 px-3 text-xs gap-1.5 rounded-lg",
  md: "h-11 px-4 text-sm gap-2 rounded-xl",
  lg: "h-12 px-6 text-base gap-2 rounded-xl",
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
        "touch-feedback inline-flex shrink-0 items-center justify-center font-semibold",
        "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent",
        "disabled:pointer-events-none disabled:opacity-50",
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
