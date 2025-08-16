import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, Image as ImageIcon, Eye, Edit, Search, SortAsc, Filter, Loader, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';
import projectsService from '../../../services/firebase/projects';
import toast from 'react-hot-toast';
import EditProjectModal from '../EditProjectModal';
import ViewProjectModal from '../ViewProjectModal';

const RecentProjectsCard = ({ userId, refreshTrigger }) => {
  const navigate = useNavigate();
  const [recentProjects, setRecentProjects] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  console.log('RecentProjectsCard: Component initialized with userId:', userId, 'isLoading:', true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('updated_at');
  const [sortOrder, setSortOrder] = useState('desc');
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const projectsPerPage = 12;


  useEffect(() => {
    const fetchRecentProjects = async () => {
      console.log('RecentProjectsCard: Starting fetch, userId:', userId);
      if (!userId) {
        console.log('RecentProjectsCard: No userId, setting loading to false');
        setIsLoading(false);
        return;
      }
      
      console.log('RecentProjectsCard: Setting loading to true');
      setIsLoading(true);
      
      try {
        console.log('RecentProjectsCard: Fetching projects from Firestore...');
        // Add minimum loading time so users can see the loading screen
        const [projects] = await Promise.all([
          projectsService.getProjects(userId),
          new Promise(resolve => setTimeout(resolve, 800)) // 800ms minimum for better UX
        ]);
        console.log('RecentProjectsCard: Projects fetched:', projects.length);
        setRecentProjects(projects);
      } catch (error) {
        console.error('Error fetching recent projects:', error);
        toast.error('Error al cargar los proyectos');
        setRecentProjects([]);
      } finally {
        console.log('RecentProjectsCard: Setting loading to false');
        setIsLoading(false);
      }
    };

    fetchRecentProjects();
  }, [userId, refreshTrigger]);

  // Reset page when search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, sortBy, sortOrder]);



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
    navigate(`/project/${projectId}`);
  };

  const handleEditProject = (projectId) => {
    setSelectedProjectId(projectId);
    setShowEditModal(true);
  };

  const handleDeleteProject = async (projectId, projectName) => {
    // Show confirmation dialog
    const confirmed = window.confirm(
      `¿Estás seguro de que quieres eliminar el proyecto "${projectName}"?\n\nEsta acción no se puede deshacer.`
    );
    
    if (!confirmed) return;

    try {
      setIsLoading(true);
      await projectsService.deleteProject(projectId, userId);
      toast.success(`Proyecto "${projectName}" eliminado exitosamente`);
      
      // Refresh projects list
      handleProjectUpdated();
    } catch (error) {
      console.error('Error deleting project:', error);
      toast.error('Error al eliminar el proyecto: ' + error.message);
      setIsLoading(false);
    }
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

  // Pagination calculations
  const totalPages = Math.ceil(filteredAndSortedProjects.length / projectsPerPage);
  const startIndex = (currentPage - 1) * projectsPerPage;
  const endIndex = startIndex + projectsPerPage;
  const currentProjects = filteredAndSortedProjects.slice(startIndex, endIndex);

  // Pagination handlers
  const goToPage = (page) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  const goToPreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };


  console.log('RecentProjectsCard: Rendering with isLoading:', isLoading, 'userId:', userId, 'projects count:', recentProjects.length);
  console.log('RecentProjectsCard: Component state - isLoading:', isLoading, 'hasUserId:', !!userId, 'projectCount:', recentProjects.length);

  if (isLoading) {
    console.log('RecentProjectsCard: 🔄 SHOWING SIMPLE LOADING SCREEN');
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Cargando Proyectos
          </h3>
          <p className="text-gray-600">
            Obteniendo datos de la base de datos...
          </p>
        </div>
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

      {/* Results Count and Pagination Info */}
      <div className="flex justify-between items-center">
        <div className="text-sm text-gray-600">
          {searchTerm ? (
            <span>
              Mostrando {startIndex + 1}-{Math.min(endIndex, filteredAndSortedProjects.length)} de {filteredAndSortedProjects.length} proyectos filtrados 
              ({recentProjects.length} total)
            </span>
          ) : (
            <span>
              Mostrando {startIndex + 1}-{Math.min(endIndex, filteredAndSortedProjects.length)} de {filteredAndSortedProjects.length} proyectos
            </span>
          )}
        </div>
        
        {totalPages > 1 && (
          <div className="text-sm text-gray-500">
            Página {currentPage} de {totalPages}
          </div>
        )}
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-6 gap-4">
        {filteredAndSortedProjects.length === 0 ? (
          <div className="col-span-full bg-white rounded-lg border border-gray-200 shadow-sm p-8 text-center">
            <Search className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 mb-2">No se encontraron proyectos</p>
            <p className="text-sm text-gray-400">
              Intenta con otros términos de búsqueda
            </p>
          </div>
        ) : (
          currentProjects.map((project) => (
            <div
              key={project.id}
              className="bg-white rounded-lg border border-gray-200 shadow-sm p-4 hover:border-blue-300 hover:shadow-md transition-all cursor-pointer group flex flex-col h-full"
              onClick={() => navigate(`/project/${project.id}`)}
            >
              {/* Primera fila: Logo cliente | Empresa */}
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
                  <h4 className="font-semibold text-gray-900 group-hover:text-blue-900 text-sm leading-tight line-clamp-2">
                    {project.company || 'Sin empresa'}
                  </h4>
                </div>
              </div>
              
              {/* Segunda fila: Descripción */}
              <div className="mb-3 flex-1">
                <p className="text-sm text-gray-600 line-clamp-2 leading-normal">
                  {project.description || project.name}
                </p>
              </div>
              
              {/* Tercera fila: Cálculos realizados */}
              <div className="mb-2">
                <span className="text-xs font-medium text-gray-600 bg-gray-50 px-2 py-1 rounded">
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
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity pt-2 border-t border-gray-100 mt-auto">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleViewProject(project.id);
                  }}
                  className="flex-1 p-1.5 text-xs text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors flex items-center justify-center gap-1"
                  title="Abrir proyecto"
                >
                  <Eye className="w-3 h-3" />
                  Abrir
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
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteProject(project.id, project.name);
                  }}
                  className="flex-1 p-1.5 text-xs text-gray-600 hover:text-red-600 hover:bg-red-50 rounded transition-colors flex items-center justify-center gap-1"
                  title="Eliminar proyecto"
                >
                  <Trash2 className="w-3 h-3" />
                  Eliminar
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-6">
          <button
            onClick={goToPreviousPage}
            disabled={currentPage === 1}
            className="flex items-center gap-1 px-3 py-2 text-sm text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            Anterior
          </button>

          <div className="flex items-center gap-1">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
              // Show first page, last page, current page, and pages around current
              const showPage = 
                page === 1 || 
                page === totalPages || 
                (page >= currentPage - 1 && page <= currentPage + 1);
              
              if (!showPage) {
                // Show ellipsis for gaps
                if (page === currentPage - 2 || page === currentPage + 2) {
                  return (
                    <span key={page} className="px-2 py-1 text-gray-400">
                      ...
                    </span>
                  );
                }
                return null;
              }

              return (
                <button
                  key={page}
                  onClick={() => goToPage(page)}
                  className={`px-3 py-2 text-sm rounded-lg transition-colors ${
                    currentPage === page
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-600 bg-white border border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {page}
                </button>
              );
            })}
          </div>

          <button
            onClick={goToNextPage}
            disabled={currentPage === totalPages}
            className="flex items-center gap-1 px-3 py-2 text-sm text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Siguiente
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}

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
          onProjectDeleted={handleProjectUpdated}
        />
      )}
    </div>
  );
};

export default RecentProjectsCard;