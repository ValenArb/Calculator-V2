import numpy as np
from typing import Dict, List, Any

class ThermalCalculator:
    def __init__(self):
        # Capacidades de corriente para conductores de cobre (A)
        # Basado en normas internacionales - condiciones estándar
        self.capacidades_corriente = {
            # Cable unipolar en bandeja perforada - 90°C
            1.5: 18,
            2.5: 25,
            4: 32,
            6: 41,
            10: 57,
            16: 76,
            25: 101,
            35: 125,
            50: 151,
            70: 192,
            95: 232,
            120: 269,
            150: 309,
            185: 353,
            240: 415,
            300: 477,
            400: 551
        }
        
        # Factores de corrección por temperatura ambiente
        self.factores_temperatura = {
            30: 1.15,
            35: 1.08,
            40: 1.00,
            45: 0.91,
            50: 0.82,
            55: 0.71,
            60: 0.58
        }
        
        # Factores de corrección por agrupamiento
        self.factores_agrupamiento = {
            1: 1.00,
            2: 0.80,
            3: 0.70,
            4: 0.65,
            5: 0.60,
            6: 0.57,
            7: 0.54,
            8: 0.52,
            9: 0.50
        }
        
        # Resistividad del cobre (Ω·mm²/m) a 20°C
        self.resistividad_cobre = 0.01724

    def calculate(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Verifica la capacidad térmica de un conductor
        """
        try:
            corriente_diseño = data.get('corriente', 0)
            seccion = data.get('seccion', 2.5)
            temperatura_ambiente = data.get('temperatura', 40)
            cantidad_conductores = data.get('cantidadConductores', 3)
            
            # Obtener capacidad de corriente base
            capacidad_base = self.capacidades_corriente.get(seccion, 0)
            
            if capacidad_base == 0:
                # Interpolación para secciones no estándar
                secciones = list(self.capacidades_corriente.keys())
                capacidades = list(self.capacidades_corriente.values())
                capacidad_base = np.interp(seccion, secciones, capacidades)
            
            # Factor de corrección por temperatura
            temperaturas = list(self.factores_temperatura.keys())
            factores_temp = list(self.factores_temperatura.values())
            factor_temperatura = np.interp(temperatura_ambiente, temperaturas, factores_temp)
            
            # Factor de corrección por agrupamiento
            factor_agrupamiento = self.factores_agrupamiento.get(
                min(cantidad_conductores, 9), 0.50
            )
            
            # Capacidad corregida
            capacidad_corregida = capacidad_base * factor_temperatura * factor_agrupamiento
            
            # Verificación térmica
            margen_seguridad = 1.25  # Factor de seguridad típico
            corriente_maxima_permitida = capacidad_corregida / margen_seguridad
            
            verificacion_ok = corriente_diseño <= corriente_maxima_permitida
            
            # Porcentaje de utilización
            porcentaje_utilizacion = (corriente_diseño / corriente_maxima_permitida) * 100 if corriente_maxima_permitida > 0 else 0
            
            # Cálculo de resistencia del conductor (Ω/km)
            resistencia_20c = self.resistividad_cobre / seccion
            
            # Cálculo de temperatura de operación basado en corriente
            # Usando aproximación térmica: ΔT = I²R·Rth
            resistencia_termica_aprox = 3.5  # K·m/W (valor típico para cables)
            temperatura_elevacion = (corriente_diseño ** 2) * resistencia_20c * resistencia_termica_aprox
            temperatura_operacion = temperatura_ambiente + temperatura_elevacion
            
            # Limitamos la temperatura a valores realistas
            temperatura_operacion = min(temperatura_operacion, 90)  # Límite térmico típico
            
            # Corrección por temperatura de operación
            alfa_cobre = 0.00393  # Coeficiente de temperatura del cobre
            resistencia_operacion = resistencia_20c * (1 + alfa_cobre * (temperatura_operacion - 20))
            
            # Pérdidas de potencia por metro (W/m)
            perdidas_por_metro = (corriente_diseño ** 2) * (resistencia_operacion / 1000)
            
            result = {
                'id': data['id'],
                'circuito': data.get('circuito', ''),
                'corriente_diseño': round(corriente_diseño, 2),
                'seccion': seccion,
                'capacidad_base': round(capacidad_base, 2),
                'temperatura_ambiente': temperatura_ambiente,
                'cantidad_conductores': cantidad_conductores,
                'factor_temperatura': round(factor_temperatura, 3),
                'factor_agrupamiento': round(factor_agrupamiento, 3),
                'capacidad_corregida': round(capacidad_corregida, 2),
                'corriente_maxima_permitida': round(corriente_maxima_permitida, 2),
                'verificacion_ok': verificacion_ok,
                'porcentaje_utilizacion': round(porcentaje_utilizacion, 1),
                'resistencia_20c': round(resistencia_20c, 4),
                'resistencia_operacion': round(resistencia_operacion, 4),
                'perdidas_por_metro': round(perdidas_por_metro, 3),
                'recomendacion': self._get_recomendacion(verificacion_ok, porcentaje_utilizacion)
            }
            
            return result
            
        except Exception as e:
            raise Exception(f"Error en cálculo térmico: {str(e)}")

    def _get_recomendacion(self, verificacion_ok: bool, porcentaje: float) -> str:
        """
        Genera recomendación basada en la verificación
        """
        if not verificacion_ok:
            return "RECHAZADO - Aumentar sección del conductor"
        elif porcentaje > 90:
            return "CRÍTICO - Considerar aumentar sección"
        elif porcentaje > 75:
            return "ADVERTENCIA - Verificar condiciones de instalación"
        elif porcentaje > 50:
            return "ACEPTABLE - Dentro de parámetros normales"
        else:
            return "SOBRADIMENSIONADO - Sección mayor a la necesaria"

    def suggest_optimal_section(self, corriente_diseño: float, 
                              temperatura_ambiente: float = 40,
                              cantidad_conductores: int = 3) -> Dict[str, Any]:
        """
        Sugiere la sección óptima para una corriente dada
        """
        try:
            secciones_disponibles = sorted(self.capacidades_corriente.keys())
            
            for seccion in secciones_disponibles:
                # Simular cálculo con esta sección
                temp_data = {
                    'corriente': corriente_diseño,
                    'seccion': seccion,
                    'temperatura': temperatura_ambiente,
                    'cantidadConductores': cantidad_conductores
                }
                
                resultado = self.calculate(temp_data)
                
                if resultado['verificacion_ok'] and resultado['porcentaje_utilizacion'] <= 80:
                    return {
                        'seccion_recomendada': seccion,
                        'capacidad_util': resultado['corriente_maxima_permitida'],
                        'porcentaje_utilizacion': resultado['porcentaje_utilizacion'],
                        'margen_seguridad': resultado['corriente_maxima_permitida'] - corriente_diseño
                    }
            
            # Si ninguna sección estándar es suficiente
            return {
                'seccion_recomendada': max(secciones_disponibles),
                'nota': 'Verificar con fabricante para secciones especiales'
            }
            
        except Exception as e:
            raise Exception(f"Error al sugerir sección: {str(e)}")

    def calculate_multiple_circuits(self, circuits: List[Dict[str, Any]]) -> Dict[str, Any]:
        """
        Calcula verificación térmica para múltiples circuitos
        """
        try:
            results = []
            total_perdidas = 0
            circuitos_ok = 0
            
            for circuit in circuits:
                result = self.calculate(circuit)
                results.append(result)
                
                if result['verificacion_ok']:
                    circuitos_ok += 1
                
                # Asumir longitud típica de 50m para pérdidas totales
                total_perdidas += result['perdidas_por_metro'] * 50
            
            return {
                'resultados_detallados': results,
                'resumen': {
                    'total_circuitos': len(circuits),
                    'circuitos_aprobados': circuitos_ok,
                    'circuitos_rechazados': len(circuits) - circuitos_ok,
                    'porcentaje_aprobacion': round((circuitos_ok / len(circuits)) * 100, 1) if circuits else 0,
                    'perdidas_totales_estimadas': round(total_perdidas, 2)
                }
            }
            
        except Exception as e:
            raise Exception(f"Error en cálculo múltiple: {str(e)}")