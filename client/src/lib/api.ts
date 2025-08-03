const API_BASE_URL = import.meta.env.REACT_APP_BACKEND_URL || 'http://localhost:5000';

export const apiRequest = async (method: string, endpoint: string, data?: any): Promise<any> => {
  try {
    const config: RequestInit = {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include'
    };

    if (data && method !== 'GET') {
      if (data instanceof FormData) {
        // Remove content-type header for FormData
        delete (config.headers as any)['Content-Type'];
        config.body = data;
      } else {
        config.body = JSON.stringify(data);
      }
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
    
    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('API Request failed:', error);
    throw error;
  }
};

export default apiRequest;