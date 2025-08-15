import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Copy, X } from 'lucide-react';
import { Button, Input, Modal } from '../../../../components/ui';

const DuplicateProjectModal = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  project, 
  loading = false 
}) => {
  const { register, handleSubmit, formState: { errors }, reset } = useForm({
    defaultValues: {
      name: project ? `${project.name} (Copia)` : '',
      description: project?.description || ''
    }
  });

  const handleDuplicate = async (formData) => {
    await onConfirm({
      name: formData.name,
      description: formData.description
    });
    reset();
  };

  const handleCancel = () => {
    reset();
    onClose();
  };

  if (!project) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleCancel}
      title="Duplicar Proyecto"
      size="md"
    >
      <form onSubmit={handleSubmit(handleDuplicate)} className="space-y-4">
        <div className="flex items-start space-x-3 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <Copy className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
          <div>
            <h4 className="text-sm font-medium text-blue-900 mb-1">
              Duplicando: "{project.name}"
            </h4>
            <p className="text-xs text-blue-700">
              Se creará una copia completa con todos los cálculos y configuraciones.
              Los colaboradores no se copiarán y serás el propietario del nuevo proyecto.
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <Input
            label="Nombre del proyecto duplicado"
            {...register('name', { 
              required: 'El nombre del proyecto es requerido',
              minLength: {
                value: 3,
                message: 'El nombre debe tener al menos 3 caracteres'
              }
            })}
            error={errors.name?.message}
            placeholder="Ej. Instalación Industrial ABC (Copia)"
          />

          <div>
            <label className="form-label">Descripción (opcional)</label>
            <textarea
              {...register('description')}
              className="form-input"
              rows={3}
              placeholder="Descripción del proyecto duplicado..."
            />
            {errors.description && (
              <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
            )}
          </div>
        </div>

        <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
          <h4 className="text-sm font-medium text-gray-900 mb-2">
            ¿Qué se duplicará?
          </h4>
          <ul className="text-xs text-gray-700 space-y-1">
            <li>• ✅ Información del proyecto (nombre, tipo, empresa, etc.)</li>
            <li>• ✅ Todos los cálculos DPMS</li>
            <li>• ✅ Cargas por panel</li>
            <li>• ✅ Análisis térmico</li>
            <li>• ✅ Caídas de tensión</li>
            <li>• ✅ Cortocircuitos</li>
            <li>• ❌ Colaboradores (comenzará sin colaboradores)</li>
            <li>• ❌ Historial de modificaciones</li>
          </ul>
        </div>

        <div className="flex justify-end space-x-3 pt-4">
          <Button
            type="button"
            variant="secondary"
            onClick={handleCancel}
            disabled={loading}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            loading={loading}
            disabled={loading}
            className="flex items-center"
          >
            <Copy className="w-4 h-4 mr-2" />
            Duplicar Proyecto
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default DuplicateProjectModal;