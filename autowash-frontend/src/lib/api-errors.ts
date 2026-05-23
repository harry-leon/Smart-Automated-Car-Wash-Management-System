import { ApiErrorResponse, ApiFieldError } from "@/types/api.types";

export class AuthApiError extends Error {
  readonly statusCode: number;
  readonly errorCode: string;
  readonly fieldErrors: ApiFieldError[];

  constructor(input: {
    message: string;
    statusCode: number;
    errorCode: string;
    fieldErrors?: ApiFieldError[];
  }) {
    super(input.message);
    this.name = "AuthApiError";
    this.statusCode = input.statusCode;
    this.errorCode = input.errorCode;
    this.fieldErrors = input.fieldErrors ?? [];
  }

  isExpiredSession() {
    return this.statusCode === 401 && this.errorCode === "TOKEN_EXPIRED";
  }

  isInvalidSession() {
    return this.statusCode === 401 && this.errorCode === "TOKEN_INVALID";
  }
}

export function toAuthApiError(error: ApiErrorResponse): AuthApiError {
  return new AuthApiError({
    message: error.message,
    statusCode: error.statusCode,
    errorCode: error.errorCode,
    fieldErrors: error.errors
  });
}

export function getDisplayErrorMessage(error: unknown): string {
  if (error instanceof AuthApiError) {
    return error.message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "Unexpected error";
}
