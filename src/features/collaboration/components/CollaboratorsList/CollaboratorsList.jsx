import { useState } from 'react';
import { Users, Plus, X, Crown, Mail } from 'lucide-react';
import { Button, Input, Modal } from '../../../../components/ui';
import useCollaboration from '../../hooks/useCollaboration';

const CollaboratorsList = ({ project }) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [newCollaboratorEmail, setNewCollaboratorEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  
  const {
    addCollaborator,
    removeCollaborator,
    isSharing,
    isOwner,
    activeUsers
  } = useCollaboration();

  const handleAddCollaborator = async () => {
    setEmailError('');
    
    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newCollaboratorEmail)) {
      setEmailError('Por favor ingresa un email válido');
      return;
    }

    const success = await addCollaborator(newCollaboratorEmail);
    if (success) {
      setNewCollaboratorEmail('');
      setShowAddModal(false);
    }
  };

  const handleRemoveCollaborator = async (email) => {
    if (window.confirm(`¿Estás seguro de que quieres remover a ${email} del proyecto?`)) {
      await removeCollaborator(email);
    }
  };

  const isUserActive = (email) => {
    return activeUsers.some(user => user.email === email && user.isActive);
  };

  if (!project) return null;

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Users className="w-5 h-5 text-gray-500" />
          <h3 className="text-lg font-medium text-gray-900">Colaboradores</h3>
          {activeUsers.length > 0 && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
              {activeUsers.length} activo{activeUsers.length !== 1 ? 's' : ''}
            </span>
          )}
        </div>
        
        {isOwner && (
          <Button
            onClick={() => setShowAddModal(true)}
            size="sm"
            disabled={isSharing}
          >
            <Plus className="w-4 h-4 mr-2" />
            Agregar
          </Button>
        )}
      </div>

      <div className="space-y-3">
        {/* Project Owner */}
        <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg border border-yellow-200">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
              <Crown className="w-4 h-4 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">Propietario</p>
              <p className="text-xs text-gray-500">Acceso total al proyecto</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {isUserActive('owner@project.com') && (
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            )}
          </div>
        </div>

        {/* Collaborators */}
        {project.collaborators.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Users className="w-12 h-12 mx-auto mb-2 text-gray-300" />
            <p className="text-sm">No hay colaboradores aún</p>
            {isOwner && (
              <p className="text-xs mt-1">Agrega colaboradores para trabajar en equipo</p>
            )}
          </div>
        ) : (
          project.collaborators.map((email) => (
            <div
              key={email}
              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
            >
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                  <Mail className="w-4 h-4 text-gray-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">{email}</p>
                  <p className="text-xs text-gray-500">Colaborador</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                {isUserActive(email) && (
                  <div className="flex items-center space-x-1">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-xs text-green-600">En línea</span>
                  </div>
                )}
                
                {isOwner && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveCollaborator(email)}
                    disabled={isSharing}
                    className="p-1 text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add Collaborator Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => {
          setShowAddModal(false);
          setNewCollaboratorEmail('');
          setEmailError('');
        }}
        title="Agregar Colaborador"
        size="md"
      >
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            Ingresa el email de la persona que quieres invitar a colaborar en este proyecto.
          </p>
          
          <Input
            label="Email del colaborador"
            type="email"
            value={newCollaboratorEmail}
            onChange={(e) => {
              setNewCollaboratorEmail(e.target.value);
              setEmailError('');
            }}
            error={emailError}
            placeholder="colaborador@ejemplo.com"
          />
          
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <h4 className="text-sm font-medium text-blue-900 mb-1">
              Permisos del colaborador:
            </h4>
            <ul className="text-xs text-blue-800 space-y-1">
              <li>• Ver y editar todos los cálculos</li>
              <li>• Guardar cambios en el proyecto</li>
              <li>• Exportar resultados</li>
              <li>• No puede agregar/remover otros colaboradores</li>
            </ul>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <Button
              variant="secondary"
              onClick={() => {
                setShowAddModal(false);
                setNewCollaboratorEmail('');
                setEmailError('');
              }}
              disabled={isSharing}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleAddCollaborator}
              loading={isSharing}
              disabled={isSharing || !newCollaboratorEmail.trim()}
            >
              Agregar Colaborador
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default CollaboratorsList;