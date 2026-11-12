"""
========================================================================================
SISTEMA YPRI - PLATAFORMA DE SERVICIOS A DOMICILIO
Modulo: Base de Datos y Persistencia en Memoria (Vectores y Matrices)
========================================================================================
DOCUMENTACION DE TEMAS POR SEMANAS:
- [SEMANAS 5 Y 6]: Estructuras de datos base manipuladas mediante ciclos de control.
- [SEMANA 7 - TUPLAS, CADENAS Y DICCIONARIOS]:
  * Diccionarios mutables con pares clave-valor que representan registros de entidades.
  * Tuplas para campos categoricos inmutables.
- [SEMANA 8 - VECTORES EN PYTHON]:
  * Vectores unidimensionales (listas indexadas de diccionarios):
    usuarios[], servicios[], contratos[], calificaciones[].
  * Crecimiento dinamico con .append() y medicion con len().
- [SEMANA 9 - MATRICES EN PYTHON: CREACION, RECORRIDO Y OPERACIONES]:
  * ACTIVIDAD 1: Implementacion de estructuras bidimensionales (listas de listas)
    relacionadas con las necesidades operativas de la plataforma YPRI:
    1) 'matriz_ventas_semanales': 5 filas (Categorias) x 6 columnas (Dias laborables)
       que almacena los ingresos facturados en pesos colombianos (COP).
    2) 'matriz_ventas_ciudades': 5 filas (Categorias) x 5 columnas (Ciudades cobertura)
       constituyendo una MATRIZ CUADRADA (5x5) para analisis geografico y diagonal.
  * ACTIVIDAD 2: Funciones para consultar y registrar (modificar) elementos matriz[i][j].
========================================================================================
"""

from core.constantes import (
    CATEGORIAS_MATRIZ,
    CIUDADES_COBERTURA,
    DIAS_SEMANA_MATRIZ,
)

# ========================================================================================
# [SEMANA 8 - VECTORES] COLECCIONES UNIDIMENSIONALES DE REGISTROS
# ========================================================================================

usuarios = [
    {
        "id": "USR-001",
        "nombre": "Juan Perez",
        "correo": "juan.perez@email.com",
        "contrasena": "juan123",
        "rol": "cliente",
        "ciudad": "Cucuta",
        "telefono": "3001234567"
    },
    {
        "id": "USR-002",
        "nombre": "Carlos Gomez",
        "correo": "carlos.gomez@email.com",
        "contrasena": "carlos456",
        "rol": "prestador",
        "ciudad": "Cucuta",
        "telefono": "3109876543"
    },
    {
        "id": "USR-003",
        "nombre": "Admin YPRI",
        "correo": "admin@ypri.com",
        "contrasena": "admin2026",
        "rol": "admin",
        "ciudad": "Cucuta",
        "telefono": "3200000000"
    }
]

servicios = [
    {
        "codigo": "SERV-01",
        "prestador_id": "USR-002",
        "prestador_nombre": "Carlos Gomez",
        "categoria": "Electricidad",
        "descripcion": "Instalaciones electricas residenciales y comerciales",
        "tarifa_hora": 35000.0,
        "ciudad": "Cucuta",
        "zona": "Caobos",
        "lat": 7.9052,
        "lng": -72.4962,
        "radio_km": 10,
        "disponible": True,
        "calificacion": 4.8,
        "num_contratos": 12
    },
    {
        "codigo": "SERV-02",
        "prestador_id": "USR-002",
        "prestador_nombre": "Marta Rodriguez",
        "categoria": "Plomeria",
        "descripcion": "Reparacion de tuberias, grifos y sistemas hidraulicos",
        "tarifa_hora": 30000.0,
        "ciudad": "Cucuta",
        "zona": "La Libertad",
        "lat": 7.8801,
        "lng": -72.5201,
        "radio_km": 8,
        "disponible": True,
        "calificacion": 4.5,
        "num_contratos": 8
    },
    {
        "codigo": "SERV-03",
        "prestador_id": "USR-002",
        "prestador_nombre": "Andres Silva",
        "categoria": "Climatizacion",
        "descripcion": "Mantenimiento y reparacion de aires acondicionados",
        "tarifa_hora": 45000.0,
        "ciudad": "Cucuta",
        "zona": "Prados del Este",
        "lat": 7.9101,
        "lng": -72.4846,
        "radio_km": 12,
        "disponible": False,
        "calificacion": 5.0,
        "num_contratos": 5
    },
    {
        "codigo": "SERV-04",
        "prestador_id": "USR-002",
        "prestador_nombre": "Jorge Mendoza",
        "categoria": "Cerrajeria",
        "descripcion": "Apertura de puertas, cambio de chapas y cerraduras",
        "tarifa_hora": 38000.0,
        "ciudad": "Cucuta",
        "zona": "Centro",
        "lat": 7.8918,
        "lng": -72.5079,
        "radio_km": 10,
        "disponible": True,
        "calificacion": 4.7,
        "num_contratos": 15
    },
    {
        "codigo": "SERV-05",
        "prestador_id": "USR-002",
        "prestador_nombre": "Sandra Rios",
        "categoria": "Limpieza",
        "descripcion": "Limpieza profunda de hogares y oficinas",
        "tarifa_hora": 25000.0,
        "ciudad": "Cucuta",
        "zona": "Atalaya",
        "lat": 7.8752,
        "lng": -72.5368,
        "radio_km": 8,
        "disponible": True,
        "calificacion": 4.3,
        "num_contratos": 20
    },
    {
        "codigo": "SERV-07",
        "prestador_id": "USR-010",
        "prestador_nombre": "Valentina Ruiz",
        "categoria": "Belleza",
        "descripcion": "Corte de cabello y barba, cepillado, manicure y pedicure a domicilio",
        "tarifa_hora": 30000.0,
        "ciudad": "Cucuta",
        "zona": "Quinta Oriental",
        "lat": 7.8872,
        "lng": -72.4948,
        "radio_km": 8,
        "disponible": True,
        "calificacion": 4.9,
        "num_contratos": 18
    }
]

contratos = [
    {
        "id": "CONTR-101",
        "cliente_id": "USR-001",
        "cliente_nombre": "Juan Perez",
        "servicio_codigo": "SERV-01",
        "servicio_nombre": "Electricidad - Carlos Gomez",
        "horas": 5,
        "tarifa_hora": 35000.0,
        "total": 208250.0,      # Tarifa base ($175,000) + 19% IVA ($33,250)
        "estado": "Completado",
        "calificacion": 4.8,
        "comentario": "Excelente trabajo, muy puntual"
    }
]

calificaciones = [
    {
        "id": "CALIF-001",
        "contrato_id": "CONTR-101",
        "cliente_nombre": "Juan Perez",
        "servicio_codigo": "SERV-01",
        "puntuacion": 4.8,
        "comentario": "Excelente trabajo, muy puntual",
        "fecha": "18/09/2026"
    }
]


# ========================================================================================
# [SEMANA 9 - MATRICES EN PYTHON: ACTIVIDAD 1 - IMPLEMENTACION DE MATRICES]
# Una matriz es una estructura bidimensional que en Python se representa como una lista
# que contiene otras listas (filas y columnas).
# ========================================================================================

# MATRIZ 1: Ventas Semanales por Categoria y Dia (5 filas x 6 columnas)
# Filas: CATEGORIAS_MATRIZ (Electricidad, Plomeria, Limpieza, Climatizacion, Cerrajeria)
# Columnas: DIAS_SEMANA_MATRIZ (Lunes, Martes, Miercoles, Jueves, Viernes, Sabado)
# Valores: Facturacion en pesos colombianos (COP)
matriz_ventas_semanales = [
    #  Lunes     Martes    Miercoles   Jueves    Viernes    Sabado
    [350000.0, 420000.0, 280000.0, 510000.0, 600000.0, 450000.0],  # Fila 0: Electricidad
    [280000.0, 310000.0, 390000.0, 250000.0, 480000.0, 320000.0],  # Fila 1: Plomeria
    [180000.0, 220000.0, 250000.0, 290000.0, 380000.0, 420000.0],  # Fila 2: Limpieza
    [450000.0, 520000.0, 380000.0, 490000.0, 650000.0, 710000.0],  # Fila 3: Climatizacion
    [220000.0, 190000.0, 260000.0, 310000.0, 410000.0, 300000.0]   # Fila 4: Cerrajeria
]

# MATRIZ 2: Demanda y Ventas por Categoria y Ciudad (5 filas x 5 columnas -> MATRIZ CUADRADA)
# Filas: CATEGORIAS_MATRIZ (5 categorias)
# Columnas: CIUDADES_COBERTURA (Cucuta, Cali, Bogota, Medellin, Bucaramanga)
# Cumple el concepto 1.6 de la Guia 9: Igual numero de filas y columnas (5x5).
matriz_ventas_ciudades = [
    #  Cucuta     Cali      Bogota    Medellin  Bucaramanga
    [450000.0, 380000.0, 850000.0, 720000.0, 210000.0],  # Fila 0: Electricidad
    [320000.0, 290000.0, 640000.0, 510000.0, 180000.0],  # Fila 1: Plomeria
    [250000.0, 210000.0, 490000.0, 430000.0, 160000.0],  # Fila 2: Limpieza
    [580000.0, 620000.0, 950000.0, 890000.0, 310000.0],  # Fila 3: Climatizacion
    [290000.0, 240000.0, 530000.0, 470000.0, 150000.0]   # Fila 4: Cerrajeria
]


# ========================================================================================
# [SEMANA 9 - ACTIVIDAD 2]: REGISTRO Y CONSULTA DE INFORMACION EN LA MATRIZ
# ========================================================================================

def consultar_celda(matriz, fila_idx, col_idx):
    """
    [SEMANA 9 - CONCEPTO 1.2]: Acceso a un elemento especifico: matriz[fila][columna].
    Retorna el valor almacenado en la coordenada dada.
    """
    return matriz[fila_idx][col_idx]


def modificar_celda(matriz, fila_idx, col_idx, nuevo_valor):
    """
    [SEMANA 9 - CONCEPTO 1.2]: Modificacion de un valor: matriz[fila][columna] = nuevo_valor.
    Actualiza la celda y retorna True si la operacion fue exitosa.
    """
    if fila_idx < 0 or fila_idx >= len(matriz):
        return False
    if col_idx < 0 or col_idx >= len(matriz[fila_idx]):
        return False
    matriz[fila_idx][col_idx] = float(nuevo_valor)
    return True


def obtener_copia_matriz(matriz):
    """Crea una copia profunda de una matriz bidimensional."""
    return [fila[:] for fila in matriz]


# ========================================================================================
# CONTROL DE SESION EN MEMORIA
# ========================================================================================

_usuario_sesion = None


def get_sesion_actual():
    """Retorna el usuario con sesion iniciada actualmente o None."""
    global _usuario_sesion
    return _usuario_sesion


def set_sesion_actual(usuario):
    """Establece el usuario con sesion iniciada."""
    global _usuario_sesion
    _usuario_sesion = usuario


def limpiar_sesion():
    """Cierra la sesion activa restaurando el valor a None."""
    global _usuario_sesion
    _usuario_sesion = None
