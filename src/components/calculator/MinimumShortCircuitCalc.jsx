import { useState } from 'react';

const MinimumShortCircuitCalc = () => {
  const [inputs, setInputs] = useState({
    currentType: 'three-phase-neutral',
    voltage: 220,
    voltageUnit: 'V',
    lineLength: 100,
    lengthUnit: 'm',
    conductor: 'copper',
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

  const standardSections = [1.5, 2.5, 4, 6, 10, 16, 25, 35, 50, 70, 95, 120, 150, 185, 240, 300, 400, 500];

  const calculate = () => {
    const { currentType, voltage, voltageUnit, lineLength, lengthUnit, conductor,
            phaseSection, phaseConductorsParallel, neutralSection, neutralConductorsParallel } = inputs;

    // Convertir tensión a V
    const voltageConversions = { 'mV': 0.001, 'V': 1, 'kV': 1000 };
    const voltageInV = voltage * voltageConversions[voltageUnit];

    // Convertir longitud a metros
    const lengthConversions = { 'm': 1, 'km': 1000, 'ft': 0.3048, 'mi': 1609.34 };
    const lengthInM = lineLength * lengthConversions[lengthUnit];

    // Calcular resistencia de fase
    const phaseResistancePerM = (resistivity[conductor] / phaseSection) / phaseConductorsParallel; // Ω/m
    const phaseResistanceTotal = phaseResistancePerM * lengthInM; // Ω

    // Calcular resistencia de neutro
    const neutralResistancePerM = (resistivity[conductor] / neutralSection) / neutralConductorsParallel; // Ω/m
    const neutralResistanceTotal = neutralResistancePerM * lengthInM; // Ω

    let minimumShortCircuitCurrent = 0;
    let totalResistance = 0;
    let formula = '';
    let description = '';

    switch (currentType) {
      case 'three-phase-neutral':
        // Para cortocircuito mínimo trifásico con neutro (fase-neutro)
        totalResistance = phaseResistanceTotal + neutralResistanceTotal;
        minimumShortCircuitCurrent = voltageInV / totalResistance;
        formula = 'I_cc_min = V_fase-neutro / (R_fase + R_neutro)';
        description = 'Cortocircuito monofásico (fase-neutro) - el más limitado';
        break;

      case 'two-phase':
        // Cortocircuito bifásico
        totalResistance = 2 * phaseResistanceTotal;
        minimumShortCircuitCurrent = voltageInV / totalResistance;
        formula = 'I_cc_min = V_línea / (2 × R_fase)';
        description = 'Cortocircuito bifásico';
        break;

      case 'single-phase':
        // Cortocircuito monofásico
        totalResistance = phaseResistanceTotal + neutralResistanceTotal;
        minimumShortCircuitCurrent = voltageInV / totalResistance;
        formula = 'I_cc_min = V / (R_fase + R_neutro)';
        description = 'Cortocircuito monofásico';
        break;

      case 'dc':
        // Cortocircuito en corriente continua
        totalResistance = 2 * phaseResistanceTotal; // Ida y vuelta
        minimumShortCircuitCurrent = voltageInV / totalResistance;
        formula = 'I_cc_min = V / (2 × R_conductor)';
        description = 'Cortocircuito en corriente continua';
        break;
    }

    // Calcular otros parámetros
    const shortCircuitPower = voltageInV * minimumShortCircuitCurrent / 1000; // kW
    const energyPerSecond = minimumShortCircuitCurrent * minimumShortCircuitCurrent * totalResistance / 1000; // kW

    // Determinar si es adecuado para disparo de protecciones
    // Generalmente se requiere I_cc >= 5 × I_nominal_protección para disparo magnético
    const recommendedMinimumForProtection = minimumShortCircuitCurrent / 5; // A (aproximación)

    setResult({
      minimumShortCircuitCurrent: (minimumShortCircuitCurrent / 1000).toFixed(3), // kA
      minimumShortCircuitCurrentA: minimumShortCircuitCurrent.toFixed(0), // A
      totalResistance: totalResistance.toFixed(4),
      shortCircuitPower: shortCircuitPower.toFixed(1),
      energyPerSecond: energyPerSecond.toFixed(2),
      recommendedMinimumForProtection: recommendedMinimumForProtection.toFixed(0),
      formula: formula,
      description: description,
      phaseResistancePerKm: (phaseResistancePerM * 1000).toFixed(4),
      neutralResistancePerKm: (neutralResistancePerM * 1000).toFixed(4),
      phaseResistanceTotal: phaseResistanceTotal.toFixed(4),
      neutralResistanceTotal: neutralResistanceTotal.toFixed(4),
      voltageInV: voltageInV,
      lengthInM: lengthInM,
      currentType: currentType,
      conductor: conductor,
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
      <h2 className="text-xl font-semibold mb-6">Corriente de Cortocircuito Mínima</h2>
      
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
              <option value="two-phase">Bifásico</option>
              <option value="single-phase">Monofásico</option>
              <option value="dc">Corriente Continua</option>
            </select>
          </div>

          {/* Tensión */}
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
                <option value="ft">ft</option>
                <option value="mi">mi</option>
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
          {(inputs.currentType === 'three-phase-neutral' || inputs.currentType === 'single-phase') && (
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
                <div className="text-sm text-red-600 font-medium">Corriente de cortocircuito mínima</div>
                <div className="text-2xl font-bold text-red-900">{result.minimumShortCircuitCurrent} kA</div>
                <div className="text-xs text-red-700 mt-1">{result.minimumShortCircuitCurrentA} A</div>
              </div>

              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="text-sm text-blue-600 font-medium">Resistencia total del circuito</div>
                <div className="text-xl font-bold text-blue-900">{result.totalResistance} Ω</div>
              </div>

              <div className="bg-green-50 p-4 rounded-lg">
                <div className="text-sm text-green-600 font-medium">Potencia de cortocircuito</div>
                <div className="text-xl font-bold text-green-900">{result.shortCircuitPower} kW</div>
              </div>

              <div className="bg-orange-50 p-4 rounded-lg">
                <div className="text-sm text-orange-600 font-medium">Energía disipada por segundo</div>
                <div className="text-xl font-bold text-orange-900">{result.energyPerSecond} kW</div>
              </div>

              <div className="bg-purple-50 p-4 rounded-lg">
                <div className="text-sm text-purple-600 font-medium">Protección recomendada máxima</div>
                <div className="text-lg font-bold text-purple-900">{result.recommendedMinimumForProtection} A</div>
                <div className="text-xs text-purple-700 mt-1">Para garantizar disparo magnético (I_cc ≥ 5×I_n)</div>
              </div>

              <div className="bg-yellow-50 p-4 rounded-lg">
                <div className="text-sm text-yellow-600 font-medium mb-2">Tipo de cortocircuito</div>
                <div className="text-sm font-semibold text-yellow-900">{result.description}</div>
                <div className="text-xs text-yellow-700 mt-1">Este es el caso más limitante</div>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="text-sm text-gray-600 font-medium mb-2">Parámetros del cálculo</div>
                <div className="text-xs text-gray-600 space-y-1">
                  <div>• Tensión: {result.voltageInV} V</div>
                  <div>• Longitud: {result.lengthInM} m</div>
                  <div>• Material: {result.conductor === 'copper' ? 'Cobre' : 'Aluminio'}</div>
                  <div>• Sección fase: {result.phaseSection} mm² × {result.phaseConductorsParallel}</div>
                  {(inputs.currentType === 'three-phase-neutral' || inputs.currentType === 'single-phase') && (
                    <div>• Sección neutro: {result.neutralSection} mm² × {result.neutralConductorsParallel}</div>
                  )}
                  <div>• R fase total: {result.phaseResistanceTotal} Ω</div>
                  {(inputs.currentType === 'three-phase-neutral' || inputs.currentType === 'single-phase') && (
                    <div>• R neutro total: {result.neutralResistanceTotal} Ω</div>
                  )}
                  <div>• R fase por km: {result.phaseResistancePerKm} Ω/km</div>
                  {(inputs.currentType === 'three-phase-neutral' || inputs.currentType === 'single-phase') && (
                    <div>• R neutro por km: {result.neutralResistancePerKm} Ω/km</div>
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
          {result && (
            <div><strong>Fórmula aplicada:</strong> {result.formula}</div>
          )}
          {!result && (
            <>
              <div><strong>Trifásico + Neutro (fase-neutro):</strong> I_cc_min = V_fn / (R_fase + R_neutro)</div>
              <div><strong>Bifásico:</strong> I_cc_min = V_línea / (2 × R_fase)</div>
              <div><strong>Monofásico:</strong> I_cc_min = V / (R_fase + R_neutro)</div>
              <div><strong>DC:</strong> I_cc_min = V / (2 × R_conductor)</div>
            </>
          )}
          <div><strong>Resistencia:</strong> R = ρ × L / (S × n_paralelo)</div>
          <div><strong>Potencia:</strong> P = V × I_cc</div>
          <div><strong>Energía:</strong> E = I² × R</div>
          <div className="text-xs text-blue-700 mt-2">
            <strong>Donde:</strong> V = tensión, I_cc = corriente de cortocircuito, R = resistencia, ρ = resistividad, L = longitud, S = sección, n = conductores en paralelo
          </div>
          <div className="text-xs text-blue-700">
            <strong>Nota:</strong> La corriente de cortocircuito mínima determina la capacidad de disparo de las protecciones
          </div>
        </div>
      </div>
    </div>
  );
};

export default MinimumShortCircuitCalc;