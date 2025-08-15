import { useState } from 'react';

const JouleEffectAdvancedCalc = () => {
  const [inputs, setInputs] = useState({
    resistance: 10,
    resistanceUnit: 'Ω',
    current: 5,
    currentUnit: 'A',
    time: 60,
    timeUnit: 's'
  });

  const [result, setResult] = useState(null);

  const calculate = () => {
    const { resistance, resistanceUnit, current, currentUnit, time, timeUnit } = inputs;

    // Conversiones de unidades a unidades base
    const resistanceConversions = { 'mΩ': 0.001, 'Ω': 1, 'kΩ': 1000, 'MΩ': 1000000 };
    const currentConversions = { 'mA': 0.001, 'A': 1, 'kA': 1000 };
    const timeConversions = { 'ms': 0.001, 's': 1, 'min': 60, 'h': 3600 };

    // Convertir a unidades base
    const resistanceInOhms = resistance * resistanceConversions[resistanceUnit];
    const currentInAmps = current * currentConversions[currentUnit];
    const timeInSeconds = time * timeConversions[timeUnit];

    // Cálculos fundamentales del efecto Joule
    // P = I² × R (Potencia disipada)
    const powerDissipated = Math.pow(currentInAmps, 2) * resistanceInOhms; // W

    // E = P × t (Energía disipada)
    const energyDissipated = powerDissipated * timeInSeconds; // J

    // Cálculo de temperatura aproximada (para conductor de cobre)
    // Basado en la ecuación: ΔT = (ρ × J² × t) / (c × ρ_material)
    // Donde J = I/A (densidad de corriente), asumiendo sección de 1 mm²
    const assumedCrossSection = 1e-6; // m² (1 mm²)
    const currentDensity = currentInAmps / assumedCrossSection; // A/m²
    
    // Propiedades del cobre
    const copperDensity = 8960; // kg/m³
    const copperSpecificHeat = 385; // J/(kg·K)
    const copperResistivity = 1.7e-8; // Ω·m a 20°C
    
    // Incremento de temperatura (aproximado)
    const temperatureRise = (copperResistivity * Math.pow(currentDensity, 2) * timeInSeconds) / 
                           (copperDensity * copperSpecificHeat);
    
    const finalTemperature = 20 + temperatureRise; // Asumiendo temperatura ambiente de 20°C

    // Cálculos adicionales
    const voltage = Math.sqrt(powerDissipated * resistanceInOhms); // V (V = √(P × R))
    const energyInkWh = energyDissipated / 3600000; // kWh
    const energyInCal = energyDissipated / 4.184; // cal (calorías)

    // Determinar nivel de criticidad
    let criticalityLevel = '';
    let criticalityColor = '';
    let recommendations = [];

    if (powerDissipated < 1) {
      criticalityLevel = 'Bajo';
      criticalityColor = 'text-green-800';
      recommendations.push('Nivel de potencia normal para componentes electrónicos');
    } else if (powerDissipated < 100) {
      criticalityLevel = 'Moderado';
      criticalityColor = 'text-blue-800';
      recommendations.push('Verificar ventilación adecuada');
      recommendations.push('Considerar disipadores de calor si es necesario');
    } else if (powerDissipated < 1000) {
      criticalityLevel = 'Alto';
      criticalityColor = 'text-yellow-800';
      recommendations.push('Requiere sistema de refrigeración');
      recommendations.push('Verificar capacidad térmica del conductor');
      recommendations.push('Considerar sección de conductor mayor');
    } else {
      criticalityLevel = 'Crítico';
      criticalityColor = 'text-red-800';
      recommendations.push('Sistema de refrigeración obligatorio');
      recommendations.push('Revisar diseño del circuito');
      recommendations.push('Considerar distribución de carga');
      recommendations.push('Verificar protecciones térmicas');
    }

    if (finalTemperature > 90) {
      recommendations.push('Temperatura excesiva: peligro para aislamientos estándar');
    }
    if (finalTemperature > 70 && finalTemperature <= 90) {
      recommendations.push('Temperatura elevada: verificar tipo de aislamiento');
    }
    if (currentDensity > 4e6) { // > 4 A/mm²
      recommendations.push('Densidad de corriente alta: considerar mayor sección');
    }

    setResult({
      powerDissipated: powerDissipated.toFixed(3),
      energyDissipated: (energyDissipated / 1000).toFixed(3), // kJ
      energyDissipatedJ: energyDissipated.toFixed(0),
      energyInkWh: energyInkWh.toFixed(6),
      energyInCal: energyInCal.toFixed(1),
      temperatureRise: temperatureRise.toFixed(1),
      finalTemperature: finalTemperature.toFixed(1),
      voltage: voltage.toFixed(2),
      currentDensity: (currentDensity / 1e6).toFixed(2), // A/mm²
      criticalityLevel: criticalityLevel,
      criticalityColor: criticalityColor,
      recommendations: recommendations,
      // Parámetros de entrada procesados
      resistanceInOhms: resistanceInOhms,
      currentInAmps: currentInAmps,
      timeInSeconds: timeInSeconds,
      timeInHours: (timeInSeconds / 3600).toFixed(3)
    });
  };

  const handleInputChange = (field, value) => {
    setInputs(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="p-6">
      <h2 className="text-xl font-semibold mb-6">Efecto Joule</h2>
      
      <div className="grid md:grid-cols-2 gap-6">
        {/* Inputs */}
        <div className="space-y-4">
          {/* Resistencia */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Resistencia
            </label>
            <div className="flex gap-2">
              <input
                type="number"
                value={inputs.resistance}
                onChange={(e) => handleInputChange('resistance', parseFloat(e.target.value) || 0)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <select
                value={inputs.resistanceUnit}
                onChange={(e) => handleInputChange('resistanceUnit', e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="mΩ">mΩ</option>
                <option value="Ω">Ω</option>
                <option value="kΩ">kΩ</option>
                <option value="MΩ">MΩ</option>
              </select>
            </div>
          </div>

          {/* Corriente */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Corriente
            </label>
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

          {/* Tiempo */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tiempo
            </label>
            <div className="flex gap-2">
              <input
                type="number"
                value={inputs.time}
                onChange={(e) => handleInputChange('time', parseFloat(e.target.value) || 0)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <select
                value={inputs.timeUnit}
                onChange={(e) => handleInputChange('timeUnit', e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="ms">ms</option>
                <option value="s">s</option>
                <option value="min">min</option>
                <option value="h">h</option>
              </select>
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
                <div className="text-sm text-red-600 font-medium">Potencia disipada</div>
                <div className="text-2xl font-bold text-red-900">{result.powerDissipated} W</div>
                <div className="text-xs text-red-700 mt-1">P = I² × R</div>
              </div>

              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="text-sm text-blue-600 font-medium">Energía disipada</div>
                <div className="text-xl font-bold text-blue-900">{result.energyDissipated} kJ</div>
                <div className="text-xs text-blue-700 mt-1">
                  {result.energyDissipatedJ} J | {result.energyInkWh} kWh | {result.energyInCal} cal
                </div>
              </div>

              <div className="bg-orange-50 p-4 rounded-lg">
                <div className="text-sm text-orange-600 font-medium">Temperatura estimada</div>
                <div className="text-xl font-bold text-orange-900">{result.finalTemperature} °C</div>
                <div className="text-xs text-orange-700 mt-1">
                  Incremento: +{result.temperatureRise} °C (conductor Cu, 1 mm²)
                </div>
              </div>

              <div className={`bg-yellow-50 p-4 rounded-lg`}>
                <div className="text-sm text-yellow-600 font-medium">Nivel de criticidad</div>
                <div className={`text-xl font-bold ${result.criticalityColor}`}>{result.criticalityLevel}</div>
                <div className="text-xs text-yellow-700 mt-1">Densidad: {result.currentDensity} A/mm²</div>
              </div>

              <div className="bg-green-50 p-4 rounded-lg">
                <div className="text-sm text-green-600 font-medium">Tensión calculada</div>
                <div className="text-xl font-bold text-green-900">{result.voltage} V</div>
                <div className="text-xs text-green-700 mt-1">V = √(P × R)</div>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="text-sm text-gray-600 font-medium mb-2">Parámetros del cálculo</div>
                <div className="text-xs text-gray-600 space-y-1">
                  <div>• Resistencia: {result.resistanceInOhms} Ω</div>
                  <div>• Corriente: {result.currentInAmps} A</div>
                  <div>• Tiempo: {result.timeInSeconds} s ({result.timeInHours} h)</div>
                  <div>• Sección asumida: 1 mm² (Cu)</div>
                  <div>• Temp. ambiente: 20 °C</div>
                </div>
              </div>

              {result.recommendations.length > 0 && (
                <div className="bg-purple-50 p-4 rounded-lg">
                  <div className="text-sm text-purple-600 font-medium mb-2">Recomendaciones</div>
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
          <div><strong>Potencia disipada:</strong> P = I² × R = V² / R = V × I</div>
          <div><strong>Energía disipada:</strong> E = P × t</div>
          <div><strong>Tensión:</strong> V = √(P × R)</div>
          <div><strong>Incremento de temperatura:</strong> ΔT = (ρ × J² × t) / (ρ_m × c)</div>
          <div><strong>Densidad de corriente:</strong> J = I / A</div>
          <div><strong>Conversiones:</strong> 1 kWh = 3.6 MJ, 1 cal = 4.184 J</div>
          <div className="text-xs text-blue-700 mt-2">
            <strong>Donde:</strong> P = potencia (W), I = corriente (A), R = resistencia (Ω), V = tensión (V), t = tiempo (s)
          </div>
          <div className="text-xs text-blue-700">
            <strong>Propiedades Cu:</strong> ρ = 1.7×10⁻⁸ Ω·m, ρ_m = 8960 kg/m³, c = 385 J/(kg·K), J = densidad corriente (A/m²)
          </div>
        </div>
      </div>
    </div>
  );
};

export default JouleEffectAdvancedCalc;