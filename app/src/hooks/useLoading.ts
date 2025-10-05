import { useState, useCallback } from "react";

export const useLoading = (initialState = false) => {
  const [loading, setLoading] = useState(initialState);
  const [error, setError] = useState<string | null>(null);

  const startLoading = useCallback(() => {
    setLoading(true);
    setError(null);
  }, []);

  const stopLoading = useCallback(() => {
    setLoading(false);
  }, []);

  const setLoadingError = useCallback((errorMessage: string) => {
    setError(errorMessage);
    setLoading(false);
  }, []);

  async function executeWithLoading<T>(
    asyncFunction: () => Promise<T>,
    options?: {
      onSuccess?: (result: T) => void;
      onError?: (error: unknown) => void;
      successMessage?: string;
    }
  ): Promise<T | null> {
    startLoading();
    try {
      const result = await asyncFunction();
      options?.onSuccess?.(result);
      return result;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Ocorreu um erro";
      setLoadingError(errorMessage);
      options?.onError?.(error);
      return null;
    } finally {
      stopLoading();
    }
  }

  const executeWithLoadingMemoized = useCallback(executeWithLoading, [
    startLoading,
    stopLoading,
    setLoadingError,
  ]);

  return {
    loading,
    error,
    startLoading,
    stopLoading,
    setLoadingError,
    executeWithLoading: executeWithLoadingMemoized,
  };
};
