import { useState } from 'react';

const CableProtectionCalc = () => {
  const [inputs, setInputs] = useState({
    cableCrossSection: 4,
    cableInsulation: 'pvc',
    conductor: 'copper',
    installationMethod: 'conduit',
    ambientTemp: 40,
    groupingFactor: 1,
    correctionFactor: 1,
    loadCurrent: 20,
    protectionType: 'mcb',
    overloadProtection: true,
    shortCircuitProtection: true,
    operatingTime: 0.1
  });
  
  const [result, setResult] = useState(null);

  const calculate = () => {
    const { 
      cableCrossSection, 
      cableInsulation, 
      conductor, 
      installationMethod, 
      ambientTemp, 
      groupingFactor, 
      correctionFactor,
      loadCurrent,
      protectionType,
      overloadProtection,
      shortCircuitProtection,
      operatingTime
    } = inputs;
    
    // Cable current carrying capacity (simplified table values)
    let baseCurrent;
    const crossSectionMap = {
      1.5: { pvc: 15.5, xlpe: 18 },
      2.5: { pvc: 21, xlpe: 25 },
      4: { pvc: 28, xlpe: 33 },
      6: { pvc: 36, xlpe: 42 },
      10: { pvc: 50, xlpe: 57 },
      16: { pvc: 68, xlpe: 76 },
      25: { pvc: 89, xlpe: 101 },
      35: { pvc: 110, xlpe: 125 },
      50: { pvc: 134, xlpe: 151 },
      70: { pvc: 171, xlpe: 192 },
      95: { pvc: 207, xlpe: 232 }
    };
    
    baseCurrent = crossSectionMap[cableCrossSection]?.[cableInsulation] || 
                  (cableInsulation === 'pvc' ? cableCrossSection * 7 : cableCrossSection * 8);
    
    // Apply correction factors
    let tempCorrectionFactor = 1;
    if (ambientTemp > 30) {
      tempCorrectionFactor = cableInsulation === 'pvc' ? 
        (0.87 - (ambientTemp - 30) * 0.01) : 
        (0.91 - (ambientTemp - 30) * 0.008);
    }
    
    const actualCableCapacity = baseCurrent * tempCorrectionFactor * groupingFactor * correctionFactor;
    
    // Calculate minimum and maximum protection ratings
    let minProtectionRating, maxProtectionRating;
    
    if (overloadProtection) {
      // IEC 60364-4-43: Ib ≤ In ≤ Iz
      minProtectionRating = Math.ceil(loadCurrent);
      maxProtectionRating = Math.floor(actualCableCapacity);
    } else {
      // Only short circuit protection
      minProtectionRating = Math.ceil(loadCurrent / 1.45); // Allow some margin
      maxProtectionRating = Math.floor(actualCableCapacity * 1.45);
    }
    
    // Calculate short circuit withstand
    let kConstant;
    if (conductor === 'copper') {
      kConstant = cableInsulation === 'pvc' ? 115 : 143; // PVC or XLPE
    } else {
      kConstant = cableInsulation === 'pvc' ? 74 : 94; // Aluminum
    }
    
    const shortCircuitWithstand = (kConstant * cableCrossSection) / Math.sqrt(operatingTime);
    
    // Calculate let-through energy
    const maxAllowableI2t = Math.pow(kConstant * cableCrossSection, 2) * operatingTime;
    
    // Protection coordination check
    let protectionRatingRecommendation;
    const standardRatings = [6, 10, 13, 16, 20, 25, 32, 40, 50, 63, 80, 100, 125];
    
    const suitableRatings = standardRatings.filter(rating => 
      rating >= minProtectionRating && rating <= maxProtectionRating
    );
    
    if (suitableRatings.length > 0) {
      protectionRatingRecommendation = suitableRatings[0]; // Smallest suitable rating
    } else {
      protectionRatingRecommendation = null;
    }
    
    // Check discrimination
    let discriminationOk = true;
    if (protectionType === 'mcb' && protectionRatingRecommendation) {
      // Simplified check: upstream protection should be at least 1.6x downstream
      discriminationOk = true; // Would need upstream protection data
    }
    
    // Calculate protection characteristics
    let magneticTripLevel, timeCurrentCharacteristic;
    switch (protectionType) {
      case 'mcb':
        magneticTripLevel = protectionRatingRecommendation ? protectionRatingRecommendation * 10 : 0;
        timeCurrentCharacteristic = 'Curva C (5-10x In)';
        break;
      case 'mccb':
        magneticTripLevel = protectionRatingRecommendation ? protectionRatingRecommendation * 8 : 0;
        timeCurrentCharacteristic = 'Ajustable (3-8x In)';
        break;
      case 'fuse':
        magneticTripLevel = protectionRatingRecommendation ? protectionRatingRecommendation * 10 : 0;
        timeCurrentCharacteristic = 'Característica gG';
        break;
    }
    
    setResult({
      actualCableCapacity: actualCableCapacity.toFixed(1),
      minProtectionRating: minProtectionRating.toFixed(0),
      maxProtectionRating: maxProtectionRating.toFixed(0),
      protectionRatingRecommendation: protectionRatingRecommendation?.toFixed(0) || 'N/A',
      shortCircuitWithstand: shortCircuitWithstand.toFixed(0),
      maxAllowableI2t: maxAllowableI2t.toFixed(0),
      tempCorrectionFactor: tempCorrectionFactor.toFixed(3),
      discriminationOk,
      magneticTripLevel: magneticTripLevel.toFixed(0),
      timeCurrentCharacteristic,
      protectionAdequate: suitableRatings.length > 0,
      kConstant: kConstant.toFixed(0)
    });
  };

  const handleInputChange = (field, value) => {
    setInputs(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="p-6">
      <h2 className="text-xl font-semibold mb-6">Cálculo de Protección de Cables</h2>
      
      {/* Formula Section */}
      <div className="mb-6 bg-blue-50 p-4 rounded-lg">
        <h3 className="text-sm font-medium text-blue-900 mb-2">Criterios de protección (IEC 60364-4-43):</h3>
        <div className="text-xs text-blue-700 space-y-1">
          <div><strong>Sobrecarga:</strong> Ib ≤ In ≤ Iz</div>
          <div><strong>Cortocircuito:</strong> I²t ≤ (k × S)² × t</div>
          <div><strong>Capacidad corregida:</strong> Iz = Iz0 × Ct × Cg × Cf</div>
          <div><strong>Resistencia térmica:</strong> Isc_withstand = (k × S) / √t</div>
          <div className="text-xs mt-2">
            <strong>Donde:</strong> Ib = corriente de diseño, In = corriente nominal protección, Iz = capacidad del cable, k = constante térmica, S = sección
          </div>
        </div>
      </div>
      
      <div className="grid md:grid-cols-2 gap-6">
        {/* Inputs */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Sección del Cable (mm²)
            </label>
            <select
              value={inputs.cableCrossSection}
              onChange={(e) => handleInputChange('cableCrossSection', parseFloat(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value={1.5}>1.5</option>
              <option value={2.5}>2.5</option>
              <option value={4}>4</option>
              <option value={6}>6</option>
              <option value={10}>10</option>
              <option value={16}>16</option>
              <option value={25}>25</option>
              <option value={35}>35</option>
              <option value={50}>50</option>
              <option value={70}>70</option>
              <option value={95}>95</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tipo de Aislación
            </label>
            <div className="flex gap-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="cableInsulation"
                  value="pvc"
                  checked={inputs.cableInsulation === 'pvc'}
                  onChange={(e) => handleInputChange('cableInsulation', e.target.value)}
                  className="mr-2"
                />
                PVC (70°C)
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="cableInsulation"
                  value="xlpe"
                  checked={inputs.cableInsulation === 'xlpe'}
                  onChange={(e) => handleInputChange('cableInsulation', e.target.value)}
                  className="mr-2"
                />
                XLPE (90°C)
              </label>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tipo de Conductor
            </label>
            <div className="flex gap-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="conductor"
                  value="copper"
                  checked={inputs.conductor === 'copper'}
                  onChange={(e) => handleInputChange('conductor', e.target.value)}
                  className="mr-2"
                />
                Cobre
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="conductor"
                  value="aluminum"
                  checked={inputs.conductor === 'aluminum'}
                  onChange={(e) => handleInputChange('conductor', e.target.value)}
                  className="mr-2"
                />
                Aluminio
              </label>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Corriente de Carga (A)
            </label>
            <input
              type="number"
              value={inputs.loadCurrent}
              onChange={(e) => handleInputChange('loadCurrent', parseFloat(e.target.value) || 0)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Temperatura Ambiente (°C)
            </label>
            <input
              type="number"
              value={inputs.ambientTemp}
              onChange={(e) => handleInputChange('ambientTemp', parseFloat(e.target.value) || 0)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Factor de Agrupamiento
            </label>
            <input
              type="number"
              step="0.1"
              min="0.1"
              max="1"
              value={inputs.groupingFactor}
              onChange={(e) => handleInputChange('groupingFactor', parseFloat(e.target.value) || 1)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Factor de Corrección Adicional
            </label>
            <input
              type="number"
              step="0.1"
              min="0.1"
              max="1"
              value={inputs.correctionFactor}
              onChange={(e) => handleInputChange('correctionFactor', parseFloat(e.target.value) || 1)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tipo de Protección
            </label>
            <select
              value={inputs.protectionType}
              onChange={(e) => handleInputChange('protectionType', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="mcb">Interruptor Automático (MCB)</option>
              <option value="mccb">Interruptor de Caja Moldeada (MCCB)</option>
              <option value="fuse">Fusible</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tiempo de Operación (s)
            </label>
            <input
              type="number"
              step="0.01"
              value={inputs.operatingTime}
              onChange={(e) => handleInputChange('operatingTime', parseFloat(e.target.value) || 0)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div className="flex gap-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={inputs.overloadProtection}
                onChange={(e) => handleInputChange('overloadProtection', e.target.checked)}
                className="mr-2"
              />
              Protección contra sobrecarga
            </label>
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
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="text-sm text-blue-600 font-medium mb-1">Capacidad Real del Cable</div>
                <div className="text-2xl font-bold text-blue-900">{result.actualCableCapacity} A</div>
                <div className="text-xs mt-1">Factor corrección temp: {result.tempCorrectionFactor}</div>
              </div>
              
              <div className="bg-green-50 p-4 rounded-lg">
                <div className="text-sm text-green-600 font-medium mb-1">Rango de Protección</div>
                <div className="text-lg font-bold text-green-900">
                  {result.minProtectionRating} - {result.maxProtectionRating} A
                </div>
              </div>
              
              <div className={`p-4 rounded-lg ${
                result.protectionAdequate ? 'bg-green-50' : 'bg-red-50'
              }`}>
                <div className={`text-sm font-medium mb-1 ${
                  result.protectionAdequate ? 'text-green-600' : 'text-red-600'
                }`}>
                  Protección Recomendada
                </div>
                <div className={`text-xl font-bold ${
                  result.protectionAdequate ? 'text-green-900' : 'text-red-900'
                }`}>
                  {result.protectionRatingRecommendation !== 'N/A' ? 
                    `${result.protectionRatingRecommendation} A` : 
                    'No disponible'}
                </div>
                <div className="text-xs mt-1">{result.timeCurrentCharacteristic}</div>
              </div>
              
              <div className="bg-purple-50 p-4 rounded-lg">
                <div className="text-sm text-purple-600 font-medium mb-1">Resistencia a Cortocircuito</div>
                <div className="text-xl font-bold text-purple-900">{result.shortCircuitWithstand} A</div>
                <div className="text-xs mt-1">Para t = {inputs.operatingTime}s</div>
              </div>
              
              <div className="bg-orange-50 p-4 rounded-lg">
                <div className="text-sm text-orange-600 font-medium mb-1">Energía Específica Máxima</div>
                <div className="text-xl font-bold text-orange-900">{result.maxAllowableI2t} A²s</div>
              </div>
              
              <div className="bg-yellow-50 p-4 rounded-lg">
                <div className="text-sm text-yellow-600 font-medium mb-1">Nivel de Disparo Magnético</div>
                <div className="text-xl font-bold text-yellow-900">{result.magneticTripLevel} A</div>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="text-sm text-gray-600 font-medium mb-1">Constante Térmica (k)</div>
                <div className="text-xl font-bold text-gray-900">{result.kConstant} A·s^(1/2)/mm²</div>
              </div>
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              Completa los datos y haz clic en "Calcular"
            </div>
          )}
        </div>
      </div>

      {/* Fórmulas */}
      <div className="mt-8 bg-blue-50 p-4 rounded-lg border-l-4 border-blue-500">
        <h3 className="text-lg font-semibold text-blue-900 mb-2">Fórmulas Utilizadas</h3>
        <div className="text-blue-800 font-mono space-y-2 text-sm">
          <div><strong>Capacidad térmica:</strong></div>
          <div>• I²t_max = (k × S)² (Capacidad térmica máxima del conductor)</div>
          
          <div className="mt-4"><strong>Energía de cortocircuito:</strong></div>
          <div>• I²t_cc = I_cc² × t (Energía específica del cortocircuito)</div>
          
          <div className="mt-4"><strong>Criterio de protección:</strong></div>
          <div>• I²t_cc ≤ I²t_max (El cable debe soportar la energía de cortocircuito)</div>
          
          <div className="mt-4"><strong>Constantes K (A·s^(1/2)/mm²):</strong></div>
          <div>• Cobre PVC: 115, Cobre XLPE/EPR: 143</div>
          <div>• Aluminio PVC: 74, Aluminio XLPE/EPR: 94</div>
        </div>
        <div className="text-sm text-blue-700 mt-3">
          I = Corriente (A), t = Tiempo (s), S = Sección (mm²), k = Constante térmica
        </div>
      </div>
    </div>
  );
};

export default CableProtectionCalc;
