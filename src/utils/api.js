const API_BASE = 'http://localhost:5135/api/sessions';

/** Get all sessions */
export async function fetchSessions() {
    try {
        const res = await fetch(API_BASE);
        if (!res.ok) throw new Error('Network response was not ok');
        return await res.json();
    } catch (e) {
        console.error('Failed to fetch sessions:', e);
        return [];
    }
}

/** Get a single session by id */
export async function fetchSession(id) {
    try {
        const res = await fetch(`${API_BASE}/${id}`);
        if (!res.ok) throw new Error('Session not found');
        return await res.json();
    } catch (e) {
        console.error('Failed to fetch session:', e);
        return null;
    }
}

/**
 * Save a new session.
 */
export async function createSession(session) {
    try {
        const payload = {
            materialName: session.materialName || '',
            lectureNumber: session.lectureNumber || '',
            type: session.lectureType || '',
            workflowType: session.workflowType || '',
            promptText: session.prompt || '',
            generalNotes: session.generalNotes || '',
            imageNotes: session.imageNotes || []
        };

        const res = await fetch(API_BASE, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (!res.ok) throw new Error('Failed to create session');
        return await res.json();
    } catch (e) {
        console.error('API Error:', e);
        throw e;
    }
}

/** Delete a session by id */
export async function removeSession(id) {
    try {
        await fetch(`${API_BASE}/${id}`, { method: 'DELETE' });
    } catch (e) {
        console.error('Failed to delete session:', e);
    }
}

/** Get stats */
export async function fetchStats() {
    const sessions = await fetchSessions();
    return {
        total: sessions.length,
        lecture: sessions.filter((s) => s.workflowType === 'lecture').length,
        bank: sessions.filter((s) => s.workflowType === 'bank').length,
        draw: sessions.filter((s) => s.workflowType === 'draw').length,
        pandoc: sessions.filter((s) => s.workflowType === 'pandoc').length,
        coordination: sessions.filter((s) => s.workflowType === 'coordination').length,
    };
}
