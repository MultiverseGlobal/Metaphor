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

const apiCache = new Map<string, { data: any; timestamp: number }>();
const CACHE_TTL_MS = 15000; // 15 seconds

export function clearApiCache() {
  apiCache.clear();
}

// Simple client-side API helper with lightweight GET caching
export async function fetchFromMetaphor(endpoint: string, body?: any, method?: string, allowAnonymous: boolean = false, skipCache: boolean = false) {
  const reqMethod = (method || (body ? "POST" : "GET")).toUpperCase();
  const cacheKey = `${reqMethod}:${endpoint}`;

  // In-memory cache lookup for GET requests
  if (reqMethod === "GET" && !skipCache) {
    const cached = apiCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
      return cached.data;
    }
  }

  let apiKey = null;
  let token = null;

  if (typeof window !== 'undefined') {
    apiKey = localStorage.getItem("metaphor_api_key");
    const supabase = createClient();
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      token = session.access_token;
    } else if (!apiKey && !allowAnonymous && !endpoint.includes("/oauth/")) {
      throw new Error("No active Supabase session or API key found! Please make sure you are signed in.");
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
    method: reqMethod,
    headers
  };

  if (body) {
    options.body = typeof body === "string" ? body : JSON.stringify(body);
  }

  const backendUrl = getBackendUrl();
  const res = await fetch(`${backendUrl}${endpoint}`, options);
  
  if (!res.ok) {
    const errText = await res.text();
    if (res.status === 401 && (errText.includes("JWT does not exist") || errText.includes("validation error") || errText.includes("invalid or user not found"))) {
      if (typeof window !== 'undefined') {
        const supabase = createClient();
        await supabase.auth.signOut().catch(() => {});
        localStorage.clear();
        document.cookie = "metaphor_onboarded=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;";
      }
    }
    throw new Error(`Backend request failed (${res.status}): ${errText}`);
  }


  // Clear cache on mutating operations
  if (reqMethod !== "GET") {
    apiCache.clear();
  }

  const resData = await res.json();
  if (reqMethod === "GET") {
    apiCache.set(cacheKey, { data: resData, timestamp: Date.now() });
  }

  return resData;
}
