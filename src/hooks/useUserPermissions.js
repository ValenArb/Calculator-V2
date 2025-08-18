import { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { usersService, USER_ROLES, PERMISSIONS } from '../services/firebase/users';

/**
 * Hook for managing user permissions within projects
 * Provides easy access to user roles and permission checks
 */
export const useUserPermissions = (project = null) => {
  const { user } = useSelector((state) => state.auth);

  const userPermissions = useMemo(() => {
    if (!user || !project) {
      return {
        userRole: null,
        isOwner: false,
        isAdmin: false,
        isUser: false,
        isViewer: false,
        canEdit: false,
        canDelete: false,
        canInvite: false,
        canManageUsers: false,
        canAddSignatures: false,
        canEditCalculations: false,
        canViewOnly: false,
        hasPermission: () => false
      };
    }

    const userRole = usersService.getUserRoleInProject(project, user.uid);
    
    const hasPermission = (permission) => {
      return usersService.canUserPerformAction(project, user.uid, permission);
    };

    return {
      userRole,
      isOwner: userRole === USER_ROLES.OWNER,
      isAdmin: userRole === USER_ROLES.ADMIN,
      isUser: userRole === USER_ROLES.USER,
      isViewer: userRole === USER_ROLES.VIEWER,
      
      // Common permission checks
      canEdit: hasPermission(PERMISSIONS.PROJECT_EDIT),
      canDelete: hasPermission(PERMISSIONS.PROJECT_DELETE),
      canInvite: hasPermission(PERMISSIONS.PROJECT_INVITE),
      canManageUsers: hasPermission(PERMISSIONS.USER_MANAGE),
      canAddSignatures: hasPermission(PERMISSIONS.SIGNATURE_ADD),
      canEditCalculations: hasPermission(PERMISSIONS.CALCULATIONS_EDIT),
      canViewOnly: userRole === USER_ROLES.VIEWER,
      
      // Function to check any permission
      hasPermission
    };
  }, [user, project]);

  return userPermissions;
};

/**
 * Hook for getting user display information
 */
export const useUserDisplay = (user) => {
  return useMemo(() => {
    if (!user) return null;
    return usersService.getUserDisplayInfo(user);
  }, [user]);
};

/**
 * Hook for checking global permissions (not project-specific)
 */
export const useGlobalPermissions = () => {
  const { user } = useSelector((state) => state.auth);

  return useMemo(() => {
    if (!user) {
      return {
        canCreateProjects: false,
        isAuthenticated: false
      };
    }

    return {
      canCreateProjects: true, // All authenticated users can create projects
      isAuthenticated: true
    };
  }, [user]);
};

export default useUserPermissions;