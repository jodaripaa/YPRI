"""
========================================================================================
SISTEMA YPRI - PLATAFORMA DE SERVICIOS A DOMICILIO
Modulo: Catalogo de Palabras Clave (busqueda rapida por necesidad)
========================================================================================
Asignatura: Diseño Funcional | Unidad 2: Estructuras de Datos
Institucion: Fundacion de Estudios Superiores Comfanorte (FESC) - 2026
Integrantes: Jann Pierre Ortiz Zambrano y Josue David Rincon Palomino
========================================================================================
DESCRIPCION:
Permite que el cliente escriba lo que le pasa ("se me quedaron las llaves adentro",
"se fue la luz", "necesito un plomero") y encuentra el oficio correcto. Tolera tildes,
mayusculas y errores de escritura ("electrisista").

FUNCIONES CON RETORNO:
    1. normalizar(texto) -> str
    2. distancia_edicion(a, b) -> int
    3. detectar_categorias(texto) -> list
    4. interpretar_necesidad(texto) -> dict | None
    5. parece_urgente(texto) -> bool

El mismo catalogo existe en web/lib/palabrasClave.ts.
========================================================================================
"""

import unicodedata

# Diccionario: categoria -> tupla de palabras y frases (minusculas, sin tildes).
PALABRAS_CLAVE = {
    "Electricidad": (
        "electricista", "electrico", "electrica", "electricidad", "luz", "sin luz", "se fue la luz", "no hay luz", "apagon",
        "corto", "cortocircuito", "chispa", "chisporrotea", "toma", "tomacorriente", "enchufe", "interruptor", "suiche",
        "breaker", "taco", "se bajo el taco", "tablero", "bombillo", "foco", "lampara", "cableado", "cable", "cables",
        "instalacion electrica", "voltaje", "contador de luz", "medidor", "ducha electrica", "timbre", "reflector", "planta electrica",
    ),
    "Plomeria": (
        "plomero", "plomeria", "fontanero", "fontaneria", "fuga", "fuga de agua", "gotera", "goteo", "gotea", "escape de agua",
        "tuberia", "tubo", "tubos", "grifo", "llave de agua", "llave del lavaplatos", "llave de la ducha", "lavamanos", "lavaplatos",
        "sanitario", "inodoro", "taza del bano", "tanque", "ducha", "regadera", "desague", "destapar", "tapado", "tapada",
        "atascado", "caneria", "alcantarilla", "calentador", "humedad", "bomba de agua", "se inundo", "inundacion",
    ),
    "Limpieza": (
        "limpieza", "aseo", "asear", "limpiar", "empleada", "empleada domestica", "senora del aseo", "servicio domestico",
        "domestica", "barrer", "trapear", "desinfeccion", "desinfectar", "lavar", "planchar", "limpieza profunda", "mudanza",
        "post obra", "despues de obra", "vidrios", "ventanas", "alfombra", "tapete", "muebles", "sofa", "colchon", "cocina",
        "oficina", "polvo", "organizar",
    ),
    "Climatizacion": (
        "aire", "aire acondicionado", "aires", "acondicionado", "minisplit", "mini split", "split", "no enfria", "no prende el aire",
        "calor", "refrigeracion", "ventilador", "climatizacion", "tecnico de aires", "recarga de gas", "gas refrigerante",
        "mantenimiento de aire", "condensador", "evaporador", "nevera", "refrigerador", "congelador", "gotea el aire",
    ),
    "Cerrajeria": (
        "cerrajero", "cerrajeria", "llave", "llaves", "llaves adentro", "llaves por dentro", "deje las llaves", "perdi las llaves",
        "me quede por fuera", "quede por fuera", "quede afuera", "me quede afuera", "encerrado", "encerrada", "puerta",
        "no abre la puerta", "chapa", "cerradura", "candado", "guarda", "cambio de guarda", "copia de llave", "duplicado",
        "caja fuerte", "no abre", "forzar", "pasador", "cerrojo", "seguridad",
    ),
    "Belleza": (
        "barbero", "barbera", "barberia", "peluquero", "peluquera", "peluqueria", "estilista", "salon de belleza", "belleza",
        "corte de pelo", "corte de cabello", "corte de barba", "cortarme el pelo", "cortar el pelo", "motilar", "motilada",
        "motilado", "motilarme", "pelo", "cabello", "barba", "afeitar", "afeitada", "bigote", "tinte", "tintura", "mechas",
        "cepillado", "alisado", "keratina", "peinado", "trenzas", "manicure", "manicurista", "pedicure", "las unas",
        "arreglo de unas", "unas acrilicas", "pintar las unas", "maquillaje", "maquillarme", "maquilladora", "cejas",
        "depilacion", "depilar", "pestanas", "spa", "masaje",
    ),
}

PALABRAS_URGENCIA = (
    "urgente", "urgencia", "ya", "ahora", "ahorita", "inmediato", "inmediata", "emergencia", "rapido", "auxilio", "ayuda",
    "lo antes posible", "cuanto antes", "encerrado", "encerrada", "me quede por fuera", "quede por fuera", "se inundo", "inundacion",
    "cortocircuito", "chispa", "sin luz",
)


def normalizar(texto):
    """Minusculas, sin tildes ni signos y con espacios simples."""
    sin_tildes = unicodedata.normalize("NFD", texto.lower())
    sin_tildes = "".join(c for c in sin_tildes if unicodedata.category(c) != "Mn")
    limpio = "".join(c if c.isalnum() else " " for c in sin_tildes)
    return " ".join(limpio.split())


def distancia_edicion(a, b):
    """Cuantas letras hay que cambiar, agregar o quitar para pasar de 'a' a 'b' (Levenshtein)."""
    if a == b:
        return 0
    fila = list(range(len(b) + 1))
    for i in range(1, len(a) + 1):
        anterior, fila[0] = fila[0], i
        for j in range(1, len(b) + 1):
            temporal = fila[j]
            fila[j] = min(fila[j] + 1, fila[j - 1] + 1, anterior + (0 if a[i - 1] == b[j - 1] else 1))
            anterior = temporal
    return fila[len(b)]


def _palabras_parecidas(escrita, clave):
    if len(escrita) < 4 or len(clave) < 4:
        return False
    if clave.startswith(escrita) or escrita.startswith(clave):
        return True
    tolerancia = 2 if len(clave) >= 8 else (1 if len(clave) >= 5 else 0)
    return (tolerancia > 0 and abs(len(escrita) - len(clave)) <= tolerancia
            and distancia_edicion(escrita, clave) <= tolerancia)


def detectar_categorias(texto):
    """
    Lista de categorias posibles, de la mas probable a la menos probable.
    Cada elemento: {"categoria", "puntaje", "coincidencia"}. Una frase exacta pesa
    mas que una palabra suelta, asi "llave de agua" es plomeria y "llave" cerrajeria.
    """
    limpio = normalizar(texto)
    if not limpio:
        return []
    con_espacios = f" {limpio} "
    palabras = limpio.split()
    resultados = []
    for categoria, claves in PALABRAS_CLAVE.items():
        puntaje = 0
        mejor_clave, mejor_peso = "", 0
        for clave in claves:
            n_palabras = len(clave.split())
            peso = 0
            if f" {clave} " in con_espacios:
                peso = n_palabras * 3
            elif n_palabras == 1 and any(_palabras_parecidas(p, clave) for p in palabras):
                peso = 1
            puntaje += peso
            if peso > mejor_peso:
                mejor_clave, mejor_peso = clave, peso
        if puntaje > 0:
            resultados.append({"categoria": categoria, "puntaje": puntaje, "coincidencia": mejor_clave})
    return sorted(resultados, key=lambda r: -r["puntaje"])


def interpretar_necesidad(texto):
    """La categoria mas probable o None si el texto no se parece a ningun oficio."""
    categorias = detectar_categorias(texto)
    return categorias[0] if categorias else None


def parece_urgente(texto):
    """True si el texto sugiere una emergencia o que se necesita a alguien ya."""
    con_espacios = f" {normalizar(texto)} "
    return any(f" {p} " in con_espacios for p in PALABRAS_URGENCIA)
