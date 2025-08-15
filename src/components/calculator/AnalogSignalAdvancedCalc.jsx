import { useState } from 'react';

const AnalogSignalAdvancedCalc = () => {
  const [inputs, setInputs] = useState({
    inputRangeType: 'custom',
    inputMin: 0,
    inputMax: 10,
    inputValue: 5,
    outputRangeType: 'custom',
    outputMin: 0,
    outputMax: 100,
    targetOutputValue: ''
  });

  const [result, setResult] = useState(null);

  // Rangos estándar predefinidos
  const standardRanges = {
    '0-10V': { min: 0, max: 10, unit: 'V', description: '0-10V (estándar industrial)' },
    '0-5V': { min: 0, max: 5, unit: 'V', description: '0-5V (estándar analógico)' },
    '4-20mA': { min: 4, max: 20, unit: 'mA', description: '4-20mA (lazo de corriente)' },
    '0-20mA': { min: 0, max: 20, unit: 'mA', description: '0-20mA (corriente)' },
    '0-100%': { min: 0, max: 100, unit: '%', description: '0-100% (porcentaje)' },
    '0-1023': { min: 0, max: 1023, unit: 'counts', description: '0-1023 (ADC 10-bit)' },
    '0-4095': { min: 0, max: 4095, unit: 'counts', description: '0-4095 (ADC 12-bit)' },
    '-10+10V': { min: -10, max: 10, unit: 'V', description: '±10V (bipolar)' },
    '1-5V': { min: 1, max: 5, unit: 'V', description: '1-5V (sensor estándar)' }
  };

  const calculate = () => {
    const { inputRangeType, inputMin, inputMax, inputValue, outputRangeType, outputMin, outputMax, targetOutputValue } = inputs;

    // Determinar rangos efectivos
    let effectiveInputMin, effectiveInputMax;
    let effectiveOutputMin, effectiveOutputMax;

    if (inputRangeType === 'custom') {
      effectiveInputMin = inputMin;
      effectiveInputMax = inputMax;
    } else {
      const range = standardRanges[inputRangeType];
      effectiveInputMin = range.min;
      effectiveInputMax = range.max;
    }

    if (outputRangeType === 'custom') {
      effectiveOutputMin = outputMin;
      effectiveOutputMax = outputMax;
    } else {
      const range = standardRanges[outputRangeType];
      effectiveOutputMin = range.min;
      effectiveOutputMax = range.max;
    }

    // Verificar rangos válidos
    if (effectiveInputMin >= effectiveInputMax) {
      setResult({
        error: 'El rango de entrada es inválido (mín >= máx)'
      });
      return;
    }

    if (effectiveOutputMin >= effectiveOutputMax) {
      setResult({
        error: 'El rango de salida es inválido (mín >= máx)'
      });
      return;
    }

    // Calcular conversión lineal
    // Formula: Output = OutputMin + (Input - InputMin) * (OutputMax - OutputMin) / (InputMax - InputMin)
    
    const inputRange = effectiveInputMax - effectiveInputMin;
    const outputRange = effectiveOutputMax - effectiveOutputMin;
    const scaleFactor = outputRange / inputRange;

    // Conversión directa (input -> output)
    const convertedValue = effectiveOutputMin + (inputValue - effectiveInputMin) * scaleFactor;

    // Conversión inversa (output -> input) si se proporciona un valor objetivo
    let reverseConvertedValue = null;
    if (targetOutputValue !== '' && !isNaN(parseFloat(targetOutputValue))) {
      const targetOutput = parseFloat(targetOutputValue);
      reverseConvertedValue = effectiveInputMin + (targetOutput - effectiveOutputMin) / scaleFactor;
    }

    // Calcular porcentaje del rango
    const inputPercentage = ((inputValue - effectiveInputMin) / inputRange) * 100;
    const outputPercentage = ((convertedValue - effectiveOutputMin) / outputRange) * 100;

    // Verificar si el valor está dentro del rango
    const inputInRange = inputValue >= effectiveInputMin && inputValue <= effectiveInputMax;
    const outputInRange = convertedValue >= effectiveOutputMin && convertedValue <= effectiveOutputMax;

    // Análisis del tipo de conversión
    let conversionAnalysis = [];
    let recommendations = [];

    // Análisis de rangos
    if (inputRangeType === '4-20mA') {
      conversionAnalysis.push('Lazo de corriente 4-20mA - protocolo industrial estándar');
      conversionAnalysis.push('Valor 4mA = 0% escala, 20mA = 100% escala');
      if (inputValue < 4) {
        conversionAnalysis.push('Valor por debajo de 4mA indica falla de sensor o cable roto');
      }
    }

    if (inputRangeType === '0-10V' || outputRangeType === '0-10V') {
      conversionAnalysis.push('Estándar 0-10V común en sistemas de control industrial');
    }

    if (inputRangeType === '0-100%' || outputRangeType === '0-100%') {
      conversionAnalysis.push('Conversión a porcentaje para interfaz de usuario');
    }

    if (inputRangeType.includes('ADC') || outputRangeType.includes('ADC')) {
      conversionAnalysis.push('Conversión ADC - valor digital de sensor analógico');
    }

    // Recomendaciones según el tipo de conversión
    if (Math.abs(scaleFactor) < 0.001) {
      recommendations.push('Factor de escala muy pequeño - verificar precisión numérica');
    }

    if (Math.abs(scaleFactor) > 1000) {
      recommendations.push('Factor de escala muy grande - considerar normalización');
    }

    if (!inputInRange) {
      recommendations.push('Valor de entrada fuera del rango especificado');
    }

    if (inputRangeType === '4-20mA' && outputRangeType === '0-100%') {
      recommendations.push('Conversión estándar industrial - usar fórmula: % = (I-4)*100/16');
    }

    if (inputRangeType.includes('±') || effectiveInputMin < 0) {
      conversionAnalysis.push('Señal bipolar - requiere manejo de valores negativos');
    }

    // Calcular precisión y resolución
    let resolution = '';
    let precision = '';

    if (inputRangeType.includes('1023')) {
      resolution = '10 bits';
      precision = (inputRange / 1024).toFixed(4);
    } else if (inputRangeType.includes('4095')) {
      resolution = '12 bits';
      precision = (inputRange / 4096).toFixed(4);
    } else {
      precision = (inputRange / 1000).toFixed(4); // Asumir 1000 pasos
    }

    // Cálculos adicionales
    const deadband = Math.abs(effectiveInputMax - effectiveInputMin) * 0.001; // 0.1% deadband típico
    const hysteresis = Math.abs(effectiveOutputMax - effectiveOutputMin) * 0.005; // 0.5% hysteresis típico

    setResult({
      convertedValue: convertedValue.toFixed(4),
      reverseConvertedValue: reverseConvertedValue ? reverseConvertedValue.toFixed(4) : null,
      scaleFactor: scaleFactor.toFixed(6),
      offset: effectiveOutputMin.toFixed(4),
      inputPercentage: inputPercentage.toFixed(2),
      outputPercentage: outputPercentage.toFixed(2),
      inputInRange: inputInRange,
      outputInRange: outputInRange,
      effectiveInputRange: `${effectiveInputMin} - ${effectiveInputMax}`,
      effectiveOutputRange: `${effectiveOutputMin} - ${effectiveOutputMax}`,
      inputRangeSpan: inputRange.toFixed(4),
      outputRangeSpan: outputRange.toFixed(4),
      conversionAnalysis: conversionAnalysis,
      recommendations: recommendations,
      precision: precision,
      resolution: resolution,
      deadband: deadband.toFixed(4),
      hysteresis: hysteresis.toFixed(4),
      inputRangeType: inputRangeType,
      outputRangeType: outputRangeType,
      linearEquation: `Y = ${effectiveOutputMin.toFixed(2)} + ${scaleFactor.toFixed(4)} × (X - ${effectiveInputMin.toFixed(2)})`
    });
  };

  const handleInputChange = (field, value) => {
    setInputs(prev => ({ ...prev, [field]: value }));
    
    // Auto-update range values when standard range is selected
    if (field === 'inputRangeType' && value !== 'custom') {
      const range = standardRanges[value];
      setInputs(prev => ({
        ...prev,
        inputMin: range.min,
        inputMax: range.max
      }));
    }
    
    if (field === 'outputRangeType' && value !== 'custom') {
      const range = standardRanges[value];
      setInputs(prev => ({
        ...prev,
        outputMin: range.min,
        outputMax: range.max
      }));
    }
  };

  const getRangeLabel = (rangeType) => {
    return standardRanges[rangeType]?.description || 'Personalizado';
  };

  const getRangeUnit = (rangeType) => {
    return standardRanges[rangeType]?.unit || '';
  };

  return (
    <div className="p-6">
      <h2 className="text-xl font-semibold mb-6">Valores de Señal Analógica (Conversión entre rangos)</h2>
      
      <div className="grid md:grid-cols-2 gap-6">
        {/* Inputs */}
        <div className="space-y-4">
          {/* Rango de entrada */}
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="text-sm font-semibold text-blue-900 mb-3">Rango de entrada</h3>
            
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Tipo de rango
                </label>
                <select
                  value={inputs.inputRangeType}
                  onChange={(e) => handleInputChange('inputRangeType', e.target.value)}
                  className="w-full px-2 py-1 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="custom">Personalizado</option>
                  {Object.entries(standardRanges).map(([key, range]) => (
                    <option key={key} value={key}>{range.description}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Mínimo
                  </label>
                  <input
                    type="number"
                    value={inputs.inputMin}
                    onChange={(e) => handleInputChange('inputMin', parseFloat(e.target.value) || 0)}
                    disabled={inputs.inputRangeType !== 'custom'}
                    className="w-full px-2 py-1 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Máximo
                  </label>
                  <input
                    type="number"
                    value={inputs.inputMax}
                    onChange={(e) => handleInputChange('inputMax', parseFloat(e.target.value) || 0)}
                    disabled={inputs.inputRangeType !== 'custom'}
                    className="w-full px-2 py-1 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Valor
                  </label>
                  <input
                    type="number"
                    value={inputs.inputValue}
                    onChange={(e) => handleInputChange('inputValue', parseFloat(e.target.value) || 0)}
                    className="w-full px-2 py-1 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Rango de salida */}
          <div className="bg-green-50 p-4 rounded-lg">
            <h3 className="text-sm font-semibold text-green-900 mb-3">Rango de salida</h3>
            
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Tipo de rango
                </label>
                <select
                  value={inputs.outputRangeType}
                  onChange={(e) => handleInputChange('outputRangeType', e.target.value)}
                  className="w-full px-2 py-1 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="custom">Personalizado</option>
                  {Object.entries(standardRanges).map(([key, range]) => (
                    <option key={key} value={key}>{range.description}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Mínimo
                  </label>
                  <input
                    type="number"
                    value={inputs.outputMin}
                    onChange={(e) => handleInputChange('outputMin', parseFloat(e.target.value) || 0)}
                    disabled={inputs.outputRangeType !== 'custom'}
                    className="w-full px-2 py-1 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Máximo
                  </label>
                  <input
                    type="number"
                    value={inputs.outputMax}
                    onChange={(e) => handleInputChange('outputMax', parseFloat(e.target.value) || 0)}
                    disabled={inputs.outputRangeType !== 'custom'}
                    className="w-full px-2 py-1 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Valor objetivo (conversión inversa)
                </label>
                <input
                  type="number"
                  value={inputs.targetOutputValue}
                  onChange={(e) => handleInputChange('targetOutputValue', e.target.value)}
                  placeholder="Opcional"
                  className="w-full px-2 py-1 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          <button
            onClick={calculate}
            className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
          >
            Calcular Conversión
          </button>
        </div>

        {/* Results */}
        <div className="space-y-4">
          {result ? (
            result.error ? (
              <div className="bg-red-50 p-4 rounded-lg">
                <div className="text-sm text-red-600 font-medium">Error</div>
                <div className="text-red-800">{result.error}</div>
              </div>
            ) : (
              <>
                <div className="bg-green-50 p-4 rounded-lg">
                  <div className="text-sm text-green-600 font-medium">Valor convertido</div>
                  <div className="text-2xl font-bold text-green-900">{result.convertedValue} {getRangeUnit(result.outputRangeType)}</div>
                  <div className="text-xs text-green-700 mt-1">{result.outputPercentage}% del rango de salida</div>
                </div>

                {result.reverseConvertedValue && (
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <div className="text-sm text-blue-600 font-medium">Conversión inversa</div>
                    <div className="text-xl font-bold text-blue-900">{result.reverseConvertedValue} {getRangeUnit(result.inputRangeType)}</div>
                    <div className="text-xs text-blue-700 mt-1">Valor de entrada para el objetivo</div>
                  </div>
                )}

                <div className="bg-yellow-50 p-4 rounded-lg">
                  <div className="text-sm text-yellow-600 font-medium">Factor de escala</div>
                  <div className="text-xl font-bold text-yellow-900">{result.scaleFactor}</div>
                  <div className="text-xs text-yellow-700 mt-1">Offset: {result.offset}</div>
                </div>

                <div className="bg-purple-50 p-4 rounded-lg">
                  <div className="text-sm text-purple-600 font-medium mb-2">Estado del valor</div>
                  <div className="space-y-1">
                    <div className="flex justify-between items-center">
                      <span className="text-xs">Entrada en rango:</span>
                      <span className={`text-sm font-bold ${result.inputInRange ? 'text-green-700' : 'text-red-700'}`}>
                        {result.inputInRange ? '✓ Sí' : '✗ No'}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs">Salida en rango:</span>
                      <span className={`text-sm font-bold ${result.outputInRange ? 'text-green-700' : 'text-red-700'}`}>
                        {result.outputInRange ? '✓ Sí' : '✗ No'}
                      </span>
                    </div>
                    <div className="text-xs text-purple-700 mt-2">
                      Entrada: {result.inputPercentage}% del rango
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="text-sm text-gray-600 font-medium mb-2">Parámetros de conversión</div>
                  <div className="text-xs text-gray-600 space-y-1">
                    <div>• Rango entrada: {result.effectiveInputRange}</div>
                    <div>• Rango salida: {result.effectiveOutputRange}</div>
                    <div>• Span entrada: {result.inputRangeSpan}</div>
                    <div>• Span salida: {result.outputRangeSpan}</div>
                    {result.precision && <div>• Precisión: {result.precision} unidades/paso</div>}
                    {result.resolution && <div>• Resolución: {result.resolution}</div>}
                  </div>
                </div>

                <div className="bg-indigo-50 p-4 rounded-lg">
                  <div className="text-sm text-indigo-600 font-medium mb-2">Ecuación lineal</div>
                  <div className="text-sm font-mono text-indigo-800 bg-white p-2 rounded border">
                    {result.linearEquation}
                  </div>
                </div>

                {result.conversionAnalysis.length > 0 && (
                  <div className="bg-teal-50 p-4 rounded-lg">
                    <div className="text-sm text-teal-600 font-medium mb-2">Análisis de conversión</div>
                    <ul className="text-xs text-teal-700 space-y-1">
                      {result.conversionAnalysis.map((analysis, index) => (
                        <li key={index}>• {analysis}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {result.recommendations.length > 0 && (
                  <div className="bg-red-50 p-4 rounded-lg">
                    <div className="text-sm text-red-600 font-medium mb-2">Recomendaciones</div>
                    <ul className="text-xs text-red-700 space-y-1">
                      {result.recommendations.map((rec, index) => (
                        <li key={index}>• {rec}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </>
            )
          ) : (
            <div className="text-center py-12 text-gray-500">
              Configura los rangos y haz clic en "Calcular Conversión"
            </div>
          )}
        </div>
      </div>

      {/* Fórmulas utilizadas */}
      <div className="mt-8 bg-blue-50 p-4 rounded-lg border-l-4 border-blue-500">
        <h3 className="text-lg font-semibold text-blue-900 mb-2">Fórmulas utilizadas</h3>
        <div className="text-blue-800 font-mono space-y-2 text-sm">
          <div><strong>Conversión lineal:</strong> Y = Y_min + (X - X_min) × (Y_max - Y_min) / (X_max - X_min)</div>
          <div><strong>Factor de escala:</strong> K = (Y_max - Y_min) / (X_max - X_min)</div>
          <div><strong>Conversión inversa:</strong> X = X_min + (Y - Y_min) / K</div>
          <div><strong>Porcentaje de rango:</strong> % = (Valor - Min) × 100 / (Max - Min)</div>
          <div><strong>4-20mA a %:</strong> % = (I - 4) × 100 / 16</div>
          <div><strong>Resolución ADC:</strong> Resolución = Rango_analógico / 2^bits</div>
          <div className="text-xs text-blue-700 mt-2">
            <strong>Donde:</strong> X = entrada, Y = salida, K = factor escala, I = corriente (mA)
          </div>
          <div className="text-xs text-blue-700">
            <strong>Estándares:</strong> 4-20mA (industrial), 0-10V (control), 0-5V (sensores), ±10V (bipolar)
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalogSignalAdvancedCalc;