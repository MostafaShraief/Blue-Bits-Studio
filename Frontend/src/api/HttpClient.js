import { formatValidationErrors } from '../utils/errorFormatter';
import { INTERNAL_ROUTES } from '../config/links';

class ApiError extends Error {
  constructor({ message, status, data, errors, traceId }) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
    this.errors = errors;
    this.traceId = traceId;
  }
}

class RateLimitError extends Error {
  constructor({ retryAfter, message }) {
    super(message);
    this.name = 'RateLimitError';
    this.status = 429;
    this.retryAfter = retryAfter;
  }
}

const API_BASE = '';

function getToken() {
  return localStorage.getItem('token');
}

function buildUrl(path) {
  if (path.startsWith('http')) return path;
  return `${API_BASE}${path}`;
}

function buildHeaders(customHeaders) {
  const headers = new Headers(customHeaders || {});
  const token = getToken();
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }
  return headers;
}

async function handleResponse(response) {
  if (response.ok) {
    const text = await response.text();
    if (!text) return null;
    return JSON.parse(text);
  }

  let body;
  try {
    body = await response.json();
  } catch {
    body = null;
  }

  const traceId = body?.traceId;

  if (response.status === 401) {
    localStorage.removeItem('token');
    localStorage.removeItem('bluebits_user');
    if (!window.location.pathname.includes('/login')) {
      window.location.href = INTERNAL_ROUTES.LOGIN;
    }
    throw new ApiError({
      message: body?.error || 'انتهت صلاحية الجلسة. الرجاء تسجيل الدخول مرة أخرى.',
      status: 401,
      data: body,
      traceId,
    });
  }

  if (response.status === 429) {
    const retryAfter = parseInt(response.headers.get('Retry-After'), 10) || 60;
    throw new RateLimitError({
      retryAfter,
      message: body?.error || `طلبات كثيرة جداً. الرجاء الانتظار ${retryAfter} ثانية.`,
    });
  }

  if (response.status === 400) {
    const errors = body?.errors ? formatValidationErrors(body.errors) : undefined;
    throw new ApiError({
      message: body?.error || body?.message || 'بيانات غير صالحة.',
      status: 400,
      data: body,
      errors,
      traceId,
    });
  }

  if (response.status === 404) {
    throw new ApiError({
      message: body?.error || body?.message || 'المورد المطلوب غير موجود.',
      status: 404,
      data: body,
      traceId,
    });
  }

  throw new ApiError({
    message: body?.error || body?.message || 'حدث خطأ في الخادم. الرجاء المحاولة لاحقاً.',
    status: response.status,
    data: body,
    traceId,
  });
}

async function baseRequest(method, path, options = {}) {
  const { body, headers: customHeaders, ...rest } = options;

  const headers = buildHeaders(customHeaders);

  if (body && typeof body === 'object' && !(body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  const response = await fetch(buildUrl(path), {
    method,
    headers,
    body: body instanceof FormData ? body : body ? JSON.stringify(body) : undefined,
    ...rest,
  });

  return handleResponse(response);
}

export async function httpGet(path, options) {
  return baseRequest('GET', path, options);
}

export async function httpPost(path, body, options) {
  return baseRequest('POST', path, { ...options, body });
}

export async function httpPut(path, body, options) {
  return baseRequest('PUT', path, { ...options, body });
}

export async function httpDelete(path, options) {
  return baseRequest('DELETE', path, options);
}

export { ApiError, RateLimitError };
