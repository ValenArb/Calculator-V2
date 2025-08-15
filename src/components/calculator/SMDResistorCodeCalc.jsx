import { useState } from 'react';

const SMDResistorCodeCalc = () => {
  const [code, setCode] = useState('103');
  const [result, setResult] = useState(null);

  const calculate = () => {
    if (code.length < 3 || code.length > 4) {
      setResult({ error: 'El código debe tener 3 o 4 dígitos' });
      return;
    }

    let resistance;
    let formattedValue;
    let explanation;

    if (code.length === 3) {
      // Sistema de 3 dígitos: AB×10^C
      const firstDigit = parseInt(code[0]);
      const secondDigit = parseInt(code[1]);
      const multiplier = Math.pow(10, parseInt(code[2]));
      
      resistance = (firstDigit * 10 + secondDigit) * multiplier;
      explanation = `(${firstDigit} × 10 + ${secondDigit}) × 10^${code[2]} = ${resistance.toLocaleString()} Ω`;
    } else {
      // Sistema de 4 dígitos: ABC×10^D
      const firstDigit = parseInt(code[0]);
      const secondDigit = parseInt(code[1]);
      const thirdDigit = parseInt(code[2]);
      const multiplier = Math.pow(10, parseInt(code[3]));
      
      resistance = (firstDigit * 100 + secondDigit * 10 + thirdDigit) * multiplier;
      explanation = `(${firstDigit} × 100 + ${secondDigit} × 10 + ${thirdDigit}) × 10^${code[3]} = ${resistance.toLocaleString()} Ω`;
    }

    // Formatear valor
    if (resistance >= 1000000) {
      formattedValue = (resistance / 1000000).toFixed(1) + ' MΩ';
    } else if (resistance >= 1000) {
      formattedValue = (resistance / 1000).toFixed(1) + ' kΩ';
    } else {
      formattedValue = resistance + ' Ω';
    }

    setResult({
      resistance,
      formattedValue,
      explanation,
      error: null
    });
  };

  return (
    <div className="p-6">
      <h2 className="text-xl font-semibold mb-6">Resistencias SMD</h2>
      <p className="text-gray-600 mb-6">Decodifica valores de resistencias de montaje superficial</p>
      
      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Código SMD
            </label>
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/[^0-9]/g, ''))}
              placeholder="ej: 103 o 1003"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <button
            onClick={calculate}
            className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
          >
            Calcular Valor
          </button>
        </div>

        <div className="space-y-4">
          {result ? (
            result.error ? (
              <div className="bg-red-50 p-4 rounded-lg">
                <div className="text-sm text-red-600">{result.error}</div>
              </div>
            ) : (
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="text-sm text-blue-600 font-medium">Valor de Resistencia</div>
                <div className="text-2xl font-bold text-blue-900">{result.formattedValue}</div>
                <div className="text-sm text-blue-600">{result.explanation}</div>
              </div>
            )
          ) : (
            <div className="text-center py-12 text-gray-500">
              Ingresa un código SMD
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SMDResistorCodeCalc;
