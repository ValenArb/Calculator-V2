import { useState } from 'react';

const ShortCircuitTransformerCalc = () => {
  const [inputs, setInputs] = useState({
    networkShortCircuitPower: 500, // MVA
    primaryVoltage: 13.2, // kV
    secondaryVoltage: 400, // V
    transformerPower: 630, // kVA
    shortCircuitVoltage: 6, // %
    jouleLosse: 7, // kW
    mediumVoltageLlineLength: 2, // km
    lengthUnit: 'km',
    lineType: 'overhead',
    mediumVoltageCableSize: 50, // mm²
    mediumVoltageConductorsParallel: 1,
    mediumVoltageConductor: 'copper',
    lowVoltageLlineLength: 50, // m
    lowVoltageLengthUnit: 'm',
    lowVoltageCableSize: 95, // mm²
    lowVoltageConductorsParallel: 1,
    lowVoltageConductor: 'copper'
  });

  const [result, setResult] = useState(null);

  // Resistividades en Ω·mm²/m a 20°C
  const resistivity = {
    copper: 0.0175,
    aluminum: 0.028
  };

  // Reactancias típicas para líneas de media tensión (mΩ/m)
  const mvReactance = {
    overhead: 0.4, // línea aérea
    underground: 0.12 // línea subterránea
  };

  const standardSections = [10, 16, 25, 35, 50, 70, 95, 120, 150, 185, 240, 300, 400, 500];

  const calculate = () => {
    const {
      networkShortCircuitPower, primaryVoltage, secondaryVoltage, transformerPower,
      shortCircuitVoltage, jouleLosse, mediumVoltageLlineLength, lengthUnit,
      lineType, mediumVoltageCableSize, mediumVoltageConductorsParallel, mediumVoltageConductor,
      lowVoltageLlineLength, lowVoltageLengthUnit, lowVoltageCableSize,
      lowVoltageConductorsParallel, lowVoltageConductor
    } = inputs;

    // Convertir longitudes a metros
    const mvLengthInM = lengthUnit === 'km' ? mediumVoltageLlineLength * 1000 : mediumVoltageLlineLength;
    const lvLengthInM = lowVoltageLengthUnit === 'km' ? lowVoltageLlineLength * 1000 : lowVoltageLlineLength;

    // 1. Impedancia de la red (referida al secundario del transformador)
    const networkImpedanceSecondary = (secondaryVoltage * secondaryVoltage) / (networkShortCircuitPower * 1000 * 1000); // Ω

    // 2. Impedancia del transformador
    const transformerResistance = (jouleLosse * secondaryVoltage * secondaryVoltage) / (transformerPower * transformerPower); // Ω
    const transformerReactance = Math.sqrt(
      Math.pow((shortCircuitVoltage / 100) * (secondaryVoltage * secondaryVoltage) / (transformerPower * 1000), 2) - 
      Math.pow(transformerResistance, 2)
    ); // Ω
    const transformerImpedance = Math.sqrt(transformerResistance * transformerResistance + transformerReactance * transformerReactance);

    // 3. Impedancia de la línea de media tensión (referida al secundario)
    const mvResistancePerM = resistivity[mediumVoltageConductor] / (mediumVoltageCableSize * mediumVoltageConductorsParallel);
    const mvReactancePerM = mvReactance[lineType] / 1000 / mediumVoltageConductorsParallel; // Ω/m
    
    const mvResistancePrimary = mvResistancePerM * mvLengthInM; // Ω en primario
    const mvReactancePrimary = mvReactancePerM * mvLengthInM; // Ω en primario
    
    // Referir al secundario
    const transformationRatio = primaryVoltage * 1000 / secondaryVoltage;
    const mvResistanceSecondary = mvResistancePrimary / (transformationRatio * transformationRatio);
    const mvReactanceSecondary = mvReactancePrimary / (transformationRatio * transformationRatio);
    const mvImpedanceSecondary = Math.sqrt(mvResistanceSecondary * mvResistanceSecondary + mvReactanceSecondary * mvReactanceSecondary);

    // 4. Impedancia total hasta el secundario del transformador
    const totalResistanceAtTransformer = networkImpedanceSecondary * 0.1 + transformerResistance + mvResistanceSecondary; // Asumir factor de potencia de red = 0.1
    const totalReactanceAtTransformer = networkImpedanceSecondary * 0.995 + transformerReactance + mvReactanceSecondary; // sen(acos(0.1))
    const totalImpedanceAtTransformer = Math.sqrt(totalResistanceAtTransformer * totalResistanceAtTransformer + totalReactanceAtTransformer * totalReactanceAtTransformer);

    // 5. Corriente de cortocircuito en el secundario del transformador
    const shortCircuitCurrentAtTransformer = (secondaryVoltage / Math.sqrt(3)) / totalImpedanceAtTransformer; // A
    const shortCircuitPowerAtTransformer = Math.sqrt(3) * secondaryVoltage * shortCircuitCurrentAtTransformer / 1000; // kW

    // 6. Impedancia de la línea de baja tensión
    const lvResistancePerM = resistivity[lowVoltageConductor] / (lowVoltageCableSize * lowVoltageConductorsParallel);
    const lvReactancePerM = 0.08e-3 / lowVoltageConductorsParallel; // Reactancia típica para BT en Ω/m
    
    const lvResistance = lvResistancePerM * lvLengthInM;
    const lvReactance = lvReactancePerM * lvLengthInM;
    const lvImpedance = Math.sqrt(lvResistance * lvResistance + lvReactance * lvReactance);

    // 7. Impedancia total hasta el punto de falla
    const totalResistanceAtFault = totalResistanceAtTransformer + lvResistance;
    const totalReactanceAtFault = totalReactanceAtTransformer + lvReactance;
    const totalImpedanceAtFault = Math.sqrt(totalResistanceAtFault * totalResistanceAtFault + totalReactanceAtFault * totalReactanceAtFault);

    // 8. Corriente de cortocircuito en el punto de falla
    const shortCircuitCurrentAtFault = (secondaryVoltage / Math.sqrt(3)) / totalImpedanceAtFault; // A
    const shortCircuitPowerAtFault = Math.sqrt(3) * secondaryVoltage * shortCircuitCurrentAtFault / 1000; // kW

    // Factor de potencia en cada punto
    const powerFactorAtTransformer = totalResistanceAtTransformer / totalImpedanceAtTransformer;
    const powerFactorAtFault = totalResistanceAtFault / totalImpedanceAtFault;

    setResult({
      // En el secundario del transformador
      shortCircuitCurrentAtTransformer: (shortCircuitCurrentAtTransformer / 1000).toFixed(3), // kA
      totalImpedanceAtTransformer: totalImpedanceAtTransformer.toFixed(4),
      shortCircuitPowerAtTransformer: shortCircuitPowerAtTransformer.toFixed(1),
      powerFactorAtTransformer: powerFactorAtTransformer.toFixed(3),
      
      // En el punto de falla
      shortCircuitCurrentAtFault: (shortCircuitCurrentAtFault / 1000).toFixed(3), // kA
      totalImpedanceAtFault: totalImpedanceAtFault.toFixed(4),
      shortCircuitPowerAtFault: shortCircuitPowerAtFault.toFixed(1),
      powerFactorAtFault: powerFactorAtFault.toFixed(3),
      
      // Impedancias individuales
      networkImpedanceSecondary: networkImpedanceSecondary.toFixed(4),
      transformerImpedance: transformerImpedance.toFixed(4),
      transformerResistance: transformerResistance.toFixed(4),
      transformerReactance: transformerReactance.toFixed(4),
      mvImpedanceSecondary: mvImpedanceSecondary.toFixed(4),
      lvImpedance: lvImpedance.toFixed(4),
      
      // Parámetros de entrada
      networkShortCircuitPower: networkShortCircuitPower,
      transformerPower: transformerPower,
      secondaryVoltage: secondaryVoltage,
      primaryVoltage: primaryVoltage,
      mvLengthInM: mvLengthInM,
      lvLengthInM: lvLengthInM,
      transformationRatio: transformationRatio.toFixed(2),
      mediumVoltageConductor: mediumVoltageConductor,
      lowVoltageConductor: lowVoltageConductor,
      lineType: lineType
    });
  };

  const handleInputChange = (field, value) => {
    setInputs(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="p-6">
      <h2 className="text-xl font-semibold mb-6">Corriente de Cortocircuito con Subestación Transformadora</h2>
      
      <div className="grid md:grid-cols-2 gap-6">
        {/* Inputs */}
        <div className="space-y-4 max-h-96 overflow-y-auto">
          {/* Parámetros de la red */}
          <div className="bg-blue-50 p-3 rounded-lg">
            <h3 className="text-sm font-semibold text-blue-900 mb-2">Parámetros de la Red</h3>
            
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Potencia de cortocircuito en red
                </label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    value={inputs.networkShortCircuitPower}
                    onChange={(e) => handleInputChange('networkShortCircuitPower', parseFloat(e.target.value) || 0)}
                    className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <span className="px-2 py-1 text-xs bg-gray-100 border border-gray-300 rounded-md text-gray-700">MVA</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Voltaje primario
                </label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    value={inputs.primaryVoltage}
                    onChange={(e) => handleInputChange('primaryVoltage', parseFloat(e.target.value) || 0)}
                    className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <span className="px-2 py-1 text-xs bg-gray-100 border border-gray-300 rounded-md text-gray-700">kV</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Voltaje secundario
                </label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    value={inputs.secondaryVoltage}
                    onChange={(e) => handleInputChange('secondaryVoltage', parseFloat(e.target.value) || 0)}
                    className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <span className="px-2 py-1 text-xs bg-gray-100 border border-gray-300 rounded-md text-gray-700">V</span>
                </div>
              </div>
            </div>
          </div>

          {/* Parámetros del transformador */}
          <div className="bg-green-50 p-3 rounded-lg">
            <h3 className="text-sm font-semibold text-green-900 mb-2">Transformador</h3>
            
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Potencia del transformador
                </label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    value={inputs.transformerPower}
                    onChange={(e) => handleInputChange('transformerPower', parseFloat(e.target.value) || 0)}
                    className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <span className="px-2 py-1 text-xs bg-gray-100 border border-gray-300 rounded-md text-gray-700">kVA</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Tensión de cortocircuito
                </label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    value={inputs.shortCircuitVoltage}
                    onChange={(e) => handleInputChange('shortCircuitVoltage', parseFloat(e.target.value) || 0)}
                    className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <span className="px-2 py-1 text-xs bg-gray-100 border border-gray-300 rounded-md text-gray-700">%</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Pérdidas por efecto Joule
                </label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    value={inputs.jouleLosse}
                    onChange={(e) => handleInputChange('jouleLosse', parseFloat(e.target.value) || 0)}
                    className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <span className="px-2 py-1 text-xs bg-gray-100 border border-gray-300 rounded-md text-gray-700">kW</span>
                </div>
              </div>
            </div>
          </div>

          {/* Línea de media tensión */}
          <div className="bg-orange-50 p-3 rounded-lg">
            <h3 className="text-sm font-semibold text-orange-900 mb-2">Línea de Media Tensión</h3>
            
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Longitud de la línea de media tensión
                </label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    value={inputs.mediumVoltageLlineLength}
                    onChange={(e) => handleInputChange('mediumVoltageLlineLength', parseFloat(e.target.value) || 0)}
                    className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <select
                    value={inputs.lengthUnit}
                    onChange={(e) => handleInputChange('lengthUnit', e.target.value)}
                    className="px-2 py-1 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="m">m</option>
                    <option value="km">km</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Tipo de línea
                </label>
                <select
                  value={inputs.lineType}
                  onChange={(e) => handleInputChange('lineType', e.target.value)}
                  className="w-full px-2 py-1 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="overhead">Línea aérea</option>
                  <option value="underground">Línea subterránea</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Tamaño del cable de media tensión
                </label>
                <div className="flex gap-2">
                  <select
                    value={inputs.mediumVoltageCableSize}
                    onChange={(e) => handleInputChange('mediumVoltageCableSize', parseFloat(e.target.value))}
                    className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {standardSections.map(section => (
                      <option key={section} value={section}>{section}</option>
                    ))}
                  </select>
                  <span className="px-2 py-1 text-xs bg-gray-100 border border-gray-300 rounded-md text-gray-700">mm²</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Conductores de media tensión en paralelo
                </label>
                <select
                  value={inputs.mediumVoltageConductorsParallel}
                  onChange={(e) => handleInputChange('mediumVoltageConductorsParallel', parseInt(e.target.value))}
                  className="w-full px-2 py-1 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {[1, 2, 3, 4, 5, 6].map(num => (
                    <option key={num} value={num}>{num}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Conductor
                </label>
                <select
                  value={inputs.mediumVoltageConductor}
                  onChange={(e) => handleInputChange('mediumVoltageConductor', e.target.value)}
                  className="w-full px-2 py-1 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="copper">Cobre</option>
                  <option value="aluminum">Aluminio</option>
                </select>
              </div>
            </div>
          </div>

          {/* Línea de baja tensión */}
          <div className="bg-purple-50 p-3 rounded-lg">
            <h3 className="text-sm font-semibold text-purple-900 mb-2">Línea de Baja Tensión</h3>
            
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Longitud de la línea de baja tensión
                </label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    value={inputs.lowVoltageLlineLength}
                    onChange={(e) => handleInputChange('lowVoltageLlineLength', parseFloat(e.target.value) || 0)}
                    className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <select
                    value={inputs.lowVoltageLengthUnit}
                    onChange={(e) => handleInputChange('lowVoltageLengthUnit', e.target.value)}
                    className="px-2 py-1 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="m">m</option>
                    <option value="km">km</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Tamaño del cable de baja tensión
                </label>
                <div className="flex gap-2">
                  <select
                    value={inputs.lowVoltageCableSize}
                    onChange={(e) => handleInputChange('lowVoltageCableSize', parseFloat(e.target.value))}
                    className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {standardSections.map(section => (
                      <option key={section} value={section}>{section}</option>
                    ))}
                  </select>
                  <span className="px-2 py-1 text-xs bg-gray-100 border border-gray-300 rounded-md text-gray-700">mm²</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Conductores de baja tensión en paralelo
                </label>
                <select
                  value={inputs.lowVoltageConductorsParallel}
                  onChange={(e) => handleInputChange('lowVoltageConductorsParallel', parseInt(e.target.value))}
                  className="w-full px-2 py-1 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {[1, 2, 3, 4, 5, 6].map(num => (
                    <option key={num} value={num}>{num}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Conductor
                </label>
                <select
                  value={inputs.lowVoltageConductor}
                  onChange={(e) => handleInputChange('lowVoltageConductor', e.target.value)}
                  className="w-full px-2 py-1 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="copper">Cobre</option>
                  <option value="aluminum">Aluminio</option>
                </select>
              </div>
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
              <div className="bg-red-50 p-4 rounded-lg">
                <div className="text-sm text-red-600 font-medium">Cortocircuito en secundario del transformador</div>
                <div className="text-xl font-bold text-red-900">{result.shortCircuitCurrentAtTransformer} kA</div>
                <div className="text-xs text-red-700 mt-1">cos φ = {result.powerFactorAtTransformer}</div>
              </div>

              <div className="bg-orange-50 p-4 rounded-lg">
                <div className="text-sm text-orange-600 font-medium">Cortocircuito en el punto de falla</div>
                <div className="text-xl font-bold text-orange-900">{result.shortCircuitCurrentAtFault} kA</div>
                <div className="text-xs text-orange-700 mt-1">cos φ = {result.powerFactorAtFault}</div>
              </div>

              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="text-sm text-blue-600 font-medium">Impedancia equivalente del sistema</div>
                <div className="text-lg font-bold text-blue-900">{result.totalImpedanceAtFault} Ω</div>
                <div className="text-xs text-blue-700 mt-1">
                  Red: {result.networkImpedanceSecondary} Ω | Trafo: {result.transformerImpedance} Ω
                </div>
              </div>

              <div className="bg-green-50 p-4 rounded-lg">
                <div className="text-sm text-green-600 font-medium">Potencia de cortocircuito total</div>
                <div className="text-lg font-bold text-green-900">{result.shortCircuitPowerAtFault} kW</div>
                <div className="text-xs text-green-700 mt-1">En trafo: {result.shortCircuitPowerAtTransformer} kW</div>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="text-sm text-gray-600 font-medium mb-2">Impedancias del circuito</div>
                <div className="text-xs text-gray-600 space-y-1">
                  <div>• Red (ref. secundario): {result.networkImpedanceSecondary} Ω</div>
                  <div>• Transformador: {result.transformerImpedance} Ω</div>
                  <div>  - R_trafo: {result.transformerResistance} Ω</div>
                  <div>  - X_trafo: {result.transformerReactance} Ω</div>
                  <div>• Línea MT (ref. sec.): {result.mvImpedanceSecondary} Ω</div>
                  <div>• Línea BT: {result.lvImpedance} Ω</div>
                </div>
              </div>

              <div className="bg-yellow-50 p-4 rounded-lg">
                <div className="text-sm text-yellow-600 font-medium mb-2">Parámetros del sistema</div>
                <div className="text-xs text-yellow-600 space-y-1">
                  <div>• Red: {result.networkShortCircuitPower} MVA</div>
                  <div>• Transformador: {result.transformerPower} kVA</div>
                  <div>• Relación: {result.primaryVoltage} kV / {result.secondaryVoltage} V</div>
                  <div>• Rt: {result.transformationRatio}</div>
                  <div>• Línea MT: {result.mvLengthInM} m ({result.lineType})</div>
                  <div>• Línea BT: {result.lvLengthInM} m</div>
                  <div>• Conductor MT: {result.mediumVoltageConductor === 'copper' ? 'Cobre' : 'Aluminio'}</div>
                  <div>• Conductor BT: {result.lowVoltageConductor === 'copper' ? 'Cobre' : 'Aluminio'}</div>
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
          <div><strong>Impedancia de red (ref. sec.):</strong> Z_red = V²_sec / S_cc_red</div>
          <div><strong>Resistencia transformador:</strong> R_T = P_cu × V²_sec / S²_T</div>
          <div><strong>Reactancia transformador:</strong> X_T = √((V_cc% × V²_sec / S_T)² - R²_T)</div>
          <div><strong>Referencia al secundario:</strong> Z_sec = Z_prim / n²</div>
          <div><strong>Corriente de cortocircuito:</strong> I_cc = V_sec / (√3 × Z_total)</div>
          <div><strong>Potencia de cortocircuito:</strong> S_cc = √3 × V_sec × I_cc</div>
          <div className="text-xs text-blue-700 mt-2">
            <strong>Donde:</strong> V = tensión, S = potencia, Z = impedancia, n = relación de transformación, V_cc = tensión de cortocircuito (%), P_cu = pérdidas cobre
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShortCircuitTransformerCalc;