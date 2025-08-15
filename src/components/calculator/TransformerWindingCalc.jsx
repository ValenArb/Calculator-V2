import { useState } from 'react';

const TransformerWindingCalc = () => {
  const [inputs, setInputs] = useState({
    primaryVoltage: 13800,
    secondaryVoltage: 400,
    power: 1000,
    frequency: 50,
    coreArea: 150,
    fluxDensity: 1.5,
    calculationType: 'turns' // turns, current, wire
  });
  
  const [result, setResult] = useState(null);

  const calculate = () => {
    const { primaryVoltage, secondaryVoltage, power, frequency, coreArea, fluxDensity } = inputs;
    
    // Fórmula básica: N = V / (4.44 × f × B × A)
    // N = número de espiras
    // V = tensión (V)
    // f = frecuencia (Hz)
    // B = densidad de flujo (T)
    // A = área del núcleo (cm²)
    
    const turnsPerVolt = 1 / (4.44 * frequency * fluxDensity * (coreArea / 10000)); // Conversión cm² a m²
    const primaryTurns = Math.round(primaryVoltage * turnsPerVolt);
    const secondaryTurns = Math.round(secondaryVoltage * turnsPerVolt);
    
    // Relación de transformación
    const turnsRatio = primaryTurns / secondaryTurns;
    const voltageRatio = primaryVoltage / secondaryVoltage;
    
    // Corrientes
    const primaryCurrent = (power * 1000) / (Math.sqrt(3) * primaryVoltage); // Trifásico
    const secondaryCurrent = (power * 1000) / (Math.sqrt(3) * secondaryVoltage);
    
    // Corrientes por fase (monofásico)
    const primaryCurrentMono = (power * 1000) / primaryVoltage;
    const secondaryCurrentMono = (power * 1000) / secondaryVoltage;
    
    setResult({
      primaryTurns: primaryTurns.toFixed(0),
      secondaryTurns: secondaryTurns.toFixed(0),
      turnsRatio: turnsRatio.toFixed(2),
      voltageRatio: voltageRatio.toFixed(2),
      primaryCurrent: primaryCurrent.toFixed(2),
      secondaryCurrent: secondaryCurrent.toFixed(2),
      primaryCurrentMono: primaryCurrentMono.toFixed(2),
      secondaryCurrentMono: secondaryCurrentMono.toFixed(2),
      turnsPerVolt: turnsPerVolt.toFixed(4)
    });
  };

  const handleInputChange = (field, value) => {
    setInputs(prev => ({ ...prev, [field]: parseFloat(value) || 0 }));
  };

  return (
    <div className="p-6">
      {/* Fórmula */}
      <div className="bg-blue-50 p-4 rounded-lg mb-6 border-l-4 border-blue-500">
        <h3 className="text-lg font-semibold text-blue-900 mb-2">Fórmulas</h3>
        <div className="text-blue-800 font-mono space-y-1">
          <div>N = V / (4.44 × f × B × A)</div>
          <div>N₁/N₂ = V₁/V₂ = I₂/I₁</div>
          <div>I = P / (√3 × V) (trifásico)</div>
        </div>
        <div className="text-sm text-blue-700 mt-2">
          N = Espiras, V = Tensión, f = Frecuencia, B = Densidad flujo, A = Área núcleo
        </div>
      </div>

      <h2 className="text-xl font-semibold mb-6">Cálculo de Devanados de Transformador</h2>
      
      <div className="grid md:grid-cols-2 gap-6">
        {/* Inputs */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tensión Primaria (V)
            </label>
            <input
              type="number"
              value={inputs.primaryVoltage}
              onChange={(e) => handleInputChange('primaryVoltage', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tensión Secundaria (V)
            </label>
            <input
              type="number"
              value={inputs.secondaryVoltage}
              onChange={(e) => handleInputChange('secondaryVoltage', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Potencia (kVA)
            </label>
            <input
              type="number"
              value={inputs.power}
              onChange={(e) => handleInputChange('power', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Frecuencia (Hz)
            </label>
            <select
              value={inputs.frequency}
              onChange={(e) => handleInputChange('frequency', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="50">50 Hz</option>
              <option value="60">60 Hz</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Área del Núcleo (cm²)
            </label>
            <input
              type="number"
              value={inputs.coreArea}
              onChange={(e) => handleInputChange('coreArea', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Densidad de Flujo (T)
            </label>
            <input
              type="number"
              step="0.1"
              value={inputs.fluxDensity}
              onChange={(e) => handleInputChange('fluxDensity', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <button
            onClick={calculate}
            className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
          >
            Calcular Devanados
          </button>
        </div>

        {/* Results */}
        <div className="space-y-4">
          {result ? (
            <>
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="text-sm text-blue-600 font-medium">Espiras Primario</div>
                <div className="text-2xl font-bold text-blue-900">{result.primaryTurns}</div>
              </div>

              <div className="bg-green-50 p-4 rounded-lg">
                <div className="text-sm text-green-600 font-medium">Espiras Secundario</div>
                <div className="text-2xl font-bold text-green-900">{result.secondaryTurns}</div>
              </div>

              <div className="bg-yellow-50 p-4 rounded-lg">
                <div className="text-sm text-yellow-600 font-medium">Relación de Transformación</div>
                <div className="text-xl font-bold text-yellow-900">{result.turnsRatio}:1</div>
              </div>

              <div className="bg-purple-50 p-4 rounded-lg">
                <div className="text-sm text-purple-600 font-medium">Espiras por Voltio</div>
                <div className="text-xl font-bold text-purple-900">{result.turnsPerVolt}</div>
              </div>

              <div className="bg-orange-50 p-4 rounded-lg">
                <div className="text-sm text-orange-600 font-medium mb-2">Corrientes (Trifásico)</div>
                <div className="space-y-1 text-sm">
                  <div>Primaria: <span className="font-bold">{result.primaryCurrent} A</span></div>
                  <div>Secundaria: <span className="font-bold">{result.secondaryCurrent} A</span></div>
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="text-sm text-gray-600 font-medium mb-2">Corrientes (Monofásico)</div>
                <div className="space-y-1 text-sm">
                  <div>Primaria: <span className="font-bold">{result.primaryCurrentMono} A</span></div>
                  <div>Secundaria: <span className="font-bold">{result.secondaryCurrentMono} A</span></div>
                </div>
              </div>

              <div className="bg-indigo-50 p-4 rounded-lg">
                <div className="text-sm text-indigo-700 font-medium">Información</div>
                <div className="text-xs text-indigo-600 mt-1">
                  Densidad de flujo típica: 1.0-1.7 T. Valores mayores aumentan pérdidas en el núcleo.
                </div>
              </div>
            </>
          ) : (
            <div className="text-center py-12 text-gray-500">
              Ingresa los parámetros del transformador y haz clic en "Calcular"
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TransformerWindingCalc;
