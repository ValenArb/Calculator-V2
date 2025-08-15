import { useState } from 'react';

const BatteryDurationCalc = () => {
  const [inputs, setInputs] = useState({
    capacity: 100,
    current: 10,
    voltage: 12,
    efficiency: 0.9
  });
  
  const [result, setResult] = useState(null);

  const calculate = () => {
    const { capacity, current, voltage, efficiency } = inputs;
    
    // Duración básica: t = C / I (en horas)
    const basicDuration = capacity / current;
    
    // Duración con eficiencia
    const effectiveDuration = basicDuration * efficiency;
    
    // Energía total disponible
    const totalEnergy = capacity * voltage;
    const usableEnergy = totalEnergy * efficiency;
    
    // Potencia consumida
    const power = voltage * current;
    
    setResult({
      basicDuration: basicDuration.toFixed(2),
      effectiveDuration: effectiveDuration.toFixed(2),
      totalEnergy: totalEnergy.toFixed(1),
      usableEnergy: usableEnergy.toFixed(1),
      power: power.toFixed(1),
      durationMinutes: (effectiveDuration * 60).toFixed(0)
    });
  };

  const handleInputChange = (field, value) => {
    setInputs(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="p-6">
      <h2 className="text-xl font-semibold mb-6">Duración de Batería</h2>
      <p className="text-gray-600 mb-6">Cálculo de autonomía y duración de sistemas con baterías</p>
      
      <div className="grid md:grid-cols-2 gap-6">
        {/* Inputs */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Capacidad (Ah)
            </label>
            <input
              type="number"
              value={inputs.capacity}
              onChange={(e) => handleInputChange('capacity', parseFloat(e.target.value) || 0)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Corriente de Consumo (A)
            </label>
            <input
              type="number"
              step="0.1"
              value={inputs.current}
              onChange={(e) => handleInputChange('current', parseFloat(e.target.value) || 0)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Voltaje (V)
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
              Eficiencia (0-1)
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              max="1"
              value={inputs.efficiency}
              onChange={(e) => handleInputChange('efficiency', parseFloat(e.target.value) || 0)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <div className="text-xs text-gray-500 mt-1">Factor de eficiencia del sistema (ej: 0.9 = 90%)</div>
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
                <div className="text-sm text-blue-600 font-medium">Duración Efectiva</div>
                <div className="text-2xl font-bold text-blue-900">{result.effectiveDuration} h</div>
                <div className="text-sm text-blue-600">({result.durationMinutes} minutos)</div>
              </div>

              <div className="bg-green-50 p-4 rounded-lg">
                <div className="text-sm text-green-600 font-medium">Energía Utilizable</div>
                <div className="text-lg font-bold text-green-900">{result.usableEnergy} Wh</div>
                <div className="text-sm text-green-600">De {result.totalEnergy} Wh totales</div>
              </div>

              <div className="bg-orange-50 p-4 rounded-lg">
                <div className="text-sm text-orange-600 font-medium">Potencia Consumida</div>
                <div className="text-lg font-bold text-orange-900">{result.power} W</div>
              </div>

              <div className="bg-purple-50 p-4 rounded-lg">
                <div className="text-sm text-purple-600 font-medium">Duración Teórica</div>
                <div className="text-lg font-bold text-purple-900">{result.basicDuration} h</div>
                <div className="text-xs text-purple-600">Sin considerar eficiencia</div>
              </div>
            </>
          ) : (
            <div className="text-center py-12 text-gray-500">
              Ingresa los valores y haz clic en "Calcular"
            </div>
          )}
        </div>
      </div>

      {/* Fórmulas */}
      <div className="mt-8 bg-gray-50 p-4 rounded-lg">
        <h3 className="text-sm font-medium text-gray-900 mb-2">Fórmulas de Duración de Batería:</h3>
        <div className="text-xs text-gray-600 space-y-1">
          <div><strong>Duración básica:</strong> t = C / I</div>
          <div><strong>Duración efectiva:</strong> t<sub>eff</sub> = t × η</div>
          <div><strong>Energía total:</strong> E = C × V</div>
          <div><strong>Potencia:</strong> P = V × I</div>
          <div><strong>Donde:</strong> C = Capacidad (Ah), I = Corriente (A), V = Voltaje (V), η = Eficiencia</div>
        </div>
      </div>
    </div>
  );
};

export default BatteryDurationCalc;
