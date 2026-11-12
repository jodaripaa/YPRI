import { cx } from "@/components/ui";
import { analizarMatriz } from "@/lib/matrices";
import { formatearMoneda } from "@/lib/format";

interface Props {
  matriz: readonly number[][];
  filas: readonly string[];
  columnas: readonly string[];
  etiquetaFila: string;
  etiquetaTotalColumna: string;
  resaltarDiagonal?: boolean;
  onEditarCelda?: (fila: number, columna: number) => void;
}

/** Tabla genérica para matrices con totales por fila, columna y general. */
export function MatrixTable({ matriz, filas, columnas, etiquetaFila, etiquetaTotalColumna, resaltarDiagonal, onEditarCelda }: Props) {
  const { totalesFila, totalesColumna, totalGeneral } = analizarMatriz(matriz);
  const editable = Boolean(onEditarCelda);
  const celdaBase = "whitespace-nowrap border-b border-border/70 px-4 py-2.5 text-right tabular-nums";

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="bg-muted/50 text-xs font-medium uppercase tracking-wide text-muted-foreground">
            <th scope="col" className="border-b border-border px-4 py-2.5 text-left">
              {etiquetaFila}
            </th>
            {columnas.map((columna) => (
              <th key={columna} scope="col" className="border-b border-border px-4 py-2.5 text-right">
                {columna}
              </th>
            ))}
            <th scope="col" className="border-b border-border px-4 py-2.5 text-right text-foreground/80">
              Total
            </th>
          </tr>
        </thead>
        <tbody>
          {matriz.map((fila, i) => (
            <tr key={filas[i]} className="transition-colors hover:bg-muted/40">
              <th scope="row" className="whitespace-nowrap border-b border-border/70 px-4 py-2.5 text-left font-medium text-foreground">
                {filas[i]}
              </th>
              {fila.map((valor, j) => {
                const diagonal = resaltarDiagonal && i === j;
                const clases = cx(celdaBase, diagonal ? "bg-primary-soft font-medium text-enfasis" : "text-foreground/80");
                return (
                  <td key={columnas[j]} className={clases}>
                    {editable ? (
                      <button
                        type="button"
                        onClick={() => onEditarCelda?.(i, j)}
                        className="rounded-md px-1.5 py-0.5 hover:bg-accent/15 hover:text-enfasis focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent"
                        aria-label={`Editar ${filas[i]}, ${columnas[j]}: ${formatearMoneda(valor)}`}
                      >
                        {formatearMoneda(valor)}
                      </button>
                    ) : (
                      formatearMoneda(valor)
                    )}
                  </td>
                );
              })}
              <td className={cx(celdaBase, "font-semibold text-foreground")}>{formatearMoneda(totalesFila[i])}</td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr className="bg-muted/50">
            <th scope="row" className="px-4 py-2.5 text-left font-semibold text-foreground">
              {etiquetaTotalColumna}
            </th>
            {totalesColumna.map((total, j) => (
              <td key={columnas[j]} className="px-4 py-2.5 text-right font-semibold tabular-nums text-foreground">
                {formatearMoneda(total)}
              </td>
            ))}
            <td className="px-4 py-2.5 text-right font-semibold tabular-nums text-enfasis">{formatearMoneda(totalGeneral)}</td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
}
