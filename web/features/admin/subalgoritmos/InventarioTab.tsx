"use client";

import { useState, type FormEvent } from "react";
import { ArrowUpDown } from "lucide-react";
import { Button, FormError, Input, Table, Td, Th } from "@/components/ui";
import { calcularSubtotalInventario, calcularTotalInventario } from "@/lib/finance";
import { formatearMoneda } from "@/lib/format";
import type { ProductoInventario } from "@/lib/types";
import { TarjetaSubalgoritmo } from "./shared";

const INVENTARIO_INICIAL: ProductoInventario[] = [
  { codigo: "P01", nombre: "Kit de herramientas", precio: 180000, cantidad: 4 },
  { codigo: "P02", nombre: "Multímetro digital", precio: 95000, cantidad: 8 },
  { codigo: "P03", nombre: "Taladro percutor 750 W", precio: 250000, cantidad: 3 },
];

const FORMULARIO_VACIO = { codigo: "", nombre: "", precio: "", cantidad: "" };

function validarProducto(productos: readonly ProductoInventario[], f: typeof FORMULARIO_VACIO): string | null {
  if (!f.codigo.trim() || !f.nombre.trim()) return "El código y el nombre son obligatorios.";
  if (productos.some((p) => p.codigo.toLowerCase() === f.codigo.trim().toLowerCase())) return "Ya existe un producto con ese código.";
  const precio = Number(f.precio);
  const cantidad = Number(f.cantidad);
  if (!f.precio || !Number.isFinite(precio) || precio < 0) return "El precio debe ser un número mayor o igual a cero.";
  if (!f.cantidad || !Number.isInteger(cantidad) || cantidad < 0) return "La cantidad debe ser un entero mayor o igual a cero.";
  return null;
}

/** Ejercicio guiado de la Guía 10 (sección 2): inventario con funciones. */
export function InventarioTab() {
  const [productos, setProductos] = useState(INVENTARIO_INICIAL);
  const [formulario, setFormulario] = useState(FORMULARIO_VACIO);
  const [error, setError] = useState<string | null>(null);

  const registrar = (evento: FormEvent) => {
    evento.preventDefault();
    const mensaje = validarProducto(productos, formulario);
    setError(mensaje);
    if (mensaje) return;
    setProductos((actuales) => [
      ...actuales,
      { codigo: formulario.codigo.trim(), nombre: formulario.nombre.trim(), precio: Number(formulario.precio), cantidad: Number(formulario.cantidad) },
    ]);
    setFormulario(FORMULARIO_VACIO);
  };

  const campo = (clave: keyof typeof FORMULARIO_VACIO) => ({
    value: formulario[clave],
    onChange: (e: { target: { value: string } }) => setFormulario((f) => ({ ...f, [clave]: e.target.value })),
  });

  return (
    <TarjetaSubalgoritmo
      firma="registrar_producto() · calcular_total_inventario()"
      tipo="ejercicio guiado"
      descripcion="Registro con validación, subtotal por producto, total general y ordenamiento con lambda."
    >
      <form onSubmit={registrar} className="grid grid-cols-2 gap-3 sm:grid-cols-5" noValidate>
        <Input aria-label="Código" placeholder="Código" {...campo("codigo")} />
        <Input aria-label="Nombre" placeholder="Nombre" {...campo("nombre")} />
        <Input aria-label="Precio unitario" placeholder="Precio" type="number" min={0} {...campo("precio")} />
        <Input aria-label="Cantidad" placeholder="Cantidad" type="number" min={0} {...campo("cantidad")} />
        <Button type="submit" className="col-span-2 sm:col-span-1">
          Registrar
        </Button>
      </form>
      <div className="mt-3">
        <FormError mensaje={error} />
      </div>

      <div className="mt-4 flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Total del inventario <span className="text-base font-semibold text-foreground">{formatearMoneda(calcularTotalInventario(productos))}</span>
        </p>
        <Button variante="secondary" tamano="sm" icono={ArrowUpDown} onClick={() => setProductos((p) => [...p].sort((a, b) => a.precio - b.precio))}>
          Ordenar por precio
        </Button>
      </div>
      <div className="mt-3">
        <Table>
          <thead>
            <tr>
              <Th>Código</Th>
              <Th>Producto</Th>
              <Th numerico>Precio</Th>
              <Th numerico>Cantidad</Th>
              <Th numerico>Subtotal</Th>
            </tr>
          </thead>
          <tbody>
            {productos.map((p) => (
              <tr key={p.codigo}>
                <Td className="font-mono text-xs">{p.codigo}</Td>
                <Td>{p.nombre}</Td>
                <Td numerico>{formatearMoneda(p.precio)}</Td>
                <Td numerico>{p.cantidad}</Td>
                <Td numerico className="font-medium text-foreground">
                  {formatearMoneda(calcularSubtotalInventario(p.precio, p.cantidad))}
                </Td>
              </tr>
            ))}
          </tbody>
        </Table>
      </div>
    </TarjetaSubalgoritmo>
  );
}
