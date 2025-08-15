import { useState, useEffect } from 'react';
import { Plus, Search, Filter, RefreshCw, ChevronDown, ArrowUpDown, Zap } from 'lucide-react';
import { Button, Input, Loading, Modal } from '../../../../components/ui';
import ProjectCard from '../ProjectCard';
import ProjectForm from '../ProjectForm';
import DuplicateProjectModal from '../DuplicateProjectModal';
import CreateFromTemplateModal from '../CreateFromTemplateModal';
import useProjects from '../../hooks/useProjects';
import toast from 'react-hot-toast';

const ProjectList = () => {
  const { 
    projects, 
    loading, 
    error,
    favoriteProjects, 
    recentProjects,
    createNewProject, 
    updateExistingProject, 
    deleteExistingProject,
    duplicateExistingProject,
    refetchProjects 
  } = useProjects();

  // Debug log to help diagnose issues
  console.log('ProjectList render:', { 
    projectsCount: projects.length, 
    loading, 
    error, 
    projects: projects.map(p => ({ id: p.id, name: p.name }))
  });

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [duplicatingProject, setDuplicatingProject] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all'); // all, favorites, recent
  const [isCreating, setIsCreating] = useState(false);
  const [sortBy, setSortBy] = useState('updatedAt'); // updatedAt, createdAt, name, modificationsCount
  const [showSortMenu, setShowSortMenu] = useState(false);

  const sortOptions = [
    { value: 'updatedAt', label: 'Fecha de modificación', shortLabel: 'Modificación' },
    { value: 'createdAt', label: 'Fecha de creación', shortLabel: 'Creación' },
    { value: 'name', label: 'Nombre', shortLabel: 'Nombre' },
    { value: 'modificationsCount', label: 'Cantidad de modificaciones', shortLabel: 'Modificaciones' },
    { value: 'company', label: 'Empresa', shortLabel: 'Empresa' }
  ];

  const getCurrentSortLabel = () => {
    const currentOption = sortOptions.find(option => option.value === sortBy);
    return currentOption ? currentOption.shortLabel : 'Ordenar';
  };

  const getSortedProjects = (projectsToSort) => {
    console.log('Sorting projects by:', sortBy, 'Projects count:', projectsToSort.length);
    
    const sorted = [...projectsToSort].sort((a, b) => {
      switch (sortBy) {
        case 'name':
          console.log('Sorting by name:', a.name, 'vs', b.name);
          return a.name.toLowerCase().localeCompare(b.name.toLowerCase());
        case 'createdAt':
          const aCreated = a.createdAt?.toDate?.() || new Date(0);
          const bCreated = b.createdAt?.toDate?.() || new Date(0);
          console.log('Sorting by createdAt:', aCreated, 'vs', bCreated);
          return bCreated - aCreated;
        case 'modificationsCount':
          const aCount = a.modificationsCount || 0;
          const bCount = b.modificationsCount || 0;
          console.log('Sorting by modificationsCount:', aCount, 'vs', bCount);
          return bCount - aCount;
        case 'company':
          const aCompany = (a.company || '').toLowerCase();
          const bCompany = (b.company || '').toLowerCase();
          console.log('Sorting by company:', aCompany, 'vs', bCompany);
          return aCompany.localeCompare(bCompany);
        case 'updatedAt':
        default:
          const aUpdated = a.updatedAt?.toDate?.() || new Date(0);
          const bUpdated = b.updatedAt?.toDate?.() || new Date(0);
          console.log('Sorting by updatedAt:', aUpdated, 'vs', bUpdated);
          return bUpdated - aUpdated;
      }
    });
    
    console.log('Sorted projects:', sorted.map(p => ({ name: p.name, sortBy, value: sortBy === 'name' ? p.name : sortBy === 'modificationsCount' ? p.modificationsCount : 'date' })));
    return sorted;
  };

  // Close sort menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showSortMenu && !event.target.closest('.sort-menu-container')) {
        setShowSortMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showSortMenu]);

  const handleCreateProject = async (projectData) => {
    setIsCreating(true);
    try {
      await createNewProject(projectData);
      setShowCreateModal(false);
      toast.success('Proyecto creado exitosamente');
    } catch (error) {
      toast.error('Error al crear el proyecto');
    } finally {
      setIsCreating(false);
    }
  };

  const handleEditProject = async (projectData) => {
    setIsCreating(true);
    try {
      await updateExistingProject(editingProject.id, projectData);
      setEditingProject(null);
      toast.success('Proyecto actualizado exitosamente');
    } catch (error) {
      toast.error('Error al actualizar el proyecto');
    } finally {
      setIsCreating(false);
    }
  };

  const handleDeleteProject = async (projectId) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este proyecto?')) {
      try {
        await deleteExistingProject(projectId);
        toast.success('Proyecto eliminado exitosamente');
      } catch (error) {
        toast.error('Error al eliminar el proyecto');
      }
    }
  };

  const handleDuplicateProject = async (projectData) => {
    setIsCreating(true);
    try {
      await duplicateExistingProject(duplicatingProject.id, projectData);
      setDuplicatingProject(null);
      toast.success('Proyecto duplicado exitosamente');
    } catch (error) {
      toast.error('Error al duplicar el proyecto');
    } finally {
      setIsCreating(false);
    }
  };

  const getFilteredProjects = () => {
    let filteredProjects = projects;

    switch (filter) {
      case 'favorites':
        filteredProjects = favoriteProjects;
        break;
      case 'recent':
        filteredProjects = recentProjects;
        break;
      default:
        filteredProjects = projects;
    }

    if (searchTerm) {
      filteredProjects = filteredProjects.filter(project =>
        project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (project.description && project.description.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    return getSortedProjects(filteredProjects);
  };

  const filteredProjects = getFilteredProjects();
  
  console.log('Current sortBy:', sortBy, 'FilteredProjects count:', filteredProjects.length);

  if (loading) {
    return <Loading size="lg" text="Cargando proyectos..." />;
  }

  // Show error state if there's an error and no projects
  if (error && projects.length === 0) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Error cargando proyectos
          </h3>
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={refetchProjects}>
            Reintentar
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Mis Proyectos</h1>
          <p className="mt-1 text-sm text-gray-600">
            Gestiona tus proyectos de cálculos eléctricos
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            onClick={refetchProjects} 
            variant="secondary"
            size="sm"
            title="Refrescar proyectos"
          >
            <RefreshCw className="w-4 h-4" />
          </Button>
          <Button
            onClick={() => setShowTemplateModal(true)}
            variant="primary"
            className="flex items-center"
          >
            <Zap className="w-4 h-4 mr-2" />
            Crear desde Plantilla
          </Button>
          <Button 
            onClick={() => setShowCreateModal(true)}
            variant="secondary"
          >
            <Plus className="w-4 h-4 mr-2" />
            Proyecto en Blanco
          </Button>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Buscar proyectos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 form-input"
            />
          </div>
        </div>
        
        <div className="flex space-x-2">
          <Button
            variant={filter === 'all' ? 'primary' : 'secondary'}
            size="sm"
            onClick={() => setFilter('all')}
          >
            Todos ({projects.length})
          </Button>
          <Button
            variant={filter === 'favorites' ? 'primary' : 'secondary'}
            size="sm"
            onClick={() => setFilter('favorites')}
          >
            Favoritos ({favoriteProjects.length})
          </Button>
          <Button
            variant={filter === 'recent' ? 'primary' : 'secondary'}
            size="sm"
            onClick={() => setFilter('recent')}
          >
            Recientes
          </Button>
          
          {/* Sort Menu */}
          <div className="relative sort-menu-container">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setShowSortMenu(!showSortMenu)}
              className="flex items-center gap-2"
            >
              <ArrowUpDown className="w-4 h-4" />
              {getCurrentSortLabel()}
              <ChevronDown className="w-4 h-4" />
            </Button>
            
            {showSortMenu && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-md shadow-lg border border-gray-200 z-50">
                <div className="py-1">
                  {sortOptions.map((option) => (
                    <button
                      key={option.value}
                      className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-100 ${
                        sortBy === option.value ? 'bg-primary-50 text-primary-600' : 'text-gray-700'
                      }`}
                      onClick={() => {
                        setSortBy(option.value);
                        setShowSortMenu(false);
                      }}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Projects Grid */}
      {filteredProjects.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-400 text-6xl mb-4">📁</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {searchTerm ? 'No se encontraron proyectos' : 'No tienes proyectos aún'}
          </h3>
          <p className="text-gray-600 mb-4">
            {searchTerm 
              ? 'Intenta con otros términos de búsqueda' 
              : 'Crea tu primer proyecto para comenzar con los cálculos eléctricos'
            }
          </p>
          {!searchTerm && (
            <div className="flex space-x-3 justify-center">
              <Button onClick={() => setShowTemplateModal(true)}>
                <Zap className="w-4 h-4 mr-2" />
                Usar Plantilla
              </Button>
              <Button onClick={() => setShowCreateModal(true)} variant="secondary">
                <Plus className="w-4 h-4 mr-2" />
                Proyecto en Blanco
              </Button>
            </div>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              onDelete={handleDeleteProject}
              onEdit={setEditingProject}
              onDuplicate={setDuplicatingProject}
              isFavorite={favoriteProjects.some(fav => fav.id === project.id)}
            />
          ))}
        </div>
      )}

      {/* Create Project Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Crear Nuevo Proyecto"
        size="md"
      >
        <ProjectForm
          onSubmit={handleCreateProject}
          onCancel={() => setShowCreateModal(false)}
          loading={isCreating}
        />
      </Modal>

      {/* Edit Project Modal */}
      <Modal
        isOpen={!!editingProject}
        onClose={() => setEditingProject(null)}
        title="Editar Proyecto"
        size="md"
      >
        <ProjectForm
          onSubmit={handleEditProject}
          onCancel={() => setEditingProject(null)}
          initialData={editingProject}
          loading={isCreating}
        />
      </Modal>

      {/* Duplicate Project Modal */}
      <DuplicateProjectModal
        isOpen={!!duplicatingProject}
        onClose={() => setDuplicatingProject(null)}
        onConfirm={handleDuplicateProject}
        project={duplicatingProject}
        loading={isCreating}
      />

      {/* Create from Template Modal */}
      <CreateFromTemplateModal
        isOpen={showTemplateModal}
        onClose={() => setShowTemplateModal(false)}
        onCreateProject={handleCreateProject}
        loading={isCreating}
      />
    </div>
  );
};

export default ProjectList;