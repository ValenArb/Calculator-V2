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

  async getProject(projectId, userId) {
    try {
      const docRef = doc(db, PROJECTS_COLLECTION, projectId);
      const projectDoc = await getDoc(docRef);
      
      if (!projectDoc.exists()) {
        throw new Error('Project not found');
      }
      
      const projectData = projectDoc.data();
      
      // Verify ownership or collaboration
      const isOwner = projectData.owner_id === userId;
      const isCollaborator = projectData.collaborators && projectData.collaborators.includes(userId);
      
      if (!isOwner && !isCollaborator) {
        throw new Error('Unauthorized: Not your project or you are not a collaborator');
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
      
      // First verify ownership
      const currentDoc = await getDoc(docRef);
      if (!currentDoc.exists()) {
        throw new Error('Project not found');
      }
      
      const currentProjectData = currentDoc.data();
      if (currentProjectData.owner_id !== userId) {
        throw new Error('Unauthorized: Not your project');
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
  async addCollaborator(projectId, collaboratorUserId, ownerUserId) {
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
      
      // Check if user is already a collaborator
      if (currentCollaborators.includes(collaboratorUserId)) {
        throw new Error('User is already a collaborator on this project');
      }
      
      // Add the new collaborator
      const updatedCollaborators = [...currentCollaborators, collaboratorUserId];
      
      // Update the document
      await updateDoc(docRef, {
        collaborators: updatedCollaborators,
        updated_at: serverTimestamp()
      });
      
      console.log(`Added collaborator ${collaboratorUserId} to project ${projectId}`);
      return { success: true };
    } catch (error) {
      console.error('Error adding collaborator:', error);
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
      
      // Get current collaborators array
      const currentCollaborators = projectData.collaborators || [];
      
      // Remove the collaborator
      const updatedCollaborators = currentCollaborators.filter(uid => uid !== collaboratorUserId);
      
      // Update the document
      await updateDoc(docRef, {
        collaborators: updatedCollaborators,
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
  removeCollaborator,
  getProjectStats
} = projectsService;