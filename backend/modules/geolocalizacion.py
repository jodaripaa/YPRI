"""
========================================================================================
SISTEMA YPRI - PLATAFORMA DE SERVICIOS A DOMICILIO
Modulo: Geolocalizacion y Georreferenciacion (profesionales cercanos)
========================================================================================
Asignatura: Diseño Funcional | Unidad 2: Estructuras de Datos
Institucion: Fundacion de Estudios Superiores Comfanorte (FESC) - 2026
Integrantes: Jann Pierre Ortiz Zambrano y Josue David Rincon Palomino
========================================================================================
DESCRIPCION:
Encuentra a los profesionales mas cercanos al cliente, al estilo de las aplicaciones
de domicilios (Uber, inDrive, Rappi). Cada servicio tiene un punto base (barrio,
latitud y longitud) y un radio de atencion en kilometros.

FUNCIONES CON RETORNO (subalgoritmos, Guia 10):
    1. distancia_haversine(lat1, lng1, lat2, lng2) -> float
    2. distancia_ruta_km(lat1, lng1, lat2, lng2) -> float
    3. tiempo_llegada_min(lat1, lng1, lat2, lng2) -> int
    4. interpolar_posicion(origen, destino, progreso) -> tuple
    5. calcular_cercania(servicio, lat, lng) -> dict
    6. buscar_servicios_cercanos(servicios, lat, lng, ...) -> list
    7. profesional_mas_cercano(servicios, lat, lng, categoria) -> dict | None
    8. simular_seguimiento(origen, destino, transcurrido_seg, duracion_seg) -> dict
    9. barrio_mas_cercano(lat, lng) -> tuple
   10. posicion_actual(servicio, contratos) -> dict
   11. candidatos_pedido_inmediato(servicios, contratos, lat, lng, categoria) -> dict
PROCEDIMIENTOS (sin retorno):
    * mostrar_servicios_cercanos(resultados, etiqueta_origen)
    * menu_geolocalizacion_interactivo()

Las mismas formulas existen en web/lib/geo.ts y web/lib/domain/cercania.ts para que
la aplicacion web y la de consola calculen exactamente lo mismo.
========================================================================================
"""

import math

# ----------------------------------------------------------------------------------------
# CONSTANTES (tuplas y diccionarios de solo lectura)
# ----------------------------------------------------------------------------------------

RADIO_TIERRA_KM = 6371
VELOCIDAD_URBANA_KMH = 24
MINUTOS_ALISTAMIENTO = 5
# Las calles no son rectas: la ruta real es aproximadamente 30 % mas larga.
FACTOR_RUTA = 1.3
RADIO_COBERTURA_KM = 10

# Centro de referencia de cada ciudad con cobertura: (latitud, longitud).
CENTRO_CIUDAD = {
    "Cucuta": (7.8891, -72.5050),
    "Cali": (3.4516, -76.5320),
    "Bogota": (4.5981, -74.0758),
    "Medellin": (6.2518, -75.5636),
    "Bucaramanga": (7.1193, -73.1227),
}

# Barrios de prueba de Cucuta para simular la ubicacion del cliente.
BARRIOS_CUCUTA = (
    ("Centro", 7.8891, -72.5050),
    ("La Playa", 7.8935, -72.4995),
    ("Caobos", 7.9035, -72.4940),
    ("Quinta Oriental", 7.8858, -72.4925),
    ("Prados del Este", 7.9085, -72.4820),
    ("San Luis", 7.8705, -72.4870),
    ("El Contento", 7.8920, -72.5140),
    ("La Libertad", 7.8820, -72.5225),
    ("Atalaya", 7.8775, -72.5395),
)


# ----------------------------------------------------------------------------------------
# FUNCIONES CON RETORNO
# ----------------------------------------------------------------------------------------

def distancia_haversine(lat1, lng1, lat2, lng2):
    """
    Distancia en kilometros entre dos coordenadas sobre la superficie terrestre
    (formula de Haversine). Recibe grados decimales y retorna un float.
    """
    d_lat = math.radians(lat2 - lat1)
    d_lng = math.radians(lng2 - lng1)
    h = (math.sin(d_lat / 2) ** 2
         + math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(d_lng / 2) ** 2)
    return 2 * RADIO_TIERRA_KM * math.asin(min(1.0, math.sqrt(h)))


def distancia_ruta_km(lat1, lng1, lat2, lng2):
    """Distancia estimada por calles a partir de la linea recta."""
    return distancia_haversine(lat1, lng1, lat2, lng2) * FACTOR_RUTA


def tiempo_llegada_min(lat1, lng1, lat2, lng2, velocidad_kmh=VELOCIDAD_URBANA_KMH,
                       alistamiento_min=MINUTOS_ALISTAMIENTO):
    """Minutos estimados de llegada: alistamiento + recorrido por calles (redondeo hacia arriba)."""
    recorrido = distancia_ruta_km(lat1, lng1, lat2, lng2) / velocidad_kmh * 60
    return math.ceil(alistamiento_min + recorrido)


def interpolar_posicion(origen, destino, progreso):
    """Punto intermedio de un trayecto recto. progreso: 0 = origen, 1 = destino."""
    t = min(1.0, max(0.0, progreso))
    return (origen[0] + (destino[0] - origen[0]) * t,
            origen[1] + (destino[1] - origen[1]) * t)


def calcular_cercania(servicio, lat, lng):
    """Distancia, tiempo de llegada y cobertura de un servicio respecto al cliente."""
    distancia = distancia_haversine(servicio["lat"], servicio["lng"], lat, lng)
    return {
        "servicio": servicio,
        "distancia_km": distancia,
        "minutos": tiempo_llegada_min(servicio["lat"], servicio["lng"], lat, lng),
        "en_cobertura": distancia <= servicio.get("radio_km", RADIO_COBERTURA_KM),
    }


def buscar_servicios_cercanos(servicios, lat, lng, solo_disponibles=False, categoria=None,
                              radio_max_km=None, solo_en_cobertura=True):
    """
    Lista de servicios ordenada del mas cercano al mas lejano. Por defecto solo
    incluye a quienes atienden en la ubicacion del cliente (dentro de su radio).
    """
    resultados = []
    for servicio in servicios:
        if "lat" not in servicio or "lng" not in servicio:
            continue
        if solo_disponibles and not servicio["disponible"]:
            continue
        if categoria and servicio["categoria"] != categoria:
            continue
        cercania = calcular_cercania(servicio, lat, lng)
        if solo_en_cobertura and not cercania["en_cobertura"]:
            continue
        if radio_max_km is not None and cercania["distancia_km"] > radio_max_km:
            continue
        resultados.append(cercania)
    return sorted(resultados, key=lambda c: (c["distancia_km"], -c["servicio"]["calificacion"]))


def profesional_mas_cercano(servicios, lat, lng, categoria=None):
    """El profesional disponible mas cercano que atiende al cliente, o None."""
    cercanos = buscar_servicios_cercanos(servicios, lat, lng, solo_disponibles=True, categoria=categoria)
    return cercanos[0] if cercanos else None


def simular_seguimiento(origen, destino, transcurrido_seg, duracion_seg):
    """
    Simula el recorrido del profesional hacia el cliente ("en camino").
    Retorna la posicion actual, el progreso y los minutos restantes estimados.
    """
    progreso = 1.0 if duracion_seg <= 0 else min(1.0, max(0.0, transcurrido_seg / duracion_seg))
    posicion = interpolar_posicion(origen, destino, progreso)
    llego = progreso >= 1.0
    total = tiempo_llegada_min(origen[0], origen[1], destino[0], destino[1])
    return {
        "posicion": posicion,
        "progreso": progreso,
        "llego": llego,
        "distancia_restante_km": distancia_haversine(posicion[0], posicion[1], destino[0], destino[1]),
        "minutos_restantes": 0 if llego else max(1, math.ceil(total * (1 - progreso))),
    }


def barrio_mas_cercano(lat, lng):
    """Barrio de prueba de Cucuta mas cercano a un punto: (nombre, lat, lng)."""
    return min(BARRIOS_CUCUTA, key=lambda b: distancia_haversine(b[1], b[2], lat, lng))


def posicion_actual(servicio, contratos):
    """
    Donde esta el operario ahora: si atiende un servicio "En proceso" con ubicacion
    conocida, es ese lugar; si no, su barrio base.
    """
    for contrato in contratos:
        mismo_operario = (contrato.get("servicio_codigo") == servicio["codigo"]
                          or contrato.get("prestador_id") == servicio["prestador_id"])
        if mismo_operario and contrato.get("estado") == "En proceso" and "lat" in contrato and "lng" in contrato:
            return {
                "lat": contrato["lat"],
                "lng": contrato["lng"],
                "en_servicio": True,
                "contrato_id": contrato["id"],
                "zona_referencia": barrio_mas_cercano(contrato["lat"], contrato["lng"])[0],
            }
    return {"lat": servicio["lat"], "lng": servicio["lng"], "en_servicio": False,
            "contrato_id": None, "zona_referencia": servicio.get("zona", "Centro")}


def candidatos_pedido_inmediato(servicios, contratos, lat, lng, categoria):
    """
    Pedido inmediato (estilo Uber): asigna al operario libre que llega antes entre los
    del oficio que atienden al cliente. Los ocupados quedan como alternativa.
    Retorna {"libres": [...], "ocupados": [...], "asignado": dict | None}.
    """
    libres, ocupados = [], []
    for cercania in buscar_servicios_cercanos(servicios, lat, lng, solo_disponibles=True, categoria=categoria):
        posicion = posicion_actual(cercania["servicio"], contratos)
        cercania["posicion"] = posicion
        cercania["distancia_km"] = distancia_haversine(posicion["lat"], posicion["lng"], lat, lng)
        cercania["minutos"] = tiempo_llegada_min(posicion["lat"], posicion["lng"], lat, lng)
        (ocupados if posicion["en_servicio"] else libres).append(cercania)
    orden = lambda c: (c["minutos"], -c["servicio"]["calificacion"])
    libres.sort(key=orden)
    ocupados.sort(key=orden)
    return {"libres": libres, "ocupados": ocupados, "asignado": libres[0] if libres else None}


def formatear_distancia(km):
    """Metros por debajo de 1 km; kilometros con un decimal desde 1 km."""
    if km < 1:
        return f"{max(50, round(km * 1000 / 50) * 50)} m"
    return f"{km:.1f} km".replace(".", ",")


# ----------------------------------------------------------------------------------------
# PROCEDIMIENTOS (presentacion por consola)
# ----------------------------------------------------------------------------------------

def mostrar_servicios_cercanos(resultados, etiqueta_origen):
    """Imprime la tabla de profesionales cercanos. No retorna valor."""
    print(f"\n  Profesionales cerca de: {etiqueta_origen}")
    print("  " + "-" * 78)
    if not resultados:
        print("  No hay profesionales que atiendan en esta ubicacion.")
        return
    print(f"  {'#':<3}{'Profesional':<20}{'Servicio':<15}{'Distancia':>10}{'Llega en':>10}{'Estado':>14}")
    for posicion, r in enumerate(resultados, start=1):
        s = r["servicio"]
        estado = "Disponible" if s["disponible"] else "No disponible"
        print(f"  {posicion:<3}{s['prestador_nombre']:<20}{s['categoria']:<15}"
              f"{formatear_distancia(r['distancia_km']):>10}{str(r['minutos']) + ' min':>10}{estado:>14}")
    print("  " + "-" * 78)


def menu_geolocalizacion_interactivo():
    """
    Menu de consola: el cliente elige su barrio (ubicacion simulada), escribe lo que
    necesita y ve a los profesionales mas cercanos de ese oficio.
    """
    from data.database import servicios, contratos
    from modules.palabras_clave import interpretar_necesidad, parece_urgente

    while True:
        print("\n  PROFESIONALES CERCA DE MI (Geolocalizacion)")
        for indice, (nombre, _, _) in enumerate(BARRIOS_CUCUTA, start=1):
            print(f"  {indice}. {nombre}")
        print("  0. Volver")
        opcion = input("  Elija su barrio (simulacion de ubicacion): ").strip()
        if opcion == "0":
            break
        if not opcion.isdigit() or not 1 <= int(opcion) <= len(BARRIOS_CUCUTA):
            print("\n[!] Opcion invalida.")
            continue
        nombre, lat, lng = BARRIOS_CUCUTA[int(opcion) - 1]

        necesidad = input("  ¿Que necesita? (ej: se me quedaron las llaves adentro; Enter para ver todos): ").strip()
        detectada = interpretar_necesidad(necesidad) if necesidad else None
        if necesidad and not detectada:
            print("  No reconocimos el oficio; se muestran todos los profesionales cercanos.")
        categoria = detectada["categoria"] if detectada else None
        if detectada:
            print(f"  Oficio detectado: {categoria} (por '{detectada['coincidencia']}').")

        resultados = buscar_servicios_cercanos(servicios, lat, lng, categoria=categoria)
        mostrar_servicios_cercanos(resultados, f"{nombre}, Cucuta")

        if categoria and parece_urgente(necesidad):
            pedido = candidatos_pedido_inmediato(servicios, contratos, lat, lng, categoria)
            if pedido["asignado"]:
                s = pedido["asignado"]["servicio"]
                print(f"  PEDIDO INMEDIATO: asignado a {s['prestador_nombre']}, "
                      f"llega en unos {pedido['asignado']['minutos']} minutos.")
            else:
                print("  PEDIDO INMEDIATO: no hay operarios libres de ese oficio cerca en este momento.")
        else:
            mas_cercano = profesional_mas_cercano(servicios, lat, lng, categoria)
            if mas_cercano:
                s = mas_cercano["servicio"]
                print(f"  Mas cercano disponible: {s['prestador_nombre']} ({s['categoria']}), "
                      f"llega en unos {mas_cercano['minutos']} minutos.")
