"""
========================================================================================
SISTEMA YPRI - PLATAFORMA DE SERVICIOS A DOMICILIO
Modulo: Matrices en Python — Creacion, Recorrido y Operaciones (Guia de Aprendizaje N.º 9)
========================================================================================
Asignatura: Diseño Funcional | Unidad 2: Estructuras de Datos
Integrantes: Jann Pierre Ortiz Zambrano y Josue David Rincon Palomino
Institucion: Fundacion de Estudios Superiores Comfanorte (FESC) - 2026
========================================================================================
DOCUMENTACION DE CUMPLIMIENTO DE LA GUIA DE APRENDIZAJE N.º 9:

1. CONCEPTOS CLAVE:
   - 1.1 ¿Que es una matriz?: Estructura bidimensional organizada en filas y columnas,
         representada en Python como una lista que contiene otras listas.
   - 1.2 Acceso y modificacion: matriz[fila][columna] para consulta y asignacion directa.
   - 1.3 Recorrido de matrices: Ciclos 'for' anidados (externo para filas, interno para columnas).
   - 1.4 Seleccion: Fila completa (matriz[i]) y columna completa mediante ciclo vertical.
   - 1.5 Operaciones matematicas: Suma de filas, suma de columnas, total general y promedios.
   - 1.6 Matrices especiales: Matriz cuadrada (nxn), matriz nula (ceros), matriz identidad (diagonal 1).

2. ACTIVIDAD PRACTICA (SECCION 2):
   - Registro de 3 productos x 3 dias con validaciones defensivas y calculos de totales.
   - Implementado en 'ejecutar_ejercicio_practico_guia9()'.

3. APLICACION AL PROYECTO YPRI (SECCION 3):
   - ACTIVIDAD 1: Matriz de Ventas Semanales (5x6) y Matriz Cuadrada de Ciudades (5x5).
   - ACTIVIDAD 2: Registro y consulta interactiva de celdas, filas y columnas.
   - ACTIVIDAD 3: Recorrido de filas y columnas utilizando ciclos for anidados.
   - ACTIVIDAD 4: Operaciones matematicas de negocio (totales, promedios, max/min, metricas).
   - ACTIVIDAD 5: Integracion completa con base de datos, modulos, CLI, GUI y Web Vercel.
========================================================================================
"""

from core.constantes import (
    CATEGORIAS_MATRIZ,
    CIUDADES_COBERTURA,
    DIAS_SEMANA_MATRIZ,
)
from core.validaciones import (
    separador,
    mostrar_encabezado,
    pedir_sn,
    pedir_entero,
    pedir_valor_matriz_positivo,
    pedir_coordenadas_matriz,
)
from data.database import (
    matriz_ventas_semanales,
    matriz_ventas_ciudades,
    consultar_celda,
    modificar_celda,
    contratos,
    servicios,
)


# ========================================================================================
# [GUIA 9 - ACTIVIDAD 3]: RECORRIDO DE FILAS Y COLUMNAS CON CICLOS ANIDADOS
# ========================================================================================

def mostrar_matriz_tabulada(matriz, nombres_filas, nombres_columnas, titulo="MATRIZ DE VENTAS YPRI (COP)"):
    """
    [GUIA 9 - ACTIVIDAD 3]:
    Muestra en consola la representacion tabular de una matriz bidimensional.
    Recorre las filas y columnas utilizando ciclos anidados y formatea las cantidades
    con alineacion y separadores de miles en pesos colombianos ($ COP).
    """
    separador("=")
    print(f"  {titulo}")
    separador("=")
    print()

    # Encabezado de columnas
    ancho_fila = 18
    ancho_col = 14
    print(f"{'CATEGORIA / FILA':<{ancho_fila}}", end="")
    for col_nombre in nombres_columnas:
        print(f"{col_nombre:>{ancho_col}}", end="")
    print(f"{'TOTAL FILA':>{ancho_col}}")
    separador("-", ancho_fila + ancho_col * (len(nombres_columnas) + 1))

    # [GUIA 9 - SECCION 1.3]: Ciclo for anidado para recorrer e imprimir cada elemento
    # Ciclo externo: recorre cada una de las filas de la matriz
    for i in range(len(matriz)):
        nombre_f = nombres_filas[i] if i < len(nombres_filas) else f"Fila {i}"
        print(f"{nombre_f:<{ancho_fila}}", end="")
        
        # Ciclo interno: recorre cada una de las columnas de la fila actual
        for j in range(len(matriz[i])):
            valor = matriz[i][j]
            print(f"${valor:>{ancho_col - 1},.0f}", end=" ")
        
        # Operacion matematica: Total por fila (Actividad 4)
        total_fila = sum(matriz[i])
        print(f"${total_fila:>{ancho_col - 1},.0f}")

    separador("-", ancho_fila + ancho_col * (len(nombres_columnas) + 1))

    # Fila de totales por columna (Suma vertical calculada con ciclos anidados)
    totales_col = calcular_totales_columnas(matriz)
    print(f"{'TOTAL COLUMNA':<{ancho_fila}}", end="")
    for tot_col in totales_col:
        print(f"${tot_col:>{ancho_col - 1},.0f}", end=" ")
    
    total_general = calcular_total_general(matriz)
    print(f"${total_general:>{ancho_col - 1},.0f}")
    print()


# ========================================================================================
# [GUIA 9 - ACTIVIDAD 4]: OPERACIONES MATEMATICAS Y PROCESAMIENTO UTIL
# ========================================================================================

def calcular_totales_filas(matriz):
    """
    [GUIA 9 - ACTIVIDAD 4]:
    Calcula el total sumado de cada fila de la matriz.
    En YPRI representa la facturacion total acumulada por cada Categoria de Servicio.
    """
    totales = []
    # Recorrido secuencial de filas
    for i in range(len(matriz)):
        total_fila = sum(matriz[i])
        totales.append(total_fila)
    return totales


def calcular_totales_columnas(matriz):
    """
    [GUIA 9 - ACTIVIDAD 4 & SECCION 1.5]:
    Calcula la suma vertical de cada columna utilizando ciclos for anidados.
    En YPRI representa la facturacion total por cada Dia de la semana o por cada Ciudad.
    """
    if not matriz or not matriz[0]:
        return []

    num_filas = len(matriz)
    num_columnas = len(matriz[0])
    totales_columnas = []

    # Ciclo externo recorre las columnas (j)
    for j in range(num_columnas):
        total_col = 0.0
        # Ciclo interno recorre las filas (i) sumando verticalmente
        for i in range(num_filas):
            total_col += matriz[i][j]
        totales_columnas.append(total_col)

    return totales_columnas


def calcular_total_general(matriz):
    """
    [GUIA 9 - ACTIVIDAD 4 & SECCION 1.5]:
    Acumula la suma de todos los elementos presentes en la matriz bidimensional.
    Utiliza ciclos for anidados para ilustrar el recorrido completo de la estructura.
    """
    total = 0.0
    for fila in matriz:
        for valor in fila:
            total += valor
    return total


def calcular_promedio_general(matriz):
    """
    [GUIA 9 - ACTIVIDAD 4 & SECCION 1.5]:
    Calcula el promedio global de ventas por celda o registro.
    Formula: total_general / (cantidad_filas * cantidad_columnas)
    """
    if not matriz or not matriz[0]:
        return 0.0
    total_general = calcular_total_general(matriz)
    total_registros = len(matriz) * len(matriz[0])
    return total_general / total_registros if total_registros > 0 else 0.0


def analizar_rendimiento_matriz(matriz, nombres_filas, nombres_columnas):
    """
    [GUIA 9 - ACTIVIDAD 4]: Analisis estadistico avanzado de la matriz de YPRI.
    Identifica:
    - Categoria con mayor facturacion (Fila con suma maxima).
    - Categoria con menor facturacion (Fila con suma minima).
    - Dia o Ciudad con mayor venta (Columna con suma maxima).
    - Dia o Ciudad con menor venta (Columna con suma minima).
    - Celda individual con la venta record (coordenadas [i][j] y valor).
    """
    totales_filas = calcular_totales_filas(matriz)
    totales_columnas = calcular_totales_columnas(matriz)
    total_general = calcular_total_general(matriz)
    promedio = calcular_promedio_general(matriz)

    # Identificar fila maxima y minima
    idx_max_fila = totales_filas.index(max(totales_filas))
    idx_min_fila = totales_filas.index(min(totales_filas))

    # Identificar columna maxima y minima
    idx_max_col = totales_columnas.index(max(totales_columnas))
    idx_min_col = totales_columnas.index(min(totales_columnas))

    # Localizar celda maxima y minima individual con ciclos anidados
    max_celda = float('-inf')
    min_celda = float('inf')
    coord_max = (0, 0)
    coord_min = (0, 0)

    for i in range(len(matriz)):
        for j in range(len(matriz[i])):
            val = matriz[i][j]
            if val > max_celda:
                max_celda = val
                coord_max = (i, j)
            if val < min_celda:
                min_celda = val
                coord_min = (i, j)

    return {
        "total_general": total_general,
        "promedio_registro": promedio,
        "categoria_lider": nombres_filas[idx_max_fila],
        "categoria_lider_total": totales_filas[idx_max_fila],
        "categoria_menor": nombres_filas[idx_min_fila],
        "categoria_menor_total": totales_filas[idx_min_fila],
        "columna_lider": nombres_columnas[idx_max_col],
        "columna_lider_total": totales_columnas[idx_max_col],
        "columna_menor": nombres_columnas[idx_min_col],
        "columna_menor_total": totales_columnas[idx_min_col],
        "celda_record_valor": max_celda,
        "celda_record_categoria": nombres_filas[coord_max[0]],
        "celda_record_columna": nombres_columnas[coord_max[1]],
        "celda_min_valor": min_celda,
        "celda_min_categoria": nombres_filas[coord_min[0]],
        "celda_min_columna": nombres_columnas[coord_min[1]],
    }


# ========================================================================================
# [GUIA 9 - ACTIVIDAD 2]: REGISTRO Y CONSULTA DE INFORMACION EN LA MATRIZ
# ========================================================================================

def consultar_fila_especifica(matriz, nombres_filas, nombres_columnas):
    """
    [GUIA 9 - SECCION 1.4]: Permite seleccionar y consultar una fila completa (matriz[i]).
    """
    print("\n  Consultar Fila Completa de la Matriz:")
    for idx, nom in enumerate(nombres_filas):
        print(f"    [{idx + 1}] {nom}")
    
    opc = pedir_entero(f"  Seleccione Categoria (1 a {len(nombres_filas)}, 0 para cancelar): ", 0, len(nombres_filas))
    if opc == 0:
        return
    
    fila_idx = opc - 1
    fila = matriz[fila_idx]
    nombre_f = nombres_filas[fila_idx]

    separador()
    print(f"  DETALLE DE FILA: {nombre_f.upper()} (matriz[{fila_idx}])")
    separador()
    for j, col_nombre in enumerate(nombres_columnas):
        print(f"    - {col_nombre:<12}: ${fila[j]:>12,.0f} COP")
    print(f"    ---------------------------------------")
    print(f"    TOTAL ACUMULADO: ${sum(fila):>12,.0f} COP")
    print(f"    PROMEDIO DIARIO: ${sum(fila) / len(fila):>12,.0f} COP")
    separador()


def consultar_columna_especifica(matriz, nombres_filas, nombres_columnas):
    """
    [GUIA 9 - SECCION 1.4]: Permite seleccionar y consultar los valores de una columna.
    Itera sobre cada fila extrayendo el elemento fila[j].
    """
    print("\n  Consultar Columna Completa de la Matriz:")
    for idx, nom in enumerate(nombres_columnas):
        print(f"    [{idx + 1}] {nom}")
    
    opc = pedir_entero(f"  Seleccione Columna (1 a {len(nombres_columnas)}, 0 para cancelar): ", 0, len(nombres_columnas))
    if opc == 0:
        return
    
    col_idx = opc - 1
    nombre_c = nombres_columnas[col_idx]

    separador()
    print(f"  DETALLE DE COLUMNA: {nombre_c.upper()} (Columna {col_idx})")
    separador()
    
    valores_columna = []
    for i, fila in enumerate(matriz):
        val = fila[col_idx]
        valores_columna.append(val)
        print(f"    - {nombres_filas[i]:<16}: ${val:>12,.0f} COP")
    
    print(f"    ---------------------------------------")
    print(f"    TOTAL COLUMNA  : ${sum(valores_columna):>12,.0f} COP")
    print(f"    PROMEDIO       : ${sum(valores_columna) / len(valores_columna):>12,.0f} COP")
    separador()


def registrar_o_modificar_celda_consola(matriz, nombres_filas, nombres_columnas, nombre_matriz="Ventas"):
    """
    [GUIA 9 - ACTIVIDAD 2 & SECCION 1.2]:
    Permite al usuario registrar o actualizar interactivamente un valor en matriz[i][j].
    Aplica validacion de indices y control defensivo de numero no negativo.
    """
    mostrar_encabezado(f"REGISTRAR / MODIFICAR DATO EN MATRIZ — {nombre_matriz}")
    print()
    print("  Seleccione las coordenadas de la celda a actualizar:")

    fila_idx, col_idx = pedir_coordenadas_matriz(
        len(nombres_filas),
        len(nombres_columnas),
        nombres_filas,
        nombres_columnas
    )

    if fila_idx is None or col_idx is None:
        print("\n  [i] Operacion cancelada.")
        return

    valor_anterior = matriz[fila_idx][col_idx]
    cat_nombre = nombres_filas[fila_idx]
    col_nombre = nombres_columnas[col_idx]

    print(f"\n  Coordenada seleccionada: matriz[{fila_idx}][{col_idx}]")
    print(f"  Categoria : {cat_nombre}")
    print(f"  Dimension : {col_nombre}")
    print(f"  Valor actual: ${valor_anterior:,.0f} COP")
    print()

    nuevo_valor = pedir_valor_matriz_positivo(f"  Ingrese el nuevo valor en COP para {cat_nombre} ({col_nombre}): $")

    exito = modificar_celda(matriz, fila_idx, col_idx, nuevo_valor)
    if exito:
        print(f"\n  [OK] Celda actualizada con exito: matriz[{fila_idx}][{col_idx}] = ${nuevo_valor:,.0f} COP")
    else:
        print("\n  [!] Error al actualizar la celda: indices fuera de rango.")


# ========================================================================================
# [GUIA 9 - SECCION 1.6]: MATRICES ESPECIALES
# - Matriz cuadrada: igual numero de filas y columnas.
# - Matriz nula: todos sus elementos son cero.
# - Matriz identidad: unos en su diagonal principal y ceros en las demas posiciones.
# ========================================================================================

def es_matriz_cuadrada(matriz):
    """
    [GUIA 9 - SECCION 1.6]: Verifica si una matriz tiene igual numero de filas y columnas.
    """
    if not matriz:
        return False
    num_filas = len(matriz)
    return all(len(fila) == num_filas for fila in matriz)


def crear_matriz_nula(filas, columnas):
    """
    [GUIA 9 - SECCION 1.6]: Crea una matriz nula donde todos sus elementos son cero.
    Utiliza comprension de listas bidimensional.
    """
    return [[0.0 for _ in range(columnas)] for _ in range(filas)]


def crear_matriz_identidad(n):
    """
    [GUIA 9 - SECCION 1.6]: Crea una matriz identidad de orden n x n.
    Contiene unos (1.0) en la diagonal principal (i == j) y ceros (0.0) en las demas.
    """
    identidad = []
    for i in range(n):
        fila = []
        for j in range(n):
            if i == j:
                fila.append(1.0)
            else:
                fila.append(0.0)
        identidad.append(fila)
    return identidad


def extraer_diagonal_principal(matriz):
    """
    [GUIA 9 - SECCION 1.6]: Extrae los elementos de la diagonal principal (i == j).
    """
    limite = min(len(matriz), len(matriz[0])) if matriz else 0
    return [matriz[i][i] for i in range(limite)]


def mostrar_demostracion_matrices_especiales():
    """
    [GUIA 9 - SECCION 1.6]: Muestra en consola ejemplos visuales de las tres matrices especiales.
    """
    mostrar_encabezado("MATRICES ESPECIALES — GUIA 9 (SECCION 1.6)")
    print()

    # 1. Matriz Cuadrada (Demostrada con la matriz de ciudades de YPRI: 5x5)
    print("  1. MATRIZ CUADRADA (Igual numero de filas y columnas)")
    print(f"     Dimensiones de 'matriz_ventas_ciudades': {len(matriz_ventas_ciudades)} filas x {len(matriz_ventas_ciudades[0])} columnas.")
    print(f"     ¿Es cuadrada?: {es_matriz_cuadrada(matriz_ventas_ciudades)} (5x5).")
    diagonal = extraer_diagonal_principal(matriz_ventas_ciudades)
    print(f"     Diagonal principal (i == j): {['$' + f'{x:,.0f}' for x in diagonal]}")
    print()

    # 2. Matriz Nula
    print("  2. MATRIZ NULA (Todos sus elementos son cero)")
    matriz_nula_ejemplo = crear_matriz_nula(3, 3)
    print("     Ejemplo nula 3x3:")
    for fila in matriz_nula_ejemplo:
        print("     ", fila)
    print()

    # 3. Matriz Identidad
    print("  3. MATRIZ IDENTIDAD (Unos en diagonal principal y ceros en el resto)")
    matriz_id_ejemplo = crear_matriz_identidad(3)
    print("     Ejemplo identidad 3x3:")
    for fila in matriz_id_ejemplo:
        print("     ", fila)
    separador()


# ========================================================================================
# [GUIA 9 - SECCION 2]: ACTIVIDAD PRACTICA COMPLETA DE LA GUIA
# Registro de ventas de 3 productos durante 3 dias, totales por producto,
# totales por dia, total general y promedio de ventas.
# ========================================================================================

def ejecutar_ejercicio_practico_guia9(interactivo=False):
    """
    [GUIA 9 - SECCION 2]:
    Ejecuta el programa estandar especificado en la Guia de Aprendizaje N.º 9.
    Registra ventas de 3 productos en 3 dias, calcula totales por producto,
    totales por dia, total general y promedio por registro.
    """
    mostrar_encabezado("EJERCICIO PRACTICO GUIADO — GUIA 9 (SECCION 2)")
    print()
    print("  Contexto: 3 Productos x 3 Dias")
    print("  Permite registrar y validar valores, calcular sumas y promedios.")
    print()

    productos = ["Producto A", "Producto B", "Producto C"]
    dias = ["Lunes", "Martes", "Miercoles"]
    ventas = []

    if interactivo:
        # Registro interactivo con validacion defensiva exacta de la Guia 9 (Pagina 4)
        for producto in productos:
            fila = []
            print(f"\n  Registro de {producto}")
            for dia in dias:
                while True:
                    try:
                        valor = float(input(f"    Venta del {dia}: $"))
                        if valor < 0:
                            print("    [!] El valor no puede ser negativo.")
                            continue
                        fila.append(valor)
                        break
                    except ValueError:
                        print("    [!] Ingrese un valor numerico valido.")
            ventas.append(fila)
    else:
        # Valores de prueba representativos precargados (segun ejemplo de la Guia 9)
        print("  [i] Modo demostracion rapida con valores precargados:")
        ventas = [
            [150000.0, 200000.0, 180000.0],  # Producto A
            [120000.0, 250000.0, 300000.0],  # Producto B
            [175000.0, 190000.0, 220000.0]   # Producto C
        ]

    # MOSTRAR MATRIZ (Pagina 4 de la Guia)
    print("\n  MATRIZ DE VENTAS")
    print(f"  {'PRODUCTO':<15}", end="")
    for dia in dias:
        print(f"{dia:>15}", end="")
    print()

    for i in range(len(ventas)):
        print(f"  {productos[i]:<15}", end="")
        for valor in ventas[i]:
            print(f"{valor:>15.2f}", end="")
        print()

    # TOTAL POR PRODUCTO (Pagina 5 de la Guia)
    print("\n  TOTAL DE VENTAS POR PRODUCTO")
    for i in range(len(ventas)):
        total_producto = sum(ventas[i])
        print(f"    {productos[i]}: ${total_producto:,.2f}")

    # TOTAL POR DIA (Pagina 5 de la Guia - Ciclos anidados)
    print("\n  TOTAL DE VENTAS POR DIA")
    for j in range(len(dias)):
        total_dia = 0.0
        for i in range(len(productos)):
            total_dia += ventas[i][j]
        print(f"    {dias[j]}: ${total_dia:,.2f}")

    # TOTAL GENERAL (Pagina 6 de la Guia)
    total_general = 0.0
    for fila in ventas:
        total_general += sum(fila)
    print(f"\n  TOTAL GENERAL: ${total_general:,.2f}")

    # PROMEDIO DE VENTAS (Pagina 6 de la Guia)
    cantidad_registros = len(productos) * len(dias)
    promedio = total_general / cantidad_registros
    print(f"  PROMEDIO POR REGISTRO: ${round(promedio, 2):,.2f}")
    separador()


# ========================================================================================
# [GUIA 9 - ACTIVIDAD 5]: INTEGRACION CON OPERACIONES EXISTENTES (SINCRONIZACION)
# ========================================================================================

def sincronizar_matriz_con_contratos_reales():
    """
    [GUIA 9 - ACTIVIDAD 5]:
    Integra la matriz con los registros reales de contratos de la base de datos de YPRI.
    Agrupa los contratos con estado 'Completado' segun su categoria de servicio
    y actualiza la celda correspondiente sumando los montos totales facturados.
    """
    # Mapeo de indices de categoria
    cat_to_idx = {cat.lower(): idx for idx, cat in enumerate(CATEGORIAS_MATRIZ)}
    
    total_sumado = 0.0
    contratos_procesados = 0

    for c in contratos:
        if c.get("estado") == "Completado":
            # Extraer categoria del servicio contratado
            cod_serv = c.get("servicio_codigo")
            serv_encontrado = next((s for s in servicios if s["codigo"] == cod_serv), None)
            
            if serv_encontrado:
                cat = serv_encontrado["categoria"].lower()
                if cat in cat_to_idx:
                    cat_idx = cat_to_idx[cat]
                    # Asignar a la columna de Viernes (columna 4) como ejemplo de contratacion activa
                    matriz_ventas_semanales[cat_idx][4] += float(c["total"])
                    total_sumado += float(c["total"])
                    contratos_procesados += 1

    return contratos_procesados, total_sumado


# ========================================================================================
# MENU INTERACTIVO CLI DEL MODULO DE MATRICES (GUIA 9)
# ========================================================================================

def menu_matrices_interactivo():
    """
    Menu principal de navegacion en modo consola para todas las funcionalidades
    exigidas en la Guia de Aprendizaje N.º 9 (Matrices en Python).
    """
    while True:
        mostrar_encabezado("MODULO DE MATRICES — GUIA DE APRENDIZAJE N.º 9")
        print()
        print("  1. Ver Matriz de Ventas Semanales (5 Categorias x 6 Dias) [Actividad 1 y 3]")
        print("  2. Ver Matriz Cuadrada de Cobertura (5 Categorias x 5 Ciudades) [Actividad 1 y 3]")
        print("  3. Registrar o modificar celda matriz[i][j] [Actividad 2]")
        print("  4. Consultar una fila completa (Categoria) [Concepto 1.4]")
        print("  5. Consultar una columna completa (Dia/Ciudad) [Concepto 1.4]")
        print("  6. Informe estadistico de rendimiento (Totales, Promedios, Extremos) [Actividad 4]")
        print("  7. Demostracion de Matrices Especiales (Cuadrada, Nula, Identidad) [Concepto 1.6]")
        print("  8. Ejecutar Ejercicio Practico Guiado de la Guia 9 (3x3) [Seccion 2]")
        print("  9. Sincronizar matriz con contratos reales completados [Actividad 5]")
        print("  0. Volver al menu anterior")
        separador()

        opc = input("  Seleccione una opcion (0-9): ").strip()

        if opc == "1":
            mostrar_matriz_tabulada(
                matriz_ventas_semanales,
                CATEGORIAS_MATRIZ,
                DIAS_SEMANA_MATRIZ,
                "MATRIZ DE VENTAS SEMANALES (CATEGORIAS X DIAS)"
            )
        elif opc == "2":
            mostrar_matriz_tabulada(
                matriz_ventas_ciudades,
                CATEGORIAS_MATRIZ,
                CIUDADES_COBERTURA,
                "MATRIZ CUADRADA DE VENTAS (CATEGORIAS X CIUDADES - 5X5)"
            )
        elif opc == "3":
            print("\n  ¿Que matriz desea modificar?")
            print("    [1] Matriz de Ventas Semanales (Dias)")
            print("    [2] Matriz Cuadrada de Ciudades")
            sub_opc = input("    Seleccione (1-2): ").strip()
            if sub_opc == "1":
                registrar_o_modificar_celda_consola(
                    matriz_ventas_semanales,
                    CATEGORIAS_MATRIZ,
                    DIAS_SEMANA_MATRIZ,
                    "Ventas Semanales"
                )
            elif sub_opc == "2":
                registrar_o_modificar_celda_consola(
                    matriz_ventas_ciudades,
                    CATEGORIAS_MATRIZ,
                    CIUDADES_COBERTURA,
                    "Ventas por Ciudad"
                )
        elif opc == "4":
            consultar_fila_especifica(
                matriz_ventas_semanales,
                CATEGORIAS_MATRIZ,
                DIAS_SEMANA_MATRIZ
            )
        elif opc == "5":
            consultar_columna_especifica(
                matriz_ventas_semanales,
                CATEGORIAS_MATRIZ,
                DIAS_SEMANA_MATRIZ
            )
        elif opc == "6":
            mostrar_encabezado("INFORME DE RENDIMIENTO MATRICIAL (GUIA 9)")
            print()
            info = analizar_rendimiento_matriz(
                matriz_ventas_semanales,
                CATEGORIAS_MATRIZ,
                DIAS_SEMANA_MATRIZ
            )
            print(f"  FACTURACION GENERAL : ${info['total_general']:>15,.0f} COP")
            print(f"  PROMEDIO POR CELDA  : ${info['promedio_registro']:>15,.0f} COP")
            print()
            print(f"  CATEGORIA LIDER     : {info['categoria_lider']} (${info['categoria_lider_total']:,.0f} COP)")
            print(f"  CATEGORIA MENOR     : {info['categoria_menor']} (${info['categoria_menor_total']:,.0f} COP)")
            print(f"  DIA MAS PRODUCTIVO  : {info['columna_lider']} (${info['columna_lider_total']:,.0f} COP)")
            print(f"  DIA MENOS VENTAS    : {info['columna_menor']} (${info['columna_menor_total']:,.0f} COP)")
            print()
            print(f"  RECORD INDIVIDUAL   : ${info['celda_record_valor']:,.0f} COP")
            print(f"                        (Categoria: {info['celda_record_categoria']}, Dia: {info['celda_record_columna']})")
            separador()
        elif opc == "7":
            mostrar_demostracion_matrices_especiales()
        elif opc == "8":
            resp = pedir_sn("  ¿Desea ingresar los datos manualmente? (s = manual / n = precargado): ")
            ejecutar_ejercicio_practico_guia9(interactivo=(resp == "s"))
        elif opc == "9":
            cant, tot = sincronizar_matriz_con_contratos_reales()
            print(f"\n  [OK] Sincronizacion completada.")
            print(f"  Contratos procesados: {cant}")
            print(f"  Total adicional acreditado a matriz: ${tot:,.0f} COP")
        elif opc == "0":
            break
        else:
            print("\n  [!] Opcion invalida. Ingrese un numero entre 0 y 9.")

        input("\n  Presione Enter para continuar...")
        print()
