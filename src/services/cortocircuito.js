// Short circuit calculations service for separate cortocircuito endpoints
import appConfig from '../config/appConfig.js';

class CortocircuitoService {
  constructor() {
    this.baseURL = null;
    this.initPromise = this.initialize();
  }

  async initialize() {
    try {
      this.baseURL = await appConfig.getApiUrl();
    } catch (error) {
      console.error('Failed to load API configuration, using fallback:', error);
      this.baseURL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
    }
  }

  async ensureInitialized() {
    if (!this.baseURL) {
      await this.initPromise;
    }
  }

  // Generic request method
  async request(endpoint, options = {}) {
    await this.ensureInitialized();
    
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
      console.error(`Cortocircuito API request failed: ${endpoint}`, error);
      throw error;
    }
  }

  // Get cortocircuito data for a project
  async getCortocircuito(projectId, userId) {
    return this.request(`/cortocircuito/${projectId}?userId=${encodeURIComponent(userId)}`);
  }

  // Save cortocircuito data for a project
  async saveCortocircuito(projectId, userId, calculosData) {
    return this.request(`/cortocircuito/${projectId}`, {
      method: 'PUT',
      body: JSON.stringify({
        userId,
        calculosData
      }),
    });
  }

  // Delete cortocircuito data for a project
  async deleteCortocircuito(projectId, userId) {
    return this.request(`/cortocircuito/${projectId}?userId=${encodeURIComponent(userId)}`, {
      method: 'DELETE',
    });
  }
}

// Create and export a singleton instance
const cortocircuitoService = new CortocircuitoService();

export default cortocircuitoService;

// Export individual methods for convenience
export const {
  getCortocircuito,
  saveCortocircuito,
  deleteCortocircuito
} = cortocircuitoService;