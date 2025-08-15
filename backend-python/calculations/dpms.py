import numpy as np
from typing import Dict, List, Any

class DPMSCalculator:
    def __init__(self):
        # Factores de demanda por grado de electrificación
        self.factores_demanda = {
            'Básico': {
                'TUG': 0.8,
                'IUG': 1.0,
                'ATE': 1.0,
                'ACU': 0.6,
                'TUE': 1.0,
                'OCE': 1.0
            },
            'Medio': {
                'TUG': 0.75,
                'IUG': 1.0,
                'ATE': 1.0,
                'ACU': 0.7,
                'TUE': 1.0,
                'OCE': 1.0
            },
            'Superior': {
                'TUG': 0.7,
                'IUG': 1.0,
                'ATE': 1.0,
                'ACU': 0.8,
                'TUE': 1.0,
                'OCE': 1.0
            },
            'Especial': {
                'TUG': 0.65,
                'IUG': 1.0,
                'ATE': 1.0,
                'ACU': 0.9,
                'TUE': 1.0,
                'OCE': 1.0
            }
        }
        
        # Potencias unitarias por tipo de carga [VA]
        self.potencias_unitarias = {
            'TUG': 180,  # Tomas de uso general
            'IUG': 300,  # Iluminación de uso general
            'ATE': 600,  # Aparatos de climatización
            'ACU': 1000, # Acondicionadores de aire
            'TUE': 500,  # Tomas de uso específico
            'OCE': 200   # Otras cargas eléctricas
        }

    def calculate(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Calcula DPMS para un tablero/ambiente específico
        """
        try:
            # Calcular superficie
            superficie = data['dimensiones']['x'] * data['dimensiones']['y']
            
            # Obtener factor de demanda
            grado = data.get('gradoElectrificacion', 'Medio')
            factores = self.factores_demanda.get(grado, self.factores_demanda['Medio'])
            
            # Calcular DPMS por tipo de carga
            dpms_por_tipo = {}
            dpms_total = 0
            corriente_total = 0
            
            for tipo_carga, cargas in data['cargas'].items():
                if not cargas:
                    dpms_por_tipo[tipo_carga] = {
                        'potencia_instalada': 0,
                        'factor_demanda': factores.get(tipo_carga, 1.0),
                        'dpms': 0,
                        'corriente': 0
                    }
                    continue
                
                # Calcular potencia instalada
                potencia_instalada = 0
                for carga in cargas:
                    if carga.get('dpms', 0) > 0:
                        # Si ya tiene DPMS definido, usarlo
                        potencia_instalada += carga['dpms']
                    else:
                        # Calcular basado en cantidad de bocas
                        potencia_unitaria = self.potencias_unitarias.get(tipo_carga, 200)
                        potencia_instalada += carga['cantidadBocas'] * potencia_unitaria
                
                # Aplicar factor de demanda
                factor = factores.get(tipo_carga, 1.0)
                dpms_tipo = potencia_instalada * factor
                
                # Calcular corriente considerando el tipo de alimentación
                # Para cargas monofásicas: I = P/V
                # Para cargas trifásicas: I = P/(√3*V)
                if dpms_tipo > 0:
                    # Asumiendo cargas principalmente monofásicas para DPMS residencial/comercial
                    corriente_tipo = dpms_tipo / 220
                else:
                    corriente_tipo = 0
                
                dpms_por_tipo[tipo_carga] = {
                    'potencia_instalada': round(potencia_instalada, 2),
                    'factor_demanda': factor,
                    'dpms': round(dpms_tipo, 2),
                    'corriente': round(corriente_tipo, 2)
                }
                
                dpms_total += dpms_tipo
                corriente_total += corriente_tipo
            
            # Calcular densidad de potencia
            densidad_potencia = dpms_total / superficie if superficie > 0 else 0
            
            result = {
                'id': data['id'],
                'denominacionTablero': data['denominacionTablero'],
                'denominacionAmbiente': data['denominacionAmbiente'],
                'superficie': round(superficie, 2),
                'gradoElectrificacion': grado,
                'dpms_por_tipo': dpms_por_tipo,
                'dpms_total': round(dpms_total, 2),
                'corriente_total': round(corriente_total, 2),
                'densidad_potencia': round(densidad_potencia, 2),
                'factor_potencia_promedio': self._calculate_weighted_power_factor(data['cargas']),
                'potencia_activa': round(dpms_total * self._calculate_weighted_power_factor(data['cargas']), 2)
            }
            
            return result
            
        except Exception as e:
            raise Exception(f"Error en cálculo DPMS: {str(e)}")

    def _calculate_weighted_power_factor(self, cargas):
        """
        Calcula el factor de potencia promedio ponderado por tipo de carga
        """
        # Factores de potencia típicos por tipo de carga
        factores_potencia_tipicos = {
            'TUG': 0.85,    # Tomas de uso general (cargas resistivas/mixtas)
            'IUG': 0.95,    # Iluminación (principalmente resistiva)
            'ATE': 0.80,    # Aparatos de climatización (motores)
            'ACU': 0.75,    # Acondicionadores (motores, compresores)
            'TUE': 0.88,    # Tomas específicas (mixtas)
            'OCE': 0.90     # Otras cargas eléctricas
        }
        
        potencia_total_ponderada = 0
        potencia_total = 0
        
        for tipo_carga, lista_cargas in cargas.items():
            factor_potencia = factores_potencia_tipicos.get(tipo_carga, 0.92)
            
            for carga in lista_cargas:
                potencia_carga = carga.get('dpms', 0)
                potencia_total_ponderada += potencia_carga * factor_potencia
                potencia_total += potencia_carga
        
        if potencia_total > 0:
            return round(potencia_total_ponderada / potencia_total, 3)
        else:
            return 0.92  # Factor por defecto

    def calculate_multiple(self, data_list: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """
        Calcula DPMS para múltiples tableros/ambientes
        """
        results = []
        for data in data_list:
            result = self.calculate(data)
            results.append(result)
        return results

    def get_resumen_general(self, results: List[Dict[str, Any]]) -> Dict[str, Any]:
        """
        Genera un resumen general de todos los cálculos DPMS
        """
        if not results:
            return {}
        
        dpms_total_general = sum(r['dpms_total'] for r in results)
        corriente_total_general = sum(r['corriente_total'] for r in results)
        superficie_total = sum(r['superficie'] for r in results)
        
        return {
            'cantidad_tableros': len(results),
            'dpms_total_general': round(dpms_total_general, 2),
            'corriente_total_general': round(corriente_total_general, 2),
            'superficie_total': round(superficie_total, 2),
            'densidad_promedio': round(dpms_total_general / superficie_total, 2) if superficie_total > 0 else 0,
            'potencia_activa_total': round(dpms_total_general * 0.92, 2)
        }