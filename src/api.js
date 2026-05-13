const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

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

export const apiDelete = async (path) => {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: 'DELETE',
  });

  return handleResponse(response);
};
