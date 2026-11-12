"""
========================================================================================
SUITE DE PRUEBAS AUTOMATIZADAS — GEOLOCALIZACION Y GEORREFERENCIACION
Profesionales cercanos, tiempo de llegada y seguimiento simulado
========================================================================================
Asignatura: Diseño Funcional | Unidad 2: Estructuras de Datos
Institución: Fundación de Estudios Superiores Comfanorte (FESC) - 2026
Integrantes: Jann Pierre Ortiz Zambrano y Josué David Rincón Palomino
========================================================================================
Ejecutar desde la carpeta backend:  python tests_geolocalizacion.py
"""

import io
import os
import sys
import unittest
from contextlib import redirect_stdout

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from data.database import servicios
from modules.geolocalizacion import (
    BARRIOS_CUCUTA,
    CENTRO_CIUDAD,
    buscar_servicios_cercanos,
    calcular_cercania,
    distancia_haversine,
    formatear_distancia,
    interpolar_posicion,
    mostrar_servicios_cercanos,
    profesional_mas_cercano,
    simular_seguimiento,
    tiempo_llegada_min,
)


def barrio(nombre):
    for nombre_barrio, lat, lng in BARRIOS_CUCUTA:
        if nombre_barrio == nombre:
            return lat, lng
    raise ValueError(nombre)


class TestFormulas(unittest.TestCase):
    def test_distancia_cero_y_simetrica(self):
        lat, lng = CENTRO_CIUDAD["Cucuta"]
        self.assertEqual(distancia_haversine(lat, lng, lat, lng), 0)
        a, b = barrio("Caobos"), barrio("Atalaya")
        self.assertAlmostEqual(distancia_haversine(*a, *b), distancia_haversine(*b, *a), places=10)

    def test_distancias_conocidas(self):
        self.assertAlmostEqual(distancia_haversine(0, 0, 1, 0), 111.19, places=1)
        cucuta_bogota = distancia_haversine(*CENTRO_CIUDAD["Cucuta"], *CENTRO_CIUDAD["Bogota"])
        self.assertTrue(380 < cucuta_bogota < 420)

    def test_tiempo_llegada(self):
        lat, lng = CENTRO_CIUDAD["Cucuta"]
        self.assertEqual(tiempo_llegada_min(lat, lng, lat, lng), 5)
        self.assertGreater(tiempo_llegada_min(*barrio("Atalaya"), *barrio("Prados del Este")), 15)

    def test_interpolar_y_formato(self):
        self.assertEqual(interpolar_posicion((0, 0), (2, 4), 0.5), (1, 2))
        self.assertEqual(interpolar_posicion((0, 0), (2, 4), 3), (2, 4))
        self.assertEqual(formatear_distancia(0.42), "400 m")
        self.assertEqual(formatear_distancia(2.345), "2,3 km")


class TestCercania(unittest.TestCase):
    def test_ordenados_por_distancia(self):
        resultados = buscar_servicios_cercanos(servicios, *barrio("Caobos"))
        self.assertEqual(resultados[0]["servicio"]["codigo"], "SERV-01")
        distancias = [r["distancia_km"] for r in resultados]
        self.assertEqual(distancias, sorted(distancias))

    def test_radio_de_cobertura(self):
        sandra = next(s for s in servicios if s["codigo"] == "SERV-05")
        self.assertTrue(calcular_cercania(sandra, *barrio("Atalaya"))["en_cobertura"])
        # Mas de 8 km al norte de Atalaya: fuera de su radio.
        self.assertFalse(calcular_cercania(sandra, sandra["lat"] + 0.09, sandra["lng"])["en_cobertura"])

    def test_filtros(self):
        lat, lng = barrio("Centro")
        limpieza = buscar_servicios_cercanos(servicios, lat, lng, categoria="Limpieza")
        self.assertEqual([r["servicio"]["codigo"] for r in limpieza], ["SERV-05"])
        disponibles = buscar_servicios_cercanos(servicios, lat, lng, solo_disponibles=True)
        self.assertTrue(all(r["servicio"]["disponible"] for r in disponibles))
        self.assertEqual([r["servicio"]["codigo"] for r in buscar_servicios_cercanos(servicios, lat, lng, radio_max_km=1)], ["SERV-04"])

    def test_mas_cercano(self):
        self.assertEqual(profesional_mas_cercano(servicios, *barrio("Prados del Este"))["servicio"]["codigo"], "SERV-01")
        self.assertIsNone(profesional_mas_cercano(servicios, *CENTRO_CIUDAD["Medellin"]))

    def test_procedimiento_imprime_tabla(self):
        salida = io.StringIO()
        with redirect_stdout(salida):
            resultado = mostrar_servicios_cercanos(buscar_servicios_cercanos(servicios, *barrio("Centro")), "Centro")
        self.assertIsNone(resultado)
        self.assertIn("Jorge Mendoza", salida.getvalue())


class TestSeguimiento(unittest.TestCase):
    def test_recorrido_simulado(self):
        origen, destino = barrio("Caobos"), barrio("Centro")
        inicio = simular_seguimiento(origen, destino, 0, 60)
        mitad = simular_seguimiento(origen, destino, 30, 60)
        fin = simular_seguimiento(origen, destino, 90, 60)
        self.assertEqual(inicio["posicion"], origen)
        self.assertEqual(mitad["progreso"], 0.5)
        self.assertLess(mitad["minutos_restantes"], inicio["minutos_restantes"])
        self.assertTrue(fin["llego"])
        self.assertEqual(fin["minutos_restantes"], 0)


if __name__ == "__main__":
    unittest.main(verbosity=2)
