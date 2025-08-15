import { useState } from 'react';

const BatteryDurationAdvancedCalc = () => {
  const [inputs, setInputs] = useState({
    connection: 'solo',
    voltage: 12,
    voltageUnit: 'V',
    capacity: 100,
    capacityUnit: 'Ah',
    load: 50,
    loadUnit: 'W',
    peukertCoefficient: 1.3,
    depthOfDischarge: 80
  });

  const [result, setResult] = useState(null);

  const calculate = () => {
    const { connection, voltage, voltageUnit, capacity, capacityUnit, 
            load, loadUnit, peukertCoefficient, depthOfDischarge } = inputs;

    // Conversiones de unidades
    const voltageConversions = { 'mV': 0.001, 'V': 1, 'kV': 1000 };
    const capacityConversions = { 'mAh': 0.001, 'Ah': 1 };
    const loadConversions = { 'mW': 0.001, 'W': 1, 'kW': 1000 };

    const voltageInV = voltage * voltageConversions[voltageUnit];
    const capacityInAh = capacity * capacityConversions[capacityUnit];
    const loadInW = load * loadConversions[loadUnit];

    // Ajustes según tipo de conexión
    let systemVoltage = voltageInV;
    let systemCapacity = capacityInAh;
    let batteryCount = 1;

    switch (connection) {
      case 'series':
        batteryCount = 2; // Asumimos 2 baterías en serie
        systemVoltage = voltageInV * 2;
        systemCapacity = capacityInAh;
        break;
      case 'parallel':
        batteryCount = 2; // Asumimos 2 baterías en paralelo
        systemVoltage = voltageInV;
        systemCapacity = capacityInAh * 2;
        break;
      default: // solo
        systemVoltage = voltageInV;
        systemCapacity = capacityInAh;
    }

    // Calcular corriente de descarga
    const dischargeCurrent = loadInW / systemVoltage; // A

    // Aplicar profundidad de descarga
    const usableCapacity = systemCapacity * (depthOfDischarge / 100); // Ah

    // Calcular duración básica (sin Peukert)
    const basicDuration = usableCapacity / dischargeCurrent; // h

    // Aplicar efecto Peukert
    // t = (C/I)^n donde n es el coeficiente de Peukert
    const peukertDuration = Math.pow(usableCapacity / dischargeCurrent, peukertCoefficient);

    // Energía disponible
    const energyAvailable = systemVoltage * usableCapacity; // Wh
    const energyAvailableKWh = energyAvailable / 1000; // kWh

    // Tiempo de vida útil estimado (ciclos)
    // Basado en DOD: a mayor DOD, menor vida útil
    let estimatedCycles = 0;
    if (depthOfDischarge <= 20) {
      estimatedCycles = 3000;
    } else if (depthOfDischarge <= 50) {
      estimatedCycles = 1500;
    } else if (depthOfDischarge <= 80) {
      estimatedCycles = 800;
    } else {
      estimatedCycles = 400;
    }

    const estimatedLifeYears = estimatedCycles / 365; // Asumiendo 1 ciclo por día

    // Análisis del sistema
    let analysis = [];
    let recommendations = [];

    // Análisis de la corriente de descarga
    const cRate = dischargeCurrent / capacityInAh; // Tasa C
    
    if (cRate > 1) {
      analysis.push('Descarga rápida (>1C) - reducirá significativamente la duración');
      recommendations.push('Considerar mayor capacidad de batería');
    } else if (cRate > 0.5) {
      analysis.push('Descarga moderada (0.5-1C) - duración moderadamente afectada');
    } else if (cRate > 0.2) {
      analysis.push('Descarga lenta (0.2-0.5C) - buena eficiencia');
    } else {
      analysis.push('Descarga muy lenta (<0.2C) - máxima eficiencia');
    }

    // Análisis de DOD
    if (depthOfDischarge > 80) {
      analysis.push('DOD alta - vida útil reducida significativamente');
      recommendations.push('Reducir DOD a 50-80% para mayor vida útil');
    } else if (depthOfDischarge > 50) {
      analysis.push('DOD moderada - buen balance entre capacidad y vida útil');
    } else {
      analysis.push('DOD conservadora - máxima vida útil');
    }

    // Análisis de conexión
    if (connection === 'series') {
      analysis.push('Conexión en serie - mayor voltaje, misma capacidad');
      recommendations.push('Usar baterías idénticas para evitar desbalance');
    } else if (connection === 'parallel') {
      analysis.push('Conexión en paralelo - mayor capacidad, mismo voltaje');
      recommendations.push('Usar baterías de misma edad y capacidad');
    }

    // Recomendaciones generales
    if (peukertDuration < basicDuration * 0.7) {
      recommendations.push('Efecto Peukert significativo - considerar menor corriente de descarga');
    }

    if (dischargeCurrent > capacityInAh * 0.1) {
      recommendations.push('Verificar capacidad de descarga máxima de la batería');
    }

    // Formato de duración
    let durationDisplay = '';
    let durationUnit = '';

    if (peukertDuration < 1) {
      durationDisplay = (peukertDuration * 60).toFixed(0);
      durationUnit = 'min';
    } else if (peukertDuration < 24) {
      durationDisplay = peukertDuration.toFixed(2);
      durationUnit = 'h';
    } else {
      durationDisplay = (peukertDuration / 24).toFixed(2);
      durationUnit = 'días';
    }

    // Formato de corriente
    let currentDisplay = '';
    let currentUnit = '';

    if (dischargeCurrent < 1) {
      currentDisplay = (dischargeCurrent * 1000).toFixed(0);
      currentUnit = 'mA';
    } else {
      currentDisplay = dischargeCurrent.toFixed(2);
      currentUnit = 'A';
    }

    setResult({
      peukertDuration: durationDisplay,
      durationUnit: durationUnit,
      peukertDurationHours: peukertDuration.toFixed(2),
      basicDuration: basicDuration.toFixed(2),
      dischargeCurrent: currentDisplay,
      currentUnit: currentUnit,
      dischargeCurrentA: dischargeCurrent.toFixed(3),
      energyAvailable: energyAvailable.toFixed(0),
      energyAvailableKWh: energyAvailableKWh.toFixed(3),
      estimatedCycles: estimatedCycles,
      estimatedLifeYears: estimatedLifeYears.toFixed(1),
      cRate: cRate.toFixed(3),
      systemVoltage: systemVoltage,
      systemCapacity: systemCapacity,
      usableCapacity: usableCapacity.toFixed(1),
      batteryCount: batteryCount,
      connection: connection,
      analysis: analysis,
      recommendations: recommendations,
      peukertEffect: ((basicDuration - peukertDuration) / basicDuration * 100).toFixed(1)
    });
  };

  const handleInputChange = (field, value) => {
    setInputs(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="p-6">
      <h2 className="text-xl font-semibold mb-6">Duración de las Baterías</h2>
      
      <div className="grid md:grid-cols-2 gap-6">
        {/* Inputs */}
        <div className="space-y-4">
          {/* Conexión */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Conexión
            </label>
            <select
              value={inputs.connection}
              onChange={(e) => handleInputChange('connection', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="solo">Solo</option>
              <option value="series">En serie</option>
              <option value="parallel">En paralelo</option>
            </select>
          </div>

          {/* Tensión */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tensión
            </label>
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

          {/* Capacidad */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Capacidad
            </label>
            <div className="flex gap-2">
              <input
                type="number"
                value={inputs.capacity}
                onChange={(e) => handleInputChange('capacity', parseFloat(e.target.value) || 0)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <select
                value={inputs.capacityUnit}
                onChange={(e) => handleInputChange('capacityUnit', e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="mAh">mAh</option>
                <option value="Ah">Ah</option>
              </select>
            </div>
          </div>

          {/* Carga */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Carga
            </label>
            <div className="flex gap-2">
              <input
                type="number"
                value={inputs.load}
                onChange={(e) => handleInputChange('load', parseFloat(e.target.value) || 0)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <select
                value={inputs.loadUnit}
                onChange={(e) => handleInputChange('loadUnit', e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="mW">mW</option>
                <option value="W">W</option>
                <option value="kW">kW</option>
              </select>
            </div>
          </div>

          {/* Coeficiente de Peukert */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Coeficiente de Peukert
            </label>
            <input
              type="number"
              step="0.1"
              value={inputs.peukertCoefficient}
              onChange={(e) => handleInputChange('peukertCoefficient', parseFloat(e.target.value) || 1)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <div className="text-xs text-gray-500 mt-1">
              Típico: Plomo-ácido 1.3, Li-ion 1.05, NiMH 1.2
            </div>
          </div>

          {/* Profundidad de descarga */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Profundidad de descarga (DOD)
            </label>
            <div className="flex gap-2">
              <input
                type="number"
                value={inputs.depthOfDischarge}
                onChange={(e) => handleInputChange('depthOfDischarge', parseFloat(e.target.value) || 0)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <span className="px-3 py-2 bg-gray-100 border border-gray-300 rounded-md text-gray-700">%</span>
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
              <div className="bg-green-50 p-4 rounded-lg">
                <div className="text-sm text-green-600 font-medium">Duración estimada</div>
                <div className="text-2xl font-bold text-green-900">{result.peukertDuration} {result.durationUnit}</div>
                <div className="text-xs text-green-700 mt-1">
                  {result.peukertDurationHours} h (con efecto Peukert)
                </div>
              </div>

              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="text-sm text-blue-600 font-medium">Corriente de descarga</div>
                <div className="text-xl font-bold text-blue-900">{result.dischargeCurrent} {result.currentUnit}</div>
                <div className="text-xs text-blue-700 mt-1">
                  Tasa C: {result.cRate} ({result.dischargeCurrentA} A)
                </div>
              </div>

              <div className="bg-orange-50 p-4 rounded-lg">
                <div className="text-sm text-orange-600 font-medium">Energía disponible</div>
                <div className="text-xl font-bold text-orange-900">{result.energyAvailable} Wh</div>
                <div className="text-xs text-orange-700 mt-1">{result.energyAvailableKWh} kWh</div>
              </div>

              <div className="bg-purple-50 p-4 rounded-lg">
                <div className="text-sm text-purple-600 font-medium">Tiempo de vida útil estimado</div>
                <div className="text-xl font-bold text-purple-900">{result.estimatedCycles} ciclos</div>
                <div className="text-xs text-purple-700 mt-1">≈ {result.estimatedLifeYears} años</div>
              </div>

              <div className="bg-yellow-50 p-4 rounded-lg">
                <div className="text-sm text-yellow-600 font-medium mb-2">Efecto Peukert</div>
                <div className="text-lg font-bold text-yellow-900">{result.peukertEffect}% reducción</div>
                <div className="text-xs text-yellow-700 mt-1">
                  Sin Peukert: {result.basicDuration} h
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="text-sm text-gray-600 font-medium mb-2">Configuración del sistema</div>
                <div className="text-xs text-gray-600 space-y-1">
                  <div>• Conexión: {result.connection === 'solo' ? 'Individual' : result.connection === 'series' ? 'Serie' : 'Paralelo'}</div>
                  <div>• Cantidad de baterías: {result.batteryCount}</div>
                  <div>• Voltaje del sistema: {result.systemVoltage} V</div>
                  <div>• Capacidad del sistema: {result.systemCapacity} Ah</div>
                  <div>• Capacidad utilizable: {result.usableCapacity} Ah</div>
                  <div>• DOD aplicado: {inputs.depthOfDischarge}%</div>
                </div>
              </div>

              {result.analysis.length > 0 && (
                <div className="bg-indigo-50 p-4 rounded-lg">
                  <div className="text-sm text-indigo-600 font-medium mb-2">Análisis del sistema</div>
                  <ul className="text-xs text-indigo-700 space-y-1">
                    {result.analysis.map((item, index) => (
                      <li key={index}>• {item}</li>
                    ))}
                  </ul>
                </div>
              )}

              {result.recommendations.length > 0 && (
                <div className="bg-red-50 p-4 rounded-lg">
                  <div className="text-sm text-red-600 font-medium mb-2">Recomendaciones</div>
                  <ul className="text-xs text-red-700 space-y-1">
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
          <div><strong>Corriente de descarga:</strong> I = P / V</div>
          <div><strong>Duración básica:</strong> t = C_usable / I</div>
          <div><strong>Efecto Peukert:</strong> t = (C/I)^n</div>
          <div><strong>Capacidad usable:</strong> C_usable = C × (DOD/100)</div>
          <div><strong>Tasa C:</strong> C_rate = I / C_nominal</div>
          <div><strong>Energía disponible:</strong> E = V × C_usable</div>
          <div><strong>Conexión serie:</strong> V_total = n×V, C_total = C</div>
          <div><strong>Conexión paralelo:</strong> V_total = V, C_total = n×C</div>
          <div className="text-xs text-blue-700 mt-2">
            <strong>Donde:</strong> P = potencia (W), V = tensión (V), I = corriente (A), C = capacidad (Ah), n = coef. Peukert, DOD = profundidad descarga (%)
          </div>
        </div>
      </div>
    </div>
  );
};

export default BatteryDurationAdvancedCalc;