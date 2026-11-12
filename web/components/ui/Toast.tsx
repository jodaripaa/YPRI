"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { AlertCircle, CheckCircle2, X } from "lucide-react";
import { cx } from "./cx";

type TonoToast = "exito" | "error";

interface Toast {
  id: number;
  tono: TonoToast;
  mensaje: string;
}

interface ToastApi {
  exito: (mensaje: string) => void;
  error: (mensaje: string) => void;
}

const DURACION_MS = 4000;
const ToastContext = createContext<ToastApi | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const siguienteId = useRef(0);
  const temporizadores = useRef(new Map<number, ReturnType<typeof setTimeout>>());

  const descartar = useCallback((id: number) => {
    setToasts((actuales) => actuales.filter((t) => t.id !== id));
    clearTimeout(temporizadores.current.get(id));
    temporizadores.current.delete(id);
  }, []);

  const mostrar = useCallback(
    (tono: TonoToast, mensaje: string) => {
      const id = ++siguienteId.current;
      setToasts((actuales) => [...actuales.slice(-2), { id, tono, mensaje }]);
      temporizadores.current.set(id, setTimeout(() => descartar(id), DURACION_MS));
    },
    [descartar],
  );

  useEffect(() => {
    const mapa = temporizadores.current;
    return () => mapa.forEach(clearTimeout);
  }, []);

  const api = useRef<ToastApi>({ exito: () => {}, error: () => {} });
  api.current.exito = (mensaje) => mostrar("exito", mensaje);
  api.current.error = (mensaje) => mostrar("error", mensaje);

  return (
    <ToastContext.Provider value={api.current}>
      {children}
      <div aria-live="polite" className="pointer-events-none fixed inset-x-0 bottom-4 z-[60] flex flex-col items-center gap-2 px-4 sm:items-end sm:pr-6">
        {toasts.map((toast) => {
          const Icono = toast.tono === "exito" ? CheckCircle2 : AlertCircle;
          return (
            <div
              key={toast.id}
              role={toast.tono === "error" ? "alert" : "status"}
              className="pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 shadow-lg"
            >
              <Icono className={cx("mt-0.5 h-4 w-4 shrink-0", toast.tono === "exito" ? "text-emerald-600" : "text-red-600")} />
              <p className="flex-1">{toast.mensaje}</p>
              <button type="button" onClick={() => descartar(toast.id)} className="text-slate-400 hover:text-slate-600" aria-label="Cerrar aviso">
                <X className="h-4 w-4" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast(): ToastApi {
  const contexto = useContext(ToastContext);
  if (!contexto) throw new Error("useToast debe usarse dentro de ToastProvider");
  return contexto;
}
