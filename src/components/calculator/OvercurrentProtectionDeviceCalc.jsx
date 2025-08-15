import { useState } from 'react';

const OvercurrentProtectionDeviceCalc = () => {
  const [inputs, setInputs] = useState({
    systemType: 'single-phase',
    voltage: 220,
    voltageUnit: 'V',
    load: 1000,
    loadUnit: 'W',
    powerFactor: 0.9,
    powerFactorType: 'cos',
    installationMethod: '1-A1',
    ambientTemp: 30,
    material: 'copper',
    insulation: 'PVC',
    section: 2.5,
    sectionUnit: 'mm²',
    parallelConductors: 1,
    circuitsInSameConduit: 1,
    protectionDevice: 'circuit-breaker'
  });

  const [result, setResult] = useState(null);

  // Capacidades de corriente base (método A1 a 30°C)
  const currentCapacities = {
    'copper-PVC': {
      1.5: 15.5, 2.5: 21, 4: 28, 6: 36, 10: 50, 16: 68, 25: 89, 35: 110, 50: 134,
      70: 171, 95: 207, 120: 239, 150: 271, 185: 309, 240: 361, 300: 408, 400: 473, 500: 530
    },
    'copper-XLPE': {
      1.5: 19.5, 2.5: 27, 4: 37, 6: 47, 10: 65, 16: 87, 25: 114, 35: 141, 50: 173,
      70: 221, 95: 269, 120: 309, 150: 351, 185: 400, 240: 467, 300: 529, 400: 615, 500: 692
    },
    'aluminum-PVC': {
      16: 53, 25: 69, 35: 85, 50: 104, 70: 133, 95: 161, 120: 186, 150: 211,
      185: 240, 240: 281, 300: 318, 400: 369, 500: 413
    },
    'aluminum-XLPE': {
      16: 68, 25: 89, 35: 110, 50: 135, 70: 172, 95: 209, 120: 241, 150: 273,
      185: 312, 240: 364, 300: 412, 400: 480, 500: 540
    }
  };

  // Factores de corrección de temperatura
  const tempFactors = {
    10: 1.22, 15: 1.17, 20: 1.12, 25: 1.06, 30: 1.00,
    35: 0.94, 40: 0.87, 45: 0.79, 50: 0.71, 55: 0.61, 60: 0.50
  };

  // Factores de agrupamiento
  const groupingFactors = {
    1: 1.00, 2: 0.80, 3: 0.70, 4: 0.65, 5: 0.60, 6: 0.57,
    7: 0.54, 8: 0.52, 9: 0.50, 10: 0.48, 12: 0.45, 15: 0.41,
    16: 0.41, 20: 0.38
  };

  const calculate = () => {
    const { systemType, voltage, voltageUnit, load, loadUnit, powerFactor, powerFactorType,
            material, insulation, section, parallelConductors, circuitsInSameConduit,
            protectionDevice, ambientTemp } = inputs;

    // Convertir tensión a V
    const voltageConversions = { 'mV': 0.001, 'V': 1, 'kV': 1000 };
    const voltageInV = voltage * voltageConversions[voltageUnit];

    // Convertir carga según tipo
    let loadInW = 0;
    if (loadUnit === 'W' || loadUnit === 'kW') {
      loadInW = loadUnit === 'kW' ? load * 1000 : load;
    } else if (loadUnit === 'HP') {
      loadInW = load * 746; // 1 HP = 746 W
    } else if (loadUnit === 'A') {
      // Si está en amperios, calcular potencia
      switch (systemType) {
        case 'single-phase':
          loadInW = voltageInV * load * powerFactor;
          break;
        case 'two-phase':
          loadInW = 2 * voltageInV * load * powerFactor;
          break;
        case 'three-phase':
          loadInW = Math.sqrt(3) * voltageInV * load * powerFactor;
          break;
        case 'dc':
          loadInW = voltageInV * load;
          break;
      }
    }

    // Calcular corriente de carga
    let loadCurrent = 0;
    const pf = powerFactorType === 'sen' ? Math.sqrt(1 - powerFactor * powerFactor) :
               powerFactorType === 'tan' ? powerFactor / Math.sqrt(1 + powerFactor * powerFactor) : powerFactor;

    switch (systemType) {
      case 'single-phase':
        loadCurrent = loadInW / (voltageInV * pf);
        break;
      case 'two-phase':
        loadCurrent = loadInW / (2 * voltageInV * pf);
        break;
      case 'three-phase':
        loadCurrent = loadInW / (Math.sqrt(3) * voltageInV * pf);
        break;
      case 'dc':
        loadCurrent = loadInW / voltageInV;
        break;
    }

    // Obtener capacidad base del conductor
    const materialKey = `${material}-${insulation}`;
    const baseCapacity = currentCapacities[materialKey]?.[section] || 0;

    // Aplicar factores de corrección
    const tempFactor = tempFactors[ambientTemp] || 1.0;
    const groupingFactor = groupingFactors[circuitsInSameConduit] || 0.38;

    // Capacidad corregida del conductor
    const correctedCapacity = baseCapacity * tempFactor * groupingFactor * parallelConductors;

    // Verificar si el conductor es adecuado
    const isAdequate = correctedCapacity >= loadCurrent;

    // Calcular factor de utilización
    const utilizationFactor = (loadCurrent / correctedCapacity) * 100;

    // Seleccionar dispositivo de protección
    const standardRatings = [6, 10, 13, 16, 20, 25, 32, 40, 50, 63, 80, 100, 125, 160, 200, 250];
    let protectionRating = 0;

    if (protectionDevice === 'circuit-breaker') {
      // Para interruptores: rating >= corriente de carga pero <= capacidad del conductor
      protectionRating = standardRatings.find(rating => 
        rating >= loadCurrent && rating <= correctedCapacity
      ) || standardRatings[standardRatings.length - 1];
    } else {
      // Para fusibles: rating >= corriente de carga
      protectionRating = standardRatings.find(rating => rating >= loadCurrent) || standardRatings[standardRatings.length - 1];
    }

    // Verificar coordinación
    const isCoordinated = protectionRating <= correctedCapacity && protectionRating >= loadCurrent;

    setResult({
      loadCurrent: loadCurrent.toFixed(2),
      baseCapacity: baseCapacity,
      correctedCapacity: correctedCapacity.toFixed(2),
      tempFactor: tempFactor,
      groupingFactor: groupingFactor,
      utilizationFactor: utilizationFactor.toFixed(1),
      protectionRating: protectionRating,
      isAdequate: isAdequate,
      isCoordinated: isCoordinated,
      systemType: systemType,
      voltageInV: voltageInV,
      loadInW: loadInW.toFixed(0),
      powerFactor: pf.toFixed(3),
      material: material,
      insulation: insulation,
      section: section,
      parallelConductors: parallelConductors,
      protectionDevice: protectionDevice
    });
  };

  const handleInputChange = (field, value) => {
    setInputs(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="p-6">
      <h2 className="text-xl font-semibold mb-6">Dispositivo de Protección contra Sobrecorriente</h2>
      
      <div className="grid md:grid-cols-2 gap-6">
        {/* Inputs */}
        <div className="space-y-4">
          {/* Tipo de sistema */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tipo de sistema
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
                Monofásico
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
                Bifásico
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
                Trifásico
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
                Corriente Continua
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

          {/* Factor de potencia */}
          {inputs.systemType !== 'dc' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Factor de potencia
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

          {/* Método de instalación */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Método de instalación
            </label>
            <input
              type="text"
              value={inputs.installationMethod}
              onChange={(e) => handleInputChange('installationMethod', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="ej: 1-A1"
            />
          </div>

          {/* Temperatura ambiente */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Temperatura ambiente
            </label>
            <select
              value={inputs.ambientTemp}
              onChange={(e) => handleInputChange('ambientTemp', parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value={10}>10 °C | 50 °F</option>
              <option value={15}>15 °C | 59 °F</option>
              <option value={20}>20 °C | 68 °F</option>
              <option value={25}>25 °C | 77 °F</option>
              <option value={30}>30 °C | 86 °F</option>
              <option value={35}>35 °C | 95 °F</option>
              <option value={40}>40 °C | 104 °F</option>
              <option value={45}>45 °C | 113 °F</option>
              <option value={50}>50 °C | 122 °F</option>
              <option value={55}>55 °C | 131 °F</option>
              <option value={60}>60 °C | 140 °F</option>
            </select>
          </div>

          {/* Material del conductor */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Material del conductor
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

          {/* Aislamiento */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Aislamiento
            </label>
            <select
              value={inputs.insulation}
              onChange={(e) => handleInputChange('insulation', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="PVC">PVC</option>
              <option value="XLPE">XLPE/EPR</option>
            </select>
          </div>

          {/* Sección */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Sección
            </label>
            <div className="flex gap-2">
              <select
                value={inputs.section}
                onChange={(e) => handleInputChange('section', parseFloat(e.target.value))}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {[1.5, 2.5, 4, 6, 10, 16, 25, 35, 50, 70, 95, 120, 150, 185, 240, 300, 400, 500].map(section => (
                  <option key={section} value={section}>{section}</option>
                ))}
              </select>
              <select
                value={inputs.sectionUnit}
                onChange={(e) => handleInputChange('sectionUnit', e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="mm²">mm²</option>
                <option value="AWG">AWG</option>
              </select>
            </div>
          </div>

          {/* Conductores en paralelo */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Conductores en paralelo
            </label>
            <select
              value={inputs.parallelConductors}
              onChange={(e) => handleInputChange('parallelConductors', parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {[1, 2, 3, 4, 5, 6, 8, 10, 12].map(num => (
                <option key={num} value={num}>{num}</option>
              ))}
            </select>
          </div>

          {/* Circuitos en mismo conducto */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Circuitos en mismo conducto
            </label>
            <select
              value={inputs.circuitsInSameConduit}
              onChange={(e) => handleInputChange('circuitsInSameConduit', parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 12, 15, 16, 20].map(num => (
                <option key={num} value={num}>{num}</option>
              ))}
            </select>
          </div>

          {/* Dispositivo de protección */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Dispositivo de protección
            </label>
            <select
              value={inputs.protectionDevice}
              onChange={(e) => handleInputChange('protectionDevice', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="circuit-breaker">Interruptor termomagnético</option>
              <option value="fuse">Fusible</option>
            </select>
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
              <div className={`p-4 rounded-lg ${result.isCoordinated ? 'bg-green-50' : 'bg-red-50'}`}>
                <div className={`text-sm font-medium ${result.isCoordinated ? 'text-green-600' : 'text-red-600'}`}>
                  {result.isCoordinated ? 'Coordinación CORRECTA' : 'Coordinación INCORRECTA'}
                </div>
                <div className={`text-xl font-bold ${result.isCoordinated ? 'text-green-900' : 'text-red-900'}`}>
                  Protección: {result.protectionRating} A
                </div>
              </div>

              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="text-sm text-blue-600 font-medium">Corriente de carga</div>
                <div className="text-xl font-bold text-blue-900">{result.loadCurrent} A</div>
              </div>

              <div className="bg-orange-50 p-4 rounded-lg">
                <div className="text-sm text-orange-600 font-medium">Capacidad del conductor</div>
                <div className="text-xl font-bold text-orange-900">{result.correctedCapacity} A</div>
                <div className="text-xs text-orange-700 mt-1">Base: {result.baseCapacity} A</div>
              </div>

              <div className="bg-purple-50 p-4 rounded-lg">
                <div className="text-sm text-purple-600 font-medium">Factor de utilización</div>
                <div className="text-xl font-bold text-purple-900">{result.utilizationFactor}%</div>
                <div className="text-xs text-purple-700 mt-1">
                  {parseFloat(result.utilizationFactor) <= 80 ? 'Adecuado' : 'Sobrecargado'}
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="text-sm text-gray-600 font-medium mb-2">Factores de corrección</div>
                <div className="text-xs text-gray-600 space-y-1">
                  <div>• Temperatura ({inputs.ambientTemp}°C): {result.tempFactor}</div>
                  <div>• Agrupamiento ({inputs.circuitsInSameConduit} circuitos): {result.groupingFactor}</div>
                  <div>• Conductores en paralelo: {result.parallelConductors}</div>
                </div>
              </div>

              <div className="bg-yellow-50 p-4 rounded-lg">
                <div className="text-sm text-yellow-600 font-medium mb-2">Parámetros del cálculo</div>
                <div className="text-xs text-yellow-600 space-y-1">
                  <div>• Sistema: {result.systemType.replace('-', ' ')}</div>
                  <div>• Tensión: {result.voltageInV} V</div>
                  <div>• Potencia: {result.loadInW} W</div>
                  <div>• Factor de potencia: {result.powerFactor}</div>
                  <div>• Conductor: {result.material === 'copper' ? 'Cobre' : 'Aluminio'} - {result.insulation}</div>
                  <div>• Sección: {result.section} mm²</div>
                  <div>• Protección: {result.protectionDevice === 'circuit-breaker' ? 'Interruptor' : 'Fusible'}</div>
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
          <div><strong>Monofásico:</strong> I = P / (V × cos φ)</div>
          <div><strong>Bifásico:</strong> I = P / (2 × V × cos φ)</div>
          <div><strong>Trifásico:</strong> I = P / (√3 × V × cos φ)</div>
          <div><strong>DC:</strong> I = P / V</div>
          <div><strong>Capacidad corregida:</strong> I_c = I_base × F_temp × F_agrup × N_paralelo</div>
          <div><strong>Factor de utilización:</strong> FU = (I_carga / I_capacidad) × 100%</div>
          <div className="text-xs text-blue-700 mt-2">
            <strong>Donde:</strong> P = potencia, V = tensión, I = corriente, cos φ = factor de potencia, F = factor de corrección
          </div>
        </div>
      </div>
    </div>
  );
};

export default OvercurrentProtectionDeviceCalc;