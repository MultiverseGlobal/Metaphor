const BACKEND_URL = "http://localhost:8000/api/v1";
const DEFAULT_API_KEY = "metaphor_dev_secret_key_123";

// Simple client-side API helper
export async function fetchFromMetaphor(endpoint: string, body?: any) {
  const apiKey = localStorage.getItem("metaphor_api_key") || DEFAULT_API_KEY;
  
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    "X-API-Key": apiKey
  };

  const options: RequestInit = {
    method: body ? "POST" : "GET",
    headers
  };

  if (body) {
    options.body = JSON.stringify(body);
  }

  const response = await fetch(`${BACKEND_URL}${endpoint}`, options);
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || `HTTP Error ${response.status}`);
  }

  return response.json();
}
