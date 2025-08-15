import { useState } from 'react';

const AnalogSignalCalc = () => {
  const [inputs, setInputs] = useState({
    inputMin: 4,
    inputMax: 20,
    outputMin: 0,
    outputMax: 100,
    inputValue: 12,
    percentage: 50,
    calculationMode: 'value' // 'value' or 'percentage'
  });
  
  const [result, setResult] = useState(null);

  const calculateFromValue = () => {
    const { inputMin, inputMax, outputMin, outputMax, inputValue } = inputs;
    
    if (inputValue < inputMin || inputValue > inputMax) {
      setResult({ error: 'El valor de entrada debe estar entre los límites mínimo y máximo' });
      return;
    }
    
    const outputValue = outputMin + ((outputMax - outputMin) / (inputMax - inputMin)) * (inputValue - inputMin);
    const percentage = ((inputValue - inputMin) / (inputMax - inputMin)) * 100;
    const scaleFactor = (outputMax - outputMin) / (inputMax - inputMin);
    
    setResult({
      outputValue: outputValue.toFixed(3),
      percentage: percentage.toFixed(1),
      scaleFactor: scaleFactor.toFixed(4),
      inputValue: inputValue.toFixed(3),
      error: null
    });
  };

  const calculateFromPercentage = () => {
    const { inputMin, inputMax, outputMin, outputMax, percentage } = inputs;
    
    if (percentage < 0 || percentage > 100) {
      setResult({ error: 'El porcentaje debe estar entre 0% y 100%' });
      return;
    }
    
    const inputValue = inputMin + ((inputMax - inputMin) * percentage) / 100;
    const outputValue = outputMin + ((outputMax - outputMin) * percentage) / 100;
    const scaleFactor = (outputMax - outputMin) / (inputMax - inputMin);
    
    setResult({
      outputValue: outputValue.toFixed(3),
      percentage: percentage.toFixed(1),
      scaleFactor: scaleFactor.toFixed(4),
      inputValue: inputValue.toFixed(3),
      error: null
    });
  };

  const calculate = () => {
    if (inputs.calculationMode === 'value') {
      calculateFromValue();
    } else {
      calculateFromPercentage();
    }
  };

  const handleInputChange = (field, value) => {
    setInputs(prev => ({ ...prev, [field]: parseFloat(value) || 0 }));
  };

  return (
    <div className="p-6">
      {/* Fórmula */}
      <div className="bg-blue-50 p-4 rounded-lg mb-6 border-l-4 border-blue-500">
        <h3 className="text-lg font-semibold text-blue-900 mb-2">Fórmulas</h3>
        <div className="text-blue-800 font-mono space-y-1">
          <div>Salida = Sal<sub>min</sub> + ((Sal<sub>max</sub> - Sal<sub>min</sub>) / (Ent<sub>max</sub> - Ent<sub>min</sub>)) × (Entrada - Ent<sub>min</sub>)</div>
          <div>% = ((Entrada - Ent<sub>min</sub>) / (Ent<sub>max</sub> - Ent<sub>min</sub>)) × 100</div>
        </div>
      </div>

      <h2 className="text-xl font-semibold mb-6">Valores Señal Analógica</h2>
      
      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-4">
          {/* Modo de cálculo */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Modo de Cálculo
            </label>
            <div className="space-y-2">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="mode"
                  value="value"
                  checked={inputs.calculationMode === 'value'}
                  onChange={(e) => setInputs(prev => ({ ...prev, calculationMode: e.target.value }))}
                  className="mr-2"
                />
                <span>• A partir del valor de entrada</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="mode"
                  value="percentage"
                  checked={inputs.calculationMode === 'percentage'}
                  onChange={(e) => setInputs(prev => ({ ...prev, calculationMode: e.target.value }))}
                  className="mr-2"
                />
                <span>• A partir del porcentaje</span>
              </label>
            </div>
          </div>

          {/* Rangos */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Entrada Mínima</label>
              <input
                type="number"
                step="0.01"
                value={inputs.inputMin}
                onChange={(e) => handleInputChange('inputMin', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Entrada Máxima</label>
              <input
                type="number"
                step="0.01"
                value={inputs.inputMax}
                onChange={(e) => handleInputChange('inputMax', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Salida Mínima</label>
              <input
                type="number"
                step="0.01"
                value={inputs.outputMin}
                onChange={(e) => handleInputChange('outputMin', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Salida Máxima</label>
              <input
                type="number"
                step="0.01"
                value={inputs.outputMax}
                onChange={(e) => handleInputChange('outputMax', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Input condicional */}
          {inputs.calculationMode === 'value' ? (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Valor de Entrada</label>
              <input
                type="number"
                step="0.01"
                value={inputs.inputValue}
                onChange={(e) => handleInputChange('inputValue', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          ) : (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Porcentaje (%)</label>
              <input
                type="number"
                step="0.1"
                min="0"
                max="100"
                value={inputs.percentage}
                onChange={(e) => handleInputChange('percentage', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          )}

          <button
            onClick={calculate}
            className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
          >
            Calcular
          </button>
        </div>

        <div className="space-y-4">
          {result ? (
            result.error ? (
              <div className="bg-red-50 p-4 rounded-lg">
                <div className="text-sm text-red-600">{result.error}</div>
              </div>
            ) : (
              <>
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="text-sm text-blue-600 font-medium">Valor de Entrada</div>
                  <div className="text-2xl font-bold text-blue-900">{result.inputValue}</div>
                </div>

                <div className="bg-green-50 p-4 rounded-lg">
                  <div className="text-sm text-green-600 font-medium">Valor de Salida</div>
                  <div className="text-2xl font-bold text-green-900">{result.outputValue}</div>
                </div>

                <div className="bg-yellow-50 p-4 rounded-lg">
                  <div className="text-sm text-yellow-600 font-medium">Porcentaje de Escala</div>
                  <div className="text-2xl font-bold text-yellow-900">{result.percentage}%</div>
                </div>

                <div className="bg-purple-50 p-4 rounded-lg">
                  <div className="text-sm text-purple-600 font-medium">Factor de Escala</div>
                  <div className="text-xl font-bold text-purple-900">{result.scaleFactor}</div>
                </div>
              </>
            )
          ) : (
            <div className="text-center py-12 text-gray-500">
              Configura los parámetros y haz clic en "Calcular"
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AnalogSignalCalc;
