"use client";

import { useState, type FormEvent } from "react";
import { Briefcase, Home } from "lucide-react";
import { Button, Card, cx, Field, FormError, Input, Select, useToast } from "@/components/ui";
import { CIUDAD_LABEL, CIUDADES_COBERTURA, LONGITUD_MINIMA_CONTRASENA, type CiudadCobertura } from "@/lib/constants";
import type { DatosRegistro } from "@/lib/domain/auth";
import { useSesion } from "@/store/hooks";
import { AuthLayout } from "./AuthLayout";

const TIPOS_CUENTA = [
  { rol: "cliente", titulo: "Necesito un servicio", descripcion: "Busca y contrata profesionales", icono: Home },
  { rol: "prestador", titulo: "Ofrezco mis servicios", descripcion: "Publica y recibe solicitudes", icono: Briefcase },
] as const;

const FORMULARIO_VACIO: DatosRegistro = {
  nombre: "",
  correo: "",
  telefono: "",
  ciudad: "Cucuta",
  rol: "cliente",
  contrasena: "",
  confirmacion: "",
};

export function RegisterView({ onIrALogin }: { onIrALogin: () => void }) {
  const { registrarse } = useSesion();
  const toast = useToast();
  const [datos, setDatos] = useState<DatosRegistro>(FORMULARIO_VACIO);
  const [error, setError] = useState<string | null>(null);

  const actualizar = <K extends keyof DatosRegistro>(campo: K, valor: DatosRegistro[K]) =>
    setDatos((actual) => ({ ...actual, [campo]: valor }));

  const enviar = (evento: FormEvent) => {
    evento.preventDefault();
    const resultado = registrarse(datos);
    if (!resultado.ok) return setError(resultado.error);
    toast.exito(`Bienvenido, ${resultado.value.usuario.nombre}. Tu cuenta está lista.`);
  };

  return (
    <AuthLayout titulo="Crea tu cuenta" descripcion="Regístrate gratis en menos de un minuto.">
      <Card className="p-6">
        <form onSubmit={enviar} className="space-y-4" noValidate>
          <fieldset>
            <legend className="mb-1.5 text-sm font-medium text-slate-700">Tipo de cuenta</legend>
            <div className="grid grid-cols-2 gap-3">
              {TIPOS_CUENTA.map(({ rol, titulo, descripcion, icono: Icono }) => {
                const seleccionado = datos.rol === rol;
                return (
                  <label
                    key={rol}
                    className={cx(
                      "cursor-pointer rounded-lg border p-3 transition-colors",
                      seleccionado ? "border-blue-600 bg-blue-50" : "border-slate-300 hover:border-slate-400",
                    )}
                  >
                    <input type="radio" name="rol" value={rol} checked={seleccionado} onChange={() => actualizar("rol", rol)} className="sr-only" />
                    <Icono className={cx("h-5 w-5", seleccionado ? "text-blue-600" : "text-slate-500")} aria-hidden />
                    <span className="mt-2 block text-sm font-medium text-slate-900">{titulo}</span>
                    <span className="block text-xs text-slate-500">{descripcion}</span>
                  </label>
                );
              })}
            </div>
          </fieldset>

          <Field etiqueta="Nombre completo">
            {(props) => <Input {...props} autoComplete="name" value={datos.nombre} onChange={(e) => actualizar("nombre", e.target.value)} />}
          </Field>
          <Field etiqueta="Correo electrónico">
            {(props) => (
              <Input {...props} type="email" autoComplete="email" value={datos.correo} onChange={(e) => actualizar("correo", e.target.value)} />
            )}
          </Field>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field etiqueta="Celular">
              {(props) => (
                <Input
                  {...props}
                  type="tel"
                  inputMode="numeric"
                  autoComplete="tel"
                  placeholder="3001234567"
                  value={datos.telefono}
                  onChange={(e) => actualizar("telefono", e.target.value)}
                />
              )}
            </Field>
            <Field etiqueta="Ciudad">
              {(props) => (
                <Select {...props} value={datos.ciudad} onChange={(e) => actualizar("ciudad", e.target.value as CiudadCobertura)}>
                  {CIUDADES_COBERTURA.map((ciudad) => (
                    <option key={ciudad} value={ciudad}>
                      {CIUDAD_LABEL[ciudad]}
                    </option>
                  ))}
                </Select>
              )}
            </Field>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field etiqueta="Contraseña" ayuda={`Mínimo ${LONGITUD_MINIMA_CONTRASENA} caracteres`}>
              {(props) => (
                <Input
                  {...props}
                  type="password"
                  autoComplete="new-password"
                  value={datos.contrasena}
                  onChange={(e) => actualizar("contrasena", e.target.value)}
                />
              )}
            </Field>
            <Field etiqueta="Confirmar contraseña">
              {(props) => (
                <Input
                  {...props}
                  type="password"
                  autoComplete="new-password"
                  value={datos.confirmacion}
                  onChange={(e) => actualizar("confirmacion", e.target.value)}
                />
              )}
            </Field>
          </div>
          <FormError mensaje={error} />
          <Button type="submit" bloque>
            Crear cuenta
          </Button>
        </form>
        <p className="mt-5 text-center text-sm text-slate-500">
          ¿Ya tienes cuenta?{" "}
          <button type="button" onClick={onIrALogin} className="font-medium text-blue-600 hover:text-blue-700">
            Inicia sesión
          </button>
        </p>
      </Card>
    </AuthLayout>
  );
}
