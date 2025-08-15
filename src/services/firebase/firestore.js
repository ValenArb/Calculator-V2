import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  onSnapshot,
  serverTimestamp 
} from 'firebase/firestore';
import { db } from './config';

export const firestoreService = {
  // Projects
  async createProject(userId, projectData) {
    const projectsRef = collection(db, 'projects');
    const docRef = await addDoc(projectsRef, {
      name: projectData.name,
      description: projectData.description || '',
      type: projectData.type || 'residential',
      company: projectData.company || '',
      location: projectData.location || '',
      client: projectData.client || '',
      contactEmail: projectData.contactEmail || '',
      contactPhone: projectData.contactPhone || '',
      ownerId: userId,
      collaborators: [],
      modificationsCount: 0,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    return docRef.id;
  },

  async getProject(projectId) {
    const projectRef = doc(db, 'projects', projectId);
    const projectSnap = await getDoc(projectRef);
    if (!projectSnap.exists()) return null;
    
    const data = projectSnap.data();
    return {
      id: projectSnap.id,
      ...data,
      // Convert Firebase Timestamps to ISO strings for Redux serialization
      createdAt: data.createdAt?.toDate?.()?.toISOString() || null,
      updatedAt: data.updatedAt?.toDate?.()?.toISOString() || null
    };
  },

  async getUserProjects(userId) {
    console.log('getUserProjects called for userId:', userId);
    if (!userId) {
      throw new Error('User ID is required to fetch projects');
    }
    
    try {
      const projectsRef = collection(db, 'projects');
      const q = query(
        projectsRef, 
        where('ownerId', '==', userId)
        // Temporarily removed orderBy until index is created
        // orderBy('updatedAt', 'desc')
      );
      const querySnapshot = await getDocs(q);
      let projects = querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          // Convert Firebase Timestamps to ISO strings for Redux serialization
          createdAt: data.createdAt?.toDate?.()?.toISOString() || null,
          updatedAt: data.updatedAt?.toDate?.()?.toISOString() || null
        };
      });
      
      // Sort in JavaScript instead of Firebase for now
      projects = projects.sort((a, b) => {
        const aTime = a.updatedAt ? new Date(a.updatedAt) : new Date(0);
        const bTime = b.updatedAt ? new Date(b.updatedAt) : new Date(0);
        return bTime - aTime;
      });
      console.log(`Projects fetched for user ${userId}:`, projects.length, 'projects');
      console.log('Project details:', projects.map(p => ({ id: p.id, name: p.name, ownerId: p.ownerId })));
      return projects;
    } catch (error) {
      console.error('Error fetching user projects:', error);
      console.error('Error details:', {
        code: error.code,
        message: error.message,
        userId
      });
      
      // Provide more specific error messages
      if (error.code === 'permission-denied') {
        throw new Error('No tienes permisos para acceder a estos proyectos. Verifica tu autenticación.');
      } else if (error.code === 'unavailable') {
        throw new Error('Firebase no está disponible en este momento. Intenta de nuevo más tarde.');
      } else {
        throw new Error(`Error al cargar proyectos: ${error.message}`);
      }
    }
  },

  async updateProject(projectId, updates) {
    const projectRef = doc(db, 'projects', projectId);
    
    // Get current project to increment modifications count
    const currentProject = await this.getProject(projectId);
    const currentCount = currentProject?.modificationsCount || 0;
    
    await updateDoc(projectRef, {
      ...updates,
      modificationsCount: currentCount + 1,
      updatedAt: serverTimestamp()
    });
  },

  async deleteProject(projectId) {
    const projectRef = doc(db, 'projects', projectId);
    await deleteDoc(projectRef);
  },

  async duplicateProject(projectId, userId, newProjectData = {}) {
    try {
      // Get the original project
      const originalProject = await this.getProject(projectId);
      if (!originalProject) {
        throw new Error('Project not found');
      }

      // Create new project with duplicated data
      const duplicatedProjectData = {
        name: newProjectData.name || `${originalProject.name} (Copia)`,
        description: newProjectData.description || originalProject.description,
        type: originalProject.type,
        company: originalProject.company || '',
        location: originalProject.location || '',
        client: originalProject.client || '',
        contactEmail: originalProject.contactEmail || '',
        contactPhone: originalProject.contactPhone || '',
        ownerId: userId, // New owner
        collaborators: [], // Start with no collaborators
        modificationsCount: 0, // Reset modifications count
        data: originalProject.data || {
          dpms: [],
          loadsByPanel: [],
          thermal: [],
          voltageDrops: [],
          shortCircuit: []
        },
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      const projectsRef = collection(db, 'projects');
      const docRef = await addDoc(projectsRef, duplicatedProjectData);
      return docRef.id;
    } catch (error) {
      console.error('Error duplicating project:', error);
      throw error;
    }
  },

  // Real-time subscription
  subscribeToProject(projectId, callback) {
    const projectRef = doc(db, 'projects', projectId);
    return onSnapshot(projectRef, (doc) => {
      if (doc.exists()) {
        const data = doc.data();
        callback({
          id: doc.id,
          ...data,
          // Convert Firebase Timestamps to ISO strings for Redux serialization
          createdAt: data.createdAt?.toDate?.()?.toISOString() || null,
          updatedAt: data.updatedAt?.toDate?.()?.toISOString() || null
        });
      }
    });
  },

  // Collaboration
  async addCollaborator(projectId, collaboratorEmail) {
    const projectRef = doc(db, 'projects', projectId);
    const project = await this.getProject(projectId);
    
    if (project && !project.collaborators.includes(collaboratorEmail)) {
      await updateDoc(projectRef, {
        collaborators: [...project.collaborators, collaboratorEmail],
        updatedAt: serverTimestamp()
      });
    }
  },

  async removeCollaborator(projectId, collaboratorEmail) {
    const projectRef = doc(db, 'projects', projectId);
    const project = await this.getProject(projectId);
    
    if (project) {
      await updateDoc(projectRef, {
        collaborators: project.collaborators.filter(email => email !== collaboratorEmail),
        updatedAt: serverTimestamp()
      });
    }
  }
};