// Calculation service for SQLite3 backend - handles FAT protocols only
import appConfig from '../config/appConfig.js';

class CalculationService {
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

  // Generic request method with timeout
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

    // Add timeout to prevent hanging requests
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
    
    config.signal = controller.signal;

    try {
      const response = await fetch(url, config);
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      clearTimeout(timeoutId);
      if (error.name === 'AbortError') {
        console.error(`Request timeout: ${endpoint}`);
        throw new Error('La request tardó demasiado tiempo. Intenta de nuevo.');
      }
      console.error(`Calculation API request failed: ${endpoint}`, error);
      throw error;
    }
  }

  // Get calculation data for a project
  async getCalculations(projectId, userId) {
    return this.request(`/calculations/${projectId}?userId=${encodeURIComponent(userId)}`);
  }

  // Save calculation data for a project (FAT protocols only)
  async saveCalculations(projectId, userId, calculationData) {
    return this.request(`/calculations/${projectId}`, {
      method: 'PUT',
      body: JSON.stringify({
        userId,
        calculationData: {
          protocolosPorTablero: calculationData.protocolosPorTablero || {}
        }
      }),
    });
  }

  // Delete calculation data for a project
  async deleteCalculations(projectId, userId) {
    return this.request(`/calculations/${projectId}?userId=${encodeURIComponent(userId)}`, {
      method: 'DELETE',
    });
  }

  // Get calculation statistics for a user
  async getCalculationStats(userId) {
    return this.request(`/calculations/stats?userId=${encodeURIComponent(userId)}`);
  }
}

// Create and export a singleton instance
const calculationService = new CalculationService();

export default calculationService;

// Export individual methods for convenience
export const {
  getCalculations,
  saveCalculations,
  deleteCalculations,
  getCalculationStats
} = calculationService;