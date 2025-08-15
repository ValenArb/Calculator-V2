import { useState } from 'react';

const InsulatedConductorCapacityCalc = () => {
  const [inputs, setInputs] = useState({
    installationMethod: '1 - A1',
    material: 'copper',
    insulation: 'PVC',
    wireSize: 10,
    wireSizeUnit: 'mm²',
    ambientTemp: '30',
    conductorsPerCircuit: 3,
    conductorsInParallel: 1,
    circuitsInConduit: 1,
    parallelDeratingEnabled: false
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

  // Capacidades base para conductores aislados (A) - IEC 60364-5-52
  const baseCapacities = {
    copper: {
      PVC: {
        1.5: { 'A1': 17.5, 'A2': 24, 'B1': 20, 'B2': 26, 'C': 25, 'D': 32, 'E': 36, 'F': 43 },
        2.5: { 'A1': 24, 'A2': 32, 'B1': 27, 'B2': 35, 'C': 34, 'D': 43, 'E': 48, 'F': 57 },
        4: { 'A1': 32, 'A2': 41, 'B1': 37, 'B2': 46, 'C': 45, 'D': 57, 'E': 63, 'F': 75 },
        6: { 'A1': 41, 'A2': 52, 'B1': 47, 'B2': 59, 'C': 58, 'D': 73, 'E': 81, 'F': 96 },
        10: { 'A1': 57, 'A2': 71, 'B1': 64, 'B2': 80, 'C': 80, 'D': 100, 'E': 110, 'F': 131 },
        16: { 'A1': 76, 'A2': 94, 'B1': 85, 'B2': 107, 'C': 107, 'D': 133, 'E': 147, 'F': 175 },
        25: { 'A1': 101, 'A2': 119, 'B1': 112, 'B2': 138, 'C': 138, 'D': 171, 'E': 188, 'F': 224 },
        35: { 'A1': 125, 'A2': 147, 'B1': 138, 'B2': 171, 'C': 171, 'D': 212, 'E': 232, 'F': 276 },
        50: { 'A1': 151, 'A2': 179, 'B1': 168, 'B2': 209, 'C': 209, 'D': 258, 'E': 283, 'F': 335 },
        70: { 'A1': 192, 'A2': 229, 'B1': 213, 'B2': 265, 'C': 265, 'D': 328, 'E': 359, 'F': 425 },
        95: { 'A1': 232, 'A2': 278, 'B1': 258, 'B2': 321, 'C': 321, 'D': 397, 'E': 435, 'F': 515 },
        120: { 'A1': 269, 'A2': 322, 'B1': 299, 'B2': 372, 'C': 372, 'D': 460, 'E': 504, 'F': 596 },
        150: { 'A1': 309, 'A2': 370, 'B1': 344, 'B2': 428, 'C': 428, 'D': 529, 'E': 580, 'F': 686 },
        185: { 'A1': 353, 'A2': 423, 'B1': 392, 'B2': 487, 'C': 487, 'D': 601, 'E': 659, 'F': 779 },
        240: { 'A1': 415, 'A2': 497, 'B1': 461, 'B2': 572, 'C': 572, 'D': 706, 'E': 774, 'F': 915 },
        300: { 'A1': 473, 'A2': 566, 'B1': 526, 'B2': 652, 'C': 652, 'D': 804, 'E': 882, 'F': 1042 },
        400: { 'A1': 542, 'A2': 649, 'B1': 603, 'B2': 748, 'C': 748, 'D': 923, 'E': 1012, 'F': 1196 },
        500: { 'A1': 606, 'A2': 726, 'B1': 674, 'B2': 836, 'C': 836, 'D': 1030, 'E': 1131, 'F': 1337 }
      },
      'XLPE/EPR': {
        1.5: { 'A1': 20, 'A2': 27, 'B1': 23, 'B2': 30, 'C': 29, 'D': 37, 'E': 41, 'F': 49 },
        2.5: { 'A1': 27, 'A2': 36, 'B1': 31, 'B2': 40, 'C': 39, 'D': 49, 'E': 54, 'F': 65 },
        4: { 'A1': 37, 'A2': 47, 'B1': 42, 'B2': 53, 'C': 51, 'D': 65, 'E': 72, 'F': 85 },
        6: { 'A1': 47, 'A2': 59, 'B1': 54, 'B2': 67, 'C': 66, 'D': 83, 'E': 92, 'F': 109 },
        10: { 'A1': 65, 'A2': 81, 'B1': 73, 'B2': 91, 'C': 91, 'D': 114, 'E': 125, 'F': 149 },
        16: { 'A1': 87, 'A2': 107, 'B1': 97, 'B2': 122, 'C': 122, 'D': 151, 'E': 167, 'F': 199 },
        25: { 'A1': 115, 'A2': 135, 'B1': 128, 'B2': 158, 'C': 158, 'D': 195, 'E': 214, 'F': 255 },
        35: { 'A1': 142, 'A2': 167, 'B1': 158, 'B2': 195, 'C': 195, 'D': 241, 'E': 264, 'F': 315 },
        50: { 'A1': 172, 'A2': 203, 'B1': 192, 'B2': 238, 'C': 238, 'D': 294, 'E': 322, 'F': 383 },
        70: { 'A1': 219, 'A2': 260, 'B1': 243, 'B2': 302, 'C': 302, 'D': 374, 'E': 409, 'F': 487 },
        95: { 'A1': 264, 'A2': 316, 'B1': 294, 'B2': 365, 'C': 365, 'D': 452, 'E': 496, 'F': 590 },
        120: { 'A1': 306, 'A2': 366, 'B1': 341, 'B2': 423, 'C': 423, 'D': 523, 'E': 574, 'F': 683 },
        150: { 'A1': 352, 'A2': 421, 'B1': 392, 'B2': 487, 'C': 487, 'D': 602, 'E': 660, 'F': 785 },
        185: { 'A1': 402, 'A2': 481, 'B1': 447, 'B2': 555, 'C': 555, 'D': 686, 'E': 752, 'F': 895 },
        240: { 'A1': 473, 'A2': 565, 'B1': 525, 'B2': 652, 'C': 652, 'D': 806, 'E': 884, 'F': 1051 },
        300: { 'A1': 539, 'A2': 644, 'B1': 599, 'B2': 743, 'C': 743, 'D': 918, 'E': 1007, 'F': 1197 },
        400: { 'A1': 618, 'A2': 738, 'B1': 687, 'B2': 852, 'C': 852, 'D': 1052, 'E': 1154, 'F': 1372 },
        500: { 'A1': 691, 'A2': 826, 'B1': 769, 'B2': 953, 'C': 953, 'D': 1176, 'E': 1290, 'F': 1533 }
      }
    },
    aluminum: {
      PVC: {
        2.5: { 'A1': 18, 'A2': 25, 'B1': 21, 'B2': 27, 'C': 26, 'D': 33, 'E': 37, 'F': 44 },
        4: { 'A1': 25, 'A2': 32, 'B1': 29, 'B2': 36, 'C': 35, 'D': 44, 'E': 49, 'F': 58 },
        6: { 'A1': 32, 'A2': 41, 'B1': 36, 'B2': 46, 'C': 45, 'D': 57, 'E': 63, 'F': 74 },
        10: { 'A1': 44, 'A2': 55, 'B1': 50, 'B2': 62, 'C': 62, 'D': 78, 'E': 85, 'F': 101 },
        16: { 'A1': 59, 'A2': 73, 'B1': 66, 'B2': 83, 'C': 83, 'D': 103, 'E': 114, 'F': 135 },
        25: { 'A1': 78, 'A2': 92, 'B1': 87, 'B2': 107, 'C': 107, 'D': 133, 'E': 146, 'F': 174 },
        35: { 'A1': 97, 'A2': 114, 'B1': 107, 'B2': 133, 'C': 133, 'D': 164, 'E': 180, 'F': 214 },
        50: { 'A1': 117, 'A2': 138, 'B1': 130, 'B2': 162, 'C': 162, 'D': 200, 'E': 219, 'F': 260 },
        70: { 'A1': 149, 'A2': 177, 'B1': 165, 'B2': 205, 'C': 205, 'D': 254, 'E': 278, 'F': 330 },
        95: { 'A1': 180, 'A2': 215, 'B1': 200, 'B2': 249, 'C': 249, 'D': 308, 'E': 337, 'F': 400 }
      }
    }
  };

  // Factores de corrección por temperatura ambiente
  const temperatureFactors = {
    PVC: {
      10: 1.22, 15: 1.17, 20: 1.12, 25: 1.06, 30: 1.00, 35: 0.94,
      40: 0.87, 45: 0.79, 50: 0.71, 55: 0.61, 60: 0.50, 65: 0.35, 70: 0.00
    },
    'XLPE/EPR': {
      10: 1.15, 15: 1.12, 20: 1.08, 25: 1.04, 30: 1.00, 35: 0.96,
      40: 0.91, 45: 0.87, 50: 0.82, 55: 0.76, 60: 0.71, 65: 0.65, 70: 0.58,
      75: 0.50, 80: 0.41, 85: 0.29, 90: 0.00
    }
  };

  // Factores de agrupamiento
  const groupingFactors = {
    1: 1.00, 2: 0.80, 3: 0.70, 4: 0.65, 5: 0.60, 6: 0.57,
    7: 0.54, 8: 0.52, 9: 0.50, 10: 0.48, 12: 0.45, 15: 0.41, 20: 0.38
  };

  const calculate = () => {
    const { installationMethod, material, insulation, wireSize, wireSizeUnit, ambientTemp,
            conductorsPerCircuit, conductorsInParallel, circuitsInConduit, parallelDeratingEnabled } = inputs;
    
    // Convertir sección si es AWG
    let sectionMm2 = wireSize;
    if (wireSizeUnit === 'AWG') {
      sectionMm2 = awgToMm2[wireSize.toString()] || wireSize;
    }
    
    // Encontrar la sección más cercana en la tabla
    const availableSections = Object.keys(baseCapacities[material][insulation]).map(Number);
    const closestSection = availableSections.reduce((prev, curr) => 
      Math.abs(curr - sectionMm2) < Math.abs(prev - sectionMm2) ? curr : prev
    );
    
    // Extraer el método de la cadena (ej: "1 - A1" -> "A1")
    const methodCode = installationMethod.split(' - ')[1] || installationMethod.split(' ')[0];
    
    // Capacidad base
    const baseCapacity = baseCapacities[material][insulation][closestSection]?.[methodCode] || 0;
    
    // Factor de temperatura
    const ambientTempNum = parseInt(ambientTemp);
    const tempFactor = temperatureFactors[insulation][ambientTempNum] || 1;
    
    // Factor de agrupamiento por conductores por circuito
    const circuitGroupFactor = groupingFactors[conductorsPerCircuit] || 0.5;
    
    // Factor adicional por circuitos en canalización
    let conduitFactor = 1.0;
    if (circuitsInConduit > 1) {
      // Reducción por múltiples circuitos
      if (circuitsInConduit <= 4) {
        conduitFactor = 0.8;
      } else if (circuitsInConduit <= 6) {
        conduitFactor = 0.7;
      } else {
        conduitFactor = 0.6;
      }
    }
    
    // Factor por conductores en paralelo
    let parallelFactor = 1.0;
    if (conductorsInParallel > 1) {
      if (parallelDeratingEnabled) {
        // Aplicar factor de derating por paralelo
        parallelFactor = Math.max(0.8, 1.0 - (conductorsInParallel - 1) * 0.05);
      }
    }
    
    // Capacidad por conductor
    const capacityPerConductor = baseCapacity * tempFactor * circuitGroupFactor * conduitFactor * parallelFactor;
    
    // Capacidad total considerando conductores en paralelo
    const totalCapacity = capacityPerConductor * conductorsInParallel;
    
    // Verificaciones de seguridad
    const isSafe = capacityPerConductor > 0 && tempFactor > 0.3;
    const maxTemp = insulation === 'PVC' ? 70 : 90;
    
    // Cálculo de impedancia del conductor
    const resistivity = material === 'copper' ? 0.017241 : 0.028264; // Ω·mm²/m
    const tempCoeff = material === 'copper' ? 0.00393 : 0.00403;
    const avgTemp = parseInt(ambientTemp) + 20; // Temperatura promedio estimada
    const resistance = (resistivity * (1 + tempCoeff * (avgTemp - 20))) / closestSection; // Ω/m
    
    // Para AC, considerar reactancia inductiva típica
    const reactance = 0.00015; // Ω/m (valor típico para cables aislados)
    const impedance = Math.sqrt(resistance * resistance + reactance * reactance);
    
    setResult({
      baseCapacity: baseCapacity.toFixed(0),
      tempFactor: tempFactor.toFixed(2),
      circuitGroupFactor: circuitGroupFactor.toFixed(2),
      conduitFactor: conduitFactor.toFixed(2),
      parallelFactor: parallelFactor.toFixed(2),
      capacityPerConductor: capacityPerConductor.toFixed(1),
      totalCapacity: totalCapacity.toFixed(1),
      actualSection: closestSection,
      isSafe,
      maxTemp: maxTemp,
      material: material,
      insulation: insulation,
      methodCode: methodCode,
      conductorsInParallel: conductorsInParallel,
      impedance: impedance.toFixed(6)
    });
  };

  const handleInputChange = (field, value) => {
    if (['material', 'insulation', 'installationMethod', 'wireSizeUnit', 'ambientTemp'].includes(field)) {
      setInputs(prev => ({ ...prev, [field]: value }));
    } else if (field === 'parallelDeratingEnabled') {
      setInputs(prev => ({ ...prev, [field]: value }));
    } else {
      setInputs(prev => ({ ...prev, [field]: parseFloat(value) || 0 }));
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-xl font-semibold mb-6">Corriente por Conductores Aislados</h2>
      
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

          {/* Aislación */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Aislación
            </label>
            <select
              value={inputs.insulation}
              onChange={(e) => handleInputChange('insulation', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="PVC">PVC</option>
              <option value="XLPE/EPR">XLPE/EPR</option>
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

          {/* Conductores por circuito */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Conductores por circuito
            </label>
            <select
              value={inputs.conductorsPerCircuit}
              onChange={(e) => handleInputChange('conductorsPerCircuit', parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 12, 15, 20].map(num => (
                <option key={num} value={num}>{num}</option>
              ))}
            </select>
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

          {/* Cantidad de circuitos en canalización */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Cantidad de circuitos en canalización
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

          {/* Factor de derateo por cables en paralelo */}
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-gray-700">
              Factor de derateo por cables en paralelo
            </label>
            <button
              type="button"
              onClick={() => handleInputChange('parallelDeratingEnabled', !inputs.parallelDeratingEnabled)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                inputs.parallelDeratingEnabled ? 'bg-blue-600' : 'bg-gray-200'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  inputs.parallelDeratingEnabled ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          <button
            onClick={calculate}
            className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
          >
            Calcular Capacidad
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
                  <div>• Agrupamiento (circuito): {result.circuitGroupFactor}</div>
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
                  Temp. máxima aislamiento: {result.maxTemp}°C
                </div>
              </div>

              <div className="bg-purple-50 p-4 rounded-lg">
                <div className="text-sm text-purple-700 font-medium">Información del sistema</div>
                <div className="text-xs text-purple-600 space-y-1 mt-1">
                  <div>• Material: {result.material === 'copper' ? 'Cobre' : 'Aluminio'}</div>
                  <div>• Aislamiento: {result.insulation} ({result.maxTemp}°C)</div>
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
          <div>• I_conductor = I_base × F_temperatura × F_agrupamiento_circuito × F_canalización × F_paralelo</div>
          
          <div className="mt-4"><strong>Capacidad total:</strong></div>
          <div>• I_total = I_conductor × N_conductores_paralelo</div>
          
          <div className="mt-4"><strong>Factores de corrección:</strong></div>
          <div>• F_temperatura: según temperatura ambiente y tipo de aislamiento</div>
          <div>• F_agrupamiento: según cantidad de conductores por circuito</div>
          <div>• F_canalización: según cantidad de circuitos en la misma canalización</div>
          <div>• F_paralelo: factor de derating opcional para conductores en paralelo</div>
        </div>
        <div className="text-sm text-blue-700 mt-3">
          I = Corriente (A), F = Factores de corrección, N = Número de conductores
        </div>
      </div>
    </div>
  );
};

export default InsulatedConductorCapacityCalc;