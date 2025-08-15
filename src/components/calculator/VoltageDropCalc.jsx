import { useState } from 'react';

const VoltageDropCalc = () => {
  const [inputs, setInputs] = useState({
    systemType: 'single-phase',
    voltage: 220,
    voltageUnit: 'V',
    load: 2200,
    loadUnit: 'W',
    powerFactor: 0.9,
    powerFactorType: 'cos',
    length: 50,
    lengthUnit: 'm',
    wireSize: 2.5,
    wireSizeUnit: 'mm2',
    material: 'copper',
    cableType: 'unipolar',
    parallelConductors: 1,
    temperature: 30,
    tempUnit: 'C',
    voltageDropUnit: 'percentage',
    maxVoltageDrop: 4
  });
  
  const [result, setResult] = useState(null);

  // Resistencias reales de cables de cobre unipolares (Ohm/km) @ 70°C
  // Basado en tabla de resistencias-cables.md
  const cableResistances = {
    copper: {
      1.0: 19.5, 1.5: 13.3, 2.5: 7.98, 4: 5.92, 6: 3.95, 10: 2.29,
      16: 1.45, 25: 0.933, 35: 0.663, 50: 0.462, 70: 0.326, 95: 0.248,
      120: 0.194, 150: 0.156, 185: 0.129, 240: 0.0987, 300: 0.0754,
      400: 0.0606, 500: 0.0493, 630: 0.0407
    },
    aluminum: {
      // Valores aproximados para aluminio (30% más resistivo que cobre)
      1.5: 17.29, 2.5: 10.374, 4: 7.696, 6: 5.135, 10: 2.977, 16: 1.885,
      25: 1.213, 35: 0.862, 50: 0.601, 70: 0.424, 95: 0.322, 120: 0.252,
      150: 0.203, 185: 0.168, 240: 0.128, 300: 0.098, 400: 0.079,
      500: 0.064, 630: 0.053
    }
  };

  // Conversiones AWG a mm²
  const awgToMm2 = {
    '14': 2.08, '12': 3.31, '10': 5.26, '8': 8.37, '6': 13.3,
    '4': 21.2, '2': 33.6, '1/0': 53.5, '2/0': 67.4, '3/0': 85.0, '4/0': 107.2
  };

  // Conversiones de longitud
  const lengthConversions = {
    'm': 1, 'km': 1000, 'ft': 0.3048, 'mi': 1609.34
  };

  // Conversiones de tensión
  const voltageConversions = {
    'mV': 0.001, 'V': 1, 'kV': 1000
  };

  // Conversiones de potencia
  const powerConversions = {
    'W': 1, 'kW': 1000, 'HP': 745.7, 'VA': 1, 'kVA': 1000, 'MVA': 1000000,
    'var': 1, 'kvar': 1000, 'Mvar': 1000000
  };

  // Tensiones estándar
  const standardVoltages = {
    'single-phase': [120, 127, 220, 240],
    'two-phase': [220, 240, 380, 440],
    'three-phase': [208, 220, 380, 400, 440, 480, 660],
    'dc': [12, 24, 48, 110, 220, 380]
  };

  const calculate = () => {
    const { systemType, voltage, voltageUnit, load, loadUnit, powerFactor, powerFactorType,
            length, lengthUnit, wireSize, wireSizeUnit, material, parallelConductors,
            voltageDropUnit, maxVoltageDrop, temperature } = inputs;
    
    // Obtener resistencia real de la tabla (Ohm/km) @ 70°C
    let resistancePerKm = cableResistances[material][wireSize];
    
    // Si no existe en la tabla, buscar la sección más cercana
    if (!resistancePerKm) {
      const availableSections = Object.keys(cableResistances[material]).map(Number).sort((a, b) => a - b);
      const closestSection = availableSections.reduce((prev, curr) => 
        Math.abs(curr - wireSize) < Math.abs(prev - wireSize) ? curr : prev
      );
      resistancePerKm = cableResistances[material][closestSection];
    }
    
    // Temperature coefficient and adjustment (usar temperatura ambiente si no está definida)
    const tempCoeff = material === 'copper' ? 0.00393 : 0.00403;
    const ambientTemp = inputs.temperature || 20; // Default 20°C si no está especificada
    const tempFactor = 1 + tempCoeff * (ambientTemp - 70); // Ajustar desde 70°C
    const adjustedResistancePerKm = resistancePerKm * tempFactor;
    
    // Convertir valores a unidades base
    const voltageInV = voltage * voltageConversions[voltageUnit];
    const loadInW = load * powerConversions[loadUnit];
    const lengthInMeters = length * lengthConversions[lengthUnit];
    
    // Convertir sección a mm²
    let sectionInMm2 = wireSize;
    if (wireSizeUnit === 'awg') {
      sectionInMm2 = awgToMm2[wireSize.toString()] || wireSize;
    }
    
    // Calcular sección efectiva considerando conductores en paralelo
    const effectiveSection = sectionInMm2 * parallelConductors;
    
    // Calcular corriente según el tipo de sistema
    let current;
    const pf = powerFactorType === 'sen' ? Math.sqrt(1 - Math.pow(powerFactor, 2)) :
               powerFactorType === 'tan' ? powerFactor / Math.sqrt(1 + Math.pow(powerFactor, 2)) : powerFactor;
    
    switch (systemType) {
      case 'single-phase':
        current = loadInW / (voltageInV * pf);
        break;
      case 'two-phase':
        current = loadInW / (2 * voltageInV * pf);
        break;
      case 'three-phase':
        current = loadInW / (Math.sqrt(3) * voltageInV * pf);
        break;
      case 'dc':
        current = loadInW / voltageInV;
        break;
      default:
        current = loadInW / (voltageInV * pf);
    }
    
    // Factor según tipo de sistema
    let systemFactor = 2; // monofásico/bifásico por defecto
    if (systemType === 'three-phase') {
      systemFactor = Math.sqrt(3);
    } else if (systemType === 'dc') {
      systemFactor = 2;
    }
    
    // Cálculo de caída de tensión usando resistencias reales:
    // ΔV = systemFactor × (R_km × L_km) × I / N_paralelo
    const lengthInKm = lengthInMeters / 1000;
    const totalResistance = (adjustedResistancePerKm * lengthInKm) / parallelConductors;
    let voltageDrop = systemFactor * totalResistance * current;
    
    // Validación: Si la caída de tensión es mayor o igual a la tensión de entrada, el resultado es 0
    if (voltageDrop >= voltageInV) {
      voltageDrop = 0;
    }
    
    const voltageDropPercentage = (voltageDrop / voltageInV) * 100;
    const finalVoltage = Math.max(0, voltageInV - voltageDrop); // Asegurar que no sea negativa
    
    // Determinar si cumple con límite
    const displayValue = voltageDropUnit === 'voltage' ? voltageDrop : voltageDropPercentage;
    const limitValue = voltageDropUnit === 'voltage' ? (voltageInV * maxVoltageDrop / 100) : maxVoltageDrop;
    const isWithinLimit = displayValue <= limitValue;
    const isOverVoltage = voltageDrop === 0 && systemFactor * totalResistance * current >= voltageInV;
    
    setResult({
      voltageDrop: voltageDrop.toFixed(3),
      percentage: voltageDropPercentage.toFixed(2),
      finalVoltage: finalVoltage.toFixed(1),
      current: current.toFixed(2),
      displayValue: displayValue.toFixed(voltageDropUnit === 'voltage' ? 3 : 2),
      displayUnit: voltageDropUnit === 'voltage' ? 'V' : '%',
      isWithinLimit,
      isOverVoltage,
      limitValue: limitValue.toFixed(voltageDropUnit === 'voltage' ? 3 : 1),
      systemFactor: systemFactor.toFixed(2),
      effectiveSection: effectiveSection.toFixed(2),
      resistancePerKm: adjustedResistancePerKm.toFixed(4),
      totalResistance: totalResistance.toFixed(6),
      material: material,
      ambientTemp: ambientTemp
    });
  };

  const handleInputChange = (field, value) => {
    setInputs(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="p-6">
      <h2 className="text-xl font-semibold mb-6">Cálculo de Caída de Tensión</h2>
      
      <div className="grid md:grid-cols-2 gap-6">
        {/* Inputs */}
        <div className="space-y-4">
          {/* Tipo de Sistema */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
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
                <span>• Monofásico</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="systemType"
                  value="two-phase"
                  checked={inputs.systemType === 'two-phase'}
                  onChange={(e) => handleInputChange('systemType', e.target.value)}
                  className="mr-2"
                />
                <span>• Bifásico</span>
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
                <span>• Trifásico</span>
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
                <span>• Corriente Continua</span>
              </label>
            </div>
          </div>

          {/* Tensión */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tensión
            </label>
            <div className="flex gap-2">
              <input
                type="number"
                value={inputs.voltage}
                onChange={(e) => handleInputChange('voltage', parseFloat(e.target.value) || 0)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <select
                value={inputs.voltageUnit}
                onChange={(e) => handleInputChange('voltageUnit', e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="mV">mV</option>
                <option value="V">V</option>
                <option value="kV">kV</option>
              </select>
            </div>
          </div>

          {/* Carga */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Carga
            </label>
            <div className="flex gap-2">
              <input
                type="number"
                value={inputs.load}
                onChange={(e) => handleInputChange('load', parseFloat(e.target.value) || 0)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <select
                value={inputs.loadUnit}
                onChange={(e) => handleInputChange('loadUnit', e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="W">W</option>
                <option value="kW">kW</option>
                <option value="A">A</option>
                <option value="HP">HP</option>
                <option value="VA">VA</option>
                <option value="kVA">kVA</option>
                <option value="MVA">MVA</option>
                <option value="var">var</option>
                <option value="kvar">kvar</option>
                <option value="Mvar">Mvar</option>
              </select>
            </div>
          </div>

          {/* Factor de Potencia - Solo visible si no es DC */}
          {inputs.systemType !== 'dc' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Factor de Potencia
              </label>
              <div className="flex gap-2">
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  max="1"
                  value={inputs.powerFactor}
                  onChange={(e) => handleInputChange('powerFactor', parseFloat(e.target.value) || 0)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <select
                  value={inputs.powerFactorType}
                  onChange={(e) => handleInputChange('powerFactorType', e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="cos">cos φ</option>
                  <option value="sen">sen φ</option>
                  <option value="tan">tan φ</option>
                </select>
              </div>
            </div>
          )}

          {/* Longitud */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Longitud
            </label>
            <div className="flex gap-2">
              <input
                type="number"
                value={inputs.length}
                onChange={(e) => handleInputChange('length', parseFloat(e.target.value) || 0)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <select
                value={inputs.lengthUnit}
                onChange={(e) => handleInputChange('lengthUnit', e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="m">m</option>
                <option value="km">km</option>
                <option value="ft">ft</option>
              </select>
            </div>
          </div>

          {/* Calibre del Cable */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Calibre del Cable
            </label>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <input
                  type="radio"
                  name="wireSizeUnit"
                  value="mm2"
                  checked={inputs.wireSizeUnit === 'mm2'}
                  onChange={(e) => handleInputChange('wireSizeUnit', e.target.value)}
                  className="mr-1"
                />
                <span className="text-sm">mm²</span>
                <input
                  type="radio"
                  name="wireSizeUnit"
                  value="awg"
                  checked={inputs.wireSizeUnit === 'awg'}
                  onChange={(e) => handleInputChange('wireSizeUnit', e.target.value)}
                  className="mr-1 ml-4"
                />
                <span className="text-sm">AWG</span>
              </div>
              {inputs.wireSizeUnit === 'mm2' ? (
                <select
                  value={inputs.wireSize}
                  onChange={(e) => handleInputChange('wireSize', parseFloat(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {[1.5, 2.5, 4, 6, 10, 16, 25, 35, 50, 70, 95, 120, 150, 185, 240, 300, 400, 500].map(size => (
                    <option key={size} value={size}>{size} mm²</option>
                  ))}
                </select>
              ) : (
                <select
                  value={inputs.wireSize}
                  onChange={(e) => handleInputChange('wireSize', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {['14', '12', '10', '8', '6', '4', '2', '1/0', '2/0', '3/0', '4/0'].map(awg => (
                    <option key={awg} value={awg}>AWG {awg} ({awgToMm2[awg]} mm²)</option>
                  ))}
                </select>
              )}
            </div>
          </div>

          {/* Material del Conductor */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Material
            </label>
            <select
              value={inputs.material}
              onChange={(e) => handleInputChange('material', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="copper">Cobre</option>
              <option value="aluminum">Aluminio</option>
            </select>
          </div>

          {/* Tipo de Cable */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tipo de Cable
            </label>
            <select
              value={inputs.cableType}
              onChange={(e) => handleInputChange('cableType', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="unipolar">Unipolar</option>
              <option value="multipolar">Multipolar</option>
            </select>
          </div>

          {/* Conductores en Paralelo */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Conductores en Paralelo
            </label>
            <select
              value={inputs.parallelConductors}
              onChange={(e) => handleInputChange('parallelConductors', parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {[1, 2, 3, 4, 5, 6].map(num => (
                <option key={num} value={num}>{num} conductor{num > 1 ? 'es' : ''}</option>
              ))}
            </select>
          </div>

          {/* Temperatura */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Temperatura
            </label>
            <select
              value={`${inputs.temperature}${inputs.tempUnit}`}
              onChange={(e) => {
                const value = e.target.value;
                if (value.includes('C')) {
                  handleInputChange('temperature', parseFloat(value));
                  handleInputChange('tempUnit', 'C');
                } else {
                  const temp = parseFloat(value);
                  const tempC = (temp - 32) * 5/9;
                  handleInputChange('temperature', Math.round(tempC));
                  handleInputChange('tempUnit', 'F');
                }
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="10C">10 °C | 50 °F</option>
              <option value="15C">15 °C | 59 °F</option>
              <option value="20C">20 °C | 68 °F</option>
              <option value="25C">25 °C | 77 °F</option>
              <option value="30C">30 °C | 86 °F</option>
              <option value="35C">35 °C | 95 °F</option>
              <option value="40C">40 °C | 104 °F</option>
              <option value="45C">45 °C | 113 °F</option>
              <option value="50C">50 °C | 122 °F</option>
            </select>
          </div>

          {/* Límite de Caída de Tensión */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Caída de Tensión Máxima
            </label>
            <div className="flex gap-2">
              <input
                type="number"
                step="0.1"
                value={inputs.maxVoltageDrop}
                onChange={(e) => handleInputChange('maxVoltageDrop', parseFloat(e.target.value) || 0)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <select
                value={inputs.voltageDropUnit}
                onChange={(e) => handleInputChange('voltageDropUnit', e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="percentage">%</option>
                <option value="voltage">V</option>
              </select>
            </div>
          </div>

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
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="text-sm text-blue-600 font-medium">Caída de Tensión</div>
                <div className="text-2xl font-bold text-blue-900">{result.voltageDrop} V</div>
              </div>

              <div className="bg-red-50 p-4 rounded-lg">
                <div className="text-sm text-red-600 font-medium">Porcentaje</div>
                <div className="text-2xl font-bold text-red-900">{result.percentage} %</div>
              </div>

              <div className="bg-green-50 p-4 rounded-lg">
                <div className="text-sm text-green-600 font-medium">Tensión Final</div>
                <div className="text-2xl font-bold text-green-900">{result.finalVoltage} V</div>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="text-sm text-gray-600 font-medium">Factor de Sistema</div>
                <div className="text-xl font-bold text-gray-900">{result.systemFactor}</div>
                <div className="text-xs text-gray-600">
                  {inputs.systemType === 'single-phase' ? 'Monofásico (2)' : 
                   inputs.systemType === 'three-phase' ? 'Trifásico (√3 ≈ 1.73)' : 
                   'DC (2)'}
                </div>
              </div>

              {/* Alerta de sobretension */}
              {result.isOverVoltage && (
                <div className="p-4 rounded-lg border-2 bg-red-100 border-red-400">
                  <div className="text-sm font-bold text-red-800">
                    ⚠️ ADVERTENCIA: CAÍDA DE TENSIÓN EXCESIVA
                  </div>
                  <div className="text-xs mt-1 text-red-700">
                    La caída de tensión calculada supera la tensión de entrada. 
                    Resultado establecido en 0. Revise parámetros del circuito.
                  </div>
                </div>
              )}

              <div className={`p-4 rounded-lg border-2 ${
                result.isOverVoltage ? 'bg-red-100 border-red-300' :
                result.isWithinLimit ? 'bg-green-100 border-green-300' : 'bg-orange-100 border-orange-300'
              }`}>
                <div className={`text-sm font-medium ${
                  result.isOverVoltage ? 'text-red-700' :
                  result.isWithinLimit ? 'text-green-700' : 'text-orange-700'
                }`}>
                  Estado: {
                    result.isOverVoltage ? 'CAÍDA EXCESIVA (RESULTADO: 0)' :
                    result.isWithinLimit ? 'DENTRO DEL LÍMITE' : 'EXCEDE EL LÍMITE'
                  }
                </div>
                <div className={`text-xs mt-1 ${
                  result.isOverVoltage ? 'text-red-600' :
                  result.isWithinLimit ? 'text-green-600' : 'text-orange-600'
                }`}>
                  {result.isOverVoltage ? 
                    'La caída calculada era mayor que la tensión total del sistema' :
                    `Valor: ${result.displayValue} ${result.displayUnit} (Límite: ${result.limitValue} ${result.displayUnit})`
                  }
                </div>
              </div>

              <div className="bg-purple-50 p-4 rounded-lg">
                <div className="text-sm text-purple-700 font-medium">Corriente Calculada</div>
                <div className="text-xl font-bold text-purple-900">{result.current} A</div>
              </div>

              <div className="bg-orange-50 p-4 rounded-lg">
                <div className="text-sm text-orange-700 font-medium">Sección Efectiva</div>
                <div className="text-xl font-bold text-orange-900">{result.effectiveSection} mm²</div>
                <div className="text-xs text-orange-600 mt-1">
                  {inputs.parallelConductors > 1 ? `${inputs.parallelConductors} conductores en paralelo` : '1 conductor'}
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="text-sm text-gray-600 font-medium mb-2">Información del Sistema</div>
                <div className="text-xs text-gray-600 space-y-1">
                  <div>• Sistema: {inputs.systemType === 'single-phase' ? 'Monofásico' : 
                                    inputs.systemType === 'two-phase' ? 'Bifásico' :
                                    inputs.systemType === 'three-phase' ? 'Trifásico' : 'DC'}</div>
                  <div>• Conductor: {inputs.wireSizeUnit === 'mm2' ? `${inputs.wireSize} mm²` : 
                                     `AWG ${inputs.wireSize} (${awgToMm2[inputs.wireSize]} mm²)`}</div>
                  <div>• Material: {inputs.material === 'copper' ? 'Cobre' : 'Aluminio'}</div>
                  <div>• Tipo: {inputs.cableType === 'unipolar' ? 'Unipolar' : 'Multipolar'}</div>
                  <div>• Resistencia por km: {result.resistancePerKm} Ω/km @ {result.ambientTemp}°C</div>
                  <div>• Resistencia total: {result.totalResistance} Ω</div>
                  <div>• Basado en resistencias reales de cables comerciales</div>
                  {inputs.systemType !== 'dc' && <div>• Factor potencia: {inputs.powerFactor} {inputs.powerFactorType} φ</div>}
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

      {/* Fórmulas */}
      <div className="mt-8 bg-blue-50 p-4 rounded-lg border-l-4 border-blue-500">
        <h3 className="text-lg font-semibold text-blue-900 mb-2">Fórmulas por Tipo de Sistema</h3>
        <div className="text-blue-800 font-mono space-y-2 text-sm">
          <div><strong>Monofásico:</strong> ΔV = 2 × R_total × I</div>
          <div><strong>Bifásico:</strong> ΔV = 2 × R_total × I</div>
          <div><strong>Trifásico:</strong> ΔV = √3 × R_total × I</div>
          <div><strong>Corriente Continua:</strong> ΔV = 2 × R_total × I</div>
          <div className="mt-2 pt-2 border-t border-blue-200">
            <div><strong>Resistencia Total:</strong> R_total = R_km × L_km / N_paralelo</div>
            <div><strong>Resistencia Real:</strong> R_km = R_tabla × [1 + α × (T - 70)]</div>
          </div>
          <div className="mt-2 pt-2 border-t border-blue-200">
            <div><strong>Cálculo de Corriente:</strong></div>
            <div>I = P / (V × cosφ) para monofásico</div>
            <div>I = P / (√3 × V × cosφ) para trifásico</div>
          </div>
        </div>
        <div className="text-sm text-blue-700 mt-3">
          R_tabla = Resistencia de tabla (Ω/km @ 70°C), α = Coef. temperatura, T = Temperatura actual, 
          L_km = Longitud (km), I = Corriente (A), N_paralelo = Conductores en paralelo
        </div>
      </div>
    </div>
  );
};

export default VoltageDropCalc;