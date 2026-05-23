import { getAuthHeaders } from "@/services/internalAuth";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080/api/v1";

export class ApiError extends Error {
  status: number;
  errorCode?: string;

  constructor(message: string, status: number, errorCode?: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.errorCode = errorCode;
  }
}

interface RequestOptions extends RequestInit {
  auth?: boolean;
}

export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const headers = new Headers(options.headers);
  const isJsonBody = options.body !== undefined && !(options.body instanceof FormData);

  if (isJsonBody && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  if (options.auth) {
    Object.entries(getAuthHeaders()).forEach(([key, value]) => headers.set(key, value));
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers
  });
  const payload = await response.json().catch(() => null);

  if (!response.ok || payload?.success === false) {
    throw new ApiError(payload?.message ?? "Request failed", response.status, payload?.errorCode);
  }

  return payload;
}
