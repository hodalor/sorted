const normalizeApiBaseUrl = (value) => {
  const trimmed = (value || '').trim().replace(/\/+$/, '');

  if (!trimmed) {
    return 'http://localhost:5000/api';
  }

  return trimmed.endsWith('/api') ? trimmed : `${trimmed}/api`;
};

const API_BASE_URL = normalizeApiBaseUrl(process.env.REACT_APP_API_URL);

const handleResponse = async (response) => {
  const payload = await response.json();

  if (!response.ok) {
    throw new Error(payload.message || 'Request failed.');
  }

  return payload;
};

export const apiGet = async (path) => {
  const response = await fetch(`${API_BASE_URL}${path}`);
  return handleResponse(response);
};

export const apiPost = async (path, body) => {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  return handleResponse(response);
};

export const apiPatch = async (path, body) => {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  return handleResponse(response);
};
