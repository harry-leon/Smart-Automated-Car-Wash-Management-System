export type ApiSuccessResponse<T> = {
  success: true;
  statusCode: number;
  message: string;
  data: T;
  timestamp?: string;
};

export type ApiPaginatedResponse<T> = {
  success: true;
  statusCode?: number;
  message?: string;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasMore: boolean;
  };
  timestamp?: string;
};

export type ApiFieldError = {
  field: string;
  message: string;
  code: string;
};

export type ApiErrorResponse = {
  success: false;
  statusCode: number;
  message: string;
  errorCode: string;
  errors?: ApiFieldError[];
  error?: {
    code?: string;
    message?: string;
    action?: string;
    suggestion?: string;
  };
};
