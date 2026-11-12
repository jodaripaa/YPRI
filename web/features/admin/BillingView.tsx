"use client";

import { useState } from "react";
import { Banknote, Calculator, CalendarDays, Hash, MapPin, RefreshCw, Trophy } from "lucide-react";
import { BarrasHorizontales, Button, Card, CardHeader, Columnas, escalonado, Field, FormError, Input, Modal, PageHeader, StatCard, Tabs, useToast } from "@/components/ui";
import { CATEGORIA_LABEL, CATEGORIAS_SERVICIO, CIUDAD_LABEL, CIUDADES_COBERTURA, DIA_LABEL, DIAS_SEMANA_MATRIZ } from "@/lib/constants";
import { formatearMoneda, formatearMonedaCompacta } from "@/lib/format";
import { analizarMatriz, crearMatrizIdentidad, crearMatrizNula } from "@/lib/matrices";
import type { TipoMatriz } from "@/lib/types";
import { useAppStore } from "@/store/AppStore";
import { useFacturacion } from "@/store/hooks";
import { MatrixTable } from "./MatrixTable";

type Pestana = "semanal" | "ciudades" | "simulacion" | "estructuras";

const PESTANAS = [
  { id: "semanal", etiqueta: "Ingresos semanales" },
  { id: "ciudades", etiqueta: "Demanda por ciudad" },
  { id: "simulacion", etiqueta: "Simulación" },
  { id: "estructuras", etiqueta: "Matrices especiales" },
] as const;

const CATEGORIAS = CATEGORIAS_SERVICIO.map((c) => CATEGORIA_LABEL[c]);
const DIAS = DIAS_SEMANA_MATRIZ.map((d) => DIA_LABEL[d]);
const CIUDADES = CIUDADES_COBERTURA.map((c) => CIUDAD_LABEL[c]);

interface CeldaEnEdicion {
  tipo: TipoMatriz;
  fila: number;
  columna: number;
}

export function BillingView() {
  const { data } = useAppStore();
  const { sincronizar } = useFacturacion();
  const toast = useToast();
  const [pestana, setPestana] = useState<Pestana>("semanal");
  const [celda, setCelda] = useState<CeldaEnEdicion | null>(null);

  const pendientes = data.contratos.filter((c) => c.estado === "Completado" && !data.contratosSincronizados.includes(c.id)).length;

  const alSincronizar = () => {
    const resultado = sincronizar();
    if (!resultado.ok) return toast.error(resultado.error);
    const { cantidad, suma } = resultado.value;
    toast.exito(cantidad ? `Se sumaron ${cantidad} contratos por ${formatearMoneda(suma)}.` : "No hay contratos nuevos para sumar.");
  };

  return (
    <>
      <PageHeader
        titulo="Facturación"
        descripcion="Ingresos por categoría, día y ciudad. Haz clic en un valor para corregirlo."
        acciones={
          <Button variante="secondary" icono={RefreshCw} onClick={alSincronizar} disabled={pendientes === 0}>
            {pendientes ? `Sumar ${pendientes} contratos completados` : "Contratos al día"}
          </Button>
        }
      />
      <Tabs etiqueta="Vistas de facturación" opciones={PESTANAS} activa={pestana} onCambiar={setPestana} />

      <div key={pestana} className="mt-6 animate-fade-in">
        {pestana === "semanal" && <MatrizSemanal onEditar={(fila, columna) => setCelda({ tipo: "semanal", fila, columna })} />}
        {pestana === "ciudades" && <MatrizCiudades onEditar={(fila, columna) => setCelda({ tipo: "ciudades", fila, columna })} />}
        {pestana === "simulacion" && <Simulacion />}
        {pestana === "estructuras" && <Estructuras />}
      </div>

      {celda && <EditarCeldaDialog celda={celda} onCerrar={() => setCelda(null)} />}
    </>
  );
}

function MatrizSemanal({ onEditar }: { onEditar: (fila: number, columna: number) => void }) {
  const { data } = useAppStore();
  const analisis = analizarMatriz(data.matrizSemanal);
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard icono={Banknote} style={escalonado(0)} destacado etiqueta="Total facturado" valor={formatearMoneda(analisis.totalGeneral)} detalle="Semana actual" />
        <StatCard icono={Calculator} style={escalonado(1)} etiqueta="Promedio por celda" valor={formatearMoneda(analisis.promedio)} detalle="Categoría por día" />
        <StatCard icono={Trophy} style={escalonado(2)} tono="accent" etiqueta="Categoría líder" valor={CATEGORIAS[analisis.filaLider]} detalle={formatearMoneda(analisis.totalesFila[analisis.filaLider])} />
        <StatCard icono={CalendarDays} style={escalonado(3)} etiqueta="Día con más ingresos" valor={DIAS[analisis.columnaLider]} detalle={formatearMoneda(analisis.totalesColumna[analisis.columnaLider])} />
      </div>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card className="animate-fade-up p-5" style={escalonado(4)}>
          <h3 className="text-base font-semibold">Ingresos por día</h3>
          <p className="mb-5 text-sm text-muted-foreground">Total de las cinco categorías. El día más alto aparece resaltado.</p>
          <Columnas
            titulo="Ingresos por día de la semana"
            datos={DIAS.map((dia, i) => ({ etiqueta: dia, valor: analisis.totalesColumna[i] }))}
            formato={formatearMoneda}
            formatoEje={formatearMonedaCompacta}
          />
        </Card>
        <Card className="animate-fade-up p-5" style={escalonado(5)}>
          <h3 className="text-base font-semibold">Ingresos por categoría</h3>
          <p className="mb-5 text-sm text-muted-foreground">Total de la semana, de mayor a menor.</p>
          <BarrasHorizontales
            titulo="Ingresos de la semana por categoría"
            datos={CATEGORIAS.map((categoria, i) => ({ etiqueta: categoria, valor: analisis.totalesFila[i] }))}
            formato={formatearMoneda}
            destacarMayor
          />
        </Card>
      </div>
      <Card className="animate-fade-up overflow-hidden" style={escalonado(6)}>
        <CardHeader titulo="Ingresos por categoría y día" descripcion="Matriz de 5 categorías por 6 días." />
        <MatrixTable
          matriz={data.matrizSemanal}
          filas={CATEGORIAS}
          columnas={DIAS}
          etiquetaFila="Categoría"
          etiquetaTotalColumna="Total del día"
          onEditarCelda={onEditar}
        />
      </Card>
    </div>
  );
}

function MatrizCiudades({ onEditar }: { onEditar: (fila: number, columna: number) => void }) {
  const { data } = useAppStore();
  const analisis = analizarMatriz(data.matrizCiudades);
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard icono={Banknote} style={escalonado(0)} destacado etiqueta="Total nacional" valor={formatearMoneda(analisis.totalGeneral)} detalle="Cinco ciudades" />
        <StatCard icono={MapPin} style={escalonado(1)} etiqueta="Ciudad con más demanda" valor={CIUDADES[analisis.columnaLider]} detalle={formatearMoneda(analisis.totalesColumna[analisis.columnaLider])} />
        <StatCard icono={Trophy} style={escalonado(2)} tono="accent" etiqueta="Categoría más solicitada" valor={CATEGORIAS[analisis.filaLider]} detalle={formatearMoneda(analisis.totalesFila[analisis.filaLider])} />
      </div>
      <Card className="animate-fade-up p-5" style={escalonado(3)}>
        <h3 className="text-base font-semibold">Demanda por ciudad</h3>
        <p className="mb-5 text-sm text-muted-foreground">Total de las cinco categorías en cada ciudad.</p>
        <BarrasHorizontales
          titulo="Demanda por ciudad"
          datos={CIUDADES.map((ciudad, i) => ({ etiqueta: ciudad, valor: analisis.totalesColumna[i] }))}
          formato={formatearMoneda}
          destacarMayor
        />
      </Card>
      <Card className="animate-fade-up overflow-hidden" style={escalonado(4)}>
        <CardHeader titulo="Demanda por categoría y ciudad" descripcion="Matriz cuadrada de 5 × 5. La diagonal principal aparece resaltada." />
        <MatrixTable
          matriz={data.matrizCiudades}
          filas={CATEGORIAS}
          columnas={CIUDADES}
          etiquetaFila="Categoría"
          etiquetaTotalColumna="Total ciudad"
          resaltarDiagonal
          onEditarCelda={onEditar}
        />
      </Card>
    </div>
  );
}

// Ejercicio guiado de la Guía 9: ventas de 3 productos durante 3 días.
const MATRIZ_SIMULACION = [
  [150000, 200000, 180000],
  [120000, 250000, 300000],
  [175000, 190000, 220000],
];
const PRODUCTOS_SIMULACION = ["Producto A", "Producto B", "Producto C"];

function Simulacion() {
  const analisis = analizarMatriz(MATRIZ_SIMULACION);
  const celdas = MATRIZ_SIMULACION.length * MATRIZ_SIMULACION[0].length;
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard icono={Banknote} style={escalonado(0)} destacado etiqueta="Total" valor={formatearMoneda(analisis.totalGeneral)} />
        <StatCard icono={Hash} style={escalonado(0)} etiqueta="Registros" valor={celdas} detalle="Celdas procesadas" />
        <StatCard icono={Calculator} style={escalonado(1)} etiqueta="Promedio" valor={formatearMoneda(analisis.promedio)} />
        <StatCard icono={Trophy} style={escalonado(2)} tono="accent" etiqueta="Mayor venta" valor={PRODUCTOS_SIMULACION[analisis.filaLider]} detalle={formatearMoneda(analisis.totalesFila[analisis.filaLider])} />
      </div>
      <Card className="animate-fade-up overflow-hidden" style={escalonado(4)}>
        <CardHeader titulo="Ventas por producto en tres días" descripcion="Ejercicio práctico de la Guía 9 (matriz de 3 × 3)." />
        <MatrixTable
          matriz={MATRIZ_SIMULACION}
          filas={PRODUCTOS_SIMULACION}
          columnas={DIAS.slice(0, 3)}
          etiquetaFila="Producto"
          etiquetaTotalColumna="Total del día"
        />
      </Card>
    </div>
  );
}

function Estructuras() {
  const ejemplos = [
    { titulo: "Matriz cuadrada", descripcion: "Igual número de filas y columnas: categorías por ciudades.", matriz: [[1, 2], [3, 4]] },
    { titulo: "Matriz nula", descripcion: "Todas las celdas en cero antes de registrar ventas.", matriz: crearMatrizNula(3, 3) },
    { titulo: "Matriz identidad", descripcion: "Uno en la diagonal principal y cero en el resto.", matriz: crearMatrizIdentidad(3) },
  ];
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
      {ejemplos.map((ejemplo, i) => (
        <Card key={ejemplo.titulo} className="hover-elevar animate-fade-up p-5" style={escalonado(i)}>
          <h3 className="text-sm font-semibold text-foreground">{ejemplo.titulo}</h3>
          <p className="mt-1 text-sm text-muted-foreground">{ejemplo.descripcion}</p>
          <div className="mt-4 inline-grid gap-1 rounded-xl bg-primary p-3 text-primary-foreground font-mono text-sm" style={{ gridTemplateColumns: `repeat(${ejemplo.matriz[0].length}, 2rem)` }}>
            {ejemplo.matriz.flat().map((valor, i) => (
              <span key={i} className={valor ? "text-center font-semibold text-accent" : "text-center text-primary-foreground/60"}>
                {valor}
              </span>
            ))}
          </div>
        </Card>
      ))}
    </div>
  );
}

function EditarCeldaDialog({ celda, onCerrar }: { celda: CeldaEnEdicion; onCerrar: () => void }) {
  const { data } = useAppStore();
  const { editarCelda } = useFacturacion();
  const toast = useToast();
  const matriz = celda.tipo === "semanal" ? data.matrizSemanal : data.matrizCiudades;
  const columnas = celda.tipo === "semanal" ? DIAS : CIUDADES;
  const [valor, setValor] = useState(String(matriz[celda.fila][celda.columna]));
  const [error, setError] = useState<string | null>(null);

  const guardar = () => {
    const resultado = editarCelda(celda.tipo, celda.fila, celda.columna, Number(valor));
    if (!resultado.ok) return setError(resultado.error);
    toast.exito("Valor actualizado. Los totales se recalcularon.");
    onCerrar();
  };

  return (
    <Modal
      abierto
      ancho="sm"
      titulo="Corregir valor"
      descripcion={`${CATEGORIAS[celda.fila]} · ${columnas[celda.columna]}`}
      onCerrar={onCerrar}
      pie={
        <>
          <Button variante="secondary" onClick={onCerrar}>
            Cancelar
          </Button>
          <Button onClick={guardar}>Guardar</Button>
        </>
      }
    >
      <div className="space-y-3">
        <Field etiqueta="Valor en pesos" ayuda="Sin puntos ni decimales.">
          {(props) => (
            <Input
              {...props}
              type="number"
              inputMode="numeric"
              min={0}
              step={1000}
              value={valor}
              onChange={(e) => setValor(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && guardar()}
            />
          )}
        </Field>
        <FormError mensaje={error} />
      </div>
    </Modal>
  );
}
