import { httpGet, httpPost } from './HttpClient';

export async function getSessions(page = 1, limit = 10) {
  return httpGet(`/api/sessions?page=${page}&limit=${limit}`);
}

export async function getSession(id) {
  return httpGet(`/api/sessions/${id}`);
}

export async function createSession(data) {
  return httpPost('/api/sessions', data);
}

export async function saveSessionContent(sessionId, body) {
  return httpPost('/api/sessions/save', { sessionId, ...body });
}

export async function uploadFiles(sessionId, files, notes = []) {
  const formData = new FormData();
  files.forEach((file) => formData.append('files', file));
  notes.forEach((note) => formData.append('notes', note));
  return httpPost(`/api/sessions/${sessionId}/files`, formData);
}
