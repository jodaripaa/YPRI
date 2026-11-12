"use client";

import { useState, type FormEvent } from "react";
import { ArrowRight, Briefcase, ShieldCheck, User, type LucideIcon } from "lucide-react";
import { Button, Card, escalonado, Field, FormError, Input } from "@/components/ui";
import { ROL_LABEL, type RolUsuario } from "@/lib/constants";
import { CUENTAS_DEMO } from "@/lib/seed";
import { useSesion } from "@/store/hooks";
import { AuthLayout } from "./AuthLayout";

const ICONO_ROL: Record<RolUsuario, LucideIcon> = { cliente: User, prestador: Briefcase, admin: ShieldCheck };

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
      <Card className="p-6 shadow-elevada lg:shadow-suave">
        <form onSubmit={enviar} className="space-y-4" noValidate>
          <Field etiqueta="Correo electrónico">
            {(props) => (
              <Input {...props} type="email" autoComplete="email" placeholder="tu@correo.com" value={correo} onChange={(e) => setCorreo(e.target.value)} required />
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
          <Button type="submit" bloque tamano="lg">
            Ingresar
          </Button>
        </form>
        <p className="mt-5 text-center text-sm text-muted-foreground">
          ¿No tienes cuenta?{" "}
          <button type="button" onClick={onIrARegistro} className="font-semibold text-accent-strong hover:underline">
            Regístrate
          </button>
        </p>
      </Card>

      <section className="mt-8">
        <h2 className="px-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Cuentas de demostración</h2>
        <ul className="mt-3 space-y-2">
          {CUENTAS_DEMO.map((cuenta, i) => {
            const Icono = ICONO_ROL[cuenta.rol];
            return (
              <li key={cuenta.correo} className="animate-fade-up" style={escalonado(i + 3, 70)}>
                <div className="hover-elevar flex items-center gap-3 rounded-2xl border border-border bg-card p-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary-soft">
                    <Icono className="h-5 w-5 text-enfasis" aria-hidden />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold">{ROL_LABEL[cuenta.rol]}</p>
                    <p className="truncate text-xs text-muted-foreground">{cuenta.correo}</p>
                  </div>
                  <Button variante="secondary" tamano="sm" onClick={() => entrarConCuentaDemo(cuenta)} aria-label={`Entrar como ${ROL_LABEL[cuenta.rol]}`}>
                    Entrar
                    <ArrowRight className="h-3.5 w-3.5" aria-hidden />
                  </Button>
                </div>
              </li>
            );
          })}
        </ul>
      </section>
    </AuthLayout>
  );
}
