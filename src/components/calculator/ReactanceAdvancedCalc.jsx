import { useState } from 'react';

const ReactanceAdvancedCalc = () => {
  const [inputs, setInputs] = useState({
    calculationType: 'inductive_reactance',
    frequency: 50,
    frequencyUnit: 'Hz',
    inductance: 10,
    inductanceUnit: 'mH',
    capacitance: 100,
    capacitanceUnit: 'µF'
  });

  const [result, setResult] = useState(null);

  const calculate = () => {
    const { calculationType, frequency, frequencyUnit, inductance, inductanceUnit, 
            capacitance, capacitanceUnit } = inputs;

    // Conversiones de unidades a unidades base
    const frequencyConversions = { 'Hz': 1, 'kHz': 1000, 'MHz': 1000000 };
    const inductanceConversions = { 'µH': 1e-6, 'mH': 1e-3, 'H': 1 };
    const capacitanceConversions = { 'pF': 1e-12, 'nF': 1e-9, 'µF': 1e-6, 'mF': 1e-3 };

    // Convertir a unidades base
    const frequencyInHz = frequency * frequencyConversions[frequencyUnit];
    const inductanceInH = inductance * inductanceConversions[inductanceUnit];
    const capacitanceInF = capacitance * capacitanceConversions[capacitanceUnit];

    let mainResult = 0;
    let formula = '';
    let resultUnit = '';
    let additionalCalculations = {};

    switch (calculationType) {
      case 'inductive_reactance':
        // X_L = 2πfL
        mainResult = 2 * Math.PI * frequencyInHz * inductanceInH;
        formula = 'X_L = 2πfL';
        resultUnit = 'Ω';
        
        // Cálculos adicionales
        additionalCalculations = {
          capacitiveReactance: 1 / (2 * Math.PI * frequencyInHz * capacitanceInF),
          resonanceFrequency: 1 / (2 * Math.PI * Math.sqrt(inductanceInH * capacitanceInF)),
          impedance: Math.sqrt(Math.pow(mainResult - (1 / (2 * Math.PI * frequencyInHz * capacitanceInF)), 2)),
          phaseAngle: 90 // Inductancia pura
        };
        break;

      case 'capacitive_reactance':
        // X_C = 1/(2πfC)
        mainResult = 1 / (2 * Math.PI * frequencyInHz * capacitanceInF);
        formula = 'X_C = 1/(2πfC)';
        resultUnit = 'Ω';
        
        // Cálculos adicionales
        additionalCalculations = {
          inductiveReactance: 2 * Math.PI * frequencyInHz * inductanceInH,
          resonanceFrequency: 1 / (2 * Math.PI * Math.sqrt(inductanceInH * capacitanceInF)),
          impedance: Math.sqrt(Math.pow((2 * Math.PI * frequencyInHz * inductanceInH) - mainResult, 2)),
          phaseAngle: -90 // Capacitancia pura
        };
        break;

      case 'inductance':
        // L = X_L/(2πf) - Necesitamos X_L, usaremos un valor de referencia
        const targetReactance = 100; // Ω de referencia
        mainResult = targetReactance / (2 * Math.PI * frequencyInHz);
        formula = 'L = X_L/(2πf)';
        resultUnit = 'H';
        
        additionalCalculations = {
          targetReactance: targetReactance,
          reactanceAtFrequency: 2 * Math.PI * frequencyInHz * mainResult,
          timeConstant: mainResult / 1, // Asumiendo R = 1Ω
          energyStored: 0.5 * mainResult * Math.pow(1, 2) // I = 1A asumido
        };
        break;

      case 'capacitance':
        // C = 1/(2πfX_C) - Necesitamos X_C, usaremos un valor de referencia
        const targetCapReactance = 100; // Ω de referencia
        mainResult = 1 / (2 * Math.PI * frequencyInHz * targetCapReactance);
        formula = 'C = 1/(2πfX_C)';
        resultUnit = 'F';
        
        additionalCalculations = {
          targetReactance: targetCapReactance,
          reactanceAtFrequency: 1 / (2 * Math.PI * frequencyInHz * mainResult),
          timeConstant: 1 * mainResult, // Asumiendo R = 1Ω
          energyStored: 0.5 * mainResult * Math.pow(100, 2) // V = 100V asumido
        };
        break;

      case 'frequency':
        // Para encontrar frecuencia de resonancia: f = 1/(2π√LC)
        mainResult = 1 / (2 * Math.PI * Math.sqrt(inductanceInH * capacitanceInF));
        formula = 'f₀ = 1/(2π√LC)';
        resultUnit = 'Hz';
        
        additionalCalculations = {
          period: 1 / mainResult,
          angularFrequency: 2 * Math.PI * mainResult,
          inductiveReactance: 2 * Math.PI * mainResult * inductanceInH,
          capacitiveReactance: 1 / (2 * Math.PI * mainResult * capacitanceInF)
        };
        break;

      default:
        mainResult = 0;
    }

    // Análisis del resultado
    let analysis = [];
    let recommendations = [];

    if (calculationType === 'inductive_reactance' || calculationType === 'capacitive_reactance') {
      if (mainResult < 1) {
        analysis.push('Reactancia muy baja - comportamiento casi resistivo');
      } else if (mainResult < 100) {
        analysis.push('Reactancia baja a moderada');
      } else if (mainResult < 1000) {
        analysis.push('Reactancia alta - efecto reactivo significativo');
      } else {
        analysis.push('Reactancia muy alta - comportamiento predominantemente reactivo');
      }

      // Comparar con la resonancia
      if (Math.abs(additionalCalculations.inductiveReactance - additionalCalculations.capacitiveReactance) < 0.1 * Math.max(additionalCalculations.inductiveReactance, additionalCalculations.capacitiveReactance)) {
        analysis.push('Cerca de la frecuencia de resonancia');
        recommendations.push('Considerar efectos de resonancia en el diseño');
      }
    }

    if (calculationType === 'frequency') {
      if (mainResult < 20) {
        analysis.push('Frecuencia muy baja - aplicaciones de potencia');
      } else if (mainResult < 20000) {
        analysis.push('Rango de audiofrecuencia');
      } else if (mainResult < 30000000) {
        analysis.push('Rango de radiofrecuencia');
      } else {
        analysis.push('Rango de microondas');
      }
    }

    // Determinar mejor formato para el resultado principal
    let displayResult = '';
    let displayUnit = '';

    if (resultUnit === 'Ω') {
      if (mainResult < 1) {
        displayResult = (mainResult * 1000).toFixed(2);
        displayUnit = 'mΩ';
      } else if (mainResult < 1000) {
        displayResult = mainResult.toFixed(2);
        displayUnit = 'Ω';
      } else if (mainResult < 1000000) {
        displayResult = (mainResult / 1000).toFixed(3);
        displayUnit = 'kΩ';
      } else {
        displayResult = (mainResult / 1000000).toFixed(3);
        displayUnit = 'MΩ';
      }
    } else if (resultUnit === 'H') {
      if (mainResult < 1e-6) {
        displayResult = (mainResult * 1e9).toFixed(3);
        displayUnit = 'nH';
      } else if (mainResult < 1e-3) {
        displayResult = (mainResult * 1e6).toFixed(3);
        displayUnit = 'µH';
      } else if (mainResult < 1) {
        displayResult = (mainResult * 1000).toFixed(3);
        displayUnit = 'mH';
      } else {
        displayResult = mainResult.toFixed(6);
        displayUnit = 'H';
      }
    } else if (resultUnit === 'F') {
      if (mainResult < 1e-12) {
        displayResult = (mainResult * 1e15).toFixed(3);
        displayUnit = 'fF';
      } else if (mainResult < 1e-9) {
        displayResult = (mainResult * 1e12).toFixed(3);
        displayUnit = 'pF';
      } else if (mainResult < 1e-6) {
        displayResult = (mainResult * 1e9).toFixed(3);
        displayUnit = 'nF';
      } else if (mainResult < 1e-3) {
        displayResult = (mainResult * 1e6).toFixed(3);
        displayUnit = 'µF';
      } else {
        displayResult = (mainResult * 1000).toFixed(3);
        displayUnit = 'mF';
      }
    } else { // Hz
      if (mainResult < 1000) {
        displayResult = mainResult.toFixed(2);
        displayUnit = 'Hz';
      } else if (mainResult < 1000000) {
        displayResult = (mainResult / 1000).toFixed(3);
        displayUnit = 'kHz';
      } else if (mainResult < 1000000000) {
        displayResult = (mainResult / 1000000).toFixed(3);
        displayUnit = 'MHz';
      } else {
        displayResult = (mainResult / 1000000000).toFixed(3);
        displayUnit = 'GHz';
      }
    }

    setResult({
      mainResult: displayResult,
      displayUnit: displayUnit,
      exactValue: mainResult.toExponential(4),
      originalUnit: resultUnit,
      formula: formula,
      additionalCalculations: additionalCalculations,
      analysis: analysis,
      recommendations: recommendations,
      calculationType: calculationType,
      frequencyInHz: frequencyInHz,
      inductanceInH: inductanceInH,
      capacitanceInF: capacitanceInF
    });
  };

  const handleInputChange = (field, value) => {
    setInputs(prev => ({ ...prev, [field]: value }));
  };

  const getCalculationTypeLabel = (type) => {
    const labels = {
      'inductive_reactance': 'Reactancia inductiva (X_L)',
      'capacitive_reactance': 'Reactancia capacitiva (X_C)', 
      'inductance': 'Inductancia (L)',
      'capacitance': 'Capacitancia (C)',
      'frequency': 'Frecuencia de resonancia (f₀)'
    };
    return labels[type] || type;
  };

  return (
    <div className="p-6">
      <h2 className="text-xl font-semibold mb-6">Reactancia</h2>
      
      <div className="grid md:grid-cols-2 gap-6">
        {/* Inputs */}
        <div className="space-y-4">
          {/* Tipo de cálculo */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Calcular
            </label>
            <select
              value={inputs.calculationType}
              onChange={(e) => handleInputChange('calculationType', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="inductive_reactance">Reactancia inductiva</option>
              <option value="capacitive_reactance">Reactancia capacitiva</option>
              <option value="inductance">Inductancia</option>
              <option value="capacitance">Capacitancia</option>
              <option value="frequency">Frecuencia</option>
            </select>
          </div>

          {/* Frecuencia */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Frecuencia
            </label>
            <div className="flex gap-2">
              <input
                type="number"
                value={inputs.frequency}
                onChange={(e) => handleInputChange('frequency', parseFloat(e.target.value) || 0)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <select
                value={inputs.frequencyUnit}
                onChange={(e) => handleInputChange('frequencyUnit', e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="Hz">Hz</option>
                <option value="kHz">kHz</option>
                <option value="MHz">MHz</option>
              </select>
            </div>
          </div>

          {/* Inductancia */}
          {(inputs.calculationType !== 'inductance') && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Inductancia
              </label>
              <div className="flex gap-2">
                <input
                  type="number"
                  value={inputs.inductance}
                  onChange={(e) => handleInputChange('inductance', parseFloat(e.target.value) || 0)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <select
                  value={inputs.inductanceUnit}
                  onChange={(e) => handleInputChange('inductanceUnit', e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="µH">µH</option>
                  <option value="mH">mH</option>
                  <option value="H">H</option>
                </select>
              </div>
            </div>
          )}

          {/* Capacitancia */}
          {(inputs.calculationType !== 'capacitance') && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Capacitancia
              </label>
              <div className="flex gap-2">
                <input
                  type="number"
                  value={inputs.capacitance}
                  onChange={(e) => handleInputChange('capacitance', parseFloat(e.target.value) || 0)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <select
                  value={inputs.capacitanceUnit}
                  onChange={(e) => handleInputChange('capacitanceUnit', e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="pF">pF</option>
                  <option value="nF">nF</option>
                  <option value="µF">µF</option>
                  <option value="mF">mF</option>
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
                <div className="text-sm text-blue-600 font-medium">{getCalculationTypeLabel(result.calculationType)}</div>
                <div className="text-2xl font-bold text-blue-900">{result.mainResult} {result.displayUnit}</div>
                <div className="text-xs text-blue-700 mt-1">{result.exactValue} {result.originalUnit}</div>
              </div>

              <div className="bg-green-50 p-4 rounded-lg">
                <div className="text-sm text-green-600 font-medium">Fórmula utilizada</div>
                <div className="text-lg font-mono font-bold text-green-900">{result.formula}</div>
              </div>

              {Object.keys(result.additionalCalculations).length > 0 && (
                <div className="bg-yellow-50 p-4 rounded-lg">
                  <div className="text-sm text-yellow-600 font-medium mb-2">Cálculos adicionales</div>
                  <div className="space-y-1 text-xs">
                    {result.additionalCalculations.inductiveReactance && (
                      <div className="flex justify-between">
                        <span>X_L:</span>
                        <span className="font-bold">{result.additionalCalculations.inductiveReactance.toFixed(2)} Ω</span>
                      </div>
                    )}
                    {result.additionalCalculations.capacitiveReactance && (
                      <div className="flex justify-between">
                        <span>X_C:</span>
                        <span className="font-bold">{result.additionalCalculations.capacitiveReactance.toFixed(2)} Ω</span>
                      </div>
                    )}
                    {result.additionalCalculations.resonanceFrequency && (
                      <div className="flex justify-between">
                        <span>f₀:</span>
                        <span className="font-bold">{result.additionalCalculations.resonanceFrequency.toFixed(2)} Hz</span>
                      </div>
                    )}
                    {result.additionalCalculations.impedance && (
                      <div className="flex justify-between">
                        <span>|Z|:</span>
                        <span className="font-bold">{result.additionalCalculations.impedance.toFixed(2)} Ω</span>
                      </div>
                    )}
                    {result.additionalCalculations.phaseAngle && (
                      <div className="flex justify-between">
                        <span>φ:</span>
                        <span className="font-bold">{result.additionalCalculations.phaseAngle}°</span>
                      </div>
                    )}
                    {result.additionalCalculations.period && (
                      <div className="flex justify-between">
                        <span>T:</span>
                        <span className="font-bold">{result.additionalCalculations.period.toExponential(3)} s</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="text-sm text-gray-600 font-medium mb-2">Parámetros utilizados</div>
                <div className="text-xs text-gray-600 space-y-1">
                  <div>• Frecuencia: {result.frequencyInHz.toLocaleString()} Hz</div>
                  <div>• Inductancia: {result.inductanceInH.toExponential(3)} H</div>
                  <div>• Capacitancia: {result.capacitanceInF.toExponential(3)} F</div>
                </div>
              </div>

              {result.analysis.length > 0 && (
                <div className="bg-indigo-50 p-4 rounded-lg">
                  <div className="text-sm text-indigo-600 font-medium mb-2">Análisis</div>
                  <ul className="text-xs text-indigo-700 space-y-1">
                    {result.analysis.map((item, index) => (
                      <li key={index}>• {item}</li>
                    ))}
                  </ul>
                </div>
              )}

              {result.recommendations.length > 0 && (
                <div className="bg-orange-50 p-4 rounded-lg">
                  <div className="text-sm text-orange-600 font-medium mb-2">Recomendaciones</div>
                  <ul className="text-xs text-orange-700 space-y-1">
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
          <div><strong>Reactancia inductiva:</strong> X_L = 2πfL</div>
          <div><strong>Reactancia capacitiva:</strong> X_C = 1/(2πfC)</div>
          <div><strong>Inductancia:</strong> L = X_L/(2πf)</div>
          <div><strong>Capacitancia:</strong> C = 1/(2πfX_C)</div>
          <div><strong>Frecuencia de resonancia:</strong> f₀ = 1/(2π√LC)</div>
          <div><strong>Impedancia:</strong> Z = √(R² + (X_L - X_C)²)</div>
          <div><strong>Ángulo de fase:</strong> φ = arctan((X_L - X_C)/R)</div>
          <div className="text-xs text-blue-700 mt-2">
            <strong>Donde:</strong> f = frecuencia (Hz), L = inductancia (H), C = capacitancia (F), R = resistencia (Ω)
          </div>
          <div className="text-xs text-blue-700">
            <strong>En resonancia:</strong> X_L = X_C, Z mínima, φ = 0°
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReactanceAdvancedCalc;