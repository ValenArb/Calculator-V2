import { useState } from 'react';

const PowerLossInCablesCalc = () => {
  const [inputs, setInputs] = useState({
    systemType: 'single-phase-ac',
    voltage: 220,
    voltageUnit: 'V',
    load: 4400,
    loadUnit: 'A',
    powerFactor: 0.9,
    caliber: 0.5,
    caliberUnit: 'mm²',
    parallelConductors: 1,
    length: 50,
    lengthUnit: 'm',
    operatingTemp: 70,
    tempUnit: '°C',
    conductor: 'copper'
  });
  
  const [result, setResult] = useState(null);

  // Conversiones de unidades
  const voltageConversions = {
    'mV': 0.001, 'V': 1, 'kV': 1000
  };

  const currentConversions = {
    'A': 1, 'kA': 1000
  };

  const lengthConversions = {
    'm': 1, 'km': 1000, 'ft': 0.3048, 'mi': 1609.34
  };

  const tempConversions = {
    '°C': { toBase: (c) => c, fromBase: (c) => c },
    '°F': { toBase: (f) => (f - 32) * 5/9, fromBase: (c) => c * 9/5 + 32 }
  };

  // Secciones estándar de cables disponibles
  const standardSections = [
    0.5, 0.75, 1, 1.5, 2.5, 4, 6, 10, 16, 25, 35, 50, 70, 95, 120, 150, 185, 240, 300, 400, 500
  ];

  // Resistencias reales de cables de cobre unipolares (Ohm/km) @ 70°C
  const cableResistances = {
    copper: {
      0.5: 39.0, 0.75: 26.0, 1.0: 19.5, 1.5: 13.3, 2.5: 7.98, 4: 5.92, 6: 3.95, 10: 2.29,
      16: 1.45, 25: 0.933, 35: 0.663, 50: 0.462, 70: 0.326, 95: 0.248,
      120: 0.194, 150: 0.156, 185: 0.129, 240: 0.0987, 300: 0.0754,
      400: 0.0606, 500: 0.0493
    },
    aluminum: {
      0.5: 50.7, 0.75: 33.8, 1.5: 17.29, 2.5: 10.374, 4: 7.696, 6: 5.135, 10: 2.977, 16: 1.885,
      25: 1.213, 35: 0.862, 50: 0.601, 70: 0.424, 95: 0.322, 120: 0.252,
      150: 0.203, 185: 0.168, 240: 0.128, 300: 0.098, 400: 0.079,
      500: 0.064
    }
  };

  const calculate = () => {
    const { systemType, voltage, voltageUnit, load, loadUnit, powerFactor, caliber, caliberUnit, parallelConductors, length, lengthUnit, operatingTemp, tempUnit, conductor } = inputs;
    
    // Convertir valores a unidades base
    const voltageInV = voltage * voltageConversions[voltageUnit];
    const loadInA = loadUnit === 'A' ? load : load * currentConversions[loadUnit];
    const lengthInM = length * lengthConversions[lengthUnit];
    const tempInC = tempConversions[tempUnit].toBase(operatingTemp);
    const current = loadInA;
    
    // Obtener resistencia real de la tabla (Ohm/km) @ 70°C
    let resistancePerKm = cableResistances[conductor][caliber];
    
    // Si no existe en la tabla, buscar la sección más cercana
    if (!resistancePerKm) {
      const availableSections = Object.keys(cableResistances[conductor]).map(Number).sort((a, b) => a - b);
      const closestSection = availableSections.reduce((prev, curr) => 
        Math.abs(curr - caliber) < Math.abs(prev - caliber) ? curr : prev
      );
      resistancePerKm = cableResistances[conductor][closestSection];
    }
    
    // Temperature coefficient
    const tempCoeff = conductor === 'copper' ? 0.00393 : 0.00403; // Aluminum
    
    // Ajustar por temperatura desde 70°C de referencia
    const tempFactor = 1 + tempCoeff * (tempInC - 70);
    const adjustedResistancePerKm = resistancePerKm * tempFactor;
    
    // Resistance total considerando longitud y conductores en paralelo
    const resistance = (adjustedResistancePerKm * lengthInM / 1000) / parallelConductors;
    
    // Calculate power losses based on system type
    let totalPowerLoss, powerLossPerLength, efficiency, energyCost;
    let formula = '';
    
    switch (systemType) {
      case 'continuous':
        totalPowerLoss = Math.pow(current, 2) * resistance;
        formula = 'P_pérdidas = I² × R';
        break;
        
      case 'single-phase-ac':
        totalPowerLoss = Math.pow(current, 2) * resistance;
        formula = 'P_pérdidas = I² × R';
        break;
        
      case 'two-phase-ac':
        totalPowerLoss = 2 * Math.pow(current, 2) * resistance;
        formula = 'P_pérdidas = 2 × I² × R';
        break;
        
      case 'three-phase-ac':
        totalPowerLoss = 3 * Math.pow(current, 2) * resistance;
        formula = 'P_pérdidas = 3 × I² × R';
        break;
    }
    
    // Calcular pérdida por unidad de longitud
    powerLossPerLength = totalPowerLoss / lengthInM;
    
    // Calcular eficiencia del cable
    const totalPower = systemType.includes('three-phase') ? Math.sqrt(3) * voltageInV * current * powerFactor :
                      systemType.includes('two-phase') ? 2 * voltageInV * current * powerFactor :
                      systemType === 'continuous' ? voltageInV * current :
                      voltageInV * current * powerFactor;
    
    efficiency = totalPower > 0 ? ((totalPower - totalPowerLoss) / totalPower) * 100 : 0;
    
    // Costo energético estimado (asumiendo $0.15 por kWh)
    const energyLossKWh = (totalPowerLoss / 1000) * 24 * 365; // kWh por año
    energyCost = energyLossKWh * 0.15;
    
    setResult({
      totalPowerLoss: totalPowerLoss.toFixed(2),
      powerLossPerLength: powerLossPerLength.toFixed(4),
      efficiency: efficiency.toFixed(2),
      energyCost: energyCost.toFixed(2),
      resistance: resistance.toFixed(6),
      resistancePerKm: adjustedResistancePerKm.toFixed(4),
      formula: formula,
      conductor: conductor,
      caliber: caliber,
      parallelConductors: parallelConductors,
      systemType: systemType,
      tempInC: tempInC.toFixed(1)
    });
  };

  const handleInputChange = (field, value) => {
    setInputs(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="p-6">
      <h2 className="text-xl font-semibold mb-6">Cálculo de Pérdidas de Potencia en Cables</h2>
      
      {/* Formula Section */}
      <div className="mb-6 bg-blue-50 p-4 rounded-lg">
        <h3 className="text-sm font-medium text-blue-900 mb-2">Fórmulas utilizadas:</h3>
        <div className="text-xs text-blue-700 space-y-1">
          <div><strong>Monofásico:</strong> P_pérdidas = I² × R</div>
          <div><strong>Trifásico:</strong> P_pérdidas = 3 × I² × R</div>
          <div><strong>DC:</strong> P_pérdidas = I² × R</div>
          <div><strong>Resistencia:</strong> Basada en valores reales de cables comerciales @ 70°C con corrección por temperatura</div>
          <div><strong>Eficiencia:</strong> η = P_entregada / (P_entregada + P_pérdidas) × 100%</div>
          <div className="text-xs mt-2">
            <strong>Donde:</strong> P_pérdidas = pérdidas de potencia, I = corriente, R = resistencia total, η = eficiencia
          </div>
        </div>
      </div>
      
      <div className="grid md:grid-cols-2 gap-6">
        {/* Inputs */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tipo de Sistema
            </label>
            <div className="space-y-2">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="systemType"
                  value="single-phase"
                  checked={inputs.systemType === 'single-phase'}
                  onChange={(e) => handleInputChange('systemType', e.target.value)}
                  className="mr-2"
                />
                Monofásico AC
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="systemType"
                  value="three-phase"
                  checked={inputs.systemType === 'three-phase'}
                  onChange={(e) => handleInputChange('systemType', e.target.value)}
                  className="mr-2"
                />
                Trifásico AC
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="systemType"
                  value="dc"
                  checked={inputs.systemType === 'dc'}
                  onChange={(e) => handleInputChange('systemType', e.target.value)}
                  className="mr-2"
                />
                DC
              </label>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tipo de Conductor
            </label>
            <div className="flex gap-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="conductor"
                  value="copper"
                  checked={inputs.conductor === 'copper'}
                  onChange={(e) => handleInputChange('conductor', e.target.value)}
                  className="mr-2"
                />
                Cobre
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="conductor"
                  value="aluminum"
                  checked={inputs.conductor === 'aluminum'}
                  onChange={(e) => handleInputChange('conductor', e.target.value)}
                  className="mr-2"
                />
                Aluminio
              </label>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tensión Nominal (V)
            </label>
            <input
              type="number"
              value={inputs.voltage}
              onChange={(e) => handleInputChange('voltage', parseFloat(e.target.value) || 0)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Corriente de Carga (A)
            </label>
            <input
              type="number"
              value={inputs.current}
              onChange={(e) => handleInputChange('current', parseFloat(e.target.value) || 0)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Sección del Conductor (mm²)
            </label>
            <input
              type="number"
              value={inputs.crossSection}
              onChange={(e) => handleInputChange('crossSection', parseFloat(e.target.value) || 0)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Longitud del Cable (m)
            </label>
            <input
              type="number"
              value={inputs.length}
              onChange={(e) => handleInputChange('length', parseFloat(e.target.value) || 0)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Temperatura del Conductor (°C)
            </label>
            <input
              type="number"
              value={inputs.temperature}
              onChange={(e) => handleInputChange('temperature', parseFloat(e.target.value) || 0)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {inputs.systemType !== 'dc' && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Factor de Potencia
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  max="1"
                  value={inputs.powerFactor}
                  onChange={(e) => handleInputChange('powerFactor', parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Frecuencia (Hz)
                </label>
                <input
                  type="number"
                  value={inputs.frequency}
                  onChange={(e) => handleInputChange('frequency', parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </>
          )}

          <button
            onClick={calculate}
            className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
          >
            Calcular
          </button>
        </div>

        {/* Results */}
        <div className="space-y-4">
          {result ? (
            <>
              <div className="bg-red-50 p-4 rounded-lg">
                <div className="text-sm text-red-600 font-medium">Pérdida de potencia total en el cable</div>
                <div className="text-2xl font-bold text-red-900">{result.totalPowerLoss} W</div>
              </div>

              <div className="bg-orange-50 p-4 rounded-lg">
                <div className="text-sm text-orange-600 font-medium">Pérdida de potencia por unidad de longitud</div>
                <div className="text-xl font-bold text-orange-900">{result.powerLossPerLength} W/m</div>
              </div>

              <div className="bg-green-50 p-4 rounded-lg">
                <div className="text-sm text-green-600 font-medium">Eficiencia del cable</div>
                <div className="text-2xl font-bold text-green-900">{result.efficiency}%</div>
              </div>

              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="text-sm text-blue-600 font-medium">Costo energético estimado de las pérdidas</div>
                <div className="text-xl font-bold text-blue-900">${result.energyCost}/año</div>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="text-sm text-gray-600 font-medium mb-2">Información del Cálculo</div>
                <div className="text-xs text-gray-600 space-y-1">
                  <div>• Tipo: {result.systemType.replace('-', ' ').replace('continuous', 'Continua').replace('ac', 'AC').replace('single phase', 'Monofásico').replace('two phase', 'Bifásico').replace('three phase', 'Trifásico')}</div>
                  <div>• Material: {result.conductor === 'copper' ? 'Cobre' : 'Aluminio'}</div>
                  <div>• Calibre: {result.caliber} mm²</div>
                  <div>• Conductores en paralelo: {result.parallelConductors}</div>
                  <div>• Resistencia por km: {result.resistancePerKm} Ω/km @ {result.tempInC}°C</div>
                  <div>• Resistencia total: {result.resistance} Ω</div>
                </div>
              </div>
            </>
          ) : (
            <div className="text-center py-12 text-gray-500">
              Completa los datos y haz clic en "Calcular"
            </div>
          )}
        </div>
      </div>

      {/* Fórmulas utilizadas */}
      <div className="mt-8 bg-blue-50 p-4 rounded-lg border-l-4 border-blue-500">
        <h3 className="text-lg font-semibold text-blue-900 mb-2">Fórmulas utilizadas</h3>
        <div className="text-blue-800 font-mono space-y-2 text-sm">
          {result && (
            <>
              <div><strong>Fórmula aplicada:</strong> {result.formula}</div>
              <div className="text-xs text-blue-700 mt-2">
                <strong>Donde:</strong> P_pérdidas = pérdidas de potencia, I = corriente, R = resistencia total
              </div>
              <div className="text-xs text-blue-700">
                <strong>Eficiencia:</strong> η = (P_total - P_pérdidas) / P_total × 100%
              </div>
            </>
          )}
          {!result && (
            <>
              <div><strong>Continua:</strong> P_pérdidas = I² × R</div>
              <div><strong>Alterna monofásica:</strong> P_pérdidas = I² × R</div>
              <div><strong>Alterna bifásica:</strong> P_pérdidas = 2 × I² × R</div>
              <div><strong>Alterna trifásica:</strong> P_pérdidas = 3 × I² × R</div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default PowerLossInCablesCalc;
