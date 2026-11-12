"use client";

import { ChevronRight, ClipboardList, LogOut, Mail, MapPin, Phone, type LucideIcon } from "lucide-react";
import { CIUDAD_LABEL, ROL_LABEL } from "@/lib/constants";
import { resumenCliente } from "@/lib/domain/cliente";
import { formatearMoneda, iniciales } from "@/lib/format";
import type { Usuario } from "@/lib/types";
import { Button } from "@/components/ui";
import { SelectorTema } from "@/components/layout/Tema";
import { useAppStore } from "@/store/AppStore";
import { MarcoMovil } from "../componentes";

interface Props {
  usuario: Usuario;
  onCerrarSesion: () => void;
  onVerReservas: () => void;
}

export function PerfilScreen({ usuario, onCerrarSesion, onVerReservas }: Props) {
  const { data } = useAppStore();
  const resumen = resumenCliente(data.contratos, usuario);

  return (
    <MarcoMovil>
      <div className="relative overflow-hidden bg-primary px-4 pb-16 pt-8 text-center sm:rounded-b-3xl lg:mx-4 lg:mt-8 lg:rounded-3xl lg:pb-20 lg:pt-12">
        <div aria-hidden className="absolute -right-20 -top-20 hidden h-72 w-72 rounded-full bg-accent/20 blur-3xl lg:block" />
        <span
          aria-hidden
          className="mx-auto flex h-20 w-20 animate-pop items-center justify-center rounded-full border-4 border-primary-foreground/20 bg-accent text-2xl font-bold text-accent-foreground"
        >
          {iniciales(usuario.nombre)}
        </span>
        <h1 className="mt-3 text-xl font-semibold text-primary-foreground">{usuario.nombre}</h1>
        <p className="text-sm text-primary-foreground/75">
          {ROL_LABEL[usuario.rol]} · {CIUDAD_LABEL[usuario.ciudad]}
        </p>
      </div>

      <div className="relative z-10 mx-4 -mt-10 grid animate-fade-up grid-cols-3 lg:mx-auto lg:max-w-2xl divide-x divide-border rounded-2xl border border-border bg-card py-4 text-center shadow-sm">
        <Cifra valor={String(resumen.solicitudes)} etiqueta="Reservas" />
        <Cifra valor={String(resumen.completados)} etiqueta="Completadas" />
        <Cifra valor={formatearMoneda(resumen.totalInvertido)} etiqueta="Invertido" />
      </div>

      <div className="mx-auto max-w-xl space-y-6 px-4 py-6 lg:grid lg:max-w-4xl lg:grid-cols-2 lg:gap-6 lg:space-y-0 lg:pt-10">
        <section>
          <h2 className="mb-2 px-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Mis datos</h2>
          <div className="divide-y divide-border overflow-hidden rounded-2xl border border-border bg-card">
            <Fila icono={Mail} etiqueta="Correo" valor={usuario.correo} />
            <Fila icono={Phone} etiqueta="Teléfono" valor={usuario.telefono} />
            <Fila icono={MapPin} etiqueta="Ciudad" valor={CIUDAD_LABEL[usuario.ciudad]} />
          </div>
        </section>

        <section>
          <h2 className="mb-2 px-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Apariencia</h2>
          <SelectorTema conEtiquetas className="w-full" />
        </section>

        <section>
          <h2 className="mb-2 px-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Actividad</h2>
          <button
            type="button"
            onClick={onVerReservas}
            className="touch-feedback flex w-full items-center gap-3 rounded-2xl border border-border bg-card px-4 py-3.5 text-left hover:bg-muted/60"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-muted">
              <ClipboardList className="h-4 w-4" aria-hidden />
            </span>
            <span className="flex-1">
              <span className="block text-sm font-medium">Mis reservas</span>
              <span className="block text-xs text-muted-foreground">
                {resumen.enCurso ? `${resumen.enCurso} en curso` : "Sin reservas en curso"}
              </span>
            </span>
            <ChevronRight className="h-4 w-4 text-muted-foreground" aria-hidden />
          </button>
        </section>

        <Button variante="danger" icono={LogOut} bloque className="lg:col-span-2 lg:w-auto lg:justify-self-center lg:px-10" onClick={onCerrarSesion}>
          Cerrar sesión
        </Button>
      </div>
    </MarcoMovil>
  );
}

function Cifra({ valor, etiqueta }: { valor: string; etiqueta: string }) {
  return (
    <div className="min-w-0 px-2">
      <p className="truncate text-base font-bold text-enfasis sm:text-lg">{valor}</p>
      <p className="text-xs text-muted-foreground">{etiqueta}</p>
    </div>
  );
}

function Fila({ icono: Icono, etiqueta, valor }: { icono: LucideIcon; etiqueta: string; valor: string }) {
  return (
    <div className="flex items-center gap-3 px-4 py-3.5">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-muted">
        <Icono className="h-4 w-4" aria-hidden />
      </span>
      <div className="min-w-0">
        <p className="text-xs text-muted-foreground">{etiqueta}</p>
        <p className="truncate text-sm font-medium">{valor}</p>
      </div>
    </div>
  );
}
