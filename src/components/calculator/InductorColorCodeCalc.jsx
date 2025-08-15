import { useState } from 'react';

const InductorColorCodeCalc = () => {
  const [bands, setBands] = useState({
    first: 'black',
    second: 'black',
    third: 'black',
    tolerance: 'gold'
  });
  
  const [result, setResult] = useState(null);

  const colors = {
    black: { value: 0, multiplier: 1, color: '#000000' },
    brown: { value: 1, multiplier: 10, color: '#8B4513' },
    red: { value: 2, multiplier: 100, color: '#FF0000' },
    orange: { value: 3, multiplier: 1000, color: '#FFA500' },
    yellow: { value: 4, multiplier: 10000, color: '#FFFF00' },
    green: { value: 5, multiplier: 100000, color: '#00FF00' },
    blue: { value: 6, multiplier: 1000000, color: '#0000FF' },
    violet: { value: 7, multiplier: 10000000, color: '#8A2BE2' },
    grey: { value: 8, multiplier: 0.01, color: '#808080' },
    white: { value: 9, multiplier: 0.1, color: '#FFFFFF' }
  };

  const toleranceColors = {
    gold: { tolerance: 5, color: '#FFD700' },
    silver: { tolerance: 10, color: '#C0C0C0' },
    brown: { tolerance: 1, color: '#8B4513' },
    red: { tolerance: 2, color: '#FF0000' },
    green: { tolerance: 0.5, color: '#00FF00' },
    blue: { tolerance: 0.25, color: '#0000FF' },
    violet: { tolerance: 0.1, color: '#8A2BE2' }
  };

  const calculate = () => {
    const firstDigit = colors[bands.first].value;
    const secondDigit = colors[bands.second].value;
    const multiplier = colors[bands.third].multiplier;
    const tolerance = toleranceColors[bands.tolerance].tolerance;

    const inductance = (firstDigit * 10 + secondDigit) * multiplier;
    const minValue = inductance * (1 - tolerance / 100);
    const maxValue = inductance * (1 + tolerance / 100);

    // Formatear valor con unidades apropiadas
    let formattedValue = '';
    if (inductance >= 1000000) {
      formattedValue = (inductance / 1000000).toFixed(3) + ' H';
    } else if (inductance >= 1000) {
      formattedValue = (inductance / 1000).toFixed(3) + ' mH';
    } else {
      formattedValue = inductance.toFixed(3) + ' µH';
    }

    setResult({
      inductance: inductance,
      formattedValue: formattedValue,
      tolerance: tolerance,
      minValue: minValue.toFixed(3),
      maxValue: maxValue.toFixed(3)
    });
  };

  const handleBandChange = (band, value) => {
    setBands(prev => ({ ...prev, [band]: value }));
  };

  return (
    <div className="p-6">
      <h2 className="text-xl font-semibold mb-6">Código de Colores de Inductores</h2>
      <p className="text-gray-600 mb-6">Decodifica el valor de inductancia por código de colores</p>
      
      <div className="grid md:grid-cols-2 gap-6">
        {/* Inputs */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Primera Banda (1er Dígito)
            </label>
            <select
              value={bands.first}
              onChange={(e) => handleBandChange('first', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {Object.entries(colors).map(([key, { value, color }]) => (
                <option key={key} value={key} style={{backgroundColor: color, color: color === '#FFFF00' ? '#000' : '#fff'}}>
                  {key.charAt(0).toUpperCase() + key.slice(1)} ({value})
                </option>
              ))}
            </select>
            <div 
              className="mt-2 h-8 w-full rounded border-2" 
              style={{backgroundColor: colors[bands.first].color}}
            ></div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Segunda Banda (2do Dígito)
            </label>
            <select
              value={bands.second}
              onChange={(e) => handleBandChange('second', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {Object.entries(colors).map(([key, { value, color }]) => (
                <option key={key} value={key} style={{backgroundColor: color, color: color === '#FFFF00' ? '#000' : '#fff'}}>
                  {key.charAt(0).toUpperCase() + key.slice(1)} ({value})
                </option>
              ))}
            </select>
            <div 
              className="mt-2 h-8 w-full rounded border-2" 
              style={{backgroundColor: colors[bands.second].color}}
            ></div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tercera Banda (Multiplicador)
            </label>
            <select
              value={bands.third}
              onChange={(e) => handleBandChange('third', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {Object.entries(colors).map(([key, { multiplier, color }]) => (
                <option key={key} value={key} style={{backgroundColor: color, color: color === '#FFFF00' ? '#000' : '#fff'}}>
                  {key.charAt(0).toUpperCase() + key.slice(1)} (×{multiplier})
                </option>
              ))}
            </select>
            <div 
              className="mt-2 h-8 w-full rounded border-2" 
              style={{backgroundColor: colors[bands.third].color}}
            ></div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Cuarta Banda (Tolerancia)
            </label>
            <select
              value={bands.tolerance}
              onChange={(e) => handleBandChange('tolerance', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {Object.entries(toleranceColors).map(([key, { tolerance, color }]) => (
                <option key={key} value={key} style={{backgroundColor: color, color: color === '#FFD700' || color === '#FFFF00' ? '#000' : '#fff'}}>
                  {key.charAt(0).toUpperCase() + key.slice(1)} (±{tolerance}%)
                </option>
              ))}
            </select>
            <div 
              className="mt-2 h-8 w-full rounded border-2" 
              style={{backgroundColor: toleranceColors[bands.tolerance].color}}
            ></div>
          </div>

          <button
            onClick={calculate}
            className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
          >
            Calcular Valor
          </button>
        </div>

        {/* Results */}
        <div className="space-y-4">
          {result ? (
            <>
              <div className="bg-purple-50 p-4 rounded-lg">
                <div className="text-sm text-purple-600 font-medium">Valor de Inductancia</div>
                <div className="text-2xl font-bold text-purple-900">{result.formattedValue}</div>
                <div className="text-sm text-purple-600">{result.inductance.toFixed(3)} µH</div>
              </div>

              <div className="bg-yellow-50 p-4 rounded-lg">
                <div className="text-sm text-yellow-700 font-medium">Tolerancia</div>
                <div className="text-lg font-bold text-yellow-900">±{result.tolerance}%</div>
              </div>

              <div className="bg-green-50 p-4 rounded-lg">
                <div className="text-sm text-green-600 font-medium">Rango de Valores (µH)</div>
                <div className="text-sm text-green-900">
                  <div>Mínimo: {result.minValue} µH</div>
                  <div>Máximo: {result.maxValue} µH</div>
                </div>
              </div>

              {/* Visual inductor representation */}
              <div className="bg-white p-4 rounded-lg border">
                <div className="text-sm text-gray-700 font-medium mb-2">Representación Visual</div>
                <div className="flex items-center space-x-1 bg-gray-100 p-2 rounded">
                  <div className="flex-1 h-8 bg-gray-300 rounded-l"></div>
                  <div 
                    className="w-4 h-8" 
                    style={{backgroundColor: colors[bands.first].color}}
                  ></div>
                  <div 
                    className="w-4 h-8" 
                    style={{backgroundColor: colors[bands.second].color}}
                  ></div>
                  <div 
                    className="w-4 h-8" 
                    style={{backgroundColor: colors[bands.third].color}}
                  ></div>
                  <div className="w-2 h-8 bg-white"></div>
                  <div 
                    className="w-4 h-8" 
                    style={{backgroundColor: toleranceColors[bands.tolerance].color}}
                  ></div>
                  <div className="flex-1 h-8 bg-gray-300 rounded-r"></div>
                </div>
              </div>
            </>
          ) : (
            <div className="text-center py-12 text-gray-500">
              Selecciona los colores y haz clic en "Calcular Valor"
            </div>
          )}
        </div>
      </div>

      {/* Information */}
      <div className="mt-8 bg-gray-50 p-4 rounded-lg">
        <h3 className="text-sm font-medium text-gray-900 mb-2">Notas sobre Inductores:</h3>
        <div className="text-xs text-gray-600 space-y-1">
          <div>• Los inductores usan el mismo sistema de colores que las resistencias</div>
          <div>• Los valores se expresan en microhenrios (µH) para inductores pequeños</div>
          <div>• Gris y blanco actúan como multiplicadores decimales (×0.01 y ×0.1)</div>
          <div>• La tolerancia típica es de ±5% a ±20% según el tipo de inductor</div>
        </div>
      </div>
    </div>
  );
};

export default InductorColorCodeCalc;
