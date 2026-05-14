import { useState, useCallback, useEffect } from 'react';
import { admin } from '../api/AdminApi';
import { useToast } from '../contexts/ToastContext';

const getInitialFormData = () => ({
  firstName: '',
  lastName: '',
  username: '',
  password: '',
  userRole: 'TechMember',
  batchNumber: '',
  telegramUsername: '',
  teamJoinDate: '',
});

export function useAdminUsers() {
  const { showToast } = useToast();

  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const [showModal, setShowModal] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState(getInitialFormData());

  const [deleteConfirmId, setDeleteConfirmId] = useState(null);

  const [validationErrors, setValidationErrors] = useState({});

  const loadUsers = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await admin.users.fetch();
      setUsers(data);
    } catch (err) {
      setError(err.message || 'فشل تحميل المستخدمين');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const openCreateModal = useCallback(() => {
    setEditingId(null);
    setFormData(getInitialFormData());
    setValidationErrors({});
    setShowModal(true);
    setIsClosing(false);
  }, []);

  const openEditModal = useCallback((user) => {
    setEditingId(user.userId);
    setFormData({
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      username: user.username || '',
      password: '',
      userRole: user.userRole || 'TechMember',
      batchNumber: user.batchNumber ?? '',
      telegramUsername: user.telegramUsername || '',
      teamJoinDate: user.teamJoinDate || '',
    });
    setValidationErrors({});
    setShowModal(true);
    setIsClosing(false);
  }, []);

  const closeModal = useCallback(() => {
    setIsClosing(true);
    setTimeout(() => {
      setShowModal(false);
      setIsClosing(false);
      setEditingId(null);
      setFormData(getInitialFormData());
      setValidationErrors({});
    }, 200);
  }, []);

  const handleSubmit = useCallback(async (data) => {
    setValidationErrors({});
    try {
      if (editingId) {
        const { username: _, ...updateData } = data;
        await admin.users.update(editingId, updateData);
        showToast('تم تحديث المستخدم بنجاح', 'success');
      } else {
        await admin.users.create(data);
        showToast('تم إنشاء المستخدم بنجاح', 'success');
      }
      closeModal();
      await loadUsers();
    } catch (err) {
      if (err.status === 400) {
        setValidationErrors(err.errors || {});
      }
      showToast(err.message || 'فشل حفظ المستخدم', 'error');
      throw err;
    }
  }, [editingId, closeModal, loadUsers, showToast]);

  const handleDelete = useCallback((id) => {
    setDeleteConfirmId(id);
  }, []);

  const confirmDelete = useCallback(async () => {
    if (deleteConfirmId == null) return;
    try {
      await admin.users.delete(deleteConfirmId);
      showToast('تم حذف المستخدم بنجاح', 'success');
      setDeleteConfirmId(null);
      await loadUsers();
    } catch (err) {
      showToast(err.message || 'فشل حذف المستخدم', 'error');
      setDeleteConfirmId(null);
    }
  }, [deleteConfirmId, loadUsers, showToast]);

  const cancelDelete = useCallback(() => {
    setDeleteConfirmId(null);
  }, []);

  return {
    users,
    isLoading,
    error,
    showModal,
    isClosing,
    editingId,
    formData,
    deleteConfirmId,
    validationErrors,
    setFormData,
    loadUsers,
    openCreateModal,
    openEditModal,
    closeModal,
    handleSubmit,
    handleDelete,
    confirmDelete,
    cancelDelete,
  };
}
