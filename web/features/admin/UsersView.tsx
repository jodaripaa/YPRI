"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { Avatar, Badge, Button, Card, Input, PageHeader, Select, Table, Td, Th, useToast } from "@/components/ui";
import { CIUDAD_LABEL, ROL_LABEL, ROLES_SISTEMA, type RolUsuario } from "@/lib/constants";
import { iniciales } from "@/lib/format";
import type { Usuario } from "@/lib/types";
import { useAppStore } from "@/store/AppStore";
import { useAdministracionUsuarios } from "@/store/hooks";

export function UsersView({ usuario: administrador }: { usuario: Usuario }) {
  const { data } = useAppStore();
  const { alternarEstado } = useAdministracionUsuarios();
  const toast = useToast();
  const [texto, setTexto] = useState("");
  const [rol, setRol] = useState<RolUsuario | "todos">("todos");

  const usuarios = useMemo(() => {
    const busqueda = texto.trim().toLowerCase();
    return data.usuarios.filter(
      (u) =>
        (rol === "todos" || u.rol === rol) &&
        (!busqueda || u.nombre.toLowerCase().includes(busqueda) || u.correo.toLowerCase().includes(busqueda)),
    );
  }, [data.usuarios, texto, rol]);

  const alternar = (usuario: Usuario) => {
    const resultado = alternarEstado(usuario.id);
    if (!resultado.ok) return toast.error(resultado.error);
    toast.exito(usuario.activo ? `${usuario.nombre} fue suspendido.` : `${usuario.nombre} fue reactivado.`);
  };

  return (
    <>
      <PageHeader titulo="Usuarios" descripcion="Clientes, profesionales y administradores registrados." />

      <div className="mb-4 flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/70" aria-hidden />
          <Input aria-label="Buscar usuarios" placeholder="Buscar por nombre o correo" className="pl-9" value={texto} onChange={(e) => setTexto(e.target.value)} />
        </div>
        <Select aria-label="Filtrar por rol" className="sm:w-48" value={rol} onChange={(e) => setRol(e.target.value as RolUsuario | "todos")}>
          <option value="todos">Todos los roles</option>
          {ROLES_SISTEMA.map((r) => (
            <option key={r} value={r}>
              {ROL_LABEL[r]}
            </option>
          ))}
        </Select>
      </div>

      <Card className="animate-fade-up overflow-hidden">
        <Table>
          <thead>
            <tr>
              <Th>Usuario</Th>
              <Th>Rol</Th>
              <Th>Ciudad</Th>
              <Th>Celular</Th>
              <Th>Estado</Th>
              <Th>
                <span className="sr-only">Acciones</span>
              </Th>
            </tr>
          </thead>
          <tbody>
            {usuarios.map((u) => {
              const gestionable = u.id !== administrador.id && u.rol !== "admin";
              return (
                <tr key={u.id}>
                  <Td>
                    <span className="flex items-center gap-3">
                      <Avatar texto={iniciales(u.nombre)} className={u.activo ? "" : "opacity-50"} />
                      <span>
                        <span className="block font-medium text-foreground">{u.nombre}</span>
                        <span className="text-xs text-muted-foreground">{u.correo}</span>
                      </span>
                    </span>
                  </Td>
                  <Td>{ROL_LABEL[u.rol]}</Td>
                  <Td>{CIUDAD_LABEL[u.ciudad]}</Td>
                  <Td className="tabular-nums">{u.telefono}</Td>
                  <Td>
                    <Badge tono={u.activo ? "green" : "red"} conPunto>
                      {u.activo ? "Activo" : "Suspendido"}
                    </Badge>
                  </Td>
                  <Td className="text-right">
                    {gestionable && (
                      <Button tamano="sm" variante={u.activo ? "danger" : "secondary"} onClick={() => alternar(u)}>
                        {u.activo ? "Suspender" : "Reactivar"}
                      </Button>
                    )}
                  </Td>
                </tr>
              );
            })}
          </tbody>
        </Table>
        {usuarios.length === 0 && <p className="px-5 py-8 text-center text-sm text-muted-foreground">No hay usuarios que coincidan con la búsqueda.</p>}
      </Card>
    </>
  );
}
