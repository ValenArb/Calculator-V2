import { useState, useEffect } from 'react';
import { Search, Clock, Star, ChevronRight, Zap, Tag, User } from 'lucide-react';
import { Button, Loading } from '../../../../components/ui';
import { templatesService } from '../../../../services/firebase/templates';
import toast from 'react-hot-toast';

const TemplateSelector = ({ onSelectTemplate, onCreateBlank, loading }) => {
  const [templates, setTemplates] = useState([]);
  const [filteredTemplates, setFilteredTemplates] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [templatesLoading, setTemplatesLoading] = useState(true);

  const categories = [
    { value: 'all', label: 'Todas', icon: '📁' },
    { value: 'residential', label: 'Residencial', icon: '🏠' },
    { value: 'commercial', label: 'Comercial', icon: '🏢' },
    { value: 'industrial', label: 'Industrial', icon: '🏭' }
  ];

  const difficultyColors = {
    beginner: 'bg-green-100 text-green-800',
    intermediate: 'bg-yellow-100 text-yellow-800',
    advanced: 'bg-red-100 text-red-800'
  };

  const difficultyLabels = {
    beginner: 'Principiante',
    intermediate: 'Intermedio', 
    advanced: 'Avanzado'
  };

  useEffect(() => {
    loadTemplates();
  }, []);

  useEffect(() => {
    filterTemplates();
  }, [templates, searchTerm, selectedCategory]);

  const loadTemplates = async () => {
    try {
      setTemplatesLoading(true);
      const allTemplates = await templatesService.getAllTemplates();
      setTemplates(allTemplates);
    } catch (error) {
      console.error('Error loading templates:', error);
      toast.error('Error cargando plantillas');
    } finally {
      setTemplatesLoading(false);
    }
  };

  const filterTemplates = () => {
    let filtered = templates;

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(template => template.category === selectedCategory);
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(template =>
        template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        template.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        template.metadata?.tags?.some(tag => 
          tag.toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }

    setFilteredTemplates(filtered);
  };

  const handleSelectTemplate = (template) => {
    onSelectTemplate(template);
  };

  if (templatesLoading) {
    return (
      <div className="p-6">
        <Loading size="lg" text="Cargando plantillas..." />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          Crear Proyecto desde Plantilla
        </h2>
        <p className="text-sm text-gray-600">
          Selecciona una plantilla preconfigurada o crea un proyecto en blanco
        </p>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Button
          onClick={onCreateBlank}
          variant="outline"
          className="h-20 flex-col space-y-2"
          disabled={loading}
        >
          <div className="text-2xl">📄</div>
          <div className="text-sm font-medium">Proyecto en Blanco</div>
          <div className="text-xs text-gray-500">Comenzar desde cero</div>
        </Button>
        
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-center space-x-3">
          <Zap className="w-8 h-8 text-blue-600" />
          <div>
            <h3 className="text-sm font-medium text-blue-900">
              ¿Por qué usar plantillas?
            </h3>
            <p className="text-xs text-blue-700">
              Ahorra tiempo con configuraciones preestablecidas y datos de ejemplo
            </p>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Buscar plantillas..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 form-input"
          />
        </div>

        <div className="flex flex-wrap gap-2">
          {categories.map((category) => (
            <button
              key={category.value}
              onClick={() => setSelectedCategory(category.value)}
              className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                selectedCategory === category.value
                  ? 'bg-primary-100 text-primary-700 border border-primary-200'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-transparent'
              }`}
            >
              <span>{category.icon}</span>
              <span>{category.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Templates Grid */}
      {filteredTemplates.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-400 text-6xl mb-4">📋</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {searchTerm ? 'No se encontraron plantillas' : 'No hay plantillas disponibles'}
          </h3>
          <p className="text-gray-600 mb-4">
            {searchTerm 
              ? 'Intenta con otros términos de búsqueda' 
              : 'Las plantillas se cargarán automáticamente'
            }
          </p>
          <Button onClick={onCreateBlank}>
            Crear Proyecto en Blanco
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredTemplates.map((template) => (
            <div
              key={template.id}
              className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer group"
              onClick={() => handleSelectTemplate(template)}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <div className="text-2xl">{template.icon || '📋'}</div>
                  <div className="flex-1">
                    <h3 className="text-sm font-semibold text-gray-900 line-clamp-1 group-hover:text-primary-600">
                      {template.name}
                    </h3>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-primary-600" />
              </div>

              <p className="text-xs text-gray-600 mb-3 line-clamp-2">
                {template.description}
              </p>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center space-x-1 text-gray-500">
                    <Clock className="w-3 h-3" />
                    <span>{template.metadata?.estimatedTime || '1-2 horas'}</span>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    difficultyColors[template.metadata?.difficulty] || difficultyColors.beginner
                  }`}>
                    {difficultyLabels[template.metadata?.difficulty] || 'Principiante'}
                  </span>
                </div>

                {template.metadata?.tags && template.metadata.tags.length > 0 && (
                  <div className="flex items-center space-x-1 text-xs text-gray-500">
                    <Tag className="w-3 h-3" />
                    <span className="truncate">
                      {template.metadata.tags.slice(0, 3).join(', ')}
                      {template.metadata.tags.length > 3 && '...'}
                    </span>
                  </div>
                )}

                {template.createdBy !== 'system' && (
                  <div className="flex items-center space-x-1 text-xs text-gray-500">
                    <User className="w-3 h-3" />
                    <span>Creado por usuario</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="text-center pt-4">
        <p className="text-xs text-gray-500">
          ¿No encuentras lo que buscas? Crea un proyecto personalizado y guárdalo como plantilla.
        </p>
      </div>
    </div>
  );
};

export default TemplateSelector;