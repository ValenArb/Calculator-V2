import React from 'react';
import useUserPermissions from '../../hooks/useUserPermissions';
import { PERMISSIONS } from '../../services/firebase/users';

/**
 * Permission Gate Component
 * Conditionally renders children based on user permissions
 */
const PermissionGate = ({ 
  project = null,
  permission = null,
  role = null,
  requireOwner = false,
  requireAuth = true,
  fallback = null,
  children 
}) => {
  const { 
    userRole, 
    isOwner,
    hasPermission 
  } = useUserPermissions(project);

  // Check authentication requirement
  if (requireAuth && !userRole && project) {
    return fallback;
  }

  // Check owner requirement
  if (requireOwner && !isOwner) {
    return fallback;
  }

  // Check specific role requirement
  if (role && userRole !== role) {
    return fallback;
  }

  // Check specific permission
  if (permission && !hasPermission(permission)) {
    return fallback;
  }

  return children;
};

/**
 * Common permission-specific components
 */
export const OwnerOnly = ({ project, fallback = null, children }) => (
  <PermissionGate project={project} requireOwner={true} fallback={fallback}>
    {children}
  </PermissionGate>
);

export const CanEdit = ({ project, fallback = null, children }) => (
  <PermissionGate project={project} permission={PERMISSIONS.PROJECT_EDIT} fallback={fallback}>
    {children}
  </PermissionGate>
);

export const CanInvite = ({ project, fallback = null, children }) => (
  <PermissionGate project={project} permission={PERMISSIONS.PROJECT_INVITE} fallback={fallback}>
    {children}
  </PermissionGate>
);

export const CanManageUsers = ({ project, fallback = null, children }) => (
  <PermissionGate project={project} permission={PERMISSIONS.USER_MANAGE} fallback={fallback}>
    {children}
  </PermissionGate>
);

export const CanAddSignatures = ({ project, fallback = null, children }) => (
  <PermissionGate project={project} permission={PERMISSIONS.SIGNATURE_ADD} fallback={fallback}>
    {children}
  </PermissionGate>
);

export const CanEditCalculations = ({ project, fallback = null, children }) => (
  <PermissionGate project={project} permission={PERMISSIONS.CALCULATIONS_EDIT} fallback={fallback}>
    {children}
  </PermissionGate>
);

export default PermissionGate;