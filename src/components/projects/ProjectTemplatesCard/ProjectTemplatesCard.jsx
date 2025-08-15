import React, { useState, useEffect } from 'react';
import { FileTemplate, Home, Building2, Factory, Plus, Star, ChevronRight } from 'lucide-react';

const ProjectTemplatesCard = () => {
  const [templates, setTemplates] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedType, setSelectedType] = useState('all');

  // Mock templates data - will be replaced with API call
  const mockTemplates = [
    {
      id: '1',
      name: 'Casa Residencial Básica',
      description: 'Plantilla para proyectos residenciales estándar',
      project_type: 'residential',
      is_system_template: true,
      circuits_count: 4
    },
    {
      id: '2',
      name: 'Edificio Comercial',
      description: 'Plantilla para edificios comerciales con sistemas trifásicos',
      project_type: 'commercial',
      is_system_template: true,
      circuits_count: 5
    },
    {
      id: '3',
      name: 'Instalación Industrial',
      description: 'Plantilla para instalaciones industriales con motores',
      project_type: 'industrial',
      is_system_template: true,
      circuits_count: 5
    }
  ];

  const typeFilters = [
    { id: 'all', name: 'Todos', icon: FileTemplate },
    { id: 'residential', name: 'Residencial', icon: Home },
    { id: 'commercial', name: 'Comercial', icon: Building2 },
    { id: 'industrial', name: 'Industrial', icon: Factory }
  ];

  useEffect(() => {
    const fetchTemplates = async () => {
      setIsLoading(true);
      try {
        // TODO: Replace with actual API call
        // const response = await fetch('/api/templates/dashboard/grouped');
        // const data = await response.json();
        
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 600));
        setTemplates(mockTemplates);
      } catch (error) {
        console.error('Error fetching templates:', error);
        setTemplates([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTemplates();
  }, []);

  const getProjectTypeIcon = (type) => {
    switch (type) {
      case 'residential': return Home;
      case 'commercial': return Building2;
      case 'industrial': return Factory;
      default: return FileTemplate;
    }
  };

  const getProjectTypeColor = (type) => {
    switch (type) {
      case 'residential': return 'bg-blue-500';
      case 'commercial': return 'bg-green-500';
      case 'industrial': return 'bg-purple-500';
      default: return 'bg-gray-500';
    }
  };

  const filteredTemplates = selectedType === 'all' 
    ? templates 
    : templates.filter(template => template.project_type === selectedType);

  const handleUseTemplate = (templateId) => {
    console.log('Use template:', templateId);
    // TODO: Open create project modal with template data pre-filled
  };

  const handleCreateCustomTemplate = () => {
    console.log('Create custom template');
    // TODO: Open custom template creation modal
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm h-full">
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
              <FileTemplate className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-gray-900">
                Plantillas
              </h3>
              <p className="text-sm text-gray-600">
                Inicia con plantillas predefinidas
              </p>
            </div>
          </div>
        </div>

        {/* Type Filter */}
        <div className="flex gap-2 mb-4 overflow-x-auto">
          {typeFilters.map((filter) => {
            const Icon = filter.icon;
            const isSelected = selectedType === filter.id;
            return (
              <button
                key={filter.id}
                onClick={() => setSelectedType(filter.id)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                  isSelected
                    ? 'bg-purple-100 text-purple-700 border border-purple-200'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <Icon className="w-4 h-4" />
                {filter.name}
              </button>
            );
          })}
        </div>

        {/* Content */}
        <div className="space-y-3">
          {isLoading ? (
            // Loading state
            <div className="space-y-3">
              {[...Array(3)].map((_, index) => (
                <div key={index} className="animate-pulse">
                  <div className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg">
                    <div className="w-10 h-10 bg-gray-200 rounded-lg"></div>
                    <div className="flex-1">
                      <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded w-full"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : filteredTemplates.length === 0 ? (
            // Empty state
            <div className="text-center py-8">
              <FileTemplate className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 mb-2">
                {selectedType === 'all' 
                  ? 'No hay plantillas disponibles' 
                  : `No hay plantillas para ${typeFilters.find(f => f.id === selectedType)?.name}`
                }
              </p>
              <button
                onClick={handleCreateCustomTemplate}
                className="text-sm text-purple-600 hover:text-purple-700 font-medium"
              >
                Crear plantilla personalizada
              </button>
            </div>
          ) : (
            // Templates list
            <>
              {filteredTemplates.map((template) => {
                const TypeIcon = getProjectTypeIcon(template.project_type);
                const typeColor = getProjectTypeColor(template.project_type);
                
                return (
                  <div
                    key={template.id}
                    className="group border border-gray-200 rounded-lg p-3 hover:border-purple-300 hover:bg-purple-50 transition-all cursor-pointer"
                    onClick={() => handleUseTemplate(template.id)}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 ${typeColor} rounded-lg flex items-center justify-center group-hover:scale-105 transition-transform`}>
                        <TypeIcon className="w-5 h-5 text-white" />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-medium text-gray-900 truncate group-hover:text-purple-900">
                            {template.name}
                          </h4>
                          {template.is_system_template && (
                            <Star className="w-4 h-4 text-yellow-500 fill-current" />
                          )}
                        </div>
                        <p className="text-sm text-gray-600 line-clamp-2 mb-1">
                          {template.description}
                        </p>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-gray-500">
                            {template.circuits_count} circuitos incluidos
                          </span>
                          {template.is_system_template && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                              Sistema
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center text-gray-400 group-hover:text-purple-600 transition-colors">
                        <ChevronRight className="w-5 h-5" />
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* Create Custom Template */}
              <div className="pt-3 border-t border-gray-200">
                <button 
                  onClick={handleCreateCustomTemplate}
                  className="w-full flex items-center justify-center gap-2 text-sm text-purple-600 hover:text-purple-700 font-medium py-3 px-3 rounded-lg hover:bg-purple-50 border-2 border-dashed border-purple-200 hover:border-purple-300 transition-all"
                >
                  <Plus className="w-4 h-4" />
                  Crear plantilla personalizada
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProjectTemplatesCard;