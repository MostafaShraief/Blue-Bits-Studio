import { httpGet, httpPost, httpPut, httpDelete } from './HttpClient';

const ADMIN_BASE = '/api/admin';

export const admin = {
  users: {
    fetch: () => httpGet(`${ADMIN_BASE}/users`),
    create: (data) => httpPost(`${ADMIN_BASE}/users`, data),
    update: (id, data) => httpPut(`${ADMIN_BASE}/users/${id}`, data),
    delete: (id) => httpDelete(`${ADMIN_BASE}/users/${id}`),
  },

  materials: {
    fetch: () => httpGet(`${ADMIN_BASE}/materials`),
    create: (data) => httpPost(`${ADMIN_BASE}/materials`, data),
    update: (id, data) => httpPut(`${ADMIN_BASE}/materials/${id}`, data),
    delete: (id) => httpDelete(`${ADMIN_BASE}/materials/${id}`),
  },

  permissions: {
    fetch: () => httpGet(`${ADMIN_BASE}/permissions`),
    create: (data) => httpPost(`${ADMIN_BASE}/permissions`, data),
    delete: (id) => httpDelete(`${ADMIN_BASE}/permissions/${id}`),
  },

  prompts: {
    fetch: () => httpGet(`${ADMIN_BASE}/prompts`),
    updateText: (id, promptText) => httpPut(`${ADMIN_BASE}/prompts/${id}`, { promptText }),
  },

  workflows: {
    fetch: () => httpGet(`${ADMIN_BASE}/workflows`),
    toggleActive: (id, isActive) => httpPut(`${ADMIN_BASE}/workflows/${id}/toggle`, { isActive }),
  },

  templates: {
    fetch: () => httpGet(`${ADMIN_BASE}/templates`),
    upload: (type, file) => {
      const formData = new FormData();
      formData.append('type', type);
      formData.append('file', file);
      return httpPut(`${ADMIN_BASE}/templates`, formData);
    },
  },
};

export default admin;
