import { useState } from 'react';

const CableShortCircuitProtectionCalc = () => {
  const [inputs, setInputs] = useState({
    shortCircuitCurrent: 10,
    currentUnit: 'kA',
    interventionTime: 100,
    timeUnit: 'ms',
    conductorType: 'phase',
    caliber: 16,
    caliberUnit: 'mm²',
    material: 'copper',
    insulation: 'PVC',
    kValue: 115
  });

  const [result, setResult] = useState(null);

  // Constantes K según material y aislamiento
  const kConstants = {
    'copper-PVC': 115,
    'copper-XLPE': 143,
    'copper-EPR': 143,
    'aluminum-PVC': 76,
    'aluminum-XLPE': 94,
    'aluminum-EPR': 94
  };

  // Secciones estándar
  const standardSections = [
    1.5, 2.5, 4, 6, 10, 16, 25, 35, 50, 70, 95, 120, 150, 185, 240, 300, 400, 500
  ];

  const calculate = () => {
    const { shortCircuitCurrent, currentUnit, interventionTime, timeUnit, conductorType, caliber, caliberUnit, material, insulation, kValue } = inputs;

    // Convertir corriente a Amperios
    const currentInA = currentUnit === 'kA' ? shortCircuitCurrent * 1000 : shortCircuitCurrent;

    // Convertir tiempo a segundos
    const timeInS = timeUnit === 'ms' ? interventionTime / 1000 : interventionTime;

    // Obtener constante K apropiada
    const materialInsulationKey = `${material}-${insulation}`;
    const kConstant = kConstants[materialInsulationKey] || kValue;

    // Calcular sección mínima requerida usando I²t
    // S = √(I² × t) / k
    const minSectionRequired = Math.sqrt((currentInA * currentInA * timeInS)) / kConstant;

    // Encontrar la sección estándar más cercana superior
    const recommendedSection = standardSections.find(section => section >= minSectionRequired) || 'Mayor a 500mm²';

    // Verificar si la sección actual es adecuada
    const isAdequate = caliber >= minSectionRequired;

    // Calcular factor de seguridad
    const safetyFactor = caliber / minSectionRequired;

    // Calcular energía específica (I²t)
    const specificEnergy = (currentInA * currentInA * timeInS) / 1000000; // MJ/mm²

    // Temperatura máxima estimada durante cortocircuito
    // T = T₀ + (I²t/k²S²) × (1/α) donde α ≈ 0.00393 para cobre, 0.00403 para aluminio
    const alpha = material === 'copper' ? 0.00393 : 0.00403;
    const baseTemp = insulation === 'PVC' ? 70 : 90; // Temperatura base del aislamiento
    const tempRise = (specificEnergy * 1000000) / (kConstant * kConstant * caliber * caliber * alpha);
    const maxTemp = baseTemp + tempRise;

    setResult({
      minSectionRequired: minSectionRequired.toFixed(2),
      recommendedSection: recommendedSection,
      currentSection: caliber,
      isAdequate: isAdequate,
      safetyFactor: safetyFactor.toFixed(2),
      specificEnergy: specificEnergy.toFixed(3),
      kConstant: kConstant,
      maxTemperature: maxTemp.toFixed(0),
      currentInA: currentInA,
      timeInS: timeInS,
      material: material,
      insulation: insulation,
      conductorType: conductorType
    });
  };

  const handleInputChange = (field, value) => {
    setInputs(prev => {
      const newInputs = { ...prev, [field]: value };
      
      // Actualizar K automáticamente cuando cambia material o aislamiento
      if (field === 'material' || field === 'insulation') {
        const materialKey = field === 'material' ? value : prev.material;
        const insulationKey = field === 'insulation' ? value : prev.insulation;
        const key = `${materialKey}-${insulationKey}`;
        newInputs.kValue = kConstants[key] || 115;
      }
      
      return newInputs;
    });
  };

  return (
    <div className="p-6">
      <h2 className="text-xl font-semibold mb-6">Protección Cables Cortocircuito</h2>
      
      <div className="grid md:grid-cols-2 gap-6">
        {/* Inputs */}
        <div className="space-y-4">
          {/* Corriente de cortocircuito */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Corriente de cortocircuito
            </label>
            <div className="flex gap-2">
              <input
                type="number"
                value={inputs.shortCircuitCurrent}
                onChange={(e) => handleInputChange('shortCircuitCurrent', parseFloat(e.target.value) || 0)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <select
                value={inputs.currentUnit}
                onChange={(e) => handleInputChange('currentUnit', e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="A">A</option>
                <option value="kA">kA</option>
              </select>
            </div>
          </div>

          {/* Tiempo de intervención */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tiempo de intervención
            </label>
            <div className="flex gap-2">
              <input
                type="number"
                value={inputs.interventionTime}
                onChange={(e) => handleInputChange('interventionTime', parseFloat(e.target.value) || 0)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <select
                value={inputs.timeUnit}
                onChange={(e) => handleInputChange('timeUnit', e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="ms">ms</option>
                <option value="s">s</option>
              </select>
            </div>
          </div>

          {/* Tipo de conductor */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tipo de conductor
            </label>
            <select
              value={inputs.conductorType}
              onChange={(e) => handleInputChange('conductorType', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="phase">Conductor de Fase</option>
              <option value="protection-unipolar">Conductor de Protección (En cable unipolar)</option>
              <option value="protection-multipolar">Conductor de Protección (En cable multipolar)</option>
            </select>
          </div>

          {/* Calibre */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Calibre
            </label>
            <div className="flex gap-2">
              <select
                value={inputs.caliber}
                onChange={(e) => handleInputChange('caliber', parseFloat(e.target.value))}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {standardSections.map(section => (
                  <option key={section} value={section}>{section}</option>
                ))}
              </select>
              <select
                value={inputs.caliberUnit}
                onChange={(e) => handleInputChange('caliberUnit', e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="mm²">mm²</option>
                <option value="AWG">AWG</option>
              </select>
            </div>
          </div>

          {/* Material del conductor */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Material del conductor
            </label>
            <select
              value={inputs.material}
              onChange={(e) => handleInputChange('material', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="copper">Cobre</option>
              <option value="aluminum">Aluminio</option>
            </select>
          </div>

          {/* Aislamiento */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Aislamiento
            </label>
            <select
              value={inputs.insulation}
              onChange={(e) => handleInputChange('insulation', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="PVC">PVC</option>
              <option value="XLPE">XLPE/EPR</option>
            </select>
          </div>

          {/* Valor K */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Valor K (constante de material)
            </label>
            <div className="flex gap-2">
              <input
                type="number"
                value={inputs.kValue}
                onChange={(e) => handleInputChange('kValue', parseFloat(e.target.value) || 115)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                readOnly
              />
              <span className="px-3 py-2 bg-gray-100 border border-gray-300 rounded-md text-gray-700 text-sm">
                Auto
              </span>
            </div>
            <div className="text-xs text-gray-500 mt-1">
              Se actualiza automáticamente según material y aislamiento
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
            <>
              <div className={`p-4 rounded-lg ${result.isAdequate ? 'bg-green-50' : 'bg-red-50'}`}>
                <div className={`text-sm font-medium ${result.isAdequate ? 'text-green-600' : 'text-red-600'}`}>
                  {result.isAdequate ? 'Cable ADECUADO para cortocircuito' : 'Cable NO ADECUADO para cortocircuito'}
                </div>
                <div className={`text-xl font-bold ${result.isAdequate ? 'text-green-900' : 'text-red-900'}`}>
                  Sección actual: {result.currentSection} mm²
                </div>
              </div>

              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="text-sm text-blue-600 font-medium">Sección mínima requerida</div>
                <div className="text-xl font-bold text-blue-900">{result.minSectionRequired} mm²</div>
              </div>

              <div className="bg-orange-50 p-4 rounded-lg">
                <div className="text-sm text-orange-600 font-medium">Sección estándar recomendada</div>
                <div className="text-xl font-bold text-orange-900">{result.recommendedSection} mm²</div>
              </div>

              <div className="bg-purple-50 p-4 rounded-lg">
                <div className="text-sm text-purple-600 font-medium">Factor de seguridad</div>
                <div className="text-xl font-bold text-purple-900">{result.safetyFactor}</div>
                <div className="text-xs text-purple-700 mt-1">
                  {parseFloat(result.safetyFactor) >= 1 ? 'Seguro' : 'Inseguro'}
                </div>
              </div>

              <div className="bg-yellow-50 p-4 rounded-lg">
                <div className="text-sm text-yellow-600 font-medium">Temperatura máxima estimada</div>
                <div className="text-xl font-bold text-yellow-900">{result.maxTemperature} °C</div>
                <div className="text-xs text-yellow-700 mt-1">
                  {parseFloat(result.maxTemperature) <= (result.insulation === 'PVC' ? 160 : 250) ? 'Dentro del límite' : 'Excede límite térmico'}
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="text-sm text-gray-600 font-medium mb-2">Parámetros de cálculo</div>
                <div className="text-xs text-gray-600 space-y-1">
                  <div>• Corriente de cortocircuito: {(result.currentInA/1000).toFixed(1)} kA</div>
                  <div>• Tiempo de intervención: {(result.timeInS*1000).toFixed(0)} ms</div>
                  <div>• Energía específica (I²t): {result.specificEnergy} MJ/mm²</div>
                  <div>• Constante K: {result.kConstant}</div>
                  <div>• Material: {result.material === 'copper' ? 'Cobre' : 'Aluminio'}</div>
                  <div>• Aislamiento: {result.insulation}</div>
                  <div>• Tipo: {result.conductorType === 'phase' ? 'Fase' : result.conductorType === 'protection-unipolar' ? 'Protección unipolar' : 'Protección multipolar'}</div>
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
          <div><strong>Sección mínima:</strong> S = √(I² × t) / k</div>
          <div><strong>Energía específica:</strong> I²t = I² × t</div>
          <div><strong>Factor de seguridad:</strong> FS = S_actual / S_mínima</div>
          <div><strong>Temperatura máxima:</strong> T_max = T_base + (I²t) / (k² × S² × α)</div>
          <div className="text-xs text-blue-700 mt-2">
            <strong>Donde:</strong> I = corriente de cortocircuito (A), t = tiempo (s), k = constante del material, S = sección (mm²), α = coeficiente de temperatura
          </div>
          <div className="text-xs text-blue-700">
            <strong>Constantes K:</strong> Cobre/PVC = 115, Cobre/XLPE = 143, Aluminio/PVC = 76, Aluminio/XLPE = 94
          </div>
        </div>
      </div>
    </div>
  );
};

export default CableShortCircuitProtectionCalc;