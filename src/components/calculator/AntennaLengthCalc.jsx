import { useState } from 'react';

const AntennaLengthCalc = () => {
  const [inputs, setInputs] = useState({
    frequency: 2400,
    frequencyUnit: 'MHz',
    antennaType: 'dipole',
    lengthUnit: 'm'
  });
  
  const [result, setResult] = useState(null);

  const frequencyUnits = {
    'Hz': 1,
    'KHz': 1000,
    'MHz': 1000000,
    'GHz': 1000000000
  };

  const lengthUnits = {
    'm': 1,
    'cm': 100,
    'mm': 1000,
    'ft': 3.28084,
    'in': 39.3701
  };

  const antennaTypes = {
    'dipole': { name: 'Dipolo (λ/2)', factor: 0.5 },
    'monopole': { name: 'Monopolo (λ/4)', factor: 0.25 },
    'full-wave': { name: 'Onda completa (λ)', factor: 1.0 },
    'quarter-wave': { name: 'Cuarto de onda (λ/4)', factor: 0.25 }
  };

  const calculate = () => {
    const { frequency, frequencyUnit, antennaType, lengthUnit } = inputs;
    
    const freqInHz = frequency * frequencyUnits[frequencyUnit];
    const speedOfLight = 299792458; // m/s
    
    // Calcular longitud de onda
    const wavelength = speedOfLight / freqInHz;
    
    // Calcular longitud de antena según tipo
    const antennaFactor = antennaTypes[antennaType].factor;
    const antennaLength = wavelength * antennaFactor;
    
    // Convertir a la unidad deseada
    const lengthInDesiredUnit = antennaLength * lengthUnits[lengthUnit];
    
    setResult({
      wavelength: wavelength.toFixed(4),
      antennaLength: lengthInDesiredUnit.toFixed(4),
      lengthUnit: lengthUnit,
      frequency: frequency,
      frequencyUnit: frequencyUnit,
      antennaTypeName: antennaTypes[antennaType].name
    });
  };

  const handleInputChange = (field, value) => {
    setInputs(prev => ({ ...prev, [field]: value }));
  };

  // Frecuencias comunes
  const commonFreqs = {
    'AM (550-1600 KHz)': { freq: 1000, unit: 'KHz' },
    'FM (88-108 MHz)': { freq: 100, unit: 'MHz' },
    'WiFi 2.4GHz': { freq: 2400, unit: 'MHz' },
    'WiFi 5GHz': { freq: 5000, unit: 'MHz' },
    'GPS L1': { freq: 1575.42, unit: 'MHz' },
    'Bluetooth': { freq: 2400, unit: 'MHz' }
  };

  return (
    <div className="p-6">
      <div className="mt-4 bg-gray-50 p-4 rounded-lg mb-6">
        <h3 className="text-sm font-medium text-gray-900 mb-2">Fórmulas:</h3>
        <div className="text-xs text-gray-600 space-y-1">
          <div><strong>Longitud de onda:</strong> λ = c / f</div>
          <div><strong>Longitud antena:</strong> L = λ × Factor</div>
          <div><strong>Donde:</strong> c = 299,792,458 m/s, f = frecuencia (Hz)</div>
        </div>
      </div>

      <h2 className="text-xl font-semibold mb-6">Longitud de Antena</h2>
      <p className="text-gray-600 mb-6">Calcula la longitud óptima de antenas según la frecuencia</p>
      
      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Frecuencia</label>
            <div className="flex gap-2">
              <input
                type="number"
                step="0.01"
                value={inputs.frequency}
                onChange={(e) => handleInputChange('frequency', parseFloat(e.target.value) || 0)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <select
                value={inputs.frequencyUnit}
                onChange={(e) => handleInputChange('frequencyUnit', e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="Hz">Hz</option>
                <option value="KHz">KHz</option>
                <option value="MHz">MHz</option>
                <option value="GHz">GHz</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de Antena</label>
            <select
              value={inputs.antennaType}
              onChange={(e) => handleInputChange('antennaType', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {Object.entries(antennaTypes).map(([key, { name }]) => (
                <option key={key} value={key}>{name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Unidad de Longitud</label>
            <select
              value={inputs.lengthUnit}
              onChange={(e) => handleInputChange('lengthUnit', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="m">Metros (m)</option>
              <option value="cm">Centímetros (cm)</option>
              <option value="mm">Milímetros (mm)</option>
              <option value="ft">Pies (ft)</option>
              <option value="in">Pulgadas (in)</option>
            </select>
          </div>

          <button
            onClick={calculate}
            className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
          >
            Calcular
          </button>

          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-sm font-medium text-gray-900 mb-2">Frecuencias Comunes:</h3>
            <div className="space-y-1">
              {Object.entries(commonFreqs).map(([name, { freq, unit }]) => (
                <button
                  key={name}
                  onClick={() => {
                    setInputs(prev => ({ 
                      ...prev, 
                      frequency: freq, 
                      frequencyUnit: unit 
                    }));
                  }}
                  className="block w-full text-left text-xs p-1 hover:bg-white rounded"
                >
                  {name}: {freq} {unit}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-4">
          {result ? (
            <>
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="text-sm text-blue-600 font-medium">Longitud de Onda</div>
                <div className="text-xl font-bold text-blue-900">{result.wavelength} m</div>
              </div>

              <div className="bg-green-50 p-4 rounded-lg">
                <div className="text-sm text-green-600 font-medium">Longitud de Antena</div>
                <div className="text-2xl font-bold text-green-900">{result.antennaLength} {result.lengthUnit}</div>
                <div className="text-sm text-green-600">{result.antennaTypeName}</div>
              </div>

              <div className="bg-purple-50 p-4 rounded-lg">
                <div className="text-sm text-purple-600 font-medium">Parámetros</div>
                <div className="text-sm text-purple-900">
                  <div>Frecuencia: {result.frequency} {result.frequencyUnit}</div>
                  <div>Tipo: {result.antennaTypeName}</div>
                </div>
              </div>
            </>
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

export default AntennaLengthCalc;
