const API_BASE = '/api/v1';

export const apiCall = async (endpoint, options = {}) => {
  const headers = {
    ...options.headers
  };

  // Do not set Content-Type header if body is FormData (browser will auto set multipart boundary)
  if (!(options.body instanceof FormData) && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json';
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    credentials: 'include',
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
