import { useState, useEffect, useRef } from 'react';

const PowerFactorCalculationCalc = () => {
  const [inputs, setInputs] = useState({
    systemType: 'single-phase',
    calculationType: 'active-apparent',
    activePower: 1000,
    activePowerUnit: 'W',
    apparentPower: 1250,
    apparentPowerUnit: 'VA',
    reactivePower: 750,
    reactivePowerUnit: 'var',
    knownPowerType: 'active',
    powerValue: 1000,
    powerUnit: 'W',
    powerFactor: 0.8,
    powerFactorType: 'cos',
    voltage: 220,
    voltageUnit: 'V',
    current: 5,
    currentUnit: 'A',
    impedance: 44,
    impedanceUnit: 'Ω',
    resultActivePowerUnit: 'W',
    resultReactivePowerUnit: 'var',
    resultApparentPowerUnit: 'VA'
  });
  
  const [result, setResult] = useState(null);
  const canvasRef = useRef(null);

  // Conversiones de unidades
  const powerConversions = {
    'W': 1, 'kW': 1000, 'MW': 1000000,
    'VA': 1, 'kVA': 1000, 'MVA': 1000000,
    'var': 1, 'kvar': 1000, 'Mvar': 1000000
  };

  const voltageConversions = {
    'mV': 0.001, 'V': 1, 'kV': 1000
  };

  const currentConversions = {
    'mA': 0.001, 'A': 1, 'kA': 1000
  };

  const impedanceConversions = {
    'mΩ': 0.001, 'Ω': 1, 'kΩ': 1000, 'MΩ': 1000000
  };

  const drawPowerTriangle = (P, Q, S) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const width = canvas.width = 400;
    const height = canvas.height = 300;
    
    // Limpiar canvas
    ctx.clearRect(0, 0, width, height);
    
    // Configurar escalado
    const maxValue = Math.max(P, Math.abs(Q), S);
    const scale = Math.min(width * 0.6, height * 0.6) / maxValue;
    const originX = 60;
    const originY = height - 60;
    
    // Calcular coordenadas
    const pLength = P * scale;
    const qLength = Math.abs(Q) * scale;
    const sLength = S * scale;
    
    // Vector P (verde) - horizontal
    ctx.strokeStyle = '#10b981';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(originX, originY);
    ctx.lineTo(originX + pLength, originY);
    ctx.stroke();
    
    // Vector Q (azul) - vertical a la izquierda
    ctx.strokeStyle = '#3b82f6';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(originX, originY);
    const qEndY = Q > 0 ? originY - qLength : originY + qLength;
    ctx.lineTo(originX, qEndY);
    ctx.stroke();
    
    // Vector S (rojo) - hipotenusa
    ctx.strokeStyle = '#ef4444';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(originX + pLength, originY);
    ctx.lineTo(originX, qEndY);
    ctx.stroke();
    
    // Dibujar triángulo cerrado
    ctx.strokeStyle = '#6b7280';
    ctx.lineWidth = 1;
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    ctx.moveTo(originX, originY);
    ctx.lineTo(originX + pLength, originY);
    ctx.lineTo(originX, qEndY);
    ctx.closePath();
    ctx.stroke();
    ctx.setLineDash([]);
    
    // Dibujar arco del ángulo
    const angle = Math.atan(Math.abs(Q) / P);
    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(originX + pLength, originY, 30, Q > 0 ? Math.PI - angle : Math.PI, Q > 0 ? Math.PI : Math.PI + angle);
    ctx.stroke();
    
    // Etiquetas
    // P - en el medio del vector horizontal
    ctx.fillStyle = '#10b981';
    ctx.font = '14px sans-serif';
    ctx.fillText(`P = ${P.toFixed(1)} W`, originX + pLength/2 - 20, originY + 20);
    
    // Q - rotado 90 grados en el lado izquierdo vertical
    ctx.fillStyle = '#3b82f6';
    ctx.save();
    ctx.translate(originX - 15, originY - qLength/2);
    ctx.rotate(-Math.PI/2);
    ctx.fillText(`Q = ${Math.abs(Q).toFixed(1)} var`, -30, 0);
    ctx.restore();
    
    // S - siguiendo el ángulo de la rampa pero más separado
    ctx.fillStyle = '#ef4444';
    const sMidX = originX + pLength/3;
    const sMidY = originY + (qEndY - originY)/3;
    ctx.save();
    ctx.translate(sMidX, sMidY);
    ctx.rotate(-angle * (Q > 0 ? 1 : -1));
    ctx.fillText(`S = ${S.toFixed(1)} VA`, -30, -15);
    ctx.restore();
    
    // Ángulo φ
    ctx.fillStyle = '#f59e0b';
    ctx.fillText(`φ = ${(angle * 180 / Math.PI).toFixed(1)}°`, originX + 35, originY - 5);
    
    // Leyenda
    ctx.fillStyle = '#333';
    ctx.font = '12px sans-serif';
    ctx.fillText('P = Potencia Activa (verde)', 20, 20);
    ctx.fillText('Q = Potencia Reactiva (azul)', 20, 35);
    ctx.fillText('S = Potencia Aparente (rojo)', 20, 50);
  };

  const calculate = () => {
    const { systemType, calculationType, activePower, activePowerUnit, apparentPower, apparentPowerUnit,
            reactivePower, reactivePowerUnit, knownPowerType, powerValue, powerUnit, powerFactor, powerFactorType,
            voltage, voltageUnit, current, currentUnit, impedance, impedanceUnit } = inputs;
    
    let P = 0, Q = 0, S = 0; // Valores en W, var, VA
    let calculatedPowerFactor = 0;
    let phaseAngle = 0;
    let loadType = '';
    
    // Conversiones a unidades base
    const voltageInV = voltage * voltageConversions[voltageUnit];
    const currentInA = current * currentConversions[currentUnit];
    const impedanceInOhm = impedance * impedanceConversions[impedanceUnit];
    
    switch (calculationType) {
      case 'active-apparent':
        P = activePower * powerConversions[activePowerUnit];
        S = apparentPower * powerConversions[apparentPowerUnit];
        Q = Math.sqrt(S * S - P * P);
        calculatedPowerFactor = P / S;
        break;
        
      case 'active-reactive':
        P = activePower * powerConversions[activePowerUnit];
        Q = reactivePower * powerConversions[reactivePowerUnit];
        S = Math.sqrt(P * P + Q * Q);
        calculatedPowerFactor = P / S;
        break;
        
      case 'apparent-reactive':
        S = apparentPower * powerConversions[apparentPowerUnit];
        Q = reactivePower * powerConversions[reactivePowerUnit];
        P = Math.sqrt(S * S - Q * Q);
        calculatedPowerFactor = P / S;
        break;
        
      case 'power-powerfactor':
        const powerInW = powerValue * powerConversions[powerUnit];
        const pf = powerFactorType === 'sen' ? Math.sqrt(1 - powerFactor * powerFactor) :
                   powerFactorType === 'tan' ? powerFactor / Math.sqrt(1 + powerFactor * powerFactor) : powerFactor;
        
        if (knownPowerType === 'active') {
          P = powerInW;
          S = P / pf;
          Q = S * Math.sin(Math.acos(pf));
        } else if (knownPowerType === 'apparent') {
          S = powerInW;
          P = S * pf;
          Q = S * Math.sin(Math.acos(pf));
        } else { // reactive
          Q = powerInW;
          P = Q / Math.tan(Math.acos(pf));
          S = Math.sqrt(P * P + Q * Q);
        }
        calculatedPowerFactor = pf;
        break;
        
      case 'voltage-current':
        const pf_vc = powerFactorType === 'sen' ? Math.sqrt(1 - powerFactor * powerFactor) :
                      powerFactorType === 'tan' ? powerFactor / Math.sqrt(1 + powerFactor * powerFactor) : powerFactor;
        
        switch (systemType) {
          case 'single-phase':
            S = voltageInV * currentInA;
            break;
          case 'two-phase':
            S = 2 * voltageInV * currentInA;
            break;
          case 'three-phase':
            S = Math.sqrt(3) * voltageInV * currentInA;
            break;
        }
        P = S * pf_vc;
        Q = S * Math.sin(Math.acos(pf_vc));
        calculatedPowerFactor = pf_vc;
        break;
        
      case 'impedance-current':
        S = currentInA * currentInA * impedanceInOhm;
        // Asumir factor de potencia de 0.8 para cálculos con impedancia
        P = S * 0.8;
        Q = S * Math.sin(Math.acos(0.8));
        calculatedPowerFactor = 0.8;
        break;
        
      case 'impedance-voltage':
        S = (voltageInV * voltageInV) / impedanceInOhm;
        // Asumir factor de potencia de 0.8 para cálculos con impedancia
        P = S * 0.8;
        Q = S * Math.sin(Math.acos(0.8));
        calculatedPowerFactor = 0.8;
        break;
    }
    
    phaseAngle = Math.acos(calculatedPowerFactor) * (180 / Math.PI);
    
    if (Q > 0) {
      loadType = 'Inductiva';
    } else if (Q < 0) {
      loadType = 'Capacitiva';
    } else {
      loadType = 'Resistiva';
    }
    
    // Convertir a unidades de salida
    const PResult = P / powerConversions[inputs.resultActivePowerUnit];
    const QResult = Math.abs(Q) / powerConversions[inputs.resultReactivePowerUnit];
    const SResult = S / powerConversions[inputs.resultApparentPowerUnit];
    
    setResult({
      activePower: PResult.toFixed(3),
      activePowerUnit: inputs.resultActivePowerUnit,
      reactivePower: QResult.toFixed(3),
      reactivePowerUnit: inputs.resultReactivePowerUnit,
      apparentPower: SResult.toFixed(3),
      apparentPowerUnit: inputs.resultApparentPowerUnit,
      powerFactor: calculatedPowerFactor.toFixed(4),
      powerFactorSin: Math.sin(Math.acos(calculatedPowerFactor)).toFixed(4),
      powerFactorTan: Math.tan(Math.acos(calculatedPowerFactor)).toFixed(4),
      phaseAngle: phaseAngle.toFixed(2),
      phaseAngleRad: (phaseAngle * Math.PI / 180).toFixed(4),
      loadType: loadType,
      P_base: P,
      Q_base: Q,
      S_base: S
    });
  };

  // Dibujar triángulo cuando cambien los resultados
  useEffect(() => {
    if (result) {
      drawPowerTriangle(result.P_base, result.Q_base, result.S_base);
    }
  }, [result]);

  const handleInputChange = (field, value) => {
    setInputs(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="p-6">
      <h2 className="text-xl font-semibold mb-6">Graficador de Triángulo de Potencias</h2>
      <p className="text-gray-600 mb-6">Solo para sistemas de corriente alterna</p>
      
      <div className="grid md:grid-cols-2 gap-6">
        {/* Inputs */}
        <div className="space-y-4">
          {/* Tipo de Sistema - Solo AC */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tipo de Sistema
            </label>
            <div className="space-y-2">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="systemType"
                  value="single-phase"
                  checked={inputs.systemType === 'single-phase'}
                  onChange={(e) => handleInputChange('systemType', e.target.value)}
                  className="mr-2"
                />
                <span>• Monofásico</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="systemType"
                  value="two-phase"
                  checked={inputs.systemType === 'two-phase'}
                  onChange={(e) => handleInputChange('systemType', e.target.value)}
                  className="mr-2"
                />
                <span>• Bifásico</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="systemType"
                  value="three-phase"
                  checked={inputs.systemType === 'three-phase'}
                  onChange={(e) => handleInputChange('systemType', e.target.value)}
                  className="mr-2"
                />
                <span>• Trifásico</span>
              </label>
            </div>
          </div>

          {/* Modo de entrada de datos */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Modo de entrada de datos
            </label>
            <select
              value={inputs.calculationType}
              onChange={(e) => handleInputChange('calculationType', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="active-apparent">Potencia activa / Potencia aparente</option>
              <option value="active-reactive">Potencia activa / Potencia reactiva</option>
              <option value="apparent-reactive">Potencia aparente / Potencia reactiva</option>
              <option value="power-powerfactor">Potencia / Factor de potencia</option>
              <option value="voltage-current">Tensión / Corriente</option>
              <option value="impedance-current">Impedancia / Corriente</option>
              <option value="impedance-voltage">Impedancia / Tensión</option>
            </select>
          </div>

          {/* Campos dinámicos según el modo seleccionado */}
          
          {/* Potencia Activa / Potencia Aparente */}
          {inputs.calculationType === 'active-apparent' && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Potencia Activa</label>
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
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Potencia Aparente</label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    value={inputs.apparentPower}
                    onChange={(e) => handleInputChange('apparentPower', parseFloat(e.target.value) || 0)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <select
                    value={inputs.apparentPowerUnit}
                    onChange={(e) => handleInputChange('apparentPowerUnit', e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="VA">VA</option>
                    <option value="kVA">kVA</option>
                    <option value="MVA">MVA</option>
                  </select>
                </div>
              </div>
            </>
          )}

          {/* Potencia Activa / Potencia Reactiva */}
          {inputs.calculationType === 'active-reactive' && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Potencia Activa</label>
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
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Potencia Reactiva</label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    value={inputs.reactivePower}
                    onChange={(e) => handleInputChange('reactivePower', parseFloat(e.target.value) || 0)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <select
                    value={inputs.reactivePowerUnit}
                    onChange={(e) => handleInputChange('reactivePowerUnit', e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="var">var</option>
                    <option value="kvar">kvar</option>
                    <option value="Mvar">Mvar</option>
                  </select>
                </div>
              </div>
            </>
          )}

          {/* Potencia Aparente / Potencia Reactiva */}
          {inputs.calculationType === 'apparent-reactive' && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Potencia Aparente</label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    value={inputs.apparentPower}
                    onChange={(e) => handleInputChange('apparentPower', parseFloat(e.target.value) || 0)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <select
                    value={inputs.apparentPowerUnit}
                    onChange={(e) => handleInputChange('apparentPowerUnit', e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="VA">VA</option>
                    <option value="kVA">kVA</option>
                    <option value="MVA">MVA</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Potencia Reactiva</label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    value={inputs.reactivePower}
                    onChange={(e) => handleInputChange('reactivePower', parseFloat(e.target.value) || 0)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <select
                    value={inputs.reactivePowerUnit}
                    onChange={(e) => handleInputChange('reactivePowerUnit', e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="var">var</option>
                    <option value="kvar">kvar</option>
                    <option value="Mvar">Mvar</option>
                  </select>
                </div>
              </div>
            </>
          )}

          {/* Potencia / Factor de potencia */}
          {inputs.calculationType === 'power-powerfactor' && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de potencia conocida</label>
                <select
                  value={inputs.knownPowerType}
                  onChange={(e) => handleInputChange('knownPowerType', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="active">Activa</option>
                  <option value="apparent">Aparente</option>
                  <option value="reactive">Reactiva</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Potencia</label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    value={inputs.powerValue}
                    onChange={(e) => handleInputChange('powerValue', parseFloat(e.target.value) || 0)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <select
                    value={inputs.powerUnit}
                    onChange={(e) => handleInputChange('powerUnit', e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {inputs.knownPowerType === 'active' && (
                      <>
                        <option value="W">W</option>
                        <option value="kW">kW</option>
                        <option value="MW">MW</option>
                      </>
                    )}
                    {inputs.knownPowerType === 'apparent' && (
                      <>
                        <option value="VA">VA</option>
                        <option value="kVA">kVA</option>
                        <option value="MVA">MVA</option>
                      </>
                    )}
                    {inputs.knownPowerType === 'reactive' && (
                      <>
                        <option value="var">var</option>
                        <option value="kvar">kvar</option>
                        <option value="Mvar">Mvar</option>
                      </>
                    )}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Factor de potencia</label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    max="1"
                    value={inputs.powerFactor}
                    onChange={(e) => handleInputChange('powerFactor', parseFloat(e.target.value) || 0)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <select
                    value={inputs.powerFactorType}
                    onChange={(e) => handleInputChange('powerFactorType', e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="cos">cos φ</option>
                    <option value="sen">sen φ</option>
                    <option value="tan">tan φ</option>
                  </select>
                </div>
              </div>
            </>
          )}

          {/* Tensión / Corriente */}
          {inputs.calculationType === 'voltage-current' && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tensión</label>
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
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Corriente</label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    value={inputs.current}
                    onChange={(e) => handleInputChange('current', parseFloat(e.target.value) || 0)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <select
                    value={inputs.currentUnit}
                    onChange={(e) => handleInputChange('currentUnit', e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="mA">mA</option>
                    <option value="A">A</option>
                    <option value="kA">kA</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Factor de potencia</label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    max="1"
                    value={inputs.powerFactor}
                    onChange={(e) => handleInputChange('powerFactor', parseFloat(e.target.value) || 0)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <select
                    value={inputs.powerFactorType}
                    onChange={(e) => handleInputChange('powerFactorType', e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="cos">cos φ</option>
                    <option value="sen">sen φ</option>
                    <option value="tan">tan φ</option>
                  </select>
                </div>
              </div>
            </>
          )}

          {/* Impedancia / Corriente */}
          {inputs.calculationType === 'impedance-current' && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Impedancia</label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    value={inputs.impedance}
                    onChange={(e) => handleInputChange('impedance', parseFloat(e.target.value) || 0)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <select
                    value={inputs.impedanceUnit}
                    onChange={(e) => handleInputChange('impedanceUnit', e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="mΩ">mΩ</option>
                    <option value="Ω">Ω</option>
                    <option value="kΩ">kΩ</option>
                    <option value="MΩ">MΩ</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Corriente</label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    value={inputs.current}
                    onChange={(e) => handleInputChange('current', parseFloat(e.target.value) || 0)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <select
                    value={inputs.currentUnit}
                    onChange={(e) => handleInputChange('currentUnit', e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="mA">mA</option>
                    <option value="A">A</option>
                    <option value="kA">kA</option>
                  </select>
                </div>
              </div>
            </>
          )}

          {/* Impedancia / Tensión */}
          {inputs.calculationType === 'impedance-voltage' && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Impedancia</label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    value={inputs.impedance}
                    onChange={(e) => handleInputChange('impedance', parseFloat(e.target.value) || 0)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <select
                    value={inputs.impedanceUnit}
                    onChange={(e) => handleInputChange('impedanceUnit', e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="mΩ">mΩ</option>
                    <option value="Ω">Ω</option>
                    <option value="kΩ">kΩ</option>
                    <option value="MΩ">MΩ</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tensión</label>
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
            </>
          )}

          <button
            onClick={calculate}
            className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
          >
            Calcular
          </button>
        </div>

        {/* Results and Triangle Visualization */}
        <div className="space-y-4">
          {/* Triángulo de Potencias */}
          <div className="bg-white p-4 rounded-lg border">
            <div className="text-sm text-gray-600 font-medium mb-2">Triángulo de Potencias</div>
            <canvas 
              ref={canvasRef}
              className="w-full border rounded"
              style={{ maxWidth: '400px', height: '300px' }}
            />
          </div>

          {/* Resultados */}
          {result && (
            <div className="space-y-3">
              {/* Unidades de salida */}
              <div className="bg-gray-50 p-3 rounded-lg">
                <div className="text-sm text-gray-600 font-medium mb-2">Unidades de Salida</div>
                <div className="grid grid-cols-3 gap-2 text-xs">
                  <select
                    value={inputs.resultActivePowerUnit}
                    onChange={(e) => handleInputChange('resultActivePowerUnit', e.target.value)}
                    className="px-2 py-1 border border-gray-300 rounded text-xs"
                  >
                    <option value="W">W</option>
                    <option value="kW">kW</option>
                    <option value="MW">MW</option>
                  </select>
                  <select
                    value={inputs.resultReactivePowerUnit}
                    onChange={(e) => handleInputChange('resultReactivePowerUnit', e.target.value)}
                    className="px-2 py-1 border border-gray-300 rounded text-xs"
                  >
                    <option value="var">var</option>
                    <option value="kvar">kvar</option>
                    <option value="Mvar">Mvar</option>
                  </select>
                  <select
                    value={inputs.resultApparentPowerUnit}
                    onChange={(e) => handleInputChange('resultApparentPowerUnit', e.target.value)}
                    className="px-2 py-1 border border-gray-300 rounded text-xs"
                  >
                    <option value="VA">VA</option>
                    <option value="kVA">kVA</option>
                    <option value="MVA">MVA</option>
                  </select>
                </div>
              </div>

              <div className="bg-green-50 p-4 rounded-lg">
                <div className="text-sm text-green-600 font-medium">Potencia Activa (P)</div>
                <div className="text-xl font-bold text-green-900">{result.activePower} {result.activePowerUnit}</div>
              </div>

              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="text-sm text-blue-600 font-medium">Potencia Reactiva (Q)</div>
                <div className="text-xl font-bold text-blue-900">{result.reactivePower} {result.reactivePowerUnit}</div>
              </div>

              <div className="bg-red-50 p-4 rounded-lg">
                <div className="text-sm text-red-600 font-medium">Potencia Aparente (S)</div>
                <div className="text-xl font-bold text-red-900">{result.apparentPower} {result.apparentPowerUnit}</div>
              </div>

              <div className="bg-yellow-50 p-4 rounded-lg">
                <div className="text-sm text-yellow-600 font-medium">Factor de Potencia</div>
                <div className="text-lg font-bold text-yellow-900">
                  cos φ = {result.powerFactor}<br />
                  sen φ = {result.powerFactorSin}<br />
                  tan φ = {result.powerFactorTan}
                </div>
              </div>

              <div className="bg-orange-50 p-4 rounded-lg">
                <div className="text-sm text-orange-600 font-medium">Ángulo de desfase (φ)</div>
                <div className="text-lg font-bold text-orange-900">
                  {result.phaseAngle}° | {result.phaseAngleRad} rad
                </div>
              </div>

              <div className="bg-purple-50 p-4 rounded-lg">
                <div className="text-sm text-purple-600 font-medium">Tipo de carga</div>
                <div className="text-lg font-bold text-purple-900">{result.loadType}</div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Fórmulas utilizadas */}
      <div className="mt-8 bg-blue-50 p-4 rounded-lg border-l-4 border-blue-500">
        <h3 className="text-lg font-semibold text-blue-900 mb-2">Fórmulas Utilizadas</h3>
        <div className="text-blue-800 font-mono space-y-2 text-sm">
          <div><strong>Triángulo de Potencias:</strong></div>
          <div>• S² = P² + Q² (Teorema de Pitágoras)</div>
          <div>• cos φ = P / S (Factor de potencia)</div>
          <div>• sen φ = Q / S (Factor reactivo)</div>
          <div>• tan φ = Q / P (Tangente del ángulo)</div>
          <div>• φ = arccos(P/S) (Ángulo de desfase)</div>
          
          <div className="mt-4"><strong>Por Tipo de Sistema:</strong></div>
          <div>• Monofásico: S = V × I</div>
          <div>• Bifásico: S = 2 × V × I</div>
          <div>• Trifásico: S = √3 × V × I</div>
          
          <div className="mt-4"><strong>Donde:</strong></div>
          <div>P = Potencia Activa, Q = Potencia Reactiva, S = Potencia Aparente</div>
          <div>V = Tensión, I = Corriente, φ = Ángulo de desfase</div>
        </div>
      </div>
    </div>
  );
};

export default PowerFactorCalculationCalc;