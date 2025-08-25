import React, { useState } from 'react';
import { FileText, ChevronLeft, Menu } from 'lucide-react';

const DocumentTypeSidebar = ({ onDocumentTypeSelect, selectedType, defaultCollapsed = false }) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(defaultCollapsed);

  const documentTypes = [
    {
      id: 'informacion-proyecto',
      name: 'Información del Proyecto',
      description: 'Datos básicos y detalles del proyecto',
      icon: FileText,
      color: 'bg-green-100 text-green-700 border-green-200'
    },
    {
      id: 'protocolo-ensayos',
      name: 'Protocolo de Ensayos',
      description: 'Control y ensayo de tablero eléctrico',
      icon: FileText,
      color: 'bg-orange-100 text-orange-700 border-orange-200'
    },
    {
      id: 'calculos-cortocircuito',
      name: 'Planilla de Cargas',
      description: 'Planilla de cargas eléctricas del proyecto',
      icon: FileText,
      color: 'bg-red-100 text-red-700 border-red-200'
    },
    {
      id: 'informe-tecnico',
      name: 'Informe Técnico',
      description: 'Documentación técnica completa del proyecto',
      icon: FileText,
      color: 'bg-blue-100 text-blue-700 border-blue-200'
    }
    // Aquí se pueden agregar más tipos de documento en el futuro
  ];

  const handleDocumentTypeClick = (documentType) => {
    onDocumentTypeSelect?.(documentType);
  };

  return (
    <div className={`${sidebarCollapsed ? 'w-16' : 'w-72'} bg-white shadow-sm border-l flex flex-col h-screen transition-all duration-300 fixed right-0 top-0 z-30`}>
      
      {/* Header con toggle */}
      <div className="p-3 border-b border-gray-200 flex-shrink-0 bg-gray-50">
        <div className="flex items-center justify-between">
          {!sidebarCollapsed && (
            <h3 className="text-sm font-semibold text-gray-900">Tipo de Documento</h3>
          )}
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="p-1.5 hover:bg-gray-200 rounded-md transition-colors"
            title={sidebarCollapsed ? "Expandir panel" : "Contraer panel"}
          >
            {sidebarCollapsed ? <Menu className="w-4 h-4 text-gray-600" /> : <ChevronLeft className="w-4 h-4 text-gray-600" />}
          </button>
        </div>
      </div>

      {/* Lista de tipos de documento */}
      <div className="flex-1 p-3 overflow-y-auto">
        {!sidebarCollapsed && (
          <div className="text-xs text-gray-500 mb-3 uppercase tracking-wide font-medium">
            Seleccionar Tipo
          </div>
        )}
        
        <div className="space-y-2">
          {documentTypes.map((docType) => {
            const Icon = docType.icon;
            const isSelected = selectedType?.id === docType.id;
            
            return (
              <div key={docType.id} className="relative group">
                <button
                  onClick={() => handleDocumentTypeClick(docType)}
                  className={`w-full text-left transition-all duration-200 rounded-lg border ${
                    sidebarCollapsed ? 'p-3' : 'p-4'
                  } ${
                    isSelected 
                      ? docType.color 
                      : 'bg-gray-50 hover:bg-gray-100 border-gray-200 text-gray-700'
                  }`}
                  title={sidebarCollapsed ? docType.name : ''}
                >
                  <div className={`flex items-center ${sidebarCollapsed ? 'justify-center' : 'space-x-3'}`}>
                    <Icon className={`${sidebarCollapsed ? 'w-5 h-5' : 'w-6 h-6'} flex-shrink-0`} />
                    {!sidebarCollapsed && (
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm leading-tight">
                          {docType.name}
                        </div>
                        <div className="text-xs text-gray-500 mt-1 leading-relaxed">
                          {docType.description}
                        </div>
                      </div>
                    )}
                  </div>
                </button>
                
                {/* Tooltip para modo colapsado */}
                {sidebarCollapsed && (
                  <div className="absolute right-full mr-2 top-1/2 transform -translate-y-1/2 bg-gray-800 text-white px-3 py-2 rounded-lg text-sm whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 shadow-lg">
                    <div className="font-medium">{docType.name}</div>
                    <div className="text-xs text-gray-300 mt-1">{docType.description}</div>
                    {/* Flecha del tooltip */}
                    <div className="absolute left-full top-1/2 transform -translate-y-1/2 border-4 border-transparent border-l-gray-800"></div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Footer con información */}
      {!sidebarCollapsed && (
        <div className="p-3 border-t border-gray-200 bg-gray-50 flex-shrink-0">
          <div className="text-xs text-gray-500 text-center">
            {selectedType ? (
              <span className="text-green-600 font-medium">
                ✓ {selectedType.name} seleccionado
              </span>
            ) : (
              'Selecciona un tipo de documento para continuar'
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default DocumentTypeSidebar;