# YPRI — Plataforma de Servicios a Domicilio
### Sistema de Gestión, Facturación y Subalgoritmos en Python (Guía 10)

**Asignatura:** Diseño Funcional  
**Unidad 2:** Estructuras de Datos | **Tema 5:** Subalgoritmos  
**Institución:** Fundación de Estudios Superiores Comfanorte (FESC) — 2026  
**Integrantes:** Jann Pierre Ortiz Zambrano y Josué David Rincón Palomino  

---

## Descripción General

**YPRI** es una plataforma integral orientada a conectar clientes con profesionales independientes y empresas de servicios técnicos para el hogar y comercio (electricidad, plomería, limpieza, climatización y cerrajería) en las principales ciudades de Colombia.

En esta **Semana 10 (Guía de Aprendizaje N.º 10)**, el proyecto implementa formalmente el paradigma de **Subalgoritmos en Python**:
1. **Funciones con parámetros y retorno (`return`)**: Desacoplamiento de cálculos financieros y estadísticos de las capas de interfaz de usuario.
2. **Procedimientos (funciones sin `return`)**: Módulos especializados en formateo e interacción (fichas técnicas, recibos formales y tarjetas de rendimiento).
3. **Funciones Lambda**: Expresiones breves para deducciones promocionales, cálculo de IVA y criterios dinámicos de ordenamiento con `sorted(key=lambda ...)`.
4. **Paso de Argumentos (Valor vs. Referencia)**: Análisis y comprobación empírica de objetos inmutables (`int`, `float`, `str`, `tuple`) y mutables (`list`, `dict`).
5. **Modularización (Principio DRY)**: Reorganización limpia en módulos independientes, eliminando instrucciones duplicadas y conservando el 100% de las funcionalidades de semanas anteriores (5, 6, 7, 8 y 9).

---

## Estructura del Repositorio Organizada por Carpetas

```text
semana10/
├── backend/                             # Código fuente en Python (CLI, GUI Tkinter y Tests)
│   ├── core/                            # Reglas, tuplas y validaciones defensivas
│   │   ├── constantes.py                # Tuplas inmutables (roles, categorías, ciudades, estados)
│   │   └── validaciones.py              # Validación defensiva, try-except y control de tipos
│   ├── data/                            # Persistencia y base de datos en memoria
│   │   └── database.py                  # Vectores unidimensionales y matrices bidimensionales
│   ├── modules/                         # Módulos de lógica de negocio desacoplados
│   │   ├── subalgoritmos.py             # GUÍA 10: Funciones puras con return, procedimientos, lambdas
│   │   ├── matrices.py                  # Guía 9: Matrices de ventas, ciudades y especiales
│   │   ├── servicios.py                 # Guía 8: Catálogo, ordenamiento y búsquedas
│   │   ├── contratos.py                 # Cotizaciones modulares con IVA y gestión de acuerdos
│   │   ├── calificaciones.py            # Recálculo ponderado del rating promedio
│   │   ├── admin.py                     # Métricas consolidadas y auditoría del sistema
│   │   └── auth.py                      # Autenticación, control de roles y registro
│   ├── tests_guia10.py                  # Suite automatizada de pruebas unitarias (unittest)
│   ├── ejercicio_practico_guia10.py     # Sección 2 de la Guía 10 (Inventario con funciones)
│   ├── app_gui.py                       # Interfaz gráfica moderna de escritorio con Tkinter / TTK
│   └── main.py                          # Menú interactivo por consola (CLI)
├── documents/                           # Documentación académica institucional formal
│   ├── ENTREGA_GUIA_10_YPRI.docx        # Informe oficial generado según formato FESC
│   ├── generar_documento_entrega.py     # Script generador del informe en Word (.docx)
│   └── GUÍA DE APRENDIZAJE N.º 10...pdf # Guía de aprendizaje original en PDF
├── web/                                 # Frontend Web y Móvil (Next.js 14 + Tailwind CSS)
│   ├── app/                             # Punto de entrada de Next.js (layout y página)
│   ├── lib/                             # Dominio puro: constantes, finanzas, matrices, datos semilla
│   │   └── domain/                      # Reglas de negocio: permisos por rol, contratos, servicios, facturación
│   ├── store/                           # Estado global, persistencia y hooks por funcionalidad
│   ├── components/                      # Componentes de interfaz reutilizables y armazón de la app
│   ├── features/                        # Vistas por rol: auth, catálogo, contratos, profesional, admin
│   └── package.json                     # Scripts: dev, build, test y type-check
├── ejercicio_practico_guia10.py         # Acceso directo al ejercicio guiado de la Sección 2
├── ENTREGA_GUIA_10_YPRI.docx            # Acceso directo al informe en Word
├── package.json                         # Scripts raíz de la aplicación web
├── vercel.json                          # Configuración de despliegue en Vercel
└── README.md                            # Documentación técnica general
```

---

## Cumplimiento de las Actividades de la Guía 10

### 1. Actividad Práctica Guiada (Sección 2 de la Guía)
- Archivo: `backend/ejercicio_practico_guia10.py`
- Implementa el **Sistema de Inventario con Funciones**:
  - `registrar_producto()`: Validación de campos, unicidad de código y valores no negativos.
  - `calcular_subtotal(precio, cantidad)`: Función con parámetros que retorna `precio * cantidad`.
  - `mostrar_productos()`: Procedimiento que tabula la información y llama a `calcular_subtotal()`.
  - `buscar_producto()`: Procedimiento secuencial de búsqueda por código.
  - `calcular_total_inventario()`: Función con retorno que suma acumulativamente los subtotales.
  - `ordenar_productos()`: Ordenamiento por precio mediante `sorted(productos, key=lambda p: p["precio"])`.
  - `mostrar_menu()` e `iniciar_programa()`: Menú en ciclo `while True`.

### 2. Aplicación al Proyecto Software YPRI (Sección 3)

| Actividad | Requerimiento Guía 10 | Implementación en YPRI |
|---|---|---|
| **Actividad 1** | Identificación de subalgoritmos | Mapeo de operaciones de registro, cotización, auditoría y cálculo; separación de funciones de cálculo de procedimientos de presentación. |
| **Actividad 2** | Al menos 3 funciones con parámetros y `return` | 1. `calcular_liquidacion_contrato(...)` -> `dict`<br>2. `calcular_comision_plataforma(...)` -> `dict`<br>3. `calcular_promedio_calificacion(...)` -> `float`<br>4. `calcular_metricas_prestador(...)` -> `dict`<br>5. `calcular_resumen_estadistico(...)` -> `dict` |
| **Actividad 3** | Procedimientos sin `return` | 1. `mostrar_recibo_liquidacion(...)`<br>2. `mostrar_ficha_tecnica_servicio(...)`<br>3. `mostrar_tarjeta_rendimiento_prestador(...)`<br>4. `mostrar_menu_subalgoritmos(...)` |
| **Actividad 4** | Funciones Lambda | • Cálculo rápido de descuento: `lambda subtotal, pct: round(subtotal * (pct / 100), 2)`<br>• Cálculo de IVA 19%: `lambda base, tasa=0.19: round(base * tasa, 2)`<br>• Formateador COP: `lambda v: f"${v:,.0f} COP"`<br>• Ordenamiento: `sorted(servicios, key=lambda s: s["tarifa_hora"])` |
| **Actividad 5** | Variables y paso de argumentos | • Mapeo de variables globales en `database.py` vs locales en cada función.<br>• Pruebas empíricas: inmutabilidad de `int`, `float`, `str` (paso por valor) frente a mutabilidad in-place de `list` y `dict` (paso por referencia). |
| **Actividad 6** | Modularización (Principio DRY) | Reorganización en `modules/subalgoritmos.py`, refactorización de `contratos.py` y `calificaciones.py` reutilizando funciones con retorno, sin duplicar lógica y conservando el 100% de funcionalidades previas. |
| **Actividad 7** | Pruebas de funcionamiento | Suite automatizada `backend/tests_guia10.py` con 9 pruebas unitarias (`unittest`) superadas al 100%. |

---

## Instrucciones de Ejecución

### 1. Ejecución del Ejercicio Práctico Guiado (Sección 2)
```bash
python ejercicio_practico_guia10.py
```
O desde la carpeta `backend`:
```bash
python backend/ejercicio_practico_guia10.py
```

---

### 2. Ejecución de la Suite de Pruebas Automatizadas (Actividad 7)
```bash
python backend/tests_guia10.py
```
*Resultado esperado: 9 tests pasados en menos de 0.01 segundos.*

---

### 3. Ejecución del Menú por Consola (CLI Interactivo)
```bash
python backend/main.py
```
Opciones destacadas en el menú principal:
- **Opción 5:** Explorador interactivo de Subalgoritmos (Guía 10).
- **Opción 6:** Ejecutar Ejercicio Práctico Guiado de Inventario (Guía 10).
- **Opción 7:** Abrir Interfaz Gráfica Tkinter.

---

### 4. Ejecución de la Interfaz Gráfica de Escritorio (Tkinter GUI)
```bash
python backend/app_gui.py
```
*Incluye la nueva pestaña lateral **"Subalgoritmos (Guía 10)"** con pestañas para funciones con return, procedimientos, lambdas, demostración de argumentos e inventario guiado.*

---

### 5. Generación del Documento Formal de Entrega (.docx)
```bash
python documents/generar_documento_entrega.py
```
*Genera el archivo institucional formal `documents/ENTREGA_GUIA_10_YPRI.docx`.*

---

### 6. Ejecución de la Plataforma Web y Móvil (Next.js 14)
```bash
npm run dev
```
O ingresando a la carpeta `web`:
```bash
cd web
npm run dev
```
Abrir en el navegador: [http://localhost:3000](http://localhost:3000) e iniciar sesión. La pantalla de acceso incluye tres cuentas de demostración:

| Rol | Correo | Qué puede hacer |
|---|---|---|
| Cliente | `juan.perez@email.com` | Explorar servicios, solicitarlos, cancelar solicitudes pendientes y calificar servicios completados. |
| Profesional | `carlos.gomez@email.com` | Aceptar, rechazar y completar solicitudes; publicar y pausar sus servicios; ver sus ganancias. |
| Administrador | `admin@ypri.com` | Resumen de la plataforma, facturación (matrices de la Guía 9), todos los contratos, usuarios y el módulo de **Subalgoritmos (Guía 10)**. |

Cada rol solo ve sus propias vistas y datos: los permisos se definen en `web/lib/domain/permissions.ts` y se validan tanto en la navegación como en cada operación.

Pruebas y verificación del frontend:
```bash
cd web
npm test            # Pruebas unitarias del dominio (Vitest)
npm run type-check  # TypeScript en modo estricto
npm run build       # Build de producción (falla si hay errores de tipos)
```
