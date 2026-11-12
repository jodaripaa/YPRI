"""
========================================================================================
SUITE DE PRUEBAS AUTOMATIZADAS — BUSQUEDA RAPIDA Y PEDIDO INMEDIATO
Catalogo de palabras clave, posicion actual del operario y asignacion inmediata
========================================================================================
Asignatura: Diseño Funcional | Unidad 2: Estructuras de Datos
Institución: Fundación de Estudios Superiores Comfanorte (FESC) - 2026
Integrantes: Jann Pierre Ortiz Zambrano y Josué David Rincón Palomino
========================================================================================
Ejecutar desde la carpeta backend:  python tests_pedido_rapido.py
"""

import os
import sys
import unittest

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from data.database import servicios
from modules.geolocalizacion import BARRIOS_CUCUTA, barrio_mas_cercano, candidatos_pedido_inmediato, posicion_actual
from modules.palabras_clave import (
    detectar_categorias,
    distancia_edicion,
    interpretar_necesidad,
    normalizar,
    parece_urgente,
)


def barrio(nombre):
    return next((lat, lng) for n, lat, lng in BARRIOS_CUCUTA if n == nombre)


def categoria_de(texto):
    detectada = interpretar_necesidad(texto)
    return detectada["categoria"] if detectada else None


# Contrato "En proceso" de Carlos (SERV-01) en La Playa, para simular que esta ocupado.
CONTRATOS_PRUEBA = [
    {"id": "CONTR-900", "servicio_codigo": "SERV-01", "estado": "En proceso", "lat": 7.8935, "lng": -72.4995},
]


class TestPalabrasClave(unittest.TestCase):
    def test_normalizar(self):
        self.assertEqual(normalizar("¡Se fue la LUZ en el baño!"), "se fue la luz en el bano")

    def test_frases_cotidianas(self):
        self.assertEqual(categoria_de("se me quedaron las llaves por dentro"), "Cerrajeria")
        self.assertEqual(categoria_de("se fue la luz en la cocina"), "Electricidad")
        self.assertEqual(categoria_de("necesito un plomero"), "Plomeria")
        self.assertEqual(categoria_de("el aire acondicionado no enfría"), "Climatizacion")
        self.assertEqual(categoria_de("señora del aseo para el sábado"), "Limpieza")

    def test_frase_exacta_gana(self):
        self.assertEqual(categoria_de("se daño la llave de agua"), "Plomeria")
        self.assertEqual(categoria_de("perdí la llave de la casa"), "Cerrajeria")

    def test_errores_de_escritura(self):
        self.assertEqual(distancia_edicion("electrisista", "electricista"), 1)
        self.assertEqual(categoria_de("electrisista"), "Electricidad")
        self.assertEqual(categoria_de("cerrajer"), "Cerrajeria")

    def test_sin_relacion(self):
        self.assertIsNone(interpretar_necesidad("hola"))
        self.assertEqual(detectar_categorias(""), [])

    def test_urgencia(self):
        self.assertTrue(parece_urgente("urgente, me quedé por fuera"))
        self.assertFalse(parece_urgente("limpieza para el próximo mes"))


class TestPedidoInmediato(unittest.TestCase):
    def test_posicion_actual(self):
        carlos = next(s for s in servicios if s["codigo"] == "SERV-01")
        ocupado = posicion_actual(carlos, CONTRATOS_PRUEBA)
        self.assertTrue(ocupado["en_servicio"])
        self.assertEqual(ocupado["zona_referencia"], "La Playa")
        libre = posicion_actual(carlos, [])
        self.assertFalse(libre["en_servicio"])
        self.assertEqual(libre["zona_referencia"], "Caobos")

    def test_barrio_mas_cercano(self):
        self.assertEqual(barrio_mas_cercano(7.8937, -72.4993)[0], "La Playa")

    def test_asignacion(self):
        electricistas = candidatos_pedido_inmediato(servicios, CONTRATOS_PRUEBA, *barrio("Caobos"), "Electricidad")
        self.assertIsNone(electricistas["asignado"])
        self.assertEqual([c["servicio"]["codigo"] for c in electricistas["ocupados"]], ["SERV-01"])
        cerrajeros = candidatos_pedido_inmediato(servicios, CONTRATOS_PRUEBA, *barrio("Centro"), "Cerrajeria")
        self.assertEqual(cerrajeros["asignado"]["servicio"]["codigo"], "SERV-04")
        climatizacion = candidatos_pedido_inmediato(servicios, [], *barrio("Prados del Este"), "Climatizacion")
        self.assertIsNone(climatizacion["asignado"])


if __name__ == "__main__":
    unittest.main(verbosity=2)
