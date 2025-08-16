import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { ArrowLeft, Building2, User, Mail, Phone, MapPin, Calendar, Calculator, FileText, Edit, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import projectsService from '../../services/firebase/projects';
import EditProjectModal from '../../components/projects/EditProjectModal';
import MainSidebar from '../../components/layout/MainSidebar';
import DocumentTypeSidebar from '../../components/layout/DocumentTypeSidebar';
import { Loading } from '../../components/ui';

const ProjectDetail = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const [project, setProject] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedDocumentType, setSelectedDocumentType] = useState(null);

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

  const handleDocumentTypeSelect = (documentType) => {
    setSelectedDocumentType(documentType);
    console.log('Selected document type in project:', documentType);
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
      <div className="ml-16 mr-72 transition-all duration-300">
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

        {/* Content - Full width */}
        <div className="p-8">
          {selectedDocumentType ? (
              <div className="bg-white rounded-lg shadow-sm border p-6 h-full">
                <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  {selectedDocumentType.name} - {project.name}
                </h2>

                {selectedDocumentType.id === 'informacion-proyecto' ? (
                  // Vista específica para Información del Proyecto
                  <div className="space-y-6">
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <p className="text-green-800 text-sm font-medium mb-2">
                        Información del Proyecto: {project.name}
                      </p>
                      <p className="text-green-700 text-sm">
                        Datos básicos y detalles completos del proyecto
                      </p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {/* Información General */}
                      <div className="bg-white border border-gray-200 rounded-lg p-6">
                        <h3 className="text-md font-medium text-gray-900 mb-4 flex items-center gap-2">
                          <Building2 className="w-4 h-4" />
                          Información General
                        </h3>
                        <div className="space-y-3">
                          <div>
                            <span className="text-sm font-medium text-gray-600">Nombre del Proyecto:</span>
                            <p className="text-gray-900">{project.name}</p>
                          </div>
                          {project.company && (
                            <div>
                              <span className="text-sm font-medium text-gray-600">Empresa:</span>
                              <p className="text-gray-900">{project.company}</p>
                            </div>
                          )}
                          {project.project_type && (
                            <div>
                              <span className="text-sm font-medium text-gray-600">Tipo de Proyecto:</span>
                              <p className="text-gray-900 capitalize">{project.project_type}</p>
                            </div>
                          )}
                          {project.status && (
                            <div>
                              <span className="text-sm font-medium text-gray-600">Estado:</span>
                              <p className="text-gray-900 capitalize">{project.status}</p>
                            </div>
                          )}
                          {project.location && (
                            <div>
                              <span className="text-sm font-medium text-gray-600">Ubicación:</span>
                              <p className="text-gray-900">{project.location}</p>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Información del Cliente */}
                      <div className="bg-white border border-gray-200 rounded-lg p-6">
                        <h3 className="text-md font-medium text-gray-900 mb-4 flex items-center gap-2">
                          <User className="w-4 h-4" />
                          Información del Cliente
                        </h3>
                        <div className="space-y-3">
                          {project.client_name ? (
                            <div className="flex items-center gap-2">
                              <User className="w-4 h-4 text-gray-400" />
                              <span className="text-gray-900">{project.client_name}</span>
                            </div>
                          ) : (
                            <p className="text-gray-500 text-sm">Nombre no especificado</p>
                          )}
                          
                          {project.client_email ? (
                            <div className="flex items-center gap-2">
                              <Mail className="w-4 h-4 text-gray-400" />
                              <span className="text-gray-900">{project.client_email}</span>
                            </div>
                          ) : (
                            <p className="text-gray-500 text-sm">Email no especificado</p>
                          )}
                          
                          {project.client_phone ? (
                            <div className="flex items-center gap-2">
                              <Phone className="w-4 h-4 text-gray-400" />
                              <span className="text-gray-900">{project.client_phone}</span>
                            </div>
                          ) : (
                            <p className="text-gray-500 text-sm">Teléfono no especificado</p>
                          )}
                        </div>
                      </div>

                      {/* Fechas del Proyecto */}
                      <div className="bg-white border border-gray-200 rounded-lg p-6">
                        <h3 className="text-md font-medium text-gray-900 mb-4 flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          Fechas del Proyecto
                        </h3>
                        <div className="space-y-3">
                          <div>
                            <span className="text-sm font-medium text-gray-600">Creado:</span>
                            <p className="text-gray-900 text-sm">{formatDate(project.created_at)}</p>
                          </div>
                          <div>
                            <span className="text-sm font-medium text-gray-600">Última modificación:</span>
                            <p className="text-gray-900 text-sm">{formatDate(project.updated_at)}</p>
                          </div>
                        </div>
                      </div>

                      {/* Estadísticas */}
                      <div className="bg-white border border-gray-200 rounded-lg p-6">
                        <h3 className="text-md font-medium text-gray-900 mb-4 flex items-center gap-2">
                          <Calculator className="w-4 h-4" />
                          Estadísticas
                        </h3>
                        <div className="space-y-3">
                          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                            <div className="flex items-center justify-between">
                              <span className="text-blue-800 font-medium text-sm">Cálculos realizados</span>
                              <span className="text-blue-900 font-bold">{project.calculation_count || 0}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  // Vista para otros tipos de documento
                  <div className="space-y-6">
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <p className="text-blue-800 text-sm font-medium mb-2">
                        Documento seleccionado: {selectedDocumentType.name}
                      </p>
                      <p className="text-blue-700 text-sm">
                        {selectedDocumentType.description}
                      </p>
                    </div>

                    <div className="bg-white border border-gray-200 rounded-lg p-6">
                      <h3 className="text-md font-medium text-gray-900 mb-4 flex items-center gap-2">
                        <Calculator className="w-4 h-4" />
                        Funciones de Cálculo
                      </h3>
                      <div className="text-center py-8 text-gray-500">
                        <Calculator className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-600">
                          Aquí se integrarán las funciones de cálculo específicas para {selectedDocumentType.name}.
                        </p>
                        <p className="text-sm text-gray-400 mt-2">
                          Las calculadoras eléctricas serán integradas próximamente.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-sm border p-6 h-full">
                <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Documentos del Proyecto
                </h2>

                <div className="text-center py-12 text-gray-500">
                  <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-600 mb-2">
                    Selecciona un tipo de documento
                  </h3>
                  <p className="text-gray-500 mb-4">
                    Usa el panel lateral derecho para elegir el tipo de documento que deseas trabajar.
                  </p>
                </div>
              </div>
            )}
        </div>
      </div>

      {/* Document Type Sidebar */}
      <DocumentTypeSidebar
        onDocumentTypeSelect={handleDocumentTypeSelect}
        selectedType={selectedDocumentType}
        defaultCollapsed={false}
      />

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