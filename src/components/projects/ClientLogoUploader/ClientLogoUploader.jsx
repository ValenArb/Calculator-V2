import React, { useState, useRef } from 'react';
import { Upload, X, Image, Check, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import projectsService from '../../../services/firebase/projects';

const ClientLogoUploader = ({ 
  userId, 
  clientName, 
  currentLogoUrl, 
  onLogoChange, 
  disabled = false 
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileSelect = async (file) => {
    if (!file || !clientName || !userId) {
      toast.error('Por favor, proporciona el nombre del cliente primero');
      return;
    }

    setIsUploading(true);
    try {
      const result = await projectsService.uploadClientLogo(file, clientName, userId);
      onLogoChange(result.url);
      toast.success('Logo subido exitosamente');
    } catch (error) {
      console.error('Error uploading logo:', error);
      toast.error(error.message || 'Error al subir el logo');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (disabled) return;
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleFileInput = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleRemoveLogo = async () => {
    if (currentLogoUrl) {
      try {
        await projectsService.deleteClientLogo(currentLogoUrl);
        onLogoChange(null);
        toast.success('Logo eliminado');
      } catch (error) {
        console.error('Error removing logo:', error);
        toast.error('Error al eliminar el logo');
      }
    }
  };

  const openFileDialog = () => {
    if (!disabled && fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-gray-700">
        Logo del Cliente
      </label>
      
      {/* Current logo display */}
      {currentLogoUrl && (
        <div className="relative inline-block">
          <img
            src={currentLogoUrl}
            alt={`Logo de ${clientName}`}
            className="w-24 h-24 object-contain border border-gray-200 rounded-lg bg-gray-50"
          />
          {!disabled && (
            <button
              type="button"
              onClick={handleRemoveLogo}
              className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
              title="Eliminar logo"
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </div>
      )}
      
      {/* Upload area */}
      {!currentLogoUrl && (
        <div
          className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
            dragActive 
              ? 'border-blue-400 bg-blue-50' 
              : 'border-gray-300 hover:border-gray-400'
          } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={openFileDialog}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileInput}
            className="hidden"
            disabled={disabled}
          />
          
          {isUploading ? (
            <div className="flex flex-col items-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-2"></div>
              <p className="text-sm text-gray-600">Subiendo logo...</p>
            </div>
          ) : (
            <div className="flex flex-col items-center">
              <Upload className="w-8 h-8 text-gray-400 mb-2" />
              <p className="text-sm text-gray-600 mb-1">
                Arrastra y suelta el logo del cliente aquí
              </p>
              <p className="text-xs text-gray-500">
                o haz clic para seleccionar un archivo
              </p>
              <p className="text-xs text-gray-400 mt-2">
                PNG, JPG, GIF hasta 5MB
              </p>
            </div>
          )}
        </div>
      )}
      
      {/* Help text */}
      {!clientName && (
        <div className="flex items-center gap-2 text-xs text-amber-600 bg-amber-50 p-2 rounded">
          <AlertCircle className="w-4 h-4" />
          <span>Ingresa el nombre del cliente primero para poder subir el logo</span>
        </div>
      )}
      
      {/* File requirements */}
      <div className="text-xs text-gray-500 space-y-1">
        <p>• Formatos soportados: PNG, JPG, GIF, WebP</p>
        <p>• Tamaño máximo: 5MB</p>
        <p>• Recomendado: imágenes cuadradas con fondo transparente</p>
      </div>
    </div>
  );
};

export default ClientLogoUploader;