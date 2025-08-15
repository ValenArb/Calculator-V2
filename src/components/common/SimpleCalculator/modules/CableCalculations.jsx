import { useState } from 'react';
import { Cable, Thermometer, Gauge } from 'lucide-react';

const CableCalculations = () => {
  const [activeCalculation, setActiveCalculation] = useState('cable-size');
  const [inputs, setInputs] = useState({
    currentType: 'alterna-monofasica',
    voltage: 220,
    load: 2000,
    powerFactor: 0.9,
    lineLength: 50,
    maxVoltageDrop: 4,
    ambientTemp: 30,
    conductor: 'cobre',
    insulation: 'pvc',
    installationType: 'A1',
    circuitsInConduit: 1,
    
    // Cable temperature inputs
    wireGauge: 2.5,
    current: 15,
    operatingTemp: 70
  });
  const [results, setResults] = useState({});

  const calculations = [
    {
      id: 'cable-size',
      name: 'Calibre de Cable',
      description: 'Determinación del calibre mínimo',
      icon: Cable
    },
    {
      id: 'cable-temp',
      name: 'Temperatura del Cable',
      description: 'Cálculo de temperatura de funcionamiento',
      icon: Thermometer
    },
    {
      id: 'ampacity',
      name: 'Capacidad del Conductor',
      description: 'Corriente admisible del conductor',
      icon: Gauge
    }
  ];

  // Electrical constants
  const resistivity = {
    cobre: 0.017241,
    aluminio: 0.028264
  };

  // Standard wire gauges
  const standardGauges = [1.5, 2.5, 4, 6, 10, 16, 25, 35, 50, 70, 95, 120, 150, 185, 240, 300];
  
  // Base ampacity values for PVC insulation at 30°C (simplified table)
  const baseAmpacity = {
    1.5: 15.5,
    2.5: 21,
    4: 28,
    6: 36,
    10: 50,
    16: 68,
    25: 89,
    35: 110,
    50: 134,
    70: 171,
    95: 207,
    120: 239,
    150: 272,
    185: 310,
    240: 364,
    300: 419
  };

  // Temperature correction factors
  const tempCorrectionFactors = {
    20: 1.12,
    25: 1.06,
    30: 1.00,
    35: 0.94,
    40: 0.87,
    45: 0.79,
    50: 0.71,
    55: 0.61,
    60: 0.50
  };

  const handleInputChange = (field, value) => {
    const numValue = isNaN(value) ? value : parseFloat(value) || 0;
    setInputs(prev => ({
      ...prev,
      [field]: numValue
    }));
  };

  const calculateCableSize = () => {
    const { currentType, voltage, load, powerFactor, lineLength, maxVoltageDrop, conductor } = inputs;
    const rho = resistivity[conductor];
    
    // Calculate current
    let current;
    switch (currentType) {
      case 'continua':
      case 'alterna-monofasica':
        current = load / (voltage * powerFactor);
        break;
      case 'alterna-trifasica':
        current = load / (Math.sqrt(3) * voltage * powerFactor);
        break;
      case 'alterna-bifasica':
        current = load / (2 * voltage * powerFactor);
        break;
      default:
        current = 0;
    }

    // Calculate minimum section for voltage drop
    const maxVoltageDrop_V = (maxVoltageDrop / 100) * voltage;
    let minSectionVoltageDrop;
    
    switch (currentType) {
      case 'continua':
      case 'alterna-monofasica':
        minSectionVoltageDrop = (2 * rho * lineLength * current) / maxVoltageDrop_V;
        break;
      case 'alterna-trifasica':
        minSectionVoltageDrop = (Math.sqrt(3) * rho * lineLength * current) / maxVoltageDrop_V;
        break;
      case 'alterna-bifasica':
        minSectionVoltageDrop = (Math.sqrt(2) * rho * lineLength * current) / maxVoltageDrop_V;
        break;
      default:
        minSectionVoltageDrop = 0;
    }

    // Find minimum standard gauge that satisfies voltage drop requirement
    const minGaugeVoltageDrop = standardGauges.find(gauge => gauge >= minSectionVoltageDrop) || standardGauges[standardGauges.length - 1];
    
    // Find minimum gauge for current capacity (simplified)
    const minGaugeAmpacity = standardGauges.find(gauge => baseAmpacity[gauge] >= current * 1.25) || standardGauges[standardGauges.length - 1];
    
    // Use the larger of the two requirements
    const recommendedGauge = Math.max(minGaugeVoltageDrop, minGaugeAmpacity);

    setResults({
      calculatedCurrent: current.toFixed(2),
      minSectionVoltageDrop: minSectionVoltageDrop.toFixed(2),
      minGaugeVoltageDrop: minGaugeVoltageDrop,
      minGaugeAmpacity: minGaugeAmpacity,
      recommendedGauge: recommendedGauge,
      ampacity: baseAmpacity[recommendedGauge]
    });
  };

  const calculateCableTemperature = () => {
    const { wireGauge, current, lineLength, conductor, operatingTemp } = inputs;
    const rho = resistivity[conductor];
    
    // Calculate resistance
    const resistance = (rho * lineLength) / wireGauge;
    
    // Calculate power losses (Joule effect)
    const powerLosses = Math.pow(current, 2) * resistance;
    
    // Simplified temperature rise calculation
    const thermalResistance = 4.0; // °C/W per meter (simplified)
    const temperatureRise = powerLosses * thermalResistance / lineLength;
    const finalTemperature = inputs.ambientTemp + temperatureRise;
    
    // Check if temperature is acceptable
    const maxTempPVC = 70; // °C for PVC insulation
    const isAcceptable = finalTemperature <= maxTempPVC;
    
    setResults({
      resistance: resistance.toFixed(4),
      powerLosses: powerLosses.toFixed(2),
      temperatureRise: temperatureRise.toFixed(1),
      finalTemperature: finalTemperature.toFixed(1),
      maxTempAllowed: maxTempPVC,
      isAcceptable: isAcceptable
    });
  };

  const calculateAmpacity = () => {
    const { wireGauge, ambientTemp, circuitsInConduit } = inputs;
    
    // Get base ampacity
    const baseAmp = baseAmpacity[wireGauge] || 0;
    
    // Apply temperature correction
    const tempFactor = tempCorrectionFactors[ambientTemp] || 1.0;
    
    // Apply grouping factor (simplified)
    let groupingFactor = 1.0;
    if (circuitsInConduit >= 4) groupingFactor = 0.8;
    else if (circuitsInConduit >= 7) groupingFactor = 0.7;
    else if (circuitsInConduit >= 10) groupingFactor = 0.6;
    
    // Final corrected ampacity
    const correctedAmpacity = baseAmp * tempFactor * groupingFactor;
    
    setResults({
      baseAmpacity: baseAmp.toFixed(1),
      tempFactor: tempFactor.toFixed(2),
      groupingFactor: groupingFactor.toFixed(2),
      correctedAmpacity: correctedAmpacity.toFixed(1)
    });
  };

  const handleCalculate = () => {
    switch (activeCalculation) {
      case 'cable-size':
        calculateCableSize();
        break;
      case 'cable-temp':
        calculateCableTemperature();
        break;
      case 'ampacity':
        calculateAmpacity();
        break;
    }
  };

  const renderInputSection = () => {
    switch (activeCalculation) {
      case 'cable-size':
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
                  Caída máxima (%)
                </label>
                <input
                  type="number"
                  value={inputs.maxVoltageDrop}
                  onChange={(e) => handleInputChange('maxVoltageDrop', e.target.value)}
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

      case 'cable-temp':
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
                  {standardGauges.map(size => (
                    <option key={size} value={size}>{size}</option>
                  ))}
                </select>
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
                  Temp. ambiente (°C)
                </label>
                <input
                  type="number"
                  value={inputs.ambientTemp}
                  onChange={(e) => handleInputChange('ambientTemp', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>
        );

      case 'ampacity':
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
                  {standardGauges.map(size => (
                    <option key={size} value={size}>{size}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Temp. ambiente (°C)
                </label>
                <select
                  value={inputs.ambientTemp}
                  onChange={(e) => handleInputChange('ambientTemp', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {Object.keys(tempCorrectionFactors).map(temp => (
                    <option key={temp} value={temp}>{temp}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Circuitos en conducto
                </label>
                <select
                  value={inputs.circuitsInConduit}
                  onChange={(e) => handleInputChange('circuitsInConduit', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 12, 15, 20].map(num => (
                    <option key={num} value={num}>{num}</option>
                  ))}
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
      case 'cable-size':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-blue-50 rounded-lg p-4">
                <div className="text-sm text-blue-600 font-medium">Corriente Calculada</div>
                <div className="text-2xl font-bold text-blue-900">{results.calculatedCurrent} A</div>
              </div>
              <div className="bg-green-50 rounded-lg p-4">
                <div className="text-sm text-green-600 font-medium">Calibre Recomendado</div>
                <div className="text-2xl font-bold text-green-900">{results.recommendedGauge} mm²</div>
              </div>
              <div className="bg-purple-50 rounded-lg p-4">
                <div className="text-sm text-purple-600 font-medium">Por Caída de Tensión</div>
                <div className="text-xl font-bold text-purple-900">{results.minGaugeVoltageDrop} mm²</div>
              </div>
              <div className="bg-orange-50 rounded-lg p-4">
                <div className="text-sm text-orange-600 font-medium">Por Capacidad</div>
                <div className="text-xl font-bold text-orange-900">{results.minGaugeAmpacity} mm²</div>
              </div>
            </div>
          </div>
        );

      case 'cable-temp':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-red-50 rounded-lg p-4">
                <div className="text-sm text-red-600 font-medium">Pérdidas Joule</div>
                <div className="text-xl font-bold text-red-900">{results.powerLosses} W</div>
              </div>
              <div className="bg-yellow-50 rounded-lg p-4">
                <div className="text-sm text-yellow-600 font-medium">Aumento de Temp.</div>
                <div className="text-xl font-bold text-yellow-900">{results.temperatureRise} °C</div>
              </div>
            </div>
            <div className={`rounded-lg p-6 ${
              results.isAcceptable ? 'bg-green-50' : 'bg-red-50'
            }`}>
              <div className="text-center">
                <div className={`text-sm font-medium ${
                  results.isAcceptable ? 'text-green-600' : 'text-red-600'
                }`}>
                  Temperatura Final
                </div>
                <div className={`text-3xl font-bold ${
                  results.isAcceptable ? 'text-green-900' : 'text-red-900'
                }`}>
                  {results.finalTemperature} °C
                </div>
                <div className={`text-sm ${
                  results.isAcceptable ? 'text-green-600' : 'text-red-600'
                }`}>
                  Máximo permitido: {results.maxTempAllowed} °C
                </div>
                <div className={`text-xs font-medium ${
                  results.isAcceptable ? 'text-green-700' : 'text-red-700'
                }`}>
                  {results.isAcceptable ? 'ACEPTABLE' : 'EXCEDE LÍMITE'}
                </div>
              </div>
            </div>
          </div>
        );

      case 'ampacity':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-blue-50 rounded-lg p-4">
                <div className="text-sm text-blue-600 font-medium">Capacidad Base</div>
                <div className="text-xl font-bold text-blue-900">{results.baseAmpacity} A</div>
              </div>
              <div className="bg-purple-50 rounded-lg p-4">
                <div className="text-sm text-purple-600 font-medium">Factor Temp.</div>
                <div className="text-xl font-bold text-purple-900">{results.tempFactor}</div>
              </div>
            </div>
            <div className="bg-green-50 rounded-lg p-6">
              <div className="text-center">
                <div className="text-sm text-green-600 font-medium mb-2">Capacidad Corregida</div>
                <div className="text-4xl font-bold text-green-900">{results.correctedAmpacity} A</div>
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
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Cálculos de Cables y Conductores</h2>
        <p className="text-gray-600">Herramientas para dimensionamiento y verificación de conductores</p>
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
              <Cable className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">Ingresa los parámetros y haz clic en "Calcular"</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CableCalculations;