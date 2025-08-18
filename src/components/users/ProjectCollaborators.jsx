import React, { useState, useEffect } from 'react';
import { Users, Plus, Settings, Trash2, Crown, Shield, User, Eye } from 'lucide-react';
import toast from 'react-hot-toast';
import { useSelector } from 'react-redux';
import { Modal } from '../ui';
import { usersService, USER_ROLES } from '../../services/firebase/users';
import projectsService from '../../services/firebase/projects';
import useUserPermissions from '../../hooks/useUserPermissions';

/**
 * Project Collaborators Management Component
 * Displays project team members with their roles and provides management functionality
 */
const ProjectCollaborators = ({ project, onProjectUpdate }) => {
  const { user } = useSelector((state) => state.auth);
  const { canManageUsers, isOwner } = useUserPermissions(project);
  
  const [collaborators, setCollaborators] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [selectedCollaborator, setSelectedCollaborator] = useState(null);
  const [updatingRole, setUpdatingRole] = useState(false);

  // Load collaborators data
  useEffect(() => {
    loadCollaborators();
  }, [project]);

  const loadCollaborators = async () => {
    try {
      setLoading(true);
      
      // Get owner data
      const ownerData = await usersService.getUserByUid(project.owner_id);
      
      // Get collaborators data
      const collaboratorUids = project.collaborators || [];
      const collaboratorsData = await usersService.getUsersByUids(collaboratorUids);
      
      // Combine owner and collaborators with their roles
      const allMembers = [];
      
      if (ownerData) {
        allMembers.push({
          ...usersService.getUserDisplayInfo(ownerData),
          role: USER_ROLES.OWNER,
          isOwner: true
        });
      }
      
      collaboratorsData.forEach(collaborator => {
        const collaboratorRole = project.collaborators_roles?.[collaborator.uid] || USER_ROLES.USER;
        allMembers.push({
          ...usersService.getUserDisplayInfo(collaborator),
          role: collaboratorRole,
          isOwner: false
        });
      });
      
      setCollaborators(allMembers);
    } catch (error) {
      console.error('Error loading collaborators:', error);
      toast.error('Error al cargar colaboradores');
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (newRole) => {
    if (!selectedCollaborator || !canManageUsers) return;
    
    try {
      setUpdatingRole(true);
      
      await projectsService.updateCollaboratorRole(
        project.id,
        selectedCollaborator.id,
        newRole,
        user.uid
      );
      
      toast.success('Rol actualizado correctamente');
      
      // Reload collaborators
      await loadCollaborators();
      
      // Update parent component
      if (onProjectUpdate) {
        onProjectUpdate();
      }
      
      setShowRoleModal(false);
      setSelectedCollaborator(null);
    } catch (error) {
      console.error('Error updating role:', error);
      toast.error('Error al actualizar el rol');
    } finally {
      setUpdatingRole(false);
    }
  };

  const handleRemoveCollaborator = async (collaboratorId) => {
    if (!canManageUsers) return;
    
    if (!confirm('¿Estás seguro de que deseas eliminar este colaborador del proyecto?')) {
      return;
    }
    
    try {
      await projectsService.removeCollaborator(project.id, collaboratorId, user.uid);
      toast.success('Colaborador eliminado del proyecto');
      
      // Reload collaborators
      await loadCollaborators();
      
      // Update parent component
      if (onProjectUpdate) {
        onProjectUpdate();
      }
    } catch (error) {
      console.error('Error removing collaborator:', error);
      toast.error('Error al eliminar colaborador');
    }
  };

  const getRoleIcon = (role) => {
    switch (role) {
      case USER_ROLES.OWNER:
        return <Crown className="w-4 h-4 text-yellow-600" />;
      case USER_ROLES.ADMIN:
        return <Shield className="w-4 h-4 text-blue-600" />;
      case USER_ROLES.USER:
        return <User className="w-4 h-4 text-green-600" />;
      case USER_ROLES.VIEWER:
        return <Eye className="w-4 h-4 text-gray-600" />;
      default:
        return <User className="w-4 h-4 text-gray-600" />;
    }
  };

  const getRoleLabel = (role) => {
    switch (role) {
      case USER_ROLES.OWNER:
        return 'Propietario';
      case USER_ROLES.ADMIN:
        return 'Administrador';
      case USER_ROLES.USER:
        return 'Usuario';
      case USER_ROLES.VIEWER:
        return 'Visor';
      default:
        return 'Usuario';
    }
  };

  const getRoleColor = (role) => {
    switch (role) {
      case USER_ROLES.OWNER:
        return 'bg-yellow-100 text-yellow-800';
      case USER_ROLES.ADMIN:
        return 'bg-blue-100 text-blue-800';
      case USER_ROLES.USER:
        return 'bg-green-100 text-green-800';
      case USER_ROLES.VIEWER:
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-4">
          <Users className="w-5 h-5 text-gray-600" />
          <h3 className="text-lg font-semibold text-gray-900">Colaboradores</h3>
        </div>
        <div className="animate-pulse space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
              <div className="flex-1">
                <div className="h-4 bg-gray-200 rounded w-1/3 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Users className="w-5 h-5 text-gray-600" />
            <h3 className="text-lg font-semibold text-gray-900">
              Colaboradores ({collaborators.length})
            </h3>
          </div>
        </div>

        <div className="space-y-3">
          {collaborators.map((collaborator) => (
            <div
              key={collaborator.id}
              className="flex items-center justify-between p-3 rounded-lg border border-gray-100 hover:bg-gray-50"
            >
              <div className="flex items-center gap-3">
                {/* Avatar */}
                <div className="w-10 h-10 bg-blue-500 text-white rounded-full flex items-center justify-center font-semibold overflow-hidden">
                  {collaborator.photoURL ? (
                    <img 
                      src={collaborator.photoURL} 
                      alt={collaborator.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-sm">{collaborator.initials}</span>
                  )}
                </div>

                {/* User Info */}
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-gray-900">{collaborator.name}</p>
                    {collaborator.id === user.uid && (
                      <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                        Tú
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600">{collaborator.email}</p>
                </div>

                {/* Role Badge */}
                <div className="flex items-center gap-2">
                  {getRoleIcon(collaborator.role)}
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRoleColor(collaborator.role)}`}>
                    {getRoleLabel(collaborator.role)}
                  </span>
                </div>
              </div>

              {/* Actions */}
              {canManageUsers && !collaborator.isOwner && collaborator.id !== user.uid && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setSelectedCollaborator(collaborator);
                      setShowRoleModal(true);
                    }}
                    className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                    title="Cambiar rol"
                  >
                    <Settings className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleRemoveCollaborator(collaborator.id)}
                    className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                    title="Eliminar colaborador"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>

        {collaborators.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p>No hay colaboradores en este proyecto</p>
          </div>
        )}
      </div>

      {/* Role Change Modal */}
      <Modal
        isOpen={showRoleModal}
        onClose={() => {
          setShowRoleModal(false);
          setSelectedCollaborator(null);
        }}
        title="Cambiar Rol"
      >
        {selectedCollaborator && (
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <div className="w-10 h-10 bg-blue-500 text-white rounded-full flex items-center justify-center font-semibold overflow-hidden">
                {selectedCollaborator.photoURL ? (
                  <img 
                    src={selectedCollaborator.photoURL} 
                    alt={selectedCollaborator.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-sm">{selectedCollaborator.initials}</span>
                )}
              </div>
              <div>
                <p className="font-medium text-gray-900">{selectedCollaborator.name}</p>
                <p className="text-sm text-gray-600">{selectedCollaborator.email}</p>
              </div>
            </div>

            <div className="space-y-3">
              <p className="font-medium text-gray-900">Seleccionar nuevo rol:</p>
              {Object.values(USER_ROLES).filter(role => role !== USER_ROLES.OWNER).map((role) => (
                <button
                  key={role}
                  onClick={() => handleRoleChange(role)}
                  disabled={updatingRole || role === selectedCollaborator.role}
                  className={`w-full flex items-center gap-3 p-3 border rounded-lg transition-colors ${
                    role === selectedCollaborator.role
                      ? 'border-blue-300 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  } ${updatingRole ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {getRoleIcon(role)}
                  <div className="text-left">
                    <p className="font-medium text-gray-900">{getRoleLabel(role)}</p>
                    <p className="text-sm text-gray-600">
                      {role === USER_ROLES.ADMIN && 'Puede editar el proyecto e invitar usuarios'}
                      {role === USER_ROLES.USER && 'Puede editar cálculos y agregar firmas'}
                      {role === USER_ROLES.VIEWER && 'Solo puede ver el proyecto'}
                    </p>
                  </div>
                  {role === selectedCollaborator.role && (
                    <span className="ml-auto text-blue-600 text-sm">Actual</span>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}
      </Modal>
    </>
  );
};

export default ProjectCollaborators;