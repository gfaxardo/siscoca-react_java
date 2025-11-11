import { useState, useCallback } from 'react';

interface ApiError {
  message: string;
  status?: number;
  code?: string;
}

export function useApiError() {
  const [error, setError] = useState<ApiError | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleError = useCallback((error: any) => {
    console.error('API Error:', error);
    
    let errorMessage = 'Error desconocido';
    let status: number | undefined;
    let code: string | undefined;

    if (error instanceof Error) {
      errorMessage = error.message;
    } else if (typeof error === 'string') {
      errorMessage = error;
    } else if (error?.message) {
      errorMessage = error.message;
      status = error.status;
      code = error.code;
    }

    setError({
      message: errorMessage,
      status,
      code
    });
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const executeWithErrorHandling = useCallback(async <T>(
    apiCall: () => Promise<T>,
    options?: {
      showLoading?: boolean;
      onSuccess?: (data: T) => void;
      onError?: (error: ApiError) => void;
    }
  ): Promise<T | null> => {
    try {
      if (options?.showLoading) {
        setIsLoading(true);
      }
      clearError();

      const result = await apiCall();
      
      if (options?.onSuccess) {
        options.onSuccess(result);
      }
      
      return result;
    } catch (error) {
      handleError(error);
      
      if (options?.onError) {
        options.onError(error as ApiError);
      }
      
      return null;
    } finally {
      if (options?.showLoading) {
        setIsLoading(false);
      }
    }
  }, [handleError, clearError]);

  return {
    error,
    isLoading,
    handleError,
    clearError,
    executeWithErrorHandling
  };
}
