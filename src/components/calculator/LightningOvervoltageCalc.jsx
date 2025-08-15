import { useState } from 'react';

const LightningOvervoltageCalc = () => {
  const [inputs, setInputs] = useState({
    environment: 'rural',
    lengthType: 'known',
    knownLength: 5,
    knownLengthUnit: 'km',
    lpal: 2, // Línea aérea baja tensión
    lpalUnit: 'km',
    lpcl: 1, // Línea subterránea baja tensión  
    lpclUnit: 'km',
    lpah: 3, // Línea aérea alta tensión
    lpahUnit: 'km',
    lpch: 0.5, // Línea subterránea alta tensión
    lpchUnit: 'km',
    flashDensity: 3.5 // Destellos por km² por año
  });

  const [result, setResult] = useState(null);

  // Factores de corrección por ambiente
  const environmentFactors = {
    rural: {
      name: 'Rural o suburbano',
      aerialFactor: 1.0,
      undergroundFactor: 0.3,
      buildingDensity: 0.1
    },
    urban: {
      name: 'Urbano', 
      aerialFactor: 0.7,
      undergroundFactor: 0.2,
      buildingDensity: 0.6
    }
  };

  // Factores de riesgo por tipo de línea
  const lineRiskFactors = {
    aerial_low: 4.0, // Línea aérea BT
    underground_low: 0.5, // Línea subterránea BT
    aerial_high: 6.0, // Línea aérea AT
    underground_high: 0.2 // Línea subterránea AT
  };

  const calculate = () => {
    const { environment, lengthType, knownLength, knownLengthUnit,
            lpal, lpalUnit, lpcl, lpclUnit, lpah, lpahUnit, lpch, lpchUnit, flashDensity } = inputs;

    let totalLength = 0;
    let weightedRisk = 0;
    let lineBreakdown = {};

    // Convertir todas las longitudes a km
    const unitConversions = { 'm': 0.001, 'km': 1 };
    
    if (lengthType === 'known') {
      totalLength = knownLength * unitConversions[knownLengthUnit];
      // Para longitud conocida, asumir distribución promedio
      weightedRisk = totalLength * 2.5; // Factor promedio
    } else {
      // Calcular longitudes individuales
      const lpalKm = lpal * unitConversions[lpalUnit];
      const lpclKm = lpcl * unitConversions[lpclUnit];
      const lpahKm = lpah * unitConversions[lpahUnit];
      const lpchKm = lpch * unitConversions[lpchUnit];
      
      totalLength = lpalKm + lpclKm + lpahKm + lpchKm;
      
      // Calcular riesgo ponderado por tipo de línea
      weightedRisk = (lpalKm * lineRiskFactors.aerial_low) +
                     (lpclKm * lineRiskFactors.underground_low) +
                     (lpahKm * lineRiskFactors.aerial_high) +
                     (lpchKm * lineRiskFactors.underground_high);

      lineBreakdown = {
        lpal: lpalKm,
        lpcl: lpclKm,
        lpah: lpahKm,
        lpch: lpchKm
      };
    }

    // Aplicar factor ambiental
    const envFactor = environmentFactors[environment];
    const environmentalRisk = weightedRisk * (envFactor.aerialFactor + envFactor.undergroundFactor) / 2;
    
    // Calcular número esperado de descargas por año
    const expectedStrikes = (environmentalRisk * flashDensity) / 10; // Normalizado
    
    // Determinar nivel de riesgo
    let riskLevel = '';
    let riskColor = '';
    let recommendations = [];
    
    if (expectedStrikes < 0.1) {
      riskLevel = 'Muy Bajo';
      riskColor = 'text-green-800';
      recommendations = ['Sistema básico de puesta a tierra suficiente'];
    } else if (expectedStrikes < 0.5) {
      riskLevel = 'Bajo';
      riskColor = 'text-blue-800';
      recommendations = [
        'Instalar pararrayos en puntos críticos',
        'Verificar sistema de puesta a tierra'
      ];
    } else if (expectedStrikes < 1.0) {
      riskLevel = 'Medio';
      riskColor = 'text-yellow-800';
      recommendations = [
        'Sistema de protección atmosférica requerido',
        'Pararrayos en todas las estructuras principales',
        'Mejora del sistema de puesta a tierra'
      ];
    } else if (expectedStrikes < 2.0) {
      riskLevel = 'Alto';
      riskColor = 'text-orange-800';
      recommendations = [
        'Sistema integral de protección atmosférica',
        'Múltiples pararrayos y cables de guarda',
        'Sistema de puesta a tierra de baja impedancia',
        'Protectores de sobretensión en equipos'
      ];
    } else {
      riskLevel = 'Muy Alto';
      riskColor = 'text-red-800';
      recommendations = [
        'Sistema completo de protección atmosférica',
        'Múltiples niveles de protección',
        'Pararrayos Franklin y Faraday',
        'Sistema mallado de puesta a tierra',
        'Protección en todos los equipos electrónicos'
      ];
    }

    setResult({
      totalLength: totalLength.toFixed(2),
      expectedStrikes: expectedStrikes.toFixed(3),
      riskLevel: riskLevel,
      riskColor: riskColor,
      recommendations: recommendations,
      environmentalRisk: environmentalRisk.toFixed(2),
      flashDensity: flashDensity,
      environment: envFactor.name,
      lengthType: lengthType,
      lineBreakdown: lineBreakdown,
      weightedRisk: weightedRisk.toFixed(2)
    });
  };

  const handleInputChange = (field, value) => {
    setInputs(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="p-6">
      <h2 className="text-xl font-semibold mb-6">Sobretensiones Atmosféricas</h2>
      
      <div className="grid md:grid-cols-2 gap-6">
        {/* Inputs */}
        <div className="space-y-4">
          {/* Ambiente */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Ambiente
            </label>
            <div className="space-y-2">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="environment"
                  value="rural"
                  checked={inputs.environment === 'rural'}
                  onChange={(e) => handleInputChange('environment', e.target.value)}
                  className="mr-2"
                />
                Rural o suburbano
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="environment"
                  value="urban"
                  checked={inputs.environment === 'urban'}
                  onChange={(e) => handleInputChange('environment', e.target.value)}
                  className="mr-2"
                />
                Urbano
              </label>
            </div>
          </div>

          {/* Tipo de longitud */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Longitud de la línea
            </label>
            <select
              value={inputs.lengthType}
              onChange={(e) => handleInputChange('lengthType', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="known">Conocida</option>
              <option value="calculate">A calcular</option>
            </select>
          </div>

          {/* Longitud conocida */}
          {inputs.lengthType === 'known' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Longitud total
              </label>
              <div className="flex gap-2">
                <input
                  type="number"
                  value={inputs.knownLength}
                  onChange={(e) => handleInputChange('knownLength', parseFloat(e.target.value) || 0)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <select
                  value={inputs.knownLengthUnit}
                  onChange={(e) => handleInputChange('knownLengthUnit', e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="m">m</option>
                  <option value="km">km</option>
                </select>
              </div>
            </div>
          )}

          {/* Longitudes individuales */}
          {inputs.lengthType === 'calculate' && (
            <div className="space-y-3">
              <div className="bg-blue-50 p-3 rounded-lg">
                <h3 className="text-sm font-semibold text-blue-900 mb-2">Líneas por tipo</h3>
                
                <div className="space-y-3">
                  {/* LPAL */}
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      LPAL - Línea aérea de baja tensión
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="number"
                        value={inputs.lpal}
                        onChange={(e) => handleInputChange('lpal', parseFloat(e.target.value) || 0)}
                        className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      <select
                        value={inputs.lpalUnit}
                        onChange={(e) => handleInputChange('lpalUnit', e.target.value)}
                        className="px-2 py-1 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="m">m</option>
                        <option value="km">km</option>
                      </select>
                    </div>
                  </div>

                  {/* LPCL */}
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      LPCL - Línea subterránea de baja tensión
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="number"
                        value={inputs.lpcl}
                        onChange={(e) => handleInputChange('lpcl', parseFloat(e.target.value) || 0)}
                        className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      <select
                        value={inputs.lpclUnit}
                        onChange={(e) => handleInputChange('lpclUnit', e.target.value)}
                        className="px-2 py-1 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="m">m</option>
                        <option value="km">km</option>
                      </select>
                    </div>
                  </div>

                  {/* LPAH */}
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      LPAH - Línea aérea de alta tensión
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="number"
                        value={inputs.lpah}
                        onChange={(e) => handleInputChange('lpah', parseFloat(e.target.value) || 0)}
                        className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      <select
                        value={inputs.lpahUnit}
                        onChange={(e) => handleInputChange('lpahUnit', e.target.value)}
                        className="px-2 py-1 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="m">m</option>
                        <option value="km">km</option>
                      </select>
                    </div>
                  </div>

                  {/* LPCH */}
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      LPCH - Línea subterránea de alta tensión
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="number"
                        value={inputs.lpch}
                        onChange={(e) => handleInputChange('lpch', parseFloat(e.target.value) || 0)}
                        className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      <select
                        value={inputs.lpchUnit}
                        onChange={(e) => handleInputChange('lpchUnit', e.target.value)}
                        className="px-2 py-1 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="m">m</option>
                        <option value="km">km</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Densidad de fulminación */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Densidad de fulminación
            </label>
            <div className="flex gap-2">
              <input
                type="number"
                value={inputs.flashDensity}
                onChange={(e) => handleInputChange('flashDensity', parseFloat(e.target.value) || 0)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <span className="px-3 py-2 bg-gray-100 border border-gray-300 rounded-md text-gray-700 text-sm">
                Destellos/km²/año
              </span>
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
              <div className="bg-red-50 p-4 rounded-lg">
                <div className="text-sm text-red-600 font-medium">Descargas esperadas por año</div>
                <div className="text-2xl font-bold text-red-900">{result.expectedStrikes}</div>
                <div className="text-xs text-red-700 mt-1">Número de eventos probables</div>
              </div>

              <div className={`bg-yellow-50 p-4 rounded-lg`}>
                <div className="text-sm text-yellow-600 font-medium">Nivel de riesgo</div>
                <div className={`text-xl font-bold ${result.riskColor}`}>{result.riskLevel}</div>
                <div className="text-xs text-yellow-700 mt-1">Ambiente: {result.environment}</div>
              </div>

              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="text-sm text-blue-600 font-medium">Longitud total del sistema</div>
                <div className="text-xl font-bold text-blue-900">{result.totalLength} km</div>
                <div className="text-xs text-blue-700 mt-1">Riesgo ponderado: {result.weightedRisk}</div>
              </div>

              {inputs.lengthType === 'calculate' && Object.keys(result.lineBreakdown).length > 0 && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="text-sm text-gray-600 font-medium mb-2">Desglose por tipo de línea</div>
                  <div className="text-xs text-gray-600 space-y-1">
                    <div>• LPAL (aérea BT): {result.lineBreakdown.lpal.toFixed(2)} km</div>
                    <div>• LPCL (subterránea BT): {result.lineBreakdown.lpcl.toFixed(2)} km</div>
                    <div>• LPAH (aérea AT): {result.lineBreakdown.lpah.toFixed(2)} km</div>
                    <div>• LPCH (subterránea AT): {result.lineBreakdown.lpch.toFixed(2)} km</div>
                  </div>
                </div>
              )}

              <div className="bg-green-50 p-4 rounded-lg">
                <div className="text-sm text-green-600 font-medium mb-2">Recomendaciones de protección</div>
                <ul className="text-xs text-green-700 space-y-1">
                  {result.recommendations.map((rec, index) => (
                    <li key={index}>• {rec}</li>
                  ))}
                </ul>
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
          <div><strong>Riesgo ponderado:</strong> R = Σ(L_i × F_i)</div>
          <div><strong>Factor ambiental:</strong> R_amb = R × (F_aéreo + F_subterráneo) / 2</div>
          <div><strong>Descargas esperadas:</strong> N = (R_amb × ρ_f) / 10</div>
          <div><strong>Longitud total:</strong> L_total = LPAL + LPCL + LPAH + LPCH</div>
          <div className="text-xs text-blue-700 mt-2">
            <strong>Donde:</strong> L = longitud de línea (km), F = factor de riesgo por tipo, ρ_f = densidad de fulminación, R = riesgo ponderado
          </div>
          <div className="text-xs text-blue-700">
            <strong>Factores de riesgo:</strong> Aérea BT=4.0, Subterránea BT=0.5, Aérea AT=6.0, Subterránea AT=0.2
          </div>
        </div>
      </div>
    </div>
  );
};

export default LightningOvervoltageCalc;