"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import {
  BarChart3,
  Briefcase,
  ChevronDown,
  ClipboardList,
  Code2,
  FileText,
  Inbox,
  LayoutDashboard,
  LogOut,
  Search,
  Users,
  Wallet,
  type LucideIcon,
} from "lucide-react";
import { Avatar, cx } from "@/components/ui";
import { CIUDAD_LABEL, ROL_LABEL } from "@/lib/constants";
import type { DefinicionVista, VistaId } from "@/lib/domain/navigation";
import { iniciales } from "@/lib/format";
import type { Usuario } from "@/lib/types";
import { Logo } from "./Logo";

const ICONOS: Record<VistaId, LucideIcon> = {
  explorar: Search,
  "mis-solicitudes": ClipboardList,
  solicitudes: Inbox,
  "mis-servicios": Briefcase,
  ganancias: Wallet,
  resumen: LayoutDashboard,
  facturacion: BarChart3,
  contratos: FileText,
  usuarios: Users,
  subalgoritmos: Code2,
};

interface AppShellProps {
  usuario: Usuario;
  vistas: readonly DefinicionVista[];
  vistaActiva: VistaId;
  onNavegar: (vista: VistaId) => void;
  onCerrarSesion: () => void;
  children: ReactNode;
}

export function AppShell({ usuario, vistas, vistaActiva, onNavegar, onCerrarSesion, children }: AppShellProps) {
  return (
    <div className="min-h-screen bg-slate-100">
      <header className="sticky top-0 z-30 bg-slate-900">
        <div className="mx-auto flex h-16 max-w-6xl items-center gap-6 px-4 sm:px-6">
          <Logo claro />
          <nav aria-label="Principal" className="hidden flex-1 items-center gap-1 md:flex">
            {vistas.map((vista) => (
              <EnlaceNavegacion key={vista.id} vista={vista} activa={vista.id === vistaActiva} onNavegar={onNavegar} />
            ))}
          </nav>
          <div className="ml-auto">
            <MenuUsuario usuario={usuario} onCerrarSesion={onCerrarSesion} />
          </div>
        </div>
        <nav aria-label="Principal móvil" className="flex gap-1 overflow-x-auto border-t border-slate-800 px-3 py-2 [scrollbar-width:none] md:hidden [&::-webkit-scrollbar]:hidden">
          {vistas.map((vista) => (
            <EnlaceNavegacion key={vista.id} vista={vista} activa={vista.id === vistaActiva} onNavegar={onNavegar} />
          ))}
        </nav>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8">{children}</main>
    </div>
  );
}

function EnlaceNavegacion({
  vista,
  activa,
  onNavegar,
}: {
  vista: DefinicionVista;
  activa: boolean;
  onNavegar: (vista: VistaId) => void;
}) {
  const Icono = ICONOS[vista.id];
  return (
    <button
      type="button"
      onClick={() => onNavegar(vista.id)}
      aria-current={activa ? "page" : undefined}
      className={cx(
        "flex shrink-0 items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors",
        activa ? "bg-slate-800 text-white" : "text-slate-300 hover:bg-slate-800/60 hover:text-white",
      )}
    >
      <Icono className={cx("h-4 w-4", activa ? "text-blue-400" : "text-slate-400")} aria-hidden />
      {vista.etiqueta}
    </button>
  );
}

function MenuUsuario({ usuario, onCerrarSesion }: { usuario: Usuario; onCerrarSesion: () => void }) {
  const [abierto, setAbierto] = useState(false);
  const contenedor = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!abierto) return;
    const alHacerClic = (evento: MouseEvent) => {
      if (!contenedor.current?.contains(evento.target as Node)) setAbierto(false);
    };
    const alPresionar = (evento: KeyboardEvent) => evento.key === "Escape" && setAbierto(false);
    document.addEventListener("mousedown", alHacerClic);
    document.addEventListener("keydown", alPresionar);
    return () => {
      document.removeEventListener("mousedown", alHacerClic);
      document.removeEventListener("keydown", alPresionar);
    };
  }, [abierto]);

  return (
    <div ref={contenedor} className="relative">
      <button
        type="button"
        onClick={() => setAbierto((valor) => !valor)}
        aria-expanded={abierto}
        aria-haspopup="menu"
        className="flex items-center gap-2.5 rounded-lg py-1 pl-1 pr-2 text-left hover:bg-slate-800"
      >
        <Avatar texto={iniciales(usuario.nombre)} className="h-8 w-8 bg-slate-700 text-xs text-white" />
        <span className="hidden sm:block">
          <span className="block text-sm font-medium leading-tight text-white">{usuario.nombre}</span>
          <span className="block text-xs text-slate-400">{ROL_LABEL[usuario.rol]}</span>
        </span>
        <ChevronDown className="h-4 w-4 text-slate-400" aria-hidden />
      </button>

      {abierto && (
        <div role="menu" className="absolute right-0 mt-2 w-64 rounded-lg border border-slate-200 bg-white py-1 shadow-lg">
          <div className="border-b border-slate-100 px-4 py-3">
            <p className="text-sm font-medium text-slate-900">{usuario.nombre}</p>
            <p className="truncate text-xs text-slate-500">{usuario.correo}</p>
            <p className="mt-1 text-xs text-slate-500">
              {ROL_LABEL[usuario.rol]} · {CIUDAD_LABEL[usuario.ciudad]}
            </p>
          </div>
          <button
            type="button"
            role="menuitem"
            onClick={onCerrarSesion}
            className="flex w-full items-center gap-2 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50"
          >
            <LogOut className="h-4 w-4 text-slate-400" aria-hidden />
            Cerrar sesión
          </button>
        </div>
      )}
    </div>
  );
}
