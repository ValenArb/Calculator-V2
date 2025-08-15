import { useState } from 'react';

const NeutralCurrentCalc = () => {
  const [inputs, setInputs] = useState({
    phaseA: 100,
    phaseB: 80,
    phaseC: 120,
    calculationMode: 'balanced', // balanced, unbalanced
    powerFactor: 0.9
  });
  
  const [result, setResult] = useState(null);

  const calculate = () => {
    const { phaseA, phaseB, phaseC, calculationMode, powerFactor } = inputs;
    
    let neutralCurrent = 0;
    let vectorSum = 0;
    let algebraicSum = 0;
    
    if (calculationMode === 'balanced') {
      // En sistema equilibrado, corriente de neutro es cero
      neutralCurrent = 0;
      vectorSum = 0;
      algebraicSum = phaseA + phaseB + phaseC;
    } else {
      // Sistema desequilibrado - suma vectorial (120° desfase entre fases)
      const ia = phaseA;
      const ib = phaseB;
      const ic = phaseC;
      
      // Componentes rectangulares (asumiendo fase A como referencia)
      const iaX = ia;
      const iaY = 0;
      
      const ibX = ib * Math.cos(-2 * Math.PI / 3); // -120°
      const ibY = ib * Math.sin(-2 * Math.PI / 3);
      
      const icX = ic * Math.cos(2 * Math.PI / 3); // 120°
      const icY = ic * Math.sin(2 * Math.PI / 3);
      
      // Suma vectorial
      const sumX = iaX + ibX + icX;
      const sumY = iaY + ibY + icY;
      
      vectorSum = Math.sqrt(Math.pow(sumX, 2) + Math.pow(sumY, 2));
      neutralCurrent = vectorSum;
      algebraicSum = ia + ib + ic;
    }
    
    setResult({
      neutralCurrent: neutralCurrent.toFixed(2),
      vectorSum: vectorSum.toFixed(2),
      algebraicSum: algebraicSum.toFixed(2),
      systemType: calculationMode === 'balanced' ? 'Equilibrado' : 'Desequilibrado',
      reductionFactor: algebraicSum > 0 ? ((algebraicSum - vectorSum) / algebraicSum * 100).toFixed(1) : 0
    });
  };

  const handleInputChange = (field, value) => {
    setInputs(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="p-6">
      {/* Fórmula */}
      <div className="bg-blue-50 p-4 rounded-lg mb-6 border-l-4 border-blue-500">
        <h3 className="text-lg font-semibold text-blue-900 mb-2">Fórmulas</h3>
        <div className="text-blue-800 font-mono space-y-1">
          <div>I<sub>n</sub> = √[(I<sub>a</sub> + I<sub>b</sub>cos120° + I<sub>c</sub>cos240°)² + (I<sub>b</sub>sin120° + I<sub>c</sub>sin240°)²]</div>
          <div>Sistema equilibrado: I<sub>n</sub> = 0</div>
        </div>
        <div className="text-sm text-blue-700 mt-2">
          I<sub>n</sub> = Corriente neutro, I<sub>a,b,c</sub> = Corrientes de fase
        </div>
      </div>

      <h2 className="text-xl font-semibold mb-6">Cálculo de Corriente en Neutro</h2>
      
      <div className="grid md:grid-cols-2 gap-6">
        {/* Inputs */}
        <div className="space-y-4">
          {/* Tipo de sistema */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tipo de Sistema
            </label>
            <div className="space-y-2">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="calculationMode"
                  value="balanced"
                  checked={inputs.calculationMode === 'balanced'}
                  onChange={(e) => handleInputChange('calculationMode', e.target.value)}
                  className="mr-2"
                />
                <span>• Sistema Equilibrado</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="calculationMode"
                  value="unbalanced"
                  checked={inputs.calculationMode === 'unbalanced'}
                  onChange={(e) => handleInputChange('calculationMode', e.target.value)}
                  className="mr-2"
                />
                <span>• Sistema Desequilibrado</span>
              </label>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Corriente Fase A (A)
            </label>
            <input
              type="number"
              value={inputs.phaseA}
              onChange={(e) => handleInputChange('phaseA', parseFloat(e.target.value) || 0)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Corriente Fase B (A)
            </label>
            <input
              type="number"
              value={inputs.phaseB}
              onChange={(e) => handleInputChange('phaseB', parseFloat(e.target.value) || 0)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Corriente Fase C (A)
            </label>
            <input
              type="number"
              value={inputs.phaseC}
              onChange={(e) => handleInputChange('phaseC', parseFloat(e.target.value) || 0)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <button
            onClick={calculate}
            className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
          >
            Calcular Corriente de Neutro
          </button>
        </div>

        {/* Results */}
        <div className="space-y-4">
          {result ? (
            <>
              <div className="bg-blue-50 p-4 rounded-lg border-2 border-blue-200">
                <div className="text-sm text-blue-600 font-medium">Corriente en Neutro</div>
                <div className="text-3xl font-bold text-blue-900">{result.neutralCurrent} A</div>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="text-sm text-gray-600 font-medium">Suma Vectorial</div>
                <div className="text-xl font-bold text-gray-900">{result.vectorSum} A</div>
              </div>

              <div className="bg-yellow-50 p-4 rounded-lg">
                <div className="text-sm text-yellow-600 font-medium">Suma Algebraica</div>
                <div className="text-xl font-bold text-yellow-900">{result.algebraicSum} A</div>
              </div>

              <div className="bg-green-50 p-4 rounded-lg">
                <div className="text-sm text-green-600 font-medium">Factor de Reducción</div>
                <div className="text-xl font-bold text-green-900">{result.reductionFactor}%</div>
              </div>

              <div className={`p-4 rounded-lg ${
                inputs.calculationMode === 'balanced' ? 'bg-green-100' : 
                parseFloat(result.neutralCurrent) > 50 ? 'bg-red-100' : 'bg-yellow-100'
              }`}>
                <div className={`text-sm font-medium ${
                  inputs.calculationMode === 'balanced' ? 'text-green-700' : 
                  parseFloat(result.neutralCurrent) > 50 ? 'text-red-700' : 'text-yellow-700'
                }`}>
                  Sistema: {result.systemType}
                </div>
                <div className={`text-xs mt-1 ${
                  inputs.calculationMode === 'balanced' ? 'text-green-600' : 
                  parseFloat(result.neutralCurrent) > 50 ? 'text-red-600' : 'text-yellow-600'
                }`}>
                  {inputs.calculationMode === 'balanced' ? 
                    'Corriente de neutro = 0 A' : 
                    parseFloat(result.neutralCurrent) > 50 ? 
                    'Corriente alta - Verificar dimensionado del neutro' :
                    'Corriente aceptable'}
                </div>
              </div>
            </>
          ) : (
            <div className="text-center py-12 text-gray-500">
              Ingresa las corrientes de fase y haz clic en "Calcular"
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NeutralCurrentCalc;
