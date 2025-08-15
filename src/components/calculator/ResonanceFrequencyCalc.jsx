import { useState } from 'react';

const ResonanceFrequencyCalc = () => {
  const [inputs, setInputs] = useState({
    inductance: 0.001,
    capacitance: 0.000001
  });
  
  const [result, setResult] = useState(null);

  const calculate = () => {
    const { inductance, capacitance } = inputs;
    
    // Fórmula de frecuencia de resonancia: f = 1 / (2π√(LC))
    const frequency = 1 / (2 * Math.PI * Math.sqrt(inductance * capacitance));
    const angularFrequency = 2 * Math.PI * frequency;
    const period = 1 / frequency;
    
    setResult({
      frequency: frequency.toFixed(3),
      angularFrequency: angularFrequency.toFixed(3),
      period: period.toFixed(6)
    });
  };

  const handleInputChange = (field, value) => {
    setInputs(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="p-6">
      <h2 className="text-xl font-semibold mb-6">Frecuencia de Resonancia</h2>
      <p className="text-gray-600 mb-6">Cálculo de frecuencia de resonancia en circuitos LC</p>
      
      <div className="grid md:grid-cols-2 gap-6">
        {/* Inputs */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Inductancia (H)
            </label>
            <input
              type="number"
              step="0.000001"
              value={inputs.inductance}
              onChange={(e) => handleInputChange('inductance', parseFloat(e.target.value) || 0)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <div className="text-xs text-gray-500 mt-1">Ejemplo: 0.001 H (1 mH)</div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Capacitancia (F)
            </label>
            <input
              type="number"
              step="0.000000001"
              value={inputs.capacitance}
              onChange={(e) => handleInputChange('capacitance', parseFloat(e.target.value) || 0)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <div className="text-xs text-gray-500 mt-1">Ejemplo: 0.000001 F (1 µF)</div>
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
                <div className="text-sm text-blue-600 font-medium">Frecuencia de Resonancia</div>
                <div className="text-2xl font-bold text-blue-900">{result.frequency} Hz</div>
              </div>

              <div className="bg-green-50 p-4 rounded-lg">
                <div className="text-sm text-green-600 font-medium">Frecuencia Angular</div>
                <div className="text-lg font-bold text-green-900">{result.angularFrequency} rad/s</div>
              </div>

              <div className="bg-purple-50 p-4 rounded-lg">
                <div className="text-sm text-purple-600 font-medium">Período</div>
                <div className="text-lg font-bold text-purple-900">{result.period} s</div>
              </div>
            </>
          ) : (
            <div className="text-center py-12 text-gray-500">
              Ingresa los valores y haz clic en "Calcular"
            </div>
          )}
        </div>
      </div>

      {/* Fórmula */}
      <div className="mt-8 bg-gray-50 p-4 rounded-lg">
        <h3 className="text-sm font-medium text-gray-900 mb-2">Fórmula de Frecuencia de Resonancia:</h3>
        <div className="text-xs text-gray-600 space-y-1">
          <div><strong>Frecuencia:</strong> f = 1 / (2π√(LC))</div>
          <div><strong>Frecuencia Angular:</strong> ω = 2πf</div>
          <div><strong>Período:</strong> T = 1/f</div>
          <div><strong>Donde:</strong> f = Frecuencia (Hz), L = Inductancia (H), C = Capacitancia (F), ω = Frecuencia Angular (rad/s), T = Período (s)</div>
        </div>
      </div>
    </div>
  );
};

export default ResonanceFrequencyCalc;
