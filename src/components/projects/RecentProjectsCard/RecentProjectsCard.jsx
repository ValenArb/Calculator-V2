import React, { useState, useEffect } from 'react';
import { Clock, Home, Building2, Factory, ChevronRight, Eye, Edit } from 'lucide-react';

const RecentProjectsCard = ({ userId }) => {
  const [recentProjects, setRecentProjects] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Mock data for now - will be replaced with API call
  const mockProjects = [
    {
      id: '1',
      name: 'Edificio Residencial Norte',
      project_type: 'residential',
      status: 'active',
      updated_at: '2024-08-15T10:30:00Z',
      calculation_count: 8
    },
    {
      id: '2', 
      name: 'Centro Comercial Plaza',
      project_type: 'commercial',
      status: 'draft',
      updated_at: '2024-08-14T16:45:00Z',
      calculation_count: 3
    },
    {
      id: '3',
      name: 'Planta Industrial Textil',
      project_type: 'industrial', 
      status: 'completed',
      updated_at: '2024-08-13T09:15:00Z',
      calculation_count: 15
    },
    {
      id: '4',
      name: 'Casa Familiar López',
      project_type: 'residential',
      status: 'active',
      updated_at: '2024-08-12T14:20:00Z',
      calculation_count: 5
    }
  ];

  useEffect(() => {
    const fetchRecentProjects = async () => {
      if (!userId) return;
      
      setIsLoading(true);
      try {
        // TODO: Replace with actual API call
        // const response = await fetch(`/api/stats/recent-projects?userId=${userId}&limit=5`);
        // const data = await response.json();
        
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 800));
        setRecentProjects(mockProjects);
      } catch (error) {
        console.error('Error fetching recent projects:', error);
        setRecentProjects([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRecentProjects();
  }, [userId]);

  const getProjectTypeIcon = (type) => {
    switch (type) {
      case 'residential': return Home;
      case 'commercial': return Building2;
      case 'industrial': return Factory;
      default: return Home;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      case 'draft': return 'bg-yellow-100 text-yellow-800';
      case 'archived': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'active': return 'Activo';
      case 'completed': return 'Completado';
      case 'draft': return 'Borrador';
      case 'archived': return 'Archivado';
      default: return status;
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
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
    console.log('View project:', projectId);
    // TODO: Navigate to project details
  };

  const handleEditProject = (projectId) => {
    console.log('Edit project:', projectId);
    // TODO: Open edit modal or navigate to edit page
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm h-full">
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <Clock className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-gray-900">
                Proyectos Recientes
              </h3>
              <p className="text-sm text-gray-600">
                Últimos proyectos modificados
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="space-y-3">
          {isLoading ? (
            // Loading state
            <div className="space-y-3">
              {[...Array(4)].map((_, index) => (
                <div key={index} className="animate-pulse">
                  <div className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg">
                    <div className="w-8 h-8 bg-gray-200 rounded-lg"></div>
                    <div className="flex-1">
                      <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                    </div>
                    <div className="w-16 h-6 bg-gray-200 rounded"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : recentProjects.length === 0 ? (
            // Empty state
            <div className="text-center py-8">
              <Clock className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 mb-2">No hay proyectos recientes</p>
              <p className="text-sm text-gray-400">
                Crea tu primer proyecto para empezar
              </p>
            </div>
          ) : (
            // Projects list
            <>
              {recentProjects.map((project) => {
                const TypeIcon = getProjectTypeIcon(project.project_type);
                return (
                  <div
                    key={project.id}
                    className="group border border-gray-200 rounded-lg p-3 hover:border-blue-300 hover:bg-blue-50 transition-all cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center group-hover:bg-blue-100 transition-colors">
                        <TypeIcon className="w-5 h-5 text-gray-600 group-hover:text-blue-600" />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-gray-900 truncate group-hover:text-blue-900">
                          {project.name}
                        </h4>
                        <div className="flex items-center gap-2 mt-1">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(project.status)}`}>
                            {getStatusText(project.status)}
                          </span>
                          <span className="text-xs text-gray-500">
                            {project.calculation_count} cálculos
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          {formatDate(project.updated_at)}
                        </p>
                      </div>

                      {/* Action buttons */}
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleViewProject(project.id);
                          }}
                          className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-white rounded transition-colors"
                          title="Ver proyecto"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEditProject(project.id);
                          }}
                          className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-white rounded transition-colors"
                          title="Editar proyecto"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-blue-600" />
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* View All Projects Link */}
              <div className="pt-3 border-t border-gray-200">
                <button className="w-full text-sm text-blue-600 hover:text-blue-700 font-medium py-2 px-3 rounded-lg hover:bg-blue-50 transition-colors">
                  Ver todos los proyectos
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default RecentProjectsCard;