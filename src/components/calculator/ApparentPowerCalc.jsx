import { useState } from 'react';

const ApparentPowerCalc = () => {
  const [inputs, setInputs] = useState({
    calculationType: 'voltage-current',
    systemType: 'single-phase',
    voltage: 220,
    voltageUnit: 'V',
    current: 10,
    currentUnit: 'A',
    impedance: 50,
    impedanceUnit: 'Ω',
    resistance: 50,
    resistanceUnit: 'Ω',
    activePower: 1800,
    activePowerUnit: 'W',
    reactivePower: 872,
    reactivePowerUnit: 'var',
    powerFactor: 0.9,
    powerFactorType: 'cos',
    resultUnit: 'VA'
  });
  
  const [result, setResult] = useState(null);

  // Conversiones de unidades
  const voltageConversions = {
    'mV': 0.001, 'V': 1, 'kV': 1000
  };

  const currentConversions = {
    'mA': 0.001, 'A': 1, 'kA': 1000
  };

  const impedanceConversions = {
    'mΩ': 0.001, 'Ω': 1, 'kΩ': 1000, 'MΩ': 1000000
  };

  const resistanceConversions = {
    'mΩ': 0.001, 'Ω': 1, 'kΩ': 1000, 'MΩ': 1000000
  };

  const activePowerConversions = {
    'W': 1, 'kW': 1000, 'MW': 1000000
  };

  const reactivePowerConversions = {
    'var': 1, 'kvar': 1000, 'Mvar': 1000000
  };

  const apparentPowerConversions = {
    'VA': 1, 'kVA': 1000, 'MVA': 1000000
  };

  const calculate = () => {
    const { calculationType, systemType, voltage, voltageUnit, current, currentUnit, 
            impedance, impedanceUnit, resistance, resistanceUnit, activePower, activePowerUnit,
            reactivePower, reactivePowerUnit, powerFactor, powerFactorType, resultUnit } = inputs;
    
    let apparentPower = 0;
    let formula = '';
    
    // Convertir valores a unidades base
    const voltageInV = voltage * voltageConversions[voltageUnit];
    const currentInA = current * currentConversions[currentUnit];
    const impedanceInOhm = impedance * impedanceConversions[impedanceUnit];
    const resistanceInOhm = resistance * resistanceConversions[resistanceUnit];
    const activePowerInW = activePower * activePowerConversions[activePowerUnit];
    const reactivePowerInVar = reactivePower * reactivePowerConversions[reactivePowerUnit];
    
    // Calcular factor de potencia efectivo
    const pf = powerFactorType === 'sen' ? Math.sqrt(1 - Math.pow(powerFactor, 2)) :
               powerFactorType === 'tan' ? powerFactor / Math.sqrt(1 + Math.pow(powerFactor, 2)) : powerFactor;

    switch (calculationType) {
      case 'voltage-current':
        switch (systemType) {
          case 'single-phase':
            apparentPower = voltageInV * currentInA;
            formula = 'S = V × I';
            break;
          case 'two-phase':
            apparentPower = 2 * voltageInV * currentInA;
            formula = 'S = 2 × V × I';
            break;
          case 'three-phase':
            apparentPower = Math.sqrt(3) * voltageInV * currentInA;
            formula = 'S = √3 × V × I';
            break;
        }
        break;
        
      case 'voltage-impedance':
        apparentPower = (voltageInV * voltageInV) / impedanceInOhm;
        formula = 'S = V² / Z';
        break;
        
      case 'voltage-resistance':
        apparentPower = (voltageInV * voltageInV) / resistanceInOhm;
        formula = 'S = V² / R';
        break;
        
      case 'current-impedance':
        apparentPower = currentInA * currentInA * impedanceInOhm;
        formula = 'S = I² × Z';
        break;
        
      case 'current-resistance':
        apparentPower = currentInA * currentInA * resistanceInOhm;
        formula = 'S = I² × R';
        break;
        
      case 'active-reactive':
        apparentPower = Math.sqrt(Math.pow(activePowerInW, 2) + Math.pow(reactivePowerInVar, 2));
        formula = 'S = √(P² + Q²)';
        break;
        
      case 'active-only':
        apparentPower = activePowerInW / pf;
        formula = 'S = P / cos φ';
        break;
        
      case 'reactive-only':
        apparentPower = reactivePowerInVar / Math.sin(Math.acos(pf));
        formula = 'S = Q / sen φ';
        break;
    }
    
    // Convertir resultado a la unidad seleccionada
    const displayApparentPower = apparentPower / apparentPowerConversions[resultUnit];
    
    setResult({
      apparentPower: displayApparentPower.toFixed(3),
      apparentPowerUnit: resultUnit,
      formula: formula,
      calculationType: calculationType,
      systemType: systemType,
      apparentPowerInVA: apparentPower.toFixed(3)
    });
  };

  const handleInputChange = (field, value) => {
    setInputs(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="p-6">
      <h2 className="text-xl font-semibold mb-6">Cálculo de Potencia Aparente</h2>
      <p className="text-gray-600 mb-6">Solo para sistemas de corriente alterna</p>
      
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
              <option value="voltage-current">Tensión / Corriente</option>
              <option value="voltage-impedance">Tensión / Impedancia</option>
              <option value="voltage-resistance">Tensión / Resistencia</option>
              <option value="current-impedance">Corriente / Impedancia</option>
              <option value="current-resistance">Corriente / Resistencia</option>
              <option value="active-reactive">Potencia Activa / Potencia Reactiva</option>
              <option value="active-only">Potencia Activa</option>
              <option value="reactive-only">Potencia Reactiva</option>
            </select>
          </div>

          {/* Tipo de Sistema - Solo AC (No DC) */}
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
            </div>
          </div>

          {/* Tensión - Para cálculos que requieren tensión */}
          {(inputs.calculationType === 'voltage-current' || inputs.calculationType === 'voltage-impedance' || inputs.calculationType === 'voltage-resistance') && (
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

          {/* Corriente - Para cálculos que requieren corriente */}
          {(inputs.calculationType === 'voltage-current' || inputs.calculationType === 'current-impedance' || inputs.calculationType === 'current-resistance') && (
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

          {/* Impedancia - Para cálculos que requieren impedancia */}
          {(inputs.calculationType === 'voltage-impedance' || inputs.calculationType === 'current-impedance') && (
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
          {(inputs.calculationType === 'voltage-resistance' || inputs.calculationType === 'current-resistance') && (
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

          {/* Potencia Activa - Para cálculos que requieren potencia activa */}
          {(inputs.calculationType === 'active-reactive' || inputs.calculationType === 'active-only') && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Potencia Activa
              </label>
              <div className="flex gap-2">
                <input
                  type="number"
                  value={inputs.activePower}
                  onChange={(e) => handleInputChange('activePower', parseFloat(e.target.value) || 0)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <select
                  value={inputs.activePowerUnit}
                  onChange={(e) => handleInputChange('activePowerUnit', e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="W">W</option>
                  <option value="kW">kW</option>
                  <option value="MW">MW</option>
                </select>
              </div>
            </div>
          )}

          {/* Potencia Reactiva - Para cálculos que requieren potencia reactiva */}
          {(inputs.calculationType === 'active-reactive' || inputs.calculationType === 'reactive-only') && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Potencia Reactiva
              </label>
              <div className="flex gap-2">
                <input
                  type="number"
                  value={inputs.reactivePower}
                  onChange={(e) => handleInputChange('reactivePower', parseFloat(e.target.value) || 0)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <select
                  value={inputs.reactivePowerUnit}
                  onChange={(e) => handleInputChange('reactivePowerUnit', e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="var">var</option>
                  <option value="kvar">kvar</option>
                  <option value="Mvar">Mvar</option>
                </select>
              </div>
            </div>
          )}

          {/* Factor de Potencia - Solo para cálculos específicos */}
          {(inputs.calculationType === 'active-reactive' || inputs.calculationType === 'active-only' || inputs.calculationType === 'reactive-only') && (
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
              Unidad de Potencia Aparente
            </label>
            <select
              value={inputs.resultUnit}
              onChange={(e) => handleInputChange('resultUnit', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="VA">VA</option>
              <option value="kVA">kVA</option>
              <option value="MVA">MVA</option>
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
                <div className="text-sm text-green-600 font-medium">Potencia Aparente Calculada</div>
                <div className="text-2xl font-bold text-green-900">{result.apparentPower} {result.apparentPowerUnit}</div>
              </div>

              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="text-sm text-blue-600 font-medium">Fórmula Utilizada</div>
                <div className="text-lg font-mono text-blue-900">{result.formula}</div>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="text-sm text-gray-600 font-medium mb-2">Información del Cálculo</div>
                <div className="text-xs text-gray-600 space-y-1">
                  <div>• Tipo: {result.calculationType.replace('-', ' / ').replace('voltage', 'tensión').replace('current', 'corriente').replace('impedance', 'impedancia').replace('resistance', 'resistencia').replace('active', 'potencia activa').replace('reactive', 'potencia reactiva').replace('only', 'sólo')}</div>
                  <div>• Sistema: {result.systemType === 'single-phase' ? 'Monofásico' :
                                    result.systemType === 'two-phase' ? 'Bifásico' : 'Trifásico'}</div>
                  <div>• Valor base: {result.apparentPowerInVA} VA</div>
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
          {inputs.calculationType === 'voltage-current' && (
            <>
              <div><strong>Tensión / Corriente:</strong></div>
              <div>• Monofásico: S = V × I</div>
              <div>• Bifásico: S = 2 × V × I</div>
              <div>• Trifásico: S = √3 × V × I</div>
            </>
          )}
          
          {inputs.calculationType === 'voltage-impedance' && (
            <>
              <div><strong>Tensión / Impedancia:</strong></div>
              <div>• S = V² / Z</div>
            </>
          )}
          
          {inputs.calculationType === 'voltage-resistance' && (
            <>
              <div><strong>Tensión / Resistencia:</strong></div>
              <div>• S = V² / R</div>
            </>
          )}
          
          {inputs.calculationType === 'current-impedance' && (
            <>
              <div><strong>Corriente / Impedancia:</strong></div>
              <div>• S = I² × Z</div>
            </>
          )}
          
          {inputs.calculationType === 'current-resistance' && (
            <>
              <div><strong>Corriente / Resistencia:</strong></div>
              <div>• S = I² × R</div>
            </>
          )}
          
          {inputs.calculationType === 'active-reactive' && (
            <>
              <div><strong>Potencia Activa / Potencia Reactiva:</strong></div>
              <div>• S = √(P² + Q²)</div>
            </>
          )}
          
          {inputs.calculationType === 'active-only' && (
            <>
              <div><strong>Potencia Activa:</strong></div>
              <div>• S = P / cos φ</div>
            </>
          )}
          
          {inputs.calculationType === 'reactive-only' && (
            <>
              <div><strong>Potencia Reactiva:</strong></div>
              <div>• S = Q / sen φ</div>
            </>
          )}
        </div>
        <div className="text-sm text-blue-700 mt-3">
          S = Potencia Aparente, V = Tensión, I = Corriente, P = Potencia Activa, Q = Potencia Reactiva, Z = Impedancia, R = Resistencia, cos φ = Factor de potencia
        </div>
      </div>
    </div>
  );
};

export default ApparentPowerCalc;