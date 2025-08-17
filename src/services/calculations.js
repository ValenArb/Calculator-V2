// Calculation service for SQLite3 backend - handles FAT protocols only
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

class CalculationService {
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