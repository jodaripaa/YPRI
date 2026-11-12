"""
========================================================================================
SISTEMA YPRI - PLATAFORMA DE SERVICIOS A DOMICILIO
Modulo: Administracion, Auditoria y Metricas del Sistema
========================================================================================
DOCUMENTACION DE TEMAS POR SEMANAS:
- [SEMANAS 5 Y 6]: Filtros con ciclos for y comprensiones con condicionales 'if'.
- [SEMANA 7 - TUPLAS, CADENAS Y DICCIONARIOS]:
  * Acceso estructurado a atributos de diccionarios (u['id'], u['nombre'], etc.).
  * Tuplas de configuracion inmutable del sistema (ROLES_SISTEMA, CIUDADES_COBERTURA).
- [SEMANA 8 - VECTORES]:
  * Recorrido y auditoria global de los vectores usuarios[], servicios[] y contratos[].
  * Medicion con len() y calculo de agregaciones sobre atributos de vectores.
- [SEMANA 9 - MATRICES EN PYTHON]:
  * Integracion del modulo de matrices en las metricas operativas y financieras del admin.
  * Reporte ejecutivo que articula el total general y categoria lider desde la matriz.
========================================================================================
"""

from core.constantes import (
    ROLES_SISTEMA,
    CATEGORIAS_MATRIZ,
    ESTADOS_CONTRATO,
    CIUDADES_COBERTURA,
    DIAS_SEMANA_MATRIZ,
)
from core.validaciones import separador, mostrar_encabezado
from data.database import (
    usuarios,
    servicios,
    contratos,
    calificaciones,
    matriz_ventas_semanales,
    matriz_ventas_ciudades,
    get_sesion_actual,
)
from modules.matrices import (
    calcular_total_general,
    calcular_promedio_general,
    analizar_rendimiento_matriz,
    mostrar_matriz_tabulada,
)


def listar_usuarios():
    """
    [SEMANA 8 - RECORRIDO DE VECTORES]
    Lista todos los usuarios registrados en el sistema en formato tabular.
    Disponible exclusivamente para administradores.
    """
    mostrar_encabezado("GESTION DE USUARIOS")
    print()

    usuario_actual = get_sesion_actual()
    if not usuario_actual or usuario_actual["rol"] != "admin":
        print("[!] Acceso denegado: se requieren permisos de administrador.")
        return

    print(f"{'ID':<10}{'Nombre':<22}{'Correo':<28}{'Rol':<12}{'Ciudad'}")
    separador()

    for u in usuarios:
        print(f"{u['id']:<10}{u['nombre']:<22}{u['correo']:<28}{u['rol']:<12}{u['ciudad']}")

    separador()
    print(f"Total de usuarios registrados en el vector: {len(usuarios)}")


def ver_estadisticas():
    """
    [SEMANAS 7 A 9]:
    Genera un informe consolidado con las metricas operativas y financieras del sistema.
    Integra vectores unidimensionales y matrices bidimensionales (Guia 9).
    """
    mostrar_encabezado("ESTADISTICAS DEL SISTEMA")
    print()

    usuario_actual = get_sesion_actual()
    if not usuario_actual or usuario_actual["rol"] != "admin":
        print("[!] Acceso denegado: se requieren permisos de administrador.")
        return

    # Metricas calculadas sobre vectores unidimensionales (Semana 8)
    total_clientes = sum(1 for u in usuarios if u["rol"] == "cliente")
    total_prestadores = sum(1 for u in usuarios if u["rol"] == "prestador")
    servicios_activos = sum(1 for s in servicios if s["disponible"])
    contratos_completados = sum(1 for c in contratos if c["estado"] == "Completado")
    contratos_pendientes = sum(1 for c in contratos if c["estado"] == "Pendiente")
    ingresos_contratos = sum(c["total"] for c in contratos if c["estado"] == "Completado")

    # Metricas calculadas sobre matrices bidimensionales (Semana 9 - Guia 9)
    total_matriz_semanal = calcular_total_general(matriz_ventas_semanales)
    promedio_matriz = calcular_promedio_general(matriz_ventas_semanales)
    analisis = analizar_rendimiento_matriz(matriz_ventas_semanales, CATEGORIAS_MATRIZ, DIAS_SEMANA_MATRIZ)

    print(f"  USUARIOS (Vector usuarios[])")
    print(f"    Total registrados: {len(usuarios)}")
    print(f"    Clientes:          {total_clientes}")
    print(f"    Prestadores:       {total_prestadores}")
    print()
    print(f"  SERVICIOS (Vector servicios[])")
    print(f"    Total publicados:  {len(servicios)}")
    print(f"    Con disp. activa:  {servicios_activos}")
    print()
    print(f"  CONTRATOS (Vector contratos[])")
    print(f"    Total acuerdos:    {len(contratos)}")
    print(f"    Completados:       {contratos_completados}")
    print(f"    Pendientes:        {contratos_pendientes}")
    print(f"    Ingresos contratos:${ingresos_contratos:>12,.2f} COP")
    print()
    print(f"  MATRICES ANALITICAS (Guia 9 — Matriz Ventas Semanales 5x6)")
    print(f"    Facturacion total: ${total_matriz_semanal:>12,.2f} COP")
    print(f"    Promedio por celda:${promedio_matriz:>12,.2f} COP")
    print(f"    Categoria lider:   {analisis['categoria_lider']} (${analisis['categoria_lider_total']:,.0f} COP)")
    print(f"    Dia mas productivo:{analisis['columna_lider']} (${analisis['columna_lider_total']:,.0f} COP)")
    print(f"    Venta individual record: ${analisis['celda_record_valor']:,.0f} COP")
    separador()


def ver_reporte_matricial_admin():
    """
    [SEMANA 9 - ACTIVIDAD 5]: Vista administrativa detallada de las matrices del sistema.
    """
    mostrar_encabezado("AUDITORIA Y CONTROL DE MATRICES — ADMIN")
    print()
    mostrar_matriz_tabulada(
        matriz_ventas_semanales,
        CATEGORIAS_MATRIZ,
        DIAS_SEMANA_MATRIZ,
        "MATRIZ 1: FACTURACION SEMANAL POR CATEGORIA (5x6)"
    )
    print()
    mostrar_matriz_tabulada(
        matriz_ventas_ciudades,
        CATEGORIAS_MATRIZ,
        CIUDADES_COBERTURA,
        "MATRIZ 2: MATRIZ CUADRADA DE COBERTURA Y DEMANDA (5x5)"
    )
