"""
Constantes eléctricas estándar para cálculos de ingeniería eléctrica
Basado en normas IEC y IEEE
"""

import numpy as np

class ElectricalConstants:
    """Constantes físicas y eléctricas estándar"""
    
    # Resistividades de conductores (Ω·mm²/m a 20°C)
    COPPER_RESISTIVITY_20C = 0.01724
    ALUMINUM_RESISTIVITY_20C = 0.02826
    
    # Coeficientes de temperatura (/°C)
    TEMPERATURE_COEFFICIENT_COPPER = 0.00393
    TEMPERATURE_COEFFICIENT_ALUMINUM = 0.00403
    
    # Tensiones nominales estándar (V)
    VOLTAGE_SINGLE_PHASE = 220  # V fase-neutro
    VOLTAGE_THREE_PHASE_LINE = 380  # V línea-línea
    VOLTAGE_THREE_PHASE_PHASE = 220  # V fase-neutro
    
    # Factores de potencia típicos por tipo de carga
    POWER_FACTORS = {
        'resistive_load': 1.00,      # Cargas resistivas puras
        'incandescent': 1.00,        # Lámparas incandescentes
        'fluorescent': 0.95,         # Lámparas fluorescentes con corrección
        'led_lighting': 0.95,        # Iluminación LED
        'small_motors': 0.80,        # Motores pequeños
        'large_motors': 0.85,        # Motores grandes
        'air_conditioning': 0.75,    # Aire acondicionado
        'mixed_loads': 0.92,         # Cargas mixtas típicas
        'outlets_general': 0.85,     # Tomas de uso general
        'office_equipment': 0.88     # Equipos de oficina
    }
    
    # Límites de caída de tensión según norma IEC 60364-5-52 (%)
    VOLTAGE_DROP_LIMITS = {
        'lighting': 3.0,             # Circuitos de iluminación
        'power_outlets': 5.0,        # Tomas de corriente
        'motors': 5.0,               # Motores
        'main_feeders': 1.0,         # Alimentadores principales
        'emergency_circuits': 2.0    # Circuitos de emergencia
    }
    
    # Factores de demanda según tipo de edificio
    DEMAND_FACTORS = {
        'residential': {
            'lighting': 0.75,
            'outlets': 0.50,
            'air_conditioning': 0.80,
            'kitchen': 0.75
        },
        'office': {
            'lighting': 0.90,
            'outlets': 0.60,
            'air_conditioning': 0.85,
            'equipment': 0.70
        },
        'industrial': {
            'lighting': 0.95,
            'power_outlets': 0.70,
            'motors': 0.80,
            'welding': 0.60
        }
    }
    
    # Temperaturas límite para conductores (°C)
    TEMPERATURE_LIMITS = {
        'pvc_insulation': 70,
        'xlpe_insulation': 90,
        'epr_insulation': 90,
        'paper_insulation': 85
    }

class ElectricalValidation:
    """Validación de parámetros eléctricos"""
    
    @staticmethod
    def validate_voltage(voltage):
        """Valida tensión eléctrica"""
        if not isinstance(voltage, (int, float)) or voltage <= 0:
            raise ValueError("La tensión debe ser un número positivo")
        if voltage > 50000:  # 50kV límite práctico
            raise ValueError("Tensión fuera del rango típico de distribución")
        return True
    
    @staticmethod
    def validate_current(current):
        """Valida corriente eléctrica"""
        if not isinstance(current, (int, float)) or current < 0:
            raise ValueError("La corriente debe ser un número no negativo")
        if current > 10000:  # 10kA límite práctico
            raise ValueError("Corriente fuera del rango típico")
        return True
    
    @staticmethod
    def validate_power_factor(cos_phi):
        """Valida factor de potencia"""
        if not isinstance(cos_phi, (int, float)):
            raise ValueError("El factor de potencia debe ser un número")
        if not 0.1 <= cos_phi <= 1.0:
            raise ValueError("El factor de potencia debe estar entre 0.1 y 1.0")
        return True
    
    @staticmethod
    def validate_conductor_section(section):
        """Valida sección de conductor"""
        standard_sections = [1.5, 2.5, 4, 6, 10, 16, 25, 35, 50, 70, 95, 120, 150, 185, 240, 300, 400, 500]
        if section not in standard_sections:
            # Buscar la sección estándar más cercana
            closest = min(standard_sections, key=lambda x: abs(x - section))
            print(f"Advertencia: Sección {section}mm² no es estándar. Sección más cercana: {closest}mm²")
        return True
    
    @staticmethod
    def validate_temperature(temperature):
        """Valida temperatura"""
        if not isinstance(temperature, (int, float)):
            raise ValueError("La temperatura debe ser un número")
        if not -40 <= temperature <= 120:
            raise ValueError("Temperatura fuera del rango operativo típico (-40°C a 120°C)")
        return True

class ElectricalFormulas:
    """Fórmulas eléctricas estándar"""
    
    @staticmethod
    def single_phase_current(power_kw, voltage, cos_phi=1.0):
        """Corriente monofásica: I = P / (V * cos_phi)"""
        ElectricalValidation.validate_voltage(voltage)
        ElectricalValidation.validate_power_factor(cos_phi)
        return (power_kw * 1000) / (voltage * cos_phi)
    
    @staticmethod
    def three_phase_current(power_kw, voltage_line, cos_phi=1.0):
        """Corriente trifásica: I = P / (√3 * V * cos_phi)"""
        ElectricalValidation.validate_voltage(voltage_line)
        ElectricalValidation.validate_power_factor(cos_phi)
        return (power_kw * 1000) / (np.sqrt(3) * voltage_line * cos_phi)
    
    @staticmethod
    def voltage_drop_single_phase(current, resistance, length_km):
        """Caída de tensión monofásica: ΔV = 2 * I * R * L"""
        ElectricalValidation.validate_current(current)
        return 2 * current * resistance * length_km
    
    @staticmethod
    def voltage_drop_three_phase(current, resistance, reactance, length_km, cos_phi):
        """Caída de tensión trifásica exacta"""
        ElectricalValidation.validate_current(current)
        ElectricalValidation.validate_power_factor(cos_phi)
        
        sin_phi = np.sqrt(1 - cos_phi**2)
        r_total = resistance * length_km
        x_total = reactance * length_km
        
        delta_v_active = current * (r_total * cos_phi + x_total * sin_phi)
        delta_v_reactive = current * (x_total * cos_phi - r_total * sin_phi)
        
        return np.sqrt(delta_v_active**2 + delta_v_reactive**2)
    
    @staticmethod
    def power_from_current_voltage(current, voltage, cos_phi=1.0, phases=1):
        """Potencia a partir de corriente y tensión"""
        ElectricalValidation.validate_current(current)
        ElectricalValidation.validate_voltage(voltage)
        ElectricalValidation.validate_power_factor(cos_phi)
        
        if phases == 3:
            return np.sqrt(3) * voltage * current * cos_phi / 1000  # kW
        else:
            return voltage * current * cos_phi / 1000  # kW
    
    @staticmethod
    def conductor_resistance_temperature_corrected(resistance_20c, temperature):
        """Resistencia corregida por temperatura"""
        ElectricalValidation.validate_temperature(temperature)
        alpha = ElectricalConstants.TEMPERATURE_COEFFICIENT_COPPER
        return resistance_20c * (1 + alpha * (temperature - 20))
    
    @staticmethod
    def short_circuit_current(voltage, impedance):
        """Corriente de cortocircuito"""
        ElectricalValidation.validate_voltage(voltage)
        if impedance <= 0:
            raise ValueError("La impedancia debe ser positiva")
        return voltage / (np.sqrt(3) * impedance)  # Para sistemas trifásicos
    
    @staticmethod
    def impedance_parallel(z1, z2):
        """Impedancia en paralelo"""
        if z1 <= 0 or z2 <= 0:
            raise ValueError("Las impedancias deben ser positivas")
        return (z1 * z2) / (z1 + z2)
    
    @staticmethod
    def impedance_series(*impedances):
        """Impedancia en serie"""
        total = 0
        for z in impedances:
            if z < 0:
                raise ValueError("Las impedancias deben ser no negativas")
            total += z
        return total