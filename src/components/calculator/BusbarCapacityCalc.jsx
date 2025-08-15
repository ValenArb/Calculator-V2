import { useState } from 'react';

const BusbarCapacityCalc = () => {
  const [inputs, setInputs] = useState({
    width: 50,
    thickness: 5,
    material: 'copper',
    configuration: 'single', // single, parallel_2, parallel_3
    temperature: 30,
    mounting: 'vertical' // vertical, horizontal
  });
  
  const [result, setResult] = useState(null);

  // Factores de capacidad para barras colectoras (A/mm²)
  const capacityFactors = {
    copper: {
      single: { vertical: 2.5, horizontal: 2.2 },
      parallel_2: { vertical: 2.0, horizontal: 1.8 },
      parallel_3: { vertical: 1.8, horizontal: 1.6 }
    },
    aluminum: {
      single: { vertical: 1.9, horizontal: 1.7 },
      parallel_2: { vertical: 1.5, horizontal: 1.4 },
      parallel_3: { vertical: 1.4, horizontal: 1.2 }
    }
  };

  // Factores de corrección por temperatura
  const temperatureFactors = {
    25: 1.08, 30: 1.00, 35: 0.94, 40: 0.87, 45: 0.79,
    50: 0.71, 55: 0.61, 60: 0.50
  };

  const calculate = () => {
    const { width, thickness, material, configuration, temperature, mounting } = inputs;
    
    const crossSectionalArea = width * thickness;
    const baseFactor = capacityFactors[material][configuration][mounting];
    const tempFactor = temperatureFactors[temperature] || 1;
    
    const baseCapacity = crossSectionalArea * baseFactor;
    const correctedCapacity = baseCapacity * tempFactor;
    
    // Número de barras
    const numberOfBars = configuration === 'single' ? 1 : 
                        configuration === 'parallel_2' ? 2 : 3;
    
    const totalCapacity = correctedCapacity * numberOfBars;
    
    // Cálculo de impedancia de la barra colectora
    // Resistencia DC aproximada para barras rectangulares
    const resistivity = material === 'copper' ? 0.017241 : 0.028264; // Ω·mm²/m
    const resistance = resistivity / crossSectionalArea; // Ω/m
    
    // Para barras colectoras, la reactancia es muy baja
    const reactance = 0.00005; // Ω/m (valor típico muy bajo para barras)
    const impedance = Math.sqrt(resistance * resistance + reactance * reactance);
    
    setResult({
      crossSectionalArea: crossSectionalArea.toFixed(1),
      baseCapacity: baseCapacity.toFixed(0),
      correctedCapacity: correctedCapacity.toFixed(0),
      totalCapacity: totalCapacity.toFixed(0),
      numberOfBars,
      capacityPerBar: correctedCapacity.toFixed(0),
      tempFactor: tempFactor.toFixed(2),
      impedance: impedance.toFixed(6),
      material: material
    });
  };

  const handleInputChange = (field, value) => {
    if (field === 'material' || field === 'configuration' || field === 'mounting') {
      setInputs(prev => ({ ...prev, [field]: value }));
    } else {
      setInputs(prev => ({ ...prev, [field]: parseFloat(value) || 0 }));
    }
  };

  return (
    <div className="p-6">
      {/* Fórmula */}
      <div className="bg-blue-50 p-4 rounded-lg mb-6 border-l-4 border-blue-500">
        <h3 className="text-lg font-semibold text-blue-900 mb-2">Fórmula</h3>
        <div className="text-blue-800 font-mono space-y-1">
          <div>I<sub>barra</sub> = S × F<sub>material</sub> × F<sub>temp</sub></div>
          <div>I<sub>total</sub> = I<sub>barra</sub> × N<sub>barras</sub></div>
        </div>
        <div className="text-sm text-blue-700 mt-2">
          S = Sección (mm²), F = Factores de capacidad y temperatura, N = Número de barras
        </div>
      </div>

      <h2 className="text-xl font-semibold mb-6">Cálculo de Capacidad de Barras Colectoras</h2>
      
      <div className="grid md:grid-cols-2 gap-6">
        {/* Inputs */}
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Ancho (mm)
              </label>
              <input
                type="number"
                value={inputs.width}
                onChange={(e) => handleInputChange('width', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Espesor (mm)
              </label>
              <input
                type="number"
                value={inputs.thickness}
                onChange={(e) => handleInputChange('thickness', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

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

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Configuración
            </label>
            <select
              value={inputs.configuration}
              onChange={(e) => handleInputChange('configuration', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="single">Barra Simple</option>
              <option value="parallel_2">2 Barras en Paralelo</option>
              <option value="parallel_3">3 Barras en Paralelo</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Montaje
            </label>
            <select
              value={inputs.mounting}
              onChange={(e) => handleInputChange('mounting', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="vertical">Vertical</option>
              <option value="horizontal">Horizontal</option>
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
              {[25, 30, 35, 40, 45, 50, 55, 60].map(temp => (
                <option key={temp} value={temp}>{temp}°C</option>
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
                <div className="text-sm text-gray-600 font-medium">Sección por Barra</div>
                <div className="text-xl font-bold text-gray-900">{result.crossSectionalArea} mm²</div>
              </div>

              <div className="bg-yellow-50 p-4 rounded-lg">
                <div className="text-sm text-yellow-600 font-medium">Factor Temperatura</div>
                <div className="text-xl font-bold text-yellow-900">{result.tempFactor}</div>
              </div>

              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="text-sm text-blue-600 font-medium">Capacidad por Barra</div>
                <div className="text-2xl font-bold text-blue-900">{result.capacityPerBar} A</div>
              </div>

              <div className="bg-green-50 p-4 rounded-lg border-2 border-green-200">
                <div className="text-sm text-green-600 font-medium">Capacidad Total</div>
                <div className="text-3xl font-bold text-green-900">{result.totalCapacity} A</div>
                <div className="text-sm text-green-600 mt-1">
                  {result.numberOfBars} barra{result.numberOfBars > 1 ? 's' : ''} en {inputs.configuration === 'single' ? 'configuración simple' : 'paralelo'}
                </div>
              </div>

              <div className="bg-orange-50 p-4 rounded-lg">
                <div className="text-sm text-orange-700 font-medium">Información</div>
                <div className="text-xs text-orange-600 mt-1">
                  Basado en normas IEC para barras colectoras desnudas en aire libre
                </div>
              </div>

              <div className="bg-cyan-50 p-4 rounded-lg">
                <div className="text-sm text-cyan-700 font-medium">Información del sistema</div>
                <div className="text-xs text-cyan-600 space-y-1 mt-1">
                  <div>• Material: {result.material === 'copper' ? 'Cobre' : 'Aluminio'}</div>
                  <div>• Sección: {result.crossSectionalArea} mm²</div>
                  <div>• Impedancia de la barra: {result.impedance} Ω/m</div>
                </div>
              </div>

              <div className="bg-purple-50 p-4 rounded-lg">
                <div className="text-sm text-purple-700 font-medium">Recomendación</div>
                <div className="text-xs text-purple-600 mt-1">
                  Considerar separación mínima de {inputs.thickness * 2} mm entre barras para refrigeración adecuada
                </div>
              </div>
            </>
          ) : (
            <div className="text-center py-12 text-gray-500">
              Ingresa las dimensiones y haz clic en "Calcular Capacidad"
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BusbarCapacityCalc;