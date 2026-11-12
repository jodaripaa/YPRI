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
  const celdaBase = "whitespace-nowrap border-b border-slate-100 px-4 py-2.5 text-right tabular-nums";

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="bg-slate-50 text-xs font-medium uppercase tracking-wide text-slate-500">
            <th scope="col" className="border-b border-slate-200 px-4 py-2.5 text-left">
              {etiquetaFila}
            </th>
            {columnas.map((columna) => (
              <th key={columna} scope="col" className="border-b border-slate-200 px-4 py-2.5 text-right">
                {columna}
              </th>
            ))}
            <th scope="col" className="border-b border-slate-200 px-4 py-2.5 text-right text-slate-700">
              Total
            </th>
          </tr>
        </thead>
        <tbody>
          {matriz.map((fila, i) => (
            <tr key={filas[i]}>
              <th scope="row" className="whitespace-nowrap border-b border-slate-100 px-4 py-2.5 text-left font-medium text-slate-900">
                {filas[i]}
              </th>
              {fila.map((valor, j) => {
                const diagonal = resaltarDiagonal && i === j;
                const clases = cx(celdaBase, diagonal ? "bg-blue-50 font-medium text-blue-800" : "text-slate-700");
                return (
                  <td key={columnas[j]} className={clases}>
                    {editable ? (
                      <button
                        type="button"
                        onClick={() => onEditarCelda?.(i, j)}
                        className="rounded px-1 hover:bg-slate-100 hover:text-blue-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-600"
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
              <td className={cx(celdaBase, "font-semibold text-slate-900")}>{formatearMoneda(totalesFila[i])}</td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr className="bg-slate-50">
            <th scope="row" className="px-4 py-2.5 text-left font-semibold text-slate-900">
              {etiquetaTotalColumna}
            </th>
            {totalesColumna.map((total, j) => (
              <td key={columnas[j]} className="px-4 py-2.5 text-right font-semibold tabular-nums text-slate-900">
                {formatearMoneda(total)}
              </td>
            ))}
            <td className="px-4 py-2.5 text-right font-semibold tabular-nums text-blue-700">{formatearMoneda(totalGeneral)}</td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
}
