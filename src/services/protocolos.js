// Protocols service for separate protocol endpoints
import appConfig from '../config/appConfig.js';

class ProtocolService {
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
      console.error(`Protocol API request failed: ${endpoint}`, error);
      throw error;
    }
  }

  // Get protocol data for a project
  async getProtocols(projectId, userId) {
    return this.request(`/protocolos/${projectId}?userId=${encodeURIComponent(userId)}`);
  }

  // Save protocol data for a project
  async saveProtocols(projectId, userId, protocolosPorTablero) {
    return this.request(`/protocolos/${projectId}`, {
      method: 'PUT',
      body: JSON.stringify({
        userId,
        protocolosPorTablero
      }),
    });
  }

  // Delete protocol data for a project
  async deleteProtocols(projectId, userId) {
    return this.request(`/protocolos/${projectId}?userId=${encodeURIComponent(userId)}`, {
      method: 'DELETE',
    });
  }
}

// Create and export a singleton instance
const protocolService = new ProtocolService();

export default protocolService;

// Export individual methods for convenience
export const {
  getProtocols,
  saveProtocols,
  deleteProtocols
} = protocolService;