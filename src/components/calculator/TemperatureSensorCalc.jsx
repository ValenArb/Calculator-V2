import { useState } from 'react';

const TemperatureSensorCalc = () => {
  const [inputs, setInputs] = useState({
    sensorType: 'rtd',
    // RTD Parameters
    rtdType: 'pt100',
    referenceTemp: 0, // °C
    targetTemp: 100, // °C
    cableResistance: 0.5, // Ω
    wireConfiguration: '4-wire',
    // Thermocouple Parameters
    thermocoupleType: 'K',
    coldJunctionTemp: 25, // °C
    hotJunctionTemp: 100, // °C
    compensationMethod: 'cold-junction',
    // Thermistor Parameters
    thermistorType: 'ntc',
    nominalResistance: 10000, // Ω at 25°C
    betaValue: 3950, // K
    referenceTemp25: 25, // °C
    measuredResistance: 8312 // Ω
  });
  
  const [result, setResult] = useState(null);

  // RTD coefficients (Callendar-Van Dusen equation)
  const rtdCoefficients = {
    'pt100': { R0: 100, alpha: 0.00385, A: 3.9083e-3, B: -5.775e-7, C: -4.183e-12 },
    'pt1000': { R0: 1000, alpha: 0.00385, A: 3.9083e-3, B: -5.775e-7, C: -4.183e-12 },
    'ni100': { R0: 100, alpha: 0.00672, A: 5.485e-3, B: 6.65e-6, C: 0 },
    'ni1000': { R0: 1000, alpha: 0.00672, A: 5.485e-3, B: 6.65e-6, C: 0 }
  };

  // Thermocouple voltage coefficients (K-type example, simplified)
  const thermocoupleCoefficients = {
    'K': {
      // Voltage to temperature conversion (µV to °C)
      c0: 0, c1: 2.508355e-2, c2: 7.860106e-8, c3: -2.503131e-10,
      c4: 8.315270e-14, c5: -1.228034e-17, c6: 9.804036e-22, c7: -4.413030e-26,
      c8: 1.057734e-30, c9: -1.052755e-35,
      // Temperature to voltage conversion (°C to µV)
      a0: -0.176004136860e-1, a1: 0.389212049750e-1, a2: 0.185587700320e-4,
      a3: -0.994575928740e-7, a4: 0.318409457190e-9, a5: -0.560728448890e-12,
      a6: 0.560750590590e-15, a7: -0.320207200030e-18, a8: 0.971511471520e-22,
      a9: -0.121047212750e-25
    },
    'J': {
      c0: 0, c1: 1.978425e-2, c2: -2.001204e-7, c3: 1.036969e-11,
      c4: -2.549687e-16, c5: 3.585153e-21, c6: -5.344285e-26, c7: 5.099890e-31,
      a0: 0.000000e0, a1: 5.038118781e-2, a2: 3.047583693e-5, a3: -8.568106572e-8,
      a4: 1.322819529e-10, a5: -1.705295833e-13, a6: 2.094809069e-16,
      a7: -1.253839533e-19, a8: 1.563728485e-23
    },
    'T': {
      c0: 0, c1: 2.592800e-2, c2: -7.602961e-7, c3: 4.637791e-11,
      c4: -2.165394e-15, c5: 6.048144e-20, c6: -7.293422e-25,
      a0: 0.000000e0, a1: 3.874810636e-2, a2: 4.419443434e-5, a3: -2.786550697e-7,
      a4: 2.041133025e-9, a5: -1.881298945e-12, a6: 9.690625687e-16,
      a7: -2.341181560e-19, a8: 2.146516682e-23
    }
  };

  const calculate = () => {
    const { sensorType } = inputs;
    let results = {};

    if (sensorType === 'rtd') {
      const { rtdType, referenceTemp, targetTemp, cableResistance, wireConfiguration } = inputs;
      const coeff = rtdCoefficients[rtdType];
      
      // Calculate resistance at target temperature using Callendar-Van Dusen equation
      let targetResistance;
      if (targetTemp >= 0) {
        targetResistance = coeff.R0 * (1 + coeff.A * targetTemp + coeff.B * Math.pow(targetTemp, 2));
      } else {
        targetResistance = coeff.R0 * (1 + coeff.A * targetTemp + coeff.B * Math.pow(targetTemp, 2) + 
                                      coeff.C * (targetTemp - 100) * Math.pow(targetTemp, 3));
      }

      // Calculate resistance at reference temperature
      let referenceResistance;
      if (referenceTemp >= 0) {
        referenceResistance = coeff.R0 * (1 + coeff.A * referenceTemp + coeff.B * Math.pow(referenceTemp, 2));
      } else {
        referenceResistance = coeff.R0 * (1 + coeff.A * referenceTemp + coeff.B * Math.pow(referenceTemp, 2) + 
                                         coeff.C * (referenceTemp - 100) * Math.pow(referenceTemp, 3));
      }

      // Calculate temperature coefficient
      const tempCoeff = (targetResistance - referenceResistance) / (referenceResistance * (targetTemp - referenceTemp));

      // Wire configuration error analysis
      let wireError = 0;
      switch (wireConfiguration) {
        case '2-wire':
          wireError = 2 * cableResistance; // Lead resistance adds directly
          break;
        case '3-wire':
          wireError = cableResistance * 0.1; // Assuming good balance
          break;
        case '4-wire':
          wireError = 0; // No lead resistance error
          break;
      }

      const temperatureError = wireError / (coeff.R0 * coeff.alpha);

      results = {
        targetResistance: targetResistance.toFixed(3),
        referenceResistance: referenceResistance.toFixed(3),
        resistanceChange: (targetResistance - referenceResistance).toFixed(3),
        tempCoeff: (tempCoeff * 1000).toFixed(6), // ppm/°C
        wireError: wireError.toFixed(3),
        temperatureError: temperatureError.toFixed(2),
        sensitivity: (coeff.alpha * coeff.R0).toFixed(6) // Ω/°C
      };

    } else if (sensorType === 'thermocouple') {
      const { thermocoupleType, coldJunctionTemp, hotJunctionTemp } = inputs;
      const coeff = thermocoupleCoefficients[thermocoupleType];

      // Calculate voltage at hot junction
      const hotVoltage = coeff.a0 + coeff.a1 * hotJunctionTemp + coeff.a2 * Math.pow(hotJunctionTemp, 2) +
                        coeff.a3 * Math.pow(hotJunctionTemp, 3) + coeff.a4 * Math.pow(hotJunctionTemp, 4) +
                        coeff.a5 * Math.pow(hotJunctionTemp, 5) + coeff.a6 * Math.pow(hotJunctionTemp, 6) +
                        coeff.a7 * Math.pow(hotJunctionTemp, 7) + coeff.a8 * Math.pow(hotJunctionTemp, 8);

      // Calculate voltage at cold junction
      const coldVoltage = coeff.a0 + coeff.a1 * coldJunctionTemp + coeff.a2 * Math.pow(coldJunctionTemp, 2) +
                         coeff.a3 * Math.pow(coldJunctionTemp, 3) + coeff.a4 * Math.pow(coldJunctionTemp, 4) +
                         coeff.a5 * Math.pow(coldJunctionTemp, 5) + coeff.a6 * Math.pow(coldJunctionTemp, 6) +
                         coeff.a7 * Math.pow(coldJunctionTemp, 7) + coeff.a8 * Math.pow(coldJunctionTemp, 8);

      // Net thermocouple voltage (mV)
      const netVoltage = (hotVoltage - coldVoltage) / 1000; // Convert µV to mV

      // Calculate sensitivity at hot junction temperature (µV/°C)
      const sensitivity = coeff.a1 + 2 * coeff.a2 * hotJunctionTemp + 3 * coeff.a3 * Math.pow(hotJunctionTemp, 2) +
                         4 * coeff.a4 * Math.pow(hotJunctionTemp, 3) + 5 * coeff.a5 * Math.pow(hotJunctionTemp, 4);

      // Temperature measurement from voltage (simplified inverse calculation)
      const measuredTemp = coldJunctionTemp + (netVoltage * 1000) / sensitivity;

      results = {
        hotVoltage: (hotVoltage / 1000).toFixed(3), // mV
        coldVoltage: (coldVoltage / 1000).toFixed(3), // mV
        netVoltage: netVoltage.toFixed(3), // mV
        sensitivity: sensitivity.toFixed(2), // µV/°C
        measuredTemp: measuredTemp.toFixed(1), // °C
        tempDifference: (hotJunctionTemp - coldJunctionTemp).toFixed(1),
        voltagePerDegree: (netVoltage / (hotJunctionTemp - coldJunctionTemp)).toFixed(4) // mV/°C
      };

    } else if (sensorType === 'thermistor') {
      const { thermistorType, nominalResistance, betaValue, referenceTemp25, measuredResistance } = inputs;
      
      // Steinhart-Hart equation parameters (simplified Beta model)
      const T0 = referenceTemp25 + 273.15; // Convert to Kelvin
      const R0 = nominalResistance;
      const R = measuredResistance;
      const Beta = betaValue;

      // Calculate temperature from resistance using Beta equation
      // 1/T = 1/T0 + (1/B) * ln(R/R0)
      const tempKelvin = 1 / ((1 / T0) + (1 / Beta) * Math.log(R / R0));
      const tempCelsius = tempKelvin - 273.15;

      // Calculate resistance at a given temperature
      const targetTemp = 50; // Example target temperature
      const targetTempK = targetTemp + 273.15;
      const targetResistance = R0 * Math.exp(Beta * ((1 / targetTempK) - (1 / T0)));

      // Calculate sensitivity (dR/dT) at measured temperature
      const sensitivity = -Beta * R / Math.pow(tempKelvin, 2);

      // Calculate temperature coefficient
      const tempCoeff = sensitivity / R; // 1/°C

      results = {
        measuredTemp: tempCelsius.toFixed(1),
        measuredTempK: tempKelvin.toFixed(1),
        targetResistance: targetResistance.toFixed(0),
        sensitivity: Math.abs(sensitivity).toFixed(1), // Ω/°C (magnitude)
        tempCoeff: (tempCoeff * 1000).toFixed(2), // ppm/°C
        resistanceRatio: (R / R0).toFixed(3),
        betaCalculated: betaValue, // Input value
        thermistorType: thermistorType.toUpperCase()
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
          {inputs.sensorType === 'rtd' && (
            <>
              <div>R(T) = R₀[1 + AT + BT²] (T ≥ 0°C)</div>
              <div>R(T) = R₀[1 + AT + BT² + C(T-100)T³] (T &lt; 0°C)</div>
              <div>Callendar-Van Dusen para RTD</div>
            </>
          )}
          {inputs.sensorType === 'thermocouple' && (
            <>
              <div>V = Σ aₙTⁿ (Polinomio termopar)</div>
              <div>V<sub>net</sub> = V<sub>hot</sub> - V<sub>cold</sub></div>
              <div>Compensación junta fría requerida</div>
            </>
          )}
          {inputs.sensorType === 'thermistor' && (
            <>
              <div>1/T = 1/T₀ + (1/B)ln(R/R₀) (Ecuación Beta)</div>
              <div>R(T) = R₀e^(B(1/T - 1/T₀)) (Resistencia vs Temperatura)</div>
              <div>Steinhart-Hart para termistores</div>
            </>
          )}
        </div>
      </div>

      <h2 className="text-xl font-semibold mb-6">Cálculo de Sensores de Temperatura</h2>
      
      <div className="grid md:grid-cols-2 gap-6">
        {/* Inputs */}
        <div className="space-y-4">
          {/* Sensor Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tipo de Sensor
            </label>
            <div className="space-y-2">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="sensorType"
                  value="rtd"
                  checked={inputs.sensorType === 'rtd'}
                  onChange={(e) => handleInputChange('sensorType', e.target.value)}
                  className="mr-2"
                />
                <span>• RTD (Pt100, Pt1000, Ni)</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="sensorType"
                  value="thermocouple"
                  checked={inputs.sensorType === 'thermocouple'}
                  onChange={(e) => handleInputChange('sensorType', e.target.value)}
                  className="mr-2"
                />
                <span>• Termopar (K, J, T, etc.)</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="sensorType"
                  value="thermistor"
                  checked={inputs.sensorType === 'thermistor'}
                  onChange={(e) => handleInputChange('sensorType', e.target.value)}
                  className="mr-2"
                />
                <span>• Termistor (NTC/PTC)</span>
              </label>
            </div>
          </div>

          {inputs.sensorType === 'rtd' && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tipo de RTD
                </label>
                <select
                  value={inputs.rtdType}
                  onChange={(e) => handleInputChange('rtdType', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="pt100">Pt100 (100Ω @ 0°C)</option>
                  <option value="pt1000">Pt1000 (1000Ω @ 0°C)</option>
                  <option value="ni100">Ni100 (100Ω @ 0°C)</option>
                  <option value="ni1000">Ni1000 (1000Ω @ 0°C)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Temperatura de Referencia (°C)
                </label>
                <input
                  type="number"
                  value={inputs.referenceTemp}
                  onChange={(e) => handleInputChange('referenceTemp', parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Temperatura Objetivo (°C)
                </label>
                <input
                  type="number"
                  value={inputs.targetTemp}
                  onChange={(e) => handleInputChange('targetTemp', parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Configuración de Cables
                </label>
                <select
                  value={inputs.wireConfiguration}
                  onChange={(e) => handleInputChange('wireConfiguration', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="2-wire">2 Hilos (menor precisión)</option>
                  <option value="3-wire">3 Hilos (compensación parcial)</option>
                  <option value="4-wire">4 Hilos (máxima precisión)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Resistencia del Cable (Ω)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={inputs.cableResistance}
                  onChange={(e) => handleInputChange('cableResistance', parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </>
          )}

          {inputs.sensorType === 'thermocouple' && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tipo de Termopar
                </label>
                <select
                  value={inputs.thermocoupleType}
                  onChange={(e) => handleInputChange('thermocoupleType', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="K">Tipo K (Chromel-Alumel, -200 a 1260°C)</option>
                  <option value="J">Tipo J (Hierro-Constantan, 0 a 760°C)</option>
                  <option value="T">Tipo T (Cobre-Constantan, -200 a 370°C)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Temperatura Junta Fría (°C)
                </label>
                <input
                  type="number"
                  value={inputs.coldJunctionTemp}
                  onChange={(e) => handleInputChange('coldJunctionTemp', parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Temperatura Junta Caliente (°C)
                </label>
                <input
                  type="number"
                  value={inputs.hotJunctionTemp}
                  onChange={(e) => handleInputChange('hotJunctionTemp', parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Método de Compensación
                </label>
                <select
                  value={inputs.compensationMethod}
                  onChange={(e) => handleInputChange('compensationMethod', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="cold-junction">Compensación Junta Fría</option>
                  <option value="ice-bath">Baño de Hielo (0°C)</option>
                  <option value="electronic">Compensación Electrónica</option>
                </select>
              </div>
            </>
          )}

          {inputs.sensorType === 'thermistor' && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tipo de Termistor
                </label>
                <select
                  value={inputs.thermistorType}
                  onChange={(e) => handleInputChange('thermistorType', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="ntc">NTC (Coeficiente Negativo)</option>
                  <option value="ptc">PTC (Coeficiente Positivo)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Resistencia Nominal @ 25°C (Ω)
                </label>
                <input
                  type="number"
                  value={inputs.nominalResistance}
                  onChange={(e) => handleInputChange('nominalResistance', parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Valor Beta (K)
                </label>
                <input
                  type="number"
                  value={inputs.betaValue}
                  onChange={(e) => handleInputChange('betaValue', parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <div className="text-xs text-gray-600 mt-1">
                  Típico: 3000-4000K para NTC
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Resistencia Medida (Ω)
                </label>
                <input
                  type="number"
                  value={inputs.measuredResistance}
                  onChange={(e) => handleInputChange('measuredResistance', parseFloat(e.target.value) || 0)}
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
              {inputs.sensorType === 'rtd' && (
                <>
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <div className="text-sm text-blue-600 font-medium">Resistencia a Temp. Objetivo</div>
                    <div className="text-2xl font-bold text-blue-900">{result.targetResistance} Ω</div>
                  </div>

                  <div className="bg-green-50 p-4 rounded-lg">
                    <div className="text-sm text-green-600 font-medium">Resistencia de Referencia</div>
                    <div className="text-2xl font-bold text-green-900">{result.referenceResistance} Ω</div>
                  </div>

                  <div className="bg-purple-50 p-4 rounded-lg">
                    <div className="text-sm text-purple-600 font-medium">Cambio de Resistencia</div>
                    <div className="text-xl font-bold text-purple-900">{result.resistanceChange} Ω</div>
                  </div>

                  <div className="bg-orange-50 p-4 rounded-lg">
                    <div className="text-sm text-orange-600 font-medium">Sensibilidad</div>
                    <div className="text-xl font-bold text-orange-900">{result.sensitivity} Ω/°C</div>
                  </div>

                  <div className="bg-red-50 p-4 rounded-lg">
                    <div className="text-sm text-red-600 font-medium">Error por Cables</div>
                    <div className="text-xl font-bold text-red-900">{result.wireError} Ω</div>
                    <div className="text-sm text-red-600">({result.temperatureError}°C)</div>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="text-sm text-gray-600 font-medium mb-2">Información Adicional</div>
                    <div className="text-xs text-gray-600 space-y-1">
                      <div>• Coef. temperatura: {result.tempCoeff} ppm/°C</div>
                      <div>• Configuración: {inputs.wireConfiguration}</div>
                      <div>• Tipo RTD: {inputs.rtdType.toUpperCase()}</div>
                    </div>
                  </div>
                </>
              )}

              {inputs.sensorType === 'thermocouple' && (
                <>
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <div className="text-sm text-blue-600 font-medium">Voltaje Neto</div>
                    <div className="text-2xl font-bold text-blue-900">{result.netVoltage} mV</div>
                  </div>

                  <div className="bg-green-50 p-4 rounded-lg">
                    <div className="text-sm text-green-600 font-medium">Voltaje Junta Caliente</div>
                    <div className="text-xl font-bold text-green-900">{result.hotVoltage} mV</div>
                  </div>

                  <div className="bg-purple-50 p-4 rounded-lg">
                    <div className="text-sm text-purple-600 font-medium">Voltaje Junta Fría</div>
                    <div className="text-xl font-bold text-purple-900">{result.coldVoltage} mV</div>
                  </div>

                  <div className="bg-orange-50 p-4 rounded-lg">
                    <div className="text-sm text-orange-600 font-medium">Sensibilidad</div>
                    <div className="text-xl font-bold text-orange-900">{result.sensitivity} µV/°C</div>
                  </div>

                  <div className="bg-yellow-50 p-4 rounded-lg">
                    <div className="text-sm text-yellow-600 font-medium">Voltaje por Grado</div>
                    <div className="text-xl font-bold text-yellow-900">{result.voltagePerDegree} mV/°C</div>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="text-sm text-gray-600 font-medium mb-2">Información Adicional</div>
                    <div className="text-xs text-gray-600 space-y-1">
                      <div>• Tipo: {inputs.thermocoupleType}</div>
                      <div>• ΔT: {result.tempDifference}°C</div>
                      <div>• Temp. medida: {result.measuredTemp}°C</div>
                    </div>
                  </div>
                </>
              )}

              {inputs.sensorType === 'thermistor' && (
                <>
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <div className="text-sm text-blue-600 font-medium">Temperatura Medida</div>
                    <div className="text-2xl font-bold text-blue-900">{result.measuredTemp} °C</div>
                  </div>

                  <div className="bg-green-50 p-4 rounded-lg">
                    <div className="text-sm text-green-600 font-medium">Temperatura (Kelvin)</div>
                    <div className="text-xl font-bold text-green-900">{result.measuredTempK} K</div>
                  </div>

                  <div className="bg-purple-50 p-4 rounded-lg">
                    <div className="text-sm text-purple-600 font-medium">Resistencia a 50°C</div>
                    <div className="text-xl font-bold text-purple-900">{result.targetResistance} Ω</div>
                  </div>

                  <div className="bg-orange-50 p-4 rounded-lg">
                    <div className="text-sm text-orange-600 font-medium">Sensibilidad</div>
                    <div className="text-xl font-bold text-orange-900">{result.sensitivity} Ω/°C</div>
                  </div>

                  <div className="bg-yellow-50 p-4 rounded-lg">
                    <div className="text-sm text-yellow-600 font-medium">Coef. Temperatura</div>
                    <div className="text-xl font-bold text-yellow-900">{result.tempCoeff} ppm/°C</div>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="text-sm text-gray-600 font-medium mb-2">Información Adicional</div>
                    <div className="text-xs text-gray-600 space-y-1">
                      <div>• Tipo: {result.thermistorType}</div>
                      <div>• Relación R/R₀: {result.resistanceRatio}</div>
                      <div>• Valor Beta: {result.betaCalculated} K</div>
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
          <div><strong>RTD:</strong> Detectores de temperatura resistivos, alta precisión y estabilidad</div>
          <div><strong>Termopares:</strong> Sensores de voltaje termoeléctrico, amplio rango de temperatura</div>
          <div><strong>Termistores:</strong> Alta sensibilidad, no lineal, ideales para control de temperatura</div>
          <div><strong>Configuración 4-hilos:</strong> Elimina errores por resistencia de cables en RTD</div>
        </div>
      </div>
    </div>
  );
};

export default TemperatureSensorCalc;
