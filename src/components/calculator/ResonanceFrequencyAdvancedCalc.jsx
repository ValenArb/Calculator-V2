import { useState } from 'react';

const ResonanceFrequencyAdvancedCalc = () => {
  const [inputs, setInputs] = useState({
    inductance: 10,
    inductanceUnit: 'mH',
    capacitance: 100,
    capacitanceUnit: 'µF'
  });

  const [result, setResult] = useState(null);

  const calculate = () => {
    const { inductance, inductanceUnit, capacitance, capacitanceUnit } = inputs;

    // Conversiones de unidades a unidades base (H y F)
    const inductanceConversions = { 'µH': 1e-6, 'mH': 1e-3, 'H': 1 };
    const capacitanceConversions = { 'pF': 1e-12, 'nF': 1e-9, 'µF': 1e-6, 'mF': 1e-3 };

    // Convertir a unidades base
    const inductanceInH = inductance * inductanceConversions[inductanceUnit];
    const capacitanceInF = capacitance * capacitanceConversions[capacitanceUnit];

    // Verificar valores válidos
    if (inductanceInH <= 0 || capacitanceInF <= 0) {
      setResult({
        error: 'Los valores de inductancia y capacitancia deben ser positivos'
      });
      return;
    }

    // Calcular frecuencia de resonancia
    // f₀ = 1 / (2π × √(L × C))
    const resonanceFrequency = 1 / (2 * Math.PI * Math.sqrt(inductanceInH * capacitanceInF)); // Hz

    // Calcular período
    const period = 1 / resonanceFrequency; // s

    // Calcular impedancia característica
    // Z₀ = √(L/C)
    const characteristicImpedance = Math.sqrt(inductanceInH / capacitanceInF); // Ω

    // Calcular reactancias a la frecuencia de resonancia (deben ser iguales)
    const inductiveReactance = 2 * Math.PI * resonanceFrequency * inductanceInH; // Ω
    const capacitiveReactance = 1 / (2 * Math.PI * resonanceFrequency * capacitanceInF); // Ω

    // Factor de calidad (asumiendo una resistencia series pequeña para estimación)
    // Q = (1/R) × √(L/C) - Para esta calculadora asumiremos R = 1Ω como aproximación
    const assumedResistance = 1; // Ω
    const qualityFactor = (1 / assumedResistance) * Math.sqrt(inductanceInH / capacitanceInF);

    // Ancho de banda (aproximado)
    // BW = f₀ / Q
    const bandwidth = resonanceFrequency / qualityFactor; // Hz

    // Determinar mejor formato de frecuencia para mostrar
    let displayFrequency = '';
    let displayUnit = '';
    
    if (resonanceFrequency < 1000) {
      displayFrequency = resonanceFrequency.toFixed(2);
      displayUnit = 'Hz';
    } else if (resonanceFrequency < 1000000) {
      displayFrequency = (resonanceFrequency / 1000).toFixed(3);
      displayUnit = 'kHz';
    } else if (resonanceFrequency < 1000000000) {
      displayFrequency = (resonanceFrequency / 1000000).toFixed(3);
      displayUnit = 'MHz';
    } else {
      displayFrequency = (resonanceFrequency / 1000000000).toFixed(3);
      displayUnit = 'GHz';
    }

    // Determinar mejor formato de período
    let displayPeriod = '';
    let periodUnit = '';
    
    if (period >= 1) {
      displayPeriod = period.toFixed(6);
      periodUnit = 's';
    } else if (period >= 1e-3) {
      displayPeriod = (period * 1000).toFixed(3);
      periodUnit = 'ms';
    } else if (period >= 1e-6) {
      displayPeriod = (period * 1000000).toFixed(3);
      periodUnit = 'µs';
    } else {
      displayPeriod = (period * 1000000000).toFixed(3);
      periodUnit = 'ns';
    }

    // Análisis del circuito
    let circuitAnalysis = [];
    
    if (resonanceFrequency < 20) {
      circuitAnalysis.push('Frecuencia muy baja - aplicaciones de potencia y audio');
    } else if (resonanceFrequency < 20000) {
      circuitAnalysis.push('Rango de audio - filtros de frecuencias audibles');
    } else if (resonanceFrequency < 100000) {
      circuitAnalysis.push('Rango de radiofrecuencia baja - comunicaciones AM');
    } else if (resonanceFrequency < 30000000) {
      circuitAnalysis.push('Rango de onda corta - comunicaciones HF');
    } else if (resonanceFrequency < 300000000) {
      circuitAnalysis.push('Rango VHF - TV, FM, comunicaciones móviles');
    } else if (resonanceFrequency < 3000000000) {
      circuitAnalysis.push('Rango UHF - microondas, WiFi, Bluetooth');
    } else {
      circuitAnalysis.push('Rango de microondas - radares, satelitales');
    }

    if (qualityFactor > 100) {
      circuitAnalysis.push('Factor Q alto - circuito muy selectivo');
    } else if (qualityFactor > 10) {
      circuitAnalysis.push('Factor Q moderado - buena selectividad');
    } else {
      circuitAnalysis.push('Factor Q bajo - circuito poco selectivo');
    }

    if (characteristicImpedance < 10) {
      circuitAnalysis.push('Impedancia característica baja');
    } else if (characteristicImpedance < 100) {
      circuitAnalysis.push('Impedancia característica moderada');
    } else if (characteristicImpedance < 1000) {
      circuitAnalysis.push('Impedancia característica alta');
    } else {
      circuitAnalysis.push('Impedancia característica muy alta');
    }

    // Aplicaciones sugeridas
    let applications = [];
    
    if (resonanceFrequency >= 88e6 && resonanceFrequency <= 108e6) {
      applications.push('Banda FM comercial');
    }
    if (resonanceFrequency >= 530e3 && resonanceFrequency <= 1700e3) {
      applications.push('Banda AM comercial');
    }
    if (resonanceFrequency >= 2.4e9 && resonanceFrequency <= 2.5e9) {
      applications.push('Banda ISM (WiFi, Bluetooth)');
    }
    if (resonanceFrequency >= 50 && resonanceFrequency <= 60) {
      applications.push('Frecuencia de red eléctrica');
    }

    if (applications.length === 0) {
      applications.push('Aplicaciones de filtrado y sintonización');
    }

    setResult({
      displayFrequency: displayFrequency,
      displayUnit: displayUnit,
      resonanceFrequencyHz: resonanceFrequency.toFixed(2),
      displayPeriod: displayPeriod,
      periodUnit: periodUnit,
      periodInSeconds: period.toExponential(6),
      characteristicImpedance: characteristicImpedance.toFixed(2),
      inductiveReactance: inductiveReactance.toFixed(2),
      capacitiveReactance: capacitiveReactance.toFixed(2),
      qualityFactor: qualityFactor.toFixed(1),
      bandwidth: bandwidth.toFixed(2),
      circuitAnalysis: circuitAnalysis,
      applications: applications,
      inductanceInH: inductanceInH.toExponential(3),
      capacitanceInF: capacitanceInF.toExponential(3),
      reactanceDifference: Math.abs(inductiveReactance - capacitiveReactance).toFixed(6)
    });
  };

  const handleInputChange = (field, value) => {
    setInputs(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="p-6">
      <h2 className="text-xl font-semibold mb-6">Frecuencia de Resonancia</h2>
      
      <div className="grid md:grid-cols-2 gap-6">
        {/* Inputs */}
        <div className="space-y-4">
          {/* Inductancia */}
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

          {/* Capacitancia */}
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
            result.error ? (
              <div className="bg-red-50 p-4 rounded-lg">
                <div className="text-sm text-red-600 font-medium">Error</div>
                <div className="text-red-800">{result.error}</div>
              </div>
            ) : (
              <>
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="text-sm text-blue-600 font-medium">Frecuencia de resonancia</div>
                  <div className="text-2xl font-bold text-blue-900">{result.displayFrequency} {result.displayUnit}</div>
                  <div className="text-xs text-blue-700 mt-1">{result.resonanceFrequencyHz} Hz</div>
                </div>

                <div className="bg-green-50 p-4 rounded-lg">
                  <div className="text-sm text-green-600 font-medium">Período</div>
                  <div className="text-xl font-bold text-green-900">{result.displayPeriod} {result.periodUnit}</div>
                  <div className="text-xs text-green-700 mt-1">{result.periodInSeconds} s</div>
                </div>

                <div className="bg-orange-50 p-4 rounded-lg">
                  <div className="text-sm text-orange-600 font-medium">Impedancia característica</div>
                  <div className="text-xl font-bold text-orange-900">{result.characteristicImpedance} Ω</div>
                  <div className="text-xs text-orange-700 mt-1">Z₀ = √(L/C)</div>
                </div>

                <div className="bg-purple-50 p-4 rounded-lg">
                  <div className="text-sm text-purple-600 font-medium">Factor de calidad (Q)</div>
                  <div className="text-xl font-bold text-purple-900">{result.qualityFactor}</div>
                  <div className="text-xs text-purple-700 mt-1">BW = {result.bandwidth} Hz (R = 1Ω)</div>
                </div>

                <div className="bg-yellow-50 p-4 rounded-lg">
                  <div className="text-sm text-yellow-600 font-medium mb-2">Reactancias en resonancia</div>
                  <div className="space-y-1">
                    <div className="flex justify-between items-center">
                      <span className="text-xs">X_L:</span>
                      <span className="text-sm font-bold text-yellow-900">{result.inductiveReactance} Ω</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs">X_C:</span>
                      <span className="text-sm font-bold text-yellow-900">{result.capacitiveReactance} Ω</span>
                    </div>
                    <div className="text-xs text-yellow-700 mt-2">
                      Diferencia: {result.reactanceDifference} Ω
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="text-sm text-gray-600 font-medium mb-2">Parámetros del circuito</div>
                  <div className="text-xs text-gray-600 space-y-1">
                    <div>• Inductancia: {result.inductanceInH} H</div>
                    <div>• Capacitancia: {result.capacitanceInF} F</div>
                    <div>• Resistencia asumida: 1 Ω</div>
                  </div>
                </div>

                {result.circuitAnalysis.length > 0 && (
                  <div className="bg-indigo-50 p-4 rounded-lg">
                    <div className="text-sm text-indigo-600 font-medium mb-2">Análisis del circuito</div>
                    <ul className="text-xs text-indigo-700 space-y-1">
                      {result.circuitAnalysis.map((analysis, index) => (
                        <li key={index}>• {analysis}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {result.applications.length > 0 && (
                  <div className="bg-teal-50 p-4 rounded-lg">
                    <div className="text-sm text-teal-600 font-medium mb-2">Aplicaciones sugeridas</div>
                    <ul className="text-xs text-teal-700 space-y-1">
                      {result.applications.map((app, index) => (
                        <li key={index}>• {app}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </>
            )
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
          <div><strong>Frecuencia de resonancia:</strong> f₀ = 1 / (2π × √(L × C))</div>
          <div><strong>Período:</strong> T = 1 / f₀</div>
          <div><strong>Impedancia característica:</strong> Z₀ = √(L/C)</div>
          <div><strong>Reactancia inductiva:</strong> X_L = 2π × f₀ × L</div>
          <div><strong>Reactancia capacitiva:</strong> X_C = 1 / (2π × f₀ × C)</div>
          <div><strong>Factor de calidad:</strong> Q = (1/R) × √(L/C)</div>
          <div><strong>Ancho de banda:</strong> BW = f₀ / Q</div>
          <div className="text-xs text-blue-700 mt-2">
            <strong>Donde:</strong> f₀ = frecuencia (Hz), L = inductancia (H), C = capacitancia (F), R = resistencia (Ω)
          </div>
          <div className="text-xs text-blue-700">
            <strong>En resonancia:</strong> X_L = X_C, impedancia mínima = R, máxima transferencia de potencia
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResonanceFrequencyAdvancedCalc;