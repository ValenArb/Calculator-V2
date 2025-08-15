import { useState } from 'react';

const PowerFactorCalc = () => {
  const [inputs, setInputs] = useState({
    activePower: 1000,
    apparentPower: 1200,
    calculationMethod: 'powers' // 'powers', 'vi_phase', 'tan_phi'
  });
  
  const [result, setResult] = useState(null);

  const calculate = () => {
    const { activePower, apparentPower, calculationMethod } = inputs;
    
    let cosPhi = 0;
    let tanPhi = 0;
    let reactivePower = 0;
    let phaseAngle = 0;
    
    if (calculationMethod === 'powers') {
      cosPhi = activePower / apparentPower;
      reactivePower = Math.sqrt(Math.pow(apparentPower, 2) - Math.pow(activePower, 2));
      tanPhi = reactivePower / activePower;
      phaseAngle = Math.acos(cosPhi) * (180 / Math.PI);
    } else if (calculationMethod === 'tan_phi') {
      tanPhi = inputs.tanPhi || 0;
      cosPhi = 1 / Math.sqrt(1 + Math.pow(tanPhi, 2));
      phaseAngle = Math.atan(tanPhi) * (180 / Math.PI);
      reactivePower = activePower * tanPhi;
      const newApparentPower = activePower / cosPhi;
      setInputs(prev => ({ ...prev, apparentPower: newApparentPower }));
    }
    
    setResult({
      cosPhi: cosPhi.toFixed(3),
      tanPhi: tanPhi.toFixed(3),
      phaseAngle: phaseAngle.toFixed(1),
      reactivePower: reactivePower.toFixed(0),
      powerType: cosPhi >= 0.9 ? 'Excelente' : cosPhi >= 0.8 ? 'Bueno' : 'Mejorar'
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
          <div>cos φ = P / S</div>
          <div>tan φ = Q / P</div>
          <div>φ = arccos(cos φ)</div>
        </div>
        <div className="text-sm text-blue-700 mt-2">
          P = Potencia activa (W), S = Potencia aparente (VA), Q = Potencia reactiva (VAR), φ = Ángulo de fase
        </div>
      </div>

      <h2 className="text-xl font-semibold mb-6">Cálculo de Factor de Potencia (cos φ)</h2>
      
      <div className="grid md:grid-cols-2 gap-6">
        {/* Inputs */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Método de Cálculo
            </label>
            <div className="space-y-2">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="method"
                  value="powers"
                  checked={inputs.calculationMethod === 'powers'}
                  onChange={(e) => handleInputChange('calculationMethod', e.target.value)}
                  className="mr-2"
                />
                <span>• A partir de potencias (P y S)</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="method"
                  value="tan_phi"
                  checked={inputs.calculationMethod === 'tan_phi'}
                  onChange={(e) => handleInputChange('calculationMethod', e.target.value)}
                  className="mr-2"
                />
                <span>• A partir de tan φ</span>
              </label>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Potencia Activa (W)
            </label>
            <input
              type="number"
              value={inputs.activePower}
              onChange={(e) => handleInputChange('activePower', parseFloat(e.target.value) || 0)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {inputs.calculationMethod === 'powers' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Potencia Aparente (VA)
              </label>
              <input
                type="number"
                value={inputs.apparentPower}
                onChange={(e) => handleInputChange('apparentPower', parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          )}

          {inputs.calculationMethod === 'tan_phi' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                tan φ
              </label>
              <input
                type="number"
                step="0.01"
                value={inputs.tanPhi || ''}
                onChange={(e) => handleInputChange('tanPhi', parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          )}

          <button
            onClick={calculate}
            className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
          >
            Calcular cos φ
          </button>
        </div>

        {/* Results */}
        <div className="space-y-4">
          {result ? (
            <>
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="text-sm text-blue-600 font-medium">cos φ (Factor de Potencia)</div>
                <div className="text-3xl font-bold text-blue-900">{result.cosPhi}</div>
              </div>

              <div className="bg-yellow-50 p-4 rounded-lg">
                <div className="text-sm text-yellow-600 font-medium">tan φ</div>
                <div className="text-2xl font-bold text-yellow-900">{result.tanPhi}</div>
              </div>

              <div className="bg-purple-50 p-4 rounded-lg">
                <div className="text-sm text-purple-600 font-medium">Ángulo de Fase (φ)</div>
                <div className="text-2xl font-bold text-purple-900">{result.phaseAngle}°</div>
              </div>

              <div className="bg-orange-50 p-4 rounded-lg">
                <div className="text-sm text-orange-600 font-medium">Potencia Reactiva</div>
                <div className="text-2xl font-bold text-orange-900">{result.reactivePower} VAR</div>
              </div>

              <div className={`p-4 rounded-lg ${
                result.powerType === 'Excelente' ? 'bg-green-100' : 
                result.powerType === 'Bueno' ? 'bg-yellow-100' : 'bg-red-100'
              }`}>
                <div className={`text-sm font-medium ${
                  result.powerType === 'Excelente' ? 'text-green-700' : 
                  result.powerType === 'Bueno' ? 'text-yellow-700' : 'text-red-700'
                }`}>
                  Evaluación: {result.powerType}
                </div>
                <div className={`text-xs mt-1 ${
                  result.powerType === 'Excelente' ? 'text-green-600' : 
                  result.powerType === 'Bueno' ? 'text-yellow-600' : 'text-red-600'
                }`}>
                  {result.powerType === 'Excelente' ? 'cos φ ≥ 0.9 - Excelente factor de potencia' :
                   result.powerType === 'Bueno' ? '0.8 ≤ cos φ < 0.9 - Factor de potencia aceptable' :
                   'cos φ < 0.8 - Se recomienda corrección del factor de potencia'}
                </div>
              </div>
            </>
          ) : (
            <div className="text-center py-12 text-gray-500">
              Ingresa los valores y haz clic en "Calcular cos φ"
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PowerFactorCalc;