// Environment configuration
interface EnvironmentConfig {
  apiBaseUrl: string;
  wsBaseUrl: string;
}

const getEnvironmentConfig = (): EnvironmentConfig => {
  // Check for environment variables first (for production builds)
  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;
  const wsBaseUrl = import.meta.env.VITE_WS_BASE_URL;

  if (apiBaseUrl && wsBaseUrl) {
    return {
      apiBaseUrl,
      wsBaseUrl
    };
  }

  // Fallback to development defaults
  return {
    apiBaseUrl: 'http://localhost:3000',
    wsBaseUrl: 'http://localhost:3000'
  };
};

export const config = getEnvironmentConfig(); 