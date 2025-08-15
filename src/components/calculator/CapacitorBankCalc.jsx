import { useState } from 'react';

const CapacitorBankCalc = () => {
  const [inputs, setInputs] = useState({
    connectionType: 'delta',
    steps: 3,
    totalPower: 100,
    totalPowerUnit: 'kvar',
    nominalVoltage: 400,
    nominalVoltageUnit: 'V',
    frequency: 50,
    frequencyUnit: 'Hz',
    controlType: 'manual'
  });

  const [result, setResult] = useState(null);

  const calculate = () => {
    const { connectionType, steps, totalPower, totalPowerUnit, 
            nominalVoltage, nominalVoltageUnit, frequency, frequencyUnit, controlType } = inputs;

    // Conversiones de unidades
    const powerConversions = { 'var': 1, 'kvar': 1000, 'Mvar': 1000000 };
    const voltageConversions = { 'V': 1, 'kV': 1000 };
    const frequencyConversions = { 'Hz': 1 };

    const totalPowerVar = totalPower * powerConversions[totalPowerUnit];
    const voltageV = nominalVoltage * voltageConversions[nominalVoltageUnit];
    const frequencyHz = frequency * frequencyConversions[frequencyUnit];

    // Potencia reactiva por escalón
    const powerPerStep = totalPowerVar / steps; // var

    // Cálculos según tipo de conexión
    let capacitancePerStep = 0;
    let currentPerStep = 0;
    let totalCurrent = 0;
    let lineVoltage = voltageV;
    let phaseVoltage = voltageV;

    switch (connectionType) {
      case 'star':
        // Conexión estrella
        phaseVoltage = voltageV / Math.sqrt(3);
        lineVoltage = voltageV;
        
        // Capacitancia por fase por escalón
        capacitancePerStep = powerPerStep / (3 * 2 * Math.PI * frequencyHz * Math.pow(phaseVoltage, 2));
        
        // Corriente por fase por escalón
        currentPerStep = powerPerStep / (3 * phaseVoltage);
        
        // Corriente de línea total
        totalCurrent = (totalPowerVar / (Math.sqrt(3) * lineVoltage));
        break;

      case 'delta':
        // Conexión delta (valor por defecto)
        phaseVoltage = voltageV;
        lineVoltage = voltageV;
        
        // Capacitancia por fase por escalón
        capacitancePerStep = powerPerStep / (3 * 2 * Math.PI * frequencyHz * Math.pow(phaseVoltage, 2));
        
        // Corriente por fase por escalón
        currentPerStep = powerPerStep / (3 * phaseVoltage);
        
        // Corriente de línea total
        totalCurrent = totalPowerVar / (Math.sqrt(3) * lineVoltage);
        break;
    }

    // Configuración recomendada de escalones
    let stepsConfiguration = [];
    let remainingPower = totalPowerVar;
    
    // Configuración común: escalones en proporción 1:1:2 o 1:2:4
    if (steps === 1) {
      stepsConfiguration = [{ step: 1, power: totalPowerVar, percentage: 100 }];
    } else if (steps === 2) {
      const step1 = totalPowerVar * 0.5;
      const step2 = totalPowerVar * 0.5;
      stepsConfiguration = [
        { step: 1, power: step1, percentage: 50 },
        { step: 2, power: step2, percentage: 50 }
      ];
    } else if (steps === 3) {
      const step1 = totalPowerVar * 0.25;
      const step2 = totalPowerVar * 0.25;
      const step3 = totalPowerVar * 0.5;
      stepsConfiguration = [
        { step: 1, power: step1, percentage: 25 },
        { step: 2, power: step2, percentage: 25 },
        { step: 3, power: step3, percentage: 50 }
      ];
    } else if (steps === 4) {
      const step1 = totalPowerVar * 0.25;
      const step2 = totalPowerVar * 0.25;
      const step3 = totalPowerVar * 0.25;
      const step4 = totalPowerVar * 0.25;
      stepsConfiguration = [
        { step: 1, power: step1, percentage: 25 },
        { step: 2, power: step2, percentage: 25 },
        { step: 3, power: step3, percentage: 25 },
        { step: 4, power: step4, percentage: 25 }
      ];
    } else {
      // Para más de 4 escalones, distribución uniforme
      for (let i = 1; i <= steps; i++) {
        stepsConfiguration.push({
          step: i,
          power: powerPerStep,
          percentage: (100 / steps).toFixed(1)
        });
      }
    }

    // Determinar mejor formato para capacitancia
    let displayCapacitance = '';
    let capacitanceUnit = '';
    
    if (capacitancePerStep < 1e-6) {
      displayCapacitance = (capacitancePerStep * 1e9).toFixed(1);
      capacitanceUnit = 'nF';
    } else if (capacitancePerStep < 1e-3) {
      displayCapacitance = (capacitancePerStep * 1e6).toFixed(1);
      capacitanceUnit = 'µF';
    } else {
      displayCapacitance = (capacitancePerStep * 1000).toFixed(1);
      capacitanceUnit = 'mF';
    }

    // Análisis del sistema de control
    let controlAnalysis = [];
    let controlRecommendations = [];

    switch (controlType) {
      case 'manual':
        controlAnalysis.push('Control manual - operación por interruptor');
        controlRecommendations.push('Verificar secuencia de conexión/desconexión');
        break;
      case 'power-factor':
        controlAnalysis.push('Control automático por factor de potencia');
        controlRecommendations.push('Configurar umbral de conexión/desconexión');
        controlRecommendations.push('Instalar medidor de factor de potencia');
        break;
      case 'reactive-power':
        controlAnalysis.push('Control automático por potencia reactiva');
        controlRecommendations.push('Configurar setpoints de potencia reactiva');
        break;
      case 'current':
        controlAnalysis.push('Control automático por corriente');
        controlRecommendations.push('Instalar transformadores de corriente');
        break;
    }

    // Análisis general
    let generalAnalysis = [];
    
    if (steps > 6) {
      generalAnalysis.push('Número alto de escalones - mayor flexibilidad de control');
    } else if (steps > 3) {
      generalAnalysis.push('Número moderado de escalones - buen balance');
    } else {
      generalAnalysis.push('Pocos escalones - control básico');
    }

    if (connectionType === 'star') {
      generalAnalysis.push('Conexión estrella - menor estrés en capacitores');
    } else {
      generalAnalysis.push('Conexión delta - menor capacitancia requerida');
    }

    // Recomendaciones generales
    let generalRecommendations = [];
    
    if (totalCurrent > 100) {
      generalRecommendations.push('Corriente alta - verificar capacidad de contactores');
    }

    if (capacitancePerStep > 0.01) { // > 10 mF
      generalRecommendations.push('Capacitancia alta - verificar disponibilidad comercial');
    }

    generalRecommendations.push('Instalar protecciones contra sobretensión');
    generalRecommendations.push('Considerar reactores de sintonía si hay armónicos');

    if (controlType !== 'manual') {
      generalRecommendations.push('Configurar tiempos de retardo entre escalones (3-5 min)');
    }

    setResult({
      capacitancePerStep: displayCapacitance,
      capacitanceUnit: capacitanceUnit,
      capacitanceExact: capacitancePerStep.toExponential(3),
      powerPerStep: (powerPerStep / 1000).toFixed(1), // kvar
      powerPerStepVar: powerPerStep.toFixed(0),
      currentPerStep: currentPerStep.toFixed(2),
      totalCurrent: totalCurrent.toFixed(2),
      stepsConfiguration: stepsConfiguration,
      connectionType: connectionType,
      phaseVoltage: phaseVoltage.toFixed(0),
      lineVoltage: lineVoltage.toFixed(0),
      controlType: controlType,
      controlAnalysis: controlAnalysis,
      controlRecommendations: controlRecommendations,
      generalAnalysis: generalAnalysis,
      generalRecommendations: generalRecommendations,
      totalPowerKvar: (totalPowerVar / 1000).toFixed(1),
      frequencyHz: frequencyHz,
      steps: steps
    });
  };

  const handleInputChange = (field, value) => {
    setInputs(prev => ({ ...prev, [field]: value }));
  };

  const getConnectionTypeLabel = (type) => {
    const labels = {
      'star': 'Estrella',
      'delta': 'Delta'
    };
    return labels[type] || type;
  };

  const getControlTypeLabel = (type) => {
    const labels = {
      'manual': 'Manual',
      'power-factor': 'Automático por factor de potencia',
      'reactive-power': 'Automático por potencia reactiva',
      'current': 'Automático por corriente'
    };
    return labels[type] || type;
  };

  return (
    <div className="p-6">
      <h2 className="text-xl font-semibold mb-6">Banco de Capacitores</h2>
      
      <div className="grid md:grid-cols-2 gap-6">
        {/* Inputs */}
        <div className="space-y-4">
          {/* Tipo de conexión */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tipo de conexión
            </label>
            <div className="space-y-2">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="connectionType"
                  value="star"
                  checked={inputs.connectionType === 'star'}
                  onChange={(e) => handleInputChange('connectionType', e.target.value)}
                  className="mr-2"
                />
                Estrella
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="connectionType"
                  value="delta"
                  checked={inputs.connectionType === 'delta'}
                  onChange={(e) => handleInputChange('connectionType', e.target.value)}
                  className="mr-2"
                />
                Delta
              </label>
            </div>
          </div>

          {/* Número de escalones */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Número de escalones
            </label>
            <select
              value={inputs.steps}
              onChange={(e) => handleInputChange('steps', parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(num => (
                <option key={num} value={num}>{num}</option>
              ))}
            </select>
          </div>

          {/* Potencia total del banco */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Potencia total del banco
            </label>
            <div className="flex gap-2">
              <input
                type="number"
                value={inputs.totalPower}
                onChange={(e) => handleInputChange('totalPower', parseFloat(e.target.value) || 0)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <select
                value={inputs.totalPowerUnit}
                onChange={(e) => handleInputChange('totalPowerUnit', e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="var">var</option>
                <option value="kvar">kvar</option>
                <option value="Mvar">Mvar</option>
              </select>
            </div>
          </div>

          {/* Tensión nominal */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tensión nominal
            </label>
            <div className="flex gap-2">
              <input
                type="number"
                value={inputs.nominalVoltage}
                onChange={(e) => handleInputChange('nominalVoltage', parseFloat(e.target.value) || 0)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <select
                value={inputs.nominalVoltageUnit}
                onChange={(e) => handleInputChange('nominalVoltageUnit', e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="V">V</option>
                <option value="kV">kV</option>
              </select>
            </div>
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
                onChange={(e) => handleInputChange('frequency', parseFloat(e.target.value) || 50)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <span className="px-3 py-2 bg-gray-100 border border-gray-300 rounded-md text-gray-700">Hz</span>
            </div>
          </div>

          {/* Control automático */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Control automático
            </label>
            <select
              value={inputs.controlType}
              onChange={(e) => handleInputChange('controlType', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="manual">Manual</option>
              <option value="power-factor">Automático por factor de potencia</option>
              <option value="reactive-power">Automático por potencia reactiva</option>
              <option value="current">Automático por corriente</option>
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
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="text-sm text-blue-600 font-medium">Capacitancia por escalón</div>
                <div className="text-2xl font-bold text-blue-900">{result.capacitancePerStep} {result.capacitanceUnit}</div>
                <div className="text-xs text-blue-700 mt-1">{result.capacitanceExact} F</div>
              </div>

              <div className="bg-green-50 p-4 rounded-lg">
                <div className="text-sm text-green-600 font-medium">Potencia reactiva por escalón</div>
                <div className="text-xl font-bold text-green-900">{result.powerPerStep} kvar</div>
                <div className="text-xs text-green-700 mt-1">{result.powerPerStepVar} var</div>
              </div>

              <div className="bg-orange-50 p-4 rounded-lg">
                <div className="text-sm text-orange-600 font-medium">Corriente nominal del banco</div>
                <div className="text-xl font-bold text-orange-900">{result.totalCurrent} A</div>
                <div className="text-xs text-orange-700 mt-1">Por escalón: {result.currentPerStep} A</div>
              </div>

              <div className="bg-purple-50 p-4 rounded-lg">
                <div className="text-sm text-purple-600 font-medium mb-2">Configuración recomendada</div>
                <div className="space-y-1">
                  {result.stepsConfiguration.map((step, index) => (
                    <div key={index} className="flex justify-between items-center">
                      <span className="text-xs">Escalón {step.step}:</span>
                      <span className="text-sm font-bold text-purple-900">
                        {(step.power / 1000).toFixed(1)} kvar ({step.percentage}%)
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-yellow-50 p-4 rounded-lg">
                <div className="text-sm text-yellow-600 font-medium mb-2">Especificaciones técnicas</div>
                <div className="text-xs text-yellow-700 space-y-1">
                  <div>• Conexión: {getConnectionTypeLabel(result.connectionType)}</div>
                  <div>• Tensión de línea: {result.lineVoltage} V</div>
                  <div>• Tensión de fase: {result.phaseVoltage} V</div>
                  <div>• Número de escalones: {result.steps}</div>
                  <div>• Potencia total: {result.totalPowerKvar} kvar</div>
                  <div>• Frecuencia: {result.frequencyHz} Hz</div>
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="text-sm text-gray-600 font-medium mb-2">Sistema de control</div>
                <div className="text-xs text-gray-600 mb-2">
                  {getControlTypeLabel(result.controlType)}
                </div>
                {result.controlAnalysis.length > 0 && (
                  <ul className="text-xs text-gray-600 space-y-1">
                    {result.controlAnalysis.map((analysis, index) => (
                      <li key={index}>• {analysis}</li>
                    ))}
                  </ul>
                )}
              </div>

              {result.generalAnalysis.length > 0 && (
                <div className="bg-indigo-50 p-4 rounded-lg">
                  <div className="text-sm text-indigo-600 font-medium mb-2">Análisis del sistema</div>
                  <ul className="text-xs text-indigo-700 space-y-1">
                    {result.generalAnalysis.map((analysis, index) => (
                      <li key={index}>• {analysis}</li>
                    ))}
                  </ul>
                </div>
              )}

              {(result.controlRecommendations.length > 0 || result.generalRecommendations.length > 0) && (
                <div className="bg-red-50 p-4 rounded-lg">
                  <div className="text-sm text-red-600 font-medium mb-2">Recomendaciones</div>
                  <ul className="text-xs text-red-700 space-y-1">
                    {result.controlRecommendations.map((rec, index) => (
                      <li key={index}>• {rec}</li>
                    ))}
                    {result.generalRecommendations.map((rec, index) => (
                      <li key={index + result.controlRecommendations.length}>• {rec}</li>
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
          <div><strong>Capacitancia por escalón (Δ):</strong> C = Q_escalón / (3 × 2πfV²)</div>
          <div><strong>Capacitancia por escalón (Y):</strong> C = Q_escalón / (3 × 2πfV_fn²)</div>
          <div><strong>Corriente por fase:</strong> I_fase = Q_escalón / (3 × V_fase)</div>
          <div><strong>Corriente de línea total:</strong> I_línea = Q_total / (√3 × V_línea)</div>
          <div><strong>Potencia por escalón:</strong> Q_escalón = Q_total / n_escalones</div>
          <div><strong>Tensión de fase (Y):</strong> V_fn = V_línea / √3</div>
          <div><strong>Tensión de fase (Δ):</strong> V_fase = V_línea</div>
          <div className="text-xs text-blue-700 mt-2">
            <strong>Donde:</strong> Q = potencia reactiva (var), C = capacitancia (F), f = frecuencia (Hz), V = tensión (V)
          </div>
        </div>
      </div>
    </div>
  );
};

export default CapacitorBankCalc;