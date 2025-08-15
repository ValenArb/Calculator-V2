import { useState } from 'react';

const CurrentDividerCalc = () => {
  const [inputs, setInputs] = useState({
    totalCurrent: 10,
    resistances: [100, 200, 300],
    calculateMode: 'equal-resistors'
  });
  
  const [result, setResult] = useState(null);

  const calculate = () => {
    const { totalCurrent, resistances } = inputs;
    
    // Filter out zero or negative resistances
    const validResistances = resistances.filter(r => r > 0);
    
    if (validResistances.length < 2) {
      alert('Se necesitan al menos 2 resistencias válidas');
      return;
    }
    
    // Calculate total conductance (1/R)
    const conductances = validResistances.map(r => 1/r);
    const totalConductance = conductances.reduce((sum, g) => sum + g, 0);
    
    // Calculate equivalent resistance
    const equivalentResistance = 1 / totalConductance;
    
    // Calculate current through each resistor using current divider rule
    const branchCurrents = validResistances.map((resistance, index) => {
      const conductance = 1 / resistance;
      return totalCurrent * (conductance / totalConductance);
    });
    
    // Calculate power dissipated in each resistor
    const branchPowers = branchCurrents.map((current, index) => 
      Math.pow(current, 2) * validResistances[index]
    );
    
    const totalPower = branchPowers.reduce((sum, p) => sum + p, 0);
    
    // Calculate voltage across parallel combination (same for all branches)
    const voltage = totalCurrent * equivalentResistance;
    
    // Calculate percentage of total current for each branch
    const currentPercentages = branchCurrents.map(current => 
      (current / totalCurrent) * 100
    );
    
    setResult({
      branchCurrents: branchCurrents.map(i => i.toFixed(3)),
      branchPowers: branchPowers.map(p => p.toFixed(3)),
      currentPercentages: currentPercentages.map(p => p.toFixed(1)),
      equivalentResistance: equivalentResistance.toFixed(2),
      voltage: voltage.toFixed(2),
      totalPower: totalPower.toFixed(3),
      validResistances: validResistances
    });
  };

  const handleInputChange = (field, value) => {
    setInputs(prev => ({ ...prev, [field]: value }));
  };

  const handleResistanceChange = (index, value) => {
    const newResistances = [...inputs.resistances];
    newResistances[index] = parseFloat(value) || 0;
    setInputs(prev => ({ ...prev, resistances: newResistances }));
  };

  const addResistor = () => {
    if (inputs.resistances.length < 6) {
      setInputs(prev => ({
        ...prev,
        resistances: [...prev.resistances, 100]
      }));
    }
  };

  const removeResistor = (index) => {
    if (inputs.resistances.length > 2) {
      const newResistances = inputs.resistances.filter((_, i) => i !== index);
      setInputs(prev => ({ ...prev, resistances: newResistances }));
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-xl font-semibold mb-6">Divisor de Corriente</h2>
      
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Inputs */}
        <div className="lg:col-span-2 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Corriente Total (A)
            </label>
            <input
              type="number"
              step="0.001"
              value={inputs.totalCurrent}
              onChange={(e) => handleInputChange('totalCurrent', parseFloat(e.target.value) || 0)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="text-sm font-medium text-gray-700">
                Resistencias en Paralelo (Ω)
              </label>
              <button
                onClick={addResistor}
                disabled={inputs.resistances.length >= 6}
                className="text-sm bg-green-600 text-white px-2 py-1 rounded hover:bg-green-700 disabled:bg-gray-400"
              >
                + Agregar
              </button>
            </div>
            
            <div className="space-y-2">
              {inputs.resistances.map((resistance, index) => (
                <div key={index} className="flex gap-2 items-center">
                  <span className="text-sm font-medium text-gray-600 w-8">R{index + 1}:</span>
                  <input
                    type="number"
                    step="0.1"
                    value={resistance}
                    onChange={(e) => handleResistanceChange(index, e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  {inputs.resistances.length > 2 && (
                    <button
                      onClick={() => removeResistor(index)}
                      className="text-sm bg-red-600 text-white px-2 py-1 rounded hover:bg-red-700"
                    >
                      ×
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={calculate}
            className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
          >
            Calcular
          </button>
        </div>

        {/* Results */}
        <div className="space-y-4">
          {result ? (
            <>
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="text-sm text-blue-600 font-medium">Tensión Comun</div>
                <div className="text-2xl font-bold text-blue-900">{result.voltage} V</div>
              </div>

              <div className="bg-green-50 p-4 rounded-lg">
                <div className="text-sm text-green-600 font-medium">Resistencia Equivalente</div>
                <div className="text-2xl font-bold text-green-900">{result.equivalentResistance} Ω</div>
              </div>

              <div className="bg-purple-50 p-4 rounded-lg">
                <div className="text-sm text-purple-600 font-medium">Potencia Total</div>
                <div className="text-2xl font-bold text-purple-900">{result.totalPower} W</div>
              </div>

              <div className="bg-gray-50 p-3 rounded-lg">
                <div className="text-sm font-medium text-gray-700 mb-2">Corrientes por Rama</div>
                <div className="space-y-1 text-xs">
                  {result.branchCurrents.map((current, index) => (
                    <div key={index} className="flex justify-between">
                      <span>I{index + 1} (R{index + 1}={result.validResistances[index]}Ω):</span>
                      <span className="font-medium">{current} A ({result.currentPercentages[index]}%)</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-gray-50 p-3 rounded-lg">
                <div className="text-sm font-medium text-gray-700 mb-2">Potencias por Rama</div>
                <div className="space-y-1 text-xs">
                  {result.branchPowers.map((power, index) => (
                    <div key={index} className="flex justify-between">
                      <span>P{index + 1}:</span>
                      <span className="font-medium">{power} W</span>
                    </div>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <div className="text-center py-12 text-gray-500">
              Completa los datos y haz clic en "Calcular"
            </div>
          )}
        </div>
      </div>

      {/* Fórmulas */}
      <div className="mt-8 bg-gray-50 p-4 rounded-lg">
        <h3 className="text-sm font-medium text-gray-900 mb-2">Fórmulas utilizadas:</h3>
        <div className="text-xs text-gray-600 space-y-1">
          <div><strong>Regla del Divisor de Corriente:</strong> Iᵣ = Iₜ × (Gᵣ / Gₜ)</div>
          <div><strong>Conductancia:</strong> G = 1 / R</div>
          <div><strong>Conductancia Total:</strong> Gₜ = G₁ + G₂ + G₃ + ...</div>
          <div><strong>Resistencia Equivalente:</strong> Rᵉᵠ = 1 / Gₜ</div>
          <div><strong>Tensión Comun:</strong> V = Iₜ × Rᵉᵠ</div>
          <div><strong>Potencia:</strong> Pᵣ = Iᵣ² × Rᵣ</div>
        </div>
      </div>
    </div>
  );
};

export default CurrentDividerCalc;
