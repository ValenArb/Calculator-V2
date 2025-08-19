import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  limit as limitQuery,
  serverTimestamp 
} from 'firebase/firestore';
import { 
  ref, 
  uploadBytes, 
  getDownloadURL, 
  deleteObject 
} from 'firebase/storage';
import { db, storage } from './config';

// Firestore collections
const PROJECTS_COLLECTION = 'projects';

class ProjectsService {
  // Project CRUD operations
  async createProject(projectData) {
    try {
      const docRef = await addDoc(collection(db, PROJECTS_COLLECTION), {
        ...projectData,
        calculation_count: 0,
        created_at: serverTimestamp(),
        updated_at: serverTimestamp()
      });
      
      // Return the created project with the new ID
      const projectDoc = await getDoc(docRef);
      return { id: projectDoc.id, ...projectDoc.data() };
    } catch (error) {
      console.error('Error creating project:', error);
      throw error;
    }
  }

  async getProject(projectId, userId, options = {}) {
    try {
      const docRef = doc(db, PROJECTS_COLLECTION, projectId);
      const projectDoc = await getDoc(docRef);
      
      if (!projectDoc.exists()) {
        throw new Error('Project not found');
      }
      
      const projectData = projectDoc.data();
      
      // Skip auth check for public access
      if (!options.bypassAuth) {
        // Verify ownership or collaboration
        const isOwner = projectData.owner_id === userId;
        const isCollaborator = projectData.collaborators && projectData.collaborators.includes(userId);
        
        if (!isOwner && !isCollaborator) {
          throw new Error('Unauthorized: Not your project or you are not a collaborator');
        }
      }
      
      return { id: projectDoc.id, ...projectData };
    } catch (error) {
      console.error('Error fetching project:', error);
      throw error;
    }
  }

  async getProjects(userId, limitCount = null) {
    try {
      // Get projects owned by the user
      let ownedQuery = query(
        collection(db, PROJECTS_COLLECTION),
        where('owner_id', '==', userId)
      );
      
      if (limitCount) {
        ownedQuery = query(ownedQuery, limitQuery(limitCount));
      }
      
      const ownedSnapshot = await getDocs(ownedQuery);
      const ownedProjects = ownedSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        userRole: 'owner'
      }));

      // Get projects where user is a collaborator
      let collaboratedQuery = query(
        collection(db, PROJECTS_COLLECTION),
        where('collaborators', 'array-contains', userId)
      );
      
      if (limitCount) {
        collaboratedQuery = query(collaboratedQuery, limitQuery(limitCount));
      }
      
      const collaboratedSnapshot = await getDocs(collaboratedQuery);
      const collaboratedProjects = collaboratedSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        userRole: 'collaborator'
      }));

      // Combine and deduplicate projects
      const allProjects = [...ownedProjects];
      
      // Add collaborated projects that aren't already in owned projects
      collaboratedProjects.forEach(collaboratedProject => {
        if (!allProjects.find(p => p.id === collaboratedProject.id)) {
          allProjects.push(collaboratedProject);
        }
      });
      
      // Sort client-side by updated_at descending
      allProjects.sort((a, b) => {
        const dateA = a.updated_at?.toDate ? a.updated_at.toDate() : new Date(a.updated_at || 0);
        const dateB = b.updated_at?.toDate ? b.updated_at.toDate() : new Date(b.updated_at || 0);
        return dateB - dateA;
      });
      
      return allProjects;
    } catch (error) {
      console.error('Error fetching projects:', error);
      throw error;
    }
  }

  async updateProject(projectId, projectData, userId) {
    try {
      const docRef = doc(db, PROJECTS_COLLECTION, projectId);
      
      // First verify project exists and user has edit permissions
      const currentDoc = await getDoc(docRef);
      if (!currentDoc.exists()) {
        throw new Error('Project not found');
      }
      
      const currentProjectData = currentDoc.data();
      const project = { id: projectId, ...currentProjectData };
      
      // Import users service for permission checking
      const { usersService, PERMISSIONS } = await import('./users');
      
      // Check if user can edit the project
      if (!usersService.canUserPerformAction(project, userId, PERMISSIONS.PROJECT_EDIT)) {
        throw new Error('Unauthorized: You do not have permission to edit this project');
      }
      
      // If logo is being changed, delete the old one
      if (currentProjectData.client_logo_url && 
          projectData.client_logo_url !== currentProjectData.client_logo_url) {
        await this.deleteClientLogo(currentProjectData.client_logo_url);
      }
      
      // Update the document
      await updateDoc(docRef, {
        ...projectData,
        updated_at: serverTimestamp()
      });
      
      // Return updated document
      const updatedDoc = await getDoc(docRef);
      return { id: updatedDoc.id, ...updatedDoc.data() };
    } catch (error) {
      console.error('Error updating project:', error);
      throw error;
    }
  }

  async deleteProject(projectId, userId) {
    try {
      const docRef = doc(db, PROJECTS_COLLECTION, projectId);
      
      // First verify ownership
      const currentDoc = await getDoc(docRef);
      if (!currentDoc.exists()) {
        throw new Error('Project not found');
      }
      
      const projectData = currentDoc.data();
      if (projectData.owner_id !== userId) {
        throw new Error('Unauthorized: Not your project');
      }
      
      // Delete client logo if exists
      if (projectData.client_logo_url) {
        await this.deleteClientLogo(projectData.client_logo_url);
      }
      
      // Delete the document
      await deleteDoc(docRef);
      return { success: true };
    } catch (error) {
      console.error('Error deleting project:', error);
      throw error;
    }
  }

  // Client logo management
  async uploadClientLogo(file, clientName, userId) {
    try {
      if (!file) throw new Error('No file provided');
      
      // Validate file type
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
      if (!validTypes.includes(file.type)) {
        throw new Error('Invalid file type. Please upload an image file (JPG, PNG, GIF, WebP)');
      }
      
      // Validate file size (max 5MB)
      const maxSize = 5 * 1024 * 1024; // 5MB
      if (file.size > maxSize) {
        throw new Error('File size too large. Maximum size is 5MB');
      }
      
      // Create unique filename
      const filename = `${userId}_${clientName.replace(/[^a-zA-Z0-9]/g, '_')}_${Date.now()}.${file.name.split('.').pop()}`;
      const logoRef = ref(storage, `client_logos/${filename}`);
      
      // Upload file
      const snapshot = await uploadBytes(logoRef, file);
      const downloadURL = await getDownloadURL(snapshot.ref);
      
      return {
        url: downloadURL,
        filename: filename,
        file_size: file.size,
        file_type: file.type
      };
    } catch (error) {
      console.error('Error uploading client logo:', error);
      throw error;
    }
  }

  async deleteClientLogo(logoUrl) {
    try {
      if (!logoUrl) return { success: true };
      
      // Extract filename from URL
      const url = new URL(logoUrl);
      const pathname = decodeURIComponent(url.pathname);
      const filename = pathname.split('/').pop().split('?')[0];
      
      // Delete from Storage
      const logoRef = ref(storage, `client_logos/${filename}`);
      await deleteObject(logoRef);
      
      return { success: true };
    } catch (error) {
      console.error('Error deleting client logo:', error);
      // Don't throw error for logo deletion failures
      return { success: false, error: error.message };
    }
  }

  // Collaborator management
  async addCollaborator(projectId, collaboratorUserId, ownerUserId, role = 'user') {
    try {
      const docRef = doc(db, PROJECTS_COLLECTION, projectId);
      
      // First verify ownership
      const currentDoc = await getDoc(docRef);
      if (!currentDoc.exists()) {
        throw new Error('Project not found');
      }
      
      const projectData = currentDoc.data();
      if (projectData.owner_id !== ownerUserId) {
        throw new Error('Unauthorized: Only project owner can add collaborators');
      }
      
      // Get current collaborators array or initialize empty array
      const currentCollaborators = projectData.collaborators || [];
      const currentCollaboratorRoles = projectData.collaborators_roles || {};
      
      // Check if user is already a collaborator
      if (currentCollaborators.includes(collaboratorUserId)) {
        throw new Error('User is already a collaborator on this project');
      }
      
      // Add the new collaborator
      const updatedCollaborators = [...currentCollaborators, collaboratorUserId];
      const updatedCollaboratorRoles = {
        ...currentCollaboratorRoles,
        [collaboratorUserId]: role
      };
      
      // Update the document
      await updateDoc(docRef, {
        collaborators: updatedCollaborators,
        collaborators_roles: updatedCollaboratorRoles,
        updated_at: serverTimestamp()
      });
      
      console.log(`Added collaborator ${collaboratorUserId} with role ${role} to project ${projectId}`);
      return { success: true };
    } catch (error) {
      console.error('Error adding collaborator:', error);
      throw error;
    }
  }

  // Update collaborator role
  async updateCollaboratorRole(projectId, collaboratorUserId, newRole, ownerUserId) {
    try {
      const docRef = doc(db, PROJECTS_COLLECTION, projectId);
      
      // First verify ownership
      const currentDoc = await getDoc(docRef);
      if (!currentDoc.exists()) {
        throw new Error('Project not found');
      }
      
      const projectData = currentDoc.data();
      if (projectData.owner_id !== ownerUserId) {
        throw new Error('Unauthorized: Only project owner can update collaborator roles');
      }
      
      // Check if user is a collaborator
      const currentCollaborators = projectData.collaborators || [];
      if (!currentCollaborators.includes(collaboratorUserId)) {
        throw new Error('User is not a collaborator on this project');
      }
      
      // Update collaborator role
      const currentCollaboratorRoles = projectData.collaborators_roles || {};
      const updatedCollaboratorRoles = {
        ...currentCollaboratorRoles,
        [collaboratorUserId]: newRole
      };
      
      // Update the document
      await updateDoc(docRef, {
        collaborators_roles: updatedCollaboratorRoles,
        updated_at: serverTimestamp()
      });
      
      console.log(`Updated collaborator ${collaboratorUserId} role to ${newRole} in project ${projectId}`);
      return { success: true };
    } catch (error) {
      console.error('Error updating collaborator role:', error);
      throw error;
    }
  }

  async removeCollaborator(projectId, collaboratorUserId, ownerUserId) {
    try {
      const docRef = doc(db, PROJECTS_COLLECTION, projectId);
      
      // First verify ownership
      const currentDoc = await getDoc(docRef);
      if (!currentDoc.exists()) {
        throw new Error('Project not found');
      }
      
      const projectData = currentDoc.data();
      if (projectData.owner_id !== ownerUserId) {
        throw new Error('Unauthorized: Only project owner can remove collaborators');
      }
      
      // Get current collaborators array and roles
      const currentCollaborators = projectData.collaborators || [];
      const currentCollaboratorRoles = projectData.collaborators_roles || {};
      
      // Remove the collaborator
      const updatedCollaborators = currentCollaborators.filter(uid => uid !== collaboratorUserId);
      
      // Remove collaborator role
      const updatedCollaboratorRoles = { ...currentCollaboratorRoles };
      delete updatedCollaboratorRoles[collaboratorUserId];
      
      // Update the document
      await updateDoc(docRef, {
        collaborators: updatedCollaborators,
        collaborators_roles: updatedCollaboratorRoles,
        updated_at: serverTimestamp()
      });
      
      console.log(`Removed collaborator ${collaboratorUserId} from project ${projectId}`);
      return { success: true };
    } catch (error) {
      console.error('Error removing collaborator:', error);
      throw error;
    }
  }

  // Statistics and analytics
  async getProjectStats(userId) {
    try {
      const projects = await this.getProjects(userId);
      
      const stats = {
        total: projects.length,
        total_calculations: 0
      };
      
      projects.forEach(project => {
        stats.total_calculations += project.calculation_count || 0;
      });
      
      return stats;
    } catch (error) {
      console.error('Error calculating project stats:', error);
      throw error;
    }
  }

  // Public sharing system
  async createPublicShareLink(projectId, ownerUserId, options = {}) {
    try {
      const docRef = doc(db, PROJECTS_COLLECTION, projectId);
      const currentDoc = await getDoc(docRef);
      
      if (!currentDoc.exists()) {
        throw new Error('Project not found');
      }
      
      const projectData = currentDoc.data();
      if (projectData.owner_id !== ownerUserId) {
        throw new Error('Unauthorized: Only project owner can create public share links');
      }
      
      // Generate unique share token
      const shareToken = this.generateShareToken();
      
      // Set default expiration (7 days if not specified)
      const defaultExpirationHours = 24 * 7; // 7 days
      const expirationHours = options.expirationHours || defaultExpirationHours;
      const expiryTime = new Date();
      expiryTime.setHours(expiryTime.getHours() + expirationHours);
      
      const shareLink = {
        token: shareToken,
        created_at: serverTimestamp(),
        expires_at: expiryTime.toISOString(),
        created_by: ownerUserId,
        access_count: 0,
        is_active: true,
        permissions: options.permissions || {
          view_project: true,
          view_calculations: true,
          view_protocols: true,
          download_pdf: options.allowDownload || false
        }
      };
      
      // Update project with share link
      await updateDoc(docRef, {
        public_share_link: shareLink,
        updated_at: serverTimestamp()
      });
      
      console.log(`Created public share link for project ${projectId}: ${shareToken}`);
      return { shareToken, expiresAt: expiryTime.toISOString(), shareUrl: `${window.location.origin}/public/${projectId}/${shareToken}` };
      
    } catch (error) {
      console.error('Error creating public share link:', error);
      throw error;
    }
  }

  async validatePublicAccess(projectId, shareToken) {
    try {
      const docRef = doc(db, PROJECTS_COLLECTION, projectId);
      const currentDoc = await getDoc(docRef);
      
      if (!currentDoc.exists()) {
        return { valid: false, reason: 'Project not found' };
      }
      
      const projectData = currentDoc.data();
      const shareLink = projectData.public_share_link;
      
      if (!shareLink || !shareLink.is_active) {
        return { valid: false, reason: 'No active public share link' };
      }
      
      if (shareLink.token !== shareToken) {
        return { valid: false, reason: 'Invalid share token' };
      }
      
      // Check if link has expired
      const now = new Date();
      const expiryTime = new Date(shareLink.expires_at);
      
      if (now > expiryTime) {
        // Automatically deactivate expired link
        await updateDoc(docRef, {
          'public_share_link.is_active': false,
          updated_at: serverTimestamp()
        });
        
        return { valid: false, reason: 'Share link has expired', expiredAt: expiryTime.toISOString() };
      }
      
      // Increment access count
      await updateDoc(docRef, {
        'public_share_link.access_count': shareLink.access_count + 1,
        updated_at: serverTimestamp()
      });
      
      return {
        valid: true,
        permissions: shareLink.permissions,
        expiresAt: shareLink.expires_at,
        accessCount: shareLink.access_count + 1
      };
      
    } catch (error) {
      console.error('Error validating public access:', error);
      throw error;
    }
  }

  async revokePublicShareLink(projectId, ownerUserId) {
    try {
      const docRef = doc(db, PROJECTS_COLLECTION, projectId);
      const currentDoc = await getDoc(docRef);
      
      if (!currentDoc.exists()) {
        throw new Error('Project not found');
      }
      
      const projectData = currentDoc.data();
      if (projectData.owner_id !== ownerUserId) {
        throw new Error('Unauthorized: Only project owner can revoke share links');
      }
      
      await updateDoc(docRef, {
        'public_share_link.is_active': false,
        updated_at: serverTimestamp()
      });
      
      console.log(`Revoked public share link for project ${projectId}`);
      return { success: true };
      
    } catch (error) {
      console.error('Error revoking public share link:', error);
      throw error;
    }
  }

  generateShareToken() {
    // Generate a secure random token
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < 32; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }
}

// Create and export singleton instance
const projectsService = new ProjectsService();
export default projectsService;

// Export individual methods for convenience
export const {
  createProject,
  getProject,
  getProjects,
  updateProject,
  deleteProject,
  uploadClientLogo,
  deleteClientLogo,
  addCollaborator,
  updateCollaboratorRole,
  removeCollaborator,
  getProjectStats,
  createPublicShareLink,
  validatePublicAccess,
  revokePublicShareLink,
  generateShareToken
} = projectsService;