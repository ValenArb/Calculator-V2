import { useState } from 'react';

const CableSizeCoordinationCalc = () => {
  const [inputs, setInputs] = useState({
    systemType: 'single-phase',
    voltage: 220,
    load: 1000,
    powerFactor: 0.9,
    lineLength: 50,
    lengthUnit: 'm',
    installationMethod: '1-A1',
    ambientTemp: 30,
    material: 'copper',
    insulation: 'PVC',
    circuitsInConduit: 1,
    maxVoltageDrop: 3,
    voltageDropUnit: '%',
    loadIncrease: 25,
    protectionDevice: 'circuit-breaker',
    maxCableSize: 1000,
    maxCableSizeUnit: 'mm²'
  });

  const [result, setResult] = useState(null);

  // Capacidades de corriente base y resistencias
  const currentCapacities = {
    'copper-PVC': {
      1.5: 15.5, 2.5: 21, 4: 28, 6: 36, 10: 50, 16: 68, 25: 89, 35: 110, 50: 134,
      70: 171, 95: 207, 120: 239, 150: 271, 185: 309, 240: 361, 300: 408, 400: 473, 500: 530
    },
    'copper-XLPE': {
      1.5: 19.5, 2.5: 27, 4: 37, 6: 47, 10: 65, 16: 87, 25: 114, 35: 141, 50: 173,
      70: 221, 95: 269, 120: 309, 150: 351, 185: 400, 240: 467, 300: 529, 400: 615, 500: 692
    }
  };

  const resistances = {
    copper: { 1.5: 12.1, 2.5: 7.41, 4: 4.61, 6: 3.08, 10: 1.83, 16: 1.15, 25: 0.727, 35: 0.524, 50: 0.387,
              70: 0.268, 95: 0.193, 120: 0.153, 150: 0.124, 185: 0.099, 240: 0.0754, 300: 0.0601, 400: 0.047, 500: 0.0366 },
    aluminum: { 16: 1.91, 25: 1.2, 35: 0.868, 50: 0.641, 70: 0.443, 95: 0.32, 120: 0.253, 150: 0.206,
                185: 0.164, 240: 0.125, 300: 0.100, 400: 0.0778, 500: 0.0605 }
  };

  // Factores de corrección
  const tempFactors = {
    10: 1.22, 15: 1.17, 20: 1.12, 25: 1.06, 30: 1.00,
    35: 0.94, 40: 0.87, 45: 0.79, 50: 0.71, 55: 0.61, 60: 0.50
  };

  const groupingFactors = {
    1: 1.00, 2: 0.80, 3: 0.70, 4: 0.65, 5: 0.60, 6: 0.57,
    7: 0.54, 8: 0.52, 9: 0.50, 10: 0.48, 12: 0.45, 15: 0.41, 16: 0.41, 20: 0.38
  };

  const standardSections = [1.5, 2.5, 4, 6, 10, 16, 25, 35, 50, 70, 95, 120, 150, 185, 240, 300, 400, 500];
  const standardRatings = [6, 10, 13, 16, 20, 25, 32, 40, 50, 63, 80, 100, 125, 160, 200, 250, 300, 400, 500];

  const calculate = () => {
    const { systemType, voltage, load, powerFactor, lineLength, lengthUnit, material, insulation,
            circuitsInConduit, maxVoltageDrop, voltageDropUnit, loadIncrease, protectionDevice,
            maxCableSize, ambientTemp } = inputs;

    // Convertir longitud a metros
    const lengthInM = lengthUnit === 'km' ? lineLength * 1000 : lineLength;

    // Calcular corriente de carga con aumento
    const loadWithIncrease = load * (1 + loadIncrease / 100);
    let loadCurrent = 0;

    switch (systemType) {
      case 'single-phase':
        loadCurrent = loadWithIncrease / (voltage * powerFactor);
        break;
      case 'two-phase':
        loadCurrent = loadWithIncrease / (2 * voltage * powerFactor);
        break;
      case 'three-phase':
        loadCurrent = loadWithIncrease / (Math.sqrt(3) * voltage * powerFactor);
        break;
      case 'dc':
        loadCurrent = loadWithIncrease / voltage;
        break;
    }

    // Factores de corrección
    const tempFactor = tempFactors[ambientTemp] || 1.0;
    const groupingFactor = groupingFactors[circuitsInConduit] || 0.38;

    // Buscar sección mínima por capacidad de corriente
    const materialKey = `${material}-${insulation}`;
    const capacities = currentCapacities[materialKey] || {};
    
    let minSectionCurrent = 0;
    for (const section of standardSections) {
      if (section > maxCableSize) break;
      const baseCapacity = capacities[section] || 0;
      const correctedCapacity = baseCapacity * tempFactor * groupingFactor;
      if (correctedCapacity >= loadCurrent) {
        minSectionCurrent = section;
        break;
      }
    }

    // Calcular caída de tensión máxima permitida
    const maxVoltageDropV = voltageDropUnit === '%' ? (voltage * maxVoltageDrop / 100) : maxVoltageDrop;

    // Buscar sección mínima por caída de tensión
    const materialResistances = resistances[material] || {};
    let minSectionVoltDrop = 0;

    for (const section of standardSections) {
      if (section > maxCableSize) break;
      const resistance = materialResistances[section] || 0;
      
      let voltageDrop = 0;
      switch (systemType) {
        case 'single-phase':
        case 'dc':
          voltageDrop = 2 * loadCurrent * resistance * lengthInM / 1000;
          break;
        case 'two-phase':
          voltageDrop = 2 * loadCurrent * resistance * lengthInM / 1000;
          break;
        case 'three-phase':
          voltageDrop = Math.sqrt(3) * loadCurrent * resistance * lengthInM / 1000;
          break;
      }

      if (voltageDrop <= maxVoltageDropV) {
        minSectionVoltDrop = section;
        break;
      }
    }

    // Sección mínima requerida (la mayor entre corriente y caída de tensión)
    const minSection = Math.max(minSectionCurrent, minSectionVoltDrop);

    // Verificar si existe una sección válida
    if (minSection === 0 || !standardSections.includes(minSection)) {
      setResult({
        error: 'No se encontró una sección de cable adecuada con las restricciones dadas'
      });
      return;
    }

    // Calcular parámetros de la sección seleccionada
    const selectedCapacity = capacities[minSection] * tempFactor * groupingFactor;
    const selectedResistance = materialResistances[minSection];
    
    let actualVoltageDrop = 0;
    switch (systemType) {
      case 'single-phase':
      case 'dc':
        actualVoltageDrop = 2 * loadCurrent * selectedResistance * lengthInM / 1000;
        break;
      case 'two-phase':
        actualVoltageDrop = 2 * loadCurrent * selectedResistance * lengthInM / 1000;
        break;
      case 'three-phase':
        actualVoltageDrop = Math.sqrt(3) * loadCurrent * selectedResistance * lengthInM / 1000;
        break;
    }

    const voltageDropPercent = (actualVoltageDrop / voltage) * 100;

    // Seleccionar dispositivo de protección
    let protectionRating = 0;
    if (protectionDevice === 'circuit-breaker') {
      protectionRating = standardRatings.find(rating => 
        rating >= loadCurrent && rating <= selectedCapacity
      ) || 0;
    } else {
      protectionRating = standardRatings.find(rating => rating >= loadCurrent) || 0;
    }

    // Verificar coordinación
    const isCoordinated = protectionRating > 0 && protectionRating <= selectedCapacity;

    // Factor de utilización
    const utilizationFactor = (loadCurrent / selectedCapacity) * 100;

    setResult({
      loadCurrent: loadCurrent.toFixed(2),
      loadWithIncrease: loadWithIncrease.toFixed(0),
      minSectionCurrent: minSectionCurrent,
      minSectionVoltDrop: minSectionVoltDrop,
      recommendedSection: minSection,
      selectedCapacity: selectedCapacity.toFixed(2),
      actualVoltageDrop: actualVoltageDrop.toFixed(2),
      voltageDropPercent: voltageDropPercent.toFixed(2),
      protectionRating: protectionRating,
      isCoordinated: isCoordinated,
      utilizationFactor: utilizationFactor.toFixed(1),
      tempFactor: tempFactor,
      groupingFactor: groupingFactor,
      systemType: systemType,
      voltage: voltage,
      material: material,
      insulation: insulation,
      lengthInM: lengthInM,
      maxVoltageDropV: maxVoltageDropV.toFixed(2),
      protectionDevice: protectionDevice
    });
  };

  const handleInputChange = (field, value) => {
    setInputs(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="p-6">
      <h2 className="text-xl font-semibold mb-6">Cálculo del Tamaño del Cable y Coordinación del Dispositivo de Protección</h2>
      
      <div className="grid md:grid-cols-2 gap-6">
        {/* Inputs */}
        <div className="space-y-4">
          {/* Tipo de corriente */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tipo de corriente
            </label>
            <div className="space-y-2">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="systemType"
                  value="dc"
                  checked={inputs.systemType === 'dc'}
                  onChange={(e) => handleInputChange('systemType', e.target.value)}
                  className="mr-2"
                />
                Continua
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="systemType"
                  value="single-phase"
                  checked={inputs.systemType === 'single-phase'}
                  onChange={(e) => handleInputChange('systemType', e.target.value)}
                  className="mr-2"
                />
                Alterna monofásica
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
                Alterna bifásica
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
                Alterna trifásica
              </label>
            </div>
          </div>

          {/* Tensión */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tensión (V)
            </label>
            <input
              type="number"
              value={inputs.voltage}
              onChange={(e) => handleInputChange('voltage', parseFloat(e.target.value) || 0)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
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
                value="kW"
                className="px-3 py-2 border border-gray-300 rounded-md bg-gray-50"
                disabled
              >
                <option value="kW">kW</option>
              </select>
            </div>
          </div>

          {/* Factor de potencia */}
          {inputs.systemType !== 'dc' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Factor de potencia
              </label>
              <input
                type="number"
                step="0.01"
                min="0.1"
                max="1"
                value={inputs.powerFactor}
                onChange={(e) => handleInputChange('powerFactor', parseFloat(e.target.value) || 0.9)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          )}

          {/* Longitud de la línea */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Longitud de la línea
            </label>
            <div className="flex gap-2">
              <input
                type="number"
                value={inputs.lineLength}
                onChange={(e) => handleInputChange('lineLength', parseFloat(e.target.value) || 0)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <select
                value={inputs.lengthUnit}
                onChange={(e) => handleInputChange('lengthUnit', e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="m">m</option>
                <option value="km">km</option>
              </select>
            </div>
          </div>

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
              Conductor
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

          {/* Circuitos en el mismo conducto */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Circuitos en el mismo conducto
            </label>
            <select
              value={inputs.circuitsInConduit}
              onChange={(e) => handleInputChange('circuitsInConduit', parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 12, 15, 16, 20].map(num => (
                <option key={num} value={num}>{num}</option>
              ))}
            </select>
          </div>

          {/* Máxima caída de tensión */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Máxima caída de tensión
            </label>
            <div className="flex gap-2">
              <input
                type="number"
                value={inputs.maxVoltageDrop}
                onChange={(e) => handleInputChange('maxVoltageDrop', parseFloat(e.target.value) || 0)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <select
                value={inputs.voltageDropUnit}
                onChange={(e) => handleInputChange('voltageDropUnit', e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="%">%</option>
                <option value="V">V</option>
              </select>
            </div>
          </div>

          {/* Aumento de carga */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Aumento de carga (%)
            </label>
            <input
              type="number"
              value={inputs.loadIncrease}
              onChange={(e) => handleInputChange('loadIncrease', parseFloat(e.target.value) || 0)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
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
              <option value="other">Otros dispositivos de protección</option>
            </select>
          </div>

          {/* Tamaño máximo de cable permitido */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tamaño máximo de cable permitido
            </label>
            <div className="flex gap-2">
              <input
                type="number"
                value={inputs.maxCableSize}
                onChange={(e) => handleInputChange('maxCableSize', parseFloat(e.target.value) || 1000)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <select
                value={inputs.maxCableSizeUnit}
                onChange={(e) => handleInputChange('maxCableSizeUnit', e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="mm²">mm²</option>
                <option value="AWG">AWG</option>
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
          {result && result.error ? (
            <div className="bg-red-50 p-4 rounded-lg">
              <div className="text-sm text-red-600 font-medium">Error</div>
              <div className="text-red-900">{result.error}</div>
            </div>
          ) : result ? (
            <>
              <div className={`p-4 rounded-lg ${result.isCoordinated ? 'bg-green-50' : 'bg-red-50'}`}>
                <div className={`text-sm font-medium ${result.isCoordinated ? 'text-green-600' : 'text-red-600'}`}>
                  {result.isCoordinated ? 'Coordinación CORRECTA' : 'Coordinación INCORRECTA'}
                </div>
                <div className={`text-xl font-bold ${result.isCoordinated ? 'text-green-900' : 'text-red-900'}`}>
                  Cable: {result.recommendedSection} mm²
                </div>
                <div className="text-xs mt-1">Protección: {result.protectionRating} A</div>
              </div>

              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="text-sm text-blue-600 font-medium">Corriente de carga (con aumento)</div>
                <div className="text-xl font-bold text-blue-900">{result.loadCurrent} A</div>
                <div className="text-xs text-blue-700 mt-1">Potencia: {result.loadWithIncrease} W</div>
              </div>

              <div className="bg-orange-50 p-4 rounded-lg">
                <div className="text-sm text-orange-600 font-medium">Caída de tensión real</div>
                <div className="text-xl font-bold text-orange-900">{result.actualVoltageDrop} V ({result.voltageDropPercent}%)</div>
                <div className="text-xs text-orange-700 mt-1">Límite: {result.maxVoltageDropV} V</div>
              </div>

              <div className="bg-purple-50 p-4 rounded-lg">
                <div className="text-sm text-purple-600 font-medium">Capacidad del conductor</div>
                <div className="text-xl font-bold text-purple-900">{result.selectedCapacity} A</div>
                <div className="text-xs text-purple-700 mt-1">Utilización: {result.utilizationFactor}%</div>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="text-sm text-gray-600 font-medium mb-2">Análisis de sección mínima</div>
                <div className="text-xs text-gray-600 space-y-1">
                  <div>• Por corriente: {result.minSectionCurrent} mm²</div>
                  <div>• Por caída de tensión: {result.minSectionVoltDrop} mm²</div>
                  <div>• Sección seleccionada: {result.recommendedSection} mm²</div>
                </div>
              </div>

              <div className="bg-yellow-50 p-4 rounded-lg">
                <div className="text-sm text-yellow-600 font-medium mb-2">Factores de corrección</div>
                <div className="text-xs text-yellow-600 space-y-1">
                  <div>• Temperatura: {result.tempFactor}</div>
                  <div>• Agrupamiento: {result.groupingFactor}</div>
                  <div>• Longitud: {result.lengthInM} m</div>
                  <div>• Material: {result.material === 'copper' ? 'Cobre' : 'Aluminio'}</div>
                  <div>• Aislamiento: {result.insulation}</div>
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
          <div><strong>Corriente de carga:</strong></div>
          <div>• Monofásico/DC: I = P / (V × cos φ)</div>
          <div>• Bifásico: I = P / (2 × V × cos φ)</div>
          <div>• Trifásico: I = P / (√3 × V × cos φ)</div>
          <div><strong>Caída de tensión:</strong></div>
          <div>• Monofásico/DC: ΔV = 2 × I × R × L</div>
          <div>• Trifásico: ΔV = √3 × I × R × L</div>
          <div><strong>Capacidad corregida:</strong> I_c = I_base × F_temp × F_agrup</div>
          <div className="text-xs text-blue-700 mt-2">
            <strong>Donde:</strong> P = potencia, V = tensión, I = corriente, R = resistencia (Ω/km), L = longitud (km)
          </div>
        </div>
      </div>
    </div>
  );
};

export default CableSizeCoordinationCalc;