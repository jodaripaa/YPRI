"use client";

import { useState, type FormEvent } from "react";
import { Button, Card, Field, FormError, Input } from "@/components/ui";
import { ROL_LABEL } from "@/lib/constants";
import { CUENTAS_DEMO } from "@/lib/seed";
import { useSesion } from "@/store/hooks";
import { AuthLayout } from "./AuthLayout";

export function LoginView({ onIrARegistro }: { onIrARegistro: () => void }) {
  const { iniciarSesion } = useSesion();
  const [correo, setCorreo] = useState("");
  const [contrasena, setContrasena] = useState("");
  const [error, setError] = useState<string | null>(null);

  const enviar = (evento: FormEvent) => {
    evento.preventDefault();
    const resultado = iniciarSesion(correo, contrasena);
    setError(resultado.ok ? null : resultado.error);
  };

  const entrarConCuentaDemo = (cuenta: (typeof CUENTAS_DEMO)[number]) => {
    const resultado = iniciarSesion(cuenta.correo, cuenta.contrasena);
    setError(resultado.ok ? null : resultado.error);
  };

  return (
    <AuthLayout titulo="Ingresa a tu cuenta" descripcion="Profesionales de confianza para tu hogar o negocio, a domicilio.">
      <Card className="p-6">
        <form onSubmit={enviar} className="space-y-4" noValidate>
          <Field etiqueta="Correo electrónico">
            {(props) => (
              <Input {...props} type="email" autoComplete="email" value={correo} onChange={(e) => setCorreo(e.target.value)} required />
            )}
          </Field>
          <Field etiqueta="Contraseña">
            {(props) => (
              <Input
                {...props}
                type="password"
                autoComplete="current-password"
                value={contrasena}
                onChange={(e) => setContrasena(e.target.value)}
                required
              />
            )}
          </Field>
          <FormError mensaje={error} />
          <Button type="submit" bloque>
            Ingresar
          </Button>
        </form>
        <p className="mt-5 text-center text-sm text-slate-500">
          ¿No tienes cuenta?{" "}
          <button type="button" onClick={onIrARegistro} className="font-medium text-blue-600 hover:text-blue-700">
            Regístrate
          </button>
        </p>
      </Card>

      <div className="mt-6">
        <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Cuentas de demostración</p>
        <ul className="mt-2 divide-y divide-slate-200 rounded-xl border border-slate-200 bg-white">
          {CUENTAS_DEMO.map((cuenta) => (
            <li key={cuenta.correo} className="flex items-center justify-between gap-3 px-4 py-3">
              <div className="min-w-0">
                <p className="text-sm font-medium text-slate-900">{ROL_LABEL[cuenta.rol]}</p>
                <p className="truncate text-xs text-slate-500">{cuenta.correo}</p>
              </div>
              <Button variante="secondary" tamano="sm" onClick={() => entrarConCuentaDemo(cuenta)}>
                Entrar
              </Button>
            </li>
          ))}
        </ul>
      </div>
    </AuthLayout>
  );
}
