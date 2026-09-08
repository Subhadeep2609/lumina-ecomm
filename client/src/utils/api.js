const API_BASE = '/api/v1';

export const apiCall = async (endpoint, options = {}) => {
  const token = localStorage.getItem('lumina_token');

  const headers = {
    ...options.headers
  };

  // Do not set Content-Type header if body is FormData (browser will auto set multipart boundary)
  if (!(options.body instanceof FormData) && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json';
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers
  });

  const data = await response.json();

  if (!response.ok) {
    const error = new Error(data.message || 'An error occurred during API call');
    error.status = response.status;
    error.data = data;
    throw error;
  }

  return data;
};
