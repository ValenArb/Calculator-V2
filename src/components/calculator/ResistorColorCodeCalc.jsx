import { useState } from 'react';

const ResistorColorCodeCalc = () => {
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
    grey: { value: 8, multiplier: 100000000, color: '#808080' },
    white: { value: 9, multiplier: 1000000000, color: '#FFFFFF' }
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

    const resistance = (firstDigit * 10 + secondDigit) * multiplier;
    const minValue = resistance * (1 - tolerance / 100);
    const maxValue = resistance * (1 + tolerance / 100);

    // Formatear valor con unidades apropiadas
    let formattedValue = '';
    if (resistance >= 1000000) {
      formattedValue = (resistance / 1000000).toFixed(1) + ' MΩ';
    } else if (resistance >= 1000) {
      formattedValue = (resistance / 1000).toFixed(1) + ' kΩ';
    } else {
      formattedValue = resistance + ' Ω';
    }

    setResult({
      resistance: resistance,
      formattedValue: formattedValue,
      tolerance: tolerance,
      minValue: minValue.toFixed(0),
      maxValue: maxValue.toFixed(0)
    });
  };

  const handleBandChange = (band, value) => {
    setBands(prev => ({ ...prev, [band]: value }));
  };

  return (
    <div className="p-6">
      <h2 className="text-xl font-semibold mb-6">Código de Colores de Resistencias</h2>
      <p className="text-gray-600 mb-6">Decodifica el valor de resistencias por su código de colores</p>
      
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
              {Object.entries(colors).map(([key, { value, color }]) => {
                // Determinar color del texto basado en el fondo
                const isLightBackground = color === '#FFFF00' || color === '#FFFFFF' || color === '#C0C0C0' || color === '#FFD700';
                const textColor = isLightBackground ? '#000000' : '#FFFFFF';
                return (
                  <option key={key} value={key} style={{backgroundColor: color, color: textColor}}>
                    {key.charAt(0).toUpperCase() + key.slice(1)} ({value})
                  </option>
                );
              })}
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
              {Object.entries(colors).map(([key, { value, color }]) => {
                // Determinar color del texto basado en el fondo
                const isLightBackground = color === '#FFFF00' || color === '#FFFFFF' || color === '#C0C0C0' || color === '#FFD700';
                const textColor = isLightBackground ? '#000000' : '#FFFFFF';
                return (
                  <option key={key} value={key} style={{backgroundColor: color, color: textColor}}>
                    {key.charAt(0).toUpperCase() + key.slice(1)} ({value})
                  </option>
                );
              })}
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
              {Object.entries(toleranceColors).map(([key, { tolerance, color }]) => {
                // Determinar color del texto basado en el fondo
                const isLightBackground = color === '#FFD700' || color === '#C0C0C0' || color === '#FFFFFF';
                const textColor = isLightBackground ? '#000000' : '#FFFFFF';
                return (
                  <option key={key} value={key} style={{backgroundColor: color, color: textColor}}>
                    {key.charAt(0).toUpperCase() + key.slice(1)} (±{tolerance}%)
                  </option>
                );
              })}
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
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="text-sm text-blue-600 font-medium">Valor de Resistencia</div>
                <div className="text-2xl font-bold text-blue-900">{result.formattedValue}</div>
                <div className="text-sm text-blue-600">{result.resistance.toLocaleString()} Ω</div>
              </div>

              <div className="bg-yellow-50 p-4 rounded-lg">
                <div className="text-sm text-yellow-700 font-medium">Tolerancia</div>
                <div className="text-lg font-bold text-yellow-900">±{result.tolerance}%</div>
              </div>

              <div className="bg-green-50 p-4 rounded-lg">
                <div className="text-sm text-green-600 font-medium">Rango de Valores</div>
                <div className="text-sm text-green-900">
                  <div>Mínimo: {parseInt(result.minValue).toLocaleString()} Ω</div>
                  <div>Máximo: {parseInt(result.maxValue).toLocaleString()} Ω</div>
                </div>
              </div>

              {/* Visual resistor representation */}
              <div className="bg-white p-4 rounded-lg border">
                <div className="text-sm text-gray-700 font-medium mb-2">Representación Visual</div>
                <div className="flex items-center space-x-1 bg-tan p-2 rounded">
                  <div className="flex-1 h-8 bg-gray-200 rounded-l"></div>
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
                  <div className="flex-1 h-8 bg-gray-200 rounded-r"></div>
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

      {/* Color reference table */}
      <div className="mt-8 bg-gray-50 p-4 rounded-lg">
        <h3 className="text-sm font-medium text-gray-900 mb-2">Código de Colores:</h3>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-2 text-xs">
          {Object.entries(colors).map(([key, { value, color }]) => (
            <div key={key} className="flex items-center space-x-2">
              <div 
                className="w-4 h-4 border border-gray-400" 
                style={{backgroundColor: color}}
              ></div>
              <span className="capitalize">{key}: {value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ResistorColorCodeCalc;
