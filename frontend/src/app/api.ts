// Strictly use the cloud backend for everything (no local business)
export const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000/api/v1";

import { createClient } from "@/utils/supabase/client";

// Simple client-side API helper
export async function fetchFromMetaphor(endpoint: string, body?: any, method?: string) {
  let apiKey = null;
  let token = null;

  if (typeof window !== 'undefined') {
    apiKey = localStorage.getItem("metaphor_api_key");
    const supabase = createClient();
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      token = session.access_token;
    }
  }
  
  const headers: Record<string, string> = {
    "Content-Type": "application/json"
  };
  
  if (apiKey) {
    headers["X-API-Key"] = apiKey;
  }
  
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const options: RequestInit = {
    method: method || (body ? "POST" : "GET"),
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
