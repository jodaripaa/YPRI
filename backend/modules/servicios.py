"""
========================================================================================
SISTEMA YPRI - PLATAFORMA DE SERVICIOS A DOMICILIO
Modulo: Catalogo, Publicacion, Busqueda y Modificacion de Servicios
========================================================================================
DOCUMENTACION DE TEMAS POR SEMANAS:
- [SEMANAS 5 Y 6 - CICLOS Y VALIDACIONES]:
  * Recorrido con enumerate(coleccion), omision con sentencia 'continue',
    bucles defensivos con try-except en captura de datos.
- [SEMANA 7 - TUPLAS, CADENAS Y DICCIONARIOS]:
  * Normalizacion de cadenas (.strip(), .title(), .lower()).
  * Diccionarios mutables que almacenan cada registro de servicio.
  * Tuplas inmutables (CATEGORIAS_SERVICIO, CIUDADES_COBERTURA).
- [SEMANA 8 - VECTORES EN PYTHON]:
  * Actividades 1 y 2: Vector unidimensional de servicios (lista de diccionarios).
  * Actividad 3: Recorrido secuencial de vector con ciclo for y medicion len().
  * Actividad 4: Ordenamiento ascendente con sorted() y funcion lambda.
  * Actividad 5: Ordenamiento descendente con sorted(..., reverse=True).
  * Actividad 6: Busqueda secuencial por identificador unico ('codigo').
  * Actividad 7: Busqueda secuencial por otros atributos (coincidencias multiples).
  * Actividad 8: Integracion de busqueda y ordenamiento en menu interactivo.
  * Actividad 13: Reto de integracion (minimo, maximo, promedio y ranking Top 3).
- [SEMANA 9 - MATRICES EN PYTHON]:
  * Los servicios y sus categorias constituyen las filas analiticas de las matrices de YPRI.
========================================================================================
"""

from core.validaciones import (
    separador,
    mostrar_encabezado,
    pedir_sn,
    pedir_float,
    pedir_entero,
    pedir_categoria,
    pedir_ciudad,
    pedir_texto_minimo,
    pedir_id_registro,
    generar_id,
)
from data.database import servicios, get_sesion_actual
from modules.geolocalizacion import CENTRO_CIUDAD, RADIO_COBERTURA_KM


# ========================================================================================
# GUIA 8 - ACTIVIDAD 3: RECORRIDO DE VECTORES
# Recorrido secuencial utilizando ciclo for sobre la lista (vector) de diccionarios.
# YA SE CUMPLIA DESDE GUIAS ANTERIORES. Se documenta formalmente para Guia 8.
# ========================================================================================

def listar_servicios(filtro_ciudad=None, filtro_categoria=None, solo_disponibles=False, lista_personalizada=None):
    """
    GUIA 8 - ACTIVIDAD 3: Recorrido de vectores.
    Recorre la lista de diccionarios de servicios y muestra la informacion tabular.
    Aplica filtros opcionales utilizando la instruccion 'continue' para omitir elementos.
    Puede recibir una lista ordenada o filtrada (lista_personalizada).
    """
    mostrar_encabezado("CATALOGO DE SERVICIOS YPRI")
    print()

    # GUIA 8: Determinar el vector a recorrer (el principal o uno ordenado/filtrado)
    coleccion = lista_personalizada if lista_personalizada is not None else servicios

    # GUIA 8 - ACTIVIDAD 9: Informar claramente si la coleccion esta vacia
    if not coleccion:
        print("  [!] No existen registros de servicios para mostrar.")
        separador()
        return

    if filtro_ciudad:
        print(f"  Filtro por ciudad: {filtro_ciudad}")
    if filtro_categoria:
        print(f"  Filtro por categoria: {filtro_categoria}")
    if solo_disponibles:
        print("  Mostrando unicamente servicios con disponibilidad inmediata")
    print()

    print(f"{'No.':<4}{'Codigo':<10}{'Prestador':<20}{'Categoria':<16}{'Tarifa/h':>12}  {'Disp.':<7}{'Rating'}")
    separador()

    mostrados = 0
    # GUIA 8 - ACTIVIDAD 3: Recorrido secuencial de vector con for
    for i, serv in enumerate(coleccion):
        # Filtros con instruccion continue (Guia 6 existente)
        if solo_disponibles and not serv["disponible"]:
            continue
        if filtro_ciudad and serv["ciudad"].lower() != filtro_ciudad.lower():
            continue
        if filtro_categoria and serv["categoria"].lower() != filtro_categoria.lower():
            continue

        disp = "Si" if serv["disponible"] else "No"
        print(
            f"{i+1:<4}{serv['codigo']:<10}{serv['prestador_nombre']:<20}"
            f"{serv['categoria']:<16}${serv['tarifa_hora']:>10,.0f}  {disp:<7}{serv['calificacion']:.1f}*"
        )
        mostrados += 1

    separador()
    # GUIA 8 - ACTIVIDAD 9: Informar cantidad de coincidencias
    print(f"Servicios mostrados: {mostrados} de {len(coleccion)} en la vista actual.")


# ========================================================================================
# GUIA 8 - ACTIVIDAD 4: ORDENAMIENTO ASCENDENTE
# Utiliza sorted() con funcion lambda para ordenar el vector por un atributo de menor a mayor.
# ========================================================================================

def ordenar_servicios_ascendente(criterio="tarifa_hora"):
    """
    GUIA 8 - ACTIVIDAD 4: Ordenamiento ascendente de un vector de diccionarios.
    Criterios admitidos: 'tarifa_hora' (precio de menor a mayor), 'calificacion', 'codigo'.
    Retorna un nuevo vector ordenado sin alterar la lista original.
    """
    # GUIA 8: sorted() con key=lambda para ordenar por clave de diccionario
    servicios_ordenados = sorted(
        servicios,
        key=lambda s: s.get(criterio, 0)
    )
    return servicios_ordenados


# ========================================================================================
# GUIA 8 - ACTIVIDAD 5: ORDENAMIENTO DESCENDENTE
# Utiliza sorted() con reverse=True para ordenar el vector por un atributo de mayor a menor.
# ========================================================================================

def ordenar_servicios_descendente(criterio="tarifa_hora"):
    """
    GUIA 8 - ACTIVIDAD 5: Ordenamiento descendente de un vector de diccionarios.
    Criterios admitidos: 'tarifa_hora' (precio de mayor a menor), 'calificacion' (mejor calificados).
    Retorna un nuevo vector ordenado en sentido inverso.
    """
    # GUIA 8: sorted() con reverse=True
    servicios_ordenados = sorted(
        servicios,
        key=lambda s: s.get(criterio, 0),
        reverse=True
    )
    return servicios_ordenados


# ========================================================================================
# GUIA 8 - ACTIVIDAD 6: BUSQUEDA SECUENCIAL POR IDENTIFICADOR UNICO
# Recorre el vector comparando el codigo de servicio con el valor solicitado.
# YA SE CUMPLIA DESDE GUIAS ANTERIORES. Se documenta formalmente para Guia 8.
# ========================================================================================

def ver_detalle_servicio():
    """
    GUIA 8 - ACTIVIDAD 6: Busqueda secuencial en vector por identificador unico ('codigo').
    1. Solicita el dato a buscar (codigo de servicio).
    2. Recorre el vector secuencialmente con ciclo for.
    3. Compara con == el identificador.
    4. Muestra la informacion si existe coincidencia y termina con break.
    5. Informa si no se encuentra el registro.
    """
    mostrar_encabezado("DETALLE DE SERVICIO")
    print()

    codigo = pedir_id_registro(
        "  Ingrese el codigo del servicio (ej. SERV-01) o '0' para cancelar: ",
        prefijo_esperado="SERV"
    )
    if codigo is None:
        return

    encontrado = False
    # GUIA 8 - ACTIVIDAD 6: Busqueda secuencial elemento por elemento
    for serv in servicios:
        if serv["codigo"] == codigo:
            encontrado = True
            print(f"\n  --- DETALLE DEL SERVICIO ENCONTRADO ---")
            print(f"  Codigo:       {serv['codigo']}")
            print(f"  Prestador:    {serv['prestador_nombre']}")
            print(f"  Categoria:    {serv['categoria']}")
            print(f"  Descripcion:  {serv['descripcion']}")
            print(f"  Tarifa/hora:  ${serv['tarifa_hora']:,.0f} COP")
            print(f"  Ciudad:       {serv['ciudad']}")
            print(f"  Disponible:   {'Si' if serv['disponible'] else 'No'}")
            print(f"  Calificacion: {serv['calificacion']:.1f} *")
            print(f"  Contratos:    {serv['num_contratos']} realizados")
            separador()
            break  # Detiene la busqueda al encontrar el registro unico

    if not encontrado:
        # GUIA 8: Mensaje claro cuando el registro no existe
        print(f"\n[!] No existe un registro con el codigo '{codigo}'.")


# ========================================================================================
# GUIA 8 - ACTIVIDAD 7: BUSQUEDA POR OTROS ATRIBUTOS (COINCIDENCIAS MULTIPLES)
# Recorre el vector buscando coincidencias por categoria, ciudad o texto descriptivo.
# ========================================================================================

def buscar_servicios_por_atributo():
    """
    GUIA 8 - ACTIVIDAD 7: Busqueda secuencial por atributos no unicos.
    A diferencia de la busqueda por identificador, esta operacion puede
    encontrar multiples registros que cumplan con la condicion.
    Aplica operaciones de cadenas (.strip().lower()) para comparaciones insensibles a mayusculas.
    """
    mostrar_encabezado("BUSQUEDA DE SERVICIOS POR ATRIBUTO")
    print()
    print("  Criterios de busqueda disponibles:")
    print("  1. Por Categoria (ej. Electricidad, Plomeria...)")
    print("  2. Por Ciudad (ej. Cucuta, Cali, Bogota...)")
    print("  3. Por Palabra clave en descripcion o nombre del prestador")
    print("  0. Cancelar")
    separador()

    opcion = input("  Seleccione un criterio (0-3): ").strip()
    if opcion == "0":
        return

    coincidencias = []  # GUIA 8: Vector de resultados coincidentes

    if opcion == "1":
        termino = input("  Ingrese la categoria a buscar: ").strip().lower()
        # Busqueda secuencial con filtro de categoria
        for s in servicios:
            if termino in s["categoria"].lower():
                coincidencias.append(s)

    elif opcion == "2":
        termino = input("  Ingrese la ciudad a buscar: ").strip().lower()
        # Busqueda secuencial con filtro de ciudad
        for s in servicios:
            if termino in s["ciudad"].lower():
                coincidencias.append(s)

    elif opcion == "3":
        termino = input("  Ingrese el texto o palabra clave a buscar: ").strip().lower()
        # Busqueda secuencial en multiples campos de texto
        for s in servicios:
            if termino in s["descripcion"].lower() or termino in s["prestador_nombre"].lower():
                coincidencias.append(s)
    else:
        print("\n[!] Opcion invalida.")
        return

    # GUIA 8 - ACTIVIDAD 9: Presentacion clara con cantidad de coincidencias
    if coincidencias:
        print(f"\n[OK] Se encontraron {len(coincidencias)} servicio(s) que coinciden con '{termino}':")
        listar_servicios(lista_personalizada=coincidencias)
    else:
        print(f"\n[!] No se encontraron registros que cumplan con la busqueda: '{termino}'.")


# ========================================================================================
# GUIA 8 - ACTIVIDAD 13: RETO DE INTEGRACION
# Metricas analiticas sobre el vector: menor valor, mayor valor, promedio y top ranking.
# ========================================================================================

def analisis_vector_servicios():
    """
    GUIA 8 - ACTIVIDAD 13: Reto de integracion.
    Procesa el vector de servicios para extraer metricas de negocio reales:
    - Servicio con menor valor (tarifa mas accesible)
    - Servicio con mayor valor (tarifa premium)
    - Tarifa promedio de la plataforma
    - Servicio con mayor calificacion (reputacion destacada)
    - Top 3 servicios mas contratados
    """
    mostrar_encabezado("ANALISIS Y METRICAS DEL VECTOR DE SERVICIOS")
    print()

    if not servicios:
        print("  [!] No hay servicios registrados para analizar.")
        return

    # Calculos sobre el vector usando funciones nativas y expresiones lambda
    mas_economico = min(servicios, key=lambda s: s["tarifa_hora"])
    mas_costoso   = max(servicios, key=lambda s: s["tarifa_hora"])
    mejor_rating  = max(servicios, key=lambda s: s["calificacion"])
    tarifa_promedio = sum(s["tarifa_hora"] for s in servicios) / len(servicios)

    # Ordenamiento para ranking top 3 contratos (Actividad 5 aplicada)
    top_contratados = sorted(servicios, key=lambda s: s["num_contratos"], reverse=True)[:3]

    print(f"  Total de servicios analizados en el vector: {len(servicios)}")
    print(f"  Tarifa promedio general: ${tarifa_promedio:,.0f} COP/h")
    separador()
    print(f"  [+] SERVICIO MAS ECONOMICO:")
    print(f"      {mas_economico['codigo']} - {mas_economico['categoria']} (${mas_economico['tarifa_hora']:,.0f}/h)")
    print(f"      Prestador: {mas_economico['prestador_nombre']} ({mas_economico['ciudad']})")
    print()
    print(f"  [+] SERVICIO CON MAYOR VALOR:")
    print(f"      {mas_costoso['codigo']} - {mas_costoso['categoria']} (${mas_costoso['tarifa_hora']:,.0f}/h)")
    print(f"      Prestador: {mas_costoso['prestador_nombre']} ({mas_costoso['ciudad']})")
    print()
    print(f"  [+] SERVICIO MEJOR CALIFICADO:")
    print(f"      {mejor_rating['codigo']} - {mejor_rating['categoria']} ({mejor_rating['calificacion']:.1f}* estrellas)")
    print(f"      Prestador: {mejor_rating['prestador_nombre']}")
    separador()
    print("  [+] TOP 3 SERVICIOS MAS CONTRATADOS:")
    for idx, s in enumerate(top_contratados, 1):
        print(f"      {idx}. {s['codigo']} | {s['categoria']} | {s['prestador_nombre']} ({s['num_contratos']} contratos)")
    separador()


# ========================================================================================
# GUIA 8 - ACTIVIDAD 8: INTEGRACION DE BUSQUEDA Y ORDENAMIENTO EN MENU
# Menu interactivo que reune todas las operaciones de la guia sobre el vector.
# ========================================================================================

def menu_catalogo_avanzado():
    """
    GUIA 8 - ACTIVIDAD 8: Menu integrado de busqueda y ordenamiento.
    Permite al usuario interactuar con el vector de servicios aplicando:
    1. Recorrido estandar
    2. Ordenamiento ascendente por precio
    3. Ordenamiento descendente por precio
    4. Ordenamiento descendente por calificacion (estrellas)
    5. Busqueda secuencial por identificador
    6. Busqueda secuencial por atributo no unico
    7. Reto de integracion (metricas y analitica del vector)
    0. Regresar
    """
    while True:
        mostrar_encabezado("CATALOGO, ORDENAMIENTO Y BUSQUEDA (GUIA 8)")
        print()
        print("  1. Ver catalogo completo (orden original)")
        print("  2. Ordenar por precio ASCENDENTE (menor a mayor)")
        print("  3. Ordenar por precio DESCENDENTE (mayor a menor)")
        print("  4. Ordenar por calificacion DESCENDENTE (mejores prestadores)")
        print("  5. Buscar servicio por CODIGO (identificador unico)")
        print("  6. Buscar servicios por ATRIBUTO (categoria, ciudad o texto)")
        print("  7. Analisis de metricas del vector (reto de integracion)")
        print("  0. Regresar al menu anterior")
        separador()

        op = input("  Seleccione una opcion (0-7): ").strip()

        if op == "1":
            listar_servicios()
        elif op == "2":
            print("\n  [i] Aplicando ordenamiento ascendente por tarifa...")
            ordenados = ordenar_servicios_ascendente("tarifa_hora")
            listar_servicios(lista_personalizada=ordenados)
        elif op == "3":
            print("\n  [i] Aplicando ordenamiento descendente por tarifa...")
            ordenados = ordenar_servicios_descendente("tarifa_hora")
            listar_servicios(lista_personalizada=ordenados)
        elif op == "4":
            print("\n  [i] Aplicando ordenamiento descendente por calificacion...")
            ordenados = ordenar_servicios_descendente("calificacion")
            listar_servicios(lista_personalizada=ordenados)
        elif op == "5":
            ver_detalle_servicio()
        elif op == "6":
            buscar_servicios_por_atributo()
        elif op == "7":
            analisis_vector_servicios()
        elif op == "0":
            break
        else:
            print("\n[!] Opcion invalida. Ingrese un numero entre 0 y 7.")

        input("\n  Presione Enter para continuar...")
        print()


# ========================================================================================
# FUNCIONALIDADES DE GESTION DE SERVICIOS (PUBLICAR Y MODIFICAR)
# YA CUMPLIDAS EN GUIAS PREVIAS.
# ========================================================================================

def publicar_servicio():
    """
    GUIA 8 - ACTIVIDAD 1 y 2: Almacenamiento en vectores.
    Permite registrar un nuevo servicio como diccionario y agregarlo
    al vector 'servicios' mediante .append().
    """
    mostrar_encabezado("PUBLICAR NUEVO SERVICIO")
    print()

    usuario_actual = get_sesion_actual()
    if not usuario_actual or usuario_actual["rol"] not in ("prestador", "admin"):
        print("[!] Solo los prestadores o administradores pueden publicar servicios.")
        return

    nuevo_codigo = generar_id("SERV", servicios)

    # Validacion para evitar codigos duplicados
    for s in servicios:
        if s["codigo"] == nuevo_codigo:
            nuevo_codigo = f"SERV-{len(servicios)+10}"

    categoria = pedir_categoria()
    descripcion = pedir_texto_minimo("  Descripcion del servicio: ", "descripcion", minimo=10)
    tarifa = pedir_float("  Tarifa por hora en COP: ", 10000, 500000)
    ciudad = pedir_ciudad()
    disp_resp = pedir_sn("  ¿Disponibilidad inmediata? (s/n): ")

    # Creacion del registro como DICCIONARIO dentro del vector
    nuevo_servicio = {
        "codigo": nuevo_codigo,
        "prestador_id": usuario_actual["id"],
        "prestador_nombre": usuario_actual["nombre"],
        "categoria": categoria,
        "descripcion": descripcion.strip(),
        "tarifa_hora": tarifa,
        "ciudad": ciudad,
        # Geolocalizacion: el servicio nuevo parte del centro de su ciudad.
        "zona": "Centro",
        "lat": CENTRO_CIUDAD.get(ciudad, CENTRO_CIUDAD["Cucuta"])[0],
        "lng": CENTRO_CIUDAD.get(ciudad, CENTRO_CIUDAD["Cucuta"])[1],
        "radio_km": RADIO_COBERTURA_KM,
        "disponible": (disp_resp == "s"),
        "calificacion": 5.0,
        "num_contratos": 0
    }

    # GUIA 8 - ACTIVIDAD 1.2: .append() sobre vector
    servicios.append(nuevo_servicio)
    print(f"\n[OK] Servicio '{nuevo_codigo}' publicado exitosamente.")
    print(f"     Total de servicios en el vector YPRI: {len(servicios)}")


def modificar_servicio():
    """
    GUIA 8 - ACTIVIDAD 1.2: Modificacion de un elemento en el vector.
    Permite modificar atributos de un servicio existente (descripcion, tarifa, disponibilidad).
    Verifica permisos: solo el prestador dueno o un admin pueden modificar.
    El identificador principal (codigo) permanece inmutable.
    """
    mostrar_encabezado("MODIFICAR SERVICIO")
    print()

    usuario_actual = get_sesion_actual()
    if not usuario_actual or usuario_actual["rol"] not in ("prestador", "admin"):
        print("[!] Solo los prestadores o administradores pueden modificar servicios.")
        return

    codigo = pedir_id_registro(
        "  Codigo del servicio a modificar (o '0' para cancelar): ",
        prefijo_esperado="SERV"
    )
    if codigo is None:
        return

    # GUIA 8: Busqueda secuencial en el vector
    servicio_encontrado = None
    for serv in servicios:
        if serv["codigo"] == codigo:
            if usuario_actual["rol"] != "admin" and serv["prestador_id"] != usuario_actual["id"]:
                print("[!] Solo puede modificar los servicios publicados por usted.")
                return
            servicio_encontrado = serv
            break

    if not servicio_encontrado:
        print(f"[!] No se encontro el servicio '{codigo}'.")
        return

    print(f"\n  Servicio encontrado: {servicio_encontrado['codigo']} - {servicio_encontrado['categoria']}")
    print("  Deje vacio y presione Enter si desea conservar el valor actual.\n")

    nueva_desc = input(f"  Descripcion [{servicio_encontrado['descripcion']}]: ").strip()
    if nueva_desc:
        if len(nueva_desc) < 10 or not any(c.isalpha() for c in nueva_desc):
            print("[!] Descripcion invalida (minimo 10 caracteres con letras). Se conserva la anterior.")
        else:
            servicio_encontrado["descripcion"] = nueva_desc

    while True:
        nueva_tarifa = input(f"  Tarifa/hora [${servicio_encontrado['tarifa_hora']:,.0f}] (Enter para conservar): ").strip()
        if nueva_tarifa == "":
            break
        try:
            t = float(nueva_tarifa)
            if 10000 <= t <= 500000:
                servicio_encontrado["tarifa_hora"] = t
                break
            else:
                print("[!] La tarifa debe estar entre $10.000 y $500.000 COP. Intente de nuevo.")
        except ValueError:
            print("[!] Valor invalido. Ingrese solo numeros (ej. 35000) o Enter para conservar.")

    while True:
        resp_disp = input(f"  ¿Disponible? (s/n) [{'s' if servicio_encontrado['disponible'] else 'n'}]: ").strip().lower()
        if resp_disp == "":
            break
        if resp_disp in ("s", "n"):
            servicio_encontrado["disponible"] = (resp_disp == "s")
            break
        print("[!] Ingrese 's' para Si, 'n' para No, o Enter para conservar.")

    print(f"\n[OK] Servicio '{codigo}' actualizado exitosamente.")
    print(f"     Descripcion: {servicio_encontrado['descripcion']}")
    print(f"     Tarifa:      ${servicio_encontrado['tarifa_hora']:,.0f} COP/h")
    print(f"     Disponible:  {'Si' if servicio_encontrado['disponible'] else 'No'}")
