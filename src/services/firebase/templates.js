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
  serverTimestamp 
} from 'firebase/firestore';
import { db } from './config';

export const templatesService = {
  // Get all available templates
  async getAllTemplates() {
    try {
      const templatesRef = collection(db, 'projectTemplates');
      const q = query(templatesRef, orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      
      const templates = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate?.()?.toISOString() || null,
        updatedAt: doc.data().updatedAt?.toDate?.()?.toISOString() || null
      }));
      
      return templates;
    } catch (error) {
      console.error('Error fetching templates:', error);
      throw error;
    }
  },

  // Get templates by category
  async getTemplatesByCategory(category) {
    try {
      const templatesRef = collection(db, 'projectTemplates');
      const q = query(
        templatesRef, 
        where('category', '==', category),
        orderBy('createdAt', 'desc')
      );
      const querySnapshot = await getDocs(q);
      
      const templates = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate?.()?.toISOString() || null,
        updatedAt: doc.data().updatedAt?.toDate?.()?.toISOString() || null
      }));
      
      return templates;
    } catch (error) {
      console.error('Error fetching templates by category:', error);
      throw error;
    }
  },

  // Get user's custom templates
  async getUserTemplates(userId) {
    try {
      const templatesRef = collection(db, 'projectTemplates');
      const q = query(
        templatesRef, 
        where('createdBy', '==', userId),
        orderBy('createdAt', 'desc')
      );
      const querySnapshot = await getDocs(q);
      
      const templates = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate?.()?.toISOString() || null,
        updatedAt: doc.data().updatedAt?.toDate?.()?.toISOString() || null
      }));
      
      return templates;
    } catch (error) {
      console.error('Error fetching user templates:', error);
      throw error;
    }
  },

  // Get a single template
  async getTemplate(templateId) {
    try {
      const templateRef = doc(db, 'projectTemplates', templateId);
      const templateSnap = await getDoc(templateRef);
      
      if (!templateSnap.exists()) return null;
      
      const data = templateSnap.data();
      return {
        id: templateSnap.id,
        ...data,
        createdAt: data.createdAt?.toDate?.()?.toISOString() || null,
        updatedAt: data.updatedAt?.toDate?.()?.toISOString() || null
      };
    } catch (error) {
      console.error('Error fetching template:', error);
      throw error;
    }
  },

  // Create a new template
  async createTemplate(templateData) {
    try {
      const templatesRef = collection(db, 'projectTemplates');
      const docRef = await addDoc(templatesRef, {
        name: templateData.name,
        description: templateData.description,
        category: templateData.category, // residential, commercial, industrial
        type: templateData.type, // project type
        icon: templateData.icon || '🏠',
        isPublic: templateData.isPublic || false,
        createdBy: templateData.createdBy,
        company: templateData.company || '',
        location: templateData.location || '',
        client: templateData.client || '',
        contactEmail: templateData.contactEmail || '',
        contactPhone: templateData.contactPhone || '',
        data: templateData.data || {
          dpms: [],
          loadsByPanel: [],
          thermal: [],
          voltageDrops: [],
          shortCircuit: []
        },
        metadata: {
          tags: templateData.tags || [],
          difficulty: templateData.difficulty || 'beginner', // beginner, intermediate, advanced
          estimatedTime: templateData.estimatedTime || '1-2 horas',
          requirements: templateData.requirements || []
        },
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      return docRef.id;
    } catch (error) {
      console.error('Error creating template:', error);
      throw error;
    }
  },

  // Update a template
  async updateTemplate(templateId, updates) {
    try {
      const templateRef = doc(db, 'projectTemplates', templateId);
      await updateDoc(templateRef, {
        ...updates,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Error updating template:', error);
      throw error;
    }
  },

  // Delete a template
  async deleteTemplate(templateId) {
    try {
      const templateRef = doc(db, 'projectTemplates', templateId);
      await deleteDoc(templateRef);
    } catch (error) {
      console.error('Error deleting template:', error);
      throw error;
    }
  },

  // Create project from template
  async createProjectFromTemplate(templateId, userId, customData = {}) {
    try {
      const template = await this.getTemplate(templateId);
      if (!template) {
        throw new Error('Template not found');
      }

      const projectData = {
        name: customData.name || template.name,
        description: customData.description || template.description,
        type: template.type,
        company: customData.company || template.company,
        location: customData.location || template.location,
        client: customData.client || template.client,
        contactEmail: customData.contactEmail || template.contactEmail,
        contactPhone: customData.contactPhone || template.contactPhone,
        ownerId: userId,
        collaborators: [],
        modificationsCount: 0,
        data: template.data, // Copy template data
        templateId: templateId, // Reference to original template
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      const projectsRef = collection(db, 'projects');
      const docRef = await addDoc(projectsRef, projectData);
      return docRef.id;
    } catch (error) {
      console.error('Error creating project from template:', error);
      throw error;
    }
  },

  // Initialize default templates
  async initializeDefaultTemplates() {
    try {
      const defaultTemplates = [
        {
          name: 'Instalación Residencial Básica',
          description: 'Plantilla para una instalación eléctrica residencial típica con cargas estándar.',
          category: 'residential',
          type: 'residential',
          icon: '🏠',
          isPublic: true,
          createdBy: 'system',
          data: {
            dpms: [
              {
                id: '1',
                description: 'Iluminación general',
                potencia: 1500,
                tension: 220,
                factorPotencia: 0.9,
                factorDemanda: 0.8,
                tipo: 'IUG'
              },
              {
                id: '2',
                description: 'Tomacorrientes generales',
                potencia: 3000,
                tension: 220,
                factorPotencia: 0.8,
                factorDemanda: 0.3,
                tipo: 'TUG'
              }
            ],
            loadsByPanel: [],
            thermal: [],
            voltageDrops: [],
            shortCircuit: []
          },
          metadata: {
            tags: ['residencial', 'básico', 'vivienda'],
            difficulty: 'beginner',
            estimatedTime: '1-2 horas',
            requirements: ['Conocimiento básico de instalaciones eléctricas']
          }
        },
        {
          name: 'Oficina Comercial',
          description: 'Plantilla para instalación eléctrica de oficina comercial con equipos informáticos.',
          category: 'commercial',
          type: 'commercial',
          icon: '🏢',
          isPublic: true,
          createdBy: 'system',
          data: {
            dpms: [
              {
                id: '1',
                description: 'Iluminación oficinas',
                potencia: 2500,
                tension: 220,
                factorPotencia: 0.95,
                factorDemanda: 0.9,
                tipo: 'IUG'
              },
              {
                id: '2',
                description: 'Equipos informáticos',
                potencia: 5000,
                tension: 220,
                factorPotencia: 0.8,
                factorDemanda: 0.7,
                tipo: 'OCE'
              },
              {
                id: '3',
                description: 'Aire acondicionado',
                potencia: 8000,
                tension: 380,
                factorPotencia: 0.85,
                factorDemanda: 0.8,
                tipo: 'ACU'
              }
            ],
            loadsByPanel: [],
            thermal: [],
            voltageDrops: [],
            shortCircuit: []
          },
          metadata: {
            tags: ['comercial', 'oficina', 'informática'],
            difficulty: 'intermediate',
            estimatedTime: '2-3 horas',
            requirements: ['Conocimiento de cargas comerciales', 'Sistemas trifásicos']
          }
        },
        {
          name: 'Planta Industrial',
          description: 'Plantilla para instalación industrial con motores de alta potencia.',
          category: 'industrial',
          type: 'industrial',
          icon: '🏭',
          isPublic: true,
          createdBy: 'system',
          data: {
            dpms: [
              {
                id: '1',
                description: 'Motores principales',
                potencia: 50000,
                tension: 380,
                factorPotencia: 0.85,
                factorDemanda: 0.8,
                tipo: 'OCE'
              },
              {
                id: '2',
                description: 'Iluminación industrial',
                potencia: 8000,
                tension: 220,
                factorPotencia: 0.9,
                factorDemanda: 0.9,
                tipo: 'IUG'
              },
              {
                id: '3',
                description: 'Sistemas auxiliares',
                potencia: 15000,
                tension: 380,
                factorPotencia: 0.8,
                factorDemanda: 0.6,
                tipo: 'OCE'
              }
            ],
            loadsByPanel: [],
            thermal: [],
            voltageDrops: [],
            shortCircuit: []
          },
          metadata: {
            tags: ['industrial', 'motores', 'alta potencia'],
            difficulty: 'advanced',
            estimatedTime: '4-6 horas',
            requirements: ['Conocimiento avanzado de sistemas industriales', 'Análisis de cortocircuito']
          }
        }
      ];

      for (const template of defaultTemplates) {
        // Check if template already exists
        const existing = await this.getTemplatesByCategory(template.category);
        const templateExists = existing.some(t => t.name === template.name);
        
        if (!templateExists) {
          await this.createTemplate(template);
          console.log(`Created default template: ${template.name}`);
        }
      }
    } catch (error) {
      console.error('Error initializing default templates:', error);
      throw error;
    }
  }
};

export default templatesService;