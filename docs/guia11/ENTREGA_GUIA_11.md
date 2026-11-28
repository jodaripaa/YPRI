# Introducción

Este informe presenta el desarrollo de la Guía de aprendizaje N.º 11, *Manejo de archivos, Excel y programación orientada a objetos en Python*, de la Unidad 3 de Diseño Funcional, aplicada a YPRI, la plataforma que conecta a clientes con profesionales de servicios a domicilio en Cúcuta.

Como pide la guía, no se creó un aplicativo aparte. Las nuevas funciones se integraron al mismo proyecto en Python que se construye desde la primera unidad, que está en la carpeta `backend/`. Con esta guía, YPRI:
- guarda su información en archivos y la recupera al volver a abrirse;
- exporta e importa datos en Excel;
- organiza sus entidades principales en clases con encapsulamiento, herencia y sobrescritura de métodos y de operadores.

Cada actividad indica qué se hizo, en qué archivo y función está, el código principal y la evidencia de que funciona. Las evidencias completas están en la carpeta `backend/evidencias/` del proyecto.

## Archivos nuevos y modificados

| Archivo | Cambio | Actividad |
|---|---|---|
| `backend/modules/persistencia.py` | Nuevo: guardar y cargar datos, historial de operaciones | 1 |
| `backend/modules/reportes_excel.py` | Nuevo: exportar e importar Excel con openpyxl | 2 |
| `backend/models/servicio.py` | Nuevo: clase `Servicio` con getters, setters y operadores | 3, 4 y 6 |
| `backend/models/usuario.py` | Nuevo: clase base `Usuario` y clases derivadas `Cliente`, `Prestador` y `Administrador` | 3, 4, 5 y 6 |
| `backend/models/factura.py` | Nuevo: clase `Factura` con el operador `+` sobrescrito | 3, 4 y 6 |
| `backend/main.py` | Carga los datos al iniciar, los guarda al salir y agrega opciones de menú | 1, 2 y 7 |
| `backend/modules/auth.py`, `servicios.py`, `admin.py` | Usan las clases en el login, el registro, la publicación y las estadísticas | 3 a 7 |
| `backend/app_gui.py` | Vista «Archivos y Excel» en la interfaz gráfica | 1, 2 y 7 |
| `backend/tests_guia11.py` | 19 pruebas automatizadas de la guía | 7 |
| `DOCUMENTACION_TECNICA.md` | Documentación técnica en español e inglés (apartado 3 de la guía) | 3. Documentación |

# Actividad 1. Implementación de archivos

## Qué se implementó

YPRI ahora guarda en el archivo `datos/ypri_datos.json` a los usuarios, los servicios, los contratos, las calificaciones y las dos matrices de facturación. Al iniciar, `main.py` llama a `cargar_datos()` y recupera lo que quedó guardado en la ejecución anterior.

Los datos se guardan:
- al publicar, modificar o eliminar un servicio;
- al registrar un usuario;
- al cerrar sesión;
- al salir del programa.

Además, cada operación importante queda en el historial `datos/historial_operaciones.txt`.

**Requisitos de la Actividad 1 y funciones que los cumplen**

| Requisito de la guía | Función | Archivo |
|---|---|---|
| 1. Guardar información generada por el sistema | `guardar_datos()` con `open(..., "w")` | `backend/modules/persistencia.py` |
| 2. Leer información almacenada | `cargar_datos()` con `open(..., "r")`; `leer_historial()` | `backend/modules/persistencia.py` |
| 3. Recuperar los datos al volver a ejecutar | `main()` llama a `cargar_datos()` al iniciar y a `guardar_datos()` al salir | `backend/main.py` |
| 4. Controlar archivos inexistentes o errores de lectura | `cargar_datos()` maneja `FileNotFoundError`, `JSONDecodeError` y `OSError` | `backend/modules/persistencia.py` |

## Código principal

```python
def guardar_datos(ruta=RUTA_DATOS):
    contenido = {"guardado_en": datetime.now().strftime("%d/%m/%Y %H:%M:%S"),
                 "datos": obtener_estado_actual()}
    try:
        os.makedirs(os.path.dirname(ruta), exist_ok=True)
        with open(ruta, "w", encoding="utf-8") as archivo:   # modo "w"
            json.dump(contenido, archivo, ensure_ascii=False, indent=2)
        return True
    except OSError as error:
        print(f"[!] No se pudo guardar el archivo de datos: {error}")
        return False

def cargar_datos(ruta=RUTA_DATOS):
    try:
        with open(ruta, "r", encoding="utf-8") as archivo:   # modo "r"
            contenido = json.load(archivo)
        ...
        return "cargado"
    except FileNotFoundError:          # primera ejecucion: se crea el archivo
        guardar_datos(ruta)
        return "nuevo"
    except (json.JSONDecodeError, KeyError, TypeError):
        os.replace(ruta, ruta + ".danado")   # se respalda el archivo danado
        guardar_datos(ruta)
        return "danado"

def registrar_evento(descripcion, ruta=RUTA_HISTORIAL):
    with open(ruta, "a", encoding="utf-8") as archivo:       # modo "a"
        archivo.write(f"{datetime.now():%d/%m/%Y %H:%M:%S} | {descripcion}\n")
```

## Evidencia

En la primera ejecución el archivo no existía y el programa lo creó. En la segunda ejecución, después de cerrar el programa, aparecen los servicios importados y no aparece el servicio eliminado en la sesión anterior:

```text
[i] Datos recuperados desde datos\ypri_datos.json
...
7   SERV-20   Luis Ortega         Electricidad    $    40,000  Si     4.6*
8   SERV-21   Diana Paez          Plomeria        $    32,000  Si     4.4*
```

Con el archivo de datos dañado a propósito, el programa avisa y sigue funcionando:

```text
[!] El archivo de datos esta danado (JSONDecodeError).
    Se guardo una copia en 'ypri_datos.json.danado' y se usan los datos iniciales.
```

Historial guardado en `datos/historial_operaciones.txt`:

```text
27/11/2026 18:39:24 | Importados desde Excel: SERV-20, SERV-21, SERV-22
27/11/2026 18:39:24 | Servicio eliminado: SERV-22
27/11/2026 18:39:25 | Servicio publicado: SERV-09 (Electricidad)
```

# Actividad 2. Integración con Excel

## Qué se implementó

Con la biblioteca `openpyxl`, el administrador y el prestador pueden exportar un reporte de YPRI a Excel e importar servicios desde un archivo `.xlsx`. Las dos acciones están en la opción «Archivos y reportes Excel» del menú, que es la 11 para el administrador y la 9 para el prestador, y en la vista «Archivos y Excel» de la interfaz gráfica.

**Requisitos de la Actividad 2 y cómo se cumplen**

| Requisito de la guía | Cómo se cumple | Función |
|---|---|---|
| 1. Exportar información a `.xlsx` | Crea `reportes/reporte_ypri.xlsx` con las hojas Servicios, Contratos y Facturación semanal | `exportar_reporte_excel()` |
| 2. Incluir encabezados | La fila 1 de cada hoja tiene encabezados en negrilla con fondo azul y queda fija | `_escribir_encabezados()` |
| 3. Leer información desde Excel | Lee las filas con `load_workbook()` e `iter_rows(values_only=True)` | `importar_servicios_excel()` |
| 4. Integrar los datos con una funcionalidad existente | Los servicios importados se agregan al vector `servicios`: aparecen en el catálogo, la búsqueda, el ordenamiento y el cotizador | `importar_servicios_excel()` |

## Código principal

```python
libro = Workbook()
hoja_servicios = libro.active
hoja_servicios.title = "Servicios"
_escribir_encabezados(hoja_servicios, ENCABEZADOS_SERVICIOS)
for s in lista_servicios:
    hoja_servicios.append([s["codigo"], s["categoria"], s["prestador_nombre"], ...])
...
libro.save(ruta)

# Importacion: cada fila se valida con la clase Servicio
libro = load_workbook(ruta, read_only=True, data_only=True)
for numero_fila, fila in enumerate(filas[1:], start=2):
    try:
        nuevo = Servicio(codigo=valor("Codigo"), categoria=valor("Categoria"), ...)
    except (ValueError, TypeError) as error:
        resultado["rechazados"].append((numero_fila, str(error)))
        continue
    if nuevo in existentes:            # operador == sobrescrito
        resultado["rechazados"].append((numero_fila, "El codigo ya existe"))
        continue
    lista_servicios.append(nuevo.a_diccionario())
```

## Evidencia

![Hoja Servicios del reporte exportado a Excel](docs/guia11/excel_hoja_servicios.png)

*Nota.* Archivo `reportes/reporte_ypri.xlsx` generado por YPRI. Las otras dos hojas aparecen en las pestañas inferiores.

![Hoja Facturación semanal del reporte exportado](docs/guia11/excel_hoja_facturacion.png)

*Nota.* La hoja Facturación semanal es la matriz de 5 × 6 de la Guía 9, con el total de cada categoría y de cada día.

![Archivo de Excel de ejemplo para importar servicios](docs/guia11/excel_plantilla_importacion.png)

*Nota.* Archivo `datos/plantilla_servicios.xlsx`. La fila 5 tiene una tarifa de $5.000, por debajo del mínimo, para comprobar la validación.

Resultado de la importación desde el menú del administrador:

```text
[OK] Servicios importados al catalogo: 3
     + SERV-20
     + SERV-21
     + SERV-22
[!] Filas rechazadas: 1
     Fila 5: La tarifa debe estar entre $10,000 y $500,000 COP.
     Ya aparecen en el catalogo, la busqueda y el ordenamiento de servicios.
```

# Actividad 3. Implementación de clases y objetos

## Qué se implementó

La entidad principal de YPRI es el **servicio a domicilio**, y se representa con la clase `Servicio` en `backend/models/servicio.py`. También se crearon las clases `Usuario` (con sus clases derivadas) y `Factura`.

**Elementos de la clase Servicio**

| Elemento pedido | En la clase `Servicio` |
|---|---|
| 1. Nombre relacionado con la entidad | `Servicio` |
| 2. Constructor `__init__()` | Recibe código, prestador, categoría, descripción, tarifa, ciudad, zona, coordenadas, disponibilidad, calificación y número de contratos |
| 3. Atributos | `codigo`, `prestador_id`, `prestador_nombre`, `categoria`, `descripcion`, `tarifa_hora`, `ciudad`, `zona`, `lat`, `lng`, `radio_km`, `disponible`, `calificacion`, `num_contratos` |
| 4. Métodos | `calcular_costo(horas)`, `cambiar_disponibilidad()`, `a_diccionario()`, `desde_diccionario()` |
| 5. Objetos usados en el aplicativo | `publicar_servicio()` y `modificar_servicio()` en `modules/servicios.py`, la importación de Excel y el botón «Publicar» de la GUI |

## Código principal

```python
class Servicio:
    def __init__(self, codigo, prestador_id, prestador_nombre, categoria, descripcion,
                 tarifa_hora, ciudad="Cucuta", ..., calificacion=5.0, num_contratos=0):
        self.codigo = str(codigo).strip().upper()
        self.categoria = categoria          # pasa por el setter
        self.tarifa_hora = tarifa_hora      # pasa por el setter
        ...

    def calcular_costo(self, horas):
        return round(self.tarifa_hora * horas * (1 + IVA_PORCENTAJE), 2)

# Uso en publicar_servicio() (modules/servicios.py)
objeto_servicio = Servicio(codigo=nuevo_codigo, prestador_id=usuario_actual["id"], ...)
servicios.append(objeto_servicio.a_diccionario())
print(f"     {objeto_servicio}")
```

## Evidencia

```text
[!] El valor debe estar entre 10000 y 500000.
[OK] Servicio publicado exitosamente:
     SERV-09 | Electricidad  | Carlos Gomez       | $42,000/h | 5.0* | Disponible
```

# Actividad 4. Implementación de getters y setters

## Qué se implementó

Los atributos sensibles se consultan y se modifican con `@property`. Cada setter valida el dato y lanza `ValueError` si es incorrecto, de modo que la información errónea nunca llega a guardarse.

**Getters y setters con validación**

| Clase | Propiedad | Validación del setter |
|---|---|---|
| `Servicio` | `tarifa_hora` | Convierte a `float` y exige un valor entre $10.000 y $500.000 |
| `Servicio` | `categoria` | Debe estar en la tupla `CATEGORIAS_SERVICIO` |
| `Servicio` | `descripcion` | Mínimo 10 caracteres y al menos una letra |
| `Servicio` | `ciudad` | Debe ser una ciudad de cobertura |
| `Servicio` | `calificacion` | Entre 0 y 5 |
| `Usuario` | `correo`, `nombre`, `telefono` | Formato `usuario@dominio.com`; solo letras; 10 dígitos |
| `Factura` | `subtotal` / `total` | El subtotal no puede ser negativo; `total` es de solo lectura |

## Código principal

```python
@property
def tarifa_hora(self):
    return self._tarifa_hora

@tarifa_hora.setter
def tarifa_hora(self, valor):
    try:
        tarifa = float(valor)
    except (TypeError, ValueError):
        raise ValueError(f"La tarifa debe ser un numero (recibido: '{valor}').")
    if tarifa < TARIFA_MINIMA or tarifa > TARIFA_MAXIMA:
        raise ValueError("La tarifa debe estar entre $10,000 y $500,000 COP.")
    self._tarifa_hora = tarifa
```

`modificar_servicio()` cambia la tarifa con este setter (`objeto_servicio.tarifa_hora = nueva_tarifa`). Si el valor no es válido, muestra el mensaje de la clase y vuelve a pedir el dato.

# Actividad 5. Herencia y sobrescritura de métodos

## Qué se implementó

Los usuarios de YPRI comparten datos y comportamiento, pero cada rol hace cosas distintas. Por eso `Usuario` es la **clase base** y `Cliente`, `Prestador` y `Administrador` son **clases derivadas**.

**Herencia entre las clases de usuario**

| Elemento pedido | Implementación |
|---|---|
| 1. Clase base | `Usuario` (`backend/models/usuario.py`) |
| 2. Clases derivadas | `Cliente(Usuario)`, `Prestador(Usuario)`, `Administrador(Usuario)` |
| 3. Métodos heredados | `verificar_credenciales()`, `presentar()`, `a_diccionario()` y los getters y setters; el constructor se reutiliza con `super().__init__()` |
| 4. Métodos sobrescritos | `describir_rol()` y `permisos()` cambian en cada clase derivada |
| Sentido en el aplicativo | `login()` crea el objeto del rol que corresponde y llama a `presentar()`, que muestra un mensaje distinto para cada rol. La GUI usa `describir_rol()` en la tarjeta del usuario |

## Código principal

```python
class Usuario:
    def describir_rol(self):
        return "Usuario del sistema YPRI"

    def presentar(self):                      # heredado por todas las clases
        print(f"\n[OK] Bienvenido/a, {self.nombre}!")
        print(f"     {self.describir_rol()} | Ciudad: {self.ciudad}")
        print(f"     Puede: {', '.join(self.permisos())}")

class Prestador(Usuario):
    def __init__(self, id_usuario, nombre, correo, contrasena, ciudad, telefono):
        super().__init__(id_usuario, nombre, correo, contrasena, "prestador", ciudad, telefono)

    def describir_rol(self):                  # sobrescrito
        return "Prestador: publica servicios y atiende contratos"
```

## Evidencia

El mismo método heredado, `presentar()`, muestra un texto distinto según la clase del objeto:

```text
[OK] Bienvenido/a, Admin YPRI!
     Administrador: supervisa usuarios, servicios y reportes | Ciudad: Cucuta
     Puede: gestionar usuarios, auditar matrices, importar y exportar Excel, respaldar datos

[OK] Bienvenido/a, Carlos Gomez!
     Prestador: publica servicios y atiende contratos | Ciudad: Cucuta
     Puede: publicar servicios, modificar servicios, exportar a Excel
```

# Actividad 6. Sobrescritura de operadores

## Qué se implementó

**Métodos especiales sobrescritos**

| Clase | Método especial | Uso en el sistema |
|---|---|---|
| `Factura` | `__add__()` y `__radd__()` | `factura1 + factura2` y `sum(facturas)` dan la facturación consolidada del administrador y la fila TOTAL del Excel |
| `Servicio` | `__eq__()` | Dos servicios son iguales si tienen el mismo código; `nuevo in existentes` evita importar duplicados desde Excel |
| `Usuario` | `__eq__()` | Dos usuarios son iguales si tienen el mismo correo |
| `Servicio`, `Factura`, `Usuario` | `__str__()` | Texto que se imprime al publicar, en el reporte del administrador y en el historial |

## Código principal

```python
class Factura:
    def __add__(self, otra):
        if not isinstance(otra, Factura):
            return NotImplemented
        return Factura("Facturacion consolidada",
                       self.subtotal + otra.subtotal,
                       self.iva + otra.iva,
                       self.cantidad_contratos + otra.cantidad_contratos)

# Uso en ver_estadisticas() (modules/admin.py)
facturas = [Factura.desde_contrato(c) for c in contratos]
consolidada = sum(facturas, Factura.vacia())
print(f"    Facturacion POO:   {consolidada}")
```

## Evidencia

```text
Facturacion POO:   Facturacion consolidada: subtotal $175,000.00 + IVA $33,250.00
                   = $208,250.00 COP (1 contrato(s))
```

Al importar dos veces el mismo Excel, `__eq__()` detecta los duplicados: la segunda vez no se agrega ningún servicio y cada fila se rechaza con el mensaje «El codigo ... ya existe en el catalogo». La prueba `test_importar_dos_veces_no_duplica` lo comprueba.

# Actividad 7. Integración y pruebas

## Integración con las funcionalidades existentes

- El menú principal sigue con el inicio de sesión, el registro, las matrices (Guía 9), los subalgoritmos (Guía 10) y la interfaz gráfica.
- Se quitaron del menú principal los ejercicios sueltos de las guías 9 y 10, para no tener ejercicios independientes.
- Menú del prestador: la opción 8 elimina servicios propios y la opción 9 abre «Archivos y reportes Excel».
- Menú del administrador: la opción 10 elimina servicios y la opción 11 abre «Archivos y reportes Excel».
- Eliminar un servicio usa `.remove()` sobre el vector y no permite borrar servicios con contratos activos ni servicios de otro prestador.

![Vista «Archivos y Excel» de la interfaz gráfica](backend/evidencias/evidencia_05_gui_archivos_excel.png)

*Nota.* Desde la interfaz gráfica se exporta e importa Excel, se guardan los datos y se ve el historial guardado en el archivo de texto.

## Pruebas automatizadas

El archivo `backend/tests_guia11.py` tiene 19 pruebas para la guía, agrupadas en las clases de la tabla. Las pruebas usan una carpeta temporal y no modifican los datos reales. Con el comando `python ejecutar_pruebas.py` se corren las 4 suites del proyecto y el resultado queda en `backend/evidencias/resultado_pruebas.txt`.

**Pruebas automatizadas de la Guía 11**

| Clase de prueba | Qué comprueba | Pruebas |
|---|---|---|
| `TestArchivos` | Guardar y recuperar tras reiniciar, archivo inexistente, archivo dañado, historial en modo "a" | 4 |
| `TestExcel` | Encabezados y totales del reporte, importación válida e inválida, sin duplicados, archivo inexistente o sin columnas | 4 |
| `TestClasesYEncapsulamiento` | Objetos y métodos, setters que rechazan datos incorrectos, datos iniciales válidos | 4 |
| `TestHerenciaYOperadores` | Clase derivada correcta, método heredado y sobrescrito, `==`, `+` y `sum()` | 4 |
| `TestIntegracion` | Eliminar con `.remove()`, permisos, `main.py` y `app_gui.py` cargan sin errores | 3 |

```text
TOTAL: 51 pruebas | 51 correctas | 0 con fallas
```

Las otras 32 pruebas son de guías anteriores: 9 de subalgoritmos, 10 de geolocalización y 13 de búsqueda rápida y pedido inmediato. Todas siguen pasando, lo que confirma que las funcionalidades anteriores se mantienen.

# Documentación técnica del proyecto

Según el apartado 3 de la guía, en la carpeta raíz del proyecto está el archivo `DOCUMENTACION_TECNICA.md`, en español e inglés. Contiene:
- la información general del proyecto;
- las tecnologías y la estructura de carpetas;
- las instrucciones de instalación y ejecución;
- una tabla con los 23 temas de las unidades 1, 2 y 3, cada uno con el archivo, la función, clase o método y su aplicación real en YPRI.

Las dependencias están en `requirements.txt` (`pip install -r requirements.txt`).

# Conclusiones

Con la Guía 11, YPRI dejó de perder su información al cerrarse. Ahora guarda y recupera sus datos en archivos y controla los casos en que el archivo no existe o está dañado.

La integración con Excel aporta una función útil para el negocio: el administrador puede llevarse un reporte de servicios, contratos y facturación, y los prestadores pueden cargar varios servicios a la vez desde una hoja de cálculo. Cada fila se valida antes de entrar al catálogo.

La programación orientada a objetos ordenó las reglas del dominio:
- la clase `Servicio` concentra las validaciones que antes estaban repartidas en la consola y en la interfaz gráfica;
- la herencia entre `Usuario`, `Cliente`, `Prestador` y `Administrador` refleja los roles reales de la plataforma;
- los operadores sobrescritos simplifican cálculos como la facturación consolidada y la detección de duplicados.

Las 51 pruebas automatizadas confirman que las nuevas funciones están integradas y que las de las guías anteriores siguen funcionando.

# Referencias

Fundación de Estudios Superiores Comfanorte. (2026). *Guía de aprendizaje N.º 11. Manejo de archivos, Excel y programación orientada a objetos en Python* [Material de clase, Diseño Funcional].

Gazoni, E., & Clark, C. (s. f.). *openpyxl: A Python library to read/write Excel 2010 xlsx/xlsm files* [Documentación]. https://openpyxl.readthedocs.io/

Python Software Foundation. (s. f.-a). *Classes*. En *The Python tutorial*. https://docs.python.org/3/tutorial/classes.html

Python Software Foundation. (s. f.-b). *Reading and writing files*. En *The Python tutorial*. https://docs.python.org/3/tutorial/inputoutput.html#reading-and-writing-files
