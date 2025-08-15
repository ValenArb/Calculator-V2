import { useState } from 'react';

const VoltageCalc = () => {
  const [inputs, setInputs] = useState({
    calculationType: 'current-power',
    systemType: 'single-phase',
    current: 10,
    currentUnit: 'A',
    power: 2200,
    powerUnit: 'W',
    impedance: 50,
    impedanceUnit: 'Ω',
    resistance: 50,
    resistanceUnit: 'Ω',
    powerFactor: 0.9,
    powerFactorType: 'cos',
    resultUnit: 'V'
  });
  
  const [result, setResult] = useState(null);

  // Conversiones de unidades
  const currentConversions = {
    'mA': 0.001, 'A': 1, 'kA': 1000
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

  const voltageConversions = {
    'mV': 0.001, 'V': 1, 'kV': 1000
  };

  const calculate = () => {
    const { calculationType, systemType, current, currentUnit, power, powerUnit, 
            impedance, impedanceUnit, resistance, resistanceUnit, powerFactor, powerFactorType, resultUnit } = inputs;
    
    let voltage = 0;
    let formula = '';
    
    // Convertir valores a unidades base
    const currentInA = current * currentConversions[currentUnit];
    const powerInW = power * powerConversions[powerUnit];
    const impedanceInOhm = impedance * impedanceConversions[impedanceUnit];
    const resistanceInOhm = resistance * resistanceConversions[resistanceUnit];
    
    // Calcular factor de potencia efectivo
    const pf = powerFactorType === 'sen' ? Math.sqrt(1 - Math.pow(powerFactor, 2)) :
               powerFactorType === 'tan' ? powerFactor / Math.sqrt(1 + Math.pow(powerFactor, 2)) : powerFactor;

    switch (calculationType) {
      case 'current-power':
        switch (systemType) {
          case 'single-phase':
            voltage = powerInW / (currentInA * pf);
            formula = 'V = P / (I × cos φ)';
            break;
          case 'two-phase':
            voltage = powerInW / (2 * currentInA * pf);
            formula = 'V = P / (2 × I × cos φ)';
            break;
          case 'three-phase':
            voltage = powerInW / (Math.sqrt(3) * currentInA * pf);
            formula = 'V = P / (√3 × I × cos φ)';
            break;
          case 'dc':
            voltage = powerInW / currentInA;
            formula = 'V = P / I';
            break;
        }
        break;
        
      case 'current-impedance':
        voltage = currentInA * impedanceInOhm;
        formula = 'V = I × Z';
        break;
        
      case 'current-resistance':
        voltage = currentInA * resistanceInOhm;
        formula = 'V = I × R';
        break;
        
      case 'power-impedance':
        voltage = Math.sqrt(powerInW * impedanceInOhm);
        formula = 'V = √(P × Z)';
        break;
        
      case 'power-resistance':
        voltage = Math.sqrt(powerInW * resistanceInOhm);
        formula = 'V = √(P × R)';
        break;
    }
    
    // Convertir resultado a la unidad seleccionada
    const displayVoltage = voltage / voltageConversions[resultUnit];
    
    setResult({
      voltage: displayVoltage.toFixed(3),
      voltageUnit: resultUnit,
      formula: formula,
      calculationType: calculationType,
      systemType: systemType,
      voltageInV: voltage.toFixed(3)
    });
  };

  const handleInputChange = (field, value) => {
    setInputs(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="p-6">
      <h2 className="text-xl font-semibold mb-6">Cálculo de Tensión</h2>
      
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
              <option value="current-power">Corriente / Potencia</option>
              <option value="current-impedance">Corriente / Impedancia</option>
              <option value="current-resistance">Corriente / Resistencia</option>
              <option value="power-impedance">Potencia / Impedancia</option>
              <option value="power-resistance">Potencia / Resistencia</option>
            </select>
          </div>

          {/* Tipo de Sistema - Solo para cálculos corriente/potencia */}
          {inputs.calculationType === 'current-power' && (
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

          {/* Corriente - Para cálculos que requieren corriente */}
          {(inputs.calculationType === 'current-power' || inputs.calculationType === 'current-impedance' || inputs.calculationType === 'current-resistance') && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Corriente
              </label>
              <div className="flex gap-2">
                <input
                  type="number"
                  value={inputs.current}
                  onChange={(e) => handleInputChange('current', parseFloat(e.target.value) || 0)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <select
                  value={inputs.currentUnit}
                  onChange={(e) => handleInputChange('currentUnit', e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="mA">mA</option>
                  <option value="A">A</option>
                  <option value="kA">kA</option>
                </select>
              </div>
            </div>
          )}

          {/* Potencia - Para cálculos que requieren potencia */}
          {(inputs.calculationType === 'current-power' || inputs.calculationType === 'power-impedance' || inputs.calculationType === 'power-resistance') && (
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
          {(inputs.calculationType === 'current-impedance' || inputs.calculationType === 'power-impedance') && (
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
          {(inputs.calculationType === 'current-resistance' || inputs.calculationType === 'power-resistance') && (
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

          {/* Factor de Potencia - Solo para corriente/potencia y no DC */}
          {inputs.calculationType === 'current-power' && inputs.systemType !== 'dc' && (
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

          {/* Unidad de Resultado */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Unidad de Tensión
            </label>
            <select
              value={inputs.resultUnit}
              onChange={(e) => handleInputChange('resultUnit', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="mV">mV</option>
              <option value="V">V</option>
              <option value="kV">kV</option>
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
              <div className="bg-green-50 p-4 rounded-lg">
                <div className="text-sm text-green-600 font-medium">Tensión Calculada</div>
                <div className="text-2xl font-bold text-green-900">{result.voltage} {result.voltageUnit}</div>
              </div>

              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="text-sm text-blue-600 font-medium">Fórmula Utilizada</div>
                <div className="text-lg font-mono text-blue-900">{result.formula}</div>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="text-sm text-gray-600 font-medium mb-2">Información del Cálculo</div>
                <div className="text-xs text-gray-600 space-y-1">
                  <div>• Tipo: {result.calculationType.replace('-', ' / ').replace('current', 'corriente').replace('power', 'potencia').replace('impedance', 'impedancia').replace('resistance', 'resistencia')}</div>
                  {result.systemType && <div>• Sistema: {result.systemType === 'single-phase' ? 'Monofásico' :
                                    result.systemType === 'two-phase' ? 'Bifásico' :
                                    result.systemType === 'three-phase' ? 'Trifásico' : 'DC'}</div>}
                  <div>• Valor base: {result.voltageInV} V</div>
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
          {inputs.calculationType === 'current-power' && (
            <>
              <div><strong>Corriente / Potencia:</strong></div>
              <div>• Monofásico: V = P / (I × cos φ)</div>
              <div>• Bifásico: V = P / (2 × I × cos φ)</div>
              <div>• Trifásico: V = P / (√3 × I × cos φ)</div>
              <div>• Corriente Continua: V = P / I</div>
            </>
          )}
          
          {inputs.calculationType === 'current-impedance' && (
            <>
              <div><strong>Corriente / Impedancia:</strong></div>
              <div>• V = I × Z</div>
            </>
          )}
          
          {inputs.calculationType === 'current-resistance' && (
            <>
              <div><strong>Corriente / Resistencia:</strong></div>
              <div>• V = I × R</div>
            </>
          )}
          
          {inputs.calculationType === 'power-impedance' && (
            <>
              <div><strong>Potencia / Impedancia:</strong></div>
              <div>• V = √(P × Z)</div>
            </>
          )}
          
          {inputs.calculationType === 'power-resistance' && (
            <>
              <div><strong>Potencia / Resistencia:</strong></div>
              <div>• V = √(P × R)</div>
            </>
          )}
        </div>
        <div className="text-sm text-blue-700 mt-3">
          V = Tensión, I = Corriente, P = Potencia, Z = Impedancia, R = Resistencia, cos φ = Factor de potencia
        </div>
      </div>
    </div>
  );
};

export default VoltageCalc;