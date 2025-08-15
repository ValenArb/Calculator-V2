import { useState } from 'react';

const CurrentCalc = () => {
  const [inputs, setInputs] = useState({
    calculationType: 'voltage-power',
    systemType: 'single-phase',
    voltage: 220,
    voltageUnit: 'V',
    power: 1000,
    powerUnit: 'W',
    impedance: 50,
    impedanceUnit: 'Ω',
    resistance: 50,
    resistanceUnit: 'Ω',
    powerFactor: 0.9,
    powerFactorType: 'cos'
  });
  
  const [result, setResult] = useState(null);

  // Conversiones de unidades
  const voltageConversions = {
    'mV': 0.001, 'V': 1, 'kV': 1000
  };

  const powerConversions = {
    'W': 1, 'kW': 1000, 'A': 1, 'HP': 745.7, 'VA': 1, 'kVA': 1000, 'MVA': 1000000,
    'var': 1, 'kvar': 1000, 'Mvar': 1000000
  };

  const impedanceConversions = {
    'mΩ': 0.001, 'Ω': 1, 'kΩ': 1000, 'MΩ': 1000000
  };

  const resistanceConversions = {
    'mΩ': 0.001, 'Ω': 1, 'kΩ': 1000, 'MΩ': 1000000
  };

  const calculate = () => {
    const { calculationType, systemType, voltage, voltageUnit, power, powerUnit, 
            impedance, impedanceUnit, resistance, resistanceUnit, powerFactor, powerFactorType } = inputs;
    
    let current = 0;
    let formula = '';
    
    // Convertir valores a unidades base
    const voltageInV = voltage * voltageConversions[voltageUnit];
    const powerInW = power * powerConversions[powerUnit];
    const impedanceInOhm = impedance * impedanceConversions[impedanceUnit];
    const resistanceInOhm = resistance * resistanceConversions[resistanceUnit];
    
    // Calcular factor de potencia efectivo
    const pf = powerFactorType === 'sen' ? Math.sqrt(1 - Math.pow(powerFactor, 2)) :
               powerFactorType === 'tan' ? powerFactor / Math.sqrt(1 + Math.pow(powerFactor, 2)) : powerFactor;

    switch (calculationType) {
      case 'voltage-power':
        switch (systemType) {
          case 'single-phase':
            current = powerInW / (voltageInV * pf);
            formula = 'I = P / (V × cos φ)';
            break;
          case 'two-phase':
            current = powerInW / (2 * voltageInV * pf);
            formula = 'I = P / (2 × V × cos φ)';
            break;
          case 'three-phase':
            current = powerInW / (Math.sqrt(3) * voltageInV * pf);
            formula = 'I = P / (√3 × V × cos φ)';
            break;
          case 'dc':
            current = powerInW / voltageInV;
            formula = 'I = P / V';
            break;
        }
        break;
        
      case 'voltage-impedance':
        current = voltageInV / impedanceInOhm;
        formula = 'I = V / Z';
        break;
        
      case 'voltage-resistance':
        current = voltageInV / resistanceInOhm;
        formula = 'I = V / R';
        break;
        
      case 'power-impedance':
        current = Math.sqrt(powerInW / impedanceInOhm);
        formula = 'I = √(P / Z)';
        break;
        
      case 'power-resistance':
        current = Math.sqrt(powerInW / resistanceInOhm);
        formula = 'I = √(P / R)';
        break;
    }
    
    setResult({
      current: current.toFixed(3),
      formula: formula,
      calculationType: calculationType,
      systemType: systemType
    });
  };

  const handleInputChange = (field, value) => {
    setInputs(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="p-6">
      <h2 className="text-xl font-semibold mb-6">Cálculo de Corriente</h2>
      
      <div className="grid md:grid-cols-2 gap-6">
        {/* Inputs */}
        <div className="space-y-4">
          {/* Tipo de Cálculo */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tipo de Cálculo
            </label>
            <select
              value={inputs.calculationType}
              onChange={(e) => handleInputChange('calculationType', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="voltage-power">Tensión / Potencia</option>
              <option value="voltage-impedance">Tensión / Impedancia</option>
              <option value="voltage-resistance">Tensión / Resistencia</option>
              <option value="power-impedance">Potencia / Impedancia</option>
              <option value="power-resistance">Potencia / Resistencia</option>
            </select>
          </div>

          {/* Tipo de Sistema - Solo para cálculos tensión/potencia */}
          {inputs.calculationType === 'voltage-power' && (
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
                    value="two-phase"
                    checked={inputs.systemType === 'two-phase'}
                    onChange={(e) => handleInputChange('systemType', e.target.value)}
                    className="mr-2"
                  />
                  <span>• Bifásico</span>
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
          )}

          {/* Tensión - Para cálculos que requieren tensión */}
          {(inputs.calculationType === 'voltage-power' || inputs.calculationType === 'voltage-impedance' || inputs.calculationType === 'voltage-resistance') && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tensión
              </label>
              <div className="flex gap-2">
                <input
                  type="number"
                  value={inputs.voltage}
                  onChange={(e) => handleInputChange('voltage', parseFloat(e.target.value) || 0)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <select
                  value={inputs.voltageUnit}
                  onChange={(e) => handleInputChange('voltageUnit', e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="mV">mV</option>
                  <option value="V">V</option>
                  <option value="kV">kV</option>
                </select>
              </div>
            </div>
          )}

          {/* Potencia - Para cálculos que requieren potencia */}
          {(inputs.calculationType === 'voltage-power' || inputs.calculationType === 'power-impedance' || inputs.calculationType === 'power-resistance') && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Potencia
              </label>
              <div className="flex gap-2">
                <input
                  type="number"
                  value={inputs.power}
                  onChange={(e) => handleInputChange('power', parseFloat(e.target.value) || 0)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <select
                  value={inputs.powerUnit}
                  onChange={(e) => handleInputChange('powerUnit', e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="W">W</option>
                  <option value="kW">kW</option>
                  <option value="A">A</option>
                  <option value="HP">HP</option>
                  <option value="VA">VA</option>
                  <option value="kVA">kVA</option>
                  <option value="MVA">MVA</option>
                  <option value="var">var</option>
                  <option value="kvar">kvar</option>
                  <option value="Mvar">Mvar</option>
                </select>
              </div>
            </div>
          )}

          {/* Impedancia - Para cálculos que requieren impedancia */}
          {(inputs.calculationType === 'voltage-impedance' || inputs.calculationType === 'power-impedance') && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Impedancia
              </label>
              <div className="flex gap-2">
                <input
                  type="number"
                  value={inputs.impedance}
                  onChange={(e) => handleInputChange('impedance', parseFloat(e.target.value) || 0)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <select
                  value={inputs.impedanceUnit}
                  onChange={(e) => handleInputChange('impedanceUnit', e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="mΩ">mΩ</option>
                  <option value="Ω">Ω</option>
                  <option value="kΩ">kΩ</option>
                  <option value="MΩ">MΩ</option>
                </select>
              </div>
            </div>
          )}

          {/* Resistencia - Para cálculos que requieren resistencia */}
          {(inputs.calculationType === 'voltage-resistance' || inputs.calculationType === 'power-resistance') && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Resistencia
              </label>
              <div className="flex gap-2">
                <input
                  type="number"
                  value={inputs.resistance}
                  onChange={(e) => handleInputChange('resistance', parseFloat(e.target.value) || 0)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <select
                  value={inputs.resistanceUnit}
                  onChange={(e) => handleInputChange('resistanceUnit', e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="mΩ">mΩ</option>
                  <option value="Ω">Ω</option>
                  <option value="kΩ">kΩ</option>
                  <option value="MΩ">MΩ</option>
                </select>
              </div>
            </div>
          )}

          {/* Factor de Potencia - Solo para tensión/potencia y no DC */}
          {inputs.calculationType === 'voltage-power' && inputs.systemType !== 'dc' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Factor de Potencia
              </label>
              <div className="flex gap-2">
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  max="1"
                  value={inputs.powerFactor}
                  onChange={(e) => handleInputChange('powerFactor', parseFloat(e.target.value) || 0)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <select
                  value={inputs.powerFactorType}
                  onChange={(e) => handleInputChange('powerFactorType', e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="cos">cos φ</option>
                  <option value="sen">sen φ</option>
                  <option value="tan">tan φ</option>
                </select>
              </div>
            </div>
          )}

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
                <div className="text-sm text-blue-600 font-medium">Corriente Calculada</div>
                <div className="text-2xl font-bold text-blue-900">{result.current} A</div>
              </div>

              <div className="bg-green-50 p-4 rounded-lg">
                <div className="text-sm text-green-600 font-medium">Fórmula Utilizada</div>
                <div className="text-lg font-mono text-green-900">{result.formula}</div>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="text-sm text-gray-600 font-medium mb-2">Información del Cálculo</div>
                <div className="text-xs text-gray-600 space-y-1">
                  <div>• Tipo: {result.calculationType.replace('-', ' / ').replace('voltage', 'tensión').replace('power', 'potencia').replace('impedance', 'impedancia').replace('resistance', 'resistencia')}</div>
                  <div>• Sistema: {result.systemType === 'single-phase' ? 'Monofásico' :
                                  result.systemType === 'two-phase' ? 'Bifásico' :
                                  result.systemType === 'three-phase' ? 'Trifásico' : 'DC'}</div>
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
      <div className="mt-8 bg-blue-50 p-4 rounded-lg border-l-4 border-blue-500">
        <h3 className="text-lg font-semibold text-blue-900 mb-2">Fórmulas por Tipo de Cálculo</h3>
        <div className="text-blue-800 font-mono space-y-2 text-sm">
          {inputs.calculationType === 'voltage-power' && (
            <>
              <div><strong>Tensión / Potencia:</strong></div>
              <div>• Monofásico: I = P / (V × cos φ)</div>
              <div>• Bifásico: I = P / (2 × V × cos φ)</div>
              <div>• Trifásico: I = P / (√3 × V × cos φ)</div>
              <div>• Corriente Continua: I = P / V</div>
            </>
          )}
          
          {inputs.calculationType === 'voltage-impedance' && (
            <>
              <div><strong>Tensión / Impedancia:</strong></div>
              <div>• I = V / Z</div>
              <div>• Aplica para cualquier tipo de sistema</div>
            </>
          )}
          
          {inputs.calculationType === 'voltage-resistance' && (
            <>
              <div><strong>Tensión / Resistencia:</strong></div>
              <div>• I = V / R</div>
              <div>• Aplica para cualquier tipo de sistema</div>
            </>
          )}
          
          {inputs.calculationType === 'power-impedance' && (
            <>
              <div><strong>Potencia / Impedancia:</strong></div>
              <div>• I = √(P / Z)</div>
              <div>• Válido para circuitos resistivos puros</div>
            </>
          )}
          
          {inputs.calculationType === 'power-resistance' && (
            <>
              <div><strong>Potencia / Resistencia:</strong></div>
              <div>• I = √(P / R)</div>
              <div>• Válido para circuitos resistivos puros</div>
            </>
          )}
        </div>
        <div className="text-sm text-blue-700 mt-3">
          P = Potencia, V = Tensión, Z = Impedancia, R = Resistencia, cos φ = Factor de potencia
        </div>
      </div>
    </div>
  );
};

export default CurrentCalc;