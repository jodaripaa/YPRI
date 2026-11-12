import {
  forwardRef,
  useId,
  type InputHTMLAttributes,
  type ReactNode,
  type SelectHTMLAttributes,
  type TextareaHTMLAttributes,
} from "react";
import { AlertCircle } from "lucide-react";
import { cx } from "./cx";

const CONTROL =
  "w-full rounded-xl border border-border bg-card px-3.5 text-sm text-foreground placeholder:text-muted-foreground/70 " +
  "transition-shadow focus:border-accent focus:outline-none focus:ring-4 focus:ring-accent/20 " +
  "disabled:bg-muted disabled:text-muted-foreground aria-[invalid=true]:border-red-400";

interface FieldProps {
  etiqueta: string;
  ayuda?: string;
  error?: string | null;
  className?: string;
  children: (props: { id: string; "aria-describedby"?: string; "aria-invalid"?: boolean }) => ReactNode;
}

/** Envoltorio accesible: asocia etiqueta, ayuda y error con el control. */
export function Field({ etiqueta, ayuda, error, className, children }: FieldProps) {
  const id = useId();
  const idDescripcion = error || ayuda ? `${id}-descripcion` : undefined;
  return (
    <div className={className}>
      <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-foreground">
        {etiqueta}
      </label>
      {children({ id, "aria-describedby": idDescripcion, "aria-invalid": error ? true : undefined })}
      {(error || ayuda) && (
        <p id={idDescripcion} className={cx("mt-1.5 text-xs", error ? "text-red-600" : "text-muted-foreground")}>
          {error || ayuda}
        </p>
      )}
    </div>
  );
}

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(function Input({ className, ...props }, ref) {
  return <input ref={ref} className={cx(CONTROL, "h-11", className)} {...props} />;
});

export function Select({ className, ...props }: SelectHTMLAttributes<HTMLSelectElement>) {
  return <select className={cx(CONTROL, "h-11 pr-9", className)} {...props} />;
}

export function Textarea({ className, ...props }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea className={cx(CONTROL, "py-2.5", className)} {...props} />;
}

export function FormError({ mensaje }: { mensaje: string | null }) {
  if (!mensaje) return null;
  return (
    <p role="alert" className="flex animate-fade-in items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-3.5 py-2.5 text-sm text-red-700">
      <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
      {mensaje}
    </p>
  );
}
