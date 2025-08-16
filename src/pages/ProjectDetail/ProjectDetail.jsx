import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { ArrowLeft, Building2, User, Mail, Phone, MapPin, Calendar, Calculator, FileText, Edit, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import projectsService from '../../services/firebase/projects';
import EditProjectModal from '../../components/projects/EditProjectModal';
import MainSidebar from '../../components/layout/MainSidebar';
import { Loading } from '../../components/ui';

const ProjectDetail = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const [project, setProject] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);

  useEffect(() => {
    const loadProject = async () => {
      if (!projectId || !user?.uid) return;
      
      setIsLoading(true);
      try {
        const projectData = await projectsService.getProject(projectId, user.uid);
        setProject(projectData);
      } catch (error) {
        console.error('Error loading project:', error);
        toast.error('Error al cargar el proyecto');
        navigate('/dashboard');
      } finally {
        setIsLoading(false);
      }
    };

    loadProject();
  }, [projectId, user?.uid, navigate]);

  const formatDate = (timestamp) => {
    let date;
    if (timestamp?.toDate) {
      date = timestamp.toDate();
    } else if (timestamp) {
      date = new Date(timestamp);
    } else {
      date = new Date();
    }
    
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleProjectUpdated = () => {
    // Reload project data
    const loadProject = async () => {
      try {
        const projectData = await projectsService.getProject(projectId, user.uid);
        setProject(projectData);
        toast.success('Proyecto actualizado exitosamente');
      } catch (error) {
        console.error('Error reloading project:', error);
        toast.error('Error al recargar el proyecto');
      }
    };
    loadProject();
  };

  const handleDeleteProject = async () => {
    if (!project) return;

    const confirmed = window.confirm(
      `¿Estás seguro de que quieres eliminar el proyecto "${project.name}"?\n\nEsta acción no se puede deshacer.`
    );
    
    if (!confirmed) return;

    try {
      await projectsService.deleteProject(projectId, user.uid);
      toast.success(`Proyecto "${project.name}" eliminado exitosamente`);
      navigate('/dashboard');
    } catch (error) {
      console.error('Error deleting project:', error);
      toast.error('Error al eliminar el proyecto: ' + error.message);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loading size="lg" text="Cargando proyecto..." />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Proyecto no encontrado</h1>
          <button
            onClick={() => navigate('/dashboard')}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Volver al Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <MainSidebar defaultCollapsed={true} activeSection="projects" />
      
      {/* Main Content */}
      <div className="ml-16 transition-all duration-300">
        {/* Header */}
        <div className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/dashboard')}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                Volver a Proyectos
              </button>
              
              <div className="flex items-center gap-3">
                {project.client_logo_url && (
                  <img
                    src={project.client_logo_url}
                    alt={`Logo de ${project.client_name}`}
                    className="w-10 h-10 object-contain rounded border border-gray-200"
                  />
                )}
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">{project.name}</h1>
                  <p className="text-gray-600">{project.company || 'Sin empresa'}</p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* Content - Full width with permanent sidebar for project info */}
      <div className="flex h-full">
        {/* Project Info Sidebar - Permanent */}
        <div className="w-80 bg-white shadow-sm border-r border-gray-200 overflow-y-auto">
          <div className="p-6 space-y-6">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Información del Proyecto
            </h2>

            {/* Description */}
            {project.description && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Descripción
                </label>
                <p className="text-gray-900 bg-gray-50 p-3 rounded-lg text-sm">
                  {project.description}
                </p>
              </div>
            )}

            {/* Client Info */}
            <div>
              <h3 className="text-md font-medium text-gray-900 mb-4 flex items-center gap-2">
                <User className="w-4 h-4" />
                Información del Cliente
              </h3>
              
              <div className="space-y-3">
                {project.client_name && (
                  <div className="flex items-center gap-2 text-sm">
                    <User className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-900">{project.client_name}</span>
                  </div>
                )}
                
                {project.client_email && (
                  <div className="flex items-center gap-2 text-sm">
                    <Mail className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-900">{project.client_email}</span>
                  </div>
                )}
                
                {project.client_phone && (
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-900">{project.client_phone}</span>
                  </div>
                )}
                
                {project.location && (
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-900">{project.location}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Project Dates */}
            <div>
              <h3 className="text-md font-medium text-gray-900 mb-4 flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Fechas del Proyecto
              </h3>
              
              <div className="space-y-2 text-sm">
                <div>
                  <span className="text-gray-600">Creado: </span>
                  <span className="text-gray-900">{formatDate(project.created_at)}</span>
                </div>
                <div>
                  <span className="text-gray-600">Modificado: </span>
                  <span className="text-gray-900">{formatDate(project.updated_at)}</span>
                </div>
              </div>
            </div>

            {/* Calculations Count */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center gap-2 text-blue-800">
                <Calculator className="w-5 h-5" />
                <span className="font-medium text-sm">
                  {project.calculation_count || 0} cálculos realizados
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Area - Calculations */}
        <div className="flex-1 p-8">
          <div className="bg-white rounded-lg shadow-sm border p-6 h-full">
            <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
              <Calculator className="w-5 h-5" />
              Cálculos del Proyecto
            </h2>

            {/* TODO: Aquí irá la sección de cálculos */}
            <div className="text-center py-12 text-gray-500">
              <Calculator className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-600 mb-2">
                Sección de Cálculos
              </h3>
              <p className="text-gray-500">
                Aquí podrás realizar y gestionar todos los cálculos eléctricos del proyecto.
              </p>
              <p className="text-sm text-gray-400 mt-2">
                Esta funcionalidad será implementada próximamente.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>

      {/* Edit Project Modal */}
      {showEditModal && (
        <EditProjectModal
          isOpen={showEditModal}
          onClose={() => setShowEditModal(false)}
          userId={user?.uid}
          projectId={projectId}
          onProjectUpdated={handleProjectUpdated}
        />
      )}
    </div>
  );
};

export default ProjectDetail;