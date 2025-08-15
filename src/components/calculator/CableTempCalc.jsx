import { useState } from 'react';

const CableTempCalc = () => {
  const [inputs, setInputs] = useState({
    systemType: 'single-phase',
    voltage: 220,
    load: 2000,
    powerFactor: 0.9,
    wireSize: 2.5,
    ambientTemp: 30,
    conductor: 'copper',
    insulation: 'pvc'
  });
  
  const [result, setResult] = useState(null);

  // Resistencias reales de cables de cobre unipolares (Ohm/km) @ 70°C
  const cableResistances = {
    copper: {
      1.0: 19.5, 1.5: 13.3, 2.5: 7.98, 4: 5.92, 6: 3.95, 10: 2.29,
      16: 1.45, 25: 0.933, 35: 0.663, 50: 0.462, 70: 0.326, 95: 0.248
    },
    aluminum: {
      1.5: 17.29, 2.5: 10.374, 4: 7.696, 6: 5.135, 10: 2.977, 16: 1.885,
      25: 1.213, 35: 0.862, 50: 0.601, 70: 0.424, 95: 0.322
    }
  };

  // Temperaturas máximas por tipo de aislamiento
  const maxTemperatures = {
    pvc: 70,
    xlpe: 90,
    epr: 90
  };

  const calculate = () => {
    const { systemType, voltage, load, powerFactor, wireSize, ambientTemp, conductor, insulation } = inputs;
    const maxTemp = maxTemperatures[insulation];
    
    // Calcular corriente
    let current = 0;
    switch (systemType) {
      case 'single-phase':
        current = load / (voltage * powerFactor);
        break;
      case 'three-phase':
        current = load / (Math.sqrt(3) * voltage * powerFactor);
        break;
      case 'dc':
        current = load / voltage;
        break;
    }

    // Obtener resistencia real de la tabla (Ohm/km) @ 70°C
    let resistancePerKm = cableResistances[conductor][wireSize];
    
    // Si no existe en la tabla, buscar la sección más cercana
    if (!resistancePerKm) {
      const availableSections = Object.keys(cableResistances[conductor]).map(Number).sort((a, b) => a - b);
      const closestSection = availableSections.reduce((prev, curr) => 
        Math.abs(curr - wireSize) < Math.abs(prev - wireSize) ? curr : prev
      );
      resistancePerKm = cableResistances[conductor][closestSection];
    }
    
    // Ajustar por temperatura ambiente
    const tempCoeff = conductor === 'copper' ? 0.00393 : 0.00403;
    const tempFactor = 1 + tempCoeff * (ambientTemp - 70); // Ajustar desde 70°C
    const adjustedResistancePerKm = resistancePerKm * tempFactor;
    
    // Resistencia del conductor (por metro)
    const resistance = adjustedResistancePerKm / 1000; // Ω/m

    // Pérdidas por efecto Joule (por metro)
    const powerLoss = Math.pow(current, 2) * resistance;

    // Estimación de temperatura (fórmula simplificada)
    // Resistencia térmica típica conductor-ambiente: 4°C/W por metro
    const thermalResistance = 4.0;
    const tempRise = powerLoss * thermalResistance;
    const finalTemp = ambientTemp + tempRise;

    // Cálculo de impedancia del conductor
    const avgTemp = (ambientTemp + finalTemp) / 2;
    const resistanceAtTemp = resistance * (1 + tempCoeff * (avgTemp - 20));
    const reactance = 0.00015; // Ω/m (valor típico)
    const impedance = Math.sqrt(resistanceAtTemp * resistanceAtTemp + reactance * reactance);

    setResult({
      current: current.toFixed(2),
      resistance: resistance.toFixed(6),
      powerLoss: powerLoss.toFixed(3),
      tempRise: tempRise.toFixed(1),
      finalTemp: finalTemp.toFixed(1),
      maxTemp: maxTemp,
      isAcceptable: finalTemp <= maxTemp,
      margin: (maxTemp - finalTemp).toFixed(1),
      impedance: impedance.toFixed(6),
      resistancePerKm: adjustedResistancePerKm.toFixed(4),
      conductor: conductor,
      insulation: insulation
    });
  };

  const handleInputChange = (field, value) => {
    setInputs(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="p-6">
      <h2 className="text-xl font-semibold mb-6">Cálculo de Temperatura del Cable</h2>
      
      <div className="grid md:grid-cols-2 gap-6">
        {/* Inputs */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tipo de Sistema
            </label>
            <select
              value={inputs.systemType}
              onChange={(e) => handleInputChange('systemType', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="single-phase">Monofásico AC</option>
              <option value="three-phase">Trifásico AC</option>
              <option value="dc">Corriente Continua</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tensión (V)
            </label>
            <input
              type="number"
              value={inputs.voltage}
              onChange={(e) => handleInputChange('voltage', parseFloat(e.target.value) || 0)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Carga (W)
            </label>
            <input
              type="number"
              value={inputs.load}
              onChange={(e) => handleInputChange('load', parseFloat(e.target.value) || 0)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {inputs.systemType !== 'dc' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Factor de Potencia
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                max="1"
                value={inputs.powerFactor}
                onChange={(e) => handleInputChange('powerFactor', parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Calibre (mm²)
            </label>
            <select
              value={inputs.wireSize}
              onChange={(e) => handleInputChange('wireSize', parseFloat(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {[1.5, 2.5, 4, 6, 10, 16, 25, 35, 50, 70, 95].map(size => (
                <option key={size} value={size}>{size}</option>
              ))}
            </select>
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

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Aislamiento
            </label>
            <select
              value={inputs.insulation}
              onChange={(e) => handleInputChange('insulation', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="pvc">PVC</option>
              <option value="xlpe">XLPE</option>
              <option value="epr">EPR</option>
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
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="text-sm text-blue-600 font-medium">Corriente Calculada</div>
                <div className="text-xl font-bold text-blue-900">{result.current} A</div>
              </div>

              <div className="bg-red-50 p-4 rounded-lg">
                <div className="text-sm text-red-600 font-medium">Pérdidas Joule</div>
                <div className="text-xl font-bold text-red-900">{result.powerLoss} W/m</div>
              </div>

              <div className="bg-yellow-50 p-4 rounded-lg">
                <div className="text-sm text-yellow-600 font-medium">Aumento de Temperatura</div>
                <div className="text-xl font-bold text-yellow-900">{result.tempRise} °C</div>
              </div>

              <div className={`p-4 rounded-lg ${
                result.isAcceptable ? 'bg-green-50' : 'bg-red-50'
              }`}>
                <div className={`text-sm font-medium ${
                  result.isAcceptable ? 'text-green-600' : 'text-red-600'
                }`}>
                  Temperatura Final
                </div>
                <div className={`text-2xl font-bold ${
                  result.isAcceptable ? 'text-green-900' : 'text-red-900'
                }`}>
                  {result.finalTemp} °C
                </div>
                <div className={`text-xs ${
                  result.isAcceptable ? 'text-green-600' : 'text-red-600'
                }`}>
                  Máximo: {result.maxTemp} °C | Margen: {result.margin} °C
                </div>
                <div className={`text-xs font-medium ${
                  result.isAcceptable ? 'text-green-700' : 'text-red-700'
                }`}>
                  {result.isAcceptable ? 'ACEPTABLE' : 'EXCEDE LÍMITE'}
                </div>
              </div>

              <div className="bg-cyan-50 p-4 rounded-lg">
                <div className="text-sm text-cyan-700 font-medium">Información del sistema</div>
                <div className="text-xs text-cyan-600 space-y-1 mt-1">
                  <div>• Material: {result.conductor === 'copper' ? 'Cobre' : 'Aluminio'}</div>
                  <div>• Aislamiento: {result.insulation.toUpperCase()}</div>
                  <div>• Resistencia por km: {result.resistancePerKm} Ω/km @ {inputs.ambientTemp}°C</div>
                  <div>• Impedancia del conductor: {result.impedance} Ω/m</div>
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

      {/* Información */}
      <div className="mt-8 bg-gray-50 p-4 rounded-lg">
        <h3 className="text-sm font-medium text-gray-900 mb-2">Información:</h3>
        <div className="text-xs text-gray-600 space-y-1">
          <div><strong>Pérdidas:</strong> P = I² × R</div>
          <div><strong>Resistencia:</strong> Basada en valores reales de cables comerciales @ 70°C con corrección por temperatura</div>
          <div><strong>Temperatura:</strong> T = T_ambiente + (Pérdidas × R_térmica)</div>
          <div><strong>Temperaturas máximas:</strong> PVC: 70°C, XLPE/EPR: 90°C</div>
        </div>
      </div>
    </div>
  );
};

export default CableTempCalc;