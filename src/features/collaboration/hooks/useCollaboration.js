import { useState, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { firestoreService } from '../../../services/firebase/firestore';
import { updateCurrentProject } from '../../../store/slices/projectsSlice';
import { addActiveUser, removeActiveUser, setActiveUsers } from '../../../store/slices/collaborationSlice';
import toast from 'react-hot-toast';

export const useCollaboration = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { currentProject } = useSelector((state) => state.projects);
  const { activeUsers } = useSelector((state) => state.collaboration);
  const [isSharing, setIsSharing] = useState(false);

  // Add collaborator to project
  const addCollaborator = useCallback(async (email) => {
    if (!currentProject || !user) return false;

    if (email === user.email) {
      toast.error('No puedes agregarte a ti mismo como colaborador');
      return false;
    }

    if (currentProject.collaborators.includes(email)) {
      toast.error('Este usuario ya es colaborador del proyecto');
      return false;
    }

    setIsSharing(true);
    try {
      await firestoreService.addCollaborator(currentProject.id, email);
      
      // Update local state
      const updatedProject = {
        ...currentProject,
        collaborators: [...currentProject.collaborators, email]
      };
      dispatch(updateCurrentProject(updatedProject));
      
      toast.success(`Colaborador ${email} agregado exitosamente`);
      return true;
    } catch (error) {
      console.error('Error adding collaborator:', error);
      toast.error('Error al agregar colaborador. Verifica que el email sea correcto.');
      return false;
    } finally {
      setIsSharing(false);
    }
  }, [currentProject, user, dispatch]);

  // Remove collaborator from project
  const removeCollaborator = useCallback(async (email) => {
    if (!currentProject || !user) return false;

    // Only project owner can remove collaborators
    if (currentProject.ownerId !== user.uid) {
      toast.error('Solo el propietario puede remover colaboradores');
      return false;
    }

    setIsSharing(true);
    try {
      await firestoreService.removeCollaborator(currentProject.id, email);
      
      // Update local state
      const updatedProject = {
        ...currentProject,
        collaborators: currentProject.collaborators.filter(collab => collab !== email)
      };
      dispatch(updateCurrentProject(updatedProject));
      
      toast.success(`Colaborador ${email} removido del proyecto`);
      return true;
    } catch (error) {
      console.error('Error removing collaborator:', error);
      toast.error('Error al remover colaborador');
      return false;
    } finally {
      setIsSharing(false);
    }
  }, [currentProject, user, dispatch]);

  // Check if current user can edit project
  const canEdit = useCallback(() => {
    if (!currentProject || !user) return false;
    
    return (
      currentProject.ownerId === user.uid || 
      currentProject.collaborators.includes(user.email)
    );
  }, [currentProject, user]);

  // Check if current user is project owner
  const isOwner = useCallback(() => {
    if (!currentProject || !user) return false;
    return currentProject.ownerId === user.uid;
  }, [currentProject, user]);

  // Get project access level
  const getAccessLevel = useCallback(() => {
    if (!currentProject || !user) return 'none';
    
    if (currentProject.ownerId === user.uid) return 'owner';
    if (currentProject.collaborators.includes(user.email)) return 'collaborator';
    return 'none';
  }, [currentProject, user]);

  // Share project via link (future implementation)
  const generateShareLink = useCallback(async () => {
    if (!currentProject || !isOwner()) return null;
    
    // This could generate a special sharing link
    // For now, just return the project URL
    return `${window.location.origin}/project/${currentProject.id}`;
  }, [currentProject, isOwner]);

  // Simulate presence detection (in a real implementation, this would use Firestore presence)
  const updatePresence = useCallback((isOnline = true) => {
    if (!user || !currentProject) return;

    const userPresence = {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName,
      photoURL: user.photoURL,
      lastSeen: new Date().toISOString(),
      isActive: isOnline
    };

    if (isOnline) {
      dispatch(addActiveUser(userPresence));
    } else {
      dispatch(removeActiveUser(user.uid));
    }
  }, [user, currentProject, dispatch]);

  // Get collaboration stats
  const getCollaborationStats = useCallback(() => {
    if (!currentProject) return null;

    return {
      totalCollaborators: currentProject.collaborators.length,
      activeUsers: activeUsers.length,
      owner: currentProject.ownerId,
      collaborators: currentProject.collaborators,
      accessLevel: getAccessLevel()
    };
  }, [currentProject, activeUsers, getAccessLevel]);

  return {
    // Actions
    addCollaborator,
    removeCollaborator,
    generateShareLink,
    updatePresence,
    
    // Status
    isSharing,
    canEdit: canEdit(),
    isOwner: isOwner(),
    accessLevel: getAccessLevel(),
    
    // Data
    activeUsers,
    collaborationStats: getCollaborationStats()
  };
};

export default useCollaboration;