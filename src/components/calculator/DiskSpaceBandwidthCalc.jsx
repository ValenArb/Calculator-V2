import { useState } from 'react';

const DiskSpaceBandwidthCalc = () => {
  const [inputs, setInputs] = useState({
    dataRate: 1000,
    dataRateUnit: 'Mbps',
    recordTime: 24,
    timeUnit: 'hours',
    compressionRatio: 2
  });
  
  const [result, setResult] = useState(null);

  const dataRateUnits = {
    'bps': 1,
    'Kbps': 1000,
    'Mbps': 1000000,
    'Gbps': 1000000000
  };

  const timeUnits = {
    'seconds': 1,
    'minutes': 60,
    'hours': 3600,
    'days': 86400
  };

  const calculate = () => {
    const { dataRate, dataRateUnit, recordTime, timeUnit, compressionRatio } = inputs;
    
    // Convertir todo a bits por segundo
    const bitsPerSecond = dataRate * dataRateUnits[dataRateUnit];
    const totalSeconds = recordTime * timeUnits[timeUnit];
    
    // Calcular espacio total sin compresión
    const totalBits = bitsPerSecond * totalSeconds;
    const totalBytes = totalBits / 8;
    const compressedBytes = totalBytes / compressionRatio;
    
    // Formatear resultados
    const formatBytes = (bytes) => {
      if (bytes >= 1024 * 1024 * 1024 * 1024) {
        return (bytes / (1024 * 1024 * 1024 * 1024)).toFixed(2) + ' TB';
      } else if (bytes >= 1024 * 1024 * 1024) {
        return (bytes / (1024 * 1024 * 1024)).toFixed(2) + ' GB';
      } else if (bytes >= 1024 * 1024) {
        return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
      } else if (bytes >= 1024) {
        return (bytes / 1024).toFixed(2) + ' KB';
      } else {
        return bytes.toFixed(0) + ' Bytes';
      }
    };

    setResult({
      totalBytes: formatBytes(totalBytes),
      compressedBytes: formatBytes(compressedBytes),
      bandwidth: (bitsPerSecond / 1000000).toFixed(2) + ' Mbps',
      totalTime: recordTime + ' ' + timeUnit
    });
  };

  const handleInputChange = (field, value) => {
    setInputs(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="p-6">
      <div className="mt-4 bg-gray-50 p-4 rounded-lg mb-6">
        <h3 className="text-sm font-medium text-gray-900 mb-2">Fórmulas:</h3>
        <div className="text-xs text-gray-600 space-y-1">
          <div><strong>Espacio Total:</strong> Tasa de datos × Tiempo de grabación ÷ 8</div>
          <div><strong>Espacio Comprimido:</strong> Espacio Total ÷ Factor de compresión</div>
          <div><strong>Ancho de banda:</strong> Tasa de datos en tiempo real</div>
        </div>
      </div>

      <h2 className="text-xl font-semibold mb-6">Espacio en Disco y Ancho de Banda</h2>
      <p className="text-gray-600 mb-6">Calcula espacio de almacenamiento y ancho de banda para sistemas de grabación</p>
      
      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tasa de Datos</label>
            <div className="flex gap-2">
              <input
                type="number"
                value={inputs.dataRate}
                onChange={(e) => handleInputChange('dataRate', parseFloat(e.target.value) || 0)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <select
                value={inputs.dataRateUnit}
                onChange={(e) => handleInputChange('dataRateUnit', e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="bps">bps</option>
                <option value="Kbps">Kbps</option>
                <option value="Mbps">Mbps</option>
                <option value="Gbps">Gbps</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tiempo de Grabación</label>
            <div className="flex gap-2">
              <input
                type="number"
                value={inputs.recordTime}
                onChange={(e) => handleInputChange('recordTime', parseFloat(e.target.value) || 0)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <select
                value={inputs.timeUnit}
                onChange={(e) => handleInputChange('timeUnit', e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="seconds">Segundos</option>
                <option value="minutes">Minutos</option>
                <option value="hours">Horas</option>
                <option value="days">Días</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Factor de Compresión</label>
            <input
              type="number"
              step="0.1"
              min="1"
              value={inputs.compressionRatio}
              onChange={(e) => handleInputChange('compressionRatio', parseFloat(e.target.value) || 1)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <div className="text-xs text-gray-500 mt-1">1 = sin compresión, 2 = 50% reducción, etc.</div>
          </div>

          <button
            onClick={calculate}
            className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
          >
            Calcular
          </button>
        </div>

        <div className="space-y-4">
          {result ? (
            <>
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="text-sm text-blue-600 font-medium">Espacio Sin Compresión</div>
                <div className="text-xl font-bold text-blue-900">{result.totalBytes}</div>
              </div>

              <div className="bg-green-50 p-4 rounded-lg">
                <div className="text-sm text-green-600 font-medium">Espacio Con Compresión</div>
                <div className="text-xl font-bold text-green-900">{result.compressedBytes}</div>
              </div>

              <div className="bg-purple-50 p-4 rounded-lg">
                <div className="text-sm text-purple-600 font-medium">Ancho de Banda Requerido</div>
                <div className="text-lg font-bold text-purple-900">{result.bandwidth}</div>
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

export default DiskSpaceBandwidthCalc;
