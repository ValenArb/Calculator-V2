import { useForm } from 'react-hook-form';
import { Button, Input } from '../../../../components/ui';

const ProjectForm = ({ onSubmit, onCancel, initialData, loading }) => {
  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: {
      name: initialData?.name || '',
      description: initialData?.description || '',
      type: initialData?.type || 'residential',
      company: initialData?.company || '',
      location: initialData?.location || '',
      client: initialData?.client || '',
      contactEmail: initialData?.contactEmail || '',
      contactPhone: initialData?.contactPhone || ''
    }
  });

  const handleFormSubmit = (data) => {
    onSubmit({
      ...data,
      data: initialData?.data || {
        dpms: [],
        loadsByPanel: [],
        thermal: [],
        voltageDrops: [],
        shortCircuit: []
      }
    });
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
      {/* Basic Information */}
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
            placeholder="Descripción opcional del proyecto..."
          />
          {errors.description && (
            <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
          )}
        </div>
      </div>

      {/* Project Type */}
      <div className="grid grid-cols-1 gap-4">
        <div>
          <label className="form-label">Tipo de Proyecto</label>
          <select
            {...register('type', { required: 'El tipo de proyecto es requerido' })}
            className="form-input"
          >
            <option value="residential">Residencial</option>
            <option value="commercial">Comercial</option>
            <option value="industrial">Industrial</option>
          </select>
          {errors.type && (
            <p className="mt-1 text-sm text-red-600">{errors.type.message}</p>
          )}
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

      {/* Client Information */}
      <div className="grid grid-cols-1 gap-4">
        <Input
          label="Cliente"
          {...register('client')}
          placeholder="Nombre del cliente"
        />
      </div>

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


      <div className="flex justify-end space-x-3 pt-4">
        <Button
          type="button"
          variant="secondary"
          onClick={onCancel}
          disabled={loading}
        >
          Cancelar
        </Button>
        <Button
          type="submit"
          loading={loading}
          disabled={loading}
        >
          {initialData ? 'Actualizar' : 'Crear'} Proyecto
        </Button>
      </div>
    </form>
  );
};

export default ProjectForm;