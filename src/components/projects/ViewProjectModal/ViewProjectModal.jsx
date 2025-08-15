import React, { useState, useEffect } from 'react';
import { Modal } from '../../ui';
import { User, Mail, Phone, MapPin, Calendar, FileText, Hash, Image as ImageIcon } from 'lucide-react';
import toast from 'react-hot-toast';
import projectsService from '../../../services/firebase/projects';

const ViewProjectModal = ({ isOpen, onClose, userId, projectId }) => {
  const [project, setProject] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const statusOptions = {
    'draft': { name: 'Borrador', color: 'bg-yellow-100 text-yellow-800' },
    'active': { name: 'Activo', color: 'bg-green-100 text-green-800' },
    'completed': { name: 'Completado', color: 'bg-blue-100 text-blue-800' },
    'archived': { name: 'Archivado', color: 'bg-gray-100 text-gray-800' }
  };

  // Load project data when modal opens
  useEffect(() => {
    const loadProject = async () => {
      if (!isOpen || !projectId || !userId) return;
      
      setIsLoading(true);
      try {
        const projectData = await projectsService.getProject(projectId, userId);
        setProject(projectData);
      } catch (error) {
        console.error('Error loading project:', error);
        toast.error('Error al cargar el proyecto');
        onClose();
      } finally {
        setIsLoading(false);
      }
    };

    loadProject();
  }, [isOpen, projectId, userId, onClose]);

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
    
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (isLoading) {
    return (
      <Modal isOpen={isOpen} onClose={onClose} title="Ver Proyecto" size="lg">
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-gray-600">Cargando proyecto...</span>
        </div>
      </Modal>
    );
  }

  if (!project) {
    return (
      <Modal isOpen={isOpen} onClose={onClose} title="Ver Proyecto" size="lg">
        <div className="text-center py-8">
          <p className="text-gray-500">No se pudo cargar el proyecto</p>
        </div>
      </Modal>
    );
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Ver Proyecto"
      size="lg"
    >
      <div className="space-y-6">
        {/* Project Header */}
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center gap-4">
            {/* Client Logo or Default Icon */}
            <div className="w-12 h-12 rounded-lg flex items-center justify-center bg-gray-100 border border-gray-200">
              {project.client_logo_url ? (
                <img
                  src={project.client_logo_url}
                  alt={`Logo de ${project.client_name}`}
                  className="w-10 h-10 object-contain rounded"
                />
              ) : (
                <ImageIcon className="w-6 h-6 text-gray-400" />
              )}
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900">{project.name}</h3>
              <div className="flex items-center gap-4 mt-1">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  statusOptions[project.status]?.color
                }`}>
                  {statusOptions[project.status]?.name}
                </span>
                {project.client_name && (
                  <span className="text-sm text-gray-500">
                    Cliente: {project.client_name}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Project Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Description */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Descripción
            </label>
            <div className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-900">
              {project.description || 'Sin descripción'}
            </div>
          </div>

          {/* Project Statistics */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
              <Hash className="w-4 h-4" />
              Cálculos Realizados
            </label>
            <div className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-900">
              {project.calculation_count || 0}
            </div>
          </div>

          {/* Location */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
              <MapPin className="w-4 h-4" />
              Ubicación
            </label>
            <div className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-900">
              {project.location || 'No especificada'}
            </div>
          </div>
        </div>

        {/* Client Information */}
        <div>
          <h4 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
            <User className="w-5 h-5" />
            Contacto con Cliente
          </h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nombre del Cliente
              </label>
              <div className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-900">
                {project.client_name || 'No especificado'}
              </div>
            </div>

            {/* Client Logo Display */}
            {project.client_logo_url && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
                  <ImageIcon className="w-4 h-4" />
                  Logo del Cliente
                </label>
                <div className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg">
                  <img
                    src={project.client_logo_url}
                    alt={`Logo de ${project.client_name}`}
                    className="h-16 object-contain bg-white rounded border border-gray-100"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
                <Mail className="w-4 h-4" />
                Email
              </label>
              <div className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-900">
                {project.client_email || 'No especificado'}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
                <Phone className="w-4 h-4" />
                Teléfono
              </label>
              <div className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-900">
                {project.client_phone || 'No especificado'}
              </div>
            </div>
          </div>
        </div>

        {/* Project Dates */}
        <div>
          <h4 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Información de Fechas
          </h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Fecha de Creación
              </label>
              <div className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-900">
                {formatDate(project.created_at)}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Última Modificación
              </label>
              <div className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-900">
                {formatDate(project.updated_at)}
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cerrar
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default ViewProjectModal;