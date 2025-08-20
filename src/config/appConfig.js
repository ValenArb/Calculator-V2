/**
 * Application Configuration Service
 * Loads configuration from JSON file in public folder
 */
class AppConfig {
  constructor() {
    this.config = null;
    this.loading = false;
    this.loadPromise = null;
  }

  /**
   * Load configuration from JSON file
   * @returns {Promise<Object>} Configuration object
   */
  async loadConfig() {
    if (this.config) {
      return this.config;
    }

    if (this.loading) {
      return this.loadPromise;
    }

    this.loading = true;
    this.loadPromise = this._fetchConfig();
    
    try {
      this.config = await this.loadPromise;
      return this.config;
    } finally {
      this.loading = false;
    }
  }

  /**
   * Private method to fetch config from public folder
   * @private
   */
  async _fetchConfig() {
    try {
      const response = await fetch('/config/app-config.json');
      if (!response.ok) {
        throw new Error(`Failed to load config: ${response.status}`);
      }
      const config = await response.json();
      console.log('📋 App configuration loaded successfully');
      return config;
    } catch (error) {
      console.error('❌ Failed to load app configuration:', error);
      // Return default fallback configuration
      return this._getDefaultConfig();
    }
  }

  /**
   * Get default configuration as fallback
   * @private
   */
  _getDefaultConfig() {
    return {
      backend: {
        baseUrl: 'http://localhost:3001',
        apiPath: '/api'
      },
      app: {
        name: 'Calculadora Eléctrica V2',
        version: '2.0.0',
        environment: 'development'
      }
    };
  }

  /**
   * Get backend base URL
   * @returns {Promise<string>}
   */
  async getBackendUrl() {
    const config = await this.loadConfig();
    return config.backend.baseUrl;
  }

  /**
   * Get full API base URL
   * @returns {Promise<string>}
   */
  async getApiUrl() {
    const config = await this.loadConfig();
    return `${config.backend.baseUrl}${config.backend.apiPath}`;
  }

  /**
   * Get app information
   * @returns {Promise<Object>}
   */
  async getAppInfo() {
    const config = await this.loadConfig();
    return config.app;
  }

  /**
   * Check if running in development mode
   * @returns {Promise<boolean>}
   */
  async isDevelopment() {
    const config = await this.loadConfig();
    return config.app.environment === 'development';
  }

  /**
   * Reset configuration (for testing or reloading)
   */
  reset() {
    this.config = null;
    this.loading = false;
    this.loadPromise = null;
  }
}

// Create singleton instance
const appConfig = new AppConfig();

export default appConfig;

// Export commonly used methods as named exports
export const getBackendUrl = () => appConfig.getBackendUrl();
export const getApiUrl = () => appConfig.getApiUrl();
export const getAppInfo = () => appConfig.getAppInfo();
export const isDevelopment = () => appConfig.isDevelopment();