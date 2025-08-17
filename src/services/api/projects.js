// API service for projects using backend SQLite
const API_BASE_URL = 'http://localhost:3002/api/v2';

class ProjectsApiService {
  constructor() {
    this.baseURL = API_BASE_URL;
  }

  // Helper method to get headers with user ID
  getHeaders(user) {
    return {
      'Content-Type': 'application/json',
      'X-User-ID': user?.uid || ''
    };
  }

  // Handle API response
  async handleResponse(response) {
    if (!response.ok) {
      const error = await response.json().catch(() => ({ 
        error: `HTTP ${response.status}` 
      }));
      throw new Error(error.error || error.message || 'API request failed');
    }
    return response.json();
  }

  // Get all projects for user
  async getProjects(user) {
    try {
      const response = await fetch(`${this.baseURL}/projects`, {
        method: 'GET',
        headers: this.getHeaders(user)
      });

      const data = await this.handleResponse(response);
      return data.projects;
    } catch (error) {
      console.error('Error fetching projects:', error);
      throw error;
    }
  }

  // Get single project
  async getProject(projectId, user) {
    try {
      const response = await fetch(`${this.baseURL}/projects/${projectId}`, {
        method: 'GET',
        headers: this.getHeaders(user)
      });

      const data = await this.handleResponse(response);
      return data.project;
    } catch (error) {
      console.error('Error fetching project:', error);
      throw error;
    }
  }

  // Create new project
  async createProject(projectData, user) {
    try {
      const response = await fetch(`${this.baseURL}/projects`, {
        method: 'POST',
        headers: this.getHeaders(user),
        body: JSON.stringify(projectData)
      });

      const data = await this.handleResponse(response);
      return data.project;
    } catch (error) {
      console.error('Error creating project:', error);
      throw error;
    }
  }

  // Update project
  async updateProject(projectId, updates, user) {
    try {
      const response = await fetch(`${this.baseURL}/projects/${projectId}`, {
        method: 'PUT',
        headers: this.getHeaders(user),
        body: JSON.stringify(updates)
      });

      const data = await this.handleResponse(response);
      return data.project;
    } catch (error) {
      console.error('Error updating project:', error);
      throw error;
    }
  }

  // Delete project
  async deleteProject(projectId, user) {
    try {
      const response = await fetch(`${this.baseURL}/projects/${projectId}`, {
        method: 'DELETE',
        headers: this.getHeaders(user)
      });

      const data = await this.handleResponse(response);
      return data;
    } catch (error) {
      console.error('Error deleting project:', error);
      throw error;
    }
  }

  // Get project activities
  async getProjectActivities(projectId, user) {
    try {
      const response = await fetch(`${this.baseURL}/projects/${projectId}/activities`, {
        method: 'GET',
        headers: this.getHeaders(user)
      });

      const data = await this.handleResponse(response);
      return data.activities;
    } catch (error) {
      console.error('Error fetching project activities:', error);
      throw error;
    }
  }

  // Compatibility methods with Firestore service names
  async getAllProjects(user) {
    return this.getProjects(user);
  }

  async getUserProjects(user) {
    return this.getProjects(user);
  }
}

export default new ProjectsApiService();