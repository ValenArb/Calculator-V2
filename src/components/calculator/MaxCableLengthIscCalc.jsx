import { useState } from 'react';

const MaxCableLengthIscCalc = () => {
  const [inputs, setInputs] = useState({
    systemType: 'three-phase-neutral',
    voltage: 220,
    protectionCurrent: 16,
    tripCurve: 'B',
    instantaneousTrip: 80,
    conductor: 'copper',
    phaseSection: 1.5,
    phaseParallel: 1,
    neutralSection: 1.5,
    neutralParallel: 1
  });
  
  // Secciones estándar de cables disponibles
  const standardSections = [
    1.5, 2.5, 4, 6, 10, 16, 25, 35, 50, 70, 95, 120, 150, 185, 240, 300, 400, 500
  ];
  
  const [result, setResult] = useState(null);

  const calculate = () => {
    const { systemType, voltage, protectionCurrent, tripCurve, instantaneousTrip, conductor, phaseSection, phaseParallel, neutralSection, neutralParallel } = inputs;
    
    // Resistivity at 20°C (Ω·mm²/m)
    const resistivity = conductor === 'copper' ? 0.0175 : 0.028;
    
    // Calcular resistencia de fase
    const phaseResistancePerKm = resistivity / phaseSection * 1000; // Ω/km
    const phaseResistancePerM = phaseResistancePerKm / phaseParallel / 1000; // Ω/m
    
    // Calcular resistencia de neutro
    const neutralResistancePerKm = resistivity / neutralSection * 1000; // Ω/km
    const neutralResistancePerM = neutralResistancePerKm / neutralParallel / 1000; // Ω/m
    
    // Multiplicador según curva de disparo
    let tripMultiplier;
    switch (tripCurve) {
      case 'B':
        tripMultiplier = 5; // 3-5 In
        break;
      case 'C':
        tripMultiplier = 10; // 5-10 In
        break;
      case 'D':
        tripMultiplier = 20; // 10-20 In
        break;
    }
    
    // Corriente de operación magnética
    const magneticTripCurrent = protectionCurrent * tripMultiplier;
    
    // Usar la corriente de intervención inmediata si se proporciona
    const minOperationCurrent = instantaneousTrip || magneticTripCurrent;
    
    // Calcular longitud máxima según tipo de sistema
    let maxLength;
    let formula = '';
    
    switch (systemType) {
      case 'three-phase-neutral':
        // L = U / (Isc * √3 * (Rf + Rn))
        const totalResistanceTPN = phaseResistancePerM + neutralResistancePerM;
        maxLength = voltage / (minOperationCurrent * Math.sqrt(3) * totalResistanceTPN);
        formula = 'L_max = U / (Isc × √3 × (Rf + Rn))';
        break;
        
      case 'two-phase':
        // L = U / (Isc * (Rf1 + Rf2))
        const totalResistanceBP = 2 * phaseResistancePerM;
        maxLength = voltage / (minOperationCurrent * totalResistanceBP);
        formula = 'L_max = U / (Isc × (Rf1 + Rf2))';
        break;
        
      case 'single-phase':
        // L = U / (Isc * (Rf + Rn))
        const totalResistanceSP = phaseResistancePerM + neutralResistancePerM;
        maxLength = voltage / (minOperationCurrent * totalResistanceSP);
        formula = 'L_max = U / (Isc × (Rf + Rn))';
        break;
    }
    
    // Calcular corriente de cortocircuito real en el extremo
    let actualIsc;
    switch (systemType) {
      case 'three-phase-neutral':
        actualIsc = voltage / (Math.sqrt(3) * (phaseResistancePerM + neutralResistancePerM) * maxLength);
        break;
      case 'two-phase':
        actualIsc = voltage / (2 * phaseResistancePerM * maxLength);
        break;
      case 'single-phase':
        actualIsc = voltage / ((phaseResistancePerM + neutralResistancePerM) * maxLength);
        break;
    }
    
    // Tiempo de disparo estimado (simplificado)
    const estimatedTripTime = actualIsc > minOperationCurrent ? 0.1 : 2.0; // segundos
    
    setResult({
      maxLength: maxLength.toFixed(1),
      actualIsc: actualIsc.toFixed(0),
      estimatedTripTime: estimatedTripTime.toFixed(2),
      minOperationCurrent: minOperationCurrent.toFixed(0),
      phaseResistancePerKm: phaseResistancePerKm.toFixed(4),
      neutralResistancePerKm: neutralResistancePerKm.toFixed(4),
      formula: formula,
      systemType: systemType,
      conductor: conductor,
      tripCurve: tripCurve
    });
  };

  const handleInputChange = (field, value) => {
    setInputs(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="p-6">
      <h2 className="text-xl font-semibold mb-6">Longitud máxima del cable (Isc)</h2>
      
      <div className="grid md:grid-cols-2 gap-6">
        {/* Inputs */}
        <div className="space-y-4">
          {/* Tipo de corriente */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tipo de corriente
            </label>
            <select
              value={inputs.systemType}
              onChange={(e) => handleInputChange('systemType', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="three-phase-neutral">Trifásico + Neutro</option>
              <option value="two-phase">Bifásico</option>
              <option value="single-phase">Monofásico</option>
            </select>
          </div>

          {/* Tensión */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tensión (V)
            </label>
            <input
              type="number"
              value={inputs.voltage}
              onChange={(e) => handleInputChange('voltage', parseFloat(e.target.value) || 220)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Corriente nominal del dispositivo de protección */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Corriente nominal del dispositivo de protección (A)
            </label>
            <input
              type="number"
              value={inputs.protectionCurrent}
              onChange={(e) => handleInputChange('protectionCurrent', parseFloat(e.target.value) || 16)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Curva de disparo */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Curva de disparo
            </label>
            <select
              value={inputs.tripCurve}
              onChange={(e) => handleInputChange('tripCurve', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="B">B</option>
              <option value="C">C</option>
              <option value="D">D</option>
            </select>
          </div>

          {/* Corriente de intervención inmediata */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Corriente de intervención inmediata (A)
            </label>
            <input
              type="number"
              value={inputs.instantaneousTrip}
              onChange={(e) => handleInputChange('instantaneousTrip', parseFloat(e.target.value) || 80)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
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
              Sección de fase (mm²)
            </label>
            <select
              value={inputs.phaseSection}
              onChange={(e) => handleInputChange('phaseSection', parseFloat(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {standardSections.map(section => (
                <option key={section} value={section}>{section}</option>
              ))}
            </select>
          </div>

          {/* Conductores de fase en paralelo */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Conductores de fase en paralelo
            </label>
            <select
              value={inputs.phaseParallel}
              onChange={(e) => handleInputChange('phaseParallel', parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {[1, 2, 3, 4, 5, 6, 8, 10, 12].map(num => (
                <option key={num} value={num}>{num}</option>
              ))}
            </select>
          </div>

          {/* Sección de neutro */}
          {(inputs.systemType === 'three-phase-neutral' || inputs.systemType === 'single-phase') && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Sección de neutro (mm²)
              </label>
              <select
                value={inputs.neutralSection}
                onChange={(e) => handleInputChange('neutralSection', parseFloat(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {standardSections.map(section => (
                  <option key={section} value={section}>{section}</option>
                ))}
              </select>
            </div>
          )}

          {/* Conductores de neutro en paralelo */}
          {(inputs.systemType === 'three-phase-neutral' || inputs.systemType === 'single-phase') && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Conductores de neutro en paralelo
              </label>
              <select
                value={inputs.neutralParallel}
                onChange={(e) => handleInputChange('neutralParallel', parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {[1, 2, 3, 4, 5, 6, 8, 10, 12].map(num => (
                  <option key={num} value={num}>{num}</option>
                ))}
              </select>
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
              <div className="bg-green-50 p-4 rounded-lg">
                <div className="text-sm text-green-600 font-medium">Longitud máxima del cable para garantizar disparo del dispositivo de protección</div>
                <div className="text-2xl font-bold text-green-900">{result.maxLength} m</div>
              </div>

              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="text-sm text-blue-600 font-medium">Corriente de cortocircuito en el extremo de la línea</div>
                <div className="text-xl font-bold text-blue-900">{result.actualIsc} A</div>
              </div>

              <div className="bg-orange-50 p-4 rounded-lg">
                <div className="text-sm text-orange-600 font-medium">Tiempo de disparo estimado del dispositivo</div>
                <div className="text-xl font-bold text-orange-900">{result.estimatedTripTime} s</div>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="text-sm text-gray-600 font-medium mb-2">Información del Cálculo</div>
                <div className="text-xs text-gray-600 space-y-1">
                  <div>• Tipo: {result.systemType.replace('-', ' ').replace('three phase neutral', 'Trifásico + Neutro').replace('two phase', 'Bifásico').replace('single phase', 'Monofásico')}</div>
                  <div>• Material: {result.conductor === 'copper' ? 'Cobre' : 'Aluminio'}</div>
                  <div>• Curva de disparo: {result.tripCurve}</div>
                  <div>• Corriente mínima de operación: {result.minOperationCurrent} A</div>
                  <div>• Resistencia fase: {result.phaseResistancePerKm} Ω/km</div>
                  <div>• Resistencia neutro: {result.neutralResistancePerKm} Ω/km</div>
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
            <>
              <div><strong>Fórmula aplicada:</strong> {result.formula}</div>
              <div className="text-xs text-blue-700 mt-2">
                <strong>Donde:</strong> L_max = longitud máxima, U = tensión, Isc = corriente de cortocircuito mínima, Rf = resistencia fase, Rn = resistencia neutro
              </div>
            </>
          )}
          {!result && (
            <>
              <div><strong>Trifásico + Neutro:</strong> L_max = U / (Isc × √3 × (Rf + Rn))</div>
              <div><strong>Bifásico:</strong> L_max = U / (Isc × (Rf1 + Rf2))</div>
              <div><strong>Monofásico:</strong> L_max = U / (Isc × (Rf + Rn))</div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default MaxCableLengthIscCalc;
