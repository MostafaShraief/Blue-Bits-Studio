const API_BASE = 'http://localhost:5135/api/sessions';

/**
 * Helper to automatically attach JWT token to all API requests.
 * Preserves existing headers (like Content-Type) and correctly
 * handles FormData.
 */
export async function authFetch(url, options = {}) {
    const token = localStorage.getItem('token');
    
    // Ensure options.headers exists
    const headers = new Headers(options.headers || {});
    
    if (token) {
        headers.set('Authorization', `Bearer ${token}`);
    }

    const response = await fetch(url, {
        ...options,
        headers
    });

    // Handle 401 Unauthorized — token expired or invalid
    if (response.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('bluebits_user');
        // Only redirect if not already on the login page
        if (!window.location.pathname.includes('/login')) {
            window.location.href = '/login';
        }
    }

    // If response is not OK, throw an error with message
    if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.message || `Request failed with status ${response.status}`);
    }

    // Return parsed JSON if content-type is json
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
        return await response.json();
    }

    return response;
}

/** Get all materials */
export async function fetchMaterials() {
    try {
        const res = await authFetch('http://localhost:5135/api/materials');
        if (!res.ok) throw new Error('Failed to fetch materials');
        return await res.json();
    } catch (e) {
        console.error('Failed to fetch materials:', e);
        return [];
    }
}

/** Compile prompt statelessly */
export async function compilePromptStateless(payload) {
    try {
        const res = await authFetch('http://localhost:5135/api/prompts/compile', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        if (!res.ok) throw new Error('Failed to compile prompt');
        return await res.json();
    } catch (e) {
        console.error('Failed to compile prompt:', e);
        return null;
    }
}

/** Get all sessions */
export async function fetchSessions() {
    try {
        const res = await authFetch(API_BASE);
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
        const res = await authFetch(`${API_BASE}/${id}`);
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
            materialName: session.materialName,
            workflowSystemCode: session.workflowSystemCode,
            lectureNumber: session.lectureNumber,
            lectureType: session.lectureType,
            quizData: session.quizData,
            generalNotes: session.generalNotes
        };

        const res = await authFetch(API_BASE, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (!res.ok) throw new Error('Failed to create session');
        
        let createdSession;
        try {
            createdSession = await res.json();
        } catch (err) {
            // Check Location header if json fails
            const location = res.headers.get('Location');
            if (location) {
                const parts = location.split('/');
                createdSession = { id: parts[parts.length - 1] };
            }
        }

        if (!createdSession || !createdSession.id) {
             throw new Error('No session ID returned from creation');
        }

        // Now upload files if any exist
        if (session.files && session.files.length > 0) {
            const formData = new FormData();
            
            session.files.forEach((img, index) => {
                if (img.file) {
                    formData.append('files', img.file, img.file.name || `file-${index}.png`);
                    formData.append('notes', img.note || '');
                }
            });

            const uploadRes = await authFetch(`${API_BASE}/${createdSession.id}/files`, {
                method: 'POST',
                body: formData
            });

            if (!uploadRes.ok) {
                console.error('Failed to upload images for session', createdSession.id);
            }
        }

        return createdSession;
    } catch (e) {
        console.error('API Error:', e);
        throw e;
    }
}

/** Upload files for a session */
export async function uploadFiles(sessionId, files) {
    if (!files || files.length === 0) return [];
    
    try {
        const formData = new FormData();
        files.forEach(f => formData.append('files', f));

        const res = await authFetch(`${API_BASE}/${sessionId}/files`, {
            method: 'POST',
            body: formData
        });

        if (!res.ok) throw new Error('Failed to upload files');
        return await res.json();
    } catch (e) {
        console.error('Failed to upload files:', e);
        throw e;
    }
}

/** Fetch prompt for a session */
export async function fetchPrompt(sessionId, systemCode) {
    try {
        const res = await authFetch(`http://localhost:5135/api/prompts/${sessionId}/${systemCode}`);
        if (!res.ok) throw new Error('Failed to fetch prompt');
        return await res.json();
    } catch (e) {
        console.error('Failed to fetch prompt:', e);
        return null;
    }
}

/** Delete a session by id */
export async function removeSession(id) {
    try {
        await authFetch(`${API_BASE}/${id}`, { method: 'DELETE' });
    } catch (e) {
        console.error('Failed to delete session:', e);
    }
}

/** Generate Pandoc Document */
export async function generatePandoc(data) {
    try {
        const payload = {
            markdownText: data.markdownText,
            templateName: data.templateName,
            materialName: data.materialName,
            lectureNumber: data.lectureNumber,
            type: data.lectureType
        };

        const res = await authFetch('http://localhost:5135/api/pandoc/generate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (!res.ok) throw new Error('Failed to generate Pandoc docx');
        return await res.json();
    } catch (e) {
        console.error('API Error:', e);
        throw e;
    }
}

/** Merge Docx Files */
export const mergeDocxFiles = async (files, metadata) => {
    try {
        const formData = new FormData();
        files.forEach(f => formData.append('files', f));
        formData.append('materialName', metadata.materialName || '');
        formData.append('lectureType', metadata.type || 'Theoretical');

        const res = await authFetch('http://localhost:5135/api/merge/execute', {
            method: 'POST',
            body: formData
        });

        if (!res.ok) throw new Error('Failed to merge files');
        const json = await res.json();
        
        // Fetch the actual docx file using the returned URL
        const fileUrl = `http://localhost:5135${json.url}`;
        const fileRes = await authFetch(fileUrl);
        if (!fileRes.ok) throw new Error('Failed to download merged file');
        
        return await fileRes.blob();
    } catch (e) {
        console.error('API Error:', e);
        throw e;
    }
};

/** Get stats */
export async function fetchStats() {
    const sessions = await fetchSessions();
    return {
        total: sessions.length,
        lecture: sessions.filter((s) => s.workflowType === 'lecture').length,
        bank: sessions.filter((s) => s.workflowType === 'bank').length,
        quiz: sessions.filter((s) => s.workflowType === 'quiz').length,
        draw: sessions.filter((s) => s.workflowType === 'draw').length,
        pandoc: sessions.filter((s) => s.workflowType === 'pandoc').length,
        coordination: sessions.filter((s) => s.workflowType === 'coordination').length,
    };
}

/**
 * Save or update a quiz session (question bank).
 * @param {Object} session - { materialName, lectureNumber, lectureType, quizData, workflowSystemCode }
 */
export async function saveQuizSession(session) {
    try {
        const payload = {
            materialName: session.materialName,
            workflowSystemCode: session.workflowSystemCode || 'BANK_QS',
            lectureNumber: session.lectureNumber,
            lectureType: session.lectureType,
            quizData: typeof session.quizData === 'string' ? session.quizData : JSON.stringify(session.quizData),
            generalNotes: session.generalNotes || ''
        };

        const res = await authFetch(API_BASE, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (!res.ok) throw new Error('Failed to save quiz session');
        
        let result;
        try {
            result = await res.json();
        } catch {
            const location = res.headers.get('Location');
            if (location) {
                const parts = location.split('/');
                result = { id: parts[parts.length - 1] };
            }
        }

        return result || {};
    } catch (e) {
        console.error('Failed to save quiz session:', e);
        throw e;
    }
}

    
