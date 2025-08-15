import numpy as np
from typing import Dict, List, Any

class LoadsPerPanelCalculator:
    def __init__(self):
        # Factores de corrección por tipo de carga
        self.factores_correccion = {
            'Normal': 1.0,
            'Emergencia': 1.25,
            'Crítica': 1.5
        }
        
        # Tensiones nominales por tipo de alimentación
        self.tensiones = {
            'RN': 220,    # Monofásica R-N
            'SN': 220,    # Monofásica S-N  
            'TN': 220,    # Monofásica T-N
            'RS': 380,    # Bifásica R-S
            'ST': 380,    # Bifásica S-T
            'RT': 380,    # Bifásica R-T
            'RST': 380,   # Trifásica
            'RSTN': 380   # Trifásica con neutro
        }

    def calculate(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Calcula parámetros eléctricos para una carga específica
        """
        try:
            potencia_aparente = data.get('potenciaAparente', 0)
            cos_phi = data.get('cosPhi', 0.92)
            alimentacion = data.get('alimentacion', 'RN')
            tipo_carga = data.get('tipoCarga', 'Normal')
            
            # Obtener tensión nominal
            tension = self.tensiones.get(alimentacion, 220)
            
            # Calcular potencia activa
            potencia_activa = potencia_aparente * cos_phi
            
            # Calcular potencia reactiva
            sin_phi = np.sqrt(1 - cos_phi**2) if cos_phi < 1 else 0
            potencia_reactiva = potencia_aparente * sin_phi
            
            # Calcular corriente nominal
            if alimentacion in ['RST', 'RSTN']:
                # Trifásica: I = P / (√3 * V_línea)
                tension_linea = 380  # Tensión línea a línea
                corriente_nominal = (potencia_aparente * 1000) / (np.sqrt(3) * tension_linea)
            elif alimentacion in ['RS', 'ST', 'RT']:
                # Bifásica: I = P / V_línea
                tension_linea = 380  # Tensión línea a línea
                corriente_nominal = (potencia_aparente * 1000) / tension_linea
            else:
                # Monofásica: I = P / V_fase
                tension_fase = 220  # Tensión fase a neutro
                corriente_nominal = (potencia_aparente * 1000) / tension_fase
            
            # Aplicar factor de corrección por tipo de carga
            factor_correccion = self.factores_correccion.get(tipo_carga, 1.0)
            corriente_diseño = corriente_nominal * factor_correccion
            
            # Calcular factor de carga (estimado)
            factor_carga = 0.75 if tipo_carga == 'Normal' else 0.9
            
            # Corriente media
            corriente_media = corriente_diseño * factor_carga
            
            result = {
                'id': data['id'],
                'identificacionTablero': data['identificacionTablero'],
                'lineaOCarga': data['lineaOCarga'],
                'tipoCarga': tipo_carga,
                'alimentacion': alimentacion,
                'tension_nominal': tension,
                'potencia_aparente': round(potencia_aparente, 2),
                'potencia_activa': round(potencia_activa, 2),
                'potencia_reactiva': round(potencia_reactiva, 2),
                'cos_phi': cos_phi,
                'corriente_nominal': round(corriente_nominal, 2),
                'factor_correccion': factor_correccion,
                'corriente_diseño': round(corriente_diseño, 2),
                'factor_carga': factor_carga,
                'corriente_media': round(corriente_media, 2)
            }
            
            return result
            
        except Exception as e:
            raise Exception(f"Error en cálculo de cargas: {str(e)}")

    def calculate_panel_summary(self, cargas: List[Dict[str, Any]], tablero: str) -> Dict[str, Any]:
        """
        Calcula resumen por tablero
        """
        try:
            if not cargas:
                return {
                    'tablero': tablero,
                    'cantidad_cargas': 0,
                    'potencia_total_aparente': 0,
                    'potencia_total_activa': 0,
                    'corriente_total': 0
                }
            
            # Filtrar cargas del tablero específico
            cargas_tablero = [c for c in cargas if c.get('identificacionTablero') == tablero]
            
            potencia_total_aparente = sum(c.get('potencia_aparente', 0) for c in cargas_tablero)
            potencia_total_activa = sum(c.get('potencia_activa', 0) for c in cargas_tablero)
            corriente_total = sum(c.get('corriente_diseño', 0) for c in cargas_tablero)
            
            # Factor de diversidad (típico para tableros)
            factor_diversidad = 0.8 if len(cargas_tablero) > 3 else 1.0
            
            corriente_diversificada = corriente_total * factor_diversidad
            
            # Factor de potencia promedio ponderado
            if potencia_total_aparente > 0:
                cos_phi_promedio = potencia_total_activa / potencia_total_aparente
            else:
                cos_phi_promedio = 0.92
            
            return {
                'tablero': tablero,
                'cantidad_cargas': len(cargas_tablero),
                'potencia_total_aparente': round(potencia_total_aparente, 2),
                'potencia_total_activa': round(potencia_total_activa, 2),
                'corriente_total': round(corriente_total, 2),
                'factor_diversidad': factor_diversidad,
                'corriente_diversificada': round(corriente_diversificada, 2),
                'cos_phi_promedio': round(cos_phi_promedio, 3),
                'cargas_detalle': cargas_tablero
            }
            
        except Exception as e:
            raise Exception(f"Error en resumen de tablero: {str(e)}")

    def get_all_panels_summary(self, cargas: List[Dict[str, Any]]) -> Dict[str, Any]:
        """
        Genera resumen de todos los tableros
        """
        try:
            # Obtener tableros únicos
            tableros = list(set(c.get('identificacionTablero', '') for c in cargas if c.get('identificacionTablero')))
            
            resumen_tableros = []
            for tablero in tableros:
                if tablero:  # Evitar tableros vacíos
                    resumen = self.calculate_panel_summary(cargas, tablero)
                    resumen_tableros.append(resumen)
            
            # Totales generales
            potencia_total_aparente = sum(r['potencia_total_aparente'] for r in resumen_tableros)
            potencia_total_activa = sum(r['potencia_total_activa'] for r in resumen_tableros)
            corriente_total = sum(r['corriente_diversificada'] for r in resumen_tableros)
            
            return {
                'cantidad_tableros': len(resumen_tableros),
                'potencia_total_aparente': round(potencia_total_aparente, 2),
                'potencia_total_activa': round(potencia_total_activa, 2),
                'corriente_total_diversificada': round(corriente_total, 2),
                'cos_phi_general': round(potencia_total_activa / potencia_total_aparente, 3) if potencia_total_aparente > 0 else 0,
                'tableros': resumen_tableros
            }
            
        except Exception as e:
            raise Exception(f"Error en resumen general: {str(e)}")