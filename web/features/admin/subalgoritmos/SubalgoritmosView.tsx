"use client";

import { useState } from "react";
import { PageHeader, Tabs } from "@/components/ui";
import { FuncionesTab } from "./FuncionesTab";
import { InventarioTab } from "./InventarioTab";
import { ArgumentosTab, LambdasTab, ProcedimientosTab } from "./OtrosTabs";

const PESTANAS = [
  { id: "funciones", etiqueta: "Funciones", componente: FuncionesTab },
  { id: "procedimientos", etiqueta: "Procedimientos", componente: ProcedimientosTab },
  { id: "lambdas", etiqueta: "Lambdas", componente: LambdasTab },
  { id: "argumentos", etiqueta: "Paso de argumentos", componente: ArgumentosTab },
  { id: "inventario", etiqueta: "Inventario", componente: InventarioTab },
] as const;

type PestanaId = (typeof PESTANAS)[number]["id"];

export function SubalgoritmosView() {
  const [activa, setActiva] = useState<PestanaId>("funciones");
  const Contenido = PESTANAS.find((p) => p.id === activa)!.componente;

  return (
    <>
      <PageHeader
        titulo="Subalgoritmos"
        descripcion="Guía 10: funciones con retorno, procedimientos, lambdas, paso de argumentos y modularización aplicados a YPRI."
      />
      <Tabs etiqueta="Temas" opciones={PESTANAS} activa={activa} onCambiar={setActiva} />
      <div key={activa} className="mt-6 animate-fade-in">
        <Contenido />
      </div>
    </>
  );
}
