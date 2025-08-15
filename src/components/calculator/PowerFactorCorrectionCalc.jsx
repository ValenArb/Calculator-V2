import { useState } from 'react';

const PowerFactorCorrectionCalc = () => {
  const [inputs, setInputs] = useState({
    activePower: 100,
    currentPowerFactor: 0.7,
    targetPowerFactor: 0.95,
    voltage: 380,
    frequency: 50
  });
  
  const [result, setResult] = useState(null);

  const calculate = () => {
    const { activePower, currentPowerFactor, targetPowerFactor, voltage, frequency } = inputs;
    
    // Calculate current reactive power
    const currentReactivePower = activePower * Math.tan(Math.acos(currentPowerFactor));
    
    // Calculate target reactive power
    const targetReactivePower = activePower * Math.tan(Math.acos(targetPowerFactor));
    
    // Calculate required capacitive reactive power
    const requiredQc = currentReactivePower - targetReactivePower;
    
    // Calculate capacitor capacity in microfarads
    const capacitorCapacity = (requiredQc * 1000000) / (2 * Math.PI * frequency * Math.pow(voltage, 2));
    
    // Calculate current and target apparent power
    const currentApparentPower = activePower / currentPowerFactor;
    const targetApparentPower = activePower / targetPowerFactor;
    
    // Calculate savings
    const powerSaving = currentApparentPower - targetApparentPower;
    const percentageSaving = ((powerSaving / currentApparentPower) * 100);
    
    setResult({
      requiredQc: requiredQc.toFixed(2),
      capacitorCapacity: Math.abs(capacitorCapacity).toFixed(2),
      currentApparentPower: currentApparentPower.toFixed(2),
      targetApparentPower: targetApparentPower.toFixed(2),
      powerSaving: powerSaving.toFixed(2),
      percentageSaving: percentageSaving.toFixed(2),
      currentReactivePower: currentReactivePower.toFixed(2),
      targetReactivePower: targetReactivePower.toFixed(2)
    });
  };

  const handleInputChange = (field, value) => {
    setInputs(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="p-6">
      <h2 className="text-xl font-semibold mb-6">Corrección del Factor de Potencia</h2>
      
      <div className="grid md:grid-cols-2 gap-6">
        {/* Inputs */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Potencia Activa (kW)
            </label>
            <input
              type="number"
              value={inputs.activePower}
              onChange={(e) => handleInputChange('activePower', parseFloat(e.target.value) || 0)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Factor de Potencia Actual
            </label>
            <input
              type="number"
              step="0.01"
              min="0.1"
              max="1"
              value={inputs.currentPowerFactor}
              onChange={(e) => handleInputChange('currentPowerFactor', parseFloat(e.target.value) || 0)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Factor de Potencia Objetivo
            </label>
            <input
              type="number"
              step="0.01"
              min="0.1"
              max="1"
              value={inputs.targetPowerFactor}
              onChange={(e) => handleInputChange('targetPowerFactor', parseFloat(e.target.value) || 0)}
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
              Frecuencia (Hz)
            </label>
            <input
              type="number"
              value={inputs.frequency}
              onChange={(e) => handleInputChange('frequency', parseFloat(e.target.value) || 0)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
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
                <div className="text-sm text-blue-600 font-medium">Capacidad del Condensador</div>
                <div className="text-2xl font-bold text-blue-900">{result.capacitorCapacity} μF</div>
              </div>

              <div className="bg-green-50 p-4 rounded-lg">
                <div className="text-sm text-green-600 font-medium">Potencia Reactiva Necesaria</div>
                <div className="text-2xl font-bold text-green-900">{result.requiredQc} kVAR</div>
              </div>

              <div className="bg-purple-50 p-4 rounded-lg">
                <div className="text-sm text-purple-600 font-medium">Ahorro de Potencia Aparente</div>
                <div className="text-2xl font-bold text-purple-900">{result.powerSaving} kVA</div>
                <div className="text-sm text-purple-600">({result.percentageSaving}% menos)</div>
              </div>

              <div className="bg-gray-50 p-3 rounded-lg text-sm">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <span className="font-medium">S actual:</span> {result.currentApparentPower} kVA
                  </div>
                  <div>
                    <span className="font-medium">S objetivo:</span> {result.targetApparentPower} kVA
                  </div>
                  <div>
                    <span className="font-medium">Q actual:</span> {result.currentReactivePower} kVAR
                  </div>
                  <div>
                    <span className="font-medium">Q objetivo:</span> {result.targetReactivePower} kVAR
                  </div>
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
          <div><strong>Potencia Reactiva Actual:</strong> Q₁ = P × tan(arccos(cos φ₁))</div>
          <div><strong>Potencia Reactiva Objetivo:</strong> Q₂ = P × tan(arccos(cos φ₂))</div>
          <div><strong>Potencia Reactiva del Condensador:</strong> Qc = Q₁ - Q₂</div>
          <div><strong>Capacidad del Condensador:</strong> C = Qc × 10⁶ / (2π × f × V²) [μF]</div>
          <div><strong>Potencia Aparente:</strong> S = P / cos φ</div>
        </div>
      </div>
    </div>
  );
};

export default PowerFactorCorrectionCalc;
