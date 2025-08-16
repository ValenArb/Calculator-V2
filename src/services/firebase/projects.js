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
      
      // Verify ownership
      if (projectData.owner_id !== userId) {
        throw new Error('Unauthorized: Not your project');
      }
      
      return { id: projectDoc.id, ...projectData };
    } catch (error) {
      console.error('Error fetching project:', error);
      throw error;
    }
  }

  async getProjects(userId, limitCount = null) {
    try {
      // Simple query without orderBy to avoid composite index requirement
      let q = query(
        collection(db, PROJECTS_COLLECTION),
        where('owner_id', '==', userId)
      );
      
      if (limitCount) {
        q = query(q, limitQuery(limitCount));
      }
      
      const snapshot = await getDocs(q);
      const projects = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      // Sort client-side by updated_at descending
      projects.sort((a, b) => {
        const dateA = a.updated_at?.toDate ? a.updated_at.toDate() : new Date(a.updated_at || 0);
        const dateB = b.updated_at?.toDate ? b.updated_at.toDate() : new Date(b.updated_at || 0);
        return dateB - dateA;
      });
      
      return projects;
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
  getProjectStats
} = projectsService;