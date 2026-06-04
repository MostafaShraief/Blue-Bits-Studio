import { useState, useCallback } from 'react';
import { admin } from '../api/AdminApi';
import { useToast } from '../contexts/ToastContext';
import { ApiError } from '../api/HttpClient';

export function useAdminPrompts() {
  const { showToast } = useToast();

  const [items, setItems] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [validationErrors, setValidationErrors] = useState(null);

  const list = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    setValidationErrors(null);
    try {
      const data = await admin.prompts.fetch();
      setItems(data);
      return data;
    } catch (err) {
      setError(err.message || 'Failed to load prompts');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateText = useCallback(async (id, promptText) => {
    setError(null);
    setValidationErrors(null);
    try {
      const result = await admin.prompts.updateText(id, promptText);
      showToast('Prompt updated successfully', 'success');
      setItems(prev => prev.map(item =>
        item.promptId === id ? { ...item, ...result } : item
      ));
      return result;
    } catch (err) {
      if (err instanceof ApiError && err.status === 400) {
        setValidationErrors(err.errors);
        const firstError = err.errors && Object.values(err.errors)[0];
        showToast(firstError || err.message || 'Failed to update prompt', 'error');
      } else {
        showToast(err.message || 'Failed to update prompt', 'error');
      }
      throw err;
    }
  }, [showToast]);

  return {
    items,
    isLoading,
    error,
    validationErrors,
    list,
    updateText,
  };
}
