import { useState } from 'react';

const ShortCircuitCurrentCalc = () => {
  const [inputs, setInputs] = useState({
    currentType: 'three-phase-neutral',
    threePhaseCurrent: 10,
    threePhasePF: 0.2,
    threePhaseVoltage: 380,
    phaseNeutralCurrent: 8,
    phaseNeutralPF: 0.3,
    singlePhaseVoltage: 220,
    lineLength: 100,
    lengthUnit: 'm',
    conductor: 'copper',
    cableType: 'unipolar',
    phaseSection: 16,
    phaseConductorsParallel: 1,
    neutralSection: 16,
    neutralConductorsParallel: 1
  });

  const [result, setResult] = useState(null);

  // Resistividades en Ω·mm²/m a 20°C
  const resistivity = {
    copper: 0.0175,
    aluminum: 0.028
  };

  // Reactancias aproximadas en Ω/m para diferentes tipos de cables
  const reactancePerMeter = {
    unipolar: 0.08e-3, // 0.08 mΩ/m
    multipolar: 0.06e-3 // 0.06 mΩ/m
  };

  const standardSections = [1.5, 2.5, 4, 6, 10, 16, 25, 35, 50, 70, 95, 120, 150, 185, 240, 300, 400, 500];

  const calculate = () => {
    const { currentType, threePhaseCurrent, threePhasePF, threePhaseVoltage,
            phaseNeutralCurrent, phaseNeutralPF, singlePhaseVoltage,
            lineLength, lengthUnit, conductor, cableType,
            phaseSection, phaseConductorsParallel, neutralSection, neutralConductorsParallel } = inputs;

    // Convertir longitud a metros
    const lengthInM = lengthUnit === 'km' ? lineLength * 1000 : lineLength;

    // Calcular resistencia de fase
    const phaseResistancePerM = (resistivity[conductor] / phaseSection) / phaseConductorsParallel; // Ω/m
    const phaseReactancePerM = reactancePerMeter[cableType] / phaseConductorsParallel; // Ω/m

    // Calcular resistencia de neutro
    const neutralResistancePerM = (resistivity[conductor] / neutralSection) / neutralConductorsParallel; // Ω/m
    const neutralReactancePerM = reactancePerMeter[cableType] / neutralConductorsParallel; // Ω/m

    // Impedancias totales de la línea
    const phaseResistanceTotal = phaseResistancePerM * lengthInM;
    const phaseReactanceTotal = phaseReactancePerM * lengthInM;
    const neutralResistanceTotal = neutralResistancePerM * lengthInM;
    const neutralReactanceTotal = neutralReactancePerM * lengthInM;

    let shortCircuitCurrent = 0;
    let totalImpedance = 0;
    let resultPowerFactor = 0;
    let shortCircuitPower = 0;
    let voltage = 0;
    let sourceImpedance = 0;
    let lineImpedance = 0;

    switch (currentType) {
      case 'three-phase-neutral':
      case 'three-phase':
        // Usar datos trifásicos
        voltage = threePhaseVoltage;
        const sourcePhaseCurrent = threePhaseCurrent * 1000; // Convertir kA a A
        
        // Impedancia de la fuente (red): Z_source = V / (√3 × I_cc_source)
        sourceImpedance = voltage / (Math.sqrt(3) * sourcePhaseCurrent);
        
        // Impedancia de la línea para cortocircuito trifásico
        const lineResistance = phaseResistanceTotal;
        const lineReactance = phaseReactanceTotal;
        lineImpedance = Math.sqrt(lineResistance * lineResistance + lineReactance * lineReactance);
        
        // Impedancia total
        totalImpedance = sourceImpedance + lineImpedance;
        
        // Corriente de cortocircuito en el punto específico
        shortCircuitCurrent = voltage / (Math.sqrt(3) * totalImpedance);
        
        // Factor de potencia resultante
        const totalResistance = (sourceImpedance * threePhasePF) + lineResistance;
        const totalReactance = (sourceImpedance * Math.sin(Math.acos(threePhasePF))) + lineReactance;
        resultPowerFactor = totalResistance / Math.sqrt(totalResistance * totalResistance + totalReactance * totalReactance);
        
        // Potencia de cortocircuito trifásica
        shortCircuitPower = Math.sqrt(3) * voltage * shortCircuitCurrent / 1000; // kW
        break;

      case 'single-phase-neutral':
        // Usar datos monofásicos fase-neutro
        voltage = singlePhaseVoltage;
        const sourceMonoCurrent = phaseNeutralCurrent * 1000; // Convertir kA a A
        
        // Impedancia de la fuente monofásica: Z_source = V / I_cc_source
        sourceImpedance = voltage / sourceMonoCurrent;
        
        // Impedancia de la línea monofásica (fase + neutro)
        const monoLineResistance = phaseResistanceTotal + neutralResistanceTotal;
        const monoLineReactance = phaseReactanceTotal + neutralReactanceTotal;
        lineImpedance = Math.sqrt(monoLineResistance * monoLineResistance + monoLineReactance * monoLineReactance);
        
        // Impedancia total
        totalImpedance = sourceImpedance + lineImpedance;
        
        // Corriente de cortocircuito monofásica
        shortCircuitCurrent = voltage / totalImpedance;
        
        // Factor de potencia resultante
        const monoTotalResistance = (sourceImpedance * phaseNeutralPF) + monoLineResistance;
        const monoTotalReactance = (sourceImpedance * Math.sin(Math.acos(phaseNeutralPF))) + monoLineReactance;
        resultPowerFactor = monoTotalResistance / Math.sqrt(monoTotalResistance * monoTotalResistance + monoTotalReactance * monoTotalReactance);
        
        // Potencia de cortocircuito monofásica
        shortCircuitPower = voltage * shortCircuitCurrent / 1000; // kW
        break;

      case 'two-phase':
        // Cortocircuito bifásico
        voltage = threePhaseVoltage;
        const sourceBiphaseCurrent = threePhaseCurrent * 1000 * 0.866; // I_bifásico = I_trifásico × √3/2
        
        // Impedancia de la fuente bifásica
        sourceImpedance = voltage / sourceBiphaseCurrent;
        
        // Impedancia de la línea bifásica
        lineImpedance = Math.sqrt(phaseResistanceTotal * phaseResistanceTotal + phaseReactanceTotal * phaseReactanceTotal);
        
        // Impedancia total
        totalImpedance = sourceImpedance + lineImpedance;
        
        // Corriente de cortocircuito bifásica
        shortCircuitCurrent = voltage / totalImpedance;
        
        // Factor de potencia resultante
        const biTotalResistance = (sourceImpedance * threePhasePF) + phaseResistanceTotal;
        const biTotalReactance = (sourceImpedance * Math.sin(Math.acos(threePhasePF))) + phaseReactanceTotal;
        resultPowerFactor = biTotalResistance / Math.sqrt(biTotalResistance * biTotalResistance + biTotalReactance * biTotalReactance);
        
        // Potencia de cortocircuito bifásica
        shortCircuitPower = 2 * voltage * shortCircuitCurrent / 1000; // kW
        break;
    }

    setResult({
      shortCircuitCurrent: (shortCircuitCurrent / 1000).toFixed(3), // kA
      totalImpedance: totalImpedance.toFixed(4),
      sourceImpedance: sourceImpedance.toFixed(4),
      lineImpedance: lineImpedance.toFixed(4),
      resultPowerFactor: resultPowerFactor.toFixed(3),
      shortCircuitPower: shortCircuitPower.toFixed(1),
      voltage: voltage,
      currentType: currentType,
      lengthInM: lengthInM,
      phaseResistancePerKm: (phaseResistancePerM * 1000).toFixed(4),
      neutralResistancePerKm: (neutralResistancePerM * 1000).toFixed(4),
      conductor: conductor,
      cableType: cableType,
      phaseSection: phaseSection,
      neutralSection: neutralSection,
      phaseConductorsParallel: phaseConductorsParallel,
      neutralConductorsParallel: neutralConductorsParallel
    });
  };

  const handleInputChange = (field, value) => {
    setInputs(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="p-6">
      <h2 className="text-xl font-semibold mb-6">Corriente de Cortocircuito en un Punto Específico de la Línea</h2>
      
      <div className="grid md:grid-cols-2 gap-6">
        {/* Inputs */}
        <div className="space-y-4">
          {/* Tipo de corriente */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tipo de corriente
            </label>
            <select
              value={inputs.currentType}
              onChange={(e) => handleInputChange('currentType', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="three-phase-neutral">Trifásico + Neutro</option>
              <option value="three-phase">Trifásico</option>
              <option value="single-phase-neutral">Monofásico + Neutro</option>
              <option value="two-phase">Bifásico</option>
            </select>
          </div>

          {/* Datos trifásicos */}
          {(inputs.currentType === 'three-phase-neutral' || inputs.currentType === 'three-phase' || inputs.currentType === 'two-phase') && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Corriente de cortocircuito trifásica al inicio de la línea
                </label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    value={inputs.threePhaseCurrent}
                    onChange={(e) => handleInputChange('threePhaseCurrent', parseFloat(e.target.value) || 0)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <span className="px-3 py-2 bg-gray-100 border border-gray-300 rounded-md text-gray-700">kA</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Cortocircuito trifásico cos φ
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0.1"
                  max="1"
                  value={inputs.threePhasePF}
                  onChange={(e) => handleInputChange('threePhasePF', parseFloat(e.target.value) || 0.2)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tensión trifásica
                </label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    value={inputs.threePhaseVoltage}
                    onChange={(e) => handleInputChange('threePhaseVoltage', parseFloat(e.target.value) || 380)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <span className="px-3 py-2 bg-gray-100 border border-gray-300 rounded-md text-gray-700">V</span>
                </div>
              </div>
            </>
          )}

          {/* Datos monofásicos */}
          {inputs.currentType === 'single-phase-neutral' && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Corriente de cortocircuito fase-neutro al inicio de la línea
                </label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    value={inputs.phaseNeutralCurrent}
                    onChange={(e) => handleInputChange('phaseNeutralCurrent', parseFloat(e.target.value) || 0)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <span className="px-3 py-2 bg-gray-100 border border-gray-300 rounded-md text-gray-700">kA</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  cos φ cortocircuito fase-neutro
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0.1"
                  max="1"
                  value={inputs.phaseNeutralPF}
                  onChange={(e) => handleInputChange('phaseNeutralPF', parseFloat(e.target.value) || 0.3)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tensión monofásica
                </label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    value={inputs.singlePhaseVoltage}
                    onChange={(e) => handleInputChange('singlePhaseVoltage', parseFloat(e.target.value) || 220)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <span className="px-3 py-2 bg-gray-100 border border-gray-300 rounded-md text-gray-700">V</span>
                </div>
              </div>
            </>
          )}

          {/* Longitud de la línea */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Longitud de la línea
            </label>
            <div className="flex gap-2">
              <input
                type="number"
                value={inputs.lineLength}
                onChange={(e) => handleInputChange('lineLength', parseFloat(e.target.value) || 0)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <select
                value={inputs.lengthUnit}
                onChange={(e) => handleInputChange('lengthUnit', e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="m">m</option>
                <option value="km">km</option>
              </select>
            </div>
          </div>

          {/* Conductor */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Conductor
            </label>
            <select
              value={inputs.conductor}
              onChange={(e) => handleInputChange('conductor', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="copper">Cobre</option>
              <option value="aluminum">Aluminio</option>
            </select>
          </div>

          {/* Tipo de cable */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tipo de cable
            </label>
            <select
              value={inputs.cableType}
              onChange={(e) => handleInputChange('cableType', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="unipolar">Unipolar</option>
              <option value="multipolar">Multipolar</option>
            </select>
          </div>

          {/* Sección de fase */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Sección de fase
            </label>
            <div className="flex gap-2">
              <select
                value={inputs.phaseSection}
                onChange={(e) => handleInputChange('phaseSection', parseFloat(e.target.value))}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {standardSections.map(section => (
                  <option key={section} value={section}>{section}</option>
                ))}
              </select>
              <span className="px-3 py-2 bg-gray-100 border border-gray-300 rounded-md text-gray-700">mm²</span>
            </div>
          </div>

          {/* Conductores de fase en paralelo */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Conductores de fase en paralelo
            </label>
            <select
              value={inputs.phaseConductorsParallel}
              onChange={(e) => handleInputChange('phaseConductorsParallel', parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {[1, 2, 3, 4, 5, 6, 8, 10, 12].map(num => (
                <option key={num} value={num}>{num}</option>
              ))}
            </select>
          </div>

          {/* Sección de neutro (solo para tipos que lo requieren) */}
          {(inputs.currentType === 'three-phase-neutral' || inputs.currentType === 'single-phase-neutral') && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Sección de neutro
                </label>
                <div className="flex gap-2">
                  <select
                    value={inputs.neutralSection}
                    onChange={(e) => handleInputChange('neutralSection', parseFloat(e.target.value))}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {standardSections.map(section => (
                      <option key={section} value={section}>{section}</option>
                    ))}
                  </select>
                  <span className="px-3 py-2 bg-gray-100 border border-gray-300 rounded-md text-gray-700">mm²</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Conductores de neutro en paralelo
                </label>
                <select
                  value={inputs.neutralConductorsParallel}
                  onChange={(e) => handleInputChange('neutralConductorsParallel', parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {[1, 2, 3, 4, 5, 6, 8, 10, 12].map(num => (
                    <option key={num} value={num}>{num}</option>
                  ))}
                </select>
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
              <div className="bg-red-50 p-4 rounded-lg">
                <div className="text-sm text-red-600 font-medium">Corriente de cortocircuito calculada</div>
                <div className="text-2xl font-bold text-red-900">{result.shortCircuitCurrent} kA</div>
                <div className="text-xs text-red-700 mt-1">En el punto específico de la línea</div>
              </div>

              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="text-sm text-blue-600 font-medium">Impedancia total del circuito</div>
                <div className="text-xl font-bold text-blue-900">{result.totalImpedance} Ω</div>
                <div className="text-xs text-blue-700 mt-1">
                  Fuente: {result.sourceImpedance} Ω | Línea: {result.lineImpedance} Ω
                </div>
              </div>

              <div className="bg-orange-50 p-4 rounded-lg">
                <div className="text-sm text-orange-600 font-medium">Factor de potencia resultante</div>
                <div className="text-xl font-bold text-orange-900">{result.resultPowerFactor}</div>
              </div>

              <div className="bg-purple-50 p-4 rounded-lg">
                <div className="text-sm text-purple-600 font-medium">Potencia de cortocircuito</div>
                <div className="text-xl font-bold text-purple-900">{result.shortCircuitPower} kW</div>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="text-sm text-gray-600 font-medium mb-2">Parámetros del cálculo</div>
                <div className="text-xs text-gray-600 space-y-1">
                  <div>• Tipo: {result.currentType.replace('-', ' ')}</div>
                  <div>• Tensión: {result.voltage} V</div>
                  <div>• Longitud: {result.lengthInM} m</div>
                  <div>• Material: {result.conductor === 'copper' ? 'Cobre' : 'Aluminio'}</div>
                  <div>• Cable: {result.cableType === 'unipolar' ? 'Unipolar' : 'Multipolar'}</div>
                  <div>• Sección fase: {result.phaseSection} mm² × {result.phaseConductorsParallel}</div>
                  {(inputs.currentType === 'three-phase-neutral' || inputs.currentType === 'single-phase-neutral') && (
                    <div>• Sección neutro: {result.neutralSection} mm² × {result.neutralConductorsParallel}</div>
                  )}
                  <div>• R fase: {result.phaseResistancePerKm} Ω/km</div>
                  {(inputs.currentType === 'three-phase-neutral' || inputs.currentType === 'single-phase-neutral') && (
                    <div>• R neutro: {result.neutralResistancePerKm} Ω/km</div>
                  )}
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

      {/* Fórmulas utilizadas */}
      <div className="mt-8 bg-blue-50 p-4 rounded-lg border-l-4 border-blue-500">
        <h3 className="text-lg font-semibold text-blue-900 mb-2">Fórmulas utilizadas</h3>
        <div className="text-blue-800 font-mono space-y-2 text-sm">
          <div><strong>Impedancia de fuente:</strong> Z_f = V / (√3 × I_cc_fuente) [trifásico]</div>
          <div><strong>Impedancia de línea:</strong> Z_l = √(R² + X²)</div>
          <div><strong>Resistencia:</strong> R = ρ × L / S [Ω/m]</div>
          <div><strong>Trifásico:</strong> I_cc = V / (√3 × Z_total)</div>
          <div><strong>Monofásico:</strong> I_cc = V / Z_total</div>
          <div><strong>Bifásico:</strong> I_cc = V / Z_total</div>
          <div><strong>Potencia de CC:</strong> P = √3 × V × I_cc [trifásico]</div>
          <div className="text-xs text-blue-700 mt-2">
            <strong>Donde:</strong> V = tensión, I_cc = corriente de cortocircuito, Z = impedancia, R = resistencia, X = reactancia, ρ = resistividad, L = longitud, S = sección
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShortCircuitCurrentCalc;