import { useState } from 'react';
import { Gauge, Activity, Zap } from 'lucide-react';

const ResistanceCalculations = () => {
  const [activeCalculation, setActiveCalculation] = useState('resistance');
  const [inputs, setInputs] = useState({
    voltage: 220,
    current: 10,
    frequency: 50,
    inductance: 0.1,
    capacitance: 100,
    wireGauge: 2.5,
    length: 100,
    temperature: 20,
    conductor: 'cobre'
  });
  const [results, setResults] = useState({});

  const calculations = [
    {
      id: 'resistance',
      name: 'Resistencia',
      description: 'Cálculo de resistencia eléctrica',
      icon: Gauge
    },
    {
      id: 'reactance',
      name: 'Reactancia',
      description: 'Reactancia inductiva y capacitiva',
      icon: Activity
    },
    {
      id: 'impedance',
      name: 'Impedancia del Cable',
      description: 'Resistencia e impedancia de cables',
      icon: Zap
    }
  ];

  // Electrical constants
  const resistivity = {
    cobre: 0.017241,
    aluminio: 0.028264
  };

  const tempCoefficient = {
    cobre: 0.00393,
    aluminio: 0.00403
  };

  const handleInputChange = (field, value) => {
    const numValue = isNaN(value) ? value : parseFloat(value) || 0;
    setInputs(prev => ({
      ...prev,
      [field]: numValue
    }));
  };

  const calculateResistance = () => {
    const { voltage, current } = inputs;
    const resistance = voltage / current;

    setResults({
      resistance: resistance.toFixed(3)
    });
  };

  const calculateReactance = () => {
    const { frequency, inductance, capacitance } = inputs;
    
    // Reactancia inductiva XL = 2πfL
    const inductiveReactance = 2 * Math.PI * frequency * (inductance / 1000); // convert mH to H
    
    // Reactancia capacitiva XC = 1 / (2πfC)
    const capacitiveReactance = 1 / (2 * Math.PI * frequency * (capacitance / 1000000)); // convert μF to F
    
    // Reactancia neta
    const netReactance = inductiveReactance - capacitiveReactance;
    
    // Frecuencia de resonancia
    const resonantFrequency = 1 / (2 * Math.PI * Math.sqrt((inductance / 1000) * (capacitance / 1000000)));

    setResults({
      inductiveReactance: inductiveReactance.toFixed(3),
      capacitiveReactance: capacitiveReactance.toFixed(3),
      netReactance: netReactance.toFixed(3),
      resonantFrequency: resonantFrequency.toFixed(2)
    });
  };

  const calculateCableImpedance = () => {
    const { wireGauge, length, temperature, frequency, conductor } = inputs;
    
    // Resistencia del cable corregida por temperatura
    const rho20 = resistivity[conductor];
    const alpha = tempCoefficient[conductor];
    const rhoT = rho20 * (1 + alpha * (temperature - 20));
    const resistance = (rhoT * length) / wireGauge;
    
    // Reactancia inductiva aproximada (valores típicos)
    const inductancePerKm = 0.35; // mH/km para cables unipolares
    const inductanceTotal = (inductancePerKm / 1000) * (length / 1000); // H
    const inductiveReactance = 2 * Math.PI * frequency * inductanceTotal;
    
    // Impedancia total
    const impedance = Math.sqrt(Math.pow(resistance, 2) + Math.pow(inductiveReactance, 2));
    
    // Ángulo de fase
    const phaseAngle = Math.atan(inductiveReactance / resistance) * (180 / Math.PI);

    setResults({
      cableResistance: resistance.toFixed(4),
      cableReactance: inductiveReactance.toFixed(4),
      cableImpedance: impedance.toFixed(4),
      phaseAngle: phaseAngle.toFixed(2),
      resistivityUsed: rhoT.toFixed(6)
    });
  };

  const handleCalculate = () => {
    switch (activeCalculation) {
      case 'resistance':
        calculateResistance();
        break;
      case 'reactance':
        calculateReactance();
        break;
      case 'impedance':
        calculateCableImpedance();
        break;
    }
  };

  const renderInputSection = () => {
    switch (activeCalculation) {
      case 'resistance':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tensión (V)
                </label>
                <input
                  type="number"
                  value={inputs.voltage}
                  onChange={(e) => handleInputChange('voltage', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Corriente (A)
                </label>
                <input
                  type="number"
                  value={inputs.current}
                  onChange={(e) => handleInputChange('current', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>
        );

      case 'reactance':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Frecuencia (Hz)
                </label>
                <input
                  type="number"
                  value={inputs.frequency}
                  onChange={(e) => handleInputChange('frequency', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Inductancia (mH)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={inputs.inductance}
                  onChange={(e) => handleInputChange('inductance', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Capacitancia (μF)
                </label>
                <input
                  type="number"
                  value={inputs.capacitance}
                  onChange={(e) => handleInputChange('capacitance', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>
        );

      case 'impedance':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Calibre (mm²)
                </label>
                <select
                  value={inputs.wireGauge}
                  onChange={(e) => handleInputChange('wireGauge', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {[1.5, 2.5, 4, 6, 10, 16, 25, 35, 50, 70, 95].map(size => (
                    <option key={size} value={size}>{size}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Longitud (m)
                </label>
                <input
                  type="number"
                  value={inputs.length}
                  onChange={(e) => handleInputChange('length', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Temperatura (°C)
                </label>
                <input
                  type="number"
                  value={inputs.temperature}
                  onChange={(e) => handleInputChange('temperature', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Frecuencia (Hz)
                </label>
                <input
                  type="number"
                  value={inputs.frequency}
                  onChange={(e) => handleInputChange('frequency', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Conductor
                </label>
                <select
                  value={inputs.conductor}
                  onChange={(e) => handleInputChange('conductor', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="cobre">Cobre</option>
                  <option value="aluminio">Aluminio</option>
                </select>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const renderResults = () => {
    if (Object.keys(results).length === 0) return null;

    switch (activeCalculation) {
      case 'resistance':
        return (
          <div className="bg-blue-50 rounded-lg p-6">
            <div className="text-center">
              <div className="text-sm text-blue-600 font-medium mb-2">Resistencia</div>
              <div className="text-4xl font-bold text-blue-900">{results.resistance} Ω</div>
            </div>
          </div>
        );

      case 'reactance':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-green-50 rounded-lg p-4">
                <div className="text-sm text-green-600 font-medium">Reactancia Inductiva</div>
                <div className="text-2xl font-bold text-green-900">{results.inductiveReactance} Ω</div>
              </div>
              <div className="bg-red-50 rounded-lg p-4">
                <div className="text-sm text-red-600 font-medium">Reactancia Capacitiva</div>
                <div className="text-2xl font-bold text-red-900">{results.capacitiveReactance} Ω</div>
              </div>
            </div>
            <div className="bg-purple-50 rounded-lg p-6">
              <div className="text-center">
                <div className="text-sm text-purple-600 font-medium mb-2">Reactancia Neta</div>
                <div className="text-3xl font-bold text-purple-900">{results.netReactance} Ω</div>
                <div className="text-sm text-purple-600 mt-2">
                  {parseFloat(results.netReactance) > 0 ? 'Inductivo' : parseFloat(results.netReactance) < 0 ? 'Capacitivo' : 'Resonante'}
                </div>
              </div>
            </div>
            <div className="bg-orange-50 rounded-lg p-4">
              <div className="text-center">
                <div className="text-sm text-orange-600 font-medium">Frecuencia de Resonancia</div>
                <div className="text-2xl font-bold text-orange-900">{results.resonantFrequency} Hz</div>
              </div>
            </div>
          </div>
        );

      case 'impedance':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-blue-50 rounded-lg p-4">
                <div className="text-sm text-blue-600 font-medium">Resistencia</div>
                <div className="text-xl font-bold text-blue-900">{results.cableResistance} Ω</div>
              </div>
              <div className="bg-green-50 rounded-lg p-4">
                <div className="text-sm text-green-600 font-medium">Reactancia</div>
                <div className="text-xl font-bold text-green-900">{results.cableReactance} Ω</div>
              </div>
            </div>
            <div className="bg-purple-50 rounded-lg p-6">
              <div className="text-center">
                <div className="text-sm text-purple-600 font-medium mb-2">Impedancia Total</div>
                <div className="text-4xl font-bold text-purple-900">{results.cableImpedance} Ω</div>
              </div>
            </div>
            <div className="bg-orange-50 rounded-lg p-4">
              <div className="text-center">
                <div className="text-sm text-orange-600 font-medium">Ángulo de Fase</div>
                <div className="text-2xl font-bold text-orange-900">{results.phaseAngle}°</div>
              </div>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="text-center">
                <div className="text-sm text-gray-600 font-medium">Resistividad a {inputs.temperature}°C</div>
                <div className="text-lg font-bold text-gray-900">{results.resistivityUsed} Ω·mm²/m</div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Cálculos de Resistencia</h2>
        <p className="text-gray-600">Herramientas para cálculos de resistencia, reactancia e impedancia</p>
      </div>

      <div className="mb-6">
        <div className="flex flex-wrap gap-2">
          {calculations.map((calc) => {
            const Icon = calc.icon;
            return (
              <button
                key={calc.id}
                onClick={() => {
                  setActiveCalculation(calc.id);
                  setResults({});
                }}
                className={`flex items-center space-x-2 px-4 py-3 rounded-lg transition-all ${
                  activeCalculation === calc.id
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <Icon className="w-4 h-4" />
                <div className="text-left">
                  <div className="font-medium text-sm">{calc.name}</div>
                  <div className="text-xs opacity-75">{calc.description}</div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-gray-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Parámetros</h3>
          {renderInputSection()}
          
          <button
            onClick={handleCalculate}
            className="w-full mt-6 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            Calcular
          </button>
        </div>

        <div className="bg-gray-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Resultados</h3>
          {Object.keys(results).length > 0 ? (
            renderResults()
          ) : (
            <div className="text-center py-8">
              <Gauge className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">Ingresa los parámetros y haz clic en "Calcular"</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResistanceCalculations;