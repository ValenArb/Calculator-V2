import React, { useState, useEffect } from 'react';
import { Users, Plus, Settings, Trash2, Crown, Shield, User, Eye, UserPlus, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { useSelector } from 'react-redux';
import { Modal } from '../ui';
import { usersService, USER_ROLES } from '../../services/firebase/users';
import projectsService from '../../services/firebase/projects';
import notificationsService from '../../services/firebase/notifications';
import emailService from '../../services/email';
import useUserPermissions from '../../hooks/useUserPermissions';

/**
 * Comprehensive Collaborator Management Modal
 * Handles both viewing collaborators and inviting new ones
 */
const CollaboratorManagementModal = ({ 
  isOpen, 
  onClose, 
  project, 
  onProjectUpdate 
}) => {
  const { user } = useSelector((state) => state.auth);
  const { canManageUsers, isOwner } = useUserPermissions(project);
  
  const [collaborators, setCollaborators] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('list'); // 'list' or 'invite'
  
  // Invitation state
  const [inviteData, setInviteData] = useState({ email: '', message: '', role: 'user' });
  const [isInviting, setIsInviting] = useState(false);
  
  // Role management state
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [selectedCollaborator, setSelectedCollaborator] = useState(null);
  const [updatingRole, setUpdatingRole] = useState(false);

  // Load collaborators data
  useEffect(() => {
    if (isOpen && project) {
      loadCollaborators();
    }
  }, [isOpen, project]);

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

  // Send invitation
  const sendInvitation = async () => {
    if (!inviteData.email) {
      toast.error('El email es requerido');
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(inviteData.email)) {
      toast.error('Por favor ingresa un email válido');
      return;
    }

    // Prevent self-invitations
    if (inviteData.email.toLowerCase() === user.email.toLowerCase()) {
      toast.error('No puedes invitarte a ti mismo');
      return;
    }

    setIsInviting(true);
    try {
      // Search user by email to get their UID
      const recipientUser = await usersService.getUserByEmail(inviteData.email);
      
      if (!recipientUser) {
        toast.error(`Usuario con email "${inviteData.email}" no encontrado en la base de datos. Verifica que el usuario esté registrado.`);
        setIsInviting(false);
        return;
      }

      // Check if user is already part of the project
      if (project.owner_id === recipientUser.uid) {
        toast.error('Este usuario ya es el dueño del proyecto');
        setIsInviting(false);
        return;
      }

      if (project.collaborators && project.collaborators.includes(recipientUser.uid)) {
        toast.error('Este usuario ya es colaborador del proyecto');
        setIsInviting(false);
        return;
      }

      // Check for pending invitations
      const existingNotifications = await notificationsService.getUserNotifications(inviteData.email);
      const pendingInvitations = existingNotifications.filter(
        notification => 
          notification.type === 'project_invitation' && 
          notification.status === 'pending' &&
          notification.metadata?.projectId === project.id &&
          notification.metadata?.senderUid === user.uid
      );

      if (pendingInvitations.length > 0) {
        toast.error('Ya existe una invitación pendiente para este usuario en este proyecto');
        setIsInviting(false);
        return;
      }

      console.log('🔍 Creating invitation with data:', {
        recipientEmail: inviteData.email,
        recipientUid: recipientUser.uid,
        senderUid: user.uid,
        senderName: user.displayName || user.email,
        senderEmail: user.email,
        projectId: project.id,
        projectName: project.name,
        message: inviteData.message,
        role: inviteData.role
      });

      let invitationResult;
      try {
        invitationResult = await notificationsService.createProjectInvitation({
          recipientEmail: inviteData.email,
          recipientUid: recipientUser.uid,
          senderUid: user.uid,
          senderName: user.displayName || user.email,
          senderEmail: user.email,
          projectId: project.id,
          projectName: project.name,
          message: inviteData.message,
          role: inviteData.role
        });

        console.log('✅ Invitation created successfully:', invitationResult);
      } catch (invitationError) {
        console.error('❌ Error creating invitation:', invitationError);
        toast.error(`Error al crear la invitación: ${invitationError.message}`);
        setIsInviting(false);
        return;
      }

      // Send email notification if invitation was created successfully
      if (invitationResult) {
        try {
          console.log('🔍 Sending invitation email with data:', {
            email: inviteData.email,
            inviterName: user.displayName || user.email,
            projectName: project.name,
            role: inviteData.role,
            invitationToken: invitationResult,
            projectId: project.id
          });
          
          const emailResult = await emailService.sendInvitation({
            email: inviteData.email,
            inviterName: user.displayName || user.email,
            projectName: project.name,
            role: inviteData.role,
            invitationToken: invitationResult,
            projectId: project.id
          });
          
          console.log('✅ Email sent successfully:', emailResult);
          toast.success('Invitación enviada exitosamente por email');
        } catch (emailError) {
          console.error('❌ Error sending invitation email:', emailError);
          console.error('Email error details:', emailError.message, emailError.stack);
          // Don't fail the whole invitation if email fails
          toast.error(`Invitación creada exitosamente pero no se pudo enviar email: ${emailError.message}`);
        }
      } else {
        toast.success('Invitación enviada exitosamente');
      }

      setInviteData({ email: '', message: '', role: 'user' });
      setActiveTab('list');
    } catch (error) {
      console.error('Error sending invitation:', error);
      toast.error('Error al enviar la invitación');
    } finally {
      setIsInviting(false);
    }
  };

  // Handle role change
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

  // Remove collaborator
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

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title="Administrar Colaboradores"
        size="lg"
      >
        <div className="space-y-4">
          {/* Tabs */}
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setActiveTab('list')}
              className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${
                activeTab === 'list'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <Users className="w-4 h-4 inline mr-2" />
              Colaboradores ({collaborators.length})
            </button>
            {canManageUsers && (
              <button
                onClick={() => setActiveTab('invite')}
                className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${
                  activeTab === 'invite'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <UserPlus className="w-4 h-4 inline mr-2" />
                Invitar Usuario
              </button>
            )}
          </div>

          {/* Tab Content */}
          {activeTab === 'list' ? (
            // Collaborators List
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {loading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="animate-pulse flex items-center gap-3 p-3 border rounded-lg">
                      <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                      <div className="flex-1">
                        <div className="h-4 bg-gray-200 rounded w-1/3 mb-2"></div>
                        <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : collaborators.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p>No hay colaboradores en este proyecto</p>
                </div>
              ) : (
                collaborators.map((collaborator) => (
                  <div
                    key={collaborator.id}
                    className="flex items-center justify-between p-3 border border-gray-100 rounded-lg hover:bg-gray-50"
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
                ))
              )}
            </div>
          ) : (
            // Invite User Form
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email del Usuario
                </label>
                <input
                  type="email"
                  value={inviteData.email}
                  onChange={(e) => setInviteData(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="usuario@ejemplo.com"
                  disabled={isInviting}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Rol del Usuario
                </label>
                <select
                  value={inviteData.role}
                  onChange={(e) => setInviteData(prev => ({ ...prev, role: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={isInviting}
                >
                  <option value={USER_ROLES.ADMIN}>Administrador - Puede editar el proyecto e invitar usuarios</option>
                  <option value={USER_ROLES.USER}>Usuario - Puede editar cálculos y agregar firmas</option>
                  <option value={USER_ROLES.VIEWER}>Visor - Solo puede ver el proyecto</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mensaje (opcional)
                </label>
                <textarea
                  value={inviteData.message}
                  onChange={(e) => setInviteData(prev => ({ ...prev, message: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows="3"
                  placeholder="Mensaje personalizado para el usuario invitado..."
                  disabled={isInviting}
                />
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  onClick={() => setActiveTab('list')}
                  disabled={isInviting}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                >
                  Cancelar
                </button>
                <button
                  onClick={sendInvitation}
                  disabled={isInviting}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                  {isInviting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Enviando...
                    </>
                  ) : (
                    <>
                      <UserPlus className="w-4 h-4" />
                      Enviar Invitación
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </Modal>

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

export default CollaboratorManagementModal;