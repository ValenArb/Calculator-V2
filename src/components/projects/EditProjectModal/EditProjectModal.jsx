import React, { useState, useEffect } from 'react';
import { Modal } from '../../ui';
import { User, Mail, Phone, MapPin } from 'lucide-react';
import toast from 'react-hot-toast';
import projectsService from '../../../services/firebase/projects';
import ClientLogoUploader from '../ClientLogoUploader';

const EditProjectModal = ({ isOpen, onClose, userId, projectId, onProjectUpdated }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    status: 'draft',
    clientName: '',
    clientEmail: '',
    clientPhone: '',
    location: '',
    clientLogoUrl: null
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const statusOptions = [
    { id: 'draft', name: 'Borrador', color: 'text-yellow-600' },
    { id: 'active', name: 'Activo', color: 'text-green-600' },
    { id: 'completed', name: 'Completado', color: 'text-blue-600' },
    { id: 'archived', name: 'Archivado', color: 'text-gray-600' }
  ];

  // Load project data when modal opens
  useEffect(() => {
    const loadProject = async () => {
      if (!isOpen || !projectId || !userId) return;
      
      setIsLoading(true);
      try {
        const project = await projectsService.getProject(projectId, userId);
        setFormData({
          name: project.name || '',
          description: project.description || '',
          status: project.status || 'draft',
          clientName: project.client_name || '',
          clientEmail: project.client_email || '',
          clientPhone: project.client_phone || '',
          location: project.location || '',
          clientLogoUrl: project.client_logo_url || null
        });
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

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleLogoChange = (logoUrl) => {
    setFormData(prev => ({
      ...prev,
      clientLogoUrl: logoUrl
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast.error('El nombre del proyecto es requerido');
      return;
    }

    setIsSubmitting(true);
    
    try {
      const projectData = {
        name: formData.name,
        description: formData.description,
        status: formData.status,
        client_name: formData.clientName,
        client_email: formData.clientEmail,
        client_phone: formData.clientPhone,
        location: formData.location,
        client_logo_url: formData.clientLogoUrl
      };

      const updatedProject = await projectsService.updateProject(projectId, projectData, userId);
      
      toast.success('Proyecto actualizado exitosamente');
      
      // Notify parent component to refresh projects
      if (onProjectUpdated) {
        onProjectUpdated(updatedProject);
      }
      
      onClose();
      
    } catch (error) {
      console.error('Error updating project:', error);
      toast.error('Error al actualizar el proyecto: ' + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <Modal isOpen={isOpen} onClose={onClose} title="Editar Proyecto" size="lg">
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-gray-600">Cargando proyecto...</span>
        </div>
      </Modal>
    );
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Editar Proyecto"
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Project Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nombre del Proyecto *
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Ej: Instalación Eléctrica Edificio Central"
              required
            />
          </div>

          <div className="md:col-span-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Estado del Proyecto
            </label>
            <select
              name="status"
              value={formData.status}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {statusOptions.map((status) => (
                <option key={status.id} value={status.id}>
                  {status.name}
                </option>
              ))}
            </select>
          </div>

          <div className="md:col-span-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Descripción
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Descripción detallada del proyecto..."
            />
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
              <input
                type="text"
                name="clientName"
                value={formData.clientName}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Nombre completo"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="email"
                  name="clientEmail"
                  value={formData.clientEmail}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="email@ejemplo.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Teléfono
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="tel"
                  name="clientPhone"
                  value={formData.clientPhone}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="+54 11 1234-5678"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ubicación
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Ciudad, Provincia"
                />
              </div>
            </div>
          </div>

          {/* Client Logo Upload */}
          <div className="mt-6">
            <ClientLogoUploader
              userId={userId}
              clientName={formData.clientName}
              currentLogoUrl={formData.clientLogoUrl}
              onLogoChange={handleLogoChange}
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Actualizando...
              </>
            ) : (
              'Actualizar Proyecto'
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default EditProjectModal;