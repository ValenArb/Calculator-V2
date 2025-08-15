import { useState } from 'react';

const CableSizeCalc = () => {
  const [inputs, setInputs] = useState({
    current: 25,
    length: 50,
    voltage: 220,
    maxVoltageDrop: 4,
    material: 'copper'
  });
  
  const [result, setResult] = useState(null);

  // Resistencias reales de cables de cobre unipolares (Ohm/km) @ 70°C
  // Basado en tabla de resistencias-cables.md
  const cableResistances = {
    copper: {
      1.0: 19.5,
      1.5: 13.3,
      2.5: 7.98,
      4: 5.92,
      6: 3.95,
      10: 2.29,
      16: 1.45,
      25: 0.933,
      35: 0.663,
      50: 0.462,
      70: 0.326,
      95: 0.248,
      120: 0.194,
      150: 0.156,
      185: 0.129,
      240: 0.0987,
      300: 0.0754,
      400: 0.0606,
      500: 0.0493,
      630: 0.0407
    },
    aluminum: {
      // Valores aproximados para aluminio (30% más resistivo que cobre)
      1.0: 25.35,
      1.5: 17.29,
      2.5: 10.374,
      4: 7.696,
      6: 5.135,
      10: 2.977,
      16: 1.885,
      25: 1.213,
      35: 0.862,
      50: 0.601,
      70: 0.424,
      95: 0.322,
      120: 0.252,
      150: 0.203,
      185: 0.168,
      240: 0.128,
      300: 0.098,
      400: 0.079,
      500: 0.064,
      630: 0.053
    }
  };

  // Calibres estándar
  const standardSizes = [1.0, 1.5, 2.5, 4, 6, 10, 16, 25, 35, 50, 70, 95, 120, 150, 185, 240, 300, 400, 500];

  const calculate = () => {
    const { current, length, voltage, maxVoltageDrop, material } = inputs;
    
    // Caída de tensión máxima permitida en voltios
    const maxVoltageDropV = (maxVoltageDrop / 100) * voltage;
    
    // Usar resistencias reales de la tabla para encontrar la sección mínima
    // Probar cada sección hasta encontrar una que cumpla
    let recommendedSize = null;
    let actualVoltageDrop = 0;
    let actualPercentage = 0;
    let resistancePerKm = 0;
    
    for (const size of standardSizes) {
      // Obtener resistencia real de la tabla (Ohm/km) @ 70°C
      const resistance_per_km = cableResistances[material][size];
      if (!resistance_per_km) continue;
      
      // Convertir a Ohm/m
      const resistance_per_m = resistance_per_km / 1000;
      
      // Calcular caída de tensión real con esta sección
      const voltageDrop = 2 * resistance_per_m * length * current;
      const percentage = (voltageDrop / voltage) * 100;
      
      if (percentage <= maxVoltageDrop) {
        recommendedSize = size;
        actualVoltageDrop = voltageDrop;
        actualPercentage = percentage;
        resistancePerKm = resistance_per_km;
        break;
      }
    }
    
    // Si no se encuentra ninguna sección que cumpla, usar la mayor disponible
    if (!recommendedSize) {
      recommendedSize = standardSizes[standardSizes.length - 1];
      resistancePerKm = cableResistances[material][recommendedSize];
      const resistance_per_m = resistancePerKm / 1000;
      actualVoltageDrop = 2 * resistance_per_m * length * current;
      actualPercentage = (actualVoltageDrop / voltage) * 100;
    }
    
    // Calcular sección mínima teórica usando resistividad estándar (para comparación)
    const rho = material === 'copper' ? 0.017241 : 0.028264;
    const minSectionTheoretical = (2 * rho * length * current) / maxVoltageDropV;
    
    // Cálculo de impedancia del conductor usando resistencia real
    const tempCoeff = material === 'copper' ? 0.00393 : 0.00403;
    const avgTemp = 40; // Temperatura promedio de operación
    const tempFactor = 1 + tempCoeff * (avgTemp - 70); // Ajustar desde 70°C
    const adjustedResistancePerKm = resistancePerKm * tempFactor;
    const resistance = adjustedResistancePerKm / 1000; // Ω/m
    const reactance = 0.00012; // Ω/m (valor típico para cables)
    const impedance = Math.sqrt(resistance * resistance + reactance * reactance);
    
    setResult({
      minSection: minSectionTheoretical.toFixed(2),
      recommendedSize: recommendedSize,
      actualVoltageDrop: actualVoltageDrop.toFixed(3),
      actualPercentage: actualPercentage.toFixed(2),
      impedance: impedance.toFixed(6),
      resistancePerKm: adjustedResistancePerKm.toFixed(4),
      material: material
    });
  };

  const handleInputChange = (field, value) => {
    setInputs(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="p-6">
      <h2 className="text-xl font-semibold mb-6">Cálculo de Calibre de Cable</h2>
      
      <div className="grid md:grid-cols-2 gap-6">
        {/* Inputs */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Corriente (A)
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
              Longitud (m)
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
              Tensión (V)
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
              Caída máxima permitida (%)
            </label>
            <input
              type="number"
              value={inputs.maxVoltageDrop}
              onChange={(e) => handleInputChange('maxVoltageDrop', parseFloat(e.target.value) || 0)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
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
                <div className="text-sm text-blue-600 font-medium">Sección Mínima Teórica</div>
                <div className="text-2xl font-bold text-blue-900">{result.minSection} mm²</div>
              </div>

              <div className="bg-green-50 p-4 rounded-lg">
                <div className="text-sm text-green-600 font-medium">Calibre Recomendado</div>
                <div className="text-2xl font-bold text-green-900">{result.recommendedSize} mm²</div>
              </div>

              <div className="bg-purple-50 p-4 rounded-lg">
                <div className="text-sm text-purple-600 font-medium">Caída Real</div>
                <div className="text-xl font-bold text-purple-900">{result.actualVoltageDrop} V</div>
                <div className="text-sm text-purple-600">({result.actualPercentage}%)</div>
              </div>

              <div className={`p-4 rounded-lg ${
                parseFloat(result.actualPercentage) <= inputs.maxVoltageDrop ? 'bg-green-100' : 'bg-red-100'
              }`}>
                <div className={`text-sm font-medium ${
                  parseFloat(result.actualPercentage) <= inputs.maxVoltageDrop ? 'text-green-700' : 'text-red-700'
                }`}>
                  Estado: {parseFloat(result.actualPercentage) <= inputs.maxVoltageDrop ? 'CUMPLE' : 'NO CUMPLE'}
                </div>
              </div>

              <div className="bg-cyan-50 p-4 rounded-lg">
                <div className="text-sm text-cyan-700 font-medium">Información del sistema</div>
                <div className="text-xs text-cyan-600 space-y-1 mt-1">
                  <div>• Material: {result.material === 'copper' ? 'Cobre' : 'Aluminio'}</div>
                  <div>• Sección recomendada: {result.recommendedSize} mm²</div>
                  <div>• Resistencia por km: {result.resistancePerKm} Ω/km @ 40°C</div>
                  <div>• Impedancia del conductor: {result.impedance} Ω/m</div>
                  <div>• Basado en resistencias reales de cables comerciales</div>
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
      <div className="mt-8 bg-gray-50 p-4 rounded-lg">
        <h3 className="text-sm font-medium text-gray-900 mb-2">Fórmula utilizada:</h3>
        <div className="text-xs text-gray-600 space-y-1">
          <div><strong>Sección mínima:</strong> S = 2 × ρ × L × I / ΔV_max</div>
          <div><strong>Donde:</strong></div>
          <div className="ml-4">• S = Sección del conductor (mm²)</div>
          <div className="ml-4">• ρ = Resistividad del material (Ω·mm²/m)</div>
          <div className="ml-4">• L = Longitud del cable (m)</div>
          <div className="ml-4">• I = Corriente (A)</div>
          <div className="ml-4">• ΔV_max = Caída máxima permitida (V)</div>
        </div>
      </div>
    </div>
  );
};

export default CableSizeCalc;