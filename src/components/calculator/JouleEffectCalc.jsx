import { useState } from 'react';

const JouleEffectCalc = () => {
  const [inputs, setInputs] = useState({
    resistance: 10,
    current: 5,
    time: 60
  });
  
  const [result, setResult] = useState(null);

  const calculate = () => {
    const { resistance, current, time } = inputs;
    
    // Fórmula del efecto Joule: W = I² × R × t
    const energy = Math.pow(current, 2) * resistance * time;
    const power = Math.pow(current, 2) * resistance;
    const energyKWh = energy / 3600000; // Convertir a kWh
    
    setResult({
      energy: energy.toFixed(2),
      energyKWh: energyKWh.toFixed(6),
      power: power.toFixed(2)
    });
  };

  const handleInputChange = (field, value) => {
    setInputs(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="p-6">
      <h2 className="text-xl font-semibold mb-6">Efecto Joule</h2>
      <p className="text-gray-600 mb-6">Cálculo de energía disipada por efecto Joule</p>
      
      <div className="grid md:grid-cols-2 gap-6">
        {/* Inputs */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Resistencia (Ω)
            </label>
            <input
              type="number"
              value={inputs.resistance}
              onChange={(e) => handleInputChange('resistance', parseFloat(e.target.value) || 0)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Corriente (A)
            </label>
            <input
              type="number"
              value={inputs.current}
              onChange={(e) => handleInputChange('current', parseFloat(e.target.value) || 0)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tiempo (s)
            </label>
            <input
              type="number"
              value={inputs.time}
              onChange={(e) => handleInputChange('time', parseFloat(e.target.value) || 0)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
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
                <div className="text-sm text-red-600 font-medium">Energía Disipada</div>
                <div className="text-2xl font-bold text-red-900">{result.energy} J</div>
                <div className="text-sm text-red-600">{result.energyKWh} kWh</div>
              </div>

              <div className="bg-orange-50 p-4 rounded-lg">
                <div className="text-sm text-orange-600 font-medium">Potencia Disipada</div>
                <div className="text-2xl font-bold text-orange-900">{result.power} W</div>
              </div>
            </>
          ) : (
            <div className="text-center py-12 text-gray-500">
              Completa los datos y haz clic en "Calcular"
            </div>
          )}
        </div>
      </div>

      {/* Fórmula */}
      <div className="mt-8 bg-gray-50 p-4 rounded-lg">
        <h3 className="text-sm font-medium text-gray-900 mb-2">Fórmula del Efecto Joule:</h3>
        <div className="text-xs text-gray-600 space-y-1">
          <div><strong>Energía:</strong> W = I² × R × t</div>
          <div><strong>Potencia:</strong> P = I² × R</div>
          <div><strong>Donde:</strong> W = Energía (J), P = Potencia (W), I = Corriente (A), R = Resistencia (Ω), t = Tiempo (s)</div>
        </div>
      </div>
    </div>
  );
};

export default JouleEffectCalc;
