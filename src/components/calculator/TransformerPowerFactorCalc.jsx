import { useState } from 'react';

const TransformerPowerFactorCalc = () => {
  const [inputs, setInputs] = useState({
    ratedPower: 1000,
    primaryVoltage: 380,
    secondaryVoltage: 220,
    loadPowerFactor: 0.8,
    loadPower: 800,
    noLoadLoss: 5,
    fullLoadLoss: 15,
    excitingCurrent: 2
  });
  
  const [result, setResult] = useState(null);

  const calculate = () => {
    const { 
      ratedPower, 
      primaryVoltage, 
      secondaryVoltage, 
      loadPowerFactor, 
      loadPower,
      noLoadLoss,
      fullLoadLoss,
      excitingCurrent
    } = inputs;
    
    // Load factor (percentage of full load)
    const loadFactor = loadPower / ratedPower;
    
    // Calculate losses at current load
    const ironLoss = noLoadLoss; // Constant iron losses
    const copperLoss = fullLoadLoss * Math.pow(loadFactor, 2); // Copper losses vary with load squared
    const totalLoss = ironLoss + copperLoss;
    
    // Output power (load power)
    const outputPower = loadPower * loadPowerFactor;
    
    // Input power
    const inputPower = outputPower + totalLoss;
    
    // Efficiency
    const efficiency = (outputPower / inputPower) * 100;
    
    // Primary current calculation
    const primaryCurrent = inputPower / (Math.sqrt(3) * primaryVoltage * loadPowerFactor);
    
    // Secondary current calculation
    const secondaryCurrent = outputPower / (Math.sqrt(3) * secondaryVoltage * loadPowerFactor);
    
    // No-load current components
    const magnetizingCurrent = (excitingCurrent / 100) * (ratedPower / (Math.sqrt(3) * primaryVoltage));
    const ironLossCurrent = ironLoss / (Math.sqrt(3) * primaryVoltage);
    
    // Power factor calculation for transformer
    const cosPhiTransformer = inputPower / (Math.sqrt(3) * primaryVoltage * primaryCurrent);
    
    // Regulation calculation (simplified)
    const regulation = ((secondaryVoltage * (1 + (copperLoss / outputPower))) - secondaryVoltage) / secondaryVoltage * 100;
    
    setResult({
      inputPower: inputPower.toFixed(2),
      outputPower: outputPower.toFixed(2),
      totalLoss: totalLoss.toFixed(2),
      ironLoss: ironLoss.toFixed(2),
      copperLoss: copperLoss.toFixed(2),
      efficiency: efficiency.toFixed(2),
      primaryCurrent: primaryCurrent.toFixed(2),
      secondaryCurrent: secondaryCurrent.toFixed(2),
      transformerPowerFactor: cosPhiTransformer.toFixed(3),
      regulation: regulation.toFixed(2),
      magnetizingCurrent: magnetizingCurrent.toFixed(3),
      ironLossCurrent: ironLossCurrent.toFixed(3),
      loadFactor: (loadFactor * 100).toFixed(1)
    });
  };

  const handleInputChange = (field, value) => {
    setInputs(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="p-6">
      <h2 className="text-xl font-semibold mb-6">Factor de Potencia del Transformador</h2>
      
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Inputs */}
        <div className="lg:col-span-2 space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Potencia Nominal (kVA)
              </label>
              <input
                type="number"
                value={inputs.ratedPower}
                onChange={(e) => handleInputChange('ratedPower', parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tensión Primaria (V)
              </label>
              <input
                type="number"
                value={inputs.primaryVoltage}
                onChange={(e) => handleInputChange('primaryVoltage', parseFloat(e.target.value) || 0)}
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
                onChange={(e) => handleInputChange('secondaryVoltage', parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Factor de Potencia de la Carga
              </label>
              <input
                type="number"
                step="0.01"
                min="0.1"
                max="1"
                value={inputs.loadPowerFactor}
                onChange={(e) => handleInputChange('loadPowerFactor', parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Potencia de la Carga (kVA)
              </label>
              <input
                type="number"
                value={inputs.loadPower}
                onChange={(e) => handleInputChange('loadPower', parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Pérdidas en Vacío (kW)
              </label>
              <input
                type="number"
                step="0.1"
                value={inputs.noLoadLoss}
                onChange={(e) => handleInputChange('noLoadLoss', parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Pérdidas a Plena Carga (kW)
              </label>
              <input
                type="number"
                step="0.1"
                value={inputs.fullLoadLoss}
                onChange={(e) => handleInputChange('fullLoadLoss', parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Corriente de Excitación (%)
              </label>
              <input
                type="number"
                step="0.1"
                value={inputs.excitingCurrent}
                onChange={(e) => handleInputChange('excitingCurrent', parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
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
                <div className="text-sm text-blue-600 font-medium">Factor de Potencia del Transformador</div>
                <div className="text-2xl font-bold text-blue-900">{result.transformerPowerFactor}</div>
              </div>

              <div className="bg-green-50 p-4 rounded-lg">
                <div className="text-sm text-green-600 font-medium">Eficiencia</div>
                <div className="text-2xl font-bold text-green-900">{result.efficiency}%</div>
              </div>

              <div className="bg-purple-50 p-4 rounded-lg">
                <div className="text-sm text-purple-600 font-medium">Regulación</div>
                <div className="text-2xl font-bold text-purple-900">{result.regulation}%</div>
              </div>

              <div className="bg-gray-50 p-3 rounded-lg text-sm space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  <div><span className="font-medium">P entrada:</span> {result.inputPower} kW</div>
                  <div><span className="font-medium">P salida:</span> {result.outputPower} kW</div>
                  <div><span className="font-medium">P pérdidas:</span> {result.totalLoss} kW</div>
                  <div><span className="font-medium">Factor carga:</span> {result.loadFactor}%</div>
                </div>
                <div className="border-t pt-2">
                  <div><span className="font-medium">I₁:</span> {result.primaryCurrent} A</div>
                  <div><span className="font-medium">I₂:</span> {result.secondaryCurrent} A</div>
                  <div><span className="font-medium">I₀:</span> {result.magnetizingCurrent} A (magnetizante)</div>
                </div>
                <div className="border-t pt-2">
                  <div><span className="font-medium">P hierro:</span> {result.ironLoss} kW</div>
                  <div><span className="font-medium">P cobre:</span> {result.copperLoss} kW</div>
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
        <h3 className="text-sm font-medium text-gray-900 mb-2">Fórmulas utilizadas:</h3>
        <div className="text-xs text-gray-600 space-y-1">
          <div><strong>Pérdidas de Cobre:</strong> Pcu = Pcu_nominal × (carga%)²</div>
          <div><strong>Pérdidas Totales:</strong> Ptotal = Phierro + Pcobre</div>
          <div><strong>Potencia de Entrada:</strong> P₁ = P₂ + Ppérdidas</div>
          <div><strong>Eficiencia:</strong> η = P₂ / P₁ × 100%</div>
          <div><strong>Corriente Primaria:</strong> I₁ = P₁ / (√3 × V₁ × cos φ)</div>
          <div><strong>Factor de Potencia:</strong> cos φ = P₁ / (√3 × V₁ × I₁)</div>
          <div><strong>Regulación:</strong> Reg = (V₂_vacío - V₂_carga) / V₂_carga × 100%</div>
        </div>
      </div>
    </div>
  );
};

export default TransformerPowerFactorCalc;
