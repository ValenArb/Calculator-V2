import { useState } from 'react';

const EmergencyLightingCalc = () => {
  const [inputs, setInputs] = useState({
    buildingType: 'office',
    roomLength: 20,
    roomWidth: 15,
    ceilingHeight: 3,
    luminaireType: 'led',
    lumensPerLuminaire: 300,
    mountingHeight: 2.5,
    maintenanceFactor: 0.8,
    utilizationFactor: 0.6,
    requiredIlluminance: 1, // lux for emergency lighting
    autonomyTime: 3, // hours
    batteryType: 'nimh',
    systemType: 'central'
  });
  
  const [result, setResult] = useState(null);

  const calculate = () => {
    const { 
      buildingType, 
      roomLength, 
      roomWidth, 
      ceilingHeight, 
      luminaireType,
      lumensPerLuminaire,
      mountingHeight,
      maintenanceFactor,
      utilizationFactor,
      requiredIlluminance,
      autonomyTime,
      batteryType,
      systemType
    } = inputs;
    
    // Calculate room area
    const roomArea = roomLength * roomWidth;
    
    // Calculate total required lumens
    const totalRequiredLumens = roomArea * requiredIlluminance;
    
    // Calculate effective lumens per luminaire considering maintenance and utilization
    const effectiveLumensPerLuminaire = lumensPerLuminaire * maintenanceFactor * utilizationFactor;
    
    // Calculate number of luminaires required
    const numberOfLuminaires = Math.ceil(totalRequiredLumens / effectiveLumensPerLuminaire);
    
    // Calculate luminaire spacing
    const spacingRatio = mountingHeight / ceilingHeight;
    const maxSpacing = mountingHeight * spacingRatio * 1.5; // Rule of thumb
    const optimalSpacingX = roomLength / Math.ceil(roomLength / maxSpacing);
    const optimalSpacingY = roomWidth / Math.ceil(roomWidth / maxSpacing);
    
    // Calculate actual illuminance achieved
    const totalEffectiveLumens = numberOfLuminaires * effectiveLumensPerLuminaire;
    const actualIlluminance = totalEffectiveLumens / roomArea;
    
    // Power calculations
    let powerPerLuminaire;
    switch (luminaireType) {
      case 'led':
        powerPerLuminaire = lumensPerLuminaire / 100; // 100 lm/W for LED
        break;
      case 'fluorescent':
        powerPerLuminaire = lumensPerLuminaire / 80; // 80 lm/W for fluorescent
        break;
      case 'incandescent':
        powerPerLuminaire = lumensPerLuminaire / 15; // 15 lm/W for incandescent
        break;
      default:
        powerPerLuminaire = lumensPerLuminaire / 80;
    }
    
    const totalPower = numberOfLuminaires * powerPerLuminaire;
    
    // Battery capacity calculation
    let batteryEfficiency;
    switch (batteryType) {
      case 'lead-acid':
        batteryEfficiency = 0.85;
        break;
      case 'nimh':
        batteryEfficiency = 0.90;
        break;
      case 'li-ion':
        batteryEfficiency = 0.95;
        break;
      default:
        batteryEfficiency = 0.85;
    }
    
    // Calculate required battery capacity (Ah)
    const systemVoltage = 12; // Typical emergency lighting system voltage
    const requiredBatteryCapacity = (totalPower * autonomyTime) / (systemVoltage * batteryEfficiency);
    
    // Add safety factor
    const batteryCapacityWithSafety = requiredBatteryCapacity * 1.25; // 25% safety factor
    
    // Calculate charging time
    const chargingCurrent = batteryCapacityWithSafety * 0.1; // C/10 charging rate
    const chargingTime = batteryCapacityWithSafety / chargingCurrent;
    
    // Cost estimation (simplified)
    const costPerLuminaire = luminaireType === 'led' ? 150 : 
                           luminaireType === 'fluorescent' ? 100 : 75;
    const totalLuminaireCost = numberOfLuminaires * costPerLuminaire;
    
    const costPerAh = batteryType === 'li-ion' ? 50 : 
                     batteryType === 'nimh' ? 30 : 20;
    const batterySystemCost = batteryCapacityWithSafety * costPerAh;
    
    const totalSystemCost = totalLuminaireCost + batterySystemCost + 500; // Installation costs
    
    // Compliance check
    let complianceStatus = 'Compliant';
    let complianceNotes = [];
    
    if (actualIlluminance < requiredIlluminance) {
      complianceStatus = 'Non-compliant';
      complianceNotes.push('Insufficient illuminance level');
    }
    
    if (autonomyTime < 1) {
      complianceStatus = 'Non-compliant';
      complianceNotes.push('Minimum autonomy time is 1 hour');
    }
    
    if (maxSpacing > 6) {
      complianceNotes.push('Spacing may be too large for uniform illumination');
    }
    
    setResult({
      roomArea: roomArea.toFixed(1),
      numberOfLuminaires: numberOfLuminaires.toFixed(0),
      totalRequiredLumens: totalRequiredLumens.toFixed(0),
      actualIlluminance: actualIlluminance.toFixed(2),
      optimalSpacingX: optimalSpacingX.toFixed(1),
      optimalSpacingY: optimalSpacingY.toFixed(1),
      totalPower: totalPower.toFixed(1),
      requiredBatteryCapacity: batteryCapacityWithSafety.toFixed(1),
      chargingTime: chargingTime.toFixed(1),
      totalSystemCost: totalSystemCost.toFixed(0),
      complianceStatus,
      complianceNotes: complianceNotes.join(', ') || 'All requirements met',
      powerPerLuminaire: powerPerLuminaire.toFixed(1)
    });
  };

  const handleInputChange = (field, value) => {
    setInputs(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="p-6">
      <h2 className="text-xl font-semibold mb-6">Cálculo de Iluminación de Emergencia</h2>
      
      {/* Formula Section */}
      <div className="mb-6 bg-blue-50 p-4 rounded-lg">
        <h3 className="text-sm font-medium text-blue-900 mb-2">Fórmulas utilizadas:</h3>
        <div className="text-xs text-blue-700 space-y-1">
          <div><strong>Lúmenes totales:</strong> Φ = E × A</div>
          <div><strong>Número de luminarias:</strong> N = Φ_total / (Φ_luminaria × MF × UF)</div>
          <div><strong>Capacidad batería:</strong> C = (P × t) / (V × η) × 1.25</div>
          <div><strong>Iluminancia real:</strong> E = (N × Φ_efectiva) / A</div>
          <div className="text-xs mt-2">
            <strong>Donde:</strong> E = iluminancia (lux), A = área (m²), Φ = flujo luminoso (lm), MF = factor mantenimiento, UF = factor utilización
          </div>
        </div>
      </div>
      
      <div className="grid md:grid-cols-2 gap-6">
        {/* Inputs */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tipo de Edificio
            </label>
            <select
              value={inputs.buildingType}
              onChange={(e) => handleInputChange('buildingType', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="office">Oficina</option>
              <option value="hospital">Hospital</option>
              <option value="school">Escuela</option>
              <option value="warehouse">Almacén</option>
              <option value="hotel">Hotel</option>
              <option value="retail">Comercio</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Largo del Local (m)
              </label>
              <input
                type="number"
                value={inputs.roomLength}
                onChange={(e) => handleInputChange('roomLength', parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Ancho del Local (m)
              </label>
              <input
                type="number"
                value={inputs.roomWidth}
                onChange={(e) => handleInputChange('roomWidth', parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Altura del Techo (m)
            </label>
            <input
              type="number"
              step="0.1"
              value={inputs.ceilingHeight}
              onChange={(e) => handleInputChange('ceilingHeight', parseFloat(e.target.value) || 0)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Altura de Montaje (m)
            </label>
            <input
              type="number"
              step="0.1"
              value={inputs.mountingHeight}
              onChange={(e) => handleInputChange('mountingHeight', parseFloat(e.target.value) || 0)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tipo de Luminaria
            </label>
            <select
              value={inputs.luminaireType}
              onChange={(e) => handleInputChange('luminaireType', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="led">LED</option>
              <option value="fluorescent">Fluorescente</option>
              <option value="incandescent">Incandescente</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Lúmenes por Luminaria
            </label>
            <input
              type="number"
              value={inputs.lumensPerLuminaire}
              onChange={(e) => handleInputChange('lumensPerLuminaire', parseFloat(e.target.value) || 0)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Iluminancia Requerida (lux)
            </label>
            <input
              type="number"
              step="0.1"
              value={inputs.requiredIlluminance}
              onChange={(e) => handleInputChange('requiredIlluminance', parseFloat(e.target.value) || 0)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tiempo de Autonomía (h)
            </label>
            <input
              type="number"
              step="0.5"
              value={inputs.autonomyTime}
              onChange={(e) => handleInputChange('autonomyTime', parseFloat(e.target.value) || 0)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tipo de Batería
            </label>
            <select
              value={inputs.batteryType}
              onChange={(e) => handleInputChange('batteryType', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="lead-acid">Plomo-Ácido</option>
              <option value="nimh">Ni-MH</option>
              <option value="li-ion">Li-Ion</option>
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
            <div className="space-y-4">
              <div className="bg-green-50 p-4 rounded-lg">
                <div className="text-sm text-green-600 font-medium mb-1">Número de Luminarias</div>
                <div className="text-3xl font-bold text-green-900">{result.numberOfLuminaires}</div>
              </div>
              
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="text-sm text-blue-600 font-medium mb-1">Área del Local</div>
                <div className="text-xl font-bold text-blue-900">{result.roomArea} m²</div>
              </div>
              
              <div className="bg-purple-50 p-4 rounded-lg">
                <div className="text-sm text-purple-600 font-medium mb-1">Iluminancia Lograda</div>
                <div className="text-xl font-bold text-purple-900">{result.actualIlluminance} lux</div>
              </div>
              
              <div className="bg-orange-50 p-4 rounded-lg">
                <div className="text-sm text-orange-600 font-medium mb-1">Espaciamiento Óptimo</div>
                <div className="text-lg font-bold text-orange-900">
                  {result.optimalSpacingX} × {result.optimalSpacingY} m
                </div>
              </div>
              
              <div className="bg-yellow-50 p-4 rounded-lg">
                <div className="text-sm text-yellow-600 font-medium mb-1">Potencia Total</div>
                <div className="text-xl font-bold text-yellow-900">{result.totalPower} W</div>
                <div className="text-xs mt-1">Por luminaria: {result.powerPerLuminaire} W</div>
              </div>
              
              <div className="bg-indigo-50 p-4 rounded-lg">
                <div className="text-sm text-indigo-600 font-medium mb-1">Capacidad de Batería</div>
                <div className="text-xl font-bold text-indigo-900">{result.requiredBatteryCapacity} Ah</div>
                <div className="text-xs mt-1">Tiempo de carga: {result.chargingTime} h</div>
              </div>
              
              <div className={`p-4 rounded-lg ${
                result.complianceStatus === 'Compliant' ? 'bg-green-50' : 'bg-red-50'
              }`}>
                <div className={`text-sm font-medium mb-1 ${
                  result.complianceStatus === 'Compliant' ? 'text-green-600' : 'text-red-600'
                }`}>
                  Estado de Cumplimiento
                </div>
                <div className={`text-lg font-bold ${
                  result.complianceStatus === 'Compliant' ? 'text-green-900' : 'text-red-900'
                }`}>
                  {result.complianceStatus === 'Compliant' ? '✓ Cumple' : '✗ No cumple'}
                </div>
                <div className="text-xs mt-1">{result.complianceNotes}</div>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="text-sm text-gray-600 font-medium mb-1">Costo Estimado del Sistema</div>
                <div className="text-2xl font-bold text-gray-900">${result.totalSystemCost}</div>
              </div>
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              Completa los datos y haz clic en "Calcular"
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EmergencyLightingCalc;
