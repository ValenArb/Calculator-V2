import React, { useState, useRef } from 'react';
import { Upload, FileImage, X, Check, Pen, Download, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';

/**
 * Digital Signature Component for Electrical Protocol Documentation
 * Supports image upload, drawing signatures, and signature management
 * Complies with electrical testing documentation standards
 */
const DigitalSignature = ({ 
  signatures = {}, 
  onSignatureChange, 
  projectId,
  disabled = false,
  showRequiredFields = true 
}) => {
  const [activeSignatureType, setActiveSignatureType] = useState(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);

  // Standard signature types for electrical protocols
  const signatureTypes = [
    {
      id: 'tecnico_ensayos',
      label: 'Técnico de Ensayos',
      description: 'Técnico responsable de la ejecución de las pruebas',
      required: true
    },
    {
      id: 'supervisor_electrico',
      label: 'Supervisor Eléctrico',
      description: 'Supervisor técnico responsable del proyecto',
      required: true
    },
    {
      id: 'cliente_representante',
      label: 'Representante del Cliente',
      description: 'Representante autorizado del cliente',
      required: false
    },
    {
      id: 'inspector_certificacion',
      label: 'Inspector de Certificación',
      description: 'Inspector autorizado para certificación',
      required: false
    }
  ];

  // Canvas drawing functions
  const startDrawing = (e) => {
    if (!canvasRef.current || disabled) return;
    
    setIsDrawing(true);
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const ctx = canvas.getContext('2d');
    
    ctx.beginPath();
    ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
  };

  const draw = (e) => {
    if (!isDrawing || !canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const ctx = canvas.getContext('2d');
    
    ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.stroke();
  };

  const stopDrawing = () => {
    if (!isDrawing) return;
    setIsDrawing(false);
    
    // Save signature to state
    if (canvasRef.current && activeSignatureType) {
      const signatureData = canvasRef.current.toDataURL();
      handleSignatureChange(activeSignatureType, {
        type: 'drawn',
        data: signatureData,
        timestamp: new Date().toISOString()
      });
    }
  };

  // File upload handler
  const handleFileUpload = (e, signatureType) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      toast.error('Por favor selecciona una imagen válida (JPG, PNG, GIF, WebP)');
      return;
    }

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast.error('La imagen no puede ser mayor a 2MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      handleSignatureChange(signatureType, {
        type: 'uploaded',
        data: event.target.result,
        filename: file.name,
        timestamp: new Date().toISOString()
      });
      toast.success('Firma cargada exitosamente');
    };
    reader.readAsDataURL(file);
  };

  // Clear canvas
  const clearCanvas = () => {
    if (!canvasRef.current) return;
    const ctx = canvasRef.current.getContext('2d');
    ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
  };

  // Handle signature change
  const handleSignatureChange = (signatureType, signatureData) => {
    const updatedSignatures = {
      ...signatures,
      [signatureType]: signatureData
    };
    onSignatureChange?.(updatedSignatures);
  };

  // Remove signature
  const removeSignature = (signatureType) => {
    const updatedSignatures = { ...signatures };
    delete updatedSignatures[signatureType];
    onSignatureChange?.(updatedSignatures);
    toast.success('Firma eliminada');
  };

  // Open drawing modal
  const openDrawingModal = (signatureType) => {
    setActiveSignatureType(signatureType);
    // Clear canvas when opening
    setTimeout(() => clearCanvas(), 100);
  };

  // Close drawing modal
  const closeDrawingModal = () => {
    setActiveSignatureType(null);
    setIsDrawing(false);
  };

  // Save drawn signature
  const saveDrawnSignature = () => {
    if (canvasRef.current && activeSignatureType) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      
      // Check if canvas has content
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const hasContent = imageData.data.some((channel, index) => 
        index % 4 !== 3 ? channel !== 255 : channel !== 0
      );

      if (!hasContent) {
        toast.error('Por favor dibuja una firma antes de guardar');
        return;
      }

      const signatureData = canvas.toDataURL();
      handleSignatureChange(activeSignatureType, {
        type: 'drawn',
        data: signatureData,
        timestamp: new Date().toISOString()
      });
      
      toast.success('Firma guardada exitosamente');
      closeDrawingModal();
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="text-lg font-semibold text-blue-900 mb-2">Firmas Digitales</h3>
        <p className="text-sm text-blue-700">
          Las firmas digitales certifican la validez y autoría del protocolo de ensayos eléctricos.
          {showRequiredFields && (
            <span className="block mt-1">
              <span className="text-red-600">*</span> Campos obligatorios para certificación
            </span>
          )}
        </p>
      </div>

      <div className="grid gap-6">
        {signatureTypes.map((signatureType) => {
          const signature = signatures[signatureType.id];
          const hasSignature = signature && signature.data;

          return (
            <div key={signatureType.id} className="bg-white border border-gray-300 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h4 className="font-medium text-gray-900 flex items-center gap-2">
                    {signatureType.label}
                    {signatureType.required && showRequiredFields && (
                      <span className="text-red-600">*</span>
                    )}
                  </h4>
                  <p className="text-sm text-gray-600">{signatureType.description}</p>
                </div>
                
                {hasSignature && (
                  <div className="flex items-center gap-2">
                    <span className="flex items-center gap-1 text-sm text-green-600">
                      <Check className="w-4 h-4" />
                      Firmado
                    </span>
                    {!disabled && (
                      <button
                        onClick={() => removeSignature(signatureType.id)}
                        className="text-red-600 hover:text-red-700 p-1"
                        title="Eliminar firma"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                )}
              </div>

              {hasSignature ? (
                // Show existing signature
                <div className="border border-gray-200 rounded-lg p-3 bg-gray-50">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-600">
                      Tipo: {signature.type === 'drawn' ? 'Dibujada' : 'Cargada'}
                    </span>
                    <span className="text-xs text-gray-500">
                      {new Date(signature.timestamp).toLocaleString('es-ES')}
                    </span>
                  </div>
                  <div className="w-full h-32 border border-gray-200 rounded bg-white overflow-hidden">
                    <img 
                      src={signature.data} 
                      alt={`Firma de ${signatureType.label}`}
                      className="w-full h-full object-contain"
                    />
                  </div>
                  {signature.filename && (
                    <p className="text-xs text-gray-500 mt-1">Archivo: {signature.filename}</p>
                  )}
                </div>
              ) : (
                // Show signature options
                !disabled && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {/* Upload signature */}
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="flex items-center justify-center gap-3 p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition-colors"
                    >
                      <Upload className="w-5 h-5 text-gray-400" />
                      <div className="text-center">
                        <p className="text-sm font-medium text-gray-700">Cargar Imagen</p>
                        <p className="text-xs text-gray-500">JPG, PNG, GIF (max 2MB)</p>
                      </div>
                    </button>

                    {/* Draw signature */}
                    <button
                      onClick={() => openDrawingModal(signatureType.id)}
                      className="flex items-center justify-center gap-3 p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-green-400 hover:bg-green-50 transition-colors"
                    >
                      <Pen className="w-5 h-5 text-gray-400" />
                      <div className="text-center">
                        <p className="text-sm font-medium text-gray-700">Dibujar Firma</p>
                        <p className="text-xs text-gray-500">Usar mouse o pantalla táctil</p>
                      </div>
                    </button>

                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileUpload(e, signatureType.id)}
                      className="hidden"
                    />
                  </div>
                )
              )}
            </div>
          );
        })}
      </div>

      {/* Drawing Modal */}
      {activeSignatureType && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">
                Dibujar Firma - {signatureTypes.find(s => s.id === activeSignatureType)?.label}
              </h3>
              <button
                onClick={closeDrawingModal}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="mb-4">
              <canvas
                ref={canvasRef}
                width={600}
                height={200}
                className="border border-gray-300 rounded cursor-crosshair w-full"
                style={{ touchAction: 'none' }}
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={stopDrawing}
                onMouseLeave={stopDrawing}
                onTouchStart={(e) => {
                  e.preventDefault();
                  const touch = e.touches[0];
                  const mouseEvent = new MouseEvent('mousedown', {
                    clientX: touch.clientX,
                    clientY: touch.clientY
                  });
                  e.target.dispatchEvent(mouseEvent);
                }}
                onTouchMove={(e) => {
                  e.preventDefault();
                  const touch = e.touches[0];
                  const mouseEvent = new MouseEvent('mousemove', {
                    clientX: touch.clientX,
                    clientY: touch.clientY
                  });
                  e.target.dispatchEvent(mouseEvent);
                }}
                onTouchEnd={(e) => {
                  e.preventDefault();
                  const mouseEvent = new MouseEvent('mouseup', {});
                  e.target.dispatchEvent(mouseEvent);
                }}
              />
            </div>

            <div className="flex items-center justify-between">
              <button
                onClick={clearCanvas}
                className="flex items-center gap-2 px-4 py-2 text-gray-600 border border-gray-300 rounded hover:bg-gray-50"
              >
                <Trash2 className="w-4 h-4" />
                Limpiar
              </button>

              <div className="flex gap-3">
                <button
                  onClick={closeDrawingModal}
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  onClick={saveDrawnSignature}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  <Check className="w-4 h-4" />
                  Guardar Firma
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DigitalSignature;