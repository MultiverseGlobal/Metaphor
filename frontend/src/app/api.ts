export function getBackendUrl(): string {
  if (process.env.NEXT_PUBLIC_BACKEND_URL) {
    return process.env.NEXT_PUBLIC_BACKEND_URL;
  }
  if (typeof window !== "undefined") {
    const host = window.location.hostname;
    if (host !== "localhost" && host !== "127.0.0.1") {
      return `${window.location.origin}/api/v1`;
    }
  }
  return "http://localhost:8000/api/v1";
}

export const BACKEND_URL = getBackendUrl();

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
    } else {
      throw new Error("No active Supabase session found! Please make sure you are signed in.");
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

  const baseUrl = getBackendUrl();
  const response = await fetch(`${baseUrl}${endpoint}`, options);
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || `HTTP Error ${response.status}`);
  }

  return response.json();
}
