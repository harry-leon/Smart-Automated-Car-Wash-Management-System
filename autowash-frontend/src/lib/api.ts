import axios, {
  AxiosError,
  AxiosInstance,
  AxiosResponse,
  AxiosRequestConfig,
  InternalAxiosRequestConfig
} from "axios";
import { clearAuthSession, getAccessToken, getRefreshToken, setAccessToken } from "@/store/auth.store";
import { ApiErrorResponse, ApiSuccessResponse } from "@/types/api.types";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "https://api.autowash.local/api/v1";

type RetriableRequestConfig = InternalAxiosRequestConfig & {
  _retry?: boolean;
};

type RefreshResponse = ApiSuccessResponse<{
  accessToken: string;
  expiresIn: number;
}>;

let refreshPromise: Promise<string | null> | null = null;

export const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json"
  },
  withCredentials: true
});

apiClient.interceptors.request.use((config) => attachAccessToken(config));
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<ApiErrorResponse>) => {
    const request = error.config as RetriableRequestConfig | undefined;

    if (!request) {
      return Promise.reject(normalizeAxiosError(error));
    }

    const isExpiredToken =
      error.response?.status === 401 &&
      error.response.data?.errorCode === "TOKEN_EXPIRED";

    if (!isExpiredToken || request._retry) {
      if (error.response?.status === 401) {
        clearAuthSession();
      }

      return Promise.reject(normalizeAxiosError(error));
    }

    request._retry = true;

    const newAccessToken = await refreshAccessToken();
    if (!newAccessToken) {
      clearAuthSession();
      return Promise.reject(normalizeAxiosError(error));
    }

    request.headers.set("Authorization", `Bearer ${newAccessToken}`);
    return apiClient(request);
  }
);

function attachAccessToken(config: InternalAxiosRequestConfig) {
  const token = getAccessToken();
  if (token) {
    config.headers.set("Authorization", `Bearer ${token}`);
  }

  return config;
}

async function refreshAccessToken(): Promise<string | null> {
  if (!refreshPromise) {
    refreshPromise = performTokenRefresh().finally(() => {
      refreshPromise = null;
    });
  }

  return refreshPromise;
}

async function performTokenRefresh(): Promise<string | null> {
  const refreshToken = getRefreshToken();

  if (!refreshToken) {
    return null;
  }

  try {
    const response = await axios.post<RefreshResponse>(
      `${API_URL}/auth/refresh`,
      { refreshToken },
      {
        headers: {
          "Content-Type": "application/json"
        },
        withCredentials: true
      }
    );

    const nextToken = response.data.data.accessToken;
    setAccessToken(nextToken, response.data.data.expiresIn);
    return nextToken;
  } catch {
    return null;
  }
}

function normalizeAxiosError(error: AxiosError<ApiErrorResponse>) {
  const payload = error.response?.data;

  if (payload) {
    return payload;
  }

  return {
    success: false,
    statusCode: error.response?.status ?? 500,
    message: error.message || "Request failed",
    errorCode: "INTERNAL_SERVER_ERROR"
  } satisfies ApiErrorResponse;
}

export async function apiRequest<TResponse, TData = unknown>(
  config: AxiosRequestConfig<TData>
) {
  const response = await apiClient.request<
    ApiSuccessResponse<TResponse>,
    AxiosResponse<ApiSuccessResponse<TResponse>>,
    TData
  >(config);

  if (!response.data.success) {
    throw response.data;
  }

  return response.data.data;
}
