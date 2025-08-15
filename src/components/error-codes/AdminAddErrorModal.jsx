import { useState } from 'react';
import { X, Plus, Trash2, AlertTriangle, Save, Building2, Cpu, Wrench } from 'lucide-react';
import toast from 'react-hot-toast';

const AdminAddErrorModal = ({ 
  isOpen, 
  onClose, 
  errorDatabase, 
  onAddErrorCode,
  onAddManufacturer,
  onAddLine,
  onAddSubLine 
}) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    manufacturer: '',
    line: '',
    subLine: '',
    newManufacturer: '',
    newLine: '',
    newSubLine: '',
    errorCode: {
      code: '',
      title: '',
      description: '',
      causes: [''],
      solutions: [''],
      severity: 'medium'
    }
  });

  const [showNewFields, setShowNewFields] = useState({
    manufacturer: false,
    line: false,
    subLine: false
  });

  const resetForm = () => {
    setCurrentStep(1);
    setFormData({
      manufacturer: '',
      line: '',
      subLine: '',
      newManufacturer: '',
      newLine: '',
      newSubLine: '',
      errorCode: {
        code: '',
        title: '',
        description: '',
        causes: [''],
        solutions: [''],
        severity: 'medium'
      }
    });
    setShowNewFields({
      manufacturer: false,
      line: false,
      subLine: false
    });
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const addCause = () => {
    setFormData(prev => ({
      ...prev,
      errorCode: {
        ...prev.errorCode,
        causes: [...prev.errorCode.causes, '']
      }
    }));
  };

  const removeCause = (index) => {
    if (formData.errorCode.causes.length > 1) {
      setFormData(prev => ({
        ...prev,
        errorCode: {
          ...prev.errorCode,
          causes: prev.errorCode.causes.filter((_, i) => i !== index)
        }
      }));
    }
  };

  const updateCause = (index, value) => {
    setFormData(prev => ({
      ...prev,
      errorCode: {
        ...prev.errorCode,
        causes: prev.errorCode.causes.map((cause, i) => i === index ? value : cause)
      }
    }));
  };

  const addSolution = () => {
    setFormData(prev => ({
      ...prev,
      errorCode: {
        ...prev.errorCode,
        solutions: [...prev.errorCode.solutions, '']
      }
    }));
  };

  const removeSolution = (index) => {
    if (formData.errorCode.solutions.length > 1) {
      setFormData(prev => ({
        ...prev,
        errorCode: {
          ...prev.errorCode,
          solutions: prev.errorCode.solutions.filter((_, i) => i !== index)
        }
      }));
    }
  };

  const updateSolution = (index, value) => {
    setFormData(prev => ({
      ...prev,
      errorCode: {
        ...prev.errorCode,
        solutions: prev.errorCode.solutions.map((solution, i) => i === index ? value : solution)
      }
    }));
  };

  const canProceedStep1 = () => {
    if (showNewFields.manufacturer) {
      return formData.newManufacturer.trim() !== '';
    }
    return formData.manufacturer !== '';
  };

  const canProceedStep2 = () => {
    if (showNewFields.line) {
      return formData.newLine.trim() !== '';
    }
    return formData.line !== '';
  };

  const canProceedStep3 = () => {
    const selectedManufacturer = showNewFields.manufacturer ? 
      { lines: {} } : 
      errorDatabase.manufacturers[formData.manufacturer];
    const selectedLine = showNewFields.line ? 
      { hasSubLines: false } : 
      selectedManufacturer?.lines[formData.line];
    
    if (!selectedLine?.hasSubLines) return true;
    
    if (showNewFields.subLine) {
      return formData.newSubLine.trim() !== '';
    }
    return formData.subLine !== '';
  };

  const handleNextStep = () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    try {
      // Validate form
      if (!formData.errorCode.code.trim() || !formData.errorCode.title.trim()) {
        toast.error('El código y título son obligatorios');
        return;
      }

      const filteredCauses = formData.errorCode.causes.filter(cause => cause.trim() !== '');
      const filteredSolutions = formData.errorCode.solutions.filter(solution => solution.trim() !== '');

      if (filteredCauses.length === 0 || filteredSolutions.length === 0) {
        toast.error('Debe agregar al menos una causa y una solución');
        return;
      }

      // Prepare final data
      const finalData = {
        manufacturer: showNewFields.manufacturer ? formData.newManufacturer : formData.manufacturer,
        line: showNewFields.line ? formData.newLine : formData.line,
        subLine: showNewFields.subLine ? formData.newSubLine : formData.subLine,
        errorCode: {
          ...formData.errorCode,
          causes: filteredCauses,
          solutions: filteredSolutions
        },
        newManufacturer: showNewFields.manufacturer,
        newLine: showNewFields.line,
        newSubLine: showNewFields.subLine
      };

      // Call the appropriate handlers
      if (showNewFields.manufacturer) {
        await onAddManufacturer(finalData);
      } else if (showNewFields.line) {
        await onAddLine(finalData);
      } else if (showNewFields.subLine) {
        await onAddSubLine(finalData);
      } else {
        await onAddErrorCode(finalData);
      }

      toast.success('Código de error agregado exitosamente');
      handleClose();
    } catch (error) {
      toast.error('Error al agregar código de error: ' + error.message);
    }
  };

  const getAvailableLines = () => {
    if (showNewFields.manufacturer) return [];
    const manufacturer = errorDatabase.manufacturers[formData.manufacturer];
    return manufacturer ? Object.entries(manufacturer.lines) : [];
  };

  const getAvailableSubLines = () => {
    if (showNewFields.manufacturer || showNewFields.line) return [];
    const manufacturer = errorDatabase.manufacturers[formData.manufacturer];
    const line = manufacturer?.lines[formData.line];
    return line?.hasSubLines ? Object.entries(line.subLines) : [];
  };

  const needsSubLine = () => {
    if (showNewFields.manufacturer || showNewFields.line) return false;
    const manufacturer = errorDatabase.manufacturers[formData.manufacturer];
    const line = manufacturer?.lines[formData.line];
    return line?.hasSubLines;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Agregar Código de Error</h2>
              <p className="text-gray-600">Paso {currentStep} de 4</p>
            </div>
            <button onClick={handleClose} className="text-gray-400 hover:text-gray-600">
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Progress Bar */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">Progreso</span>
              <span className="text-sm text-gray-600">{currentStep}/4</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${(currentStep / 4) * 100}%` }}
              ></div>
            </div>
          </div>

          {/* Step 1: Manufacturer Selection */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Seleccionar Fabricante</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Fabricantes existentes
                  </label>
                  <select
                    value={formData.manufacturer}
                    onChange={(e) => {
                      setFormData(prev => ({ ...prev, manufacturer: e.target.value }));
                      setShowNewFields(prev => ({ ...prev, manufacturer: false }));
                    }}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    disabled={showNewFields.manufacturer}
                  >
                    <option value="">Seleccionar fabricante...</option>
                    {Object.entries(errorDatabase.manufacturers).map(([key, manufacturer]) => (
                      <option key={key} value={key}>{manufacturer.name}</option>
                    ))}
                  </select>
                </div>

                <div className="text-center">
                  <span className="text-gray-500 text-sm">o</span>
                </div>

                <div>
                  <label className="flex items-center space-x-2 mb-3">
                    <input
                      type="checkbox"
                      checked={showNewFields.manufacturer}
                      onChange={(e) => {
                        setShowNewFields(prev => ({ ...prev, manufacturer: e.target.checked }));
                        if (!e.target.checked) {
                          setFormData(prev => ({ ...prev, newManufacturer: '' }));
                        } else {
                          setFormData(prev => ({ ...prev, manufacturer: '' }));
                        }
                      }}
                      className="rounded"
                    />
                    <span className="text-sm font-medium text-gray-700">Agregar nuevo fabricante</span>
                  </label>
                  
                  {showNewFields.manufacturer && (
                    <input
                      type="text"
                      placeholder="Nombre del nuevo fabricante"
                      value={formData.newManufacturer}
                      onChange={(e) => setFormData(prev => ({ ...prev, newManufacturer: e.target.value }))}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Line Selection */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Seleccionar Línea de Producto</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Líneas existentes
                  </label>
                  <select
                    value={formData.line}
                    onChange={(e) => {
                      setFormData(prev => ({ ...prev, line: e.target.value }));
                      setShowNewFields(prev => ({ ...prev, line: false }));
                    }}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    disabled={showNewFields.line || showNewFields.manufacturer}
                  >
                    <option value="">Seleccionar línea...</option>
                    {getAvailableLines().map(([key, line]) => (
                      <option key={key} value={key}>{line.name}</option>
                    ))}
                  </select>
                </div>

                <div className="text-center">
                  <span className="text-gray-500 text-sm">o</span>
                </div>

                <div>
                  <label className="flex items-center space-x-2 mb-3">
                    <input
                      type="checkbox"
                      checked={showNewFields.line}
                      onChange={(e) => {
                        setShowNewFields(prev => ({ ...prev, line: e.target.checked }));
                        if (!e.target.checked) {
                          setFormData(prev => ({ ...prev, newLine: '' }));
                        } else {
                          setFormData(prev => ({ ...prev, line: '' }));
                        }
                      }}
                      className="rounded"
                    />
                    <span className="text-sm font-medium text-gray-700">Agregar nueva línea</span>
                  </label>
                  
                  {showNewFields.line && (
                    <input
                      type="text"
                      placeholder="Nombre de la nueva línea"
                      value={formData.newLine}
                      onChange={(e) => setFormData(prev => ({ ...prev, newLine: e.target.value }))}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Step 3: SubLine Selection (if needed) */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                {needsSubLine() ? 'Seleccionar Sub-línea' : 'Sub-línea no necesaria'}
              </h3>
              
              {needsSubLine() ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Sub-líneas existentes
                    </label>
                    <select
                      value={formData.subLine}
                      onChange={(e) => {
                        setFormData(prev => ({ ...prev, subLine: e.target.value }));
                        setShowNewFields(prev => ({ ...prev, subLine: false }));
                      }}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      disabled={showNewFields.subLine}
                    >
                      <option value="">Seleccionar sub-línea...</option>
                      {getAvailableSubLines().map(([key, subLine]) => (
                        <option key={key} value={key}>{subLine.name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="text-center">
                    <span className="text-gray-500 text-sm">o</span>
                  </div>

                  <div>
                    <label className="flex items-center space-x-2 mb-3">
                      <input
                        type="checkbox"
                        checked={showNewFields.subLine}
                        onChange={(e) => {
                          setShowNewFields(prev => ({ ...prev, subLine: e.target.checked }));
                          if (!e.target.checked) {
                            setFormData(prev => ({ ...prev, newSubLine: '' }));
                          } else {
                            setFormData(prev => ({ ...prev, subLine: '' }));
                          }
                        }}
                        className="rounded"
                      />
                      <span className="text-sm font-medium text-gray-700">Agregar nueva sub-línea</span>
                    </label>
                    
                    {showNewFields.subLine && (
                      <input
                        type="text"
                        placeholder="Nombre de la nueva sub-línea"
                        value={formData.newSubLine}
                        onChange={(e) => setFormData(prev => ({ ...prev, newSubLine: e.target.value }))}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    )}
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <Wrench className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-600">
                    La línea seleccionada no requiere sub-líneas. 
                    Puedes continuar al siguiente paso.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Step 4: Error Code Details */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Detalles del Código de Error</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Código de Error *
                  </label>
                  <input
                    type="text"
                    placeholder="Ej: F0001, 2210, OCF"
                    value={formData.errorCode.code}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      errorCode: { ...prev.errorCode, code: e.target.value }
                    }))}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Severidad
                  </label>
                  <select
                    value={formData.errorCode.severity}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      errorCode: { ...prev.errorCode, severity: e.target.value }
                    }))}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="low">Baja</option>
                    <option value="medium">Media</option>
                    <option value="high">Alta</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Título del Error *
                </label>
                <input
                  type="text"
                  placeholder="Ej: Sobrecorriente Durante Aceleración"
                  value={formData.errorCode.title}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    errorCode: { ...prev.errorCode, title: e.target.value }
                  }))}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Descripción
                </label>
                <textarea
                  placeholder="Descripción detallada del error..."
                  rows={3}
                  value={formData.errorCode.description}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    errorCode: { ...prev.errorCode, description: e.target.value }
                  }))}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="block text-sm font-medium text-gray-700">
                    Posibles Causas
                  </label>
                  <button
                    type="button"
                    onClick={addCause}
                    className="flex items-center space-x-1 text-blue-600 hover:text-blue-700 text-sm"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Agregar causa</span>
                  </button>
                </div>
                <div className="space-y-2">
                  {formData.errorCode.causes.map((cause, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <input
                        type="text"
                        placeholder={`Causa ${index + 1}`}
                        value={cause}
                        onChange={(e) => updateCause(index, e.target.value)}
                        className="flex-1 p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      {formData.errorCode.causes.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeCause(index)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="block text-sm font-medium text-gray-700">
                    Soluciones Recomendadas
                  </label>
                  <button
                    type="button"
                    onClick={addSolution}
                    className="flex items-center space-x-1 text-blue-600 hover:text-blue-700 text-sm"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Agregar solución</span>
                  </button>
                </div>
                <div className="space-y-2">
                  {formData.errorCode.solutions.map((solution, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <input
                        type="text"
                        placeholder={`Solución ${index + 1}`}
                        value={solution}
                        onChange={(e) => updateSolution(index, e.target.value)}
                        className="flex-1 p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      {formData.errorCode.solutions.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeSolution(index)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex items-center justify-between pt-6 border-t border-gray-200 mt-8">
            <button
              onClick={handlePrevStep}
              disabled={currentStep === 1}
              className={`px-4 py-2 text-sm font-medium rounded-lg ${
                currentStep === 1
                  ? 'text-gray-400 cursor-not-allowed'
                  : 'text-gray-700 bg-gray-100 hover:bg-gray-200'
              }`}
            >
              Anterior
            </button>

            <div className="flex items-center space-x-3">
              <button
                onClick={handleClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
              >
                Cancelar
              </button>
              
              {currentStep < 4 ? (
                <button
                  onClick={handleNextStep}
                  disabled={
                    (currentStep === 1 && !canProceedStep1()) ||
                    (currentStep === 2 && !canProceedStep2()) ||
                    (currentStep === 3 && !canProceedStep3())
                  }
                  className={`px-4 py-2 text-sm font-medium rounded-lg ${
                    (currentStep === 1 && !canProceedStep1()) ||
                    (currentStep === 2 && !canProceedStep2()) ||
                    (currentStep === 3 && !canProceedStep3())
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}
                >
                  Siguiente
                </button>
              ) : (
                <button
                  onClick={handleSubmit}
                  className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700"
                >
                  <Save className="w-4 h-4" />
                  <span>Guardar Código</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminAddErrorModal;