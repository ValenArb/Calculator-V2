import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { firestoreService } from '../../services/firebase/firestore';

export const createProject = createAsyncThunk(
  'projects/create',
  async ({ userId, projectData }, { rejectWithValue }) => {
    try {
      const projectId = await firestoreService.createProject(userId, projectData);
      return { id: projectId, ...projectData, ownerId: userId };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchUserProjects = createAsyncThunk(
  'projects/fetchUser',
  async (userId, { rejectWithValue }) => {
    try {
      console.log('fetchUserProjects thunk called for:', userId);
      const projects = await firestoreService.getUserProjects(userId);
      console.log('fetchUserProjects thunk result:', projects);
      return projects;
    } catch (error) {
      console.error('fetchUserProjects thunk error:', error);
      return rejectWithValue(error.message);
    }
  }
);

export const fetchProject = createAsyncThunk(
  'projects/fetch',
  async (projectId, { rejectWithValue }) => {
    try {
      const project = await firestoreService.getProject(projectId);
      return project;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const updateProject = createAsyncThunk(
  'projects/update',
  async ({ projectId, updates }, { rejectWithValue }) => {
    try {
      await firestoreService.updateProject(projectId, updates);
      return { projectId, updates };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const deleteProject = createAsyncThunk(
  'projects/delete',
  async (projectId, { rejectWithValue }) => {
    try {
      await firestoreService.deleteProject(projectId);
      return projectId;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const duplicateProject = createAsyncThunk(
  'projects/duplicate',
  async ({ projectId, userId, newProjectData }, { rejectWithValue }) => {
    try {
      const duplicatedProjectId = await firestoreService.duplicateProject(projectId, userId, newProjectData);
      const duplicatedProject = await firestoreService.getProject(duplicatedProjectId);
      return duplicatedProject;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const projectsSlice = createSlice({
  name: 'projects',
  initialState: {
    projects: [],
    currentProject: null,
    loading: false,
    error: null,
    favorites: []
  },
  reducers: {
    setCurrentProject: (state, action) => {
      state.currentProject = action.payload;
    },
    updateCurrentProject: (state, action) => {
      if (state.currentProject) {
        state.currentProject = { ...state.currentProject, ...action.payload };
      }
    },
    addToFavorites: (state, action) => {
      const projectId = action.payload;
      if (!state.favorites.includes(projectId)) {
        state.favorites.push(projectId);
      }
    },
    removeFromFavorites: (state, action) => {
      const projectId = action.payload;
      state.favorites = state.favorites.filter(id => id !== projectId);
    },
    clearError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Create Project
      .addCase(createProject.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createProject.fulfilled, (state, action) => {
        state.loading = false;
        const newProject = {
          ...action.payload,
          collaborators: action.payload.collaborators || []
        };
        state.projects.unshift(newProject);
        state.currentProject = newProject;
      })
      .addCase(createProject.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Fetch User Projects
      .addCase(fetchUserProjects.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserProjects.fulfilled, (state, action) => {
        state.loading = false;
        state.projects = action.payload.map(project => ({
          ...project,
          collaborators: project.collaborators || []
        }));
      })
      .addCase(fetchUserProjects.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Fetch Single Project
      .addCase(fetchProject.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProject.fulfilled, (state, action) => {
        state.loading = false;
        state.currentProject = {
          ...action.payload,
          collaborators: action.payload.collaborators || []
        };
      })
      .addCase(fetchProject.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Update Project
      .addCase(updateProject.fulfilled, (state, action) => {
        const { projectId, updates } = action.payload;
        const projectIndex = state.projects.findIndex(p => p.id === projectId);
        if (projectIndex !== -1) {
          state.projects[projectIndex] = { ...state.projects[projectIndex], ...updates };
        }
        if (state.currentProject && state.currentProject.id === projectId) {
          state.currentProject = { ...state.currentProject, ...updates };
        }
      })
      
      // Delete Project
      .addCase(deleteProject.fulfilled, (state, action) => {
        const projectId = action.payload;
        state.projects = state.projects.filter(p => p.id !== projectId);
        if (state.currentProject && state.currentProject.id === projectId) {
          state.currentProject = null;
        }
        state.favorites = state.favorites.filter(id => id !== projectId);
      })
      
      // Duplicate Project
      .addCase(duplicateProject.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(duplicateProject.fulfilled, (state, action) => {
        state.loading = false;
        const duplicatedProject = {
          ...action.payload,
          collaborators: action.payload.collaborators || []
        };
        state.projects.unshift(duplicatedProject);
      })
      .addCase(duplicateProject.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Clear projects on sign out
      .addCase('auth/signOut/fulfilled', (state) => {
        state.projects = [];
        state.currentProject = null;
        state.loading = false;
        state.error = null;
        state.favorites = [];
      });
  }
});

export const { 
  setCurrentProject, 
  updateCurrentProject, 
  addToFavorites, 
  removeFromFavorites, 
  clearError 
} = projectsSlice.actions;

export default projectsSlice.reducer;