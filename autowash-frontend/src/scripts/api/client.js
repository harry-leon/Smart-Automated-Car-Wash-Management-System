const API_BASE_URL = "https://api.autowash.local/api/v1";

export async function apiRequest(path, options = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
    ...options,
  });

  if (response.status === 401) {
    const refreshed = await refreshToken();
    if (refreshed) {
      return apiRequest(path, options);
    }
  }

  const payload = await response.json().catch(() => null);
  if (!response.ok || payload?.success === false) {
    throw payload || { message: "Request failed", statusCode: response.status };
  }
  return payload?.data ?? payload;
}

async function refreshToken() {
  const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
    method: "POST",
    credentials: "include",
  });
  return response.ok;
}
