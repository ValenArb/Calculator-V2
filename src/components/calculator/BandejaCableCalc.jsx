import { useState } from 'react';
import { Plus, X, Edit2 } from 'lucide-react';

const BandejaCableCalc = () => {
  const [inputs, setInputs] = useState({
    reservePercent: 25,
    stackingLayers: 1
  });

  const [conductors, setConductors] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingIndex, setEditingIndex] = useState(null);
  const [currentConductor, setCurrentConductor] = useState({
    type: 'unipolar-without-sheath-fs17',
    section: 1.5,
    sectionUnit: 'mm²',
    quantity: 1
  });

  const [result, setResult] = useState(null);

  const cableTypes = [
    { value: 'unipolar-without-sheath-fs17', label: 'Unipolar without sheath (FS17)' },
    { value: 'unipolar-without-sheath-n07vk', label: 'Unipolar without sheath (N07VK)' },
    { value: 'unipolar-with-sheath-fg17', label: 'Unipolar with sheath (FG17)' },
    { value: 'unipolar-with-sheath-fg16r16', label: 'Unipolar with sheath (FG16R16)' },
    { value: 'unipolar-with-sheath-fg7r', label: 'Unipolar with sheath (FG7R)' },
    { value: 'bipolar-with-sheath-fg16r16', label: 'Bipolar with sheath (FG16R16)' },
    { value: 'bipolar-with-sheath-fg7r', label: 'Bipolar with sheath (FG7R)' },
    { value: 'bipolar-without-sheath-fr0r', label: 'Bipolar without sheath (FR0R)' },
    { value: 'tripolar-with-sheath-fg16r16', label: 'Tripolar with sheath (FG16R16)' },
    { value: 'tripolar-with-sheath-fg7r', label: 'Tripolar with sheath (FG7R)' },
    { value: 'tripolar-without-sheath-fr0r', label: 'Tripolar without sheath (FR0R)' },
    { value: 'quadripolar-with-sheath-fg16r16', label: 'Quadripolar with sheath (FG16R16)' },
    { value: 'quadripolar-with-sheath-fg7r', label: 'Quadripolar with sheath (FG7R)' },
    { value: 'quadripolar-without-sheath-fr0r', label: 'Quadripolar without sheath (FR0R)' },
    { value: 'pentapolar-with-sheath-fg16r16', label: 'Pentapolar with sheath (FG16R16)' },
    { value: 'pentapolar-with-sheath-fg7r', label: 'Pentapolar with sheath (FG7R)' },
    { value: 'pentapolar-without-sheath-fr0r', label: 'Pentapolar without sheath (FR0R)' }
  ];

  const standardSections = [
    0.5, 0.75, 1, 1.5, 2.5, 4, 6, 10, 16, 25, 35, 50, 70, 95, 120, 150, 185, 240, 300, 400, 500
  ];

  // Dimensiones de cables aproximadas (diámetro exterior en mm)
  const cableDiameters = {
    'unipolar-without-sheath-fs17': {
      1.5: 2.8, 2.5: 3.4, 4: 4.1, 6: 4.8, 10: 6.2, 16: 7.5, 25: 9.2, 35: 10.5, 50: 12.1
    },
    'unipolar-with-sheath-fg17': {
      1.5: 4.2, 2.5: 4.8, 4: 5.5, 6: 6.2, 10: 7.6, 16: 8.9, 25: 10.6, 35: 11.9, 50: 13.5
    },
    'bipolar-with-sheath-fg16r16': {
      1.5: 6.8, 2.5: 7.6, 4: 8.8, 6: 10.2, 10: 12.8, 16: 15.4, 25: 18.9
    },
    'tripolar-with-sheath-fg16r16': {
      1.5: 8.2, 2.5: 9.4, 4: 11.2, 6: 13.1, 10: 16.8, 16: 20.6, 25: 25.2
    },
    'quadripolar-with-sheath-fg16r16': {
      1.5: 9.1, 2.5: 10.6, 4: 12.8, 6: 15.2, 10: 19.8, 16: 24.6, 25: 30.2
    }
  };

  const calculate = () => {
    if (conductors.length === 0) {
      setResult(null);
      return;
    }

    let totalDiameter = 0;
    let maxDiameter = 0;
    let conductorDetails = [];

    conductors.forEach((conductor, index) => {
      // Obtener diámetro del cable
      let diameter = cableDiameters[conductor.type]?.[conductor.section] || 
                    Math.sqrt(conductor.section * 4 / Math.PI) + 2; // Aproximación si no existe
      
      totalDiameter += diameter * conductor.quantity;
      maxDiameter = Math.max(maxDiameter, diameter);
      
      conductorDetails.push({
        index: index + 1,
        type: cableTypes.find(t => t.value === conductor.type)?.label || conductor.type,
        section: conductor.section,
        quantity: conductor.quantity,
        diameter: diameter.toFixed(2),
        totalDiameter: (diameter * conductor.quantity).toFixed(2)
      });
    });

    // Aplicar porcentaje de reserva
    const reserveDiameter = totalDiameter * (inputs.reservePercent / 100);
    const requiredWidth = totalDiameter + reserveDiameter;
    
    // Considerar capas de apilamiento
    const heightRequired = maxDiameter * inputs.stackingLayers;
    
    // Anchos estándar de bandejas portacables (mm)
    const cableTrayWidths = [
      50, 75, 100, 150, 200, 300, 400, 500, 600, 750, 800, 900, 1000, 1200
    ];

    // Alturas estándar de bandejas portacables (mm)
    const cableTrayHeights = [
      25, 50, 75, 100, 125, 150, 200
    ];

    // Encontrar el ancho mínimo requerido
    const recommendedWidth = cableTrayWidths.find(width => width >= requiredWidth) || 'Mayor a 1200mm';
    const recommendedHeight = cableTrayHeights.find(height => height >= heightRequired) || 'Mayor a 200mm';
    
    const fillPercentage = typeof recommendedWidth === 'number' ? 
      (totalDiameter / recommendedWidth) * 100 : 100;

    setResult({
      totalCableDiameter: totalDiameter.toFixed(1),
      reserveDiameter: reserveDiameter.toFixed(1),
      requiredWidth: requiredWidth.toFixed(1),
      requiredHeight: heightRequired.toFixed(1),
      recommendedWidth: recommendedWidth,
      recommendedHeight: recommendedHeight,
      fillPercentage: fillPercentage.toFixed(1),
      conductorDetails: conductorDetails,
      reservePercent: inputs.reservePercent,
      stackingLayers: inputs.stackingLayers,
      maxCableDiameter: maxDiameter.toFixed(1)
    });
  };

  const handleInputChange = (field, value) => {
    setInputs(prev => ({ ...prev, [field]: value }));
  };

  const handleConductorChange = (field, value) => {
    setCurrentConductor(prev => ({ ...prev, [field]: value }));
  };

  const addConductor = () => {
    if (editingIndex !== null) {
      const updatedConductors = [...conductors];
      updatedConductors[editingIndex] = { ...currentConductor };
      setConductors(updatedConductors);
      setEditingIndex(null);
    } else {
      setConductors(prev => [...prev, { ...currentConductor }]);
    }
    
    setCurrentConductor({
      type: 'unipolar-without-sheath-fs17',
      section: 1.5,
      sectionUnit: 'mm²',
      quantity: 1
    });
    setShowAddForm(false);
  };

  const editConductor = (index) => {
    setCurrentConductor({ ...conductors[index] });
    setEditingIndex(index);
    setShowAddForm(true);
  };

  const removeConductor = (index) => {
    setConductors(prev => prev.filter((_, i) => i !== index));
  };

  const cancelEdit = () => {
    setShowAddForm(false);
    setEditingIndex(null);
    setCurrentConductor({
      type: 'unipolar-without-sheath-fs17',
      section: 1.5,
      sectionUnit: 'mm²',
      quantity: 1
    });
  };

  return (
    <div className="p-6">
      <h2 className="text-xl font-semibold mb-6">BANDEJA PORTACABLE</h2>
      
      <div className="grid md:grid-cols-2 gap-6">
        {/* Inputs */}
        <div className="space-y-4">
          {/* Porcentaje de reserva */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              % de reserva
            </label>
            <div className="flex gap-2">
              <input
                type="number"
                value={inputs.reservePercent}
                onChange={(e) => handleInputChange('reservePercent', parseFloat(e.target.value) || 25)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <span className="px-3 py-2 bg-gray-100 border border-gray-300 rounded-md text-gray-700">%</span>
            </div>
          </div>

          {/* Capas de apilamiento */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Capas de apilamiento
            </label>
            <select
              value={inputs.stackingLayers}
              onChange={(e) => handleInputChange('stackingLayers', parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {[1, 2, 3, 4, 5].map(num => (
                <option key={num} value={num}>{num}</option>
              ))}
            </select>
          </div>

          {/* Lista de conductores */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="block text-sm font-medium text-gray-700">
                Conductores agregados ({conductors.length})
              </label>
              <button
                onClick={() => setShowAddForm(true)}
                className="flex items-center gap-1 px-3 py-1 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                <Plus className="w-4 h-4" />
                Agregar
              </button>
            </div>

            {/* Lista de conductores */}
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {conductors.map((conductor, index) => (
                <div key={index} className="flex items-center gap-2 p-3 bg-gray-50 rounded-md">
                  <div className="flex-1 text-sm">
                    <div className="font-medium text-gray-900">
                      {cableTypes.find(t => t.value === conductor.type)?.label}
                    </div>
                    <div className="text-gray-600">
                      {conductor.section} {conductor.sectionUnit} × {conductor.quantity}
                    </div>
                  </div>
                  <button
                    onClick={() => editConductor(index)}
                    className="p-1 text-gray-600 hover:text-blue-600"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => removeConductor(index)}
                    className="p-1 text-gray-600 hover:text-red-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
              
              {conductors.length === 0 && (
                <div className="text-center py-6 text-gray-500 text-sm">
                  No hay conductores agregados
                </div>
              )}
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
              <div className="bg-green-50 p-4 rounded-lg">
                <div className="text-sm text-green-600 font-medium">Dimensiones recomendadas de bandeja portacable</div>
                <div className="text-2xl font-bold text-green-900">
                  {result.recommendedWidth} × {result.recommendedHeight} mm
                </div>
                <div className="text-xs text-green-700 mt-1">Ancho × Alto</div>
              </div>

              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="text-sm text-blue-600 font-medium">Factor de llenado (ancho)</div>
                <div className="text-xl font-bold text-blue-900">{result.fillPercentage}%</div>
              </div>

              <div className="bg-orange-50 p-4 rounded-lg">
                <div className="text-sm text-orange-600 font-medium">Dimensiones calculadas</div>
                <div className="text-sm text-orange-800 space-y-1">
                  <div>Diámetro total cables: {result.totalCableDiameter} mm</div>
                  <div>Diámetro de reserva ({result.reservePercent}%): {result.reserveDiameter} mm</div>
                  <div>Ancho requerido: {result.requiredWidth} mm</div>
                  <div>Alto requerido: {result.requiredHeight} mm</div>
                  <div>Capas de apilamiento: {result.stackingLayers}</div>
                  <div>Cable más grande: ∅ {result.maxCableDiameter} mm</div>
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="text-sm text-gray-600 font-medium mb-2">Detalle de conductores</div>
                <div className="space-y-1 text-xs text-gray-600">
                  {result.conductorDetails.map((detail, index) => (
                    <div key={index} className="flex justify-between">
                      <span>{detail.index}. {detail.section}mm² × {detail.quantity}</span>
                      <span>∅ {detail.totalDiameter} mm</span>
                    </div>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <div className="text-center py-12 text-gray-500">
              Agrega conductores y haz clic en "Calcular"
            </div>
          )}
        </div>
      </div>

      {/* Modal para agregar/editar conductor */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-96 max-w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">
              {editingIndex !== null ? 'Editar' : 'Agregar'} Conductor
            </h3>
            
            <div className="space-y-4">
              {/* Tipo de cable */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tipo de cable
                </label>
                <select
                  value={currentConductor.type}
                  onChange={(e) => handleConductorChange('type', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {cableTypes.map(type => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Sección del cable */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Sección del cable
                </label>
                <div className="flex gap-2">
                  <select
                    value={currentConductor.section}
                    onChange={(e) => handleConductorChange('section', parseFloat(e.target.value))}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {standardSections.map(section => (
                      <option key={section} value={section}>
                        {section}
                      </option>
                    ))}
                  </select>
                  <select
                    value={currentConductor.sectionUnit}
                    onChange={(e) => handleConductorChange('sectionUnit', e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="mm²">mm²</option>
                    <option value="AWG">AWG</option>
                  </select>
                </div>
              </div>

              {/* Cantidad */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Cantidad
                </label>
                <input
                  type="number"
                  min="1"
                  value={currentConductor.quantity}
                  onChange={(e) => handleConductorChange('quantity', parseInt(e.target.value) || 1)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={addConductor}
                className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
              >
                {editingIndex !== null ? 'Actualizar' : 'Agregar'}
              </button>
              <button
                onClick={cancelEdit}
                className="flex-1 bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Fórmulas utilizadas */}
      <div className="mt-8 bg-blue-50 p-4 rounded-lg border-l-4 border-blue-500">
        <h3 className="text-lg font-semibold text-blue-900 mb-2">Fórmulas utilizadas</h3>
        <div className="text-blue-800 font-mono space-y-2 text-sm">
          <div><strong>Diámetro total:</strong> D_total = Σ(D_cable × cantidad)</div>
          <div><strong>Diámetro de reserva:</strong> D_reserva = D_total × (% reserva / 100)</div>
          <div><strong>Ancho requerido:</strong> A_req = D_total + D_reserva</div>
          <div><strong>Alto requerido:</strong> H_req = D_max × capas</div>
          <div><strong>Factor de llenado:</strong> F = (D_total / A_bandeja) × 100%</div>
          <div className="text-xs text-blue-700 mt-2">
            <strong>Donde:</strong> D = diámetro, A = ancho, H = alto
          </div>
        </div>
      </div>
    </div>
  );
};

export default BandejaCableCalc;