import type { ButtonProps } from "@/components/ui";
import type { AccionContrato } from "@/lib/domain/contracts";

interface ConfiguracionAccion {
  etiqueta: string;
  variante: NonNullable<ButtonProps["variante"]>;
  /** Mensaje de confirmación; si existe, la acción se confirma antes de ejecutarse. */
  confirmacion?: string;
  exito: string;
}

export const CONFIGURACION_ACCIONES: Record<AccionContrato, ConfiguracionAccion> = {
  aceptar: { etiqueta: "Aceptar", variante: "accent", exito: "Aceptaste la solicitud. Ahora aparece en tus servicios en curso." },
  rechazar: {
    etiqueta: "Rechazar",
    variante: "danger",
    confirmacion: "El cliente verá la solicitud como cancelada. Esta acción no se puede deshacer.",
    exito: "Rechazaste la solicitud.",
  },
  completar: { etiqueta: "Marcar como completado", variante: "success", exito: "Servicio completado. Ya puedes verlo en tus ganancias." },
  cancelar: {
    etiqueta: "Cancelar",
    variante: "danger",
    confirmacion: "La solicitud quedará cancelada y no se podrá reactivar.",
    exito: "La solicitud fue cancelada.",
  },
  calificar: { etiqueta: "Calificar", variante: "accent", exito: "Gracias por tu calificación." },
};
