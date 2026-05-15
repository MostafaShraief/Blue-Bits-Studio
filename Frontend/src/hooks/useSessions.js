import { useState, useEffect, useCallback } from 'react';
import {
  getSessions,
  getSession as fetchSession,
  createSession as apiCreateSession,
  saveSessionContent,
  uploadFiles as apiUploadFiles,
  removeSession as apiRemoveSession,
} from '../api/SessionsApi';
import { useToast } from '../contexts/ToastContext';

export function useSessions({ initialPage = 1, limit = 10 } = {}) {
  const { showToast } = useToast();

  const [sessions, setSessions] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(initialPage);
  const [hasMore, setHasMore] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const loadSessions = useCallback(async (pageNum, append = false) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await getSessions(pageNum, limit);
      setSessions(prev => (append ? [...prev, ...data.sessions] : data.sessions));
      setTotalCount(data.totalCount);
      setPage(data.page);
      setHasMore(data.hasMore);
    } catch (err) {
      if (err.name === 'RateLimitError') {
        showToast(err.message, 'warning');
      }
      setError(err.message || 'Failed to load sessions');
    } finally {
      setIsLoading(false);
    }
  }, [limit, showToast]);

  useEffect(() => {
    loadSessions(initialPage);
  }, [initialPage, loadSessions]);

  const loadMore = useCallback(() => {
    if (!isLoading && hasMore) {
      loadSessions(page + 1, true);
    }
  }, [isLoading, hasMore, page, loadSessions]);

  const refresh = useCallback(() => {
    loadSessions(initialPage);
  }, [initialPage, loadSessions]);

  const createSession = useCallback(async (data) => {
    try {
      const session = await apiCreateSession(data);
      showToast('Session created successfully', 'success');
      return session;
    } catch (err) {
      showToast(err.message || 'Failed to create session', 'error');
      throw err;
    }
  }, [showToast]);

  const getSession = useCallback(async (id) => {
    try {
      return await fetchSession(id);
    } catch (err) {
      if (err.name === 'RateLimitError') {
        showToast(err.message, 'warning');
      } else {
        showToast(err.message || 'Failed to load session', 'error');
      }
      throw err;
    }
  }, [showToast]);

  const removeSession = useCallback(async (id) => {
    try {
      await apiRemoveSession(id);
      showToast('تم حذف الجلسة بنجاح', 'success');
      loadSessions(initialPage);
    } catch (err) {
      if (err.name === 'RateLimitError') {
        showToast(err.message, 'warning');
      } else {
        showToast(err.message || 'Failed to delete session', 'error');
      }
      throw err;
    }
  }, [showToast, initialPage, loadSessions]);

  const saveContent = useCallback(async (sessionId, body) => {
    try {
      const result = await saveSessionContent(sessionId, body);
      showToast('Content saved successfully', 'success');
      return result;
    } catch (err) {
      showToast(err.message || 'Failed to save content', 'error');
      throw err;
    }
  }, [showToast]);

  const uploadFiles = useCallback(async (sessionId, files, notes = []) => {
    try {
      const result = await apiUploadFiles(sessionId, files, notes);
      showToast('Files uploaded successfully', 'success');
      return result;
    } catch (err) {
      showToast(err.message || 'Failed to upload files', 'error');
      throw err;
    }
  }, [showToast]);

  return {
    sessions,
    totalCount,
    page,
    hasMore,
    isLoading,
    error,
    createSession,
    getSession,
    saveContent,
    uploadFiles,
    loadMore,
    refresh,
    removeSession,
  };
}
