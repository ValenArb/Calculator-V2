import { useState } from 'react';

const TemperatureSensorAdvancedCalc = () => {
  const [inputs, setInputs] = useState({
    sensorType: 'pt_ni_cu',
    calculateType: 'resistance',
    ptType: 'PT100',
    resistanceAt0: 100,
    temperature: 25,
    temperatureUnit: 'C',
    ntcResistance: 10000,
    ntcResistanceUnit: 'Ω',
    ntcReferenceTemp: 25,
    ntcReferenceTempUnit: 'C',
    betaCoefficient: 3950,
    thermocoupleType: 'B',
    thermocoupleTemp: 100,
    thermocoupleTempUnit: 'C'
  });

  const [result, setResult] = useState(null);

  // Coeficientes de temperatura para diferentes tipos de RTD
  const rtdCoefficients = {
    'PT100': { alpha: 0.003851, beta: -5.775e-7, gamma: -4.183e-12 },
    'PT1000': { alpha: 0.003851, beta: -5.775e-7, gamma: -4.183e-12 },
    'NI120': { alpha: 0.006180, beta: 0, gamma: 0 },
    'CU10': { alpha: 0.004280, beta: 0, gamma: 0 }
  };

  // Coeficientes para termopares (aproximaciones polinómicas simplificadas)
  const thermocoupleCoefficients = {
    'B': { a0: 0, a1: -2.4650818346e-4, a2: 5.9040421171e-6, range: [250, 1820] },
    'E': { a0: 0, a1: 5.8665508708e-5, a2: 4.5410977124e-8, range: [-50, 740] },
    'J': { a0: 0, a1: 5.0381187815e-5, a2: 3.0475836930e-8, range: [-40, 750] },
    'K': { a0: 0, a1: 4.0514854653e-5, a2: 2.5859684268e-8, range: [-40, 1000] },
    'N': { a0: 0, a1: 3.8436847686e-5, a2: 1.1010485271e-8, range: [-40, 900] },
    'R': { a0: 0, a1: 5.2891801407e-6, a2: 1.3220945893e-8, range: [-50, 1480] },
    'S': { a0: 0, a1: 5.4037278819e-6, a2: 1.2593428974e-8, range: [-50, 1480] },
    'T': { a0: 0, a1: 4.0716564598e-5, a2: 7.1170297000e-8, range: [-40, 350] }
  };

  const calculate = () => {
    const { sensorType, calculateType, ptType, resistanceAt0, temperature, temperatureUnit,
            ntcResistance, ntcResistanceUnit, ntcReferenceTemp, ntcReferenceTempUnit, betaCoefficient,
            thermocoupleType, thermocoupleTemp, thermocoupleTempUnit } = inputs;

    // Convertir temperatura a Celsius
    const tempConversions = { 'C': (t) => t, 'F': (t) => (t - 32) * 5/9, 'K': (t) => t - 273.15 };
    const tempCelsius = tempConversions[temperatureUnit](temperature);
    const ntcRefTempC = tempConversions[ntcReferenceTempUnit](ntcReferenceTemp);
    const thermocoupleTempC = tempConversions[thermocoupleTempUnit](thermocoupleTemp);

    let mainResult = 0;
    let calculationDescription = '';
    let additionalResults = {};

    switch (sensorType) {
      case 'pt_ni_cu':
        const coeffs = rtdCoefficients[ptType];
        
        if (calculateType === 'resistance') {
          // Calcular resistencia a partir de temperatura
          if (tempCelsius >= 0) {
            // Callendar-Van Dusen para T >= 0°C
            mainResult = resistanceAt0 * (1 + coeffs.alpha * tempCelsius + coeffs.beta * Math.pow(tempCelsius, 2));
          } else {
            // Callendar-Van Dusen para T < 0°C (incluye gamma)
            mainResult = resistanceAt0 * (1 + coeffs.alpha * tempCelsius + coeffs.beta * Math.pow(tempCelsius, 2) + 
                        coeffs.gamma * Math.pow(tempCelsius, 3) * (tempCelsius - 100));
          }
          calculationDescription = `Resistencia de ${ptType} a ${tempCelsius.toFixed(1)}°C`;
          
          // Cálculos adicionales
          additionalResults = {
            temperatureCoefficient: (coeffs.alpha * 1000).toFixed(3), // ppm/°C
            accuracyClass: ptType.includes('PT') ? 'Clase A: ±(0.15 + 0.002|t|)°C' : 'Estándar industrial',
            resistanceAt100: resistanceAt0 * (1 + coeffs.alpha * 100 + coeffs.beta * Math.pow(100, 2))
          };
        } else {
          // Calcular temperatura a partir de resistencia (aproximación iterativa)
          let estimatedTemp = 0;
          let iteration = 0;
          const targetResistance = resistanceAt0; // Usar el valor como resistencia objetivo
          
          // Método de Newton-Raphson simplificado
          for (iteration = 0; iteration < 50; iteration++) {
            let currentResistance, derivative;
            
            if (estimatedTemp >= 0) {
              currentResistance = resistanceAt0 * (1 + coeffs.alpha * estimatedTemp + coeffs.beta * Math.pow(estimatedTemp, 2));
              derivative = resistanceAt0 * (coeffs.alpha + 2 * coeffs.beta * estimatedTemp);
            } else {
              currentResistance = resistanceAt0 * (1 + coeffs.alpha * estimatedTemp + coeffs.beta * Math.pow(estimatedTemp, 2) + 
                                 coeffs.gamma * Math.pow(estimatedTemp, 3) * (estimatedTemp - 100));
              derivative = resistanceAt0 * (coeffs.alpha + 2 * coeffs.beta * estimatedTemp + 
                          coeffs.gamma * (4 * Math.pow(estimatedTemp, 3) - 300 * Math.pow(estimatedTemp, 2)));
            }
            
            const error = currentResistance - targetResistance;
            if (Math.abs(error) < 0.001) break;
            
            estimatedTemp -= error / derivative;
          }
          
          mainResult = estimatedTemp;
          calculationDescription = `Temperatura correspondiente a ${targetResistance.toFixed(2)} Ω`;
          
          additionalResults = {
            iterations: iteration + 1,
            accuracy: Math.abs(targetResistance - resistanceAt0 * (1 + coeffs.alpha * estimatedTemp + coeffs.beta * Math.pow(estimatedTemp, 2))).toFixed(4)
          };
        }
        break;

      case 'ntc':
        // Conversión de unidades de resistencia
        const resistanceConversions = { 'Ω': 1, 'kΩ': 1000, 'MΩ': 1000000 };
        const ntcResistanceOhms = ntcResistance * resistanceConversions[ntcResistanceUnit];
        
        if (calculateType === 'resistance') {
          // Ecuación de Steinhart-Hart simplificada: R = R0 * exp(B * (1/T - 1/T0))
          const tempKelvin = tempCelsius + 273.15;
          const refTempKelvin = ntcRefTempC + 273.15;
          
          mainResult = ntcResistanceOhms * Math.exp(betaCoefficient * (1/tempKelvin - 1/refTempKelvin));
          calculationDescription = `Resistencia NTC a ${tempCelsius.toFixed(1)}°C`;
          
          additionalResults = {
            resistanceRatio: (mainResult / ntcResistanceOhms).toFixed(3),
            temperatureCoefficient: (-betaCoefficient / Math.pow(tempKelvin, 2)).toFixed(0) // ppm/°C
          };
        } else {
          // Calcular temperatura: T = B / (ln(R/R0) + B/T0)
          const refTempKelvin = ntcRefTempC + 273.15;
          const resistanceRatio = ntcResistanceOhms / 10000; // Asumir R objetivo como valor actual
          
          const tempKelvin = betaCoefficient / (Math.log(resistanceRatio) + betaCoefficient/refTempKelvin);
          mainResult = tempKelvin - 273.15;
          calculationDescription = `Temperatura correspondiente a ${ntcResistanceOhms.toFixed(0)} Ω`;
        }
        break;

      case 'thermocouples':
        const tcCoeffs = thermocoupleCoefficients[thermocoupleType];
        
        if (calculateType === 'voltage') {
          // Calcular tensión a partir de temperatura (aproximación polinómica)
          if (thermocoupleTempC >= tcCoeffs.range[0] && thermocoupleTempC <= tcCoeffs.range[1]) {
            mainResult = tcCoeffs.a1 * thermocoupleTempC + tcCoeffs.a2 * Math.pow(thermocoupleTempC, 2);
            mainResult *= 1000; // Convertir a mV
            calculationDescription = `Tensión termopar tipo ${thermocoupleType} a ${thermocoupleTempC.toFixed(1)}°C`;
            
            additionalResults = {
              sensitivity: (tcCoeffs.a1 * 1000).toFixed(1), // µV/°C
              validRange: `${tcCoeffs.range[0]}°C a ${tcCoeffs.range[1]}°C`,
              coldJunctionNeeded: 'Sí (compensación de unión fría requerida)'
            };
          } else {
            mainResult = 0;
            calculationDescription = `Temperatura fuera del rango válido (${tcCoeffs.range[0]}°C a ${tcCoeffs.range[1]}°C)`;
          }
        } else {
          // Calcular temperatura a partir de tensión (aproximación)
          const voltageV = thermocoupleTempC / 1000; // Asumir input en mV, convertir a V
          
          // Aproximación cuadrática inversa
          const discriminant = Math.pow(tcCoeffs.a1, 2) + 4 * tcCoeffs.a2 * voltageV;
          if (discriminant >= 0) {
            mainResult = (-tcCoeffs.a1 + Math.sqrt(discriminant)) / (2 * tcCoeffs.a2);
            calculationDescription = `Temperatura correspondiente a ${thermocoupleTempC.toFixed(2)} mV`;
          } else {
            mainResult = 0;
            calculationDescription = 'Tensión fuera del rango válido';
          }
        }
        break;
    }

    // Análisis y recomendaciones generales
    let analysis = [];
    let recommendations = [];

    switch (sensorType) {
      case 'pt_ni_cu':
        analysis.push('RTD de alta precisión y estabilidad');
        if (ptType.includes('PT')) {
          analysis.push('Sensor de platino - excelente para aplicaciones precisas');
          recommendations.push('Usar configuración de 3 o 4 hilos para mayor precisión');
        }
        recommendations.push('Calibrar periódicamente según aplicación crítica');
        break;

      case 'ntc':
        analysis.push('Alta sensibilidad en rango de temperatura limitado');
        if (Math.abs(tempCelsius - 25) > 50) {
          analysis.push('Fuera del rango óptimo - menor precisión esperada');
        }
        recommendations.push('Considerar linealización para mediciones precisas');
        break;

      case 'thermocouples':
        analysis.push('Amplio rango de temperatura, respuesta rápida');
        analysis.push('Requiere compensación de unión fría');
        recommendations.push('Usar cables de extensión del mismo material');
        recommendations.push('Implementar compensación de unión fría activa');
        break;
    }

    setResult({
      mainResult: mainResult.toFixed(sensorType === 'thermocouples' && calculateType === 'voltage' ? 3 : 2),
      unit: getResultUnit(),
      calculationDescription: calculationDescription,
      additionalResults: additionalResults,
      sensorType: sensorType,
      calculateType: calculateType,
      analysis: analysis,
      recommendations: recommendations
    });
  };

  const getResultUnit = () => {
    const { sensorType, calculateType } = inputs;
    
    if (sensorType === 'pt_ni_cu' || sensorType === 'ntc') {
      return calculateType === 'resistance' ? 'Ω' : '°C';
    } else if (sensorType === 'thermocouples') {
      return calculateType === 'voltage' ? 'mV' : '°C';
    }
    return '';
  };

  const handleInputChange = (field, value) => {
    setInputs(prev => ({ ...prev, [field]: value }));
  };

  const getSensorTypeLabel = (type) => {
    const labels = {
      'pt_ni_cu': 'PT/NI/CU (RTD)',
      'ntc': 'NTC',
      'thermocouples': 'Termopares'
    };
    return labels[type] || type;
  };

  return (
    <div className="p-6">
      <h2 className="text-xl font-semibold mb-6">Temperatura</h2>
      
      <div className="grid md:grid-cols-2 gap-6">
        {/* Inputs */}
        <div className="space-y-4">
          {/* Tipo de sensor */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tipo de sensor
            </label>
            <div className="flex gap-2">
              <button
                onClick={() => handleInputChange('sensorType', 'pt_ni_cu')}
                className={`flex-1 px-3 py-2 text-sm rounded-md transition-colors ${
                  inputs.sensorType === 'pt_ni_cu'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                PT/NI/CU
              </button>
              <button
                onClick={() => handleInputChange('sensorType', 'ntc')}
                className={`flex-1 px-3 py-2 text-sm rounded-md transition-colors ${
                  inputs.sensorType === 'ntc'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                NTC
              </button>
              <button
                onClick={() => handleInputChange('sensorType', 'thermocouples')}
                className={`flex-1 px-3 py-2 text-sm rounded-md transition-colors ${
                  inputs.sensorType === 'thermocouples'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Termopares
              </button>
            </div>
          </div>

          {/* Calcular */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Calcular
            </label>
            <select
              value={inputs.calculateType}
              onChange={(e) => handleInputChange('calculateType', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {inputs.sensorType === 'thermocouples' ? (
                <>
                  <option value="voltage">Tensión</option>
                  <option value="temperature">Temperatura</option>
                </>
              ) : (
                <>
                  <option value="resistance">Resistencia</option>
                  <option value="temperature">Temperatura</option>
                </>
              )}
            </select>
          </div>

          {/* Campos específicos para PT/NI/CU */}
          {inputs.sensorType === 'pt_ni_cu' && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tipo
                </label>
                <select
                  value={inputs.ptType}
                  onChange={(e) => handleInputChange('ptType', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="PT100">PT100</option>
                  <option value="PT1000">PT1000</option>
                  <option value="NI120">NI120</option>
                  <option value="CU10">CU10</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Resistencia a 0°C | 32°F
                </label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    value={inputs.resistanceAt0}
                    onChange={(e) => handleInputChange('resistanceAt0', parseFloat(e.target.value) || 0)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <span className="px-3 py-2 bg-gray-100 border border-gray-300 rounded-md text-gray-700">Ω</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Temperatura
                </label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    value={inputs.temperature}
                    onChange={(e) => handleInputChange('temperature', parseFloat(e.target.value) || 0)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <select
                    value={inputs.temperatureUnit}
                    onChange={(e) => handleInputChange('temperatureUnit', e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="C">°C</option>
                    <option value="F">°F</option>
                    <option value="K">K</option>
                  </select>
                </div>
              </div>
            </>
          )}

          {/* Campos específicos para NTC */}
          {inputs.sensorType === 'ntc' && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Resistencia @ temperatura de referencia
                </label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    value={inputs.ntcResistance}
                    onChange={(e) => handleInputChange('ntcResistance', parseFloat(e.target.value) || 0)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <select
                    value={inputs.ntcResistanceUnit}
                    onChange={(e) => handleInputChange('ntcResistanceUnit', e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="Ω">Ω</option>
                    <option value="kΩ">kΩ</option>
                    <option value="MΩ">MΩ</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Temperatura de referencia
                </label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    value={inputs.ntcReferenceTemp}
                    onChange={(e) => handleInputChange('ntcReferenceTemp', parseFloat(e.target.value) || 0)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <select
                    value={inputs.ntcReferenceTempUnit}
                    onChange={(e) => handleInputChange('ntcReferenceTempUnit', e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="C">°C</option>
                    <option value="F">°F</option>
                    <option value="K">K</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Coeficiente Beta
                </label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    value={inputs.betaCoefficient}
                    onChange={(e) => handleInputChange('betaCoefficient', parseFloat(e.target.value) || 0)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <span className="px-3 py-2 bg-gray-100 border border-gray-300 rounded-md text-gray-700">K</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Temperatura
                </label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    value={inputs.temperature}
                    onChange={(e) => handleInputChange('temperature', parseFloat(e.target.value) || 0)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <select
                    value={inputs.temperatureUnit}
                    onChange={(e) => handleInputChange('temperatureUnit', e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="C">°C</option>
                    <option value="F">°F</option>
                    <option value="K">K</option>
                  </select>
                </div>
              </div>
            </>
          )}

          {/* Campos específicos para Termopares */}
          {inputs.sensorType === 'thermocouples' && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tipo
                </label>
                <select
                  value={inputs.thermocoupleType}
                  onChange={(e) => handleInputChange('thermocoupleType', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="B">B</option>
                  <option value="E">E</option>
                  <option value="J">J</option>
                  <option value="K">K</option>
                  <option value="N">N</option>
                  <option value="R">R</option>
                  <option value="S">S</option>
                  <option value="T">T</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Temperatura
                </label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    value={inputs.thermocoupleTemp}
                    onChange={(e) => handleInputChange('thermocoupleTemp', parseFloat(e.target.value) || 0)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <select
                    value={inputs.thermocoupleTempUnit}
                    onChange={(e) => handleInputChange('thermocoupleTempUnit', e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="C">°C</option>
                    <option value="F">°F</option>
                    <option value="K">K</option>
                  </select>
                </div>
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
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="text-sm text-blue-600 font-medium">Resultado</div>
                <div className="text-2xl font-bold text-blue-900">{result.mainResult} {result.unit}</div>
                <div className="text-xs text-blue-700 mt-1">{result.calculationDescription}</div>
              </div>

              <div className="bg-green-50 p-4 rounded-lg">
                <div className="text-sm text-green-600 font-medium">Sensor utilizado</div>
                <div className="text-lg font-bold text-green-900">{getSensorTypeLabel(result.sensorType)}</div>
                <div className="text-xs text-green-700 mt-1">
                  Cálculo: {result.calculateType === 'resistance' ? 'Resistencia' : 
                           result.calculateType === 'voltage' ? 'Tensión' : 'Temperatura'}
                </div>
              </div>

              {Object.keys(result.additionalResults).length > 0 && (
                <div className="bg-yellow-50 p-4 rounded-lg">
                  <div className="text-sm text-yellow-600 font-medium mb-2">Parámetros adicionales</div>
                  <div className="text-xs text-yellow-700 space-y-1">
                    {Object.entries(result.additionalResults).map(([key, value]) => (
                      <div key={key}>• {key}: {value}</div>
                    ))}
                  </div>
                </div>
              )}

              {result.analysis.length > 0 && (
                <div className="bg-indigo-50 p-4 rounded-lg">
                  <div className="text-sm text-indigo-600 font-medium mb-2">Análisis del sensor</div>
                  <ul className="text-xs text-indigo-700 space-y-1">
                    {result.analysis.map((item, index) => (
                      <li key={index}>• {item}</li>
                    ))}
                  </ul>
                </div>
              )}

              {result.recommendations.length > 0 && (
                <div className="bg-red-50 p-4 rounded-lg">
                  <div className="text-sm text-red-600 font-medium mb-2">Recomendaciones</div>
                  <ul className="text-xs text-red-700 space-y-1">
                    {result.recommendations.map((rec, index) => (
                      <li key={index}>• {rec}</li>
                    ))}
                  </ul>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-12 text-gray-500">
              Completa los datos y haz clic en "Calcular"
            </div>
          )}
        </div>
      </div>

      {/* Fórmulas utilizadas */}
      <div className="mt-8 bg-blue-50 p-4 rounded-lg border-l-4 border-blue-500">
        <h3 className="text-lg font-semibold text-blue-900 mb-2">Fórmulas utilizadas</h3>
        <div className="text-blue-800 font-mono space-y-2 text-sm">
          <div><strong>RTD Callendar-Van Dusen:</strong> R(T) = R₀(1 + αT + βT² + γT³(T-100))</div>
          <div><strong>NTC Steinhart-Hart:</strong> R = R₀ × exp(B(1/T - 1/T₀))</div>
          <div><strong>Termopar (aproximación):</strong> V = a₁T + a₂T²</div>
          <div><strong>Coeficiente de temperatura:</strong> TCR = (1/R)(dR/dT)</div>
          <div className="text-xs text-blue-700 mt-2">
            <strong>Donde:</strong> R = resistencia (Ω), T = temperatura (°C), R₀ = resistencia referencia, 
            α,β,γ = coeficientes, B = coeficiente beta (K), V = tensión (V)
          </div>
          <div className="text-xs text-blue-700">
            <strong>PT100:</strong> α = 3.851×10⁻³/°C, β = -5.775×10⁻⁷/°C², γ = -4.183×10⁻¹²/°C⁴
          </div>
        </div>
      </div>
    </div>
  );
};

export default TemperatureSensorAdvancedCalc;