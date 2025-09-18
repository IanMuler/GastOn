import { ApiPaths, ApiError, ApiResponse } from '@/types/api';
import { buildUrl } from './buildUrl';

export type FetchHandlerParams = Record<string, string | number | boolean | undefined>;

export interface FetchHandlerConfig {
  path: keyof ApiPaths;
  params?: FetchHandlerParams;
  error?: string;
  baseUrl?: string;
}

export interface PostHandlerConfig<T = any> extends FetchHandlerConfig {
  body?: T;
}

export interface DeleteHandlerConfig extends FetchHandlerConfig {
  body?: any;
}

/**
 * Custom error class for API errors
 */
export class ApiResponseError extends Error {
  constructor(
    public statusCode: number,
    public apiError: ApiError,
    public originalError?: Error
  ) {
    super(apiError.message);
    this.name = 'ApiResponseError';
  }
}

/**
 * Generic fetch handler for GET requests
 */
export const fetchHandler = async <T = any>({
  path,
  params = {},
  error = 'Error al realizar la petición',
  baseUrl
}: FetchHandlerConfig): Promise<T> => {
  try {
    const url = buildUrl(path, params as Record<string, string | number | boolean | undefined>, baseUrl);
    
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      await handleErrorResponse(response, error, { path, params });
    }

    const data: ApiResponse<T> = await response.json();
    
    if (!data.success) {
      throw new ApiResponseError(data.statusCode, data as unknown as ApiError);
    }

    return data.data;
  } catch (error) {
    if (error instanceof ApiResponseError) {
      throw error;
    }
    
    console.error('Fetch Handler Error:', {
      path,
      params,
      error: error instanceof Error ? error.message : String(error)
    });
    
    throw new Error(error instanceof Error ? error.message : String(error));
  }
};

/**
 * Generic POST handler
 */
export const postHandler = async <TRequest = any, TResponse = any>({
  path,
  params = {},
  body,
  error = 'Error al crear el recurso',
  baseUrl
}: PostHandlerConfig<TRequest>): Promise<TResponse> => {
  try {
    const url = buildUrl(path, params as Record<string, string | number | boolean | undefined>, baseUrl);
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: body ? JSON.stringify(body) : undefined,
    });

    if (!response.ok) {
      await handleErrorResponse(response, error, { path, params, body });
    }

    const data: ApiResponse<TResponse> = await response.json();
    
    if (!data.success) {
      throw new ApiResponseError(data.statusCode, data as unknown as ApiError);
    }

    return data.data;
  } catch (error) {
    if (error instanceof ApiResponseError) {
      throw error;
    }
    
    console.error('Post Handler Error:', {
      path,
      params,
      body,
      error: error instanceof Error ? error.message : String(error)
    });
    
    throw new Error(error instanceof Error ? error.message : String(error));
  }
};

/**
 * Generic PUT handler
 */
export const putHandler = async <TRequest = any, TResponse = any>({
  path,
  params = {},
  body,
  error = 'Error al actualizar el recurso',
  baseUrl
}: PostHandlerConfig<TRequest>): Promise<TResponse> => {
  try {
    const url = buildUrl(path, params as Record<string, string | number | boolean | undefined>, baseUrl);
    
    const response = await fetch(url, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: body ? JSON.stringify(body) : undefined,
    });

    if (!response.ok) {
      await handleErrorResponse(response, error, { path, params, body });
    }

    const data: ApiResponse<TResponse> = await response.json();
    
    if (!data.success) {
      throw new ApiResponseError(data.statusCode, data as unknown as ApiError);
    }

    return data.data;
  } catch (error) {
    if (error instanceof ApiResponseError) {
      throw error;
    }
    
    console.error('Put Handler Error:', {
      path,
      params,
      body,
      error: error instanceof Error ? error.message : String(error)
    });
    
    throw new Error(error instanceof Error ? error.message : String(error));
  }
};

/**
 * Generic DELETE handler
 */
export const deleteHandler = async <TResponse = any>({
  path,
  params = {},
  body,
  error = 'Error al eliminar el recurso',
  baseUrl
}: DeleteHandlerConfig): Promise<TResponse> => {
  try {
    const url = buildUrl(path, params as Record<string, string | number | boolean | undefined>, baseUrl);
    
    const response = await fetch(url, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: body ? JSON.stringify(body) : undefined,
    });

    if (!response.ok) {
      await handleErrorResponse(response, error, { path, params, body });
    }

    const data: ApiResponse<TResponse> = await response.json();
    
    if (!data.success) {
      throw new ApiResponseError(data.statusCode, data as unknown as ApiError);
    }

    return data.data;
  } catch (error) {
    if (error instanceof ApiResponseError) {
      throw error;
    }
    
    console.error('Delete Handler Error:', {
      path,
      params,
      body,
      error: error instanceof Error ? error.message : String(error)
    });
    
    throw new Error(error instanceof Error ? error.message : String(error));
  }
};

/**
 * Helper function to handle error responses
 */
const handleErrorResponse = async (
  response: Response,
  customError: string,
  context: any
) => {
  let errorData: ApiError;
  
  try {
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      errorData = await response.json();
    } else {
      const textError = await response.text();
      errorData = {
        success: false,
        statusCode: response.status,
        message: textError || customError,
        timestamp: new Date().toISOString()
      };
    }
  } catch (parseError) {
    errorData = {
      success: false,
      statusCode: response.status,
      message: customError,
      timestamp: new Date().toISOString()
    };
  }

  console.error('API Error:', {
    ...context,
    status: response.status,
    error: errorData
  });

  throw new ApiResponseError(response.status, errorData);
};