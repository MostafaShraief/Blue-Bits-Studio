import { useState, useCallback } from 'react';
import { useSessions } from './useSessions';
import { useToast } from '../contexts/ToastContext';

export function useWizard({ totalSteps = 1 } = {}) {
  const { showToast } = useToast();
  const {
    createSession: apiCreateSession,
    saveContent: apiSaveContent,
  } = useSessions();

  const [currentStep, setCurrentStep] = useState(0);
  const [sessionId, setSessionId] = useState(null);
  const [wizardData, setWizardData] = useState({});

  const next = useCallback(() => {
    setCurrentStep((prev) => {
      const nextStep = prev + 1;
      return nextStep < totalSteps ? nextStep : prev;
    });
  }, [totalSteps]);

  const prev = useCallback(() => {
    setCurrentStep((prev) => Math.max(prev - 1, 0));
  }, []);

  const goTo = useCallback(
    (step) => {
      if (step >= 0 && step < totalSteps) {
        setCurrentStep(step);
      }
    },
    [totalSteps],
  );

  const createSession = useCallback(
    async (data) => {
      try {
        const session = await apiCreateSession(data);
        setSessionId(session.id || session.sessionId);
        return session;
      } catch (err) {
        showToast(err.message || 'Failed to create session', 'error');
        throw err;
      }
    },
    [apiCreateSession, showToast],
  );

  const saveContent = useCallback(
    async (body) => {
      if (!sessionId) {
        showToast('No active session to save', 'error');
        return;
      }
      try {
        return await apiSaveContent(sessionId, body);
      } catch (err) {
        showToast(err.message || 'Failed to save content', 'error');
        throw err;
      }
    },
    [sessionId, apiSaveContent, showToast],
  );

  return {
    currentStep,
    next,
    prev,
    goTo,
    sessionId,
    setSessionId,
    wizardData,
    setWizardData,
    createSession,
    saveContent,
  };
}
