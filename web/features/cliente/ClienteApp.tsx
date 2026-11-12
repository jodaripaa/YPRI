"use client";

// App móvil del cliente (diseño del prototipo de v0). Usa el mismo almacén y las
// mismas reglas de dominio que el resto de YPRI: solo cambia la presentación.

import { useState } from "react";
import type { CategoriaServicio } from "@/lib/constants";
import { ESTADOS_ACTIVOS, contratosVisiblesPara } from "@/lib/domain/contracts";
import type { Contrato, Usuario } from "@/lib/types";
import { useAppStore } from "@/store/AppStore";
import { NavegacionInferior, type PestanaCliente } from "./componentes";
import { BuscarScreen, type BusquedaInicial } from "./pantallas/BuscarScreen";
import { InicioScreen } from "./pantallas/InicioScreen";
import { PerfilScreen } from "./pantallas/PerfilScreen";
import { ProfesionalScreen } from "./pantallas/ProfesionalScreen";
import { ReservaConfirmadaScreen, ReservarScreen } from "./pantallas/ReservarScreen";
import { ReservasScreen } from "./pantallas/ReservasScreen";

/** Pantallas que se abren encima de las pestañas (sin barra inferior). */
type Detalle =
  | { tipo: "profesional"; codigo: string }
  | { tipo: "reservar"; codigo: string }
  | { tipo: "confirmada"; contrato: Contrato };

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

  if (detalle?.tipo === "profesional") {
    return (
      <ProfesionalScreen
        codigo={detalle.codigo}
        onVolver={() => irA(null)}
        onReservar={(codigo) => irA({ tipo: "reservar", codigo })}
        onAbrirServicio={abrirProfesional}
      />
    );
  }

  if (detalle?.tipo === "reservar") {
    return (
      <ReservarScreen
        codigo={detalle.codigo}
        onVolver={() => irA({ tipo: "profesional", codigo: detalle.codigo })}
        onConfirmada={(contrato) => irA({ tipo: "confirmada", contrato })}
      />
    );
  }

  if (detalle?.tipo === "confirmada") {
    return (
      <ReservaConfirmadaScreen
        contrato={detalle.contrato}
        onVerReservas={() => cambiarPestana("reservas")}
        onInicio={() => cambiarPestana("inicio")}
      />
    );
  }

  const reservasActivas = contratosVisiblesPara(data.contratos, usuario).filter((c) => ESTADOS_ACTIVOS.includes(c.estado)).length;

  return (
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
      <NavegacionInferior activa={pestana} onCambiar={cambiarPestana} reservasActivas={reservasActivas} />
    </>
  );
}
