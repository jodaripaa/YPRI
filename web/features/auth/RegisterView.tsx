"use client";

import { useState, type FormEvent } from "react";
import { Briefcase, CheckCircle2, Home } from "lucide-react";
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
      <Card className="p-6 shadow-elevada lg:shadow-suave">
        <form onSubmit={enviar} className="space-y-4" noValidate>
          <fieldset>
            <legend className="mb-1.5 text-sm font-medium">Tipo de cuenta</legend>
            <div className="grid grid-cols-2 gap-3">
              {TIPOS_CUENTA.map(({ rol, titulo, descripcion, icono: Icono }) => {
                const seleccionado = datos.rol === rol;
                return (
                  <label
                    key={rol}
                    className={cx(
                      "touch-feedback relative cursor-pointer rounded-2xl border-2 p-3.5 transition-all duration-200 focus-within:ring-4 focus-within:ring-accent/20",
                      seleccionado ? "border-primary bg-primary-soft" : "border-border bg-card hover:border-muted-foreground/40",
                    )}
                  >
                    <input type="radio" name="rol" value={rol} checked={seleccionado} onChange={() => actualizar("rol", rol)} className="sr-only" />
                    <span className={cx("flex h-9 w-9 items-center justify-center rounded-xl transition-colors", seleccionado ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground")}>
                      <Icono className="h-[18px] w-[18px]" aria-hidden />
                    </span>
                    {seleccionado && <CheckCircle2 className="absolute right-3 top-3 h-5 w-5 animate-pop text-accent-strong" aria-hidden />}
                    <span className="mt-2.5 block text-sm font-semibold">{titulo}</span>
                    <span className="block text-xs text-muted-foreground">{descripcion}</span>
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
          <Button type="submit" bloque tamano="lg">
            Crear cuenta
          </Button>
        </form>
        <p className="mt-5 text-center text-sm text-muted-foreground">
          ¿Ya tienes cuenta?{" "}
          <button type="button" onClick={onIrALogin} className="font-semibold text-accent-strong hover:underline">
            Inicia sesión
          </button>
        </p>
      </Card>
    </AuthLayout>
  );
}
