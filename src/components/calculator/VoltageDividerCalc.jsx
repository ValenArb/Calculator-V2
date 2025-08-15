import { useState } from 'react';

const VoltageDividerCalc = () => {
  const [inputs, setInputs] = useState({
    inputVoltage: 12,
    r1: 1000,
    r2: 2000,
    calcMode: 'voltage', // 'voltage', 'r1', 'r2'
    desiredOutputVoltage: 4
  });
  
  const [result, setResult] = useState(null);

  const calculate = () => {
    const { inputVoltage, r1, r2, calcMode, desiredOutputVoltage } = inputs;
    
    let outputVoltage, current, power1, power2, totalPower, r1Calc, r2Calc;
    
    switch (calcMode) {
      case 'voltage':
        // Calculate output voltage given R1 and R2
        outputVoltage = inputVoltage * (r2 / (r1 + r2));
        current = inputVoltage / (r1 + r2);
        power1 = Math.pow(current, 2) * r1;
        power2 = Math.pow(current, 2) * r2;
        totalPower = power1 + power2;
        r1Calc = r1;
        r2Calc = r2;
        break;
        
      case 'r1':
        // Calculate R1 given desired output voltage and R2
        r2Calc = r2;
        r1Calc = r2 * ((inputVoltage / desiredOutputVoltage) - 1);
        outputVoltage = desiredOutputVoltage;
        current = inputVoltage / (r1Calc + r2Calc);
        power1 = Math.pow(current, 2) * r1Calc;
        power2 = Math.pow(current, 2) * r2Calc;
        totalPower = power1 + power2;
        break;
        
      case 'r2':
        // Calculate R2 given desired output voltage and R1
        r1Calc = r1;
        r2Calc = r1 * (desiredOutputVoltage / (inputVoltage - desiredOutputVoltage));
        outputVoltage = desiredOutputVoltage;
        current = inputVoltage / (r1Calc + r2Calc);
        power1 = Math.pow(current, 2) * r1Calc;
        power2 = Math.pow(current, 2) * r2Calc;
        totalPower = power1 + power2;
        break;
        
      default:
        return;
    }
    
    // Calculate load regulation (assuming 10mA load current)
    const loadCurrent = 0.01; // 10mA
    const theveninResistance = (r1Calc * r2Calc) / (r1Calc + r2Calc);
    const outputVoltageLoaded = outputVoltage - (loadCurrent * theveninResistance);
    const loadRegulation = ((outputVoltage - outputVoltageLoaded) / outputVoltage) * 100;
    
    // Calculate efficiency
    const efficiency = (Math.pow(outputVoltage, 2) / r2Calc) / totalPower * 100;
    
    // Voltage ratio
    const voltageRatio = outputVoltage / inputVoltage;
    const resistanceRatio = r2Calc / r1Calc;
    
    setResult({
      outputVoltage: outputVoltage.toFixed(3),
      current: (current * 1000).toFixed(2), // mA
      power1: power1.toFixed(3),
      power2: power2.toFixed(3),
      totalPower: totalPower.toFixed(3),
      r1Calc: r1Calc.toFixed(0),
      r2Calc: r2Calc.toFixed(0),
      theveninResistance: theveninResistance.toFixed(1),
      outputVoltageLoaded: outputVoltageLoaded.toFixed(3),
      loadRegulation: loadRegulation.toFixed(2),
      efficiency: efficiency.toFixed(1),
      voltageRatio: voltageRatio.toFixed(3),
      resistanceRatio: resistanceRatio.toFixed(3)
    });
  };

  const handleInputChange = (field, value) => {
    setInputs(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="p-6">
      <h2 className="text-xl font-semibold mb-6">Calculadora de Divisor de Tensión</h2>
      
      {/* Formula Section */}
      <div className="mb-6 bg-blue-50 p-4 rounded-lg">
        <h3 className="text-sm font-medium text-blue-900 mb-2">Fórmulas utilizadas:</h3>
        <div className="text-xs text-blue-700 space-y-1">
          <div><strong>Tensión de salida:</strong> Vout = Vin × (R2 / (R1 + R2))</div>
          <div><strong>Corriente:</strong> I = Vin / (R1 + R2)</div>
          <div><strong>Potencia:</strong> P = I² × R</div>
          <div><strong>Resistencia de Thevenin:</strong> Rth = R1 || R2 = (R1 × R2) / (R1 + R2)</div>
          <div className="text-xs mt-2">
            <strong>Donde:</strong> Vin = tensión de entrada, Vout = tensión de salida, R1 = resistencia superior, R2 = resistencia inferior
          </div>
        </div>
      </div>
      
      <div className="grid md:grid-cols-2 gap-6">
        {/* Inputs */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Modo de Cálculo
            </label>
            <div className="space-y-2">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="calcMode"
                  value="voltage"
                  checked={inputs.calcMode === 'voltage'}
                  onChange={(e) => handleInputChange('calcMode', e.target.value)}
                  className="mr-2"
                />
                Calcular tensión de salida
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="calcMode"
                  value="r1"
                  checked={inputs.calcMode === 'r1'}
                  onChange={(e) => handleInputChange('calcMode', e.target.value)}
                  className="mr-2"
                />
                Calcular R1 (para tensión deseada)
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="calcMode"
                  value="r2"
                  checked={inputs.calcMode === 'r2'}
                  onChange={(e) => handleInputChange('calcMode', e.target.value)}
                  className="mr-2"
                />
                Calcular R2 (para tensión deseada)
              </label>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tensión de Entrada (V)
            </label>
            <input
              type="number"
              step="0.1"
              value={inputs.inputVoltage}
              onChange={(e) => handleInputChange('inputVoltage', parseFloat(e.target.value) || 0)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {inputs.calcMode !== 'r1' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Resistencia R1 (Ω)
              </label>
              <input
                type="number"
                value={inputs.r1}
                onChange={(e) => handleInputChange('r1', parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          )}

          {inputs.calcMode !== 'r2' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Resistencia R2 (Ω)
              </label>
              <input
                type="number"
                value={inputs.r2}
                onChange={(e) => handleInputChange('r2', parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          )}

          {inputs.calcMode !== 'voltage' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tensión de Salida Deseada (V)
              </label>
              <input
                type="number"
                step="0.1"
                value={inputs.desiredOutputVoltage}
                onChange={(e) => handleInputChange('desiredOutputVoltage', parseFloat(e.target.value) || 0)}
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

          {/* Circuit Diagram */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-sm font-medium text-gray-900 mb-2">Diagrama del Circuito</h3>
            <div className="text-center">
              <pre className="text-xs font-mono">
{`    Vin
     +
     |
    R1  
     |
     +---- Vout
     |
    R2
     |
     -
   GND`}
              </pre>
            </div>
          </div>
        </div>

        {/* Results */}
        <div className="space-y-4">
          {result ? (
            <div className="space-y-4">
              <div className="bg-green-50 p-4 rounded-lg">
                <div className="text-sm text-green-600 font-medium mb-1">Tensión de Salida</div>
                <div className="text-3xl font-bold text-green-900">{result.outputVoltage} V</div>
              </div>
              
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="text-sm text-blue-600 font-medium mb-1">Corriente del Circuito</div>
                <div className="text-xl font-bold text-blue-900">{result.current} mA</div>
              </div>
              
              <div className="bg-purple-50 p-4 rounded-lg">
                <div className="text-sm text-purple-600 font-medium mb-1">Resistencias Calculadas</div>
                <div className="space-y-1">
                  <div className="text-lg font-bold text-purple-900">R1: {result.r1Calc} Ω</div>
                  <div className="text-lg font-bold text-purple-900">R2: {result.r2Calc} Ω</div>
                </div>
              </div>
              
              <div className="bg-orange-50 p-4 rounded-lg">
                <div className="text-sm text-orange-600 font-medium mb-1">Potencias</div>
                <div className="space-y-1">
                  <div className="text-sm">P1: {result.power1} W</div>
                  <div className="text-sm">P2: {result.power2} W</div>
                  <div className="text-lg font-bold text-orange-900">Total: {result.totalPower} W</div>
                </div>
              </div>
              
              <div className="bg-yellow-50 p-4 rounded-lg">
                <div className="text-sm text-yellow-600 font-medium mb-1">Resistencia de Thevenin</div>
                <div className="text-xl font-bold text-yellow-900">{result.theveninResistance} Ω</div>
              </div>
              
              <div className="bg-indigo-50 p-4 rounded-lg">
                <div className="text-sm text-indigo-600 font-medium mb-1">Regulación de Carga</div>
                <div className="text-lg font-bold text-indigo-900">{result.loadRegulation}%</div>
                <div className="text-xs mt-1">Vout cargado: {result.outputVoltageLoaded} V</div>
              </div>
              
              <div className="bg-red-50 p-4 rounded-lg">
                <div className="text-sm text-red-600 font-medium mb-1">Eficiencia</div>
                <div className="text-xl font-bold text-red-900">{result.efficiency}%</div>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="text-sm text-gray-600 font-medium mb-1">Relaciones</div>
                <div className="space-y-1">
                  <div className="text-sm">Vout/Vin: {result.voltageRatio}</div>
                  <div className="text-sm">R2/R1: {result.resistanceRatio}</div>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              Completa los datos y haz clic en "Calcular"
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VoltageDividerCalc;
