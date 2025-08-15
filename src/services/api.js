// API service for Calculator V2 backend
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

class ApiService {
  constructor() {
    this.baseURL = API_BASE_URL;
  }

  // Generic request method
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error(`API request failed: ${endpoint}`, error);
      throw error;
    }
  }

  // Projects API
  async getProjects(userId) {
    return this.request(`/projects?userId=${encodeURIComponent(userId)}`);
  }

  async getProject(projectId, userId) {
    return this.request(`/projects/${projectId}?userId=${encodeURIComponent(userId)}`);
  }

  async createProject(projectData) {
    return this.request('/projects', {
      method: 'POST',
      body: JSON.stringify(projectData),
    });
  }

  async updateProject(projectId, projectData) {
    return this.request(`/projects/${projectId}`, {
      method: 'PUT',
      body: JSON.stringify(projectData),
    });
  }

  async deleteProject(projectId, userId) {
    return this.request(`/projects/${projectId}?userId=${encodeURIComponent(userId)}`, {
      method: 'DELETE',
    });
  }

  async getProjectActivity(projectId, userId, limit = 10) {
    return this.request(`/projects/${projectId}/activity?userId=${encodeURIComponent(userId)}&limit=${limit}`);
  }

  // Health check
  async healthCheck() {
    return this.request('/health');
  }
}

// Create and export a singleton instance
const apiService = new ApiService();

export default apiService;

// Export individual methods for convenience
export const {
  getProjects,
  getProject,
  createProject,
  updateProject,
  deleteProject,
  getProjectActivity,
  healthCheck
} = apiService;