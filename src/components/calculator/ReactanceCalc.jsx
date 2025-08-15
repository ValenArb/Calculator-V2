import { useState } from 'react';

const ReactanceCalc = () => {
  const [inputs, setInputs] = useState({
    frequency: 50,
    inductance: 0.001,
    capacitance: 0.000001
  });
  
  const [result, setResult] = useState(null);

  const calculate = () => {
    const { frequency, inductance, capacitance } = inputs;
    
    // Reactancia inductiva: XL = 2πfL
    const inductiveReactance = 2 * Math.PI * frequency * inductance;
    
    // Reactancia capacitiva: XC = 1 / (2πfC)
    const capacitiveReactance = 1 / (2 * Math.PI * frequency * capacitance);
    
    // Reactancia total: X = XL - XC
    const totalReactance = inductiveReactance - capacitiveReactance;
    
    setResult({
      inductiveReactance: inductiveReactance.toFixed(3),
      capacitiveReactance: capacitiveReactance.toFixed(3),
      totalReactance: totalReactance.toFixed(3),
      type: totalReactance > 0 ? 'Inductiva' : totalReactance < 0 ? 'Capacitiva' : 'Resonancia'
    });
  };

  const handleInputChange = (field, value) => {
    setInputs(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="p-6">
      <h2 className="text-xl font-semibold mb-6">Reactancia de Circuitos AC</h2>
      <p className="text-gray-600 mb-6">Cálculo de reactancias inductiva y capacitiva</p>
      
      <div className="grid md:grid-cols-2 gap-6">
        {/* Inputs */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Frecuencia (Hz)
            </label>
            <input
              type="number"
              value={inputs.frequency}
              onChange={(e) => handleInputChange('frequency', parseFloat(e.target.value) || 0)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

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
              <div className="bg-green-50 p-4 rounded-lg">
                <div className="text-sm text-green-600 font-medium">Reactancia Inductiva</div>
                <div className="text-xl font-bold text-green-900">{result.inductiveReactance} Ω</div>
              </div>

              <div className="bg-orange-50 p-4 rounded-lg">
                <div className="text-sm text-orange-600 font-medium">Reactancia Capacitiva</div>
                <div className="text-xl font-bold text-orange-900">{result.capacitiveReactance} Ω</div>
              </div>

              <div className={`p-4 rounded-lg ${
                result.type === 'Inductiva' ? 'bg-blue-50' : 
                result.type === 'Capacitiva' ? 'bg-purple-50' : 'bg-yellow-50'
              }`}>
                <div className={`text-sm font-medium ${
                  result.type === 'Inductiva' ? 'text-blue-600' : 
                  result.type === 'Capacitiva' ? 'text-purple-600' : 'text-yellow-600'
                }`}>
                  Reactancia Total ({result.type})
                </div>
                <div className={`text-xl font-bold ${
                  result.type === 'Inductiva' ? 'text-blue-900' : 
                  result.type === 'Capacitiva' ? 'text-purple-900' : 'text-yellow-900'
                }`}>
                  {result.totalReactance} Ω
                </div>
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
        <h3 className="text-sm font-medium text-gray-900 mb-2">Fórmulas de Reactancia:</h3>
        <div className="text-xs text-gray-600 space-y-1">
          <div><strong>Reactancia Inductiva:</strong> X<sub>L</sub> = 2πfL</div>
          <div><strong>Reactancia Capacitiva:</strong> X<sub>C</sub> = 1/(2πfC)</div>
          <div><strong>Reactancia Total:</strong> X = X<sub>L</sub> - X<sub>C</sub></div>
          <div><strong>Donde:</strong> f = Frecuencia (Hz), L = Inductancia (H), C = Capacitancia (F)</div>
        </div>
      </div>
    </div>
  );
};

export default ReactanceCalc;
