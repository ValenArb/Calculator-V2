import numpy as np
from typing import Dict, List, Any

class ShortCircuitCalculator:
    def __init__(self):
        # Impedancias típicas de transformadores (%)
        self.impedancias_transformador = {
            'pequeno': 4.0,    # < 100 kVA
            'mediano': 5.0,    # 100-1000 kVA  
            'grande': 6.0      # > 1000 kVA
        }
        
        # Factores de multiplicación según norma IEC 60909
        self.factor_tension_max = {
            'baja_tension': 1.1,    # 400V nominal
            'media_tension': 1.1,   # 20kV nominal
            'alta_tension': 1.1     # 132kV nominal
        }
        
        # Resistividades de conductores (Ω·mm²/m)
        self.resistividades = {
            'cobre': 0.01724,
            'aluminio': 0.02826
        }
        
        # Reactancias típicas por configuración (Ω/km por mm²)
        self.reactancias_especificas = {
            'cable_unipolar': 0.08,
            'cable_tripolar': 0.07,
            'conductor_aereo': 0.30,
            'barra_cobre': 0.02
        }

    def calculate(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Calcula la corriente de cortocircuito en un punto específico
        """
        try:
            # Parámetros del sistema
            tension_nominal = data.get('tensionNominal', 380)  # V
            potencia_cc_fuente = data.get('potenciaCCFuente', 1000000)  # VA (1MVA por defecto)
            
            # Parámetros del transformador
            potencia_transformador = data.get('potenciaTransformador', 630000)  # VA
            impedancia_transformador = data.get('impedanciaTransformador', 5.0)  # %
            
            # Parámetros de los conductores
            longitud_cable = data.get('longitudCable', 100)  # m
            seccion_cable = data.get('seccionCable', 240)  # mm²
            material_conductor = data.get('materialConductor', 'cobre')
            tipo_instalacion = data.get('tipoInstalacion', 'cable_tripolar')
            
            # Cálculo de impedancias
            
            # 1. Impedancia de la fuente
            corriente_cc_fuente = potencia_cc_fuente / (np.sqrt(3) * tension_nominal)
            impedancia_fuente = tension_nominal / (np.sqrt(3) * corriente_cc_fuente)
            
            # 2. Impedancia del transformador
            impedancia_base = (tension_nominal ** 2) / potencia_transformador
            impedancia_trafo = (impedancia_transformador / 100) * impedancia_base
            
            # 3. Impedancia de los cables
            resistividad = self.resistividades.get(material_conductor, 0.01724)
            resistencia_cable = (resistividad * longitud_cable) / (1000 * seccion_cable)
            
            reactancia_especifica = self.reactancias_especificas.get(tipo_instalacion, 0.07)
            reactancia_cable = (reactancia_especifica * longitud_cable) / (1000 * seccion_cable)
            
            impedancia_cable = np.sqrt(resistencia_cable**2 + reactancia_cable**2)
            
            # 4. Impedancia total del circuito
            # Las impedancias se suman como números complejos
            # Aproximamos que fuente y transformador son principalmente reactivos
            resistencia_total = resistencia_cable
            reactancia_total = impedancia_fuente + impedancia_trafo + reactancia_cable
            impedancia_total = np.sqrt(resistencia_total**2 + reactancia_total**2)
            
            # Relación X/R para cálculo de corriente pico
            x_r_ratio = reactancia_total / resistencia_total if resistencia_total > 0 else 10
            
            # 5. Corriente de cortocircuito
            factor_tension = self.factor_tension_max.get('baja_tension', 1.1)
            tension_max = tension_nominal * factor_tension
            
            # Corriente de cortocircuito inicial simétrica (Ik'')
            corriente_cc_inicial = tension_max / (np.sqrt(3) * impedancia_total)
            
            # Corriente de cortocircuito pico (ip) - IEC 60909
            # Factor pico basado en relación X/R
            if x_r_ratio <= 1:
                factor_pico = 1.02 + 0.98 * np.exp(-3 * resistencia_total / reactancia_total)
            elif x_r_ratio <= 3:
                factor_pico = 1.02 + 0.98 * np.exp(-3 / x_r_ratio)
            else:
                factor_pico = 1.8  # Valor típico para X/R altos
            
            corriente_cc_pico = corriente_cc_inicial * factor_pico * np.sqrt(2)
            
            # Corriente de cortocircuito de régimen permanente (Ik)
            # En BT, generalmente igual a Ik''
            corriente_cc_permanente = corriente_cc_inicial
            
            # 6. Parámetros para selección de equipos
            
            # Poder de corte necesario
            poder_corte = np.sqrt(3) * tension_nominal * corriente_cc_inicial / 1000  # kA
            
            # Corriente térmica equivalente (para 1 segundo)
            tiempo_eliminacion = data.get('tiempoEliminacion', 0.2)  # s
            corriente_termica = corriente_cc_inicial * np.sqrt(tiempo_eliminacion)
            
            # Energía específica pasante (I²t)
            energia_especifica = (corriente_cc_inicial ** 2) * tiempo_eliminacion
            
            # Verificaciones
            corriente_nominal_proteccion = data.get('corrienteNominalProteccion', 0)
            poder_corte_proteccion = data.get('poderCorteProteccion', 0)
            
            verificacion_poder_corte = poder_corte <= poder_corte_proteccion if poder_corte_proteccion > 0 else None
            
            result = {
                'id': data['id'],
                'punto': data.get('punto', ''),
                'tension_nominal': tension_nominal,
                'impedancia_fuente': round(impedancia_fuente, 6),
                'impedancia_transformador': round(impedancia_trafo, 6),
                'resistencia_cable': round(resistencia_cable, 6),
                'reactancia_cable': round(reactancia_cable, 6),
                'impedancia_cable': round(impedancia_cable, 6),
                'impedancia_total': round(impedancia_total, 6),
                'corriente_cc_inicial': round(corriente_cc_inicial, 2),
                'corriente_cc_pico': round(corriente_cc_pico, 2),
                'corriente_cc_permanente': round(corriente_cc_permanente, 2),
                'poder_corte_necesario': round(poder_corte, 2),
                'corriente_termica': round(corriente_termica, 2),
                'energia_especifica': round(energia_especifica, 2),
                'tiempo_eliminacion': tiempo_eliminacion,
                'verificacion_poder_corte': verificacion_poder_corte,
                'recomendacion': self._get_recomendacion(corriente_cc_inicial, poder_corte, verificacion_poder_corte)
            }
            
            return result
            
        except Exception as e:
            raise Exception(f"Error en cálculo de cortocircuito: {str(e)}")

    def _get_recomendacion(self, corriente_cc: float, poder_corte: float, verificacion_ok: bool) -> str:
        """
        Genera recomendación para protecciones
        """
        if verificacion_ok is False:
            return f"CRÍTICO - Poder de corte insuficiente. Se requiere ≥{poder_corte:.1f} kA"
        elif corriente_cc > 50000:
            return "ADVERTENCIA - Corriente muy alta. Verificar coordinación de protecciones"
        elif corriente_cc < 1000:
            return "ATENCIÓN - Corriente baja. Verificar sensibilidad de protecciones"
        else:
            return f"NORMAL - Icc = {corriente_cc:.0f} A, Poder corte req. = {poder_corte:.1f} kA"

    def calculate_fault_levels(self, puntos: List[Dict[str, Any]]) -> Dict[str, Any]:
        """
        Calcula niveles de falla para múltiples puntos del sistema
        """
        try:
            results = []
            corriente_max = 0
            corriente_min = float('inf')
            
            for punto in puntos:
                result = self.calculate(punto)
                results.append(result)
                
                cc_inicial = result['corriente_cc_inicial']
                if cc_inicial > corriente_max:
                    corriente_max = cc_inicial
                if cc_inicial < corriente_min:
                    corriente_min = cc_inicial
            
            # Análisis de coordinación
            escalones_corriente = [r['corriente_cc_inicial'] for r in results]
            factor_coordinacion = corriente_max / corriente_min if corriente_min > 0 else 0
            
            return {
                'resultados_detallados': results,
                'resumen': {
                    'total_puntos': len(puntos),
                    'corriente_cc_maxima': round(corriente_max, 2),
                    'corriente_cc_minima': round(corriente_min, 2),
                    'factor_coordinacion': round(factor_coordinacion, 2),
                    'poder_corte_max_requerido': round(max([r['poder_corte_necesario'] for r in results]), 2),
                    'energia_max_pasante': round(max([r['energia_especifica'] for r in results]), 2),
                    'recomendacion_general': self._get_recomendacion_sistema(factor_coordinacion, corriente_max)
                }
            }
            
        except Exception as e:
            raise Exception(f"Error en análisis de niveles de falla: {str(e)}")

    def _get_recomendacion_sistema(self, factor_coordinacion: float, corriente_max: float) -> str:
        """
        Recomendación general del sistema
        """
        if factor_coordinacion > 10:
            return "Sistema con amplio rango de corrientes - Verificar coordinación selectiva"
        elif corriente_max > 50000:
            return "Altas corrientes de CC - Considerar limitadores de corriente"
        elif factor_coordinacion < 2:
            return "Corrientes de CC similares - Facilita coordinación de protecciones"
        else:
            return "Sistema con niveles de falla adecuados para coordinación"

    def suggest_protection_settings(self, corriente_cc: float, corriente_nominal: float) -> Dict[str, Any]:
        """
        Sugiere ajustes para protecciones basado en corrientes de cortocircuito
        """
        try:
            # Ajustes típicos para protección diferencial
            ajuste_diferencial = max(0.03, corriente_nominal * 0.1)  # 30mA mínimo
            
            # Ajustes para protección de sobrecorriente
            ajuste_sobrecorriente = corriente_nominal * 1.25  # 125% In
            
            # Poder de corte requerido con margen de seguridad
            poder_corte_req = (corriente_cc / 1000) * 1.25  # 25% margen
            
            # Tiempo de actuación máximo
            tiempo_max = 4 / corriente_cc if corriente_cc > 0 else 0.1  # Según curva I²t
            
            return {
                'ajuste_diferencial_recomendado': round(ajuste_diferencial, 3),
                'ajuste_sobrecorriente_recomendado': round(ajuste_sobrecorriente, 2),
                'poder_corte_minimo': round(poder_corte_req, 1),
                'tiempo_actuacion_maximo': round(tiempo_max, 3),
                'clase_limitacion_recomendada': 3 if corriente_cc > 10000 else 1
            }
            
        except Exception as e:
            raise Exception(f"Error en sugerencia de ajustes: {str(e)}")