import { db } from './config';
import { 
  collection, 
  doc,
  setDoc,
  getDoc,
  getDocs,
  query,
  where,
  serverTimestamp
} from 'firebase/firestore';

const USERS_COLLECTION = 'users';

// User roles and permissions
export const USER_ROLES = {
  OWNER: 'owner',
  ADMIN: 'admin', 
  USER: 'user',
  VIEWER: 'viewer'
};

export const PERMISSIONS = {
  PROJECT_CREATE: 'project_create',
  PROJECT_EDIT: 'project_edit',
  PROJECT_DELETE: 'project_delete',
  PROJECT_VIEW: 'project_view',
  PROJECT_INVITE: 'project_invite',
  PROJECT_EXPORT: 'project_export',
  USER_MANAGE: 'user_manage',
  SIGNATURE_ADD: 'signature_add',
  CALCULATIONS_EDIT: 'calculations_edit',
  CALCULATIONS_VIEW: 'calculations_view'
};

// Role permissions mapping
export const ROLE_PERMISSIONS = {
  [USER_ROLES.OWNER]: [
    PERMISSIONS.PROJECT_CREATE,
    PERMISSIONS.PROJECT_EDIT,
    PERMISSIONS.PROJECT_DELETE,
    PERMISSIONS.PROJECT_VIEW,
    PERMISSIONS.PROJECT_INVITE,
    PERMISSIONS.PROJECT_EXPORT,
    PERMISSIONS.USER_MANAGE,
    PERMISSIONS.SIGNATURE_ADD,
    PERMISSIONS.CALCULATIONS_EDIT,
    PERMISSIONS.CALCULATIONS_VIEW
  ],
  [USER_ROLES.ADMIN]: [
    PERMISSIONS.PROJECT_EDIT,
    PERMISSIONS.PROJECT_VIEW,
    PERMISSIONS.PROJECT_INVITE,
    PERMISSIONS.PROJECT_EXPORT,
    PERMISSIONS.SIGNATURE_ADD,
    PERMISSIONS.CALCULATIONS_EDIT,
    PERMISSIONS.CALCULATIONS_VIEW
  ],
  [USER_ROLES.USER]: [
    PERMISSIONS.PROJECT_VIEW,
    PERMISSIONS.PROJECT_EXPORT,
    PERMISSIONS.SIGNATURE_ADD,
    PERMISSIONS.CALCULATIONS_EDIT,
    PERMISSIONS.CALCULATIONS_VIEW
  ],
  [USER_ROLES.VIEWER]: [
    PERMISSIONS.PROJECT_VIEW,
    PERMISSIONS.PROJECT_EXPORT,
    PERMISSIONS.CALCULATIONS_VIEW
  ]
};

export const usersService = {
  // Register user in Firestore when they sign up
  async registerUser(user) {
    try {
      const userRef = doc(db, USERS_COLLECTION, user.uid);
      await setDoc(userRef, {
        uid: user.uid,
        email: user.email.toLowerCase(),
        displayName: user.displayName || '',
        photoURL: user.photoURL || null,
        createdAt: serverTimestamp(),
        lastLoginAt: serverTimestamp()
      }, { merge: true });
      
      console.log('User registered in Firestore:', user.email);
      return true;
    } catch (error) {
      console.error('Error registering user:', error);
      throw error;
    }
  },

  // Update user last login
  async updateLastLogin(uid) {
    try {
      const userRef = doc(db, USERS_COLLECTION, uid);
      await setDoc(userRef, {
        lastLoginAt: serverTimestamp()
      }, { merge: true });
    } catch (error) {
      console.error('Error updating last login:', error);
    }
  },

  // Find user by email
  async getUserByEmail(email) {
    try {
      console.log('Searching for user with email:', email.toLowerCase());
      
      const usersRef = collection(db, USERS_COLLECTION);
      const q = query(
        usersRef,
        where('email', '==', email.toLowerCase())
      );
      
      const querySnapshot = await getDocs(q);
      
      if (querySnapshot.empty) {
        console.warn('User not found in Firestore users collection:', email.toLowerCase());
        
        // Attempt to get all users for debugging (limit to 10)
        const allUsersQuery = query(usersRef);
        const allUsersSnapshot = await getDocs(allUsersQuery);
        const allEmails = allUsersSnapshot.docs.slice(0, 10).map(doc => doc.data().email);
        console.log('Available emails in users collection (first 10):', allEmails);
        
        return null;
      }
      
      const userDoc = querySnapshot.docs[0];
      const userData = {
        id: userDoc.id,
        ...userDoc.data()
      };
      
      console.log('User found in Firestore:', { id: userData.id, email: userData.email });
      return userData;
    } catch (error) {
      console.error('Error getting user by email:', error);
      throw error;
    }
  },

  // Get user by UID
  async getUserByUid(uid) {
    try {
      console.log('Searching for user with UID:', uid);
      
      const userRef = doc(db, USERS_COLLECTION, uid);
      const userDoc = await getDoc(userRef);
      
      if (!userDoc.exists()) {
        console.warn('User not found in Firestore users collection:', uid);
        return null;
      }
      
      const userData = {
        id: userDoc.id,
        ...userDoc.data()
      };
      
      console.log('User found in Firestore:', { id: userData.id, email: userData.email });
      return userData;
    } catch (error) {
      console.error('Error getting user by UID:', error);
      throw error;
    }
  },

  // Check if user exists
  async userExists(email) {
    try {
      const user = await this.getUserByEmail(email);
      return user !== null;
    } catch (error) {
      console.error('Error checking if user exists:', error);
      return false;
    }
  },

  // Permission management
  hasPermission(userRole, permission) {
    const rolePermissions = ROLE_PERMISSIONS[userRole] || [];
    return rolePermissions.includes(permission);
  },

  // Get user role in a specific project
  getUserRoleInProject(project, userId) {
    if (project.owner_id === userId) {
      return USER_ROLES.OWNER;
    }
    
    // Check if user has specific role assigned
    if (project.collaborators_roles && project.collaborators_roles[userId]) {
      return project.collaborators_roles[userId];
    }
    
    // Default collaborator role
    if (project.collaborators && project.collaborators.includes(userId)) {
      return USER_ROLES.USER;
    }
    
    return null; // No access
  },

  // Check if user can perform action on project
  canUserPerformAction(project, userId, permission) {
    const userRole = this.getUserRoleInProject(project, userId);
    if (!userRole) return false;
    
    return this.hasPermission(userRole, permission);
  },

  // Get user display info (for UI)
  getUserDisplayInfo(user) {
    return {
      id: user.uid || user.id,
      name: user.displayName || user.email.split('@')[0],
      email: user.email,
      photoURL: user.photoURL,
      initials: this.getUserInitials(user)
    };
  },

  // Get user initials for avatar
  getUserInitials(user) {
    if (user.displayName) {
      return user.displayName
        .split(' ')
        .map(name => name.charAt(0).toUpperCase())
        .slice(0, 2)
        .join('');
    }
    return user.email.charAt(0).toUpperCase();
  },

  // Update user profile with role management
  async updateUserProfile(uid, updates) {
    try {
      const userRef = doc(db, USERS_COLLECTION, uid);
      await setDoc(userRef, {
        ...updates,
        updatedAt: serverTimestamp()
      }, { merge: true });
      
      return true;
    } catch (error) {
      console.error('Error updating user profile:', error);
      throw error;
    }
  },

  // Get multiple users by UIDs (for project collaborators display)
  async getUsersByUids(uids) {
    try {
      if (!uids || uids.length === 0) return [];
      
      const userPromises = uids.map(uid => this.getUserByUid(uid));
      const users = await Promise.all(userPromises);
      
      return users.filter(user => user !== null);
    } catch (error) {
      console.error('Error getting users by UIDs:', error);
      return [];
    }
  }
};

export default usersService;