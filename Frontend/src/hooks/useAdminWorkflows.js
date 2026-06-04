import { useState, useCallback } from 'react';
import { admin } from '../api/AdminApi';
import { useToast } from '../contexts/ToastContext';
import { ApiError } from '../api/HttpClient';

export function useAdminWorkflows() {
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
      const data = await admin.workflows.fetch();
      setItems(data);
      return data;
    } catch (err) {
      setError(err.message || 'Failed to load workflows');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const toggleActive = useCallback(async (id, isActive) => {
    setError(null);
    setValidationErrors(null);
    try {
      const result = await admin.workflows.toggleActive(id, isActive);
      showToast('Workflow updated successfully', 'success');
      setItems(prev => prev.map(item =>
        item.workflowId === id ? { ...item, ...result } : item
      ));
      return result;
    } catch (err) {
      if (err instanceof ApiError && err.status === 400) {
        setValidationErrors(err.errors);
        const firstError = err.errors && Object.values(err.errors)[0];
        showToast(firstError || err.message || 'Failed to update workflow', 'error');
      } else {
        showToast(err.message || 'Failed to update workflow', 'error');
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
    toggleActive,
  };
}
