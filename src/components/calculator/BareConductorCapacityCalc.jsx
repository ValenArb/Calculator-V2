import { useState } from 'react';

const BareConductorCapacityCalc = () => {
  const [inputs, setInputs] = useState({
    installationMethod: '1 - A1',
    material: 'copper',
    conductorType: 'bare', // bare, single_core, multi_core
    wireSize: 10,
    wireSizeUnit: 'mm²',
    conductorsInParallel: 1,
    ambientTemp: '30',
    circuitsInConduit: 1
  });
  
  const [result, setResult] = useState(null);

  // Calibres estándar en mm²
  const standardSizes = [0.5, 0.75, 1, 1.5, 2.5, 4, 6, 10, 16, 25, 35, 50, 70, 95, 120, 150, 185, 240, 300, 400, 500];
  
  // Conversiones AWG a mm²
  const awgToMm2 = {
    '14': 2.08, '12': 3.31, '10': 5.26, '8': 8.37, '6': 13.3,
    '4': 21.2, '2': 33.6, '1/0': 53.5, '2/0': 67.4, '3/0': 85.0, '4/0': 107.2
  };
  
  // Temperaturas predefinidas
  const temperatureOptions = [
    { value: '10', label: '10 °C | 50 °F' },
    { value: '15', label: '15 °C | 59 °F' },
    { value: '20', label: '20 °C | 68 °F' },
    { value: '25', label: '25 °C | 77 °F' },
    { value: '30', label: '30 °C | 86 °F' },
    { value: '35', label: '35 °C | 95 °F' },
    { value: '40', label: '40 °C | 104 °F' },
    { value: '45', label: '45 °C | 113 °F' },
    { value: '50', label: '50 °C | 122 °F' },
    { value: '55', label: '55 °C | 131 °F' },
    { value: '60', label: '60 °C | 140 °F' }
  ];

  // Capacidades base para conductores desnudos (A) - IEC 60364-5-52
  const baseCapacities = {
    copper: {
      1.5: { 'A1': 19, 'A2': 26, 'B1': 22, 'B2': 28, 'C': 27, 'D': 35, 'E': 39, 'F': 46 },
      2.5: { 'A1': 26, 'A2': 35, 'B1': 30, 'B2': 38, 'C': 37, 'D': 47, 'E': 52, 'F': 62 },
      4: { 'A1': 35, 'A2': 45, 'B1': 40, 'B2': 50, 'C': 49, 'D': 62, 'E': 69, 'F': 82 },
      6: { 'A1': 45, 'A2': 57, 'B1': 51, 'B2': 64, 'C': 63, 'D': 80, 'E': 88, 'F': 105 },
      10: { 'A1': 62, 'A2': 78, 'B1': 70, 'B2': 87, 'C': 87, 'D': 109, 'E': 120, 'F': 143 },
      16: { 'A1': 83, 'A2': 103, 'B1': 93, 'B2': 116, 'C': 116, 'D': 145, 'E': 160, 'F': 191 },
      25: { 'A1': 110, 'A2': 130, 'B1': 122, 'B2': 151, 'C': 151, 'D': 187, 'E': 205, 'F': 245 },
      35: { 'A1': 136, 'A2': 160, 'B1': 151, 'B2': 187, 'C': 187, 'D': 231, 'E': 253, 'F': 302 },
      50: { 'A1': 164, 'A2': 195, 'B1': 183, 'B2': 228, 'C': 228, 'D': 282, 'E': 309, 'F': 367 },
      70: { 'A1': 209, 'A2': 250, 'B1': 232, 'B2': 289, 'C': 289, 'D': 358, 'E': 392, 'F': 465 },
      95: { 'A1': 253, 'A2': 304, 'B1': 282, 'B2': 351, 'C': 351, 'D': 434, 'E': 475, 'F': 564 },
      120: { 'A1': 293, 'A2': 352, 'B1': 326, 'B2': 406, 'C': 406, 'D': 502, 'E': 550, 'F': 652 },
      150: { 'A1': 337, 'A2': 404, 'B1': 375, 'B2': 467, 'C': 467, 'D': 577, 'E': 633, 'F': 750 },
      185: { 'A1': 385, 'A2': 462, 'B1': 428, 'B2': 533, 'C': 533, 'D': 658, 'E': 721, 'F': 855 },
      240: { 'A1': 453, 'A2': 543, 'B1': 503, 'B2': 626, 'C': 626, 'D': 773, 'E': 847, 'F': 1004 },
      300: { 'A1': 516, 'A2': 619, 'B1': 574, 'B2': 714, 'C': 714, 'D': 881, 'E': 966, 'F': 1144 },
      400: { 'A1': 592, 'A2': 710, 'B1': 658, 'B2': 818, 'C': 818, 'D': 1010, 'E': 1108, 'F': 1312 },
      500: { 'A1': 662, 'A2': 794, 'B1': 736, 'B2': 914, 'C': 914, 'D': 1128, 'E': 1237, 'F': 1465 }
    },
    aluminum: {
      2.5: { 'A1': 20, 'A2': 27, 'B1': 23, 'B2': 29, 'C': 29, 'D': 36, 'E': 40, 'F': 48 },
      4: { 'A1': 27, 'A2': 35, 'B1': 32, 'B2': 39, 'C': 38, 'D': 48, 'E': 53, 'F': 63 },
      6: { 'A1': 35, 'A2': 45, 'B1': 39, 'B2': 50, 'C': 49, 'D': 62, 'E': 68, 'F': 81 },
      10: { 'A1': 48, 'A2': 60, 'B1': 54, 'B2': 68, 'C': 68, 'D': 85, 'E': 93, 'F': 110 },
      16: { 'A1': 64, 'A2': 80, 'B1': 72, 'B2': 90, 'C': 90, 'D': 112, 'E': 124, 'F': 147 },
      25: { 'A1': 85, 'A2': 100, 'B1': 95, 'B2': 117, 'C': 117, 'D': 145, 'E': 159, 'F': 190 },
      35: { 'A1': 106, 'A2': 124, 'B1': 117, 'B2': 145, 'C': 145, 'D': 179, 'E': 196, 'F': 233 },
      50: { 'A1': 128, 'A2': 151, 'B1': 142, 'B2': 177, 'C': 177, 'D': 218, 'E': 239, 'F': 284 },
      70: { 'A1': 163, 'A2': 193, 'B1': 180, 'B2': 224, 'C': 224, 'D': 277, 'E': 304, 'F': 361 },
      95: { 'A1': 197, 'A2': 235, 'B1': 218, 'B2': 271, 'C': 271, 'D': 335, 'E': 368, 'F': 437 }
    }
  };

  // Factores de corrección por temperatura ambiente
  const temperatureFactors = {
    10: 1.29, 15: 1.22, 20: 1.15, 25: 1.08, 30: 1.00, 35: 0.91,
    40: 0.82, 45: 0.71, 50: 0.58, 55: 0.41, 60: 0.00
  };

  // Factores de agrupamiento
  const groupingFactors = {
    1: 1.00, 2: 0.80, 3: 0.70, 4: 0.65, 5: 0.60, 6: 0.57,
    7: 0.54, 8: 0.52, 9: 0.50, 10: 0.48, 12: 0.45, 15: 0.41, 20: 0.38
  };

  const calculate = () => {
    const { installationMethod, material, conductorType, wireSize, wireSizeUnit, 
            conductorsInParallel, ambientTemp, circuitsInConduit } = inputs;
    
    // Convertir sección si es AWG
    let sectionMm2 = wireSize;
    if (wireSizeUnit === 'AWG') {
      sectionMm2 = awgToMm2[wireSize.toString()] || wireSize;
    }
    
    // Encontrar la sección más cercana en la tabla
    const availableSections = Object.keys(baseCapacities[material]).map(Number);
    const closestSection = availableSections.reduce((prev, curr) => 
      Math.abs(curr - sectionMm2) < Math.abs(prev - sectionMm2) ? curr : prev
    );
    
    // Extraer el método de la cadena (ej: "1 - A1" -> "A1")
    const methodCode = installationMethod.split(' - ')[1] || installationMethod.split(' ')[0];
    
    // Capacidad base
    const baseCapacity = baseCapacities[material][closestSection]?.[methodCode] || 0;
    
    // Factor de temperatura
    const ambientTempNum = parseInt(ambientTemp);
    const tempFactor = temperatureFactors[ambientTempNum] || 1;
    
    // Factor adicional por circuitos en canalización
    let conduitFactor = 1.0;
    if (circuitsInConduit > 1) {
      if (circuitsInConduit <= 4) {
        conduitFactor = 0.8;
      } else if (circuitsInConduit <= 6) {
        conduitFactor = 0.7;
      } else {
        conduitFactor = 0.6;
      }
    }
    
    // Factor por conductores en paralelo (sin derating adicional para desnudos)
    let parallelFactor = 1.0;
    
    // Capacidad por conductor
    const capacityPerConductor = baseCapacity * tempFactor * conduitFactor * parallelFactor;
    
    // Capacidad total considerando conductores en paralelo
    const totalCapacity = capacityPerConductor * conductorsInParallel;
    
    // Verificaciones de seguridad
    const isSafe = capacityPerConductor > 0 && tempFactor > 0.4;
    const maxTemp = conductorType === 'bare' ? 80 : 90;
    
    // Cálculo de impedancia del conductor
    const resistivity = material === 'copper' ? 0.017241 : 0.028264; // Ω·mm²/m
    const tempCoeff = material === 'copper' ? 0.00393 : 0.00403;
    const avgTemp = parseInt(ambientTemp) + 15; // Temperatura promedio estimada
    const resistance = (resistivity * (1 + tempCoeff * (avgTemp - 20))) / closestSection; // Ω/m
    
    // Para conductores desnudos, la reactancia es mayor debido a la separación
    const reactance = conductorType === 'bare' ? 0.0004 : 0.0002; // Ω/m
    const impedance = Math.sqrt(resistance * resistance + reactance * reactance);
    
    setResult({
      baseCapacity: baseCapacity.toFixed(0),
      tempFactor: tempFactor.toFixed(2),
      conduitFactor: conduitFactor.toFixed(2),
      parallelFactor: parallelFactor.toFixed(2),
      capacityPerConductor: capacityPerConductor.toFixed(1),
      totalCapacity: totalCapacity.toFixed(1),
      actualSection: closestSection,
      isSafe,
      maxTemp: maxTemp,
      material: material,
      methodCode: methodCode,
      conductorsInParallel: conductorsInParallel,
      conductorType: conductorType,
      impedance: impedance.toFixed(6)
    });
  };

  const handleInputChange = (field, value) => {
    if (['material', 'conductorType', 'installationMethod', 'wireSizeUnit', 'ambientTemp'].includes(field)) {
      setInputs(prev => ({ ...prev, [field]: value }));
    } else {
      setInputs(prev => ({ ...prev, [field]: parseFloat(value) || 0 }));
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-xl font-semibold mb-6">Corriente por Conductores sin Aislar</h2>
      
      <div className="grid md:grid-cols-2 gap-6">
        {/* Inputs */}
        <div className="space-y-4">
          {/* Método de instalación */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Método de instalación
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={inputs.installationMethod}
                onChange={(e) => handleInputChange('installationMethod', e.target.value)}
                placeholder="ej: 1 - A1"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <button className="px-3 py-2 border border-gray-300 rounded-md hover:bg-gray-50">
                🔍
              </button>
            </div>
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

          {/* Tipo de conductor */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tipo de conductor
            </label>
            <select
              value={inputs.conductorType}
              onChange={(e) => handleInputChange('conductorType', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="bare">Conductor desnudo</option>
              <option value="single_core">Cable unipolar</option>
              <option value="multi_core">Cable multipolar</option>
            </select>
          </div>

          {/* Sección de cable */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Sección de cable
            </label>
            <div className="flex gap-2">
              <select
                value={inputs.wireSize}
                onChange={(e) => handleInputChange('wireSize', parseFloat(e.target.value))}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {standardSizes.filter(size => size <= 500).map(size => (
                  <option key={size} value={size}>{size}</option>
                ))}
              </select>
              <select
                value={inputs.wireSizeUnit}
                onChange={(e) => handleInputChange('wireSizeUnit', e.target.value)}
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
              value={inputs.conductorsInParallel}
              onChange={(e) => handleInputChange('conductorsInParallel', parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {[1, 2, 3, 4, 5, 6, 7, 8].map(num => (
                <option key={num} value={num}>{num}</option>
              ))}
            </select>
          </div>

          {/* Temperatura ambiente */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Temperatura ambiente
            </label>
            <select
              value={inputs.ambientTemp}
              onChange={(e) => handleInputChange('ambientTemp', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {temperatureOptions.map(temp => (
                <option key={temp.value} value={temp.value}>{temp.label}</option>
              ))}
            </select>
          </div>

          {/* Cantidad de circuitos en canalización */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Cantidad de circuitos en misma canalización
            </label>
            <select
              value={inputs.circuitsInConduit}
              onChange={(e) => handleInputChange('circuitsInConduit', parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 12, 15, 20].map(num => (
                <option key={num} value={num}>{num}</option>
              ))}
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
              <div className="bg-green-50 p-4 rounded-lg border-2 border-green-200">
                <div className="text-sm text-green-600 font-medium">Capacidad por conductor</div>
                <div className="text-2xl font-bold text-green-900">{result.capacityPerConductor} A</div>
                <div className="text-xs text-green-600">Sección: {result.actualSection} mm²</div>
              </div>

              {result.conductorsInParallel > 1 && (
                <div className="bg-blue-50 p-4 rounded-lg border-2 border-blue-200">
                  <div className="text-sm text-blue-600 font-medium">Capacidad total</div>
                  <div className="text-3xl font-bold text-blue-900">{result.totalCapacity} A</div>
                  <div className="text-xs text-blue-600">{result.conductorsInParallel} conductores en paralelo</div>
                </div>
              )}

              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="text-sm text-gray-600 font-medium">Capacidad base</div>
                <div className="text-xl font-bold text-gray-900">{result.baseCapacity} A</div>
                <div className="text-xs text-gray-600">Método: {result.methodCode}</div>
              </div>

              <div className="bg-yellow-50 p-4 rounded-lg">
                <div className="text-sm text-yellow-600 font-medium mb-2">Factores de corrección aplicados</div>
                <div className="text-xs text-yellow-600 space-y-1">
                  <div>• Temperatura: {result.tempFactor}</div>
                  <div>• Canalización: {result.conduitFactor}</div>
                  <div>• Paralelo: {result.parallelFactor}</div>
                </div>
              </div>

              <div className={`p-4 rounded-lg border-2 ${
                result.isSafe ? 'bg-green-100 border-green-300' : 'bg-red-100 border-red-300'
              }`}>
                <div className={`text-sm font-medium ${
                  result.isSafe ? 'text-green-700' : 'text-red-700'
                }`}>
                  Estado: {result.isSafe ? '✅ SEGURO' : '⚠️ REVISAR PARÁMETROS'}
                </div>
                <div className={`text-xs mt-1 ${
                  result.isSafe ? 'text-green-600' : 'text-red-600'
                }`}>
                  Temp. máxima conductor: {result.maxTemp}°C
                </div>
              </div>

              <div className="bg-purple-50 p-4 rounded-lg">
                <div className="text-sm text-purple-700 font-medium">Información del sistema</div>
                <div className="text-xs text-purple-600 space-y-1 mt-1">
                  <div>• Material: {result.material === 'copper' ? 'Cobre' : 'Aluminio'}</div>
                  <div>• Tipo: {result.conductorType === 'bare' ? 'Desnudo' : result.conductorType}</div>
                  <div>• Método: {inputs.installationMethod}</div>
                  <div>• Impedancia del conductor: {result.impedance} Ω/m</div>
                  <div>• Basado en IEC 60364-5-52</div>
                </div>
              </div>
            </>
          ) : (
            <div className="text-center py-12 text-gray-500">
              Selecciona los parámetros del conductor y haz clic en "Calcular"
            </div>
          )}
        </div>
      </div>

      {/* Fórmulas */}
      <div className="mt-8 bg-blue-50 p-4 rounded-lg border-l-4 border-blue-500">
        <h3 className="text-lg font-semibold text-blue-900 mb-2">Fórmulas Utilizadas</h3>
        <div className="text-blue-800 font-mono space-y-2 text-sm">
          <div><strong>Capacidad por conductor:</strong></div>
          <div>• I_conductor = I_base × F_temperatura × F_canalización × F_paralelo</div>
          
          <div className="mt-4"><strong>Capacidad total:</strong></div>
          <div>• I_total = I_conductor × N_conductores_paralelo</div>
          
          <div className="mt-4"><strong>Factores de corrección:</strong></div>
          <div>• F_temperatura: según temperatura ambiente y tipo de conductor</div>
          <div>• F_canalización: según cantidad de circuitos en la misma canalización</div>
          <div>• F_paralelo: factor unitario para conductores desnudos</div>
        </div>
        <div className="text-sm text-blue-700 mt-3">
          I = Corriente (A), F = Factores de corrección, N = Número de conductores
        </div>
      </div>
    </div>
  );
};

export default BareConductorCapacityCalc;