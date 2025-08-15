import React, { useState, useEffect, useMemo } from 'react';
import { Clock, Home, Building2, Factory, ChevronRight, Eye, Edit, Search, SortAsc, Filter } from 'lucide-react';

const RecentProjectsGrid = ({ userId }) => {
  const [recentProjects, setRecentProjects] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('updated_at');
  const [sortOrder, setSortOrder] = useState('desc');

  // Mock data for now - will be replaced with API call
  const mockProjects = [
    {
      id: '1',
      name: 'Edificio Residencial Norte',
      project_type: 'residential',
      status: 'active',
      updated_at: '2024-08-15T10:30:00Z',
      created_at: '2024-07-20T09:00:00Z',
      calculation_count: 8
    },
    {
      id: '2', 
      name: 'Centro Comercial Plaza',
      project_type: 'commercial',
      status: 'draft',
      updated_at: '2024-08-14T16:45:00Z',
      created_at: '2024-08-10T14:30:00Z',
      calculation_count: 3
    },
    {
      id: '3',
      name: 'Planta Industrial Textil',
      project_type: 'industrial', 
      status: 'completed',
      updated_at: '2024-08-13T09:15:00Z',
      created_at: '2024-06-15T11:20:00Z',
      calculation_count: 15
    },
    {
      id: '4',
      name: 'Casa Familiar López',
      project_type: 'residential',
      status: 'active',
      updated_at: '2024-08-12T14:20:00Z',
      created_at: '2024-07-28T16:45:00Z',
      calculation_count: 5
    },
    {
      id: '5',
      name: 'Edificio de Oficinas Central',
      project_type: 'commercial',
      status: 'active',
      updated_at: '2024-08-11T11:15:00Z',
      created_at: '2024-05-22T10:00:00Z',
      calculation_count: 12
    },
    {
      id: '6',
      name: 'Fábrica de Alimentos',
      project_type: 'industrial',
      status: 'completed',
      updated_at: '2024-08-10T08:45:00Z',
      created_at: '2024-04-10T08:30:00Z',
      calculation_count: 18
    },
    {
      id: '7',
      name: 'Residencia Martínez',
      project_type: 'residential',
      status: 'draft',
      updated_at: '2024-08-09T15:20:00Z',
      created_at: '2024-08-05T13:15:00Z',
      calculation_count: 2
    },
    {
      id: '8',
      name: 'Shopping Mall Sur',
      project_type: 'commercial',
      status: 'active',
      updated_at: '2024-08-08T13:30:00Z',
      created_at: '2024-03-18T12:00:00Z',
      calculation_count: 25
    },
    {
      id: '9',
      name: 'Complejo Industrial Norte',
      project_type: 'industrial',
      status: 'active',
      updated_at: '2024-08-07T09:10:00Z',
      created_at: '2024-06-30T14:45:00Z',
      calculation_count: 22
    },
    {
      id: '10',
      name: 'Apartamentos Vista Linda',
      project_type: 'residential',
      status: 'completed',
      updated_at: '2024-08-06T16:00:00Z',
      created_at: '2024-05-12T09:30:00Z',
      calculation_count: 14
    },
    {
      id: '11',
      name: 'Torre de Oficinas Este',
      project_type: 'commercial',
      status: 'draft',
      updated_at: '2024-08-05T10:25:00Z',
      created_at: '2024-08-01T15:20:00Z',
      calculation_count: 6
    },
    {
      id: '12',
      name: 'Casa García',
      project_type: 'residential',
      status: 'active',
      updated_at: '2024-08-04T14:40:00Z',
      created_at: '2024-07-15T11:10:00Z',
      calculation_count: 7
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

  // Sort options
  const sortOptions = [
    { value: 'name', label: 'Nombre (A-Z)' },
    { value: 'updated_at', label: 'Última Modificación' },
    { value: 'created_at', label: 'Fecha de Creación' },
    { value: 'project_type', label: 'Tipo de Proyecto' },
    { value: 'status', label: 'Estado' },
    { value: 'calculation_count', label: 'Cantidad de Cálculos' }
  ];

  // Filter and sort projects
  const filteredAndSortedProjects = useMemo(() => {
    let filtered = recentProjects;

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(project =>
        project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.project_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.status.toLowerCase().includes(searchTerm.toLowerCase())
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
          valueA = new Date(a[sortBy]);
          valueB = new Date(b[sortBy]);
          break;
        case 'project_type':
          const typeOrder = { residential: 1, commercial: 2, industrial: 3 };
          valueA = typeOrder[a.project_type];
          valueB = typeOrder[b.project_type];
          break;
        case 'status':
          const statusOrder = { active: 1, draft: 2, completed: 3, archived: 4 };
          valueA = statusOrder[a.status];
          valueB = statusOrder[b.status];
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
            placeholder="Buscar proyectos por nombre, tipo o estado..."
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
        const TypeIcon = getProjectTypeIcon(project.project_type);
        return (
          <div
            key={project.id}
            className="bg-white rounded-lg border border-gray-200 shadow-sm p-4 hover:border-blue-300 hover:shadow-md transition-all cursor-pointer group"
            onClick={() => handleViewProject(project.id)}
          >
            <div className="flex items-center justify-center mb-3">
              <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center group-hover:bg-blue-100 transition-colors">
                <TypeIcon className="w-5 h-5 text-gray-600 group-hover:text-blue-600" />
              </div>
            </div>
            
            <h4 className="font-medium text-gray-900 mb-2 group-hover:text-blue-900 truncate">
              {project.name}
            </h4>
            
            <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
              <span>{project.calculation_count} cálculos</span>
              <span>{formatDate(project.updated_at)}</span>
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
    </div>
  );
};

export default RecentProjectsGrid;