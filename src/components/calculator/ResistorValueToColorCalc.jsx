import { useState } from 'react';

const ResistorValueToColorCalc = () => {
  const [value, setValue] = useState(10000);
  const [result, setResult] = useState(null);

  const colors = {
    0: { name: 'Negro', color: '#000000' },
    1: { name: 'Marrón', color: '#8B4513' },
    2: { name: 'Rojo', color: '#FF0000' },
    3: { name: 'Naranja', color: '#FFA500' },
    4: { name: 'Amarillo', color: '#FFFF00' },
    5: { name: 'Verde', color: '#00FF00' },
    6: { name: 'Azul', color: '#0000FF' },
    7: { name: 'Violeta', color: '#8A2BE2' },
    8: { name: 'Gris', color: '#808080' },
    9: { name: 'Blanco', color: '#FFFFFF' }
  };

  const calculate = () => {
    if (value < 10 || value > 99000000) {
      setResult({ error: 'El valor debe estar entre 10Ω y 99MΩ' });
      return;
    }

    // Convertir el valor a string y encontrar los dígitos significativos
    const valueStr = value.toString();
    let firstDigit, secondDigit, multiplier = 0;
    
    // Extraer los primeros dos dígitos significativos
    firstDigit = parseInt(valueStr[0]);
    secondDigit = parseInt(valueStr[1]);
    
    // Calcular el multiplicador
    let tempValue = value;
    let baseValue = firstDigit * 10 + secondDigit;
    
    while (tempValue >= baseValue * 10) {
      tempValue = tempValue / 10;
      multiplier++;
    }

    // Formatear valor con unidades
    let formattedValue = '';
    if (value >= 1000000) {
      formattedValue = (value / 1000000).toFixed(1) + ' MΩ';
    } else if (value >= 1000) {
      formattedValue = (value / 1000).toFixed(1) + ' kΩ';
    } else {
      formattedValue = value + ' Ω';
    }

    setResult({
      firstDigit,
      secondDigit,
      multiplier,
      formattedValue,
      firstColor: colors[firstDigit],
      secondColor: colors[secondDigit],
      multiplierColor: colors[multiplier],
      error: null
    });
  };

  const handleValueChange = (e) => {
    const newValue = parseInt(e.target.value) || 0;
    setValue(newValue);
  };

  return (
    <div className="p-6">
      <h2 className="text-xl font-semibold mb-6">Valor a Código de Colores</h2>
      <p className="text-gray-600 mb-6">Convierte un valor de resistencia al código de colores correspondiente</p>
      
      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Valor de Resistencia (Ω)
            </label>
            <input
              type="number"
              value={value}
              onChange={handleValueChange}
              min="10"
              max="99000000"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <div className="text-xs text-gray-500 mt-1">Rango: 10Ω a 99MΩ</div>
          </div>

          <button
            onClick={calculate}
            className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
          >
            Generar Código de Colores
          </button>

          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-sm font-medium text-gray-900 mb-2">Valores Comunes:</h3>
            <div className="grid grid-cols-2 gap-1 text-xs">
              <button onClick={() => setValue(100)} className="text-left hover:bg-white p-1 rounded">100Ω</button>
              <button onClick={() => setValue(1000)} className="text-left hover:bg-white p-1 rounded">1kΩ</button>
              <button onClick={() => setValue(4700)} className="text-left hover:bg-white p-1 rounded">4.7kΩ</button>
              <button onClick={() => setValue(10000)} className="text-left hover:bg-white p-1 rounded">10kΩ</button>
              <button onClick={() => setValue(47000)} className="text-left hover:bg-white p-1 rounded">47kΩ</button>
              <button onClick={() => setValue(100000)} className="text-left hover:bg-white p-1 rounded">100kΩ</button>
              <button onClick={() => setValue(220000)} className="text-left hover:bg-white p-1 rounded">220kΩ</button>
              <button onClick={() => setValue(1000000)} className="text-left hover:bg-white p-1 rounded">1MΩ</button>
            </div>
          </div>
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
                  <div className="text-sm text-blue-600 font-medium">Valor: {result.formattedValue}</div>
                  <div className="text-lg font-bold text-blue-900">Código: {result.firstDigit}{result.secondDigit}{result.multiplier}</div>
                </div>

                <div className="bg-white p-4 rounded-lg border">
                  <div className="text-sm text-gray-700 font-medium mb-2">Bandas de Colores:</div>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-6 border border-gray-400" style={{backgroundColor: result.firstColor.color}}></div>
                      <span className="text-sm">{result.firstColor.name} ({result.firstDigit})</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-6 border border-gray-400" style={{backgroundColor: result.secondColor.color}}></div>
                      <span className="text-sm">{result.secondColor.name} ({result.secondDigit})</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-6 border border-gray-400" style={{backgroundColor: result.multiplierColor.color}}></div>
                      <span className="text-sm">{result.multiplierColor.name} (×10^{result.multiplier})</span>
                    </div>
                  </div>
                </div>

                <div className="bg-white p-4 rounded-lg border">
                  <div className="text-sm text-gray-700 font-medium mb-2">Resistencia Visual:</div>
                  <div className="flex items-center space-x-1 bg-tan p-2 rounded">
                    <div className="flex-1 h-8 bg-gray-200 rounded-l"></div>
                    <div className="w-6 h-8" style={{backgroundColor: result.firstColor.color}}></div>
                    <div className="w-6 h-8" style={{backgroundColor: result.secondColor.color}}></div>
                    <div className="w-6 h-8" style={{backgroundColor: result.multiplierColor.color}}></div>
                    <div className="w-4 h-8 bg-white"></div>
                    <div className="w-6 h-8 bg-yellow-400"></div>
                    <div className="flex-1 h-8 bg-gray-200 rounded-r"></div>
                  </div>
                  <div className="text-xs text-gray-500 mt-1 text-center">+ Banda dorada (±5% tolerancia)</div>
                </div>
              </>
            )
          ) : (
            <div className="text-center py-12 text-gray-500">
              Ingresa un valor y haz clic en "Generar Código"
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResistorValueToColorCalc;
