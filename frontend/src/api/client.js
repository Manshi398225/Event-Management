const API_URL = import.meta.env.VITE_API_URL || "/api";

const buildHeaders = (token, isJson = true) => {
  const headers = {};

  if (isJson) {
    headers["Content-Type"] = "application/json";
  }

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  return headers;
};

export const apiRequest = async (endpoint, options = {}) => {
  const { token, body, headers, ...rest } = options;
  let response;

  try {
    response = await fetch(`${API_URL}${endpoint}`, {
      ...rest,
      headers: {
        ...buildHeaders(token, body !== undefined),
        ...headers,
      },
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch (error) {
    throw new Error("Unable to reach the API. Make sure the backend server is running.");
  }

  const data = await response.json().catch(() => ({}));

  if (response.status === 401) {
    window.dispatchEvent(new Event("auth:expired"));
  }

  if (!response.ok) {
    throw new Error(
      data.message || (response.status === 401 ? "Session expired. Please log in again." : "Request failed")
    );
  }

  return data;
};

export default API_URL;
