// Gráficas ligeras de YPRI, hechas con HTML y CSS (sin librerías externas).
// Siguen las reglas de la guía de visualización: barras de un solo tono para
// magnitudes, marcas delgadas con extremo redondeado de 4px y base recta,
// etiquetas selectivas, información al pasar el cursor o enfocar cada marca,
// y una vista de tabla para que ningún dato dependa solo del color.

import type { ReactNode } from "react";
import { cx } from "./cx";

export interface Dato {
  etiqueta: string;
  valor: number;
}

type Formato = (valor: number) => string;

/** Cuántos milisegundos espera cada marca para crecer (entrada escalonada). */
const retraso = (i: number) => ({ animationDelay: `${Math.min(i * 60, 480)}ms` });

/* ---------------------------------------------------------------- Ayudas */

/** Redondea hacia arriba a un número "limpio" para el eje (1, 1,5, 2, 2,5, 3, 4, 5, 6 u 8 por potencia de 10). */
export function techoLimpio(valor: number): number {
  if (valor <= 0) return 1;
  const potencia = 10 ** Math.floor(Math.log10(valor));
  const paso = [1, 1.5, 2, 2.5, 3, 4, 5, 6, 8, 10].find((p) => p * potencia >= valor) ?? 10;
  return paso * potencia;
}

function Tooltip({ valor, etiqueta, className }: { valor: string; etiqueta: string; className?: string }) {
  return (
    <span
      role="presentation"
      className={cx(
        "pointer-events-none absolute z-20 whitespace-nowrap rounded-lg border border-border bg-card px-2.5 py-1.5 text-left shadow-elevada",
        // Sin "display" hasta que se use: oculto con opacidad seguiría ensanchando la página.
        "hidden animate-fade-in group-hover:block group-focus-visible:block",
        className,
      )}
    >
      <span className="block text-sm font-semibold tabular-nums text-foreground">{valor}</span>
      <span className="block text-xs text-muted-foreground">{etiqueta}</span>
    </span>
  );
}

/** Vista de tabla plegable: el mismo dato sin depender de la gráfica. */
export function TablaDatos({ titulo, datos, formato, columnaValor = "Valor" }: { titulo: string; datos: readonly Dato[]; formato: Formato; columnaValor?: string }) {
  return (
    <details className="group/tabla mt-4 text-sm">
      <summary className="inline-flex cursor-pointer select-none items-center gap-1 rounded-lg px-1 text-xs font-medium text-muted-foreground hover:text-foreground">
        <span className="group-open/tabla:hidden">Ver como tabla</span>
        <span className="hidden group-open/tabla:inline">Ocultar tabla</span>
      </summary>
      <table className="mt-2 w-full text-left">
        <caption className="sr-only">{titulo}</caption>
        <thead>
          <tr className="text-xs text-muted-foreground">
            <th scope="col" className="py-1.5 font-medium">
              Categoría
            </th>
            <th scope="col" className="py-1.5 text-right font-medium">
              {columnaValor}
            </th>
          </tr>
        </thead>
        <tbody>
          {datos.map((d) => (
            <tr key={d.etiqueta} className="border-t border-border/70">
              <td className="py-1.5">{d.etiqueta}</td>
              <td className="py-1.5 text-right tabular-nums">{formato(d.valor)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </details>
  );
}

/* ------------------------------------------------------ Barras horizontales */

/**
 * Compara magnitudes entre categorías. Un solo tono; el valor va en la punta
 * de cada barra. `destacar` resalta la mayor con el acento (énfasis).
 */
export function BarrasHorizontales({
  titulo,
  datos,
  formato,
  ordenar = true,
  destacarMayor,
}: {
  titulo: string;
  datos: readonly Dato[];
  formato: Formato;
  ordenar?: boolean;
  destacarMayor?: boolean;
}) {
  const filas = ordenar ? [...datos].sort((a, b) => b.valor - a.valor) : datos;
  const maximo = Math.max(...filas.map((d) => d.valor), 0) || 1;
  const mayor = filas.reduce((m, d) => (d.valor > m.valor ? d : m), filas[0]);

  return (
    <figure>
      <figcaption className="sr-only">{titulo}</figcaption>
      <ul className="space-y-3">
        {filas.map((dato, i) => {
          const proporcion = dato.valor / maximo;
          const enfatizada = destacarMayor && dato === mayor;
          return (
            <li key={dato.etiqueta}>
              <p className="mb-1 truncate text-xs text-muted-foreground">{dato.etiqueta}</p>
              <div
                tabIndex={0}
                aria-label={`${dato.etiqueta}: ${formato(dato.valor)}`}
                className="group relative flex items-center gap-2 rounded-md py-1 outline-none focus-visible:ring-2 focus-visible:ring-accent"
              >
                <div
                  className={cx(
                    "h-2.5 origin-left animate-crecer-x rounded-r-[4px] transition-opacity group-hover:opacity-80",
                    enfatizada ? "bg-accent" : "bg-grafica",
                    // Un valor en cero no dibuja barra; uno muy pequeño se mantiene visible.
                    dato.valor > 0 ? "min-w-[3px]" : "hidden",
                  )}
                  style={{ width: `calc((100% - 7rem) * ${proporcion})`, ...retraso(i) }}
                />
                <span className="whitespace-nowrap text-xs font-semibold tabular-nums text-foreground">{formato(dato.valor)}</span>
                <Tooltip valor={formato(dato.valor)} etiqueta={dato.etiqueta} className="-top-11 left-0" />
              </div>
            </li>
          );
        })}
      </ul>
      <TablaDatos titulo={titulo} datos={filas} formato={formato} />
    </figure>
  );
}

/* --------------------------------------------------------------- Columnas */

/**
 * Columnas verticales para una serie ordenada (por ejemplo, días). Un solo tono,
 * eje con tres marcas limpias y solo la columna mayor lleva su valor encima.
 */
export function Columnas({
  titulo,
  datos,
  formato,
  formatoEje,
  alto = 200,
}: {
  titulo: string;
  datos: readonly Dato[];
  formato: Formato;
  formatoEje: Formato;
  alto?: number;
}) {
  const techo = techoLimpio(Math.max(...datos.map((d) => d.valor), 0));
  const marcas = [techo, techo / 2, 0];
  const mayor = datos.reduce((m, d) => (d.valor > m.valor ? d : m), datos[0]);

  return (
    <figure>
      <figcaption className="sr-only">{titulo}</figcaption>
      <div className="flex gap-3">
        {/* Eje vertical */}
        <div className="relative w-14 shrink-0 text-right text-[11px] tabular-nums text-muted-foreground" style={{ height: alto }} aria-hidden>
          {marcas.map((m, i) => (
            <span key={m} className="absolute right-0 -translate-y-1/2" style={{ top: `${(i / (marcas.length - 1)) * 100}%` }}>
              {formatoEje(m)}
            </span>
          ))}
        </div>
        <div className="min-w-0 flex-1">
          <div className="relative" style={{ height: alto }}>
            {/* Líneas guía: finas, sólidas y discretas */}
            {marcas.map((m, i) => (
              <span
                key={m}
                aria-hidden
                className={cx("absolute inset-x-0 h-px", i === marcas.length - 1 ? "bg-border" : "bg-border/60")}
                style={{ top: `${(i / (marcas.length - 1)) * 100}%` }}
              />
            ))}
            <div className="absolute inset-0 flex items-end justify-around">
              {datos.map((dato, i) => {
                const altura = (dato.valor / techo) * 100;
                const esMayor = dato === mayor;
                return (
                  <div
                    key={dato.etiqueta}
                    tabIndex={0}
                    aria-label={`${dato.etiqueta}: ${formato(dato.valor)}`}
                    className="group relative flex h-full flex-1 items-end justify-center rounded-md outline-none focus-visible:ring-2 focus-visible:ring-accent"
                  >
                    {esMayor && (
                      <span
                        className="absolute whitespace-nowrap text-[11px] font-semibold tabular-nums text-foreground"
                        style={{ bottom: `calc(${altura}% + 6px)` }}
                      >
                        {formatoEje(dato.valor)}
                      </span>
                    )}
                    <div
                      className={cx(
                        "w-full max-w-[24px] origin-bottom animate-crecer-y rounded-t-[4px] transition-opacity group-hover:opacity-80",
                        esMayor ? "bg-accent" : "bg-grafica",
                      )}
                      style={{ height: `${altura}%`, ...retraso(i) }}
                    />
                    <Tooltip valor={formato(dato.valor)} etiqueta={dato.etiqueta} className="bottom-full left-1/2 mb-2 -translate-x-1/2" />
                  </div>
                );
              })}
            </div>
          </div>
          <div className="mt-2 flex justify-around text-[11px] text-muted-foreground" aria-hidden>
            {datos.map((d) => (
              <span key={d.etiqueta} className="flex-1 truncate text-center">
                {d.etiqueta}
              </span>
            ))}
          </div>
        </div>
      </div>
      <TablaDatos titulo={titulo} datos={datos} formato={formato} />
    </figure>
  );
}

/* -------------------------------------------------------- Barra segmentada */

const COLOR_SERIE = ["bg-serie-1", "bg-serie-2", "bg-serie-3"] as const;

/**
 * Un total dividido en hasta tres partes (barra segmentada alta). Cada parte
 * muestra su porcentaje dentro si cabe; la leyenda nombra las partes en orden.
 */
export function BarraSegmentada({
  titulo,
  partes,
  formato,
  pie,
}: {
  titulo: string;
  partes: readonly Dato[];
  formato: Formato;
  pie?: ReactNode;
}) {
  const total = partes.reduce((s, p) => s + p.valor, 0);
  const porcentaje = (valor: number) => (total ? Math.round((valor / total) * 100) : 0);
  const descripcion = partes.map((p) => `${p.etiqueta}: ${formato(p.valor)} (${porcentaje(p.valor)} %)`).join(", ");

  return (
    <figure>
      <figcaption className="sr-only">{titulo}</figcaption>
      <div role="img" aria-label={`${titulo}. ${descripcion}`} className="flex h-7 gap-0.5">
        {partes.map((parte, i) =>
          parte.valor > 0 ? (
            <div
              key={parte.etiqueta}
              className={cx("group relative flex origin-left animate-crecer-x items-center rounded-[4px] px-2 transition-opacity hover:opacity-90", COLOR_SERIE[i])}
              style={{ flexGrow: parte.valor, flexBasis: 0, ...retraso(i) }}
            >
              {porcentaje(parte.valor) >= 12 && <span className="text-xs font-semibold tabular-nums text-white">{porcentaje(parte.valor)} %</span>}
              <Tooltip valor={`${formato(parte.valor)} · ${porcentaje(parte.valor)} %`} etiqueta={parte.etiqueta} className={cx("bottom-full mb-2", i === 0 ? "left-0" : "right-0")} />
            </div>
          ) : null,
        )}
      </div>
      <ul className="mt-3 flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-muted-foreground">
        {partes.map((parte, i) => (
          <li key={parte.etiqueta} className="flex items-center gap-1.5">
            <span aria-hidden className={cx("h-2.5 w-2.5 rounded-[3px]", COLOR_SERIE[i])} />
            {parte.etiqueta}
          </li>
        ))}
      </ul>
      {pie}
      <TablaDatos titulo={titulo} datos={partes} formato={formato} columnaValor="Monto" />
    </figure>
  );
}
