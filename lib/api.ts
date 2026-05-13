import Constants from 'expo-constants';

const apiBaseUrl =
  (Constants.expoConfig?.extra?.apiBaseUrl as string | undefined) || 'http://localhost:5000/api';

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
