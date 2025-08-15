import { useState } from 'react';

const MaxCableLengthVoltageDropCalc = () => {
  const [inputs, setInputs] = useState({
    systemType: 'single-phase',
    voltage: 220,
    current: 20,
    conductor: 'copper',
    crossSection: 4,
    voltageDropPercent: 3,
    powerFactor: 0.9,
    frequency: 60
  });
  
  const [result, setResult] = useState(null);

  const calculate = () => {
    const { systemType, voltage, current, conductor, crossSection, voltageDropPercent, powerFactor, frequency } = inputs;
    
    // Resistivity at 20°C (Ω·mm²/m)
    const resistivity = conductor === 'copper' ? 0.0175 : 0.028; // Aluminum
    
    // Resistance per meter
    const resistancePerMeter = resistivity / crossSection; // Ω/m
    
    // Reactance per meter (simplified approximation)
    const reactancePerMeter = frequency === 50 ? 0.08e-3 : 0.1e-3; // Ω/m for typical cables
    
    // Impedance per meter
    const impedancePerMeter = Math.sqrt(
      Math.pow(resistancePerMeter, 2) + Math.pow(reactancePerMeter, 2)
    );
    
    // Maximum allowable voltage drop
    const maxVoltageDrop = (voltage * voltageDropPercent) / 100;
    
    let maxLength;
    
    switch (systemType) {
      case 'single-phase':
        // For single-phase: ΔV = 2 × I × L × (R × cos(φ) + X × sin(φ))
        const sinPhi = Math.sqrt(1 - powerFactor * powerFactor);
        const voltageDropPerMeter = 2 * current * (resistancePerMeter * powerFactor + reactancePerMeter * sinPhi);
        maxLength = maxVoltageDrop / voltageDropPerMeter;
        break;
        
      case 'three-phase':
        // For three-phase: ΔV = √3 × I × L × (R × cos(φ) + X × sin(φ))
        const sinPhiThree = Math.sqrt(1 - powerFactor * powerFactor);
        const voltageDropPerMeterThree = Math.sqrt(3) * current * (resistancePerMeter * powerFactor + reactancePerMeter * sinPhiThree);
        maxLength = maxVoltageDrop / voltageDropPerMeterThree;
        break;
        
      case 'dc':
        // For DC: ΔV = 2 × I × L × R
        const voltageDropPerMeterDC = 2 * current * resistancePerMeter;
        maxLength = maxVoltageDrop / voltageDropPerMeterDC;
        break;
    }
    
    // Additional calculations
    const actualVoltageDrop = systemType === 'dc' ? 
      (2 * current * resistancePerMeter * maxLength) :
      systemType === 'single-phase' ?
      (2 * current * maxLength * (resistancePerMeter * powerFactor + reactancePerMeter * Math.sqrt(1 - powerFactor * powerFactor))) :
      (Math.sqrt(3) * current * maxLength * (resistancePerMeter * powerFactor + reactancePerMeter * Math.sqrt(1 - powerFactor * powerFactor)));
    
    const actualVoltageDropPercent = (actualVoltageDrop / voltage) * 100;
    const resistance = resistancePerMeter * maxLength;
    const powerLoss = systemType === 'three-phase' ? 
      3 * Math.pow(current, 2) * resistance :
      Math.pow(current, 2) * resistance;
    
    setResult({
      maxLength: maxLength.toFixed(1),
      actualVoltageDrop: actualVoltageDrop.toFixed(2),
      actualVoltageDropPercent: actualVoltageDropPercent.toFixed(2),
      resistance: resistance.toFixed(4),
      powerLoss: powerLoss.toFixed(2),
      voltageAtLoad: (voltage - actualVoltageDrop).toFixed(1)
    });
  };

  const handleInputChange = (field, value) => {
    setInputs(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="p-6">
      <h2 className="text-xl font-semibold mb-6">Longitud Máxima de Cable por Caída de Tensión</h2>
      
      {/* Formula Section */}
      <div className="mb-6 bg-blue-50 p-4 rounded-lg">
        <h3 className="text-sm font-medium text-blue-900 mb-2">Fórmulas utilizadas:</h3>
        <div className="text-xs text-blue-700 space-y-1">
          <div><strong>Monofásico:</strong> L_max = ΔV_max / [2 × I × (R × cos(φ) + X × sin(φ))]</div>
          <div><strong>Trifásico:</strong> L_max = ΔV_max / [√3 × I × (R × cos(φ) + X × sin(φ))]</div>
          <div><strong>DC:</strong> L_max = ΔV_max / (2 × I × R)</div>
          <div className="text-xs mt-2">
            <strong>Donde:</strong> L_max = longitud máxima, ΔV_max = caída máxima permitida, I = corriente, R = resistencia/m, X = reactancia/m
          </div>
        </div>
      </div>
      
      <div className="grid md:grid-cols-2 gap-6">
        {/* Inputs */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tipo de Sistema
            </label>
            <div className="space-y-2">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="systemType"
                  value="single-phase"
                  checked={inputs.systemType === 'single-phase'}
                  onChange={(e) => handleInputChange('systemType', e.target.value)}
                  className="mr-2"
                />
                Monofásico AC
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="systemType"
                  value="three-phase"
                  checked={inputs.systemType === 'three-phase'}
                  onChange={(e) => handleInputChange('systemType', e.target.value)}
                  className="mr-2"
                />
                Trifásico AC
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="systemType"
                  value="dc"
                  checked={inputs.systemType === 'dc'}
                  onChange={(e) => handleInputChange('systemType', e.target.value)}
                  className="mr-2"
                />
                DC
              </label>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tipo de Conductor
            </label>
            <div className="flex gap-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="conductor"
                  value="copper"
                  checked={inputs.conductor === 'copper'}
                  onChange={(e) => handleInputChange('conductor', e.target.value)}
                  className="mr-2"
                />
                Cobre
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="conductor"
                  value="aluminum"
                  checked={inputs.conductor === 'aluminum'}
                  onChange={(e) => handleInputChange('conductor', e.target.value)}
                  className="mr-2"
                />
                Aluminio
              </label>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tensión Nominal (V)
            </label>
            <input
              type="number"
              value={inputs.voltage}
              onChange={(e) => handleInputChange('voltage', parseFloat(e.target.value) || 0)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Corriente de Carga (A)
            </label>
            <input
              type="number"
              value={inputs.current}
              onChange={(e) => handleInputChange('current', parseFloat(e.target.value) || 0)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Sección del Conductor (mm²)
            </label>
            <input
              type="number"
              value={inputs.crossSection}
              onChange={(e) => handleInputChange('crossSection', parseFloat(e.target.value) || 0)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Caída de Tensión Máxima (%)
            </label>
            <input
              type="number"
              step="0.1"
              value={inputs.voltageDropPercent}
              onChange={(e) => handleInputChange('voltageDropPercent', parseFloat(e.target.value) || 0)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {inputs.systemType !== 'dc' && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Factor de Potencia
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  max="1"
                  value={inputs.powerFactor}
                  onChange={(e) => handleInputChange('powerFactor', parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Frecuencia (Hz)
                </label>
                <input
                  type="number"
                  value={inputs.frequency}
                  onChange={(e) => handleInputChange('frequency', parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </>
          )}

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
              <div className="bg-green-50 p-4 rounded-lg">
                <div className="text-sm text-green-600 font-medium">Longitud máxima calculada del cable</div>
                <div className="text-2xl font-bold text-green-900">{result.maxLength} m</div>
                <div className="text-xs text-green-700 mt-1">{(result.maxLength / 1000).toFixed(3)} km</div>
              </div>

              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="text-sm text-blue-600 font-medium">Caída de tensión real en la longitud calculada</div>
                <div className="text-xl font-bold text-blue-900">
                  {result.actualVoltageDrop} V ({result.actualVoltageDropPercent}%)
                </div>
              </div>

              <div className="bg-orange-50 p-4 rounded-lg">
                <div className="text-sm text-orange-600 font-medium">Resistencia total del conductor</div>
                <div className="text-xl font-bold text-orange-900">{result.totalResistance} Ω</div>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="text-sm text-gray-600 font-medium mb-2">Información del Cálculo</div>
                <div className="text-xs text-gray-600 space-y-1">
                  <div>• Tipo: {result.systemType.replace('-', ' ').replace('continuous', 'Continua').replace('ac', 'AC').replace('single phase', 'Monofásico').replace('two phase', 'Bifásico').replace('three phase', 'Trifásico')}</div>
                  <div>• Material: {result.conductor === 'copper' ? 'Cobre' : 'Aluminio'}</div>
                  <div>• Calibre: {result.caliber} mm²</div>
                  <div>• Conductores en paralelo: {result.parallelConductors}</div>
                  <div>• Tipo de cable: {result.cableType === 'unipolar' ? 'Unipolar' : 'Multipolar'}</div>
                  <div>• Corriente calculada: {result.current} A</div>
                  <div>• Resistencia por km: {result.resistancePerKm} Ω/km @ {result.tempInC}°C</div>
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

      {/* Fórmulas utilizadas */}
      <div className="mt-8 bg-blue-50 p-4 rounded-lg border-l-4 border-blue-500">
        <h3 className="text-lg font-semibold text-blue-900 mb-2">Fórmulas utilizadas</h3>
        <div className="text-blue-800 font-mono space-y-2 text-sm">
          {result && (
            <>
              <div><strong>Fórmula aplicada:</strong> {result.formula}</div>
              <div className="text-xs text-blue-700 mt-2">
                <strong>Donde:</strong> L_max = longitud máxima, ΔV_max = caída de tensión máxima, I = corriente, R = resistencia/m, cos φ = factor de potencia
              </div>
            </>
          )}
          {!result && (
            <>
              <div><strong>Continua:</strong> L_max = ΔV_max / (2 × I × R)</div>
              <div><strong>Alterna monofásica:</strong> L_max = ΔV_max / (2 × I × R × cos φ)</div>
              <div><strong>Alterna bifásica:</strong> L_max = ΔV_max / (2 × I × R × cos φ)</div>
              <div><strong>Alterna trifásica:</strong> L_max = ΔV_max / (√3 × I × R × cos φ)</div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default MaxCableLengthVoltageDropCalc;
