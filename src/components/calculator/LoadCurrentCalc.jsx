import { useState } from 'react';

const LoadCurrentCalc = () => {
  const [inputs, setInputs] = useState({
    power: 10000,
    voltage: 400,
    powerFactor: 0.9,
    systemType: 'three-phase',
    powerUnit: 'W',
    demandFactor: 1.0,
    diversityFactor: 1.0
  });
  
  const [result, setResult] = useState(null);

  const calculate = () => {
    const { power, voltage, powerFactor, systemType, powerUnit, demandFactor, diversityFactor } = inputs;
    
    // Convertir potencia a watts
    const powerConversions = { 'W': 1, 'kW': 1000, 'MW': 1000000 };
    const powerInWatts = power * powerConversions[powerUnit];
    
    let loadCurrent = 0;
    let apparentPower = 0;
    
    // Aplicar factores de demanda y diversidad
    const adjustedPower = powerInWatts * demandFactor * diversityFactor;
    
    if (systemType === 'single-phase') {
      // Monofásico: I = P / (V × cos φ)
      loadCurrent = adjustedPower / (voltage * powerFactor);
      apparentPower = voltage * loadCurrent;
    } else if (systemType === 'three-phase') {
      // Trifásico: I = P / (√3 × V × cos φ)
      loadCurrent = adjustedPower / (Math.sqrt(3) * voltage * powerFactor);
      apparentPower = Math.sqrt(3) * voltage * loadCurrent;
    } else if (systemType === 'dc') {
      // DC: I = P / V
      loadCurrent = adjustedPower / voltage;
      apparentPower = adjustedPower;
    }
    
    // Corriente nominal (sin factores)
    let nominalCurrent = 0;
    if (systemType === 'single-phase') {
      nominalCurrent = powerInWatts / (voltage * powerFactor);
    } else if (systemType === 'three-phase') {
      nominalCurrent = powerInWatts / (Math.sqrt(3) * voltage * powerFactor);
    } else if (systemType === 'dc') {
      nominalCurrent = powerInWatts / voltage;
    }
    
    setResult({
      loadCurrent: loadCurrent.toFixed(2),
      nominalCurrent: nominalCurrent.toFixed(2),
      apparentPower: (apparentPower / 1000).toFixed(2), // En kVA
      reactivePower: systemType !== 'dc' ? 
        (apparentPower * Math.sqrt(1 - Math.pow(powerFactor, 2)) / 1000).toFixed(2) : '0',
      demandLoad: (adjustedPower / 1000).toFixed(2), // En kW
      reduction: ((1 - (demandFactor * diversityFactor)) * 100).toFixed(1)
    });
  };

  const handleInputChange = (field, value) => {
    if (field === 'systemType' || field === 'powerUnit') {
      setInputs(prev => ({ ...prev, [field]: value }));
    } else {
      setInputs(prev => ({ ...prev, [field]: parseFloat(value) || 0 }));
    }
  };

  return (
    <div className="p-6">
      {/* Fórmula */}
      <div className="bg-blue-50 p-4 rounded-lg mb-6 border-l-4 border-blue-500">
        <h3 className="text-lg font-semibold text-blue-900 mb-2">Fórmulas</h3>
        <div className="text-blue-800 font-mono space-y-1">
          <div>I = P / (V × cos φ) (Monofásico)</div>
          <div>I = P / (√3 × V × cos φ) (Trifásico)</div>
          <div>P<sub>demanda</sub> = P × F<sub>d</sub> × F<sub>div</sub></div>
        </div>
        <div className="text-sm text-blue-700 mt-2">
          I = Corriente, P = Potencia, V = Tensión, F<sub>d</sub> = Factor demanda, F<sub>div</sub> = Factor diversidad
        </div>
      </div>

      <h2 className="text-xl font-semibold mb-6">Cálculo de Corriente de Empleo</h2>
      
      <div className="grid md:grid-cols-2 gap-6">
        {/* Inputs */}
        <div className="space-y-4">
          {/* Tipo de sistema */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tipo de Sistema
            </label>
            <div className="space-y-2">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="systemType"
                  value="single-phase"
                  checked={inputs.systemType === 'single-phase'}
                  onChange={(e) => handleInputChange('systemType', e.target.value)}
                  className="mr-2"
                />
                <span>• Monofásico</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="systemType"
                  value="three-phase"
                  checked={inputs.systemType === 'three-phase'}
                  onChange={(e) => handleInputChange('systemType', e.target.value)}
                  className="mr-2"
                />
                <span>• Trifásico</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="systemType"
                  value="dc"
                  checked={inputs.systemType === 'dc'}
                  onChange={(e) => handleInputChange('systemType', e.target.value)}
                  className="mr-2"
                />
                <span>• Corriente Continua</span>
              </label>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Potencia
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
                Unidad
              </label>
              <select
                value={inputs.powerUnit}
                onChange={(e) => handleInputChange('powerUnit', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="W">W</option>
                <option value="kW">kW</option>
                <option value="MW">MW</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tensión (V)
            </label>
            <input
              type="number"
              value={inputs.voltage}
              onChange={(e) => handleInputChange('voltage', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {inputs.systemType !== 'dc' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                cos φ (Factor de Potencia)
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                max="1"
                value={inputs.powerFactor}
                onChange={(e) => handleInputChange('powerFactor', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Factor de Demanda
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              max="1"
              value={inputs.demandFactor}
              onChange={(e) => handleInputChange('demandFactor', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Factor de Diversidad
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              max="1"
              value={inputs.diversityFactor}
              onChange={(e) => handleInputChange('diversityFactor', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <button
            onClick={calculate}
            className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
          >
            Calcular Corriente de Empleo
          </button>
        </div>

        {/* Results */}
        <div className="space-y-4">
          {result ? (
            <>
              <div className="bg-blue-50 p-4 rounded-lg border-2 border-blue-200">
                <div className="text-sm text-blue-600 font-medium">Corriente de Empleo</div>
                <div className="text-3xl font-bold text-blue-900">{result.loadCurrent} A</div>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="text-sm text-gray-600 font-medium">Corriente Nominal</div>
                <div className="text-xl font-bold text-gray-900">{result.nominalCurrent} A</div>
              </div>

              <div className="bg-green-50 p-4 rounded-lg">
                <div className="text-sm text-green-600 font-medium">Potencia de Demanda</div>
                <div className="text-xl font-bold text-green-900">{result.demandLoad} kW</div>
              </div>

              <div className="bg-yellow-50 p-4 rounded-lg">
                <div className="text-sm text-yellow-600 font-medium">Potencia Aparente</div>
                <div className="text-xl font-bold text-yellow-900">{result.apparentPower} kVA</div>
              </div>

              {inputs.systemType !== 'dc' && (
                <div className="bg-purple-50 p-4 rounded-lg">
                  <div className="text-sm text-purple-600 font-medium">Potencia Reactiva</div>
                  <div className="text-xl font-bold text-purple-900">{result.reactivePower} kVAR</div>
                </div>
              )}

              <div className="bg-orange-50 p-4 rounded-lg">
                <div className="text-sm text-orange-600 font-medium">Reducción por Factores</div>
                <div className="text-xl font-bold text-orange-900">{result.reduction}%</div>
              </div>

              <div className="bg-indigo-50 p-4 rounded-lg">
                <div className="text-sm text-indigo-700 font-medium">Información</div>
                <div className="text-xs text-indigo-600 mt-1">
                  Factor de demanda: Relación entre demanda máxima y carga instalada.<br/>
                  Factor de diversidad: Considera que no todas las cargas operan simultáneamente.
                </div>
              </div>
            </>
          ) : (
            <div className="text-center py-12 text-gray-500">
              Ingresa los parámetros de la carga y haz clic en "Calcular"
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LoadCurrentCalc;
