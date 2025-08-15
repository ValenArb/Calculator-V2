import { useState } from 'react';

const CapacitorCodeCalc = () => {
  const [code, setCode] = useState('104');
  const [result, setResult] = useState(null);

  const calculate = () => {
    if (code.length < 3) {
      setResult({ error: 'El código debe tener al menos 3 dígitos' });
      return;
    }

    const digits = code.split('');
    const firstDigit = parseInt(digits[0]);
    const secondDigit = parseInt(digits[1]);
    const multiplier = Math.pow(10, parseInt(digits[2]));
    
    const capacitance = (firstDigit * 10 + secondDigit) * multiplier; // en pF
    
    let formattedValue = '';
    if (capacitance >= 1000000000) {
      formattedValue = (capacitance / 1000000000).toFixed(3) + ' F';
    } else if (capacitance >= 1000000) {
      formattedValue = (capacitance / 1000000).toFixed(3) + ' µF';
    } else if (capacitance >= 1000) {
      formattedValue = (capacitance / 1000).toFixed(3) + ' nF';
    } else {
      formattedValue = capacitance + ' pF';
    }

    setResult({
      capacitance,
      formattedValue,
      firstDigit,
      secondDigit,
      multiplier,
      error: null
    });
  };

  return (
    <div className="p-6">
      <h2 className="text-xl font-semibold mb-6">Código de Condensadores</h2>
      <p className="text-gray-600 mb-6">Decodifica el valor de capacitancia usando códigos numéricos</p>
      
      <div className="grid md:grid-cols-2 gap-6">
        {/* Input */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Código del Condensador
            </label>
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/[^0-9]/g, ''))}
              placeholder="ej: 104"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <div className="text-xs text-gray-500 mt-1">Ingresa solo números (3 dígitos mínimo)</div>
          </div>

          <button
            onClick={calculate}
            className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
          >
            Calcular Valor
          </button>

          {/* Examples */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-sm font-medium text-gray-900 mb-2">Ejemplos Comunes:</h3>
            <div className="space-y-1 text-xs text-gray-600">
              <div className="flex justify-between">
                <span>104</span>
                <span>100 nF</span>
              </div>
              <div className="flex justify-between">
                <span>105</span>
                <span>1 µF</span>
              </div>
              <div className="flex justify-between">
                <span>221</span>
                <span>220 pF</span>
              </div>
              <div className="flex justify-between">
                <span>473</span>
                <span>47 nF</span>
              </div>
            </div>
          </div>
        </div>

        {/* Results */}
        <div className="space-y-4">
          {result ? (
            result.error ? (
              <div className="bg-red-50 p-4 rounded-lg">
                <div className="text-sm text-red-600">{result.error}</div>
              </div>
            ) : (
              <>
                <div className="bg-green-50 p-4 rounded-lg">
                  <div className="text-sm text-green-600 font-medium">Valor de Capacitancia</div>
                  <div className="text-2xl font-bold text-green-900">{result.formattedValue}</div>
                  <div className="text-sm text-green-600">{result.capacitance.toLocaleString()} pF</div>
                </div>

                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="text-sm text-blue-600 font-medium">Decodificación</div>
                  <div className="text-sm text-blue-900 space-y-1">
                    <div>Primer dígito: {result.firstDigit}</div>
                    <div>Segundo dígito: {result.secondDigit}</div>
                    <div>Multiplicador: ×{result.multiplier.toLocaleString()}</div>
                    <div className="font-medium">Cálculo: ({result.firstDigit}×10 + {result.secondDigit}) × {result.multiplier.toLocaleString()} = {result.capacitance.toLocaleString()} pF</div>
                  </div>
                </div>
              </>
            )
          ) : (
            <div className="text-center py-12 text-gray-500">
              Ingresa un código y haz clic en "Calcular Valor"
            </div>
          )}
        </div>
      </div>

      {/* Information */}
      <div className="mt-8 bg-gray-50 p-4 rounded-lg">
        <h3 className="text-sm font-medium text-gray-900 mb-2">Sistema de Codificación:</h3>
        <div className="text-xs text-gray-600 space-y-1">
          <div>• Los primeros dos dígitos representan el valor significativo</div>
          <div>• El tercer dígito es el multiplicador (número de ceros a agregar)</div>
          <div>• El resultado siempre se expresa en picofaradios (pF)</div>
          <div>• Ejemplo: 104 = 10 × 10⁴ = 100,000 pF = 100 nF</div>
        </div>
      </div>
    </div>
  );
};

export default CapacitorCodeCalc;
