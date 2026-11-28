"""
Genera docs/DOCUMENTACION_TECNICA.docx a partir de DOCUMENTACION_TECNICA.md con el
formato de entregas de la FESC y normas APA 7:
  * Carta, margenes de 2,54 cm, Times New Roman 12, interlineado doble.
  * Numero de pagina arriba a la derecha.
  * Portada institucional centrada y tabla de contenido.
  * Titulos APA: nivel 1 centrado en negrilla, nivel 2 alineado a la izquierda en
    negrilla, nivel 3 en negrilla y cursiva.
  * Tablas y figuras numeradas ("Tabla N" en negrilla y titulo en cursiva) con notas.
  * Referencias con sangria francesa.

Requiere python-docx (pip install python-docx). No es una dependencia del aplicativo.
Uso, desde la carpeta YPRI:
  python docs/generar_documentacion_docx.py            -> documentacion tecnica
  python docs/generar_documentacion_docx.py guia11     -> informe de la Guia 11
El indice se actualiza y el PDF se exporta despues con LibreOffice o Word.
"""

import os
import re
import sys

from docx import Document
from docx.enum.section import WD_SECTION
from docx.enum.table import WD_TABLE_ALIGNMENT
from docx.enum.text import WD_ALIGN_PARAGRAPH, WD_BREAK
from docx.oxml import OxmlElement
from docx.oxml.ns import qn
from docx.shared import Cm, Inches, Pt, RGBColor

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MODOS = {
    "tecnica": {
        "entrada": os.path.join(RAIZ, "DOCUMENTACION_TECNICA.md"),
        "salida": os.path.join(RAIZ, "docs", "DOCUMENTACION_TECNICA.docx"),
        "inicio": "# PARTE 1",
        "subtitulos": ["Documentación técnica del aplicativo: proyecto final",
                       "Technical documentation of the application: final project"],
        "salto_en_cada_parte": True,
        "niveles_indice": "1-2",
    },
    "guia11": {
        "entrada": os.path.join(RAIZ, "docs", "guia11", "ENTREGA_GUIA_11.md"),
        "salida": os.path.join(RAIZ, "docs", "guia11", "YPRI_ENTREGA_GUIA_11.docx"),
        "inicio": "# ",
        "subtitulos": ["Guía de aprendizaje N.º 11",
                       "Manejo de archivos, Excel y programación orientada a objetos en Python"],
        "salto_en_cada_parte": False,
        "niveles_indice": "1-1",
    },
}
MODO = MODOS[sys.argv[1] if len(sys.argv) > 1 else "tecnica"]
ENTRADA = MODO["entrada"]
SALIDA = MODO["salida"]

FUENTE = "Times New Roman"
NEGRO = RGBColor(0, 0, 0)

contador = {"tabla": 0, "figura": 0}


# ------------------------------------------------------------------------------------
# Utilidades de formato
# ------------------------------------------------------------------------------------
def fijar_fuente(run, nombre=FUENTE, tamano=12):
    run.font.name = nombre
    run.font.size = Pt(tamano)
    run.font.color.rgb = NEGRO
    rpr = run._element.get_or_add_rPr()
    rfonts = rpr.find(qn("w:rFonts"))
    if rfonts is None:
        rfonts = OxmlElement("w:rFonts")
        rpr.append(rfonts)
    for atributo in ("w:ascii", "w:hAnsi", "w:cs", "w:eastAsia"):
        rfonts.set(qn(atributo), nombre)


def agregar_campo(parrafo, instruccion):
    """Inserta un campo de Word (PAGE, TOC...)."""
    run = parrafo.add_run()
    inicio = OxmlElement("w:fldChar")
    inicio.set(qn("w:fldCharType"), "begin")
    texto = OxmlElement("w:instrText")
    texto.set(qn("xml:space"), "preserve")
    texto.text = instruccion
    separa = OxmlElement("w:fldChar")
    separa.set(qn("w:fldCharType"), "separate")
    marcador = OxmlElement("w:t")
    marcador.text = "1" if "PAGE" in instruccion else "Actualice el índice (clic derecho > Actualizar campo)."
    fin = OxmlElement("w:fldChar")
    fin.set(qn("w:fldCharType"), "end")
    for elemento in (inicio, texto, separa, marcador, fin):
        run._element.append(elemento)
    fijar_fuente(run)
    return run


def texto_con_formato(parrafo, texto, tamano=12, negrilla=False):
    """Escribe texto con **negrilla**, *cursiva* y `codigo` de Markdown."""
    patron = re.compile(r"(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`)")
    for parte in patron.split(texto):
        if not parte:
            continue
        if parte.startswith("**") and parte.endswith("**"):
            run = parrafo.add_run(parte[2:-2])
            fijar_fuente(run, tamano=tamano)
            run.bold = True
        elif parte.startswith("*") and parte.endswith("*") and len(parte) > 2:
            run = parrafo.add_run(parte[1:-1])
            fijar_fuente(run, tamano=tamano)
            run.italic = True
        elif parte.startswith("`") and parte.endswith("`"):
            run = parrafo.add_run(parte[1:-1])
            fijar_fuente(run, "Consolas", tamano - 1.5)
            run.bold = negrilla or None
        else:
            run = parrafo.add_run(parte)
            fijar_fuente(run, tamano=tamano)
            run.bold = negrilla or None


def formato_parrafo(parrafo, sangria=True, alineacion=None, interlineado=2.0, antes=0, despues=0):
    pf = parrafo.paragraph_format
    pf.line_spacing = interlineado
    pf.space_before = Pt(antes)
    pf.space_after = Pt(despues)
    pf.first_line_indent = Cm(1.27) if sangria else None
    if alineacion is not None:
        parrafo.alignment = alineacion


def bordes_tabla_apa(tabla):
    """Lineas horizontales APA: arriba, debajo del encabezado y al final."""
    tbl_pr = tabla._tbl.tblPr
    bordes = OxmlElement("w:tblBorders")
    for lado in ("top", "bottom"):
        b = OxmlElement(f"w:{lado}")
        b.set(qn("w:val"), "single")
        b.set(qn("w:sz"), "8")
        b.set(qn("w:color"), "000000")
        bordes.append(b)
    for lado in ("left", "right", "insideH", "insideV"):
        b = OxmlElement(f"w:{lado}")
        b.set(qn("w:val"), "nil")
        bordes.append(b)
    tbl_pr.append(bordes)
    for celda in tabla.rows[0].cells:
        tc_pr = celda._tc.get_or_add_tcPr()
        tc_bordes = OxmlElement("w:tcBorders")
        b = OxmlElement("w:bottom")
        b.set(qn("w:val"), "single")
        b.set(qn("w:sz"), "6")
        b.set(qn("w:color"), "000000")
        tc_bordes.append(b)
        tc_pr.append(tc_bordes)


def repetir_encabezado(fila):
    tr_pr = fila._tr.get_or_add_trPr()
    elemento = OxmlElement("w:tblHeader")
    elemento.set(qn("w:val"), "true")
    tr_pr.append(elemento)


# ------------------------------------------------------------------------------------
# Elementos del documento
# ------------------------------------------------------------------------------------
def titulo(doc, texto, nivel, salto_pagina=False):
    texto = re.sub(r"^\d+(\.\d+)*\.?\s+", "", texto) if nivel == 1 else texto
    p = doc.add_paragraph(style=f"Heading {nivel}")
    if salto_pagina:
        p.paragraph_format.page_break_before = True
    run = p.add_run(texto)
    fijar_fuente(run)
    run.bold = True
    run.italic = nivel == 3
    formato_parrafo(p, sangria=False,
                    alineacion=WD_ALIGN_PARAGRAPH.CENTER if nivel == 1 else WD_ALIGN_PARAGRAPH.LEFT)
    p.paragraph_format.keep_with_next = True
    return p


def leyenda(doc, tipo, titulo_texto):
    contador[tipo] += 1
    p = doc.add_paragraph()
    run = p.add_run(f"{'Tabla' if tipo == 'tabla' else 'Figura'} {contador[tipo]}")
    fijar_fuente(run)
    run.bold = True
    formato_parrafo(p, sangria=False)
    p.paragraph_format.keep_with_next = True
    p2 = doc.add_paragraph()
    run = p2.add_run(titulo_texto)
    fijar_fuente(run)
    run.italic = True
    formato_parrafo(p2, sangria=False)
    p2.paragraph_format.keep_with_next = True


def tabla_md(doc, filas, titulo_texto):
    leyenda(doc, "tabla", titulo_texto)
    celdas = [[c.strip() for c in f.strip().strip("|").split("|")] for f in filas]
    celdas = [f for f in celdas if not all(re.fullmatch(r":?-{3,}:?", c) for c in f)]
    columnas = len(celdas[0])
    tabla = doc.add_table(rows=len(celdas), cols=columnas)
    tabla.alignment = WD_TABLE_ALIGNMENT.CENTER
    # Anchos fijos en cm segun el tipo de tabla (ancho util: 16,5 cm)
    anchos = {5: [0.8, 2.7, 4.0, 4.0, 5.0], 3: [4.0, 7.0, 5.5], 2: [6.0, 10.5]}.get(columnas)
    tabla.autofit = anchos is None
    for i, fila in enumerate(celdas):
        for j in range(columnas):
            valor = fila[j] if j < len(fila) else ""
            celda = tabla.cell(i, j)
            if anchos:
                celda.width = Cm(anchos[j])
            p = celda.paragraphs[0]
            texto_con_formato(p, valor, tamano=10, negrilla=(i == 0))
            formato_parrafo(p, sangria=False, interlineado=1.0, antes=2, despues=2)
            # El encabezado se mantiene en la misma pagina que la primera fila
            p.paragraph_format.keep_with_next = i == 0
    if anchos:
        for j, columna in enumerate(tabla.columns):
            columna.width = Cm(anchos[j])
    repetir_encabezado(tabla.rows[0])
    for fila in tabla.rows:  # ninguna fila se parte entre dos paginas
        no_partir = OxmlElement("w:cantSplit")
        fila._tr.get_or_add_trPr().append(no_partir)
    bordes_tabla_apa(tabla)
    espacio = doc.add_paragraph()
    formato_parrafo(espacio, sangria=False, interlineado=1.0)


def figura(doc, ruta, titulo_texto):
    leyenda(doc, "figura", titulo_texto)
    p = doc.add_paragraph()
    formato_parrafo(p, sangria=False, alineacion=WD_ALIGN_PARAGRAPH.CENTER, interlineado=1.0)
    p.paragraph_format.keep_with_next = True
    p.add_run().add_picture(os.path.join(RAIZ, ruta), width=Inches(6.0))


def bloque_codigo(doc, lineas):
    for linea in lineas:
        p = doc.add_paragraph()
        run = p.add_run(linea if linea else " ")
        fijar_fuente(run, "Consolas", 8.5)
        formato_parrafo(p, sangria=False, interlineado=1.0)
        p.paragraph_format.left_indent = Cm(0.6)
    espacio = doc.add_paragraph()
    formato_parrafo(espacio, sangria=False, interlineado=1.0)


def portada(doc):
    def centrado(texto, negrilla=False, lineas_antes=0):
        for _ in range(lineas_antes):
            formato_parrafo(doc.add_paragraph(), sangria=False)
        p = doc.add_paragraph()
        run = p.add_run(texto)
        fijar_fuente(run)
        run.bold = negrilla
        formato_parrafo(p, sangria=False, alineacion=WD_ALIGN_PARAGRAPH.CENTER)

    centrado("YPRI", negrilla=True, lineas_antes=2)
    centrado("PLATAFORMA DE SERVICIOS A DOMICILIO «TALENTO AL TOQUE»", negrilla=True)
    centrado(MODO["subtitulos"][0], lineas_antes=1)
    for subtitulo in MODO["subtitulos"][1:]:
        centrado(subtitulo)
    centrado("Jann Pierre Ortiz Zambrano", lineas_antes=2)
    centrado("Josué David Rincón Palomino")
    centrado("Diseño Funcional", lineas_antes=1)
    centrado("Docente: Robinson Damián Gómez Sánchez")
    centrado("Fundación de Estudios Superiores Comfanorte", lineas_antes=3)
    centrado("Ingeniería de Software")
    centrado("Octavo semestre")
    centrado("Cúcuta, noviembre de 2026")
    doc.add_paragraph().add_run().add_break(WD_BREAK.PAGE)


def tabla_de_contenido(doc):
    p = doc.add_paragraph()
    run = p.add_run("Tabla de contenido")
    fijar_fuente(run)
    run.bold = True
    formato_parrafo(p, sangria=False, alineacion=WD_ALIGN_PARAGRAPH.CENTER)
    p = doc.add_paragraph()
    formato_parrafo(p, sangria=False, interlineado=1.5)
    agregar_campo(p, 'TOC \\o "' + MODO["niveles_indice"] + '" \\h \\z \\u')


# ------------------------------------------------------------------------------------
# Conversion del Markdown
# ------------------------------------------------------------------------------------
def convertir(doc, lineas):
    i = 0
    ultimo_titulo = ""
    titulo_pendiente = None
    en_referencias = False
    primera_parte = True
    while i < len(lineas):
        linea = lineas[i].rstrip("\n")
        limpia = linea.strip()

        if limpia == "" or limpia == "---":
            i += 1
            continue

        if limpia.startswith("```"):
            bloque = []
            i += 1
            while i < len(lineas) and not lineas[i].strip().startswith("```"):
                bloque.append(lineas[i].rstrip("\n"))
                i += 1
            bloque_codigo(doc, bloque)
            i += 1
            continue

        encabezado = re.match(r"^(#{1,3})\s+(.*)$", limpia)
        if encabezado:
            nivel = len(encabezado.group(1))
            texto = encabezado.group(2).strip()
            if nivel == 1:
                en_referencias = texto.lower().startswith("referencias")
                if en_referencias:
                    texto = "Referencias"
                else:
                    texto = texto.replace("PARTE 1 — ESPAÑOL", "Parte 1. Documentación en español") \
                                 .replace("PART 2 — ENGLISH", "Part 2. Documentation in English")
                salto = en_referencias or (MODO["salto_en_cada_parte"] and not primera_parte)
                titulo(doc, texto, 1, salto_pagina=salto)
                primera_parte = False
            else:
                titulo(doc, texto, nivel)
            ultimo_titulo = re.sub(r"^\d+(\.\d+)*\.?\s+", "", texto)
            titulo_pendiente = None
            i += 1
            continue

        if limpia.startswith("|"):
            filas = []
            while i < len(lineas) and lineas[i].strip().startswith("|"):
                filas.append(lineas[i].strip())
                i += 1
            tabla_md(doc, filas, titulo_pendiente or ultimo_titulo)
            titulo_pendiente = None
            continue

        imagen = re.match(r"^!\[(.*)\]\((.*)\)$", limpia)
        if imagen:
            figura(doc, imagen.group(2), imagen.group(1))
            i += 1
            continue

        solo_negrilla = re.fullmatch(r"\*\*([^*]+)\*\*", limpia)
        if solo_negrilla:
            siguiente = next((l.strip() for l in lineas[i + 1:] if l.strip()), "")
            if siguiente.startswith("|"):
                titulo_pendiente = solo_negrilla.group(1)
            else:
                p = doc.add_paragraph()
                texto_con_formato(p, limpia)
                formato_parrafo(p, sangria=False)
                p.paragraph_format.keep_with_next = True
            i += 1
            continue

        vineta = re.match(r"^-\s+(.*)$", limpia)
        numerado = re.match(r"^(\d+)\.\s+(.*)$", limpia)
        if vineta or numerado:
            p = doc.add_paragraph()
            prefijo = "•\t" if vineta else f"{numerado.group(1)}.\t"
            texto_con_formato(p, prefijo + (vineta.group(1) if vineta else numerado.group(2)))
            formato_parrafo(p, sangria=False)
            p.paragraph_format.left_indent = Cm(1.27)
            p.paragraph_format.first_line_indent = Cm(-0.63)
            p.paragraph_format.tab_stops.add_tab_stop(Cm(1.27))
            i += 1
            continue

        p = doc.add_paragraph()
        texto_con_formato(p, limpia)
        if en_referencias:
            formato_parrafo(p, sangria=False)
            p.paragraph_format.left_indent = Cm(1.27)
            p.paragraph_format.first_line_indent = Cm(-1.27)
        elif limpia.startswith("*Nota.*"):
            formato_parrafo(p, sangria=False)
        else:
            formato_parrafo(p)
        i += 1


def main():
    with open(ENTRADA, encoding="utf-8") as archivo:
        lineas = archivo.readlines()
    # El encabezado del Markdown (titulo y datos) se reemplaza por la portada APA
    inicio = next(n for n, l in enumerate(lineas) if l.startswith(MODO["inicio"]))

    doc = Document()
    seccion = doc.sections[0]
    seccion.page_width, seccion.page_height = Inches(8.5), Inches(11)
    for margen in ("top_margin", "bottom_margin", "left_margin", "right_margin"):
        setattr(seccion, margen, Cm(2.54))

    normal = doc.styles["Normal"]
    normal.font.name = FUENTE
    normal.font.size = Pt(12)
    normal.element.rPr.rFonts.set(qn("w:eastAsia"), FUENTE)
    normal.paragraph_format.line_spacing = 2.0
    normal.paragraph_format.space_after = Pt(0)
    for nivel in (1, 2, 3):
        estilo = doc.styles[f"Heading {nivel}"]
        estilo.font.name = FUENTE
        estilo.font.size = Pt(12)
        estilo.font.color.rgb = NEGRO
        estilo.font.bold = True
        estilo.font.italic = nivel == 3

    # Numero de pagina arriba a la derecha (APA)
    encabezado = seccion.header.paragraphs[0]
    encabezado.alignment = WD_ALIGN_PARAGRAPH.RIGHT
    agregar_campo(encabezado, "PAGE")

    # Idioma espanol de Colombia para la revision ortografica
    estilos = doc.styles.element
    rpr_defecto = estilos.find(qn("w:docDefaults")).find(qn("w:rPrDefault")).find(qn("w:rPr"))
    idioma = OxmlElement("w:lang")
    idioma.set(qn("w:val"), "es-CO")
    rpr_defecto.append(idioma)

    portada(doc)
    tabla_de_contenido(doc)
    doc.add_paragraph().add_run().add_break(WD_BREAK.PAGE)
    convertir(doc, lineas[inicio:])

    os.makedirs(os.path.dirname(SALIDA), exist_ok=True)
    doc.save(SALIDA)
    print(f"OK {SALIDA} | tablas: {contador['tabla']} | figuras: {contador['figura']}")


if __name__ == "__main__":
    main()
