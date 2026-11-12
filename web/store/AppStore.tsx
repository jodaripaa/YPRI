"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { Result } from "@/lib/result";
import { crearEstadoInicial } from "@/lib/seed";
import type { AppData, Usuario } from "@/lib/types";
import { borrarEstado, cargarEstado, guardarEstado } from "./persistence";

interface AppStoreValue {
  data: AppData;
  usuarioActual: Usuario | null;
  hidratado: boolean;
  /** Aplica el resultado de una operación de dominio y devuelve el mismo resultado. */
  aplicar: <T extends { data: AppData } | AppData>(resultado: Result<T>) => Result<T>;
  restablecerDemo: () => void;
}

const AppStoreContext = createContext<AppStoreValue | null>(null);

const extraerData = (valor: { data: AppData } | AppData): AppData => ("data" in valor ? valor.data : valor);

export function AppStoreProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<AppData>(crearEstadoInicial);
  const [hidratado, setHidratado] = useState(false);

  useEffect(() => {
    const guardado = cargarEstado();
    if (guardado) setData(guardado);
    setHidratado(true);
  }, []);

  useEffect(() => {
    if (hidratado) guardarEstado(data);
  }, [data, hidratado]);

  const aplicar = useCallback(<T extends { data: AppData } | AppData>(resultado: Result<T>) => {
    if (resultado.ok) setData(extraerData(resultado.value));
    return resultado;
  }, []);

  const restablecerDemo = useCallback(() => {
    borrarEstado();
    setData(crearEstadoInicial());
  }, []);

  const usuarioActual = useMemo(
    () => data.usuarios.find((u) => u.id === data.sesionUsuarioId && u.activo) ?? null,
    [data.usuarios, data.sesionUsuarioId],
  );

  const valor = useMemo(
    () => ({ data, usuarioActual, hidratado, aplicar, restablecerDemo }),
    [data, usuarioActual, hidratado, aplicar, restablecerDemo],
  );

  return <AppStoreContext.Provider value={valor}>{children}</AppStoreContext.Provider>;
}

export function useAppStore(): AppStoreValue {
  const contexto = useContext(AppStoreContext);
  if (!contexto) throw new Error("useAppStore debe usarse dentro de AppStoreProvider");
  return contexto;
}
