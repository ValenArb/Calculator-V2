import { useState } from 'react';

const GroundingSystemCalc = () => {
  const [inputs, setInputs] = useState({
    calculationType: 'ground-resistance',
    // Ground Resistance Parameters
    soilResistivity: 100, // Ω·m
    electrodeLength: 3, // m
    electrodeRadius: 0.01, // m
    electrodeType: 'vertical-rod',
    numberOfElectrodes: 1,
    separationDistance: 6, // m
    // Step and Touch Voltage Parameters
    faultCurrent: 1000, // A
    faultDuration: 0.5, // s
    bodyWeight: 70, // kg
    surfaceLayer: 'gravel', // gravel, asphalt, concrete
    layerThickness: 0.1 // m
  });
  
  const [result, setResult] = useState(null);

  // Soil resistivity typical values (Ω·m)
  const typicalSoilResistivity = {
    'wet-organic': { min: 10, max: 50, avg: 30 },
    'moist-loam': { min: 50, max: 150, avg: 100 },
    'clay': { min: 100, max: 300, avg: 200 },
    'sand-gravel': { min: 300, max: 1000, avg: 650 },
    'dry-sand': { min: 1000, max: 5000, avg: 3000 },
    'bedrock': { min: 5000, max: 50000, avg: 25000 }
  };

  // Surface layer resistivity (Ω·m)
  const surfaceLayerResistivity = {
    'gravel': 3000,
    'asphalt': 10000,
    'concrete': 100
  };

  const calculate = () => {
    const { calculationType, soilResistivity, electrodeLength, electrodeRadius, electrodeType, 
            numberOfElectrodes, separationDistance, faultCurrent, faultDuration, bodyWeight, 
            surfaceLayer, layerThickness } = inputs;

    let results = {};

    if (calculationType === 'ground-resistance') {
      // Ground resistance calculation
      let singleElectrodeResistance = 0;

      switch (electrodeType) {
        case 'vertical-rod':
          // Dwight formula for vertical rod: R = ρ/(2πL) * ln(4L/r)
          singleElectrodeResistance = (soilResistivity / (2 * Math.PI * electrodeLength)) * 
                                      Math.log(4 * electrodeLength / electrodeRadius);
          break;
        case 'horizontal-conductor':
          // R = ρ/(2πL) * ln(L²/rd)
          const depth = 0.6; // typical burial depth in meters
          singleElectrodeResistance = (soilResistivity / (2 * Math.PI * electrodeLength)) * 
                                      Math.log(Math.pow(electrodeLength, 2) / (electrodeRadius * depth));
          break;
        case 'ground-plate':
          // R = ρ/(4√A) for square plate
          const area = Math.pow(electrodeLength, 2); // assuming square plate with side = electrodeLength
          singleElectrodeResistance = soilResistivity / (4 * Math.sqrt(area));
          break;
      }

      // Multiple electrodes resistance with mutual resistance factor
      let totalResistance = singleElectrodeResistance;
      if (numberOfElectrodes > 1) {
        // Simplified method using efficiency factor
        const spacing = separationDistance / electrodeLength;
        let efficiencyFactor = 1;
        
        if (spacing < 2) efficiencyFactor = 0.6;
        else if (spacing < 3) efficiencyFactor = 0.7;
        else if (spacing < 4) efficiencyFactor = 0.8;
        else if (spacing < 6) efficiencyFactor = 0.9;
        else efficiencyFactor = 0.95;

        totalResistance = singleElectrodeResistance / (numberOfElectrodes * efficiencyFactor);
      }

      // Electrode sizing (minimum length for target resistance)
      const targetResistance = 25; // Ω (typical requirement)
      let minLength = 0;
      
      switch (electrodeType) {
        case 'vertical-rod':
          // Iterative solution for required length
          minLength = (soilResistivity / (2 * Math.PI * targetResistance)) * Math.log(4 / electrodeRadius);
          break;
        case 'horizontal-conductor':
          minLength = Math.sqrt(Math.exp(2 * Math.PI * targetResistance * 0.6 / soilResistivity) * electrodeRadius * 0.6);
          break;
        case 'ground-plate':
          const requiredArea = Math.pow(soilResistivity / (4 * targetResistance), 2);
          minLength = Math.sqrt(requiredArea);
          break;
      }

      results = {
        singleElectrodeResistance: singleElectrodeResistance.toFixed(2),
        totalResistance: totalResistance.toFixed(2),
        efficiencyFactor: numberOfElectrodes > 1 ? ((singleElectrodeResistance / totalResistance) / numberOfElectrodes).toFixed(3) : 1,
        minLength: minLength.toFixed(2),
        meetsStandard: totalResistance <= 25
      };

    } else if (calculationType === 'step-touch-voltage') {
      // Step and touch voltage calculations based on IEEE Std 80

      // Body resistance calculation
      const bodyResistance = 1000 + 1.5 * bodyWeight; // Ω

      // Surface layer derating factor
      const rho_surface = surfaceLayerResistivity[surfaceLayer];
      const Cs = 1 - (0.09 * (1 - soilResistivity / rho_surface)) / 
                      (2 * layerThickness + 0.09);

      // Shock current and duration factors
      const K = Math.sqrt(0.116 / faultDuration); // for 70kg person
      
      // Tolerable step voltage
      const tolerableStepVoltage = (bodyResistance + 2 * rho_surface * Cs) * K;
      
      // Tolerable touch voltage  
      const tolerableTouchVoltage = (bodyResistance + rho_surface * Cs) * K;

      // Actual step voltage (simplified grid method)
      const gridSpacing = Math.sqrt(electrodeLength); // Assuming square grid
      const actualStepVoltage = (soilResistivity * faultCurrent * 0.65) / 
                                (2 * Math.PI * gridSpacing);

      // Actual touch voltage
      const actualTouchVoltage = (soilResistivity * faultCurrent * 0.5) / 
                                 (2 * Math.PI * electrodeLength);

      results = {
        tolerableStepVoltage: tolerableStepVoltage.toFixed(0),
        tolerableTouchVoltage: tolerableTouchVoltage.toFixed(0),
        actualStepVoltage: actualStepVoltage.toFixed(0),
        actualTouchVoltage: actualTouchVoltage.toFixed(0),
        stepVoltageSafe: actualStepVoltage <= tolerableStepVoltage,
        touchVoltageSafe: actualTouchVoltage <= tolerableTouchVoltage,
        bodyResistance: bodyResistance.toFixed(0),
        surfaceDerating: Cs.toFixed(3),
        shockFactor: K.toFixed(3)
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
          {inputs.calculationType === 'ground-resistance' ? (
            <>
              <div>R<sub>rod</sub> = ρ/(2πL) × ln(4L/r) (Electrodo vertical)</div>
              <div>R<sub>horizontal</sub> = ρ/(2πL) × ln(L²/rd) (Conductor horizontal)</div>
              <div>R<sub>total</sub> = R<sub>single</sub>/(n × η) (Múltiples electrodos)</div>
            </>
          ) : (
            <>
              <div>V<sub>step</sub> = (R<sub>b</sub> + 2ρ<sub>s</sub>C<sub>s</sub>) × K</div>
              <div>V<sub>touch</sub> = (R<sub>b</sub> + ρ<sub>s</sub>C<sub>s</sub>) × K</div>
              <div>K = √(0.116/t<sub>s</sub>) (Factor de duración)</div>
            </>
          )}
        </div>
      </div>

      <h2 className="text-xl font-semibold mb-6">Cálculo de Sistemas de Puesta a Tierra</h2>
      
      <div className="grid md:grid-cols-2 gap-6">
        {/* Inputs */}
        <div className="space-y-4">
          {/* Calculation Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tipo de Cálculo
            </label>
            <div className="space-y-2">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="calculationType"
                  value="ground-resistance"
                  checked={inputs.calculationType === 'ground-resistance'}
                  onChange={(e) => handleInputChange('calculationType', e.target.value)}
                  className="mr-2"
                />
                <span>• Resistencia de Puesta a Tierra</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="calculationType"
                  value="step-touch-voltage"
                  checked={inputs.calculationType === 'step-touch-voltage'}
                  onChange={(e) => handleInputChange('calculationType', e.target.value)}
                  className="mr-2"
                />
                <span>• Tensiones de Paso y Contacto</span>
              </label>
            </div>
          </div>

          {inputs.calculationType === 'ground-resistance' ? (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Resistividad del Suelo (Ω·m)
                </label>
                <input
                  type="number"
                  value={inputs.soilResistivity}
                  onChange={(e) => handleInputChange('soilResistivity', parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <div className="text-xs text-gray-600 mt-1">
                  Típicos: Tierra húmeda (30), Arcilla (200), Arena seca (3000)
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tipo de Electrodo
                </label>
                <select
                  value={inputs.electrodeType}
                  onChange={(e) => handleInputChange('electrodeType', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="vertical-rod">Varilla Vertical</option>
                  <option value="horizontal-conductor">Conductor Horizontal</option>
                  <option value="ground-plate">Placa de Tierra</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Longitud del Electrodo (m)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={inputs.electrodeLength}
                  onChange={(e) => handleInputChange('electrodeLength', parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Radio del Electrodo (m)
                </label>
                <input
                  type="number"
                  step="0.001"
                  value={inputs.electrodeRadius}
                  onChange={(e) => handleInputChange('electrodeRadius', parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <div className="text-xs text-gray-600 mt-1">
                  Varilla 16mm: 0.008m, Varilla 20mm: 0.010m
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Número de Electrodos
                </label>
                <input
                  type="number"
                  min="1"
                  value={inputs.numberOfElectrodes}
                  onChange={(e) => handleInputChange('numberOfElectrodes', parseInt(e.target.value) || 1)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {inputs.numberOfElectrodes > 1 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Distancia de Separación (m)
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    value={inputs.separationDistance}
                    onChange={(e) => handleInputChange('separationDistance', parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              )}
            </>
          ) : (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Resistividad del Suelo (Ω·m)
                </label>
                <input
                  type="number"
                  value={inputs.soilResistivity}
                  onChange={(e) => handleInputChange('soilResistivity', parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Corriente de Falla (A)
                </label>
                <input
                  type="number"
                  value={inputs.faultCurrent}
                  onChange={(e) => handleInputChange('faultCurrent', parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Duración de la Falla (s)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={inputs.faultDuration}
                  onChange={(e) => handleInputChange('faultDuration', parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Peso Corporal (kg)
                </label>
                <input
                  type="number"
                  value={inputs.bodyWeight}
                  onChange={(e) => handleInputChange('bodyWeight', parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Capa Superficial
                </label>
                <select
                  value={inputs.surfaceLayer}
                  onChange={(e) => handleInputChange('surfaceLayer', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="gravel">Grava (3000 Ω·m)</option>
                  <option value="asphalt">Asfalto (10000 Ω·m)</option>
                  <option value="concrete">Concreto (100 Ω·m)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Espesor Capa Superficial (m)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={inputs.layerThickness}
                  onChange={(e) => handleInputChange('layerThickness', parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Dimensión de Malla (m)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={inputs.electrodeLength}
                  onChange={(e) => handleInputChange('electrodeLength', parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
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
              {inputs.calculationType === 'ground-resistance' ? (
                <>
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <div className="text-sm text-blue-600 font-medium">Resistencia Individual</div>
                    <div className="text-2xl font-bold text-blue-900">{result.singleElectrodeResistance} Ω</div>
                  </div>

                  <div className="bg-green-50 p-4 rounded-lg">
                    <div className="text-sm text-green-600 font-medium">Resistencia Total</div>
                    <div className="text-2xl font-bold text-green-900">{result.totalResistance} Ω</div>
                  </div>

                  {inputs.numberOfElectrodes > 1 && (
                    <div className="bg-purple-50 p-4 rounded-lg">
                      <div className="text-sm text-purple-600 font-medium">Factor de Eficiencia</div>
                      <div className="text-xl font-bold text-purple-900">{result.efficiencyFactor}</div>
                    </div>
                  )}

                  <div className="bg-orange-50 p-4 rounded-lg">
                    <div className="text-sm text-orange-600 font-medium">Longitud Mínima (para 25Ω)</div>
                    <div className="text-xl font-bold text-orange-900">{result.minLength} m</div>
                  </div>

                  <div className={`p-4 rounded-lg border-2 ${
                    result.meetsStandard ? 'bg-green-100 border-green-300' : 'bg-red-100 border-red-300'
                  }`}>
                    <div className={`text-sm font-medium ${
                      result.meetsStandard ? 'text-green-700' : 'text-red-700'
                    }`}>
                      {result.meetsStandard ? 'CUMPLE NORMA (≤25Ω)' : 'NO CUMPLE NORMA (>25Ω)'}
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <div className="text-sm text-blue-600 font-medium">Tensión de Paso Tolerable</div>
                    <div className="text-2xl font-bold text-blue-900">{result.tolerableStepVoltage} V</div>
                  </div>

                  <div className="bg-green-50 p-4 rounded-lg">
                    <div className="text-sm text-green-600 font-medium">Tensión de Contacto Tolerable</div>
                    <div className="text-2xl font-bold text-green-900">{result.tolerableTouchVoltage} V</div>
                  </div>

                  <div className="bg-orange-50 p-4 rounded-lg">
                    <div className="text-sm text-orange-600 font-medium">Tensión de Paso Real</div>
                    <div className="text-2xl font-bold text-orange-900">{result.actualStepVoltage} V</div>
                  </div>

                  <div className="bg-purple-50 p-4 rounded-lg">
                    <div className="text-sm text-purple-600 font-medium">Tensión de Contacto Real</div>
                    <div className="text-2xl font-bold text-purple-900">{result.actualTouchVoltage} V</div>
                  </div>

                  <div className={`p-4 rounded-lg border-2 ${
                    result.stepVoltageSafe ? 'bg-green-100 border-green-300' : 'bg-red-100 border-red-300'
                  }`}>
                    <div className={`text-sm font-medium ${
                      result.stepVoltageSafe ? 'text-green-700' : 'text-red-700'
                    }`}>
                      Tensión de Paso: {result.stepVoltageSafe ? 'SEGURA' : 'PELIGROSA'}
                    </div>
                  </div>

                  <div className={`p-4 rounded-lg border-2 ${
                    result.touchVoltageSafe ? 'bg-green-100 border-green-300' : 'bg-red-100 border-red-300'
                  }`}>
                    <div className={`text-sm font-medium ${
                      result.touchVoltageSafe ? 'text-green-700' : 'text-red-700'
                    }`}>
                      Tensión de Contacto: {result.touchVoltageSafe ? 'SEGURA' : 'PELIGROSA'}
                    </div>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="text-sm text-gray-600 font-medium mb-2">Parámetros de Cálculo</div>
                    <div className="text-xs text-gray-600 space-y-1">
                      <div>• Resistencia corporal: {result.bodyResistance} Ω</div>
                      <div>• Factor capa superficial: {result.surfaceDerating}</div>
                      <div>• Factor duración shock: {result.shockFactor}</div>
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
          <div><strong>Resistencia de Tierra:</strong> Basado en fórmulas de Dwight para electrodos individuales</div>
          <div><strong>Múltiples Electrodos:</strong> Factor de eficiencia depende de la separación entre electrodos</div>
          <div><strong>Tensiones de Seguridad:</strong> Calculadas según IEEE Std 80 para sistemas de puesta a tierra</div>
          <div><strong>Límites Normativos:</strong> Resistencia ≤25Ω (residencial), ≤10Ω (industrial), ≤1Ω (subestaciones)</div>
        </div>
      </div>
    </div>
  );
};

export default GroundingSystemCalc;
