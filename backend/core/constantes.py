"""
========================================================================================
SISTEMA YPRI - PLATAFORMA DE SERVICIOS A DOMICILIO
Modulo: Constantes Inmutables del Sistema (Tuplas)
========================================================================================
DOCUMENTACION DE TEMAS POR SEMANAS:
- [SEMANAS 5 Y 6]: Reglas fijas para condiciones de control en ciclos y validaciones.
- [SEMANA 7 - TUPLAS, CADENAS Y DICCIONARIOS]:
  * Tuplas inmutables: colecciones de solo lectura garantizan consistencia e integridad.
  * ROLES_SISTEMA, CATEGORIAS_SERVICIO, ESTADOS_CONTRATO, CIUDADES_COBERTURA.
- [SEMANA 8 - VECTORES]: Dimensionamiento y categorizacion de atributos en registros.
- [SEMANA 9 - MATRICES EN PYTHON]:
  * Etiquetas de filas y columnas para matrices bidimensionales del sistema YPRI.
  * DIAS_SEMANA_MATRIZ: columnas para la matriz de ventas semanales (5 categorias x 6 dias).
  * CIUDADES_COBERTURA: columnas para la matriz cuadrada de demanda (5 categorias x 5 ciudades).
========================================================================================
"""

# [SEMANA 7 - TUPLAS] Roles oficiales del sistema
ROLES_SISTEMA = ("cliente", "prestador", "admin")

# [SEMANA 7 - TUPLAS & SEMANA 9 - FILAS DE MATRIZ]
# Categorias oficiales de servicios en YPRI (Filas en las matrices analiticas)
CATEGORIAS_SERVICIO = (
    "Electricidad",
    "Plomeria",
    "Limpieza",
    "Climatizacion",
    "Cerrajeria",
    "Belleza"
)

# [SEMANA 9 - FILAS DE MATRIZ]
# Filas de las matrices analiticas (5x6 semanal y 5x5 cuadrada por ciudad).
# Son los cinco oficios originales: Belleza se ofrece en la plataforma pero no
# tiene fila en estas matrices, para conservar sus dimensiones (Guia 9).
CATEGORIAS_MATRIZ = (
    "Electricidad",
    "Plomeria",
    "Limpieza",
    "Climatizacion",
    "Cerrajeria"
)

# [SEMANA 7 - TUPLAS] Estados del ciclo de vida de un contrato
ESTADOS_CONTRATO = (
    "Pendiente",
    "En proceso",
    "Completado",
    "Cancelado"
)

# [SEMANA 7 - TUPLAS & SEMANA 9 - COLUMNAS DE MATRIZ CUADRADA]
# Ciudades de cobertura (Columnas para la matriz cuadrada 5x5: 5 categorias x 5 ciudades)
CIUDADES_COBERTURA = (
    "Cucuta",
    "Cali",
    "Bogota",
    "Medellin",
    "Bucaramanga"
)

# [SEMANA 9 - TUPLAS & COLUMNAS DE MATRIZ DE VENTAS SEMANALES]
# Dias laborales de la semana utilizados en la matriz de facturacion (Filas: Categorias, Cols: Dias)
DIAS_SEMANA_MATRIZ = (
    "Lunes",
    "Martes",
    "Miercoles",
    "Jueves",
    "Viernes",
    "Sabado"
)

# [SEMANAS 5 A 8] Tasa del Impuesto al Valor Agregado (IVA en Colombia: 19%)
IVA_PORCENTAJE = 0.19
