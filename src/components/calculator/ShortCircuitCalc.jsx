import { useState } from 'react';

const ShortCircuitCalc = () => {
  const [inputs, setInputs] = useState({
    voltage: 400, // Tensión del sistema (V)
    transformerPower: 1000, // Potencia del transformador (kVA)
    transformerVoltage: 400, // Tensión del transformador (V)
    impedancePercentage: 4, // Impedancia del transformador (%)
    cableLength: 50, // Longitud del cable (m)
    cableSize: 10, // Sección del cable (mm²)
    calculationMethod: 'transformer' // 'transformer', 'impedance'
  });
  
  const [result, setResult] = useState(null);

  // Resistividad del cobre (Ω·mm²/m)
  const copperResistivity = 0.017241;

  const calculate = () => {
    const { voltage, transformerPower, impedancePercentage, cableLength, cableSize, calculationMethod } = inputs;
    
    let shortCircuitCurrent = 0;
    let impedanceTotal = 0;
    let transformerImpedance = 0;
    let cableImpedance = 0;
    
    if (calculationMethod === 'transformer') {
      // Impedancia del transformador (Ω)
      const transformerCurrentRated = (transformerPower * 1000) / (Math.sqrt(3) * voltage);
      transformerImpedance = (voltage * impedancePercentage) / (100 * transformerCurrentRated);
      
      // Impedancia del cable (Ω) - considerando solo la resistencia
      cableImpedance = (2 * copperResistivity * cableLength) / cableSize; // Factor 2 para ida y vuelta
      
      // Impedancia total
      impedanceTotal = transformerImpedance + cableImpedance;
      
      // Corriente de cortocircuito trifásica
      shortCircuitCurrent = voltage / (Math.sqrt(3) * impedanceTotal);
    }
    
    setResult({
      shortCircuitCurrent: shortCircuitCurrent.toFixed(0),
      transformerImpedance: transformerImpedance.toFixed(4),
      cableImpedance: cableImpedance.toFixed(4),
      totalImpedance: impedanceTotal.toFixed(4),
      powerRating: shortCircuitCurrent > 25000 ? 'Alta' : shortCircuitCurrent > 10000 ? 'Media' : 'Baja'
    });
  };

  const handleInputChange = (field, value) => {
    setInputs(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="p-6">
      {/* Fórmula */}
      <div className="bg-blue-50 p-4 rounded-lg mb-6 border-l-4 border-blue-500">
        <h3 className="text-lg font-semibold text-blue-900 mb-2">Fórmulas</h3>
        <div className="text-blue-800 font-mono space-y-1">
          <div>I<sub>cc</sub> = U / (√3 × Z<sub>total</sub>)</div>
          <div>Z<sub>tr</sub> = (U × ε<sub>cc</sub>%) / (100 × I<sub>n</sub>)</div>
          <div>Z<sub>cable</sub> = 2 × ρ × L / S</div>
        </div>
        <div className="text-sm text-blue-700 mt-2">
          I<sub>cc</sub> = Corriente cortocircuito, U = Tensión, Z = Impedancia, ρ = Resistividad, L = Longitud, S = Sección
        </div>
      </div>

      <h2 className="text-xl font-semibold mb-6">Cálculo de Corriente de Cortocircuito</h2>
      
      <div className="grid md:grid-cols-2 gap-6">
        {/* Inputs */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tensión del Sistema (V)
            </label>
            <select
              value={inputs.voltage}
              onChange={(e) => handleInputChange('voltage', parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value={220}>220 V (monofásico)</option>
              <option value={380}>380 V (trifásico)</option>
              <option value={400}>400 V (trifásico)</option>
              <option value={480}>480 V (trifásico)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Potencia del Transformador (kVA)
            </label>
            <select
              value={inputs.transformerPower}
              onChange={(e) => handleInputChange('transformerPower', parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value={100}>100 kVA</option>
              <option value={160}>160 kVA</option>
              <option value={250}>250 kVA</option>
              <option value={400}>400 kVA</option>
              <option value={630}>630 kVA</option>
              <option value={1000}>1000 kVA</option>
              <option value={1600}>1600 kVA</option>
              <option value={2500}>2500 kVA</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Impedancia del Transformador (%)
            </label>
            <input
              type="number"
              step="0.1"
              value={inputs.impedancePercentage}
              onChange={(e) => handleInputChange('impedancePercentage', parseFloat(e.target.value) || 0)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Longitud del Cable (m)
            </label>
            <input
              type="number"
              value={inputs.cableLength}
              onChange={(e) => handleInputChange('cableLength', parseFloat(e.target.value) || 0)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Sección del Cable (mm²)
            </label>
            <select
              value={inputs.cableSize}
              onChange={(e) => handleInputChange('cableSize', parseFloat(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {[1.5, 2.5, 4, 6, 10, 16, 25, 35, 50, 70, 95, 120, 150, 185, 240].map(size => (
                <option key={size} value={size}>{size} mm²</option>
              ))}
            </select>
          </div>

          <button
            onClick={calculate}
            className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
          >
            Calcular Corriente de Cortocircuito
          </button>
        </div>

        {/* Results */}
        <div className="space-y-4">
          {result ? (
            <>
              <div className="bg-red-50 p-4 rounded-lg border-2 border-red-200">
                <div className="text-sm text-red-600 font-medium">Corriente de Cortocircuito</div>
                <div className="text-3xl font-bold text-red-900">{result.shortCircuitCurrent} A</div>
              </div>

              <div className="bg-yellow-50 p-4 rounded-lg">
                <div className="text-sm text-yellow-600 font-medium">Impedancia Transformador</div>
                <div className="text-xl font-bold text-yellow-900">{result.transformerImpedance} Ω</div>
              </div>

              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="text-sm text-blue-600 font-medium">Impedancia Cable</div>
                <div className="text-xl font-bold text-blue-900">{result.cableImpedance} Ω</div>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="text-sm text-gray-600 font-medium">Impedancia Total</div>
                <div className="text-xl font-bold text-gray-900">{result.totalImpedance} Ω</div>
              </div>

              <div className={`p-4 rounded-lg ${
                result.powerRating === 'Alta' ? 'bg-red-100' : 
                result.powerRating === 'Media' ? 'bg-yellow-100' : 'bg-green-100'
              }`}>
                <div className={`text-sm font-medium ${
                  result.powerRating === 'Alta' ? 'text-red-700' : 
                  result.powerRating === 'Media' ? 'text-yellow-700' : 'text-green-700'
                }`}>
                  Clasificación: Potencia de cortocircuito {result.powerRating}
                </div>
                <div className={`text-xs mt-1 ${
                  result.powerRating === 'Alta' ? 'text-red-600' : 
                  result.powerRating === 'Media' ? 'text-yellow-600' : 'text-green-600'
                }`}>
                  {result.powerRating === 'Alta' ? 'I > 25 kA - Requiere protecciones especiales' :
                   result.powerRating === 'Media' ? '10 kA < I ≤ 25 kA - Protecciones estándar' :
                   'I ≤ 10 kA - Aplicación estándar'}
                </div>
              </div>

              <div className="bg-orange-50 p-4 rounded-lg">
                <div className="text-sm text-orange-700 font-medium">⚠️ Recomendación</div>
                <div className="text-xs text-orange-600 mt-1">
                  Verificar que los dispositivos de protección tengan poder de corte superior a {result.shortCircuitCurrent} A
                </div>
              </div>
            </>
          ) : (
            <div className="text-center py-12 text-gray-500">
              Ingresa los parámetros del sistema y haz clic en "Calcular"
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ShortCircuitCalc;