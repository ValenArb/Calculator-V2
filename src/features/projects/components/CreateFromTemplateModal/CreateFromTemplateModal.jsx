import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { ArrowLeft, Zap, CheckCircle } from 'lucide-react';
import { Button, Input, Modal } from '../../../../components/ui';
import TemplateSelector from '../TemplateSelector';
import { templatesService } from '../../../../services/firebase/templates';
import toast from 'react-hot-toast';

const CreateFromTemplateModal = ({ 
  isOpen, 
  onClose, 
  onCreateProject,
  loading = false 
}) => {
  const [step, setStep] = useState('select'); // select, configure
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [isCreating, setIsCreating] = useState(false);

  const { register, handleSubmit, formState: { errors }, reset } = useForm({
    defaultValues: {
      name: '',
      description: '',
      company: '',
      location: '',
      client: '',
      contactEmail: '',
      contactPhone: ''
    }
  });

  const handleSelectTemplate = (template) => {
    setSelectedTemplate(template);
    setStep('configure');
    
    // Update form with template defaults
    reset({
      name: template.name,
      description: template.description,
      company: template.company || '',
      location: template.location || '',
      client: template.client || '',
      contactEmail: template.contactEmail || '',
      contactPhone: template.contactPhone || ''
    });
  };

  const handleCreateBlankProject = () => {
    onCreateProject({
      name: 'Nuevo Proyecto',
      description: '',
      type: 'residential',
      company: '',
      location: '',
      client: '',
      contactEmail: '',
      contactPhone: ''
    });
    handleClose();
  };

  const handleCreateFromTemplate = async (formData) => {
    if (!selectedTemplate) return;

    setIsCreating(true);
    try {
      // Call parent's create function with template data
      await onCreateProject({
        ...formData,
        type: selectedTemplate.type,
        templateId: selectedTemplate.id,
        data: selectedTemplate.data
      });
      
      toast.success(`Proyecto creado desde plantilla "${selectedTemplate.name}"`);
      handleClose();
    } catch (error) {
      console.error('Error creating project from template:', error);
      toast.error('Error al crear el proyecto desde la plantilla');
    } finally {
      setIsCreating(false);
    }
  };

  const handleBack = () => {
    setStep('select');
    setSelectedTemplate(null);
    reset();
  };

  const handleClose = () => {
    setStep('select');
    setSelectedTemplate(null);
    reset();
    onClose();
  };

  const difficultyColors = {
    beginner: 'bg-green-100 text-green-800',
    intermediate: 'bg-yellow-100 text-yellow-800',
    advanced: 'bg-red-100 text-red-800'
  };

  const difficultyLabels = {
    beginner: 'Principiante',
    intermediate: 'Intermedio', 
    advanced: 'Avanzado'
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={
        step === 'select' 
          ? 'Crear Proyecto' 
          : `Configurar: ${selectedTemplate?.name}`
      }
      size="lg"
    >
      {step === 'select' ? (
        <TemplateSelector
          onSelectTemplate={handleSelectTemplate}
          onCreateBlank={handleCreateBlankProject}
          loading={loading}
        />
      ) : (
        <form onSubmit={handleSubmit(handleCreateFromTemplate)} className="space-y-6">
          {/* Back Button */}
          <div className="flex items-center space-x-3">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleBack}
              disabled={isCreating}
              className="flex items-center space-x-2"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Volver a plantillas</span>
            </Button>
          </div>

          {/* Template Preview */}
          {selectedTemplate && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <div className="text-3xl">{selectedTemplate.icon || '📋'}</div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-blue-900 mb-1">
                    {selectedTemplate.name}
                  </h3>
                  <p className="text-sm text-blue-700 mb-2">
                    {selectedTemplate.description}
                  </p>
                  
                  <div className="flex items-center space-x-4 text-xs text-blue-600">
                    <span className={`px-2 py-1 rounded-full font-medium ${
                      difficultyColors[selectedTemplate.metadata?.difficulty] || difficultyColors.beginner
                    }`}>
                      {difficultyLabels[selectedTemplate.metadata?.difficulty] || 'Principiante'}
                    </span>
                    {selectedTemplate.metadata?.estimatedTime && (
                      <span>Tiempo estimado: {selectedTemplate.metadata.estimatedTime}</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Template Content Preview */}
              {selectedTemplate.data && (
                <div className="mt-4 pt-4 border-t border-blue-200">
                  <h4 className="text-sm font-medium text-blue-900 mb-2 flex items-center">
                    <Zap className="w-4 h-4 mr-2" />
                    Contenido incluido:
                  </h4>
                  <div className="grid grid-cols-2 gap-2 text-xs text-blue-700">
                    {selectedTemplate.data.dpms?.length > 0 && (
                      <div className="flex items-center space-x-1">
                        <CheckCircle className="w-3 h-3" />
                        <span>{selectedTemplate.data.dpms.length} elementos DPMS</span>
                      </div>
                    )}
                    {selectedTemplate.data.loadsByPanel?.length > 0 && (
                      <div className="flex items-center space-x-1">
                        <CheckCircle className="w-3 h-3" />
                        <span>{selectedTemplate.data.loadsByPanel.length} cargas por panel</span>
                      </div>
                    )}
                    {selectedTemplate.data.thermal?.length > 0 && (
                      <div className="flex items-center space-x-1">
                        <CheckCircle className="w-3 h-3" />
                        <span>{selectedTemplate.data.thermal.length} análisis térmicos</span>
                      </div>
                    )}
                    {selectedTemplate.data.voltageDrops?.length > 0 && (
                      <div className="flex items-center space-x-1">
                        <CheckCircle className="w-3 h-3" />
                        <span>{selectedTemplate.data.voltageDrops.length} caídas de tensión</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Project Configuration */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">
              Personaliza tu proyecto
            </h3>
            
            <div className="grid grid-cols-1 gap-4">
              <Input
                label="Nombre del proyecto"
                {...register('name', { 
                  required: 'El nombre del proyecto es requerido',
                  minLength: {
                    value: 3,
                    message: 'El nombre debe tener al menos 3 caracteres'
                  }
                })}
                error={errors.name?.message}
                placeholder="Ej. Instalación Industrial ABC"
              />

              <div>
                <label className="form-label">Descripción</label>
                <textarea
                  {...register('description')}
                  className="form-input"
                  rows={3}
                  placeholder="Descripción personalizada del proyecto..."
                />
              </div>
            </div>

            {/* Company and Location */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Empresa"
                {...register('company')}
                placeholder="Nombre de la empresa o contratista"
              />

              <Input
                label="Ubicación"
                {...register('location')}
                placeholder="Dirección o ubicación del proyecto"
              />
            </div>

            {/* Client */}
            <Input
              label="Cliente"
              {...register('client')}
              placeholder="Nombre del cliente"
            />

            {/* Contact Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Email del Encargado"
                type="email"
                {...register('contactEmail', {
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: 'Email inválido'
                  }
                })}
                error={errors.contactEmail?.message}
                placeholder="encargado@empresa.com"
              />

              <Input
                label="Teléfono de Contacto"
                type="tel"
                {...register('contactPhone')}
                placeholder="+1 234 567 8900"
              />
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end space-x-3 pt-4">
            <Button
              type="button"
              variant="secondary"
              onClick={handleClose}
              disabled={isCreating}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              loading={isCreating || loading}
              disabled={isCreating || loading}
            >
              Crear Proyecto
            </Button>
          </div>
        </form>
      )}
    </Modal>
  );
};

export default CreateFromTemplateModal;