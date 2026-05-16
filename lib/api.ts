import Constants from 'expo-constants';

const normalizeApiBaseUrl = (value?: string) => {
  const trimmed = (value || '').trim().replace(/\/+$/, '');

  if (!trimmed) {
    return 'http://localhost:5000/api';
  }

  return trimmed.endsWith('/api') ? trimmed : `${trimmed}/api`;
};

const apiBaseUrl = normalizeApiBaseUrl(Constants.expoConfig?.extra?.apiBaseUrl as string | undefined);

const handleResponse = async (response: Response) => {
  const payload = await response.json();

  if (!response.ok) {
    throw new Error(payload.message || 'Request failed.');
  }

  return payload;
};

export const apiGet = async (path: string) => {
  const response = await fetch(`${apiBaseUrl}${path}`);
  return handleResponse(response);
};

export const apiPost = async (path: string, body: Record<string, unknown>) => {
  const response = await fetch(`${apiBaseUrl}${path}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  return handleResponse(response);
};

export const apiPatch = async (path: string, body: Record<string, unknown>) => {
  const response = await fetch(`${apiBaseUrl}${path}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  return handleResponse(response);
};
