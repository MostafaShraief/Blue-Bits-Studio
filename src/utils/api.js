const API_BASE = '/api/sessions';

const AUTH_API_BASE = '/api/auth';

/**
 * Helper to automatically attach JWT token to all API requests.
 * Preserves existing headers (like Content-Type) and correctly
 * handles FormData.
 * 
 * Returns the Response object so callers can check .ok and parse JSON.
 */
export async function authFetch(url, options = {}) {
    const token = localStorage.getItem('token');
    
    // Ensure options.headers exists
    const headers = new Headers(options.headers || {});
    
    if (token) {
        headers.set('Authorization', `Bearer ${token}`);
    }

    // Auto-set Content-Type for JSON requests (when body is a plain object)
    if (options.body && typeof options.body === 'string' && !headers.has('Content-Type')) {
        headers.set('Content-Type', 'application/json');
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

    return response;
}

/**
 * Fetch current user's profile with fresh authorized workflows.
 * Used to sync permissions on app initialization.
 * 
 * Returns: { userId, username, firstName, lastName, role, authorizedWorkflows[] }
 */
export async function fetchUserProfile() {
    const res = await authFetch(`${AUTH_API_BASE}/me`);
    if (!res.ok) {
        // If 401, authFetch already handles cleanup and redirect
        throw new Error('Failed to fetch user profile');
    }
    return await res.json();
}

/** Get all materials */
export async function fetchMaterials() {
    try {
        const res = await authFetch('/api/materials');
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
        const res = await authFetch('/api/prompts/compile', {
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

/** Get all sessions with pagination */
export async function fetchSessions(page = 1, limit = 20) {
    try {
        const res = await authFetch(`${API_BASE}?page=${page}&limit=${limit}`);
        if (!res.ok) throw new Error('Network response was not ok');
        return await res.json();
    } catch (e) {
        console.error('Failed to fetch sessions:', e);
        return { sessions: [], totalCount: 0, page: 1, limit: 20, hasMore: false };
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

        // Handle both 'id' and 'sessionId' from backend
        const sessionId = createdSession?.id || createdSession?.sessionId;
        if (!sessionId) {
             throw new Error('No session ID returned from creation');
        }
        
        createdSession.id = sessionId;

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
        const res = await authFetch(`/api/prompts/${sessionId}/${systemCode}`);
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
            templateName: data.templateName || '',
            materialName: data.materialName || '',
            lectureNumber: data.lectureNumber?.toString() || '',
            type: data.lectureType || ''
        };

        const res = await authFetch('/api/pandoc/generate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (!res.ok) {
            const errData = await res.json().catch(() => ({}));
            throw new Error(errData.error || errData.message || 'Failed to generate Pandoc docx');
        }
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

        const res = await authFetch('/api/merge/execute', {
            method: 'POST',
            body: formData
        });

        if (!res.ok) throw new Error('Failed to merge files');
        const json = await res.json();
        
        // Fetch the actual docx file using the returned URL
        const fileUrl = `${json.url}`;
        const fileRes = await authFetch(fileUrl);
        if (!fileRes.ok) throw new Error('Failed to download merged file');
        
        return await fileRes.blob();
    } catch (e) {
        console.error('API Error:', e);
        throw e;
    }
};

/** Get stats — counts by SystemCode (backend workflowType values) */
export async function fetchStats() {
    const data = await fetchSessions(1, 1000); // Fetch all sessions for stats (high limit)
    const sessions = data.sessions || [];
    return {
        total: sessions.length,
        // Extraction workflows
        LEC_EXT: sessions.filter((s) => s.workflowType === 'LEC_EXT').length,
        BANK_EXT: sessions.filter((s) => s.workflowType === 'BANK_EXT').length,
        // Quiz/Question bank
        BANK_QS: sessions.filter((s) => s.workflowType === 'BANK_QS').length,
        // Drawing
        DRAW: sessions.filter((s) => s.workflowType === 'DRAW').length,
        // Pandoc
        PANDOC: sessions.filter((s) => s.workflowType === 'PANDOC').length,
        // Coordination
        LEC_COORD: sessions.filter((s) => s.workflowType === 'LEC_COORD' || s.workflowType === 'BANK_COORD').length,
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

// ============================================
// Admin API Endpoints
// ============================================

const ADMIN_API_BASE = '/api/admin';

/** Get all users */
export async function fetchAdminUsers() {
    const res = await authFetch(`${ADMIN_API_BASE}/users`);
    if (!res.ok) throw new Error('Failed to fetch users');
    return await res.json();
}

/** Create a new user */
export async function createAdminUser(userData) {
    const res = await authFetch(`${ADMIN_API_BASE}/users`, {
        method: 'POST',
        body: JSON.stringify(userData)
    });
    if (!res.ok) throw new Error('Failed to create user');
    return await res.json();
}

/** Update a user */
export async function updateAdminUser(id, userData) {
    const res = await authFetch(`${ADMIN_API_BASE}/users/${id}`, {
        method: 'PUT',
        body: JSON.stringify(userData)
    });
    if (!res.ok) throw new Error('Failed to update user');
    return await res.json();
}

/** Delete a user */
export async function deleteAdminUser(id) {
    const res = await authFetch(`${ADMIN_API_BASE}/users/${id}`, {
        method: 'DELETE'
    });
    if (!res.ok) throw new Error('Failed to delete user');
}

/** Get all materials */
export async function fetchAdminMaterials() {
    const res = await authFetch(`${ADMIN_API_BASE}/materials`);
    if (!res.ok) throw new Error('Failed to fetch materials');
    return await res.json();
}

/** Create a new material */
export async function createAdminMaterial(materialData) {
    const res = await authFetch(`${ADMIN_API_BASE}/materials`, {
        method: 'POST',
        body: JSON.stringify(materialData)
    });
    if (!res.ok) throw new Error('Failed to create material');
    return await res.json();
}

/** Update a material */
export async function updateAdminMaterial(id, materialData) {
    const res = await authFetch(`${ADMIN_API_BASE}/materials/${id}`, {
        method: 'PUT',
        body: JSON.stringify(materialData)
    });
    if (!res.ok) throw new Error('Failed to update material');
    return await res.json();
}

/** Delete a material */
export async function deleteAdminMaterial(id) {
    const res = await authFetch(`${ADMIN_API_BASE}/materials/${id}`, {
        method: 'DELETE'
    });
    if (!res.ok) throw new Error('Failed to delete material');
}

/** Get all workflows */
export async function fetchAdminWorkflows() {
    const res = await authFetch(`${ADMIN_API_BASE}/workflows`);
    if (!res.ok) throw new Error('Failed to fetch workflows');
    return await res.json();
}

/** Toggle workflow active status */
export async function toggleAdminWorkflow(id, isActive) {
    const res = await authFetch(`${ADMIN_API_BASE}/workflows/${id}/toggle`, {
        method: 'PUT',
        body: JSON.stringify({ isActive })
    });
    if (!res.ok) throw new Error('Failed to toggle workflow');
    return await res.json();
}

/** Get all prompts */
export async function fetchAdminPrompts() {
    const res = await authFetch(`${ADMIN_API_BASE}/prompts`);
    if (!res.ok) throw new Error('Failed to fetch prompts');
    return await res.json();
}

/** Update a prompt */
export async function updateAdminPrompt(id, promptText) {
    const res = await authFetch(`${ADMIN_API_BASE}/prompts/${id}`, {
        method: 'PUT',
        body: JSON.stringify({ promptText })
    });
    if (!res.ok) throw new Error('Failed to update prompt');
    return await res.json();
}

/** Get all permissions */
export async function fetchAdminPermissions() {
    const res = await authFetch(`${ADMIN_API_BASE}/permissions`);
    if (!res.ok) throw new Error('Failed to fetch permissions');
    return await res.json();
}

/** Create a permission (role-workflow mapping) */
export async function createAdminPermission(permissionData) {
    const res = await authFetch(`${ADMIN_API_BASE}/permissions`, {
        method: 'POST',
        body: JSON.stringify(permissionData)
    });
    if (!res.ok) throw new Error('Failed to create permission');
    return await res.json();
}

/** Delete a permission */
export async function deleteAdminPermission(id) {
    const res = await authFetch(`${ADMIN_API_BASE}/permissions/${id}`, {
        method: 'DELETE'
    });
    if (!res.ok) throw new Error('Failed to delete permission');
}

    
