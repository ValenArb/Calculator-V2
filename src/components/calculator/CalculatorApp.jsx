import { useState } from 'react';
import { Calculator, Zap, Cable, Gauge, Cpu, Activity, Thermometer, Settings, Palette, 
         Target, Battery, Wifi, Wrench, Users, BarChart3, TrendingUp, AlertTriangle, ShieldAlert } from 'lucide-react';

// Importar calculadoras existentes
import VoltageDropCalc from './VoltageDropCalc';
import CurrentCalc from './CurrentCalc';
import PowerCalc from './PowerCalc';
import ResistanceCalc from './ResistanceCalc';
import CableSizeCalc from './CableSizeCalc';

// Importar nuevas calculadoras (las crearemos)
import ImpedanceCalc from './ImpedanceCalc';
import VoltageCalc from './VoltageCalc';
import ApparentPowerCalc from './ApparentPowerCalc';
import ReactivePowerCalc from './ReactivePowerCalc';
import PowerFactorCalc from './PowerFactorCalc';
import CableTempCalc from './CableTempCalc';
import ConductorCapacityCalc from './ConductorCapacityCalc';
import BusbarCapacityCalc from './BusbarCapacityCalc';
import InsulatedConductorCapacityCalc from './InsulatedConductorCapacityCalc';
import BareConductorCapacityCalc from './BareConductorCapacityCalc';
import LightningAnalysisCalc from './LightningAnalysisCalc';
import ShortCircuitCalc from './ShortCircuitCalc';
import JouleEffectCalc from './JouleEffectCalc';
import ResonanceFrequencyCalc from './ResonanceFrequencyCalc';
import ReactanceCalc from './ReactanceCalc';
import BatteryDurationCalc from './BatteryDurationCalc';
import ResistorColorCodeCalc from './ResistorColorCodeCalc';
import InductorColorCodeCalc from './InductorColorCodeCalc';
import CapacitorCodeCalc from './CapacitorCodeCalc';
import SMDResistorCodeCalc from './SMDResistorCodeCalc';
import ResistorValueToColorCalc from './ResistorValueToColorCalc';
import AnalogSignalCalc from './AnalogSignalCalc';
import DiskSpaceBandwidthCalc from './DiskSpaceBandwidthCalc';
import AntennaLengthCalc from './AntennaLengthCalc';
import PowerFactorCorrectionCalc from './PowerFactorCorrectionCalc';
import TransformerPowerFactorCalc from './TransformerPowerFactorCalc';
import PowerFactorCalculationCalc from './PowerFactorCalculationCalc';
import CurrentDividerCalc from './CurrentDividerCalc';
import VoltageDividerCalc from './VoltageDividerCalc';
import ZenerDiodeCalc from './ZenerDiodeCalc';
import TemperatureSensorCalc from './TemperatureSensorCalc';
import GroundingSystemCalc from './GroundingSystemCalc';
import CableProtectionCalc from './CableProtectionCalc';
import EmergencyLightingCalc from './EmergencyLightingCalc';
import MaxCableLengthIscCalc from './MaxCableLengthIscCalc';
import MaxCableLengthVoltageDropCalc from './MaxCableLengthVoltageDropCalc';
import PowerLossInCablesCalc from './PowerLossInCablesCalc';
import CableImpedanceCalc from './CableImpedanceCalc';
import LoadCurrentCalc from './LoadCurrentCalc';
import NeutralCurrentCalc from './NeutralCurrentCalc';
import TransformerWindingCalc from './TransformerWindingCalc';
import PvcFlexibleCalc from './PvcFlexibleCalc';
import PvcRigidCalc from './PvcRigidCalc';
import SteelRigidCalc from './SteelRigidCalc';
import BandejaCableCalc from './BandejaCableCalc';
import CableShortCircuitProtectionCalc from './CableShortCircuitProtectionCalc';
import OvercurrentProtectionDeviceCalc from './OvercurrentProtectionDeviceCalc';
import CableSizeCoordinationCalc from './CableSizeCoordinationCalc';
import ShortCircuitCurrentCalc from './ShortCircuitCurrentCalc';
import ShortCircuitTransformerCalc from './ShortCircuitTransformerCalc';
import MinimumShortCircuitCalc from './MinimumShortCircuitCalc';
import LightningOvervoltageCalc from './LightningOvervoltageCalc';
import GroundingSystemAdvancedCalc from './GroundingSystemAdvancedCalc';
import JouleEffectAdvancedCalc from './JouleEffectAdvancedCalc';
import ResonanceFrequencyAdvancedCalc from './ResonanceFrequencyAdvancedCalc';
import ReactanceAdvancedCalc from './ReactanceAdvancedCalc';
import BatteryDurationAdvancedCalc from './BatteryDurationAdvancedCalc';
import PowerFactorCorrectionAdvancedCalc from './PowerFactorCorrectionAdvancedCalc';
import CapacitorBankCalc from './CapacitorBankCalc';
import TemperatureSensorAdvancedCalc from './TemperatureSensorAdvancedCalc';
import AnalogSignalAdvancedCalc from './AnalogSignalAdvancedCalc';

const CalculatorApp = () => {
  const [activeCategory, setActiveCategory] = useState('basic');
  const [activeCalc, setActiveCalc] = useState('voltage-drop');

  const categories = [
    // 1. Circuitos Básicos
    {
      id: 'basic',
      name: 'Circuitos Básicos',
      icon: Zap,
      calculators: [
        { id: 'voltage-drop', name: 'Caída de tensión', component: VoltageDropCalc },
        { id: 'current', name: 'Corriente', component: CurrentCalc },
        { id: 'resistance-power', name: 'Resistencia', component: ResistanceCalc },
        { id: 'impedance', name: 'Impedancia', component: ImpedanceCalc },
        { id: 'voltage', name: 'Tensión', component: VoltageCalc }
      ]
    },
    // 2. Potencia
    {
      id: 'power',
      name: 'Potencia',
      icon: Cpu,
      calculators: [
        { id: 'active-power', name: 'Potencia Activa', component: PowerCalc },
        { id: 'apparent-power', name: 'Potencia Aparente', component: ApparentPowerCalc },
        { id: 'reactive-power', name: 'Potencia Reactiva', component: ReactivePowerCalc },
        { id: 'power-factor-calc', name: 'Graficador de Triángulo', component: PowerFactorCalculationCalc }
      ]
    },
    // 3. Cables y Conductores
    {
      id: 'cables',
      name: 'Cables y Conductores',
      icon: Cable,
      calculators: [
        { id: 'cable-size', name: 'Calibre del cable', component: CableSizeCalc },
        { id: 'cable-temp', name: 'Temperatura del cable', component: CableTempCalc },
        { id: 'busbar-capacity', name: 'Capacidad de barras colectoras', component: BusbarCapacityCalc },
        { id: 'insulated-conductor', name: 'Corriente por Conductores aislados', component: InsulatedConductorCapacityCalc },
        { id: 'bare-conductor', name: 'Corriente conductores sin aislar', component: BareConductorCapacityCalc },
        { id: 'cable-impedance', name: 'Resistencia, reactancia e impedancia del cable', component: CableImpedanceCalc },
        { id: 'power-loss-cables', name: 'Pérdida de potencia en cables', component: PowerLossInCablesCalc },
        { id: 'max-cable-voltage', name: 'Longitud máxima del cable (ΔV)', component: MaxCableLengthVoltageDropCalc },
        { id: 'max-cable-isc', name: 'Longitud máxima del cable (Isc)', component: MaxCableLengthIscCalc }
      ]
    },
    // 4. Canalizaciones
    {
      id: 'conduits',
      name: 'Canalizaciones',
      icon: Settings,
      calculators: [
        { id: 'pvc-flexible', name: 'PVC FLEXIBLE', component: PvcFlexibleCalc },
        { id: 'pvc-rigid', name: 'PVC RÍGIDO', component: PvcRigidCalc },
        { id: 'steel-rigid', name: 'Steel RÍGIDO', component: SteelRigidCalc },
        { id: 'cable-tray', name: 'Bandeja portacable', component: BandejaCableCalc }
      ]
    },
    // 5. Protección
    {
      id: 'protection',
      name: 'Protección',
      icon: AlertTriangle,
      calculators: [
        { id: 'cable-protection', name: 'Protección Cables cortocircuito', component: CableShortCircuitProtectionCalc },
        { id: 'overcurrent-protection', name: 'Dispositivo de protección contra sobrecorriente', component: OvercurrentProtectionDeviceCalc },
        { id: 'cable-coordination', name: 'Cálculo del tamaño del cable y coordinación', component: CableSizeCoordinationCalc }
      ]
    },
    // 6. Cortocircuito
    {
      id: 'short-circuit',
      name: 'Cortocircuito',
      icon: ShieldAlert,
      calculators: [
        { id: 'short-circuit-point', name: 'Corriente de cortocircuito en un punto específico', component: ShortCircuitCurrentCalc },
        { id: 'short-circuit-transformer', name: 'Corriente de cortocircuito con subestación transformadora', component: ShortCircuitTransformerCalc },
        { id: 'minimum-short-circuit', name: 'Corriente de cortocircuito mínima', component: MinimumShortCircuitCalc }
      ]
    },
    // 7. Análisis de Circuitos
    {
      id: 'analysis',
      name: 'Análisis de Circuitos',
      icon: BarChart3,
      calculators: [
        { id: 'lightning-overvoltage', name: 'Sobretensiones Atmosféricas', component: LightningOvervoltageCalc },
        { id: 'grounding-system-advanced', name: 'Sistema de puesta a tierra y coordinación con dispositivo diferencial', component: GroundingSystemAdvancedCalc }
      ]
    },
    // 8. Dispositivos
    {
      id: 'devices',
      name: 'Dispositivos',
      icon: Settings,
      calculators: [
        { id: 'joule-effect-advanced', name: 'Efecto Joule', component: JouleEffectAdvancedCalc },
        { id: 'resonance-advanced', name: 'Frecuencia de resonancia', component: ResonanceFrequencyAdvancedCalc },
        { id: 'reactance-advanced', name: 'Reactancia', component: ReactanceAdvancedCalc },
        { id: 'impedance-calc', name: 'Impedancia conociendo la resistencia y reactancia', component: ImpedanceCalc },
        { id: 'battery-advanced', name: 'Duración de las baterías', component: BatteryDurationAdvancedCalc }
      ]
    },
    // 9. Corrección Factor de Potencia
    {
      id: 'power-factor',
      name: 'Corrección Factor de Potencia',
      icon: Activity,
      calculators: [
        { id: 'power-factor-correction-advanced', name: 'Cálculo de capacitor para corrección de factor de potencia', component: PowerFactorCorrectionAdvancedCalc },
        { id: 'capacitor-bank', name: 'Banco de capacitores', component: CapacitorBankCalc }
      ]
    },
    // 10. Sensores y Analógicas
    {
      id: 'sensors',
      name: 'Sensores y Analógicas',
      icon: Thermometer,
      calculators: [
        { id: 'temperature-sensor-advanced', name: 'Temperatura', component: TemperatureSensorAdvancedCalc },
        { id: 'analog-signal-advanced', name: 'Valores de señal analógica (Conversión entre rangos)', component: AnalogSignalAdvancedCalc }
      ]
    },
    // Categorías adicionales para calculadores existentes que no encajan en el orden especificado
    {
      id: 'dividers',
      name: 'Divisores y Circuitos',
      icon: Target,
      calculators: [
        { id: 'current-divider', name: 'Divisor de Corriente', component: CurrentDividerCalc },
        { id: 'voltage-divider', name: 'Divisor de Tensión', component: VoltageDividerCalc },
        { id: 'zener-diode', name: 'Diodo Zener Estabilizador', component: ZenerDiodeCalc }
      ]
    },
    {
      id: 'codes',
      name: 'Códigos y Referencias',
      icon: Palette,
      calculators: [
        { id: 'resistor-color', name: 'Código Color Resistencia', component: ResistorColorCodeCalc },
        { id: 'inductor-color', name: 'Código Color Inductor', component: InductorColorCodeCalc },
        { id: 'capacitor-code', name: 'Código Condensadores', component: CapacitorCodeCalc },
        { id: 'smd-resistor', name: 'Resistencias SMD', component: SMDResistorCodeCalc },
        { id: 'resistor-value-color', name: 'Valor a Color Resistencia', component: ResistorValueToColorCalc }
      ]
    },
    {
      id: 'distribution',
      name: 'Corriente y Distribución',
      icon: Users,
      calculators: [
        { id: 'load-current', name: 'Corriente de Empleo', component: LoadCurrentCalc },
        { id: 'neutral-current', name: 'Corriente en Neutro', component: NeutralCurrentCalc },
        { id: 'transformer-winding', name: 'Devanado Transformador', component: TransformerWindingCalc }
      ]
    },
    {
      id: 'advanced',
      name: 'Herramientas Avanzadas',
      icon: Wrench,
      calculators: [
        { id: 'disk-bandwidth', name: 'Espacio Disco y Ancho Banda', component: DiskSpaceBandwidthCalc },
        { id: 'antenna-length', name: 'Longitud Antena', component: AntennaLengthCalc }
      ]
    }
  ];

  const getCurrentCategory = () => categories.find(cat => cat.id === activeCategory);
  const getCurrentCalculator = () => {
    const category = getCurrentCategory();
    return category?.calculators.find(calc => calc.id === activeCalc);
  };

  const ActiveComponent = getCurrentCalculator()?.component;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex items-center space-x-3 mb-6">
          <Calculator className="w-8 h-8 text-blue-600" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Calculadora Eléctrica Profesional</h1>
            <p className="text-gray-600">Más de 50 herramientas de cálculo para ingeniería eléctrica</p>
          </div>
        </div>

        {/* Selector de categorías */}
        <div className="mb-4">
          <h3 className="text-sm font-medium text-gray-700 mb-3">Categorías</h3>
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => {
              const Icon = category.icon;
              return (
                <button
                  key={category.id}
                  onClick={() => {
                    setActiveCategory(category.id);
                    setActiveCalc(category.calculators[0]?.id || '');
                  }}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm transition-colors ${
                    activeCategory === category.id
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{category.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Selector de calculadoras de la categoría activa */}
        {getCurrentCategory() && (
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-3">
              {getCurrentCategory().name} ({getCurrentCategory().calculators.length})
            </h3>
            <div className="flex flex-wrap gap-2">
              {getCurrentCategory().calculators.map((calc) => (
                <button
                  key={calc.id}
                  onClick={() => setActiveCalc(calc.id)}
                  className={`px-3 py-2 text-sm rounded-lg transition-colors ${
                    activeCalc === calc.id
                      ? 'bg-green-600 text-white'
                      : 'bg-gray-50 text-gray-700 hover:bg-gray-100 border'
                  }`}
                >
                  {calc.name}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Calculadora activa */}
      <div className="bg-white rounded-lg shadow-sm border">
        {ActiveComponent ? (
          <ActiveComponent />
        ) : (
          <div className="p-8 text-center">
            <Calculator className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Calculadora en desarrollo</h3>
            <p className="text-gray-500">Esta calculadora estará disponible próximamente</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CalculatorApp;