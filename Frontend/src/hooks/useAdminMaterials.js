import { useState, useCallback } from 'react';
import admin from '../api/AdminApi';
import { useToast } from '../contexts/ToastContext';
import { formatValidationErrors } from '../utils/errorFormatter';

export function useAdminMaterials() {
  const { showToast } = useToast();

  const [materials, setMaterials] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);
  const [validationErrors, setValidationErrors] = useState(null);

  const fetchAll = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await admin.materials.fetch();
      setMaterials(data);
    } catch (err) {
      const msg = err.message || 'Failed to load materials';
      setError(msg);
      showToast(msg, 'error');
    } finally {
      setIsLoading(false);
    }
  }, [showToast]);

  const create = useCallback(async (data) => {
    setIsSaving(true);
    setValidationErrors(null);
    try {
      const result = await admin.materials.create(data);
      showToast('Material created successfully', 'success');
      await fetchAll();
      return result;
    } catch (err) {
      if (err.errors) {
        setValidationErrors(formatValidationErrors(err.errors));
      }
      showToast(err.message || 'Failed to create material', 'error');
      throw err;
    } finally {
      setIsSaving(false);
    }
  }, [showToast, fetchAll]);

  const update = useCallback(async (id, data) => {
    setIsSaving(true);
    setValidationErrors(null);
    try {
      const result = await admin.materials.update(id, data);
      showToast('Material updated successfully', 'success');
      await fetchAll();
      return result;
    } catch (err) {
      if (err.errors) {
        setValidationErrors(formatValidationErrors(err.errors));
      }
      showToast(err.message || 'Failed to update material', 'error');
      throw err;
    } finally {
      setIsSaving(false);
    }
  }, [showToast, fetchAll]);

  const remove = useCallback(async (id) => {
    setIsSaving(true);
    try {
      await admin.materials.delete(id);
      showToast('Material deleted successfully', 'success');
      await fetchAll();
    } catch (err) {
      showToast(err.message || 'Failed to delete material', 'error');
      throw err;
    } finally {
      setIsSaving(false);
    }
  }, [showToast, fetchAll]);

  return {
    materials,
    isLoading,
    isSaving,
    error,
    validationErrors,
    fetchAll,
    create,
    update,
    remove,
  };
}
