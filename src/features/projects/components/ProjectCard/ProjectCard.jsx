import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { MoreVertical, Star, Trash2, Edit, Calendar, Users, Building2, MapPin, User, Copy } from 'lucide-react';
import { Button } from '../../../../components/ui';
import { addToFavorites, removeFromFavorites } from '../../../../store/slices/projectsSlice';

const ProjectCard = ({ project, onDelete, onEdit, onDuplicate, isFavorite }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [showMenu, setShowMenu] = useState(false);

  const handleToggleFavorite = () => {
    if (isFavorite) {
      dispatch(removeFromFavorites(project.id));
    } else {
      dispatch(addToFavorites(project.id));
    }
  };

  const handleOpenProject = () => {
    navigate(`/project/${project.id}`);
  };

  const formatDate = (date) => {
    if (!date) return '';
    const d = date.toDate ? date.toDate() : new Date(date);
    return d.toLocaleDateString('es-ES');
  };

  const getTypeLabel = (type) => {
    switch (type) {
      case 'residential':
        return 'Residencial';
      case 'commercial':
        return 'Comercial';
      case 'industrial':
        return 'Industrial';
      default:
        return 'Residencial';
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'residential':
        return 'bg-green-100 text-green-800';
      case 'commercial':
        return 'bg-blue-100 text-blue-800';
      case 'industrial':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };


  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 
            className="text-lg font-semibold text-gray-900 cursor-pointer hover:text-primary-600"
            onClick={handleOpenProject}
          >
            {project.name}
          </h3>
          <p className="text-sm text-gray-600 mt-1 line-clamp-2">
            {project.description || 'Sin descripción'}
          </p>
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={handleToggleFavorite}
            className={`p-1 rounded-full transition-colors ${
              isFavorite 
                ? 'text-yellow-500 hover:text-yellow-600' 
                : 'text-gray-400 hover:text-yellow-500'
            }`}
          >
            <Star className={`w-4 h-4 ${isFavorite ? 'fill-current' : ''}`} />
          </button>
          
          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="p-1 rounded-full text-gray-400 hover:text-gray-600 transition-colors"
            >
              <MoreVertical className="w-4 h-4" />
            </button>
            
            {showMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 z-10">
                <div className="py-1">
                  <button
                    onClick={() => {
                      onEdit(project);
                      setShowMenu(false);
                    }}
                    className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    Editar
                  </button>
                  {onDuplicate && (
                    <button
                      onClick={() => {
                        onDuplicate(project);
                        setShowMenu(false);
                      }}
                      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                    >
                      <Copy className="w-4 h-4 mr-2" />
                      Duplicar
                    </button>
                  )}
                  <button
                    onClick={() => {
                      onDelete(project.id);
                      setShowMenu(false);
                    }}
                    className="flex items-center px-4 py-2 text-sm text-red-700 hover:bg-red-50 w-full text-left"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Eliminar
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Project Additional Info */}
      <div className="space-y-2 mb-4">
        {project.company && (
          <div className="flex items-center space-x-2 text-xs text-gray-600">
            <Building2 className="w-3 h-3 flex-shrink-0" />
            <span className="truncate">{project.company}</span>
          </div>
        )}
        {project.location && (
          <div className="flex items-center space-x-2 text-xs text-gray-600">
            <MapPin className="w-3 h-3 flex-shrink-0" />
            <span className="truncate">{project.location}</span>
          </div>
        )}
        {project.client && (
          <div className="flex items-center space-x-2 text-xs text-gray-600">
            <User className="w-3 h-3 flex-shrink-0" />
            <span className="truncate">{project.client}</span>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
        <div className="flex items-center space-x-3">
          <div className="flex items-center">
            <Calendar className="w-4 h-4 mr-1" />
            {formatDate(project.updatedAt)}
          </div>
          
          {project.collaborators && project.collaborators.length > 0 && (
            <div className="flex items-center">
              <Users className="w-4 h-4 mr-1" />
              +{project.collaborators.length}
            </div>
          )}
          
        </div>
        
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(project.type)}`}>
          {getTypeLabel(project.type)}
        </span>
      </div>

      <div className="mt-4">
        <Button
          variant="secondary"
          size="sm"
          onClick={handleOpenProject}
          className="w-full"
        >
          Abrir Proyecto
        </Button>
      </div>
    </div>
  );
};

export default ProjectCard;