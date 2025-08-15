import { useState } from 'react';
import { Calculator, ArrowDown, Zap } from 'lucide-react';

const BasicCircuits = () => {
  const [activeCalculation, setActiveCalculation] = useState('voltage-drop');
  const [inputs, setInputs] = useState({
    // Voltage Drop inputs
    currentType: 'alterna-monofasica',
    voltage: 220,
    load: 1000,
    powerFactor: 0.9,
    wireGauge: 2.5,
    parallelConductors: 1,
    lineLength: 50,
    conductor: 'cobre',
    cableType: 'unipolar',
    operatingTemp: 70,
    
    // Current inputs  
    currentVoltage: 220,
    currentPower: 1000,
    currentCosPhi: 0.9,
    
    // Impedance inputs
    impedanceVoltage: 220,
    impedanceCurrent: 10,
    
    // Voltage calculation inputs
    voltageCurrent: 10,
    voltagePower: 2200,
    voltageCosPhi: 0.9
  });

  const [results, setResults] = useState({});

  const calculations = [
    {
      id: 'voltage-drop',
      name: 'Caída de Tensión',
      description: 'Cálculo de caída de tensión en líneas',
      icon: ArrowDown
    },
    {
      id: 'current',
      name: 'Corriente',
      description: 'Cálculo de corriente eléctrica',
      icon: Zap
    },
    {
      id: 'impedance',
      name: 'Impedancia',
      description: 'Cálculo de impedancia (solo AC)',
      icon: Calculator
    },
    {
      id: 'voltage',
      name: 'Tensión',
      description: 'Cálculo de tensión eléctrica',
      icon: Zap
    }
  ];

  // Electrical constants
  const resistivity = {
    cobre: 0.017241,
    aluminio: 0.028264
  };

  const handleInputChange = (field, value) => {
    const numValue = isNaN(value) ? value : parseFloat(value) || 0;
    setInputs(prev => ({
      ...prev,
      [field]: numValue
    }));
  };

  const calculateVoltageDrop = () => {
    const { currentType, voltage, load, powerFactor, wireGauge, lineLength, conductor } = inputs;
    const rho = resistivity[conductor];
    let current, voltageDrop;

    // Calculate current
    switch (currentType) {
      case 'continua':
      case 'alterna-monofasica':
        current = load / (voltage * powerFactor);
        voltageDrop = (2 * rho * lineLength * current) / wireGauge;
        break;
      case 'alterna-trifasica':
        current = load / (Math.sqrt(3) * voltage * powerFactor);
        voltageDrop = (Math.sqrt(3) * rho * lineLength * current) / wireGauge;
        break;
      case 'alterna-bifasica':
        current = load / (2 * voltage * powerFactor);
        voltageDrop = (Math.sqrt(2) * rho * lineLength * current) / wireGauge;
        break;
      default:
        current = 0;
        voltageDrop = 0;
    }

    const voltageDropPercentage = (voltageDrop / voltage) * 100;

    setResults({
      current: current.toFixed(2),
      voltageDrop: voltageDrop.toFixed(3),
      voltageDropPercentage: voltageDropPercentage.toFixed(2),
      finalVoltage: (voltage - voltageDrop).toFixed(1)
    });
  };

  const calculateCurrent = () => {
    const { currentType, currentVoltage, currentPower, currentCosPhi } = inputs;
    let current;

    switch (currentType) {
      case 'continua':
        current = currentPower / currentVoltage;
        break;
      case 'alterna-monofasica':
        current = currentPower / (currentVoltage * currentCosPhi);
        break;
      case 'alterna-trifasica':
        current = currentPower / (Math.sqrt(3) * currentVoltage * currentCosPhi);
        break;
      case 'alterna-bifasica':
        current = currentPower / (2 * currentVoltage * currentCosPhi);
        break;
      default:
        current = 0;
    }

    setResults({
      calculatedCurrent: current.toFixed(3)
    });
  };

  const calculateImpedance = () => {
    const { impedanceVoltage, impedanceCurrent } = inputs;
    const impedance = impedanceVoltage / impedanceCurrent;

    setResults({
      impedance: impedance.toFixed(3)
    });
  };

  const calculateVoltage = () => {
    const { currentType, voltageCurrent, voltagePower, voltageCosPhi } = inputs;
    let voltage;

    switch (currentType) {
      case 'continua':
        voltage = voltagePower / voltageCurrent;
        break;
      case 'alterna-monofasica':
        voltage = voltagePower / (voltageCurrent * voltageCosPhi);
        break;
      case 'alterna-trifasica':
        voltage = voltagePower / (Math.sqrt(3) * voltageCurrent * voltageCosPhi);
        break;
      case 'alterna-bifasica':
        voltage = voltagePower / (2 * voltageCurrent * voltageCosPhi);
        break;
      default:
        voltage = 0;
    }

    setResults({
      calculatedVoltage: voltage.toFixed(2)
    });
  };

  const handleCalculate = () => {
    switch (activeCalculation) {
      case 'voltage-drop':
        calculateVoltageDrop();
        break;
      case 'current':
        calculateCurrent();
        break;
      case 'impedance':
        calculateImpedance();
        break;
      case 'voltage':
        calculateVoltage();
        break;
    }
  };

  const renderInputSection = () => {
    switch (activeCalculation) {
      case 'voltage-drop':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tipo de corriente
              </label>
              <div className="flex flex-wrap gap-2">
                {[
                  { value: 'continua', label: 'Continua' },
                  { value: 'alterna-monofasica', label: 'AC Monofásica' },
                  { value: 'alterna-bifasica', label: 'AC Bifásica' },
                  { value: 'alterna-trifasica', label: 'AC Trifásica' }
                ].map(type => (
                  <button
                    key={type.value}
                    onClick={() => handleInputChange('currentType', type.value)}
                    className={`px-3 py-2 text-sm rounded-lg transition-colors ${
                      inputs.currentType === type.value 
                        ? 'bg-blue-600 text-white' 
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {type.label}
                  </button>
                ))}
              </div>
            </div>

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
                  Carga (W)
                </label>
                <input
                  type="number"
                  value={inputs.load}
                  onChange={(e) => handleInputChange('load', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Factor de potencia
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  max="1"
                  value={inputs.powerFactor}
                  onChange={(e) => handleInputChange('powerFactor', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Calibre (mm²)
                </label>
                <select
                  value={inputs.wireGauge}
                  onChange={(e) => handleInputChange('wireGauge', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {[0.5, 1, 1.5, 2, 2.5, 3, 4, 6, 10, 16, 25, 35, 50, 70, 95].map(size => (
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
                  value={inputs.lineLength}
                  onChange={(e) => handleInputChange('lineLength', e.target.value)}
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

      case 'current':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tipo de corriente
              </label>
              <div className="flex flex-wrap gap-2">
                {[
                  { value: 'continua', label: 'Continua' },
                  { value: 'alterna-monofasica', label: 'AC Monofásica' },
                  { value: 'alterna-bifasica', label: 'AC Bifásica' },
                  { value: 'alterna-trifasica', label: 'AC Trifásica' }
                ].map(type => (
                  <button
                    key={type.value}
                    onClick={() => handleInputChange('currentType', type.value)}
                    className={`px-3 py-2 text-sm rounded-lg transition-colors ${
                      inputs.currentType === type.value 
                        ? 'bg-blue-600 text-white' 
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {type.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tensión (V)
                </label>
                <input
                  type="number"
                  value={inputs.currentVoltage}
                  onChange={(e) => handleInputChange('currentVoltage', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Potencia (W)
                </label>
                <input
                  type="number"
                  value={inputs.currentPower}
                  onChange={(e) => handleInputChange('currentPower', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              {inputs.currentType !== 'continua' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    cos φ
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    max="1"
                    value={inputs.currentCosPhi}
                    onChange={(e) => handleInputChange('currentCosPhi', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              )}
            </div>
          </div>
        );

      case 'impedance':
        return (
          <div className="space-y-4">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
              <p className="text-sm text-yellow-800">
                <strong>Nota:</strong> El cálculo de impedancia solo está disponible para corriente alterna.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tensión (V)
                </label>
                <input
                  type="number"
                  value={inputs.impedanceVoltage}
                  onChange={(e) => handleInputChange('impedanceVoltage', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Corriente (A)
                </label>
                <input
                  type="number"
                  value={inputs.impedanceCurrent}
                  onChange={(e) => handleInputChange('impedanceCurrent', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>
        );

      case 'voltage':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tipo de corriente
              </label>
              <div className="flex flex-wrap gap-2">
                {[
                  { value: 'continua', label: 'Continua' },
                  { value: 'alterna-monofasica', label: 'AC Monofásica' },
                  { value: 'alterna-bifasica', label: 'AC Bifásica' },
                  { value: 'alterna-trifasica', label: 'AC Trifásica' }
                ].map(type => (
                  <button
                    key={type.value}
                    onClick={() => handleInputChange('currentType', type.value)}
                    className={`px-3 py-2 text-sm rounded-lg transition-colors ${
                      inputs.currentType === type.value 
                        ? 'bg-blue-600 text-white' 
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {type.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Corriente (A)
                </label>
                <input
                  type="number"
                  value={inputs.voltageCurrent}
                  onChange={(e) => handleInputChange('voltageCurrent', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Potencia (W)
                </label>
                <input
                  type="number"
                  value={inputs.voltagePower}
                  onChange={(e) => handleInputChange('voltagePower', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              {inputs.currentType !== 'continua' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    cos φ
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    max="1"
                    value={inputs.voltageCosPhi}
                    onChange={(e) => handleInputChange('voltageCosPhi', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              )}
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
      case 'voltage-drop':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-blue-50 rounded-lg p-4">
                <div className="text-sm text-blue-600 font-medium">Corriente</div>
                <div className="text-2xl font-bold text-blue-900">{results.current} A</div>
              </div>
              <div className="bg-red-50 rounded-lg p-4">
                <div className="text-sm text-red-600 font-medium">Caída de Tensión</div>
                <div className="text-2xl font-bold text-red-900">{results.voltageDrop} V</div>
                <div className="text-sm text-red-600">({results.voltageDropPercentage}%)</div>
              </div>
              <div className="bg-green-50 rounded-lg p-4">
                <div className="text-sm text-green-600 font-medium">Tensión Final</div>
                <div className="text-2xl font-bold text-green-900">{results.finalVoltage} V</div>
              </div>
              <div className={`rounded-lg p-4 ${
                parseFloat(results.voltageDropPercentage) <= 4 
                  ? 'bg-green-50' 
                  : 'bg-yellow-50'
              }`}>
                <div className={`text-sm font-medium ${
                  parseFloat(results.voltageDropPercentage) <= 4 
                    ? 'text-green-600' 
                    : 'text-yellow-600'
                }`}>
                  Estado
                </div>
                <div className={`text-sm font-bold ${
                  parseFloat(results.voltageDropPercentage) <= 4 
                    ? 'text-green-900' 
                    : 'text-yellow-900'
                }`}>
                  {parseFloat(results.voltageDropPercentage) <= 4 ? 'Aceptable' : 'Revisar'}
                </div>
                <div className={`text-xs ${
                  parseFloat(results.voltageDropPercentage) <= 4 
                    ? 'text-green-600' 
                    : 'text-yellow-600'
                }`}>
                  Límite: 4%
                </div>
              </div>
            </div>
          </div>
        );

      case 'current':
        return (
          <div className="bg-blue-50 rounded-lg p-6">
            <div className="text-center">
              <div className="text-sm text-blue-600 font-medium mb-2">Corriente Calculada</div>
              <div className="text-4xl font-bold text-blue-900">{results.calculatedCurrent} A</div>
            </div>
          </div>
        );

      case 'impedance':
        return (
          <div className="bg-purple-50 rounded-lg p-6">
            <div className="text-center">
              <div className="text-sm text-purple-600 font-medium mb-2">Impedancia</div>
              <div className="text-4xl font-bold text-purple-900">{results.impedance} Ω</div>
            </div>
          </div>
        );

      case 'voltage':
        return (
          <div className="bg-green-50 rounded-lg p-6">
            <div className="text-center">
              <div className="text-sm text-green-600 font-medium mb-2">Tensión Calculada</div>
              <div className="text-4xl font-bold text-green-900">{results.calculatedVoltage} V</div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Cálculos Básicos de Circuitos</h2>
        <p className="text-gray-600">Herramientas fundamentales para análisis de circuitos eléctricos</p>
      </div>

      {/* Calculation Type Selector */}
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
        {/* Input Section */}
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

        {/* Results Section */}
        <div className="bg-gray-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Resultados</h3>
          {Object.keys(results).length > 0 ? (
            renderResults()
          ) : (
            <div className="text-center py-8">
              <Calculator className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">Ingresa los parámetros y haz clic en "Calcular"</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BasicCircuits;