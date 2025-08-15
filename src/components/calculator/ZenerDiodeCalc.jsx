import { useState } from 'react';

const ZenerDiodeCalc = () => {
  const [inputs, setInputs] = useState({
    calculationType: 'voltage-regulator',
    // Voltage Regulator Parameters
    inputVoltage: 12, // V
    outputVoltage: 5.1, // V (Zener voltage)
    loadCurrent: 100, // mA
    zenerVoltage: 5.1, // V
    zenerCurrent: 10, // mA (minimum)
    maxZenerCurrent: 50, // mA
    tempCoeff: 0.07, // %/°C
    // Zener Parameters
    zenerPower: 0.5, // W
    thermalResistance: 250, // °C/W
    ambientTemp: 25, // °C
    maxJunctionTemp: 150, // °C
    // Circuit Analysis
    resistorTolerance: 5, // %
    voltageRipple: 0.1, // V
    regulationFactor: 0.01 // %/V
  });
  
  const [result, setResult] = useState(null);

  // Standard Zener voltages (E24 series common values)
  const standardZenerVoltages = [
    2.4, 2.7, 3.0, 3.3, 3.6, 3.9, 4.3, 4.7, 5.1, 5.6, 
    6.2, 6.8, 7.5, 8.2, 9.1, 10, 11, 12, 13, 15, 16, 18, 
    20, 22, 24, 27, 30, 33, 36, 39, 43, 47, 51, 56, 62, 68, 75
  ];

  const calculate = () => {
    const { calculationType, inputVoltage, outputVoltage, loadCurrent, zenerVoltage, 
            zenerCurrent, maxZenerCurrent, zenerPower, thermalResistance, ambientTemp, 
            maxJunctionTemp, tempCoeff, resistorTolerance, voltageRipple, regulationFactor } = inputs;

    let results = {};

    if (calculationType === 'voltage-regulator') {
      // Basic voltage regulator calculations
      const totalCurrent = loadCurrent + zenerCurrent; // mA
      const seriesResistance = (inputVoltage - zenerVoltage) / (totalCurrent / 1000); // Ω
      
      // Power dissipation calculations
      const resistorPower = Math.pow(inputVoltage - zenerVoltage, 2) / seriesResistance; // W
      const zenerPowerDissipation = (zenerVoltage * zenerCurrent) / 1000; // W
      const totalPowerDissipation = resistorPower + zenerPowerDissipation; // W
      
      // Efficiency
      const outputPower = (zenerVoltage * loadCurrent) / 1000; // W
      const inputPower = (inputVoltage * totalCurrent) / 1000; // W
      const efficiency = (outputPower / inputPower) * 100; // %
      
      // Load regulation
      const noLoadVoltage = zenerVoltage;
      const fullLoadVoltage = zenerVoltage - (zenerCurrent * regulationFactor * zenerVoltage / 100);
      const loadRegulation = ((noLoadVoltage - fullLoadVoltage) / fullLoadVoltage) * 100; // %
      
      // Line regulation
      const lineRegulation = regulationFactor; // %/V
      
      // Current range calculations
      const minInputVoltage = inputVoltage * 0.9; // 10% variation
      const maxInputVoltage = inputVoltage * 1.1;
      
      const minZenerCurrent = ((minInputVoltage - zenerVoltage) / seriesResistance) * 1000 - loadCurrent;
      const maxZenerCurrent = ((maxInputVoltage - zenerVoltage) / seriesResistance) * 1000 - loadCurrent;
      
      // Temperature effects
      const tempChange = 50; // Assuming 50°C rise
      const voltageChange = zenerVoltage * (tempCoeff / 100) * tempChange;
      const tempCompensatedVoltage = zenerVoltage + voltageChange;
      
      results = {
        seriesResistance: seriesResistance.toFixed(1),
        resistorPower: resistorPower.toFixed(3),
        zenerPowerDissipation: zenerPowerDissipation.toFixed(3),
        totalPowerDissipation: totalPowerDissipation.toFixed(3),
        efficiency: efficiency.toFixed(1),
        loadRegulation: loadRegulation.toFixed(2),
        lineRegulation: lineRegulation.toFixed(3),
        minZenerCurrent: minZenerCurrent.toFixed(1),
        maxZenerCurrentCalc: maxZenerCurrent.toFixed(1),
        tempCompensatedVoltage: tempCompensatedVoltage.toFixed(3),
        voltageChange: voltageChange.toFixed(3),
        isZenerCurrentSafe: minZenerCurrent >= 1 && maxZenerCurrent <= maxZenerCurrent,
        recommendedResistor: seriesResistance > 1000 ? 
                            `${(seriesResistance/1000).toFixed(1)}kΩ` : 
                            `${seriesResistance.toFixed(0)}Ω`
      };

    } else if (calculationType === 'thermal-analysis') {
      // Thermal analysis
      const powerDissipated = (zenerVoltage * zenerCurrent) / 1000; // W
      const junctionTemp = ambientTemp + (powerDissipated * thermalResistance);
      const maxAllowablePower = (maxJunctionTemp - ambientTemp) / thermalResistance;
      const powerDerating = ((junctionTemp - 25) / 125) * 100; // % derating above 25°C
      
      // Safety margins
      const thermalSafetyMargin = ((maxJunctionTemp - junctionTemp) / maxJunctionTemp) * 100;
      const powerSafetyMargin = ((maxAllowablePower - powerDissipated) / maxAllowablePower) * 100;
      
      results = {
        junctionTemp: junctionTemp.toFixed(1),
        maxAllowablePower: maxAllowablePower.toFixed(3),
        powerDerating: Math.max(0, powerDerating).toFixed(1),
        thermalSafetyMargin: thermalSafetyMargin.toFixed(1),
        powerSafetyMargin: powerSafetyMargin.toFixed(1),
        isThermalSafe: junctionTemp <= maxJunctionTemp,
        powerDissipated: powerDissipated.toFixed(3),
        coolingRequired: junctionTemp > 100 ? 'Sí' : 'No'
      };

    } else if (calculationType === 'circuit-design') {
      // Circuit design optimization
      const nominalCurrent = loadCurrent + zenerCurrent;
      const nominalResistance = (inputVoltage - zenerVoltage) / (nominalCurrent / 1000);
      
      // Worst case analysis with tolerances
      const maxInputV = inputVoltage * 1.1; // +10%
      const minInputV = inputVoltage * 0.9; // -10%
      const maxZenerV = zenerVoltage * 1.05; // +5%
      const minZenerV = zenerVoltage * 0.95; // -5%
      const maxResistance = nominalResistance * (1 + resistorTolerance / 100);
      const minResistance = nominalResistance * (1 - resistorTolerance / 100);
      
      // Worst case currents
      const worstCaseMaxCurrent = ((maxInputV - minZenerV) / minResistance) * 1000;
      const worstCaseMinCurrent = ((minInputV - maxZenerV) / maxResistance) * 1000;
      
      const maxZenerCurrentWorstCase = worstCaseMaxCurrent - loadCurrent;
      const minZenerCurrentWorstCase = worstCaseMinCurrent - loadCurrent;
      
      // Ripple considerations
      const rippleAttenuation = 1 / (1 + (nominalResistance * zenerCurrent / 1000 / zenerVoltage));
      const outputRipple = voltageRipple * rippleAttenuation * 1000; // mV
      
      results = {
        nominalResistance: nominalResistance.toFixed(1),
        worstCaseMaxCurrent: worstCaseMaxCurrent.toFixed(1),
        worstCaseMinCurrent: worstCaseMinCurrent.toFixed(1),
        maxZenerCurrentWorstCase: maxZenerCurrentWorstCase.toFixed(1),
        minZenerCurrentWorstCase: minZenerCurrentWorstCase.toFixed(1),
        rippleAttenuation: (rippleAttenuation * 100).toFixed(1),
        outputRipple: outputRipple.toFixed(1),
        designMarginOk: minZenerCurrentWorstCase >= 1 && maxZenerCurrentWorstCase <= maxZenerCurrent,
        recommendedMinZenerCurrent: Math.max(5, minZenerCurrentWorstCase * 1.2).toFixed(1),
        recommendedMaxPower: (maxZenerCurrentWorstCase * zenerVoltage / 1000 * 2).toFixed(3)
      };
    }

    setResult(results);
  };

  const handleInputChange = (field, value) => {
    setInputs(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="p-6">
      {/* Formula */}
      <div className="bg-blue-50 p-4 rounded-lg mb-6 border-l-4 border-blue-500">
        <h3 className="text-lg font-semibold text-blue-900 mb-2">Fórmulas</h3>
        <div className="text-blue-800 font-mono space-y-1 text-sm">
          {inputs.calculationType === 'voltage-regulator' && (
            <>
              <div>R<sub>s</sub> = (V<sub>in</sub> - V<sub>z</sub>) / I<sub>total</sub></div>
              <div>I<sub>total</sub> = I<sub>load</sub> + I<sub>z</sub></div>
              <div>P<sub>z</sub> = V<sub>z</sub> × I<sub>z</sub></div>
              <div>η = P<sub>out</sub> / P<sub>in</sub> × 100%</div>
            </>
          )}
          {inputs.calculationType === 'thermal-analysis' && (
            <>
              <div>T<sub>j</sub> = T<sub>a</sub> + P<sub>d</sub> × R<sub>th</sub></div>
              <div>P<sub>max</sub> = (T<sub>j,max</sub> - T<sub>a</sub>) / R<sub>th</sub></div>
              <div>Derating = (T<sub>j</sub> - 25°C) / 125°C × 100%</div>
            </>
          )}
          {inputs.calculationType === 'circuit-design' && (
            <>
              <div>I<sub>z,min</sub> = (V<sub>in,min</sub> - V<sub>z,max</sub>) / R<sub>max</sub> - I<sub>load</sub></div>
              <div>I<sub>z,max</sub> = (V<sub>in,max</sub> - V<sub>z,min</sub>) / R<sub>min</sub> - I<sub>load</sub></div>
              <div>Atenuación = 1 / (1 + R<sub>s</sub> × I<sub>z</sub> / V<sub>z</sub>)</div>
            </>
          )}
        </div>
      </div>

      <h2 className="text-xl font-semibold mb-6">Cálculo de Diodos Zener</h2>
      
      <div className="grid md:grid-cols-2 gap-6">
        {/* Inputs */}
        <div className="space-y-4">
          {/* Calculation Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tipo de Cálculo
            </label>
            <div className="space-y-2">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="calculationType"
                  value="voltage-regulator"
                  checked={inputs.calculationType === 'voltage-regulator'}
                  onChange={(e) => handleInputChange('calculationType', e.target.value)}
                  className="mr-2"
                />
                <span>• Regulador de Tensión</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="calculationType"
                  value="thermal-analysis"
                  checked={inputs.calculationType === 'thermal-analysis'}
                  onChange={(e) => handleInputChange('calculationType', e.target.value)}
                  className="mr-2"
                />
                <span>• Análisis Térmico</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="calculationType"
                  value="circuit-design"
                  checked={inputs.calculationType === 'circuit-design'}
                  onChange={(e) => handleInputChange('calculationType', e.target.value)}
                  className="mr-2"
                />
                <span>• Diseño del Circuito</span>
              </label>
            </div>
          </div>

          {/* Common parameters */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tensión de Entrada (V)
            </label>
            <input
              type="number"
              step="0.1"
              value={inputs.inputVoltage}
              onChange={(e) => handleInputChange('inputVoltage', parseFloat(e.target.value) || 0)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tensión Zener (V)
            </label>
            <div className="flex gap-2">
              <input
                type="number"
                step="0.1"
                value={inputs.zenerVoltage}
                onChange={(e) => handleInputChange('zenerVoltage', parseFloat(e.target.value) || 0)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <select
                onChange={(e) => handleInputChange('zenerVoltage', parseFloat(e.target.value))}
                className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Estándar</option>
                {standardZenerVoltages.map(voltage => (
                  <option key={voltage} value={voltage}>{voltage}V</option>
                ))}
              </select>
            </div>
          </div>

          {inputs.calculationType === 'voltage-regulator' && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Corriente de Carga (mA)
                </label>
                <input
                  type="number"
                  value={inputs.loadCurrent}
                  onChange={(e) => handleInputChange('loadCurrent', parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Corriente Zener Mínima (mA)
                </label>
                <input
                  type="number"
                  value={inputs.zenerCurrent}
                  onChange={(e) => handleInputChange('zenerCurrent', parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Corriente Zener Máxima (mA)
                </label>
                <input
                  type="number"
                  value={inputs.maxZenerCurrent}
                  onChange={(e) => handleInputChange('maxZenerCurrent', parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Coef. Temperatura (%/°C)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={inputs.tempCoeff}
                  onChange={(e) => handleInputChange('tempCoeff', parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <div className="text-xs text-gray-600 mt-1">
                  Típico: ±0.05-0.1%/°C para Zeners mayor 5V
                </div>
              </div>
            </>
          )}

          {inputs.calculationType === 'thermal-analysis' && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Corriente Zener (mA)
                </label>
                <input
                  type="number"
                  value={inputs.zenerCurrent}
                  onChange={(e) => handleInputChange('zenerCurrent', parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Resistencia Térmica (°C/W)
                </label>
                <input
                  type="number"
                  value={inputs.thermalResistance}
                  onChange={(e) => handleInputChange('thermalResistance', parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <div className="text-xs text-gray-600 mt-1">
                  DO-35: ~250°C/W, TO-92: ~125°C/W
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Temperatura Ambiente (°C)
                </label>
                <input
                  type="number"
                  value={inputs.ambientTemp}
                  onChange={(e) => handleInputChange('ambientTemp', parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Temp. Máxima Juntura (°C)
                </label>
                <input
                  type="number"
                  value={inputs.maxJunctionTemp}
                  onChange={(e) => handleInputChange('maxJunctionTemp', parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </>
          )}

          {inputs.calculationType === 'circuit-design' && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Corriente de Carga (mA)
                </label>
                <input
                  type="number"
                  value={inputs.loadCurrent}
                  onChange={(e) => handleInputChange('loadCurrent', parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Corriente Zener (mA)
                </label>
                <input
                  type="number"
                  value={inputs.zenerCurrent}
                  onChange={(e) => handleInputChange('zenerCurrent', parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tolerancia Resistor (%)
                </label>
                <select
                  value={inputs.resistorTolerance}
                  onChange={(e) => handleInputChange('resistorTolerance', parseFloat(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value={1}>1%</option>
                  <option value={2}>2%</option>
                  <option value={5}>5%</option>
                  <option value={10}>10%</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Rizado de Entrada (V)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={inputs.voltageRipple}
                  onChange={(e) => handleInputChange('voltageRipple', parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </>
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
              {inputs.calculationType === 'voltage-regulator' && (
                <>
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <div className="text-sm text-blue-600 font-medium">Resistencia Serie</div>
                    <div className="text-2xl font-bold text-blue-900">{result.seriesResistance} Ω</div>
                    <div className="text-sm text-blue-600">({result.recommendedResistor})</div>
                  </div>

                  <div className="bg-green-50 p-4 rounded-lg">
                    <div className="text-sm text-green-600 font-medium">Potencia Resistor</div>
                    <div className="text-xl font-bold text-green-900">{result.resistorPower} W</div>
                  </div>

                  <div className="bg-purple-50 p-4 rounded-lg">
                    <div className="text-sm text-purple-600 font-medium">Potencia Zener</div>
                    <div className="text-xl font-bold text-purple-900">{result.zenerPowerDissipation} W</div>
                  </div>

                  <div className="bg-orange-50 p-4 rounded-lg">
                    <div className="text-sm text-orange-600 font-medium">Eficiencia</div>
                    <div className="text-xl font-bold text-orange-900">{result.efficiency} %</div>
                  </div>

                  <div className="bg-yellow-50 p-4 rounded-lg">
                    <div className="text-sm text-yellow-600 font-medium">Regulación de Carga</div>
                    <div className="text-xl font-bold text-yellow-900">{result.loadRegulation} %</div>
                  </div>

                  <div className={`p-4 rounded-lg border-2 ${
                    result.isZenerCurrentSafe ? 'bg-green-100 border-green-300' : 'bg-red-100 border-red-300'
                  }`}>
                    <div className={`text-sm font-medium ${
                      result.isZenerCurrentSafe ? 'text-green-700' : 'text-red-700'
                    }`}>
                      Corriente Zener: {result.isZenerCurrentSafe ? 'SEGURA' : 'FUERA DE RANGO'}
                    </div>
                    <div className="text-xs mt-1">
                      Min: {result.minZenerCurrent} mA | Max: {result.maxZenerCurrentCalc} mA
                    </div>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="text-sm text-gray-600 font-medium mb-2">Efecto Temperatura</div>
                    <div className="text-xs text-gray-600 space-y-1">
                      <div>• Cambio tensión: ±{result.voltageChange} V (50°C)</div>
                      <div>• Tensión compensada: {result.tempCompensatedVoltage} V</div>
                    </div>
                  </div>
                </>
              )}

              {inputs.calculationType === 'thermal-analysis' && (
                <>
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <div className="text-sm text-blue-600 font-medium">Temperatura Juntura</div>
                    <div className="text-2xl font-bold text-blue-900">{result.junctionTemp} °C</div>
                  </div>

                  <div className="bg-green-50 p-4 rounded-lg">
                    <div className="text-sm text-green-600 font-medium">Potencia Máxima</div>
                    <div className="text-xl font-bold text-green-900">{result.maxAllowablePower} W</div>
                  </div>

                  <div className="bg-purple-50 p-4 rounded-lg">
                    <div className="text-sm text-purple-600 font-medium">Derating de Potencia</div>
                    <div className="text-xl font-bold text-purple-900">{result.powerDerating} %</div>
                  </div>

                  <div className={`p-4 rounded-lg border-2 ${
                    result.isThermalSafe ? 'bg-green-100 border-green-300' : 'bg-red-100 border-red-300'
                  }`}>
                    <div className={`text-sm font-medium ${
                      result.isThermalSafe ? 'text-green-700' : 'text-red-700'
                    }`}>
                      Estado Térmico: {result.isThermalSafe ? 'SEGURO' : 'SOBRECALENTAMIENTO'}
                    </div>
                  </div>

                  <div className="bg-orange-50 p-4 rounded-lg">
                    <div className="text-sm text-orange-600 font-medium">Margen Seguridad Térmica</div>
                    <div className="text-xl font-bold text-orange-900">{result.thermalSafetyMargin} %</div>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="text-sm text-gray-600 font-medium mb-2">Información Adicional</div>
                    <div className="text-xs text-gray-600 space-y-1">
                      <div>• Potencia disipada: {result.powerDissipated} W</div>
                      <div>• Refrigeración necesaria: {result.coolingRequired}</div>
                      <div>• Margen potencia: {result.powerSafetyMargin} %</div>
                    </div>
                  </div>
                </>
              )}

              {inputs.calculationType === 'circuit-design' && (
                <>
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <div className="text-sm text-blue-600 font-medium">Resistencia Nominal</div>
                    <div className="text-2xl font-bold text-blue-900">{result.nominalResistance} Ω</div>
                  </div>

                  <div className="bg-green-50 p-4 rounded-lg">
                    <div className="text-sm text-green-600 font-medium">Corriente Zener (Peor Caso)</div>
                    <div className="text-xl font-bold text-green-900">
                      {result.minZenerCurrentWorstCase} - {result.maxZenerCurrentWorstCase} mA
                    </div>
                  </div>

                  <div className="bg-purple-50 p-4 rounded-lg">
                    <div className="text-sm text-purple-600 font-medium">Atenuación Rizado</div>
                    <div className="text-xl font-bold text-purple-900">{result.rippleAttenuation} %</div>
                  </div>

                  <div className="bg-orange-50 p-4 rounded-lg">
                    <div className="text-sm text-orange-600 font-medium">Rizado Salida</div>
                    <div className="text-xl font-bold text-orange-900">{result.outputRipple} mV</div>
                  </div>

                  <div className={`p-4 rounded-lg border-2 ${
                    result.designMarginOk ? 'bg-green-100 border-green-300' : 'bg-red-100 border-red-300'
                  }`}>
                    <div className={`text-sm font-medium ${
                      result.designMarginOk ? 'text-green-700' : 'text-red-700'
                    }`}>
                      Márgenes de Diseño: {result.designMarginOk ? 'ADECUADOS' : 'INSUFICIENTES'}
                    </div>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="text-sm text-gray-600 font-medium mb-2">Recomendaciones</div>
                    <div className="text-xs text-gray-600 space-y-1">
                      <div>• Iz mínima: {result.recommendedMinZenerCurrent} mA</div>
                      <div>• Potencia recomendada: {result.recommendedMaxPower} W</div>
                      <div>• Corriente total: {result.worstCaseMaxCurrent} mA (max)</div>
                    </div>
                  </div>
                </>
              )}
            </>
          ) : (
            <div className="text-center py-12 text-gray-500">
              Completa los datos y haz clic en "Calcular"
            </div>
          )}
        </div>
      </div>

      {/* Additional Information */}
      <div className="mt-8 bg-gray-50 p-4 rounded-lg">
        <h3 className="text-sm font-medium text-gray-900 mb-2">Información Técnica:</h3>
        <div className="text-xs text-gray-600 space-y-1">
          <div><strong>Reguladores Zener:</strong> Simple pero ineficiente, adecuado para bajas corrientes</div>
          <div><strong>Corriente mínima:</strong> Necesaria para mantener regulación, típicamente 1-10mA</div>
          <div><strong>Coeficiente temperatura:</strong> Positivo para Vz mayor 5V, negativo para Vz menor 5V</div>
          <div><strong>Disipación térmica:</strong> Factor crítico en el diseño, considerar derating</div>
        </div>
      </div>
    </div>
  );
};

export default ZenerDiodeCalc;
