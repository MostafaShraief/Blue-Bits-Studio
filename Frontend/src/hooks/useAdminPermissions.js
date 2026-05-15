import { useState, useCallback } from 'react';
import { admin } from '../api/AdminApi';
import { useToast } from '../contexts/ToastContext';
import { ApiError } from '../api/HttpClient';

export function useAdminPermissions() {
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
      const data = await admin.permissions.fetch();
      setItems(data);
      return data;
    } catch (err) {
      setError(err.message || 'Failed to load permissions');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const create = useCallback(async (data) => {
    setError(null);
    setValidationErrors(null);
    try {
      const result = await admin.permissions.create(data);
      showToast('Permission created successfully', 'success');
      return result;
    } catch (err) {
      if (err instanceof ApiError && err.status === 400) {
        setValidationErrors(err.errors);
      }
      showToast(err.message || 'Failed to create permission', 'error');
      throw err;
    }
  }, [showToast]);

  const deleteItem = useCallback(async (id) => {
    setError(null);
    setValidationErrors(null);
    try {
      await admin.permissions.delete(id);
      showToast('Permission deleted successfully', 'success');
      setItems(prev => prev.filter(item => item.id !== id));
    } catch (err) {
      if (err instanceof ApiError && err.status === 400) {
        setValidationErrors(err.errors);
      }
      showToast(err.message || 'Failed to delete permission', 'error');
      throw err;
    }
  }, [showToast]);

  return {
    items,
    isLoading,
    error,
    validationErrors,
    list,
    create,
    delete: deleteItem,
  };
}
