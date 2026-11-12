"use client";

// App móvil del cliente (diseño del prototipo de v0). Usa el mismo almacén y las
// mismas reglas de dominio que el resto de YPRI: solo cambia la presentación.

import { useState, type ReactNode } from "react";
import { CalendarDays, Home, Search, User } from "lucide-react";
import { BottomNav, type ItemNavegacion } from "@/components/layout/BottomNav";
import { Logo } from "@/components/layout/Logo";
import { Avatar, cx } from "@/components/ui";
import type { CategoriaServicio } from "@/lib/constants";
import { ESTADOS_ACTIVOS, contratosVisiblesPara } from "@/lib/domain/contracts";
import { iniciales } from "@/lib/format";
import type { Contrato, Usuario } from "@/lib/types";
import { useAppStore } from "@/store/AppStore";
import { BuscarScreen, type BusquedaInicial } from "./pantallas/BuscarScreen";
import { InicioScreen } from "./pantallas/InicioScreen";
import { PerfilScreen } from "./pantallas/PerfilScreen";
import { ProfesionalScreen } from "./pantallas/ProfesionalScreen";
import { ReservaConfirmadaScreen, ReservarScreen } from "./pantallas/ReservarScreen";
import { ReservasScreen } from "./pantallas/ReservasScreen";
import { BotonUbicacion } from "./SelectorUbicacion";
import { UbicacionProvider } from "./ubicacion";

export type PestanaCliente = "inicio" | "buscar" | "reservas" | "perfil";

/** Pantallas que se abren encima de las pestañas (sin barra inferior). */
type Detalle =
  | { tipo: "profesional"; codigo: string }
  | { tipo: "reservar"; codigo: string }
  | { tipo: "confirmada"; contrato: Contrato };

const PESTANAS: ItemNavegacion<PestanaCliente>[] = [
  { id: "inicio", etiqueta: "Inicio", icono: Home },
  { id: "buscar", etiqueta: "Buscar", icono: Search },
  { id: "reservas", etiqueta: "Reservas", icono: CalendarDays },
  { id: "perfil", etiqueta: "Perfil", icono: User },
];

export function ClienteApp({ usuario, onCerrarSesion }: { usuario: Usuario; onCerrarSesion: () => void }) {
  const { data } = useAppStore();
  const [pestana, setPestana] = useState<PestanaCliente>("inicio");
  const [detalle, setDetalle] = useState<Detalle | null>(null);
  const [busqueda, setBusqueda] = useState<BusquedaInicial>({ id: 0, texto: "", categoria: "todas" });

  const irA = (siguiente: Detalle | null) => {
    setDetalle(siguiente);
    window.scrollTo({ top: 0 });
  };

  const cambiarPestana = (siguiente: PestanaCliente) => {
    setPestana(siguiente);
    irA(null);
  };

  const buscar = (texto: string, categoria: CategoriaServicio | "todas" = "todas") => {
    setBusqueda((actual) => ({ id: actual.id + 1, texto, categoria }));
    cambiarPestana("buscar");
  };

  const abrirProfesional = (codigo: string) => irA({ tipo: "profesional", codigo });

  const reservasActivas = contratosVisiblesPara(data.contratos, usuario).filter((c) => ESTADOS_ACTIVOS.includes(c.estado)).length;
  const items = PESTANAS.map((item) =>
    item.id === "reservas" ? { ...item, insignia: reservasActivas, descripcionInsignia: "reservas activas" } : item,
  );

  let contenido: ReactNode;
  if (detalle?.tipo === "profesional") {
    contenido = (
      <ProfesionalScreen
        codigo={detalle.codigo}
        onVolver={() => irA(null)}
        onReservar={(codigo) => irA({ tipo: "reservar", codigo })}
        onAbrirServicio={abrirProfesional}
      />
    );
  } else if (detalle?.tipo === "reservar") {
    contenido = (
      <ReservarScreen
        codigo={detalle.codigo}
        onVolver={() => irA({ tipo: "profesional", codigo: detalle.codigo })}
        onConfirmada={(contrato) => irA({ tipo: "confirmada", contrato })}
      />
    );
  } else if (detalle?.tipo === "confirmada") {
    contenido = (
      <ReservaConfirmadaScreen contrato={detalle.contrato} onVerReservas={() => cambiarPestana("reservas")} onInicio={() => cambiarPestana("inicio")} />
    );
  } else {
    contenido = (
      <>
        {pestana === "inicio" && (
          <InicioScreen
            usuario={usuario}
            onBuscar={buscar}
            onAbrirServicio={abrirProfesional}
            onVerReservas={() => cambiarPestana("reservas")}
            onPerfil={() => cambiarPestana("perfil")}
          />
        )}
        {pestana === "buscar" && <BuscarScreen key={busqueda.id} usuario={usuario} inicial={busqueda} onAbrirServicio={abrirProfesional} />}
        {pestana === "reservas" && <ReservasScreen usuario={usuario} onExplorar={() => cambiarPestana("buscar")} onAbrirServicio={abrirProfesional} />}
        {pestana === "perfil" && <PerfilScreen usuario={usuario} onCerrarSesion={onCerrarSesion} onVerReservas={() => cambiarPestana("reservas")} />}
        <BottomNav<PestanaCliente> className="lg:hidden" activa={pestana} onCambiar={cambiarPestana} items={items} />
      </>
    );
  }

  return (
    <UbicacionProvider usuario={usuario}>
      <BarraEscritorio
        usuario={usuario}
        items={items.filter((item) => item.id !== "perfil")}
        // Las pantallas de detalle salen de "Buscar" o "Inicio": ninguna pestaña queda marcada.
        activa={detalle ? null : pestana}
        onCambiar={cambiarPestana}
      />
      {contenido}
    </UbicacionProvider>
  );
}

/** Barra superior de la app del cliente en escritorio (en móvil se usa la barra inferior). */
function BarraEscritorio({
  usuario,
  items,
  activa,
  onCambiar,
}: {
  usuario: Usuario;
  items: ItemNavegacion<PestanaCliente>[];
  activa: PestanaCliente | null;
  onCambiar: (pestana: PestanaCliente) => void;
}) {
  return (
    <header className="sticky top-0 z-40 hidden border-b border-border bg-card/90 backdrop-blur-md lg:block">
      <div className="mx-auto flex h-16 max-w-[1180px] items-center gap-8 px-8">
        <button type="button" onClick={() => onCambiar("inicio")} aria-label="Ir al inicio" className="touch-feedback shrink-0">
          <Logo prioridad />
        </button>
        <nav aria-label="Principal" className="flex items-center gap-1">
          {items.map(({ id, etiqueta, icono: Icono, insignia }) => {
            const seleccionada = id === activa;
            return (
              <button
                key={id}
                type="button"
                onClick={() => onCambiar(id)}
                aria-current={seleccionada ? "page" : undefined}
                className={cx(
                  "relative flex items-center gap-2 rounded-xl px-3.5 py-2 text-sm font-medium transition-colors duration-200",
                  seleccionada ? "bg-primary-soft text-enfasis" : "text-muted-foreground hover:bg-muted hover:text-foreground",
                )}
              >
                <Icono className="h-4 w-4" aria-hidden />
                {etiqueta}
                {insignia !== undefined && insignia > 0 && (
                  <span className="rounded-full bg-accent px-1.5 text-[11px] font-bold text-accent-foreground">
                    {insignia}
                    <span className="sr-only"> reservas activas</span>
                  </span>
                )}
              </button>
            );
          })}
        </nav>
        <div className="ml-auto flex items-center gap-3">
          <BotonUbicacion className="bg-muted py-1 pl-1 pr-3" />
          <button
            type="button"
            onClick={() => onCambiar("perfil")}
            aria-current={activa === "perfil" ? "page" : undefined}
            className={cx(
              "touch-feedback flex items-center gap-2.5 rounded-full py-1 pl-3 pr-1 transition-colors hover:bg-muted",
              activa === "perfil" && "bg-primary-soft",
            )}
          >
            <span className="text-sm font-medium">{usuario.nombre.split(" ")[0]}</span>
            <Avatar texto={iniciales(usuario.nombre)} className="bg-primary text-primary-foreground" />
          </button>
        </div>
      </div>
    </header>
  );
}
