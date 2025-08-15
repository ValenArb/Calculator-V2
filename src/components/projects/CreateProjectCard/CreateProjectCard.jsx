import React, { useState } from 'react';
import { Plus, Home, Building2, Factory, FileText } from 'lucide-react';
import { Modal } from '../../ui';
import CreateProjectModal from '../CreateProjectModal';

const CreateProjectCard = ({ userId }) => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedType, setSelectedType] = useState('residential');

  const projectTypes = [
    {
      id: 'residential',
      name: 'Residencial',
      icon: Home,
      description: 'Viviendas, casas, apartamentos',
      color: 'bg-blue-500',
      examples: 'Instalaciones domésticas, TUG, IUG, ATE'
    },
    {
      id: 'commercial', 
      name: 'Comercial',
      icon: Building2,
      description: 'Oficinas, locales, edificios',
      color: 'bg-green-500',
      examples: 'Centros comerciales, oficinas, restaurantes'
    },
    {
      id: 'industrial',
      name: 'Industrial',
      icon: Factory,
      description: 'Fábricas, plantas, industrias',
      color: 'bg-purple-500',
      examples: 'Plantas industriales, motores, soldadura'
    }
  ];

  const handleCreateProject = (type) => {
    setSelectedType(type);
    setShowCreateModal(true);
  };

  const handleQuickCreate = () => {
    setSelectedType('residential'); // Default type for quick create
    setShowCreateModal(true);
  };

  return (
    <>
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm h-full">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-center mb-6">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
              <Plus className="w-8 h-8 text-blue-600" />
            </div>
          </div>

          <h3 className="text-xl font-semibold text-gray-900 text-center mb-3">
            Crear Nuevo Proyecto
          </h3>
          
          <p className="text-gray-600 text-center mb-6">
            Inicia un nuevo proyecto eléctrico desde cero o selecciona un tipo específico
          </p>

          {/* Quick Create Button */}
          <button
            onClick={handleQuickCreate}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors mb-4 flex items-center justify-center gap-2 font-medium"
          >
            <FileText className="w-5 h-5" />
            Comenzar Proyecto Rápido
          </button>

          {/* Project Type Options */}
          <div className="space-y-3">
            <p className="text-sm font-medium text-gray-700 text-center">
              O selecciona un tipo específico:
            </p>
            
            {projectTypes.map((type) => {
              const Icon = type.icon;
              return (
                <button
                  key={type.id}
                  onClick={() => handleCreateProject(type.id)}
                  className="w-full text-left border border-gray-200 rounded-lg p-3 hover:border-blue-300 hover:bg-blue-50 transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 ${type.color} rounded-lg flex items-center justify-center group-hover:scale-105 transition-transform`}>
                      <Icon className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">
                        {type.name}
                      </h4>
                      <p className="text-sm text-gray-600">
                        {type.description}
                      </p>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 mt-2 ml-13">
                    {type.examples}
                  </p>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Create Project Modal */}
      {showCreateModal && (
        <CreateProjectModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          userId={userId}
          defaultType={selectedType}
        />
      )}
    </>
  );
};

export default CreateProjectCard;