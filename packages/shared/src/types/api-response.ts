export interface ApiSuccess<T> {
  data: T;
}

export interface ApiError {
  error: {
    message: string;
    code?: string;
    details?: unknown;
  };
}

export type ApiResponse<T> = ApiSuccess<T> | ApiError;

export function isApiError<T>(response: ApiResponse<T>): response is ApiError {
  return 'error' in response;
}
