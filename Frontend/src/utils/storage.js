/* ── localStorage Session Storage Utility ──────── */

const STORAGE_KEY = 'bluebits_sessions';

function readSessions() {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        return raw ? JSON.parse(raw) : [];
    } catch {
        return [];
    }
}

function writeSessions(sessions) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
}

/** Generate a simple unique id */
function uid() {
    return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

/**
 * Save a new session.
 * @param {object} session
 * @param {string} session.materialName
 * @param {string} session.lectureNumber
 * @param {'theoretical'|'practical'} session.lectureType
 * @param {'lecture'|'bank'|'draw'|'pandoc'|'coordination'} session.workflowType
 * @param {string} session.prompt  - the generated prompt text
 * @param {string} [session.generalNotes]
 * @param {{ note: string }[]} [session.imageNotes]
 * @returns {object} the saved session (with id + createdAt)
 */
export function saveSession(session) {
    const sessions = readSessions();
    const entry = {
        id: uid(),
        createdAt: new Date().toISOString(),
        ...session,
    };
    sessions.unshift(entry); // newest first
    writeSessions(sessions);
    return entry;
}

/** Get all sessions (newest first). */
export function getSessions() {
    return readSessions();
}

/** Get a single session by id. */
export function getSession(id) {
    return readSessions().find((s) => s.id === id) ?? null;
}

/** Delete a session by id. */
export function deleteSession(id) {
    const sessions = readSessions().filter((s) => s.id !== id);
    writeSessions(sessions);
}

/** Get sessions filtered by workflowType. */
export function getSessionsByType(workflowType) {
    return readSessions().filter((s) => s.workflowType === workflowType);
}

/** Get count by type for dashboard stats. */
export function getStats() {
    const sessions = readSessions();
    return {
        total: sessions.length,
        lecture: sessions.filter((s) => s.workflowType === 'lecture').length,
        bank: sessions.filter((s) => s.workflowType === 'bank').length,
        draw: sessions.filter((s) => s.workflowType === 'draw').length,
        pandoc: sessions.filter((s) => s.workflowType === 'pandoc').length,
        coordination: sessions.filter((s) => s.workflowType === 'coordination').length,
    };
}
