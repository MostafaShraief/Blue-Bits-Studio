import { httpPost, httpGet } from './HttpClient';

export async function login(username, password) {
  return httpPost('/api/auth/login', { username, password });
}

export async function getCurrentUser() {
  return httpGet('/api/auth/me');
}
