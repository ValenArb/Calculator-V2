import { useState } from 'react';

const ConductorCapacityCalc = () => {
  const [inputs, setInputs] = useState({
    wireSize: 2.5,
    installationMethod: 'B1',
    temperature: 30,
    groupingFactor: 1,
    numberOfConductors: 3
  });
  
  const [result, setResult] = useState(null);

  // Capacidades base para conductores de cobre (A) según IEC 60364-5-52
  const copperCapacities = {
    1.5: { B1: 20, B2: 25, C: 23, E: 28, F: 30 },
    2.5: { B1: 27, B2: 34, C: 31, E: 38, F: 41 },
    4: { B1: 37, B2: 46, C: 42, E: 51, F: 55 },
    6: { B1: 47, B2: 59, C: 54, E: 65, F: 70 },
    10: { B1: 64, B2: 80, C: 73, E: 88, F: 95 },
    16: { B1: 85, B2: 107, C: 97, E: 117, F: 126 },
    25: { B1: 112, B2: 141, C: 129, E: 156, F: 168 },
    35: { B1: 138, B2: 174, C: 158, E: 191, F: 206 },
    50: { B1: 168, B2: 212, C: 192, E: 232, F: 250 },
    70: { B1: 213, B2: 269, C: 245, E: 296, F: 319 },
    95: { B1: 258, B2: 326, C: 296, E: 358, F: 386 }
  };

  // Factores de corrección por temperatura
  const temperatureFactors = {
    25: 1.12, 30: 1.00, 35: 0.94, 40: 0.87, 45: 0.79,
    50: 0.71, 55: 0.61, 60: 0.50, 65: 0.35, 70: 0.00
  };

  // Factores de agrupamiento
  const groupingFactors = {
    1: 1.00, 2: 0.80, 3: 0.70, 4: 0.65, 5: 0.60,
    6: 0.57, 7: 0.54, 8: 0.52, 9: 0.50, 10: 0.48
  };

  const calculate = () => {
    const { wireSize, installationMethod, temperature, numberOfConductors } = inputs;
    
    const baseCapacity = copperCapacities[wireSize]?.[installationMethod] || 0;
    const tempFactor = temperatureFactors[temperature] || 1;
    const groupingFactor = groupingFactors[numberOfConductors] || 1;
    
    const finalCapacity = baseCapacity * tempFactor * groupingFactor;
    
    setResult({
      baseCapacity,
      tempFactor: tempFactor.toFixed(2),
      groupingFactor: groupingFactor.toFixed(2),
      finalCapacity: finalCapacity.toFixed(1)
    });
  };

  const handleInputChange = (field, value) => {
    setInputs(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="p-6">
      {/* Fórmula */}
      <div className="bg-blue-50 p-4 rounded-lg mb-6 border-l-4 border-blue-500">
        <h3 className="text-lg font-semibold text-blue-900 mb-2">Fórmula</h3>
        <div className="text-blue-800 font-mono">
          I<sub>z</sub> = I<sub>base</sub> × F<sub>temp</sub> × F<sub>agrup</sub>
        </div>
        <div className="text-sm text-blue-700 mt-2">
          I<sub>z</sub> = Capacidad corregida, I<sub>base</sub> = Capacidad base, F<sub>temp</sub> = Factor temperatura, F<sub>agrup</sub> = Factor agrupamiento
        </div>
      </div>

      <h2 className="text-xl font-semibold mb-6">Cálculo de Capacidad de Conductores</h2>
      
      <div className="grid md:grid-cols-2 gap-6">
        {/* Inputs */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Calibre del Conductor (mm²)
            </label>
            <select
              value={inputs.wireSize}
              onChange={(e) => handleInputChange('wireSize', parseFloat(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {[1.5, 2.5, 4, 6, 10, 16, 25, 35, 50, 70, 95].map(size => (
                <option key={size} value={size}>{size} mm²</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Método de Instalación
            </label>
            <select
              value={inputs.installationMethod}
              onChange={(e) => handleInputChange('installationMethod', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="B1">B1 - Cables en conducto empotrado</option>
              <option value="B2">B2 - Cables en conducto sobre pared</option>
              <option value="C">C - Cables en bandeja perforada</option>
              <option value="E">E - Cables al aire libre</option>
              <option value="F">F - Cables en bandeja no perforada</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Temperatura Ambiente (°C)
            </label>
            <select
              value={inputs.temperature}
              onChange={(e) => handleInputChange('temperature', parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {[25, 30, 35, 40, 45, 50, 55, 60, 65, 70].map(temp => (
                <option key={temp} value={temp}>{temp}°C</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Número de Conductores Cargados
            </label>
            <select
              value={inputs.numberOfConductors}
              onChange={(e) => handleInputChange('numberOfConductors', parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(num => (
                <option key={num} value={num}>{num} conductor{num > 1 ? 'es' : ''}</option>
              ))}
            </select>
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
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="text-sm text-gray-600 font-medium">Capacidad Base</div>
                <div className="text-2xl font-bold text-gray-900">{result.baseCapacity} A</div>
              </div>

              <div className="bg-yellow-50 p-4 rounded-lg">
                <div className="text-sm text-yellow-600 font-medium">Factor Temperatura</div>
                <div className="text-2xl font-bold text-yellow-900">{result.tempFactor}</div>
              </div>

              <div className="bg-orange-50 p-4 rounded-lg">
                <div className="text-sm text-orange-600 font-medium">Factor Agrupamiento</div>
                <div className="text-2xl font-bold text-orange-900">{result.groupingFactor}</div>
              </div>

              <div className="bg-green-50 p-4 rounded-lg">
                <div className="text-sm text-green-600 font-medium">Capacidad Corregida</div>
                <div className="text-3xl font-bold text-green-900">{result.finalCapacity} A</div>
              </div>

              <div className="bg-blue-100 p-4 rounded-lg">
                <div className="text-sm text-blue-700 font-medium">Información</div>
                <div className="text-xs text-blue-600 mt-1">
                  Basado en IEC 60364-5-52 para conductores de cobre con aislamiento PVC a 70°C
                </div>
              </div>
            </>
          ) : (
            <div className="text-center py-12 text-gray-500">
              Selecciona los parámetros y haz clic en "Calcular Capacidad"
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ConductorCapacityCalc;
