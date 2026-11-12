"use client";

import { useState } from "react";
import { Button, Field, FormError, Input, Modal, Select, Textarea, useToast } from "@/components/ui";
import {
  CATEGORIA_LABEL,
  CATEGORIAS_SERVICIO,
  CIUDAD_LABEL,
  CIUDADES_COBERTURA,
  LONGITUD_MINIMA_DESCRIPCION,
  TARIFA_MINIMA,
  type CategoriaServicio,
  type CiudadCobertura,
} from "@/lib/constants";
import { formatearMoneda } from "@/lib/format";
import { BARRIOS, RADIO_COBERTURA_KM, RADIOS_COBERTURA_KM } from "@/lib/zonas";
import type { Usuario } from "@/lib/types";
import { useServicios } from "@/store/hooks";

export function PublishServiceModal({ usuario, onCerrar }: { usuario: Usuario; onCerrar: () => void }) {
  const { publicar } = useServicios();
  const toast = useToast();
  const [categoria, setCategoria] = useState<CategoriaServicio>("Electricidad");
  const [ciudad, setCiudad] = useState<CiudadCobertura>(usuario.ciudad);
  const [zona, setZona] = useState(BARRIOS[usuario.ciudad][0].nombre);
  const [radio, setRadio] = useState<number>(RADIO_COBERTURA_KM);
  const [tarifa, setTarifa] = useState("35000");
  const [experiencia, setExperiencia] = useState("1");
  const [descripcion, setDescripcion] = useState("");
  const [error, setError] = useState<string | null>(null);

  const guardar = () => {
    const resultado = publicar({
      zona,
      radioKm: radio,
      categoria,
      ciudad,
      tarifaHora: Number(tarifa),
      aniosExperiencia: Number(experiencia),
      descripcion,
    });
    if (!resultado.ok) return setError(resultado.error);
    toast.exito(`Tu servicio de ${CATEGORIA_LABEL[categoria].toLowerCase()} ya está visible para los clientes.`);
    onCerrar();
  };

  return (
    <Modal
      abierto
      titulo="Publicar servicio"
      descripcion="Los clientes de la ciudad seleccionada podrán solicitarlo de inmediato."
      onCerrar={onCerrar}
      pie={
        <>
          <Button variante="secondary" onClick={onCerrar}>
            Cancelar
          </Button>
          <Button onClick={guardar}>Publicar</Button>
        </>
      }
    >
      <div className="space-y-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field etiqueta="Categoría">
            {(props) => (
              <Select {...props} value={categoria} onChange={(e) => setCategoria(e.target.value as CategoriaServicio)}>
                {CATEGORIAS_SERVICIO.map((c) => (
                  <option key={c} value={c}>
                    {CATEGORIA_LABEL[c]}
                  </option>
                ))}
              </Select>
            )}
          </Field>
          <Field etiqueta="Ciudad">
            {(props) => (
              <Select {...props} value={ciudad} onChange={(e) => {
                  const nueva = e.target.value as CiudadCobertura;
                  setCiudad(nueva);
                  setZona(BARRIOS[nueva][0].nombre);
                }}
              >
                {CIUDADES_COBERTURA.map((c) => (
                  <option key={c} value={c}>
                    {CIUDAD_LABEL[c]}
                  </option>
                ))}
              </Select>
            )}
          </Field>
          <Field etiqueta="Barrio desde donde sales" ayuda="Se usa para calcular la distancia a cada cliente.">
            {(props) => (
              <Select {...props} value={zona} onChange={(e) => setZona(e.target.value)}>
                {BARRIOS[ciudad].map((b) => (
                  <option key={b.nombre} value={b.nombre}>
                    {b.nombre}
                  </option>
                ))}
              </Select>
            )}
          </Field>
          <Field etiqueta="Radio de atención" ayuda="Hasta qué distancia aceptas trabajos.">
            {(props) => (
              <Select {...props} value={radio} onChange={(e) => setRadio(Number(e.target.value))}>
                {RADIOS_COBERTURA_KM.map((km) => (
                  <option key={km} value={km}>
                    {km} km a la redonda
                  </option>
                ))}
              </Select>
            )}
          </Field>
          <Field etiqueta="Tarifa por hora" ayuda={`Mínimo ${formatearMoneda(TARIFA_MINIMA)}, sin IVA`}>
            {(props) => (
              <Input {...props} type="number" inputMode="numeric" min={TARIFA_MINIMA} step={1000} value={tarifa} onChange={(e) => setTarifa(e.target.value)} />
            )}
          </Field>
          <Field etiqueta="Años de experiencia">
            {(props) => (
              <Input {...props} type="number" inputMode="numeric" min={0} max={60} value={experiencia} onChange={(e) => setExperiencia(e.target.value)} />
            )}
          </Field>
        </div>
        <Field etiqueta="Descripción" ayuda={`Qué incluye el servicio. Mínimo ${LONGITUD_MINIMA_DESCRIPCION} caracteres.`}>
          {(props) => <Textarea {...props} rows={3} value={descripcion} onChange={(e) => setDescripcion(e.target.value)} />}
        </Field>
        <FormError mensaje={error} />
      </div>
    </Modal>
  );
}
