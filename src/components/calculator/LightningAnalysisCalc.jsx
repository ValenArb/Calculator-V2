import { useState } from 'react';

const LightningAnalysisCalc = () => {
  const [inputs, setInputs] = useState({
    calculationType: 'rolling-sphere',
    // Rolling Sphere Method
    structureHeight: 20, // m
    structureWidth: 30, // m
    structureLength: 50, // m
    rodHeight: 5, // m
    sphereRadius: 45, // m (standard for Class II)
    // Protection Angle Method
    rodHeightAngle: 10, // m
    protectionAngle: 45, // degrees
    distanceToProtect: 15, // m
    // Risk Assessment
    structureType: 'residential', // residential, commercial, industrial
    geographicLocation: 'moderate', // low, moderate, high, extreme
    groundFlashDensity: 2.5, // flashes/km²/year
    collectionArea: 2000, // m²
    lightningRiskLevel: 'normal' // normal, high
  });
  
  const [result, setResult] = useState(null);

  // Lightning risk factors by structure type
  const structureRiskFactors = {
    'residential': { Cd: 1, Ce: 1, Ca: 0.5 },
    'commercial': { Cd: 1, Ce: 1, Ca: 1 },
    'industrial': { Cd: 1, Ce: 2, Ca: 1 },
    'heritage': { Cd: 1, Ce: 1, Ca: 2 },
    'explosive': { Cd: 1, Ce: 10, Ca: 10 }
  };

  // Ground flash density by geographic location
  const groundFlashData = {
    'low': 1.0,
    'moderate': 2.5,
    'high': 5.0,
    'extreme': 10.0
  };

  // Standard sphere radii for different protection levels
  const standardSphereRadii = {
    'class-i': 20,    // High protection
    'class-ii': 45,   // Medium protection
    'class-iii': 60   // Normal protection
  };

  const calculate = () => {
    const { calculationType, structureHeight, structureWidth, structureLength, 
            rodHeight, sphereRadius, rodHeightAngle, protectionAngle, distanceToProtect,
            structureType, geographicLocation, groundFlashDensity, collectionArea } = inputs;

    let results = {};

    if (calculationType === 'rolling-sphere') {
      // Rolling sphere method calculations
      const R = sphereRadius; // Rolling sphere radius
      
      // Maximum protection height for a rod
      const maxProtectionHeight = Math.sqrt(Math.pow(R, 2) - Math.pow(rodHeight - R, 2));
      
      // Protection radius at ground level
      const protectionRadiusGround = Math.sqrt(Math.pow(R, 2) - Math.pow(R - rodHeight, 2));
      
      // Protection radius at structure height
      const heightDiff = R - (rodHeight - structureHeight);
      const protectionRadiusAtHeight = heightDiff > 0 ? 
                                       Math.sqrt(Math.pow(R, 2) - Math.pow(heightDiff, 2)) : 0;
      
      // Check if structure is protected
      const structureProtected = protectionRadiusAtHeight >= Math.max(structureWidth, structureLength) / 2;
      
      // Minimum rod height for complete protection
      const minRodHeight = R - Math.sqrt(Math.pow(R, 2) - Math.pow(Math.max(structureWidth, structureLength) / 2, 2)) + structureHeight;
      
      // Protection zone volume (simplified)
      const protectionZoneArea = Math.PI * Math.pow(protectionRadiusGround, 2);
      
      // Strike point calculation
      const strikeHeight = R - Math.sqrt(Math.pow(R, 2) - Math.pow(protectionRadiusGround, 2));
      
      results = {
        maxProtectionHeight: Math.max(0, maxProtectionHeight).toFixed(1),
        protectionRadiusGround: protectionRadiusGround.toFixed(1),
        protectionRadiusAtHeight: Math.max(0, protectionRadiusAtHeight).toFixed(1),
        structureProtected,
        minRodHeight: minRodHeight.toFixed(1),
        protectionZoneArea: (protectionZoneArea / 1000).toFixed(2), // Convert to k m²
        strikeHeight: strikeHeight.toFixed(1),
        sphereRadius: R,
        protectionClass: R === 20 ? 'Clase I (Alta)' : R === 45 ? 'Clase II (Media)' : 'Clase III (Normal)'
      };

    } else if (calculationType === 'protection-angle') {
      // Protection angle method calculations
      const h = rodHeightAngle; // Rod height
      const α = protectionAngle * Math.PI / 180; // Convert to radians
      
      // Protected radius at ground level
      const protectedRadius = h * Math.tan(α);
      
      // Protected radius at specific height
      const heightToCheck = structureHeight;
      const protectedRadiusAtHeight = (h - heightToCheck) * Math.tan(α);
      
      // Maximum protection distance (45° rule)
      const maxProtectionDistance = h;
      
      // Check if distance to protect is covered
      const distanceProtected = distanceToProtect <= protectedRadius;
      
      // Required rod height for specific protection distance
      const requiredRodHeight = distanceToProtect / Math.tan(α) + heightToCheck;
      
      // Protection zone area
      const protectedArea = Math.PI * Math.pow(protectedRadius, 2);
      
      results = {
        protectedRadius: protectedRadius.toFixed(1),
        protectedRadiusAtHeight: Math.max(0, protectedRadiusAtHeight).toFixed(1),
        maxProtectionDistance: maxProtectionDistance.toFixed(1),
        distanceProtected,
        requiredRodHeight: requiredRodHeight.toFixed(1),
        protectedArea: (protectedArea / 1000).toFixed(2), // Convert to k m²
        protectionAngleDeg: protectionAngle,
        effectiveProtectionAngle: Math.atan(protectedRadius / h) * 180 / Math.PI
      };

    } else if (calculationType === 'risk-assessment') {
      // Lightning risk assessment according to IEC 62305
      const Ng = groundFlashDensity; // Ground flash density
      const factors = structureRiskFactors[structureType];
      
      // Collection area calculation
      const L = structureLength;
      const W = structureWidth;
      const H = structureHeight;
      const Ad = L * W + 2 * H * (L + W) + Math.PI * Math.pow(H, 2);
      
      // Annual number of dangerous events
      const Nd = Ng * Ad * 1e-6; // Convert m² to km²
      
      // Probability factors (simplified)
      const Pa = 1; // Probability that lightning to structure causes shock to living beings
      const Pb = factors.Ca; // Probability of damage to structure
      const Pc = factors.Ce; // Probability of failure of internal systems
      
      // Risk components
      const R1 = Nd * Pa * factors.Cd; // Risk of loss of human life
      const R2 = Nd * Pb * factors.Cd; // Risk of loss of service to public
      const R3 = Nd * Pc * factors.Cd; // Risk of loss of cultural heritage
      const R4 = Nd * Pc * factors.Cd; // Risk of loss of economic value
      
      // Total risk
      const totalRisk = R1 + R2 + R3 + R4;
      
      // Acceptable risk levels (typical values)
      const acceptableRiskLife = 1e-5; // 10⁻⁵ per year
      const acceptableRiskService = 1e-3; // 10⁻³ per year
      
      // Protection requirement
      const protectionRequired = totalRisk > acceptableRiskLife;
      
      // Lightning protection system efficiency required
      const requiredEfficiency = protectionRequired ? 
                                 (1 - acceptableRiskLife / totalRisk) * 100 : 0;
      
      results = {
        collectionArea: (Ad / 1000).toFixed(1), // km²
        annualDangerousEvents: Nd.toFixed(4),
        riskLifeLoss: (R1 * 1e6).toFixed(2), // × 10⁻⁶
        riskServiceLoss: (R2 * 1e3).toFixed(2), // × 10⁻³
        totalRisk: (totalRisk * 1e6).toFixed(2), // × 10⁻⁶
        protectionRequired,
        requiredEfficiency: Math.min(99.9, Math.max(0, requiredEfficiency)).toFixed(1),
        riskLevel: totalRisk > 1e-4 ? 'ALTO' : totalRisk > 1e-5 ? 'MODERADO' : 'BAJO',
        groundFlashDensity: Ng,
        structureCategory: structureType.toUpperCase()
      };
    }

    setResult(results);
  };

  const handleInputChange = (field, value) => {
    setInputs(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="p-6">
      {/* Formula */}
      <div className="bg-blue-50 p-4 rounded-lg mb-6 border-l-4 border-blue-500">
        <h3 className="text-lg font-semibold text-blue-900 mb-2">Fórmulas</h3>
        <div className="text-blue-800 font-mono space-y-1 text-sm">
          {inputs.calculationType === 'rolling-sphere' && (
            <>
              <div>r<sub>p</sub> = √(R² - (R-h)²) (Radio protección)</div>
              <div>h<sub>s</sub> = R - √(R² - r<sub>p</sub>²) (Altura impacto)</div>
              <div>A<sub>p</sub> = πr<sub>p</sub>² (Área protección)</div>
            </>
          )}
          {inputs.calculationType === 'protection-angle' && (
            <>
              <div>r<sub>p</sub> = h × tan(α) (Radio protección)</div>
              <div>h<sub>req</sub> = d/tan(α) + h<sub>obj</sub> (Altura requerida)</div>
              <div>A<sub>p</sub> = πr<sub>p</sub>² (Área protección)</div>
            </>
          )}
          {inputs.calculationType === 'risk-assessment' && (
            <>
              <div>A<sub>d</sub> = L×W + 2H×(L+W) + πH² (Área colección)</div>
              <div>N<sub>d</sub> = N<sub>g</sub> × A<sub>d</sub> × 10⁻⁶ (Eventos anuales)</div>
              <div>R = N<sub>d</sub> × P<sub>a</sub> × P<sub>b</sub> × L (Riesgo)</div>
            </>
          )}
        </div>
      </div>

      <h2 className="text-xl font-semibold mb-6">Análisis de Protección contra Rayos</h2>
      
      <div className="grid md:grid-cols-2 gap-6">
        {/* Inputs */}
        <div className="space-y-4">
          {/* Calculation Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Método de Análisis
            </label>
            <div className="space-y-2">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="calculationType"
                  value="rolling-sphere"
                  checked={inputs.calculationType === 'rolling-sphere'}
                  onChange={(e) => handleInputChange('calculationType', e.target.value)}
                  className="mr-2"
                />
                <span>• Método Esfera Rodante</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="calculationType"
                  value="protection-angle"
                  checked={inputs.calculationType === 'protection-angle'}
                  onChange={(e) => handleInputChange('calculationType', e.target.value)}
                  className="mr-2"
                />
                <span>• Método Ángulo de Protección</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="calculationType"
                  value="risk-assessment"
                  checked={inputs.calculationType === 'risk-assessment'}
                  onChange={(e) => handleInputChange('calculationType', e.target.value)}
                  className="mr-2"
                />
                <span>• Evaluación de Riesgo</span>
              </label>
            </div>
          </div>

          {/* Structure dimensions */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Altura de Estructura (m)
            </label>
            <input
              type="number"
              value={inputs.structureHeight}
              onChange={(e) => handleInputChange('structureHeight', parseFloat(e.target.value) || 0)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Ancho de Estructura (m)
            </label>
            <input
              type="number"
              value={inputs.structureWidth}
              onChange={(e) => handleInputChange('structureWidth', parseFloat(e.target.value) || 0)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Longitud de Estructura (m)
            </label>
            <input
              type="number"
              value={inputs.structureLength}
              onChange={(e) => handleInputChange('structureLength', parseFloat(e.target.value) || 0)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {inputs.calculationType === 'rolling-sphere' && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Altura del Pararrayos (m)
                </label>
                <input
                  type="number"
                  value={inputs.rodHeight}
                  onChange={(e) => handleInputChange('rodHeight', parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Radio de Esfera (m)
                </label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    value={inputs.sphereRadius}
                    onChange={(e) => handleInputChange('sphereRadius', parseFloat(e.target.value) || 0)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <select
                    onChange={(e) => handleInputChange('sphereRadius', parseFloat(e.target.value))}
                    className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Clase</option>
                    <option value={20}>Clase I (20m)</option>
                    <option value={45}>Clase II (45m)</option>
                    <option value={60}>Clase III (60m)</option>
                  </select>
                </div>
                <div className="text-xs text-gray-600 mt-1">
                  Clase I: Alta protección, Clase II: Media, Clase III: Normal
                </div>
              </div>
            </>
          )}

          {inputs.calculationType === 'protection-angle' && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Altura del Pararrayos (m)
                </label>
                <input
                  type="number"
                  value={inputs.rodHeightAngle}
                  onChange={(e) => handleInputChange('rodHeightAngle', parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Ángulo de Protección (°)
                </label>
                <select
                  value={inputs.protectionAngle}
                  onChange={(e) => handleInputChange('protectionAngle', parseFloat(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value={30}>30° (h menor o igual 20m)</option>
                  <option value={45}>45° (20m menor h menor o igual 45m)</option>
                  <option value={60}>60° (45m menor h menor o igual 60m)</option>
                </select>
                <div className="text-xs text-gray-600 mt-1">
                  Ángulo depende de altura del pararrayos
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Distancia a Proteger (m)
                </label>
                <input
                  type="number"
                  value={inputs.distanceToProtect}
                  onChange={(e) => handleInputChange('distanceToProtect', parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </>
          )}

          {inputs.calculationType === 'risk-assessment' && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tipo de Estructura
                </label>
                <select
                  value={inputs.structureType}
                  onChange={(e) => handleInputChange('structureType', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="residential">Residencial</option>
                  <option value="commercial">Comercial</option>
                  <option value="industrial">Industrial</option>
                  <option value="heritage">Patrimonio Cultural</option>
                  <option value="explosive">Materiales Explosivos</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Ubicación Geográfica
                </label>
                <select
                  value={inputs.geographicLocation}
                  onChange={(e) => handleInputChange('geographicLocation', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="low">Baja Actividad (Ng=1.0)</option>
                  <option value="moderate">Moderada (Ng=2.5)</option>
                  <option value="high">Alta (Ng=5.0)</option>
                  <option value="extreme">Extrema (Ng=10.0)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Densidad Rayos Tierra (rayos/km²/año)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={inputs.groundFlashDensity}
                  onChange={(e) => handleInputChange('groundFlashDensity', parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <div className="text-xs text-gray-600 mt-1">
                  Consultar mapas isoceráunicos locales
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

        {/* Results */}
        <div className="space-y-4">
          {result ? (
            <>
              {inputs.calculationType === 'rolling-sphere' && (
                <>
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <div className="text-sm text-blue-600 font-medium">Radio Protección (Suelo)</div>
                    <div className="text-2xl font-bold text-blue-900">{result.protectionRadiusGround} m</div>
                  </div>

                  <div className="bg-green-50 p-4 rounded-lg">
                    <div className="text-sm text-green-600 font-medium">Radio Protección (Altura)</div>
                    <div className="text-xl font-bold text-green-900">{result.protectionRadiusAtHeight} m</div>
                  </div>

                  <div className={`p-4 rounded-lg border-2 ${
                    result.structureProtected ? 'bg-green-100 border-green-300' : 'bg-red-100 border-red-300'
                  }`}>
                    <div className={`text-sm font-medium ${
                      result.structureProtected ? 'text-green-700' : 'text-red-700'
                    }`}>
                      Estructura: {result.structureProtected ? 'PROTEGIDA' : 'NO PROTEGIDA'}
                    </div>
                  </div>

                  <div className="bg-orange-50 p-4 rounded-lg">
                    <div className="text-sm text-orange-600 font-medium">Altura Mínima Pararrayos</div>
                    <div className="text-xl font-bold text-orange-900">{result.minRodHeight} m</div>
                  </div>

                  <div className="bg-purple-50 p-4 rounded-lg">
                    <div className="text-sm text-purple-600 font-medium">Área de Protección</div>
                    <div className="text-xl font-bold text-purple-900">{result.protectionZoneArea} km²</div>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="text-sm text-gray-600 font-medium mb-2">Información Adicional</div>
                    <div className="text-xs text-gray-600 space-y-1">
                      <div>• {result.protectionClass}</div>
                      <div>• Radio esfera: {result.sphereRadius} m</div>
                      <div>• Altura punto impacto: {result.strikeHeight} m</div>
                    </div>
                  </div>
                </>
              )}

              {inputs.calculationType === 'protection-angle' && (
                <>
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <div className="text-sm text-blue-600 font-medium">Radio Protegido (Suelo)</div>
                    <div className="text-2xl font-bold text-blue-900">{result.protectedRadius} m</div>
                  </div>

                  <div className="bg-green-50 p-4 rounded-lg">
                    <div className="text-sm text-green-600 font-medium">Radio Protegido (Altura)</div>
                    <div className="text-xl font-bold text-green-900">{result.protectedRadiusAtHeight} m</div>
                  </div>

                  <div className={`p-4 rounded-lg border-2 ${
                    result.distanceProtected ? 'bg-green-100 border-green-300' : 'bg-red-100 border-red-300'
                  }`}>
                    <div className={`text-sm font-medium ${
                      result.distanceProtected ? 'text-green-700' : 'text-red-700'
                    }`}>
                      Distancia: {result.distanceProtected ? 'PROTEGIDA' : 'NO PROTEGIDA'}
                    </div>
                  </div>

                  <div className="bg-orange-50 p-4 rounded-lg">
                    <div className="text-sm text-orange-600 font-medium">Altura Requerida</div>
                    <div className="text-xl font-bold text-orange-900">{result.requiredRodHeight} m</div>
                  </div>

                  <div className="bg-purple-50 p-4 rounded-lg">
                    <div className="text-sm text-purple-600 font-medium">Área Protegida</div>
                    <div className="text-xl font-bold text-purple-900">{result.protectedArea} km²</div>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="text-sm text-gray-600 font-medium mb-2">Información Adicional</div>
                    <div className="text-xs text-gray-600 space-y-1">
                      <div>• Ángulo protección: {result.protectionAngleDeg}°</div>
                      <div>• Ángulo efectivo: {result.effectiveProtectionAngle?.toFixed(1)}°</div>
                      <div>• Distancia máxima: {result.maxProtectionDistance} m</div>
                    </div>
                  </div>
                </>
              )}

              {inputs.calculationType === 'risk-assessment' && (
                <>
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <div className="text-sm text-blue-600 font-medium">Área de Colección</div>
                    <div className="text-2xl font-bold text-blue-900">{result.collectionArea} km²</div>
                  </div>

                  <div className="bg-green-50 p-4 rounded-lg">
                    <div className="text-sm text-green-600 font-medium">Eventos Anuales</div>
                    <div className="text-xl font-bold text-green-900">{result.annualDangerousEvents}</div>
                  </div>

                  <div className="bg-purple-50 p-4 rounded-lg">
                    <div className="text-sm text-purple-600 font-medium">Riesgo Total</div>
                    <div className="text-xl font-bold text-purple-900">{result.totalRisk} × 10⁻⁶</div>
                  </div>

                  <div className={`p-4 rounded-lg border-2 ${
                    result.protectionRequired ? 'bg-red-100 border-red-300' : 'bg-green-100 border-green-300'
                  }`}>
                    <div className={`text-sm font-medium ${
                      result.protectionRequired ? 'text-red-700' : 'text-green-700'
                    }`}>
                      Protección: {result.protectionRequired ? 'REQUERIDA' : 'NO REQUERIDA'}
                    </div>
                    <div className="text-xs mt-1">
                      Nivel de riesgo: {result.riskLevel}
                    </div>
                  </div>

                  {result.protectionRequired && (
                    <div className="bg-orange-50 p-4 rounded-lg">
                      <div className="text-sm text-orange-600 font-medium">Eficiencia Requerida</div>
                      <div className="text-xl font-bold text-orange-900">{result.requiredEfficiency} %</div>
                    </div>
                  )}

                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="text-sm text-gray-600 font-medium mb-2">Detalles del Análisis</div>
                    <div className="text-xs text-gray-600 space-y-1">
                      <div>• Riesgo pérdida vida: {result.riskLifeLoss} × 10⁻⁶</div>
                      <div>• Riesgo pérdida servicio: {result.riskServiceLoss} × 10⁻³</div>
                      <div>• Categoría: {result.structureCategory}</div>
                      <div>• Ng: {result.groundFlashDensity} rayos/km²/año</div>
                    </div>
                  </div>
                </>
              )}
            </>
          ) : (
            <div className="text-center py-12 text-gray-500">
              Completa los datos y haz clic en "Calcular"
            </div>
          )}
        </div>
      </div>

      {/* Additional Information */}
      <div className="mt-8 bg-gray-50 p-4 rounded-lg">
        <h3 className="text-sm font-medium text-gray-900 mb-2">Información Técnica:</h3>
        <div className="text-xs text-gray-600 space-y-1">
          <div><strong>Esfera Rodante:</strong> Método más preciso, considera geometría 3D de la estructura</div>
          <div><strong>Ángulo de Protección:</strong> Método simplificado, limitado a estructuras simples</div>
          <div><strong>Evaluación de Riesgo:</strong> Análisis según IEC 62305 para determinar necesidad de protección</div>
          <div><strong>Clases de Protección:</strong> Clase I (mejor), II (estándar), III (básica)</div>
        </div>
      </div>
    </div>
  );
};

export default LightningAnalysisCalc;