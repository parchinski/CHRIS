const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

if (!API_BASE_URL) {
  console.error("VITE_API_BASE_URL is not defined. Check your .env file.");
}

type JsonValue = unknown;

function isJsonContentType(ct: string | null): boolean {
  if (!ct) return false;
  const lc = ct.toLowerCase();
  return lc.includes("application/json") || lc.includes("+json");
}

function safeStringify(value: unknown, cap = 10_000): string {
  try {
    const s = JSON.stringify(value);
    if (!s) return String(value);
    return s.length > cap ? s.slice(0, cap) + "...(truncated)" : s;
  } catch {
    try {
      return String(value);
    } catch {
      return "[Unserializable]";
    }
  }
}

async function tryReadJson(response: Response): Promise<JsonValue | undefined> {
  if (!isJsonContentType(response.headers.get("content-type")))
    return undefined;
  try {
    return await response.json();
  } catch {
    return undefined;
  }
}

async function buildErrorMessage(
  response: Response,
  prefix: string,
): Promise<string> {
  let msg = `${prefix} status: ${response.status}`;
  const payload = await tryReadJson(response);
  if (payload !== undefined) {
    const detail =
      payload &&
      typeof payload === "object" &&
      payload !== null &&
      "detail" in (payload as Record<string, unknown>)
        ? (payload as Record<string, unknown>).detail
        : undefined;
    const serialized =
      typeof detail === "string" ? detail : safeStringify(payload);
    msg += `, message: ${serialized}`;
  }
  return msg;
}

function shouldTreatAsEmptyBody(response: Response): boolean {
  return response.status === 204 || response.status === 205;
}

/**
 * Fetch wrapper that prepends the API base URL and includes credentials.
 */
async function apiFetch(
  endpoint: string,
  options: RequestInit = {},
): Promise<Response> {
  const url = `${API_BASE_URL}${endpoint}`;

  const providedHeaders =
    options.headers instanceof Headers
      ? Object.fromEntries(options.headers.entries())
      : (options.headers as Record<string, string>) || {};

  const headers: HeadersInit = { ...providedHeaders };

  const merged: RequestInit = {
    credentials: "include",
    headers,
    ...options,
  };

  return fetch(url, merged);
}

async function parseJsonIfAny<T>(response: Response): Promise<T> {
  if (shouldTreatAsEmptyBody(response)) {
    return undefined as T;
  }
  const contentLength = response.headers.get("content-length");
  if (contentLength === "0") {
    return undefined as T;
  }
  return response.json() as Promise<T>;
}

/**
 * Performs a GET request.
 */
export async function get<T>(
  endpoint: string,
  options?: RequestInit,
): Promise<T> {
  const response = await apiFetch(endpoint, { ...options, method: "GET" });
  if (!response.ok) {
    const message = await buildErrorMessage(response, "ERROR,");
    throw new Error(message);
  }
  return parseJsonIfAny<T>(response);
}

/**
 * Performs a POST request with JSON body support.
 */
export async function post<T>(
  endpoint: string,
  body?: unknown,
  options?: RequestInit,
): Promise<T> {
  const jsonBody = body !== undefined ? JSON.stringify(body) : null;

  const providedHeaders =
    options?.headers instanceof Headers
      ? Object.fromEntries(options.headers.entries())
      : (options?.headers as Record<string, string>) || {};

  const headers: HeadersInit =
    jsonBody !== null
      ? { "Content-Type": "application/json", ...providedHeaders }
      : { ...providedHeaders };

  const response = await apiFetch(endpoint, {
    ...options,
    method: "POST",
    headers,
    body: jsonBody,
  });

  if (!response.ok) {
    const message = await buildErrorMessage(response, "HTTP error!");
    throw new Error(message);
  }
  return parseJsonIfAny<T>(response);
}

/**
 * Performs a PATCH request with JSON body support.
 */
export async function patch<T>(
  endpoint: string,
  body?: unknown,
  options?: RequestInit,
): Promise<T> {
  const jsonBody = body !== undefined ? JSON.stringify(body) : null;

  const providedHeaders =
    options?.headers instanceof Headers
      ? Object.fromEntries(options.headers.entries())
      : (options?.headers as Record<string, string>) || {};

  const headers: HeadersInit =
    jsonBody !== null
      ? { "Content-Type": "application/json", ...providedHeaders }
      : { ...providedHeaders };

  const response = await apiFetch(endpoint, {
    ...options,
    method: "PATCH",
    headers,
    body: jsonBody,
  });

  if (!response.ok) {
    const message = await buildErrorMessage(response, "HTTP error!");
    throw new Error(message);
  }
  return parseJsonIfAny<T>(response);
}

/*
 * Performs a DELETE request with JSON body support.
 */
export async function del<T>(
  endpoint: string,
  options?: RequestInit,
): Promise<T> {
  const response = await apiFetch(endpoint, { ...options, method: "DELETE" });
  if (!response.ok) {
    const message = await buildErrorMessage(response, "HTTP error!");
    throw new Error(message);
  }
  return parseJsonIfAny<T>(response);
}

export default apiFetch;
