import numpy as np
from typing import Dict, List, Any

class VoltageDropCalculator:
    def __init__(self):
        # Resistividad de materiales (Ω·mm²/m) a 20°C
        self.resistividades = {
            'cobre': 0.01724,
            'aluminio': 0.02826
        }
        
        # Reactancias típicas por tipo de instalación (Ω/km)
        self.reactancias = {
            'cable_unipolar_bandeja': 0.08,
            'cable_multipolar': 0.07,
            'conductor_desnudo': 0.30
        }
        
        # Límites de caída de tensión según tipo de circuito (%)
        self.limites_caida = {
            'alimentacion_principal': 1.0,
            'circuito_fuerza': 3.0,
            'circuito_iluminacion': 3.0,
            'circuito_tomas': 5.0,
            'emergencia': 2.0
        }
        
        # Tensiones nominales estándar
        self.tensiones_nominales = {
            'monofasica': 220,
            'bifasica': 380,
            'trifasica': 380,
            'baja_tension': 220,
            'media_tension': 13200
        }

    def calculate(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Calcula la caída de tensión en un circuito
        """
        try:
            # Parámetros de entrada
            corriente = data.get('corriente', 0)
            longitud = data.get('longitud', 0)  # metros
            seccion = data.get('seccion', 2.5)  # mm²
            tension_nominal = data.get('tensionNominal', 220)  # V
            tipo_circuito = data.get('tipoCircuito', 'circuito_tomas')
            material_conductor = data.get('materialConductor', 'cobre')
            tipo_instalacion = data.get('tipoInstalacion', 'cable_multipolar')
            cos_phi = data.get('cosPhi', 0.92)
            temperatura_operacion = data.get('temperaturaOperacion', 70)
            
            # Calcular resistencia del conductor
            resistividad = self.resistividades.get(material_conductor, 0.01724)
            
            # Corrección por temperatura
            if material_conductor == 'cobre':
                alfa = 0.00393
            else:
                alfa = 0.00403
                
            factor_temperatura = 1 + alfa * (temperatura_operacion - 20)
            resistencia_por_km = (resistividad * factor_temperatura) / seccion
            resistencia_total = resistencia_por_km * (longitud / 1000)
            
            # Reactancia del circuito
            reactancia_por_km = self.reactancias.get(tipo_instalacion, 0.08)
            reactancia_total = reactancia_por_km * (longitud / 1000)
            
            # Impedancia total
            impedancia = np.sqrt(resistencia_total**2 + reactancia_total**2)
            
            # Cálculo de caída de tensión
            sin_phi = np.sqrt(1 - cos_phi**2) if cos_phi < 1 else 0
            
            # Caída de tensión (V) - Fórmula exacta
            caida_resistiva = corriente * resistencia_total
            caida_reactiva = corriente * reactancia_total * sin_phi
            
            # Componentes de caída de tensión
            caida_activa = corriente * (resistencia_total * cos_phi + reactancia_total * sin_phi)
            caida_reactiva_comp = corriente * (reactancia_total * cos_phi - resistencia_total * sin_phi)
            
            # Caída de tensión total (fórmula exacta)
            caida_total_v = np.sqrt(caida_activa**2 + caida_reactiva_comp**2)
            
            # Para circuitos trifásicos, la caída ya está calculada correctamente
            # No se requiere factor √3 adicional ya que se considera en el cálculo de corriente
            
            # Caída de tensión porcentual
            caida_porcentual = (caida_total_v / tension_nominal) * 100
            
            # Verificar límites
            limite_permitido = self.limites_caida.get(tipo_circuito, 5.0)
            verificacion_ok = caida_porcentual <= limite_permitido
            
            # Tensión en el punto de consumo
            tension_consumo = tension_nominal - caida_total_v
            
            # Pérdidas de potencia
            perdidas_activas = corriente**2 * resistencia_total
            perdidas_reactivas = corriente**2 * reactancia_total
            perdidas_totales = np.sqrt(perdidas_activas**2 + perdidas_reactivas**2)
            
            result = {
                'id': data['id'],
                'circuito': data.get('circuito', ''),
                'corriente': round(corriente, 2),
                'longitud': longitud,
                'seccion': seccion,
                'tension_nominal': tension_nominal,
                'material_conductor': material_conductor,
                'resistencia_total': round(resistencia_total, 6),
                'reactancia_total': round(reactancia_total, 6),
                'impedancia_total': round(impedancia, 6),
                'caida_resistiva': round(caida_resistiva, 3),
                'caida_reactiva': round(caida_reactiva, 3),
                'caida_tension_v': round(caida_total_v, 3),
                'caida_tension_porcentual': round(caida_porcentual, 3),
                'limite_permitido': limite_permitido,
                'verificacion_ok': verificacion_ok,
                'tension_consumo': round(tension_consumo, 2),
                'perdidas_activas': round(perdidas_activas, 3),
                'perdidas_reactivas': round(perdidas_reactivas, 3),
                'perdidas_totales': round(perdidas_totales, 3),
                'eficiencia': round(((tension_consumo * corriente * cos_phi) / (tension_nominal * corriente * cos_phi)) * 100, 2),
                'recomendacion': self._get_recomendacion(verificacion_ok, caida_porcentual, limite_permitido)
            }
            
            return result
            
        except Exception as e:
            raise Exception(f"Error en cálculo de caída de tensión: {str(e)}")

    def _get_recomendacion(self, verificacion_ok: bool, caida_actual: float, limite: float) -> str:
        """
        Genera recomendación basada en la verificación
        """
        if not verificacion_ok:
            return f"RECHAZADO - Caída excesiva ({caida_actual:.2f}% > {limite}%). Aumentar sección o reducir longitud"
        elif caida_actual > limite * 0.8:
            return f"ADVERTENCIA - Próximo al límite ({caida_actual:.2f}% de {limite}%)"
        elif caida_actual > limite * 0.5:
            return f"ACEPTABLE - Dentro de parámetros normales ({caida_actual:.2f}%)"
        else:
            return f"EXCELENTE - Caída mínima ({caida_actual:.2f}%)"

    def suggest_optimal_section(self, corriente: float, longitud: float, 
                              tension_nominal: float = 220,
                              tipo_circuito: str = 'circuito_tomas',
                              cos_phi: float = 0.92) -> Dict[str, Any]:
        """
        Sugiere la sección óptima para cumplir con límites de caída de tensión
        """
        try:
            secciones_disponibles = [1.5, 2.5, 4, 6, 10, 16, 25, 35, 50, 70, 95, 120, 150, 185, 240, 300]
            limite = self.limites_caida.get(tipo_circuito, 5.0)
            
            for seccion in secciones_disponibles:
                temp_data = {
                    'id': 'temp',
                    'corriente': corriente,
                    'longitud': longitud,
                    'seccion': seccion,
                    'tensionNominal': tension_nominal,
                    'tipoCircuito': tipo_circuito,
                    'cosPhi': cos_phi
                }
                
                resultado = self.calculate(temp_data)
                
                if resultado['verificacion_ok'] and resultado['caida_tension_porcentual'] <= limite * 0.8:
                    return {
                        'seccion_recomendada': seccion,
                        'caida_tension': resultado['caida_tension_porcentual'],
                        'tension_consumo': resultado['tension_consumo'],
                        'margen_seguridad': limite - resultado['caida_tension_porcentual']
                    }
            
            return {
                'seccion_recomendada': max(secciones_disponibles),
                'nota': 'Verificar si es necesario reducir longitud o usar tensión mayor'
            }
            
        except Exception as e:
            raise Exception(f"Error al sugerir sección para caída de tensión: {str(e)}")

    def calculate_voltage_profile(self, circuitos: List[Dict[str, Any]]) -> Dict[str, Any]:
        """
        Calcula el perfil de tensión para múltiples puntos en un sistema
        """
        try:
            results = []
            total_perdidas = 0
            circuitos_ok = 0
            
            for circuito in circuitos:
                result = self.calculate(circuito)
                results.append(result)
                
                if result['verificacion_ok']:
                    circuitos_ok += 1
                
                total_perdidas += result['perdidas_totales']
            
            # Análisis del perfil
            tensiones_consumo = [r['tension_consumo'] for r in results]
            tension_minima = min(tensiones_consumo) if tensiones_consumo else 0
            tension_maxima = max(tensiones_consumo) if tensiones_consumo else 0
            
            return {
                'resultados_detallados': results,
                'resumen': {
                    'total_circuitos': len(circuitos),
                    'circuitos_aprobados': circuitos_ok,
                    'circuitos_rechazados': len(circuitos) - circuitos_ok,
                    'porcentaje_aprobacion': round((circuitos_ok / len(circuitos)) * 100, 1) if circuitos else 0,
                    'tension_minima_sistema': round(tension_minima, 2),
                    'tension_maxima_sistema': round(tension_maxima, 2),
                    'diferencia_tension': round(tension_maxima - tension_minima, 2),
                    'perdidas_totales': round(total_perdidas, 2)
                }
            }
            
        except Exception as e:
            raise Exception(f"Error en cálculo de perfil de tensión: {str(e)}")