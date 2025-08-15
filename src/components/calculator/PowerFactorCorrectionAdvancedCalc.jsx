import { useState } from 'react';

const PowerFactorCorrectionAdvancedCalc = () => {
  const [inputs, setInputs] = useState({
    systemType: 'monofasico',
    activePower: 10,
    activePowerUnit: 'kW',
    currentPowerFactor: 0.8,
    desiredPowerFactor: 0.95,
    systemVoltage: 220,
    systemVoltageUnit: 'V',
    frequency: 50,
    frequencyUnit: 'Hz'
  });

  const [result, setResult] = useState(null);

  const calculate = () => {
    const { systemType, activePower, activePowerUnit, currentPowerFactor, 
            desiredPowerFactor, systemVoltage, systemVoltageUnit, frequency, frequencyUnit } = inputs;

    // Conversiones de unidades
    const powerConversions = { 'W': 1, 'kW': 1000, 'MW': 1000000 };
    const voltageConversions = { 'V': 1, 'kV': 1000 };
    const frequencyConversions = { 'Hz': 1 };

    const activePowerW = activePower * powerConversions[activePowerUnit];
    const voltageV = systemVoltage * voltageConversions[systemVoltageUnit];
    const frequencyHz = frequency * frequencyConversions[frequencyUnit];

    // Verificar valores válidos
    if (currentPowerFactor >= desiredPowerFactor) {
      setResult({
        error: 'El factor de potencia actual debe ser menor al deseado'
      });
      return;
    }

    if (currentPowerFactor <= 0 || desiredPowerFactor <= 0 || currentPowerFactor > 1 || desiredPowerFactor > 1) {
      setResult({
        error: 'Los factores de potencia deben estar entre 0 y 1'
      });
      return;
    }

    // Cálculos de potencia reactiva
    const currentReactivePower = activePowerW * Math.tan(Math.acos(currentPowerFactor)); // var
    const desiredReactivePower = activePowerW * Math.tan(Math.acos(desiredPowerFactor)); // var
    const reactivePowerToCompensate = currentReactivePower - desiredReactivePower; // var

    // Cálculos de potencia aparente
    const currentApparentPower = activePowerW / currentPowerFactor; // VA
    const desiredApparentPower = activePowerW / desiredPowerFactor; // VA

    // Cálculos de corriente
    let currentBeforeCorrection = 0;
    let currentAfterCorrection = 0;
    let systemMultiplier = 1;

    switch (systemType) {
      case 'monofasico':
        systemMultiplier = 1;
        currentBeforeCorrection = currentApparentPower / voltageV;
        currentAfterCorrection = desiredApparentPower / voltageV;
        break;
      case 'bifasico':
        systemMultiplier = 2;
        currentBeforeCorrection = currentApparentPower / (voltageV * Math.sqrt(2));
        currentAfterCorrection = desiredApparentPower / (voltageV * Math.sqrt(2));
        break;
      case 'trifasico':
        systemMultiplier = Math.sqrt(3);
        currentBeforeCorrection = currentApparentPower / (voltageV * Math.sqrt(3));
        currentAfterCorrection = desiredApparentPower / (voltageV * Math.sqrt(3));
        break;
    }

    // Cálculo de capacitancia requerida
    let capacitanceRequired = 0;
    let capacitorVoltage = voltageV;

    switch (systemType) {
      case 'monofasico':
        capacitanceRequired = reactivePowerToCompensate / (2 * Math.PI * frequencyHz * Math.pow(voltageV, 2));
        capacitorVoltage = voltageV;
        break;
      case 'bifasico':
        capacitanceRequired = reactivePowerToCompensate / (2 * 2 * Math.PI * frequencyHz * Math.pow(voltageV, 2));
        capacitorVoltage = voltageV;
        break;
      case 'trifasico':
        capacitanceRequired = reactivePowerToCompensate / (3 * 2 * Math.PI * frequencyHz * Math.pow(voltageV, 2));
        capacitorVoltage = voltageV / Math.sqrt(3); // Tensión fase-neutro
        break;
    }

    // Ahorro energético
    const currentReduction = ((currentBeforeCorrection - currentAfterCorrection) / currentBeforeCorrection) * 100;
    const powerLossReduction = Math.pow(currentBeforeCorrection / currentAfterCorrection, 2) - 1;
    const energySavingsPercent = (1 - Math.pow(currentPowerFactor / desiredPowerFactor, 2)) * 100;

    // Determinar mejor formato para capacitancia
    let displayCapacitance = '';
    let capacitanceUnit = '';
    
    if (capacitanceRequired < 1e-6) {
      displayCapacitance = (capacitanceRequired * 1e9).toFixed(1);
      capacitanceUnit = 'nF';
    } else if (capacitanceRequired < 1e-3) {
      displayCapacitance = (capacitanceRequired * 1e6).toFixed(1);
      capacitanceUnit = 'µF';
    } else {
      displayCapacitance = (capacitanceRequired * 1000).toFixed(1);
      capacitanceUnit = 'mF';
    }

    // Análisis y recomendaciones
    let analysis = [];
    let recommendations = [];

    if (reactivePowerToCompensate > activePowerW) {
      analysis.push('Gran cantidad de potencia reactiva a compensar');
      recommendations.push('Considerar corrección por etapas con múltiples capacitores');
    }

    if (currentPowerFactor < 0.7) {
      analysis.push('Factor de potencia muy bajo - gran potencial de ahorro');
      recommendations.push('Implementar corrección inmediatamente para reducir costos');
    } else if (currentPowerFactor < 0.85) {
      analysis.push('Factor de potencia moderadamente bajo');
    } else {
      analysis.push('Factor de potencia relativamente bueno');
    }

    if (desiredPowerFactor > 0.98) {
      analysis.push('Factor de potencia objetivo muy alto');
      recommendations.push('Cuidado con sobrecompensación - puede causar problemas de resonancia');
    }

    if (capacitanceRequired > 0.001) { // > 1 mF
      analysis.push('Capacitancia requerida alta');
      recommendations.push('Verificar disponibilidad comercial del capacitor');
    }

    // Cálculos de costos aproximados (estimaciones)
    const monthlyEnergyReduction = (activePowerW * 730 * energySavingsPercent / 100) / 1000; // kWh
    const monthlyCostSaving = monthlyEnergyReduction * 0.15; // Asumiendo $0.15/kWh

    setResult({
      capacitanceRequired: displayCapacitance,
      capacitanceUnit: capacitanceUnit,
      capacitanceExact: capacitanceRequired.toExponential(3),
      reactivePowerToCompensate: (reactivePowerToCompensate / 1000).toFixed(2), // kvar
      reactivePowerToCompensateVar: reactivePowerToCompensate.toFixed(0),
      currentBeforeCorrection: currentBeforeCorrection.toFixed(2),
      currentAfterCorrection: currentAfterCorrection.toFixed(2),
      currentReduction: currentReduction.toFixed(1),
      energySavingsPercent: energySavingsPercent.toFixed(1),
      monthlyEnergyReduction: monthlyEnergyReduction.toFixed(0),
      monthlyCostSaving: monthlyCostSaving.toFixed(2),
      capacitorVoltage: capacitorVoltage.toFixed(0),
      currentApparentPower: (currentApparentPower / 1000).toFixed(2), // kVA
      desiredApparentPower: (desiredApparentPower / 1000).toFixed(2), // kVA
      currentReactivePower: (currentReactivePower / 1000).toFixed(2), // kvar
      desiredReactivePower: (desiredReactivePower / 1000).toFixed(2), // kvar
      systemType: systemType,
      systemMultiplier: systemMultiplier,
      analysis: analysis,
      recommendations: recommendations,
      activePowerKW: (activePowerW / 1000).toFixed(2),
      voltageV: voltageV,
      frequencyHz: frequencyHz
    });
  };

  const handleInputChange = (field, value) => {
    setInputs(prev => ({ ...prev, [field]: value }));
  };

  const getSystemTypeLabel = (type) => {
    const labels = {
      'monofasico': 'Monofásico',
      'bifasico': 'Bifásico',
      'trifasico': 'Trifásico'
    };
    return labels[type] || type;
  };

  return (
    <div className="p-6">
      <h2 className="text-xl font-semibold mb-6">Cálculo de Capacitor para Corrección de Factor de Potencia</h2>
      
      <div className="grid md:grid-cols-2 gap-6">
        {/* Inputs */}
        <div className="space-y-4">
          {/* Tipo de sistema */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tipo de sistema
            </label>
            <div className="space-y-2">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="systemType"
                  value="monofasico"
                  checked={inputs.systemType === 'monofasico'}
                  onChange={(e) => handleInputChange('systemType', e.target.value)}
                  className="mr-2"
                />
                Monofásico
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="systemType"
                  value="bifasico"
                  checked={inputs.systemType === 'bifasico'}
                  onChange={(e) => handleInputChange('systemType', e.target.value)}
                  className="mr-2"
                />
                Bifásico
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="systemType"
                  value="trifasico"
                  checked={inputs.systemType === 'trifasico'}
                  onChange={(e) => handleInputChange('systemType', e.target.value)}
                  className="mr-2"
                />
                Trifásico
              </label>
            </div>
          </div>

          {/* Potencia activa */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Potencia activa
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

          {/* Factor de potencia actual */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Factor de potencia actual
            </label>
            <input
              type="number"
              step="0.01"
              min="0.1"
              max="0.99"
              value={inputs.currentPowerFactor}
              onChange={(e) => handleInputChange('currentPowerFactor', parseFloat(e.target.value) || 0.8)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Factor de potencia deseado */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Factor de potencia deseado
            </label>
            <input
              type="number"
              step="0.01"
              min="0.8"
              max="0.99"
              value={inputs.desiredPowerFactor}
              onChange={(e) => handleInputChange('desiredPowerFactor', parseFloat(e.target.value) || 0.95)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Tensión del sistema */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tensión del sistema
            </label>
            <div className="flex gap-2">
              <input
                type="number"
                value={inputs.systemVoltage}
                onChange={(e) => handleInputChange('systemVoltage', parseFloat(e.target.value) || 0)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <select
                value={inputs.systemVoltageUnit}
                onChange={(e) => handleInputChange('systemVoltageUnit', e.target.value)}
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
                  <div className="text-sm text-blue-600 font-medium">Capacitancia requerida</div>
                  <div className="text-2xl font-bold text-blue-900">{result.capacitanceRequired} {result.capacitanceUnit}</div>
                  <div className="text-xs text-blue-700 mt-1">{result.capacitanceExact} F</div>
                </div>

                <div className="bg-green-50 p-4 rounded-lg">
                  <div className="text-sm text-green-600 font-medium">Potencia reactiva a compensar</div>
                  <div className="text-xl font-bold text-green-900">{result.reactivePowerToCompensate} kvar</div>
                  <div className="text-xs text-green-700 mt-1">{result.reactivePowerToCompensateVar} var</div>
                </div>

                <div className="bg-orange-50 p-4 rounded-lg">
                  <div className="text-sm text-orange-600 font-medium">Ahorro energético estimado</div>
                  <div className="text-xl font-bold text-orange-900">{result.energySavingsPercent}%</div>
                  <div className="text-xs text-orange-700 mt-1">
                    {result.monthlyEnergyReduction} kWh/mes ≈ ${result.monthlyCostSaving}/mes
                  </div>
                </div>

                <div className="bg-purple-50 p-4 rounded-lg">
                  <div className="text-sm text-purple-600 font-medium mb-2">Corriente antes y después</div>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-xs">Antes:</span>
                      <span className="text-sm font-bold text-purple-900">{result.currentBeforeCorrection} A</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs">Después:</span>
                      <span className="text-sm font-bold text-purple-900">{result.currentAfterCorrection} A</span>
                    </div>
                    <div className="text-xs text-purple-700 mt-2">
                      Reducción: {result.currentReduction}%
                    </div>
                  </div>
                </div>

                <div className="bg-yellow-50 p-4 rounded-lg">
                  <div className="text-sm text-yellow-600 font-medium mb-2">Especificaciones del capacitor</div>
                  <div className="text-xs text-yellow-700 space-y-1">
                    <div>• Tensión nominal: {result.capacitorVoltage} V</div>
                    <div>• Potencia reactiva: {result.reactivePowerToCompensate} kvar</div>
                    <div>• Sistema: {getSystemTypeLabel(result.systemType)}</div>
                  </div>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="text-sm text-gray-600 font-medium mb-2">Potencias del sistema</div>
                  <div className="text-xs text-gray-600 space-y-1">
                    <div>• Potencia activa: {result.activePowerKW} kW</div>
                    <div>• Pot. aparente actual: {result.currentApparentPower} kVA</div>
                    <div>• Pot. aparente deseada: {result.desiredApparentPower} kVA</div>
                    <div>• Pot. reactiva actual: {result.currentReactivePower} kvar</div>
                    <div>• Pot. reactiva deseada: {result.desiredReactivePower} kvar</div>
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
          <div><strong>Potencia reactiva actual:</strong> Q₁ = P × tan(arccos(cos φ₁))</div>
          <div><strong>Potencia reactiva deseada:</strong> Q₂ = P × tan(arccos(cos φ₂))</div>
          <div><strong>Potencia reactiva a compensar:</strong> Q_c = Q₁ - Q₂</div>
          <div><strong>Capacitancia monofásica:</strong> C = Q_c / (2πfV²)</div>
          <div><strong>Capacitancia trifásica:</strong> C = Q_c / (3 × 2πfV_fn²)</div>
          <div><strong>Corriente:</strong> I = S / (V × √n) donde n = fases</div>
          <div><strong>Ahorro energético:</strong> A = [1 - (cos φ₁/cos φ₂)²] × 100%</div>
          <div className="text-xs text-blue-700 mt-2">
            <strong>Donde:</strong> P = potencia activa (W), Q = potencia reactiva (var), φ = ángulo de fase, f = frecuencia (Hz), V = tensión (V)
          </div>
        </div>
      </div>
    </div>
  );
};

export default PowerFactorCorrectionAdvancedCalc;