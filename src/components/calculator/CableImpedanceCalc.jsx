import { useState } from 'react';

const CableImpedanceCalc = () => {
  const [inputs, setInputs] = useState({
    currentType: 'ac',
    frequency: 50,
    wireSize: 4,
    wireSizeUnit: 'mm²',
    conductorsInParallel: 1,
    length: 100,
    lengthUnit: 'm',
    temperature: 20,
    temperatureUnit: '°C',
    conductor: 'copper',
    cableType: 'unipolar'
  });
  
  const [result, setResult] = useState(null);

  // Calibres estándar en mm²
  const standardSizes = [1.0, 1.5, 2.5, 4, 6, 10, 16, 25, 35, 50, 70, 95, 120, 150, 185, 240, 300, 400, 500];
  
  // Unidades de longitud
  const lengthUnits = [
    { value: 'm', label: 'm', factor: 1 },
    { value: 'km', label: 'km', factor: 1000 },
    { value: 'ft', label: 'ft', factor: 0.3048 },
    { value: 'mi', label: 'mi', factor: 1609.34 }
  ];

  // Resistencias reales de cables de cobre unipolares (Ohm/km) @ 70°C
  // Basado en tabla de resistencias-cables.md
  const cableResistances = {
    copper: {
      1.0: 19.5,
      1.5: 13.3,
      2.5: 7.98,
      4: 5.92,
      6: 3.95,
      10: 2.29,
      16: 1.45,
      25: 0.933,
      35: 0.663,
      50: 0.462,
      70: 0.326,
      95: 0.248,
      120: 0.194,
      150: 0.156,
      185: 0.129,
      240: 0.0987,
      300: 0.0754,
      400: 0.0606,
      500: 0.0493,
      630: 0.0407
    },
    aluminum: {
      // Valores aproximados para aluminio (30% más resistivo que cobre)
      1.0: 25.35,
      1.5: 17.29,
      2.5: 10.374,
      4: 7.696,
      6: 5.135,
      10: 2.977,
      16: 1.885,
      25: 1.213,
      35: 0.862,
      50: 0.601,
      70: 0.424,
      95: 0.322,
      120: 0.252,
      150: 0.203,
      185: 0.168,
      240: 0.128,
      300: 0.098,
      400: 0.079,
      500: 0.064,
      630: 0.053
    }
  };

  const calculate = () => {
    const { currentType, frequency, wireSize, wireSizeUnit, conductorsInParallel, 
            length, lengthUnit, temperature, temperatureUnit, conductor, cableType } = inputs;
    
    // Convertir temperatura a Celsius
    let tempC = temperature;
    if (temperatureUnit === '°F') {
      tempC = (temperature - 32) * 5/9;
    }
    
    // Convertir longitud a metros
    const lengthUnit_factor = lengthUnits.find(unit => unit.value === lengthUnit)?.factor || 1;
    const lengthM = length * lengthUnit_factor;
    
    // Usar sección en mm²
    const crossSection = wireSize;
    
    // Obtener resistencia real de la tabla (Ohm/km) @ 70°C
    let resistancePerKm = cableResistances[conductor][crossSection];
    
    // Si no existe en la tabla, interpolar o usar cálculo teórico
    if (!resistancePerKm) {
      // Buscar la sección más cercana
      const availableSections = Object.keys(cableResistances[conductor]).map(Number).sort((a, b) => a - b);
      const closestSection = availableSections.reduce((prev, curr) => 
        Math.abs(curr - crossSection) < Math.abs(prev - crossSection) ? curr : prev
      );
      resistancePerKm = cableResistances[conductor][closestSection];
    }
    
    // Ajustar por temperatura (coeficiente de temperatura del cobre: 0.00393/°C)
    const tempCoeff = conductor === 'copper' ? 0.00393 : 0.00403;
    const tempFactor = 1 + tempCoeff * (tempC - 70); // Ajustar desde 70°C de referencia
    const adjustedResistancePerKm = resistancePerKm * tempFactor;
    
    // Resistencia total considerando longitud y conductores en paralelo
    const totalResistance = (adjustedResistancePerKm * lengthM / 1000) / conductorsInParallel;
    
    let reactance = 0;
    let impedance = totalResistance;
    let phaseAngle = 0;
    let inductanceTotal = 0;
    let powerFactor = 1;
    
    if (currentType === 'ac') {
      // Cálculo de reactancia para corriente alterna
      let inductancePerKm;
      
      if (cableType === 'unipolar') {
        // Inductancia para cables unipolares (mH/km)
        inductancePerKm = 0.1 + 0.46 * Math.log10(2 * 1000 / Math.sqrt(crossSection));
      } else {
        // Inductancia para cables multipolares (mH/km)
        inductancePerKm = 0.08 + 0.3 * Math.log10(2 * 500 / Math.sqrt(crossSection));
      }
      
      // Inductancia total considerando longitud y conductores en paralelo
      inductanceTotal = (inductancePerKm * lengthM / 1000) / conductorsInParallel; // mH
      
      // Reactancia inductiva
      reactance = 2 * Math.PI * frequency * inductanceTotal / 1000; // Ω
      
      // Impedancia total
      impedance = Math.sqrt(totalResistance * totalResistance + reactance * reactance);
      
      // Ángulo de fase
      phaseAngle = Math.atan(reactance / totalResistance) * (180 / Math.PI);
      
      // Factor de potencia del cable
      powerFactor = totalResistance / impedance;
    }
    
    setResult({
      resistance: totalResistance.toFixed(6),
      reactance: reactance.toFixed(6),
      impedance: impedance.toFixed(6),
      phaseAngle: phaseAngle.toFixed(2),
      inductance: inductanceTotal.toFixed(3),
      powerFactor: powerFactor.toFixed(4),
      currentType: currentType,
      lengthM: lengthM.toFixed(1),
      conductorsInParallel: conductorsInParallel,
      resistanceUnits: lengthUnit === 'm' ? 'Ω' : `Ω/${lengthUnit}`,
      reactanceUnits: lengthUnit === 'm' ? 'Ω' : `Ω/${lengthUnit}`,
      impedanceUnits: lengthUnit === 'm' ? 'Ω' : `Ω/${lengthUnit}`,
      resistancePerKm: adjustedResistancePerKm.toFixed(4),
      crossSection: crossSection
    });
  };

  const handleInputChange = (field, value) => {
    if (['currentType', 'wireSizeUnit', 'lengthUnit', 'temperatureUnit', 'conductor', 'cableType'].includes(field)) {
      setInputs(prev => ({ ...prev, [field]: value }));
    } else {
      setInputs(prev => ({ ...prev, [field]: parseFloat(value) || 0 }));
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-xl font-semibold mb-6">Resistencia, Reactancia e Impedancia del Cable</h2>
      
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
              <option value="ac">Corriente alterna</option>
              <option value="dc">Corriente continua</option>
            </select>
          </div>

          {/* Frecuencia (solo para AC) */}
          {inputs.currentType === 'ac' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Frecuencia
              </label>
              <div className="flex gap-2 items-center">
                <input
                  type="number"
                  value={inputs.frequency}
                  onChange={(e) => handleInputChange('frequency', e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <span className="text-sm text-gray-600">Hz</span>
              </div>
            </div>
          )}

          {/* Calibre */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Calibre
            </label>
            <div className="flex gap-2">
              <select
                value={inputs.wireSize}
                onChange={(e) => handleInputChange('wireSize', parseFloat(e.target.value))}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {standardSizes.map(size => (
                  <option key={size} value={size}>{size}</option>
                ))}
              </select>
              <select
                value={inputs.wireSizeUnit}
                onChange={(e) => handleInputChange('wireSizeUnit', e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="mm²">mm²</option>
                <option value="AWG">AWG</option>
              </select>
            </div>
          </div>

          {/* Conductores en paralelo */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Conductores en paralelo
            </label>
            <select
              value={inputs.conductorsInParallel}
              onChange={(e) => handleInputChange('conductorsInParallel', parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {[1, 2, 3, 4, 5, 6, 7, 8].map(num => (
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
                onChange={(e) => handleInputChange('length', e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <select
                value={inputs.lengthUnit}
                onChange={(e) => handleInputChange('lengthUnit', e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {lengthUnits.map(unit => (
                  <option key={unit.value} value={unit.value}>{unit.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Temperatura */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Temperatura
            </label>
            <div className="flex gap-2">
              <input
                type="number"
                value={inputs.temperature}
                onChange={(e) => handleInputChange('temperature', e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <select
                value={inputs.temperatureUnit}
                onChange={(e) => handleInputChange('temperatureUnit', e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="°C">°C</option>
                <option value="°F">°F</option>
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

          {/* Tipo de cable */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tipo de cable
            </label>
            <select
              value={inputs.cableType}
              onChange={(e) => handleInputChange('cableType', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="unipolar">Unipolar</option>
              <option value="multipolar">Multipolar</option>
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
            <>
              <div className="bg-green-50 p-4 rounded-lg border-2 border-green-200">
                <div className="text-sm text-green-600 font-medium">Resistencia del cable (R)</div>
                <div className="text-2xl font-bold text-green-900">{result.resistance} {result.resistanceUnits}</div>
                <div className="text-xs text-green-600">
                  {result.resistancePerKm} Ω/km @ {inputs.temperature}{inputs.temperatureUnit} | 
                  Sección: {result.crossSection} mm²
                </div>
              </div>
              
              {result.currentType === 'ac' && (
                <>
                  <div className="bg-blue-50 p-4 rounded-lg border-2 border-blue-200">
                    <div className="text-sm text-blue-600 font-medium">Reactancia del cable (X)</div>
                    <div className="text-2xl font-bold text-blue-900">{result.reactance} {result.reactanceUnits}</div>
                    <div className="text-xs text-blue-600">Inductancia: {result.inductance} mH</div>
                  </div>
                  
                  <div className="bg-purple-50 p-4 rounded-lg border-2 border-purple-200">
                    <div className="text-sm text-purple-600 font-medium">Impedancia del cable (Z)</div>
                    <div className="text-2xl font-bold text-purple-900">{result.impedance} {result.impedanceUnits}</div>
                    <div className="text-xs text-purple-600">Z = √(R² + X²)</div>
                  </div>
                  
                  <div className="bg-orange-50 p-4 rounded-lg">
                    <div className="text-sm text-orange-600 font-medium">Factor de potencia del cable</div>
                    <div className="text-2xl font-bold text-orange-900">{result.powerFactor}</div>
                    <div className="text-xs text-orange-600">cos φ = R / Z</div>
                  </div>
                  
                  <div className="bg-yellow-50 p-4 rounded-lg">
                    <div className="text-sm text-yellow-600 font-medium">Ángulo de fase</div>
                    <div className="text-2xl font-bold text-yellow-900">{result.phaseAngle}°</div>
                    <div className="text-xs text-yellow-600">φ = arctan(X / R)</div>
                  </div>
                </>
              )}
              
              {result.currentType === 'dc' && (
                <div className="bg-gray-100 p-4 rounded-lg">
                  <div className="text-sm text-gray-600 font-medium">Corriente Continua</div>
                  <div className="text-lg text-gray-800">Solo resistencia presente</div>
                  <div className="text-xs text-gray-600">X = 0 Ω, Z = R</div>
                </div>
              )}
              
              {result.conductorsInParallel > 1 && (
                <div className="bg-cyan-50 p-4 rounded-lg">
                  <div className="text-sm text-cyan-600 font-medium">Configuración</div>
                  <div className="text-lg font-bold text-cyan-900">{result.conductorsInParallel} conductores en paralelo</div>
                  <div className="text-xs text-cyan-600">Impedancia reducida por factor {result.conductorsInParallel}</div>
                </div>
              )}

              <div className="bg-indigo-50 p-4 rounded-lg">
                <div className="text-sm text-indigo-600 font-medium">Datos de la tabla de resistencias</div>
                <div className="text-xs text-indigo-600 mt-1">
                  • Resistencias basadas en valores reales de cables comerciales
                  <br />• Referencia: 70°C para cables de cobre unipolares
                  <br />• Corrección automática por temperatura de operación
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

      {/* Fórmulas */}
      <div className="mt-8 bg-blue-50 p-4 rounded-lg border-l-4 border-blue-500">
        <h3 className="text-lg font-semibold text-blue-900 mb-2">Fórmulas Utilizadas</h3>
        <div className="text-blue-800 font-mono space-y-2 text-sm">
          <div><strong>Resistencia:</strong></div>
          <div>• R = R_tabla × [1 + α × (T - 70)] × L / 1000 / N_paralelo</div>
          
          {inputs.currentType === 'ac' && (
            <>
              <div className="mt-4"><strong>Reactancia (solo AC):</strong></div>
              <div>• X_L = 2π × f × L_inductancia / N_paralelo</div>
              
              <div className="mt-4"><strong>Impedancia (solo AC):</strong></div>
              <div>• Z = √(R² + X_L²)</div>
              
              <div className="mt-4"><strong>Factor de potencia:</strong></div>
              <div>• cos φ = R / Z</div>
            </>
          )}
          
          {inputs.currentType === 'dc' && (
            <>
              <div className="mt-4"><strong>Corriente Continua:</strong></div>
              <div>• Z = R (solo resistencia)</div>
            </>
          )}
          
          <div className="mt-4"><strong>Donde:</strong></div>
          <div>• R_tabla = Resistencia de tabla (Ω/km @ 70°C)</div>
          <div>• α = Coef. temperatura, T = Temperatura, f = Frecuencia</div>
          <div>• L = Longitud (m), N_paralelo = Conductores en paralelo</div>
        </div>
      </div>
    </div>
  );
};

export default CableImpedanceCalc;