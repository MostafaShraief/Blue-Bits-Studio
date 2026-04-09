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
            imageNotes: session.images ? session.images.map(img => ({ note: img.note || '' })) : []
        };

        const res = await fetch(API_BASE, {
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

        // Now upload images if any exist
        if (session.images && session.images.length > 0) {
            const formData = new FormData();
            
            session.images.forEach((img, index) => {
                if (img.file) {
                    formData.append('images', img.file, img.file.name || `image-${index}.png`);
                    formData.append('notes', img.note || '');
                }
            });

            const uploadRes = await fetch(`${API_BASE}/${createdSession.id}/images`, {
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

/** Upload images for a session */
export async function uploadImages(sessionId, files) {
    if (!files || files.length === 0) return [];
    
    try {
        const formData = new FormData();
        files.forEach(f => formData.append('images', f));

        const res = await fetch(`${API_BASE}/${sessionId}/images`, {
            method: 'POST',
            body: formData
        });

        if (!res.ok) throw new Error('Failed to upload images');
        return await res.json();
    } catch (e) {
        console.error('Failed to upload images:', e);
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

        const res = await fetch('http://localhost:5135/api/pandoc/generate', {
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
        formData.append('lectureType', metadata.type || 'theoretical');

        const res = await fetch('http://localhost:5135/api/merge/execute', {
            method: 'POST',
            body: formData
        });

        if (!res.ok) throw new Error('Failed to merge files');
        const json = await res.json();
        
        // Fetch the actual docx file using the returned URL
        const fileUrl = `http://localhost:5135${json.url}`;
        const fileRes = await fetch(fileUrl);
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
 * @param {Object} session - { id, materialName, quizData (JSON string), workflowType: 'quiz' }
 */
export async function saveQuizSession(session) {
    try {
        const payload = {
            materialName: session.materialName || 'بنك أسئلة بدون اسم',
            workflowType: session.workflowType || 'quiz',
            quizData: typeof session.quizData === 'string' 
                ? session.quizData 
                : JSON.stringify(session.quizData || [])
        };

        const url = session.id 
            ? `${API_BASE}/${session.id}` 
            : API_BASE;
        
        const method = session.id ? 'PUT' : 'POST';

        const res = await fetch(url, {
            method: method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (!res.ok) throw new Error('Failed to save quiz session');

        let resultSession;
        try {
            resultSession = await res.json();
        } catch (err) {
            const location = res.headers.get('Location');
            if (location) {
                const parts = location.split('/');
                resultSession = { id: parts[parts.length - 1] };
            }
        }

        if (!resultSession || !resultSession.id) {
            throw new Error('No session ID returned from save');
        }

        return resultSession;
    } catch (e) {
        console.error('API Error:', e);
        throw e;
    }
}
