"use client";

import { useState } from "react";
import { Button, Field, FormError, Modal, SelectorEstrellas, Textarea } from "@/components/ui";
import type { Contrato } from "@/lib/types";

const DESCRIPCION_NOTA = ["", "Muy malo", "Malo", "Aceptable", "Bueno", "Excelente"];

export function RateDialog({
  contrato,
  onCerrar,
  onEnviar,
}: {
  contrato: Contrato;
  onCerrar: () => void;
  onEnviar: (puntuacion: number, comentario: string) => string | null;
}) {
  const [puntuacion, setPuntuacion] = useState(5);
  const [comentario, setComentario] = useState("");
  const [error, setError] = useState<string | null>(null);

  return (
    <Modal
      abierto
      ancho="sm"
      titulo="Califica el servicio"
      descripcion={`${contrato.servicio_nombre} con ${contrato.prestador_nombre}`}
      onCerrar={onCerrar}
      pie={
        <>
          <Button variante="secondary" onClick={onCerrar}>
            Ahora no
          </Button>
          <Button onClick={() => setError(onEnviar(puntuacion, comentario))}>Enviar</Button>
        </>
      }
    >
      <div className="space-y-4">
        <div className="flex flex-col items-center gap-1">
          <SelectorEstrellas valor={puntuacion} onCambiar={setPuntuacion} />
          <p className="text-sm font-medium text-foreground/80">{DESCRIPCION_NOTA[puntuacion]}</p>
        </div>
        <Field etiqueta="Comentario" ayuda="Opcional. Ayuda a otros clientes a elegir.">
          {(props) => <Textarea {...props} rows={3} value={comentario} onChange={(e) => setComentario(e.target.value)} />}
        </Field>
        <FormError mensaje={error} />
      </div>
    </Modal>
  );
}

export function ConfirmDialog({
  titulo,
  mensaje,
  etiquetaConfirmar,
  onCerrar,
  onConfirmar,
}: {
  titulo: string;
  mensaje: string;
  etiquetaConfirmar: string;
  onCerrar: () => void;
  onConfirmar: () => void;
}) {
  return (
    <Modal
      abierto
      ancho="sm"
      titulo={titulo}
      onCerrar={onCerrar}
      pie={
        <>
          <Button variante="secondary" onClick={onCerrar}>
            Volver
          </Button>
          <Button variante="danger" onClick={onConfirmar}>
            {etiquetaConfirmar}
          </Button>
        </>
      }
    >
      <p className="text-sm text-foreground/70">{mensaje}</p>
    </Modal>
  );
}
