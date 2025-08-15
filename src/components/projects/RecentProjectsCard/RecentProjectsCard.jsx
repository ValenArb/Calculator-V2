import React, { useState, useEffect, useMemo } from 'react';
import { Clock, Image as ImageIcon, Eye, Edit, Search, SortAsc, Filter } from 'lucide-react';
import projectsService from '../../../services/firebase/projects';
import toast from 'react-hot-toast';
import EditProjectModal from '../EditProjectModal';
import ViewProjectModal from '../ViewProjectModal';

const RecentProjectsGrid = ({ userId }) => {
  const [recentProjects, setRecentProjects] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('updated_at');
  const [sortOrder, setSortOrder] = useState('desc');
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState(null);


  useEffect(() => {
    const fetchRecentProjects = async () => {
      if (!userId) {
        setIsLoading(false);
        return;
      }
      
      setIsLoading(true);
      try {
        const projects = await projectsService.getProjects(userId);
        setRecentProjects(projects);
      } catch (error) {
        console.error('Error fetching recent projects:', error);
        toast.error('Error al cargar los proyectos');
        setRecentProjects([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRecentProjects();
  }, [userId]);



  const formatDate = (timestamp) => {
    let date;
    if (timestamp?.toDate) {
      // Firestore Timestamp
      date = timestamp.toDate();
    } else if (timestamp) {
      // String timestamp
      date = new Date(timestamp);
    } else {
      date = new Date();
    }
    
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Hoy';
    if (diffDays === 1) return 'Ayer';
    if (diffDays < 7) return `Hace ${diffDays} días`;
    if (diffDays < 30) return `Hace ${Math.floor(diffDays / 7)} semanas`;
    return date.toLocaleDateString('es-ES', { 
      day: 'numeric', 
      month: 'short',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
    });
  };

  const handleViewProject = (projectId) => {
    setSelectedProjectId(projectId);
    setShowViewModal(true);
  };

  const handleEditProject = (projectId) => {
    setSelectedProjectId(projectId);
    setShowEditModal(true);
  };

  const handleProjectUpdated = () => {
    // Refresh projects list
    const fetchRecentProjects = async () => {
      if (!userId) return;
      
      setIsLoading(true);
      try {
        const projects = await projectsService.getProjects(userId);
        setRecentProjects(projects);
      } catch (error) {
        console.error('Error fetching recent projects:', error);
        toast.error('Error al cargar los proyectos');
        setRecentProjects([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRecentProjects();
  };

  // Sort options
  const sortOptions = [
    { value: 'name', label: 'Nombre (A-Z)' },
    { value: 'updated_at', label: 'Última Modificación' },
    { value: 'created_at', label: 'Fecha de Creación' },
    { value: 'company', label: 'Empresa' },
    { value: 'client_name', label: 'Cliente' },
    { value: 'calculation_count', label: 'Cantidad de Cálculos' }
  ];

  // Filter and sort projects
  const filteredAndSortedProjects = useMemo(() => {
    let filtered = recentProjects;

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(project =>
        project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (project.client_name && project.client_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (project.company && project.company.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (project.description && project.description.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let valueA, valueB;

      switch (sortBy) {
        case 'name':
          valueA = a.name.toLowerCase();
          valueB = b.name.toLowerCase();
          break;
        case 'updated_at':
        case 'created_at':
          // Handle Firestore timestamps
          valueA = a[sortBy]?.toDate ? a[sortBy].toDate() : new Date(a[sortBy] || 0);
          valueB = b[sortBy]?.toDate ? b[sortBy].toDate() : new Date(b[sortBy] || 0);
          break;
        case 'client_name':
          valueA = (a.client_name || '').toLowerCase();
          valueB = (b.client_name || '').toLowerCase();
          break;
        case 'company':
          valueA = (a.company || '').toLowerCase();
          valueB = (b.company || '').toLowerCase();
          break;
        case 'calculation_count':
          valueA = a.calculation_count;
          valueB = b.calculation_count;
          break;
        default:
          valueA = a.updated_at;
          valueB = b.updated_at;
      }

      if (valueA < valueB) return sortOrder === 'asc' ? -1 : 1;
      if (valueA > valueB) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [recentProjects, searchTerm, sortBy, sortOrder]);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {[...Array(4)].map((_, index) => (
          <div key={index} className="bg-white rounded-lg border border-gray-200 shadow-sm p-4 animate-pulse">
            <div className="w-10 h-10 bg-gray-200 rounded-lg mb-3"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
            <div className="h-3 bg-gray-200 rounded w-1/2 mb-2"></div>
            <div className="h-3 bg-gray-200 rounded w-full"></div>
          </div>
        ))}
      </div>
    );
  }

  if (recentProjects.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-8 text-center">
        <Clock className="w-12 h-12 text-gray-300 mx-auto mb-3" />
        <p className="text-gray-500 mb-2">No hay proyectos recientes</p>
        <p className="text-sm text-gray-400">
          Crea tu primer proyecto para empezar
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Search and Sort Controls */}
      <div className="flex flex-col md:flex-row gap-4">
        {/* Search Bar */}
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar proyectos por nombre, empresa, cliente o descripción..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Sort Controls */}
        <div className="flex items-center gap-2">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
          >
            {sortOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>

          <button
            onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
            className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            title={`Ordenar ${sortOrder === 'asc' ? 'descendente' : 'ascendente'}`}
          >
            <SortAsc className={`w-4 h-4 text-gray-600 transition-transform ${sortOrder === 'desc' ? 'rotate-180' : ''}`} />
          </button>
        </div>
      </div>

      {/* Results Count */}
      <div className="text-sm text-gray-600">
        {searchTerm ? (
          <span>Mostrando {filteredAndSortedProjects.length} de {recentProjects.length} proyectos</span>
        ) : (
          <span>{recentProjects.length} proyectos totales</span>
        )}
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredAndSortedProjects.length === 0 ? (
          <div className="col-span-full bg-white rounded-lg border border-gray-200 shadow-sm p-8 text-center">
            <Search className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 mb-2">No se encontraron proyectos</p>
            <p className="text-sm text-gray-400">
              Intenta con otros términos de búsqueda
            </p>
          </div>
        ) : (
          filteredAndSortedProjects.map((project) => {
        return (
          <div
            key={project.id}
            className="bg-white rounded-lg border border-gray-200 shadow-sm p-4 hover:border-blue-300 hover:shadow-md transition-all cursor-pointer group"
            onClick={() => handleViewProject(project.id)}
          >
            {/* Primera fila: Logo cliente | Descripción */}
            <div className="flex items-start gap-3 mb-3">
              <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center group-hover:bg-blue-100 transition-colors border border-gray-200 flex-shrink-0">
                {project.client_logo_url ? (
                  <img
                    src={project.client_logo_url}
                    alt={`Logo de ${project.client_name}`}
                    className="w-10 h-10 object-contain rounded"
                  />
                ) : (
                  <ImageIcon className="w-6 h-6 text-gray-600 group-hover:text-blue-600" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-600 line-clamp-2 leading-relaxed">
                  {project.description || project.name}
                </p>
              </div>
            </div>
            
            {/* Segunda fila: Empresa */}
            <div className="mb-2">
              <h4 className="font-semibold text-gray-900 group-hover:text-blue-900 truncate text-sm">
                {project.company || 'Sin empresa'}
              </h4>
            </div>
            
            {/* Tercera fila: Cálculos realizados */}
            <div className="mb-2">
              <span className="text-xs font-medium text-gray-600">
                {project.calculation_count || 0} cálculos realizados
              </span>
            </div>

            {/* Cuarta fila: Fecha modificación */}
            <div className="mb-3">
              <span className="text-xs text-gray-500">
                Modificado: {formatDate(project.updated_at)}
              </span>
            </div>

            {/* Action buttons */}
            <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleViewProject(project.id);
                }}
                className="flex-1 p-1.5 text-xs text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors flex items-center justify-center gap-1"
                title="Ver proyecto"
              >
                <Eye className="w-3 h-3" />
                Ver
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleEditProject(project.id);
                }}
                className="flex-1 p-1.5 text-xs text-gray-600 hover:text-green-600 hover:bg-green-50 rounded transition-colors flex items-center justify-center gap-1"
                title="Editar proyecto"
              >
                <Edit className="w-3 h-3" />
                Editar
              </button>
            </div>
          </div>
        );
        })
        )}
      </div>

      {/* Edit Project Modal */}
      {showEditModal && (
        <EditProjectModal
          isOpen={showEditModal}
          onClose={() => {
            setShowEditModal(false);
            setSelectedProjectId(null);
          }}
          userId={userId}
          projectId={selectedProjectId}
          onProjectUpdated={handleProjectUpdated}
        />
      )}

      {/* View Project Modal */}
      {showViewModal && (
        <ViewProjectModal
          isOpen={showViewModal}
          onClose={() => {
            setShowViewModal(false);
            setSelectedProjectId(null);
          }}
          userId={userId}
          projectId={selectedProjectId}
        />
      )}
    </div>
  );
};

export default RecentProjectsGrid;