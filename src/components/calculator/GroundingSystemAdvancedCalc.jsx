import { useState } from 'react';

const GroundingSystemAdvancedCalc = () => {
  const [inputs, setInputs] = useState({
    electrodeType: 'rod',
    quantity: 1,
    length: 2.4,
    lengthUnit: 'm',
    soilType: 'agricultural',
    resistivity: 100,
    safetyVoltage: 50
  });

  const [result, setResult] = useState(null);

  // Tipos de electrodo y sus factores de forma
  const electrodeTypes = {
    rod: { name: 'Varilla', shapeFactor: 1.0, formula: 'rod' },
    plate: { name: 'Placa', shapeFactor: 0.8, formula: 'plate' },
    mesh: { name: 'Malla', shapeFactor: 0.6, formula: 'mesh' },
    other: { name: 'Otros tipos según estándares', shapeFactor: 0.9, formula: 'other' }
  };

  // Tipos de suelo y resistividades típicas
  const soilTypes = {
    agricultural: { name: 'Agrícola', typicalResistivity: 50, description: 'Terreno húmedo con buena conductividad' },
    clayey: { name: 'Arcilloso', typicalResistivity: 80, description: 'Terreno arcilloso con conductividad media' },
    sandy: { name: 'Arenoso', typicalResistivity: 200, description: 'Terreno arenoso con baja conductividad' },
    rocky: { name: 'Rocoso', typicalResistivity: 1000, description: 'Terreno rocoso con muy baja conductividad' },
    swampy: { name: 'Pantanoso', typicalResistivity: 20, description: 'Terreno húmedo con alta conductividad' }
  };

  const calculate = () => {
    const { electrodeType, quantity, length, lengthUnit, soilType, resistivity, safetyVoltage } = inputs;

    // Convertir longitud a metros
    const lengthInM = lengthUnit === 'km' ? length * 1000 : length;

    // Obtener parámetros del electrodo y suelo
    const electrode = electrodeTypes[electrodeType];
    const soil = soilTypes[soilType];

    let singleElectrodeResistance = 0;
    let formula = '';

    // Calcular resistencia de electrodo individual según tipo
    switch (electrode.formula) {
      case 'rod':
        // Fórmula para varilla vertical: R = (ρ/(2πL)) × ln(4L/d) donde d es el diámetro (asumido 16mm)
        const rodDiameter = 0.016; // 16 mm en metros
        singleElectrodeResistance = (resistivity / (2 * Math.PI * lengthInM)) * 
                                   Math.log(4 * lengthInM / rodDiameter);
        formula = 'R = (ρ/(2πL)) × ln(4L/d)';
        break;
        
      case 'plate':
        // Fórmula para placa rectangular: R ≈ ρ/(4 × √A) donde A es el área (estimada como L²)
        const plateArea = lengthInM * lengthInM;
        singleElectrodeResistance = resistivity / (4 * Math.sqrt(plateArea));
        formula = 'R = ρ/(4√A)';
        break;
        
      case 'mesh':
        // Fórmula para malla: R ≈ ρ/(π × L) donde L es la longitud total de conductores
        singleElectrodeResistance = resistivity / (Math.PI * lengthInM);
        formula = 'R = ρ/(πL)';
        break;
        
      default:
        // Fórmula general
        singleElectrodeResistance = resistivity / (2 * Math.PI * lengthInM);
        formula = 'R = ρ/(2πL)';
    }

    // Factor de reducción por electrodos múltiples (aproximación)
    let multipleElectrodeFactor = 1.0;
    if (quantity > 1) {
      // Factor empírico considerando el efecto de proximidad
      multipleElectrodeFactor = 1 - (0.15 * Math.log(quantity));
      if (multipleElectrodeFactor < 0.5) multipleElectrodeFactor = 0.5; // Mínimo 50% de efectividad
    }

    // Resistencia total del sistema
    const totalResistance = (singleElectrodeResistance / quantity) * (1 / multipleElectrodeFactor);

    // Corriente de falla estimada (basada en tensión de seguridad)
    const faultCurrent = safetyVoltage / totalResistance;

    // Tensión de paso y contacto (IEC 61936-1)
    const stepVoltage = 0.65 * resistivity * faultCurrent;
    const touchVoltage = 0.75 * resistivity * faultCurrent;

    // Límites de seguridad según IEC (asumiendo 50 kg de peso corporal)
    const stepVoltageLimit = 650 + 0.17 * resistivity; // V
    const touchVoltageLimit = 430 + 0.17 * resistivity; // V

    // Cumplimiento con normas
    const stepCompliance = stepVoltage <= stepVoltageLimit;
    const touchCompliance = touchVoltage <= touchVoltageLimit;
    const overallCompliance = stepCompliance && touchCompliance;

    // Generar recomendaciones
    let recommendations = [];
    
    if (totalResistance > 25) {
      recommendations.push('Resistencia alta: considerar aumentar el número de electrodos');
    }
    if (totalResistance > 10) {
      recommendations.push('Instalar tratamiento químico del suelo');
    }
    if (!stepCompliance) {
      recommendations.push('Tensión de paso excesiva: mejorar el sistema de puesta a tierra');
    }
    if (!touchCompliance) {
      recommendations.push('Tensión de contacto excesiva: instalar electrodos adicionales');
    }
    if (quantity === 1 && totalResistance > 5) {
      recommendations.push('Considerar sistema con múltiples electrodos');
    }
    if (soil.typicalResistivity !== resistivity && Math.abs(soil.typicalResistivity - resistivity) > 50) {
      recommendations.push('Verificar medición de resistividad del suelo');
    }
    if (overallCompliance && totalResistance < 5) {
      recommendations.push('Sistema de puesta a tierra cumple con estándares de seguridad');
    }

    // Estado del sistema
    let systemStatus = '';
    let statusColor = '';
    
    if (overallCompliance && totalResistance <= 10) {
      systemStatus = 'Excelente';
      statusColor = 'text-green-800';
    } else if (overallCompliance && totalResistance <= 25) {
      systemStatus = 'Bueno';
      statusColor = 'text-blue-800';
    } else if (overallCompliance) {
      systemStatus = 'Aceptable';
      statusColor = 'text-yellow-800';
    } else if (totalResistance <= 25) {
      systemStatus = 'Requiere mejoras';
      statusColor = 'text-orange-800';
    } else {
      systemStatus = 'Crítico';
      statusColor = 'text-red-800';
    }

    setResult({
      singleElectrodeResistance: singleElectrodeResistance.toFixed(2),
      totalResistance: totalResistance.toFixed(2),
      faultCurrent: faultCurrent.toFixed(2),
      stepVoltage: stepVoltage.toFixed(1),
      touchVoltage: touchVoltage.toFixed(1),
      stepVoltageLimit: stepVoltageLimit.toFixed(1),
      touchVoltageLimit: touchVoltageLimit.toFixed(1),
      stepCompliance: stepCompliance,
      touchCompliance: touchCompliance,
      overallCompliance: overallCompliance,
      recommendations: recommendations,
      systemStatus: systemStatus,
      statusColor: statusColor,
      multipleElectrodeFactor: multipleElectrodeFactor.toFixed(3),
      formula: formula,
      electrode: electrode,
      soil: soil,
      lengthInM: lengthInM,
      quantity: quantity
    });
  };

  const handleInputChange = (field, value) => {
    setInputs(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="p-6">
      <h2 className="text-xl font-semibold mb-6">Sistema de Puesta a Tierra y Coordinación con Dispositivo Diferencial</h2>
      
      <div className="grid md:grid-cols-2 gap-6">
        {/* Inputs */}
        <div className="space-y-4">
          {/* Tipo de electrodo */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tipo de electrodo
            </label>
            <select
              value={inputs.electrodeType}
              onChange={(e) => handleInputChange('electrodeType', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {Object.entries(electrodeTypes).map(([key, electrode]) => (
                <option key={key} value={key}>{electrode.name}</option>
              ))}
            </select>
          </div>

          {/* Cantidad */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Cantidad
            </label>
            <select
              value={inputs.quantity}
              onChange={(e) => handleInputChange('quantity', parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {[1, 2, 3, 4, 5, 6, 8, 10, 12, 15, 20].map(num => (
                <option key={num} value={num}>{num}</option>
              ))}
            </select>
          </div>

          {/* Longitud */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Longitud
            </label>
            <div className="flex gap-2">
              <input
                type="number"
                value={inputs.length}
                onChange={(e) => handleInputChange('length', parseFloat(e.target.value) || 0)}
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

          {/* Tipo de suelo */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tipo de suelo
            </label>
            <select
              value={inputs.soilType}
              onChange={(e) => {
                const newSoilType = e.target.value;
                handleInputChange('soilType', newSoilType);
                // Auto-actualizar resistividad típica
                handleInputChange('resistivity', soilTypes[newSoilType].typicalResistivity);
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {Object.entries(soilTypes).map(([key, soil]) => (
                <option key={key} value={key}>{soil.name}</option>
              ))}
            </select>
            <div className="text-xs text-gray-500 mt-1">
              {soilTypes[inputs.soilType].description}
            </div>
          </div>

          {/* Resistividad */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Resistividad
            </label>
            <div className="flex gap-2">
              <input
                type="number"
                value={inputs.resistivity}
                onChange={(e) => handleInputChange('resistivity', parseFloat(e.target.value) || 0)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <span className="px-3 py-2 bg-gray-100 border border-gray-300 rounded-md text-gray-700">Ω • m</span>
            </div>
          </div>

          {/* Tensión de seguridad */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tensión de seguridad
            </label>
            <div className="flex gap-2">
              <input
                type="number"
                value={inputs.safetyVoltage}
                onChange={(e) => handleInputChange('safetyVoltage', parseFloat(e.target.value) || 0)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <span className="px-3 py-2 bg-gray-100 border border-gray-300 rounded-md text-gray-700">V</span>
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
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="text-sm text-blue-600 font-medium">Resistencia de puesta a tierra</div>
                <div className="text-2xl font-bold text-blue-900">{result.totalResistance} Ω</div>
                <div className="text-xs text-blue-700 mt-1">
                  Electrodo individual: {result.singleElectrodeResistance} Ω
                </div>
              </div>

              <div className={`bg-yellow-50 p-4 rounded-lg`}>
                <div className="text-sm text-yellow-600 font-medium">Estado del sistema</div>
                <div className={`text-xl font-bold ${result.statusColor}`}>{result.systemStatus}</div>
                <div className="text-xs text-yellow-700 mt-1">
                  Factor múltiples electrodos: {result.multipleElectrodeFactor}
                </div>
              </div>

              <div className="bg-red-50 p-4 rounded-lg">
                <div className="text-sm text-red-600 font-medium">Corriente de falla estimada</div>
                <div className="text-xl font-bold text-red-900">{result.faultCurrent} A</div>
                <div className="text-xs text-red-700 mt-1">Basada en tensión de seguridad</div>
              </div>

              <div className="bg-orange-50 p-4 rounded-lg">
                <div className="text-sm text-orange-600 font-medium mb-2">Tensiones de seguridad</div>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-xs">Tensión de paso:</span>
                    <span className={`text-sm font-bold ${result.stepCompliance ? 'text-green-700' : 'text-red-700'}`}>
                      {result.stepVoltage} V {result.stepCompliance ? '✓' : '✗'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs">Tensión de contacto:</span>
                    <span className={`text-sm font-bold ${result.touchCompliance ? 'text-green-700' : 'text-red-700'}`}>
                      {result.touchVoltage} V {result.touchCompliance ? '✓' : '✗'}
                    </span>
                  </div>
                  <div className="text-xs text-orange-700 mt-2">
                    Límites: Paso ≤ {result.stepVoltageLimit} V, Contacto ≤ {result.touchVoltageLimit} V
                  </div>
                </div>
              </div>

              <div className={`p-4 rounded-lg ${result.overallCompliance ? 'bg-green-50' : 'bg-red-50'}`}>
                <div className={`text-sm font-medium mb-2 ${result.overallCompliance ? 'text-green-600' : 'text-red-600'}`}>
                  Cumplimiento con normas de seguridad
                </div>
                <div className={`text-lg font-bold ${result.overallCompliance ? 'text-green-900' : 'text-red-900'}`}>
                  {result.overallCompliance ? 'CUMPLE ✓' : 'NO CUMPLE ✗'}
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="text-sm text-gray-600 font-medium mb-2">Parámetros del sistema</div>
                <div className="text-xs text-gray-600 space-y-1">
                  <div>• Tipo de electrodo: {result.electrode.name}</div>
                  <div>• Cantidad: {result.quantity} unidades</div>
                  <div>• Longitud: {result.lengthInM} m</div>
                  <div>• Tipo de suelo: {result.soil.name}</div>
                  <div>• Resistividad: {inputs.resistivity} Ω•m</div>
                  <div>• Tensión de seguridad: {inputs.safetyVoltage} V</div>
                </div>
              </div>

              {result.recommendations.length > 0 && (
                <div className="bg-purple-50 p-4 rounded-lg">
                  <div className="text-sm text-purple-600 font-medium mb-2">Recomendaciones de mejora</div>
                  <ul className="text-xs text-purple-700 space-y-1">
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
          {result && (
            <div><strong>Resistencia de electrodo:</strong> {result.formula}</div>
          )}
          {!result && (
            <>
              <div><strong>Varilla:</strong> R = (ρ/(2πL)) × ln(4L/d)</div>
              <div><strong>Placa:</strong> R = ρ/(4√A)</div>
              <div><strong>Malla:</strong> R = ρ/(πL)</div>
            </>
          )}
          <div><strong>Sistema múltiple:</strong> R_total = (R_individual/n) × (1/F_múltiple)</div>
          <div><strong>Tensión de paso:</strong> V_paso = 0.65 × ρ × I_falla</div>
          <div><strong>Tensión de contacto:</strong> V_contacto = 0.75 × ρ × I_falla</div>
          <div><strong>Límites de seguridad:</strong> V_límite = 430 + 0.17 × ρ (contacto), 650 + 0.17 × ρ (paso)</div>
          <div className="text-xs text-blue-700 mt-2">
            <strong>Donde:</strong> ρ = resistividad (Ω•m), L = longitud (m), n = número de electrodos, I = corriente de falla (A), d = diámetro (m)
          </div>
        </div>
      </div>
    </div>
  );
};

export default GroundingSystemAdvancedCalc;