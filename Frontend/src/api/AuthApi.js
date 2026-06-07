import { httpGet, ApiError, RateLimitError } from './HttpClient';

export async function login(username, password) {
  const response = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  });

  if (!response.ok) {
    let body;
    try { body = await response.json(); } catch { body = null; }

    if (response.status === 401) {
      throw new ApiError({
        message: 'اسم المستخدم أو كلمة المرور غير صحيحة',
        status: 401,
        data: body,
        traceId: body?.traceId,
      });
    }

    if (response.status === 429) {
      const retryAfter = parseInt(response.headers.get('Retry-After'), 10) || 60;
      throw new RateLimitError({
        retryAfter,
        message: `طلبات كثيرة جداً. الرجاء الانتظار ${retryAfter} ثانية.`,
      });
    }

    throw new ApiError({
      message: body?.error || body?.message || 'حدث خطأ في الخادم. الرجاء المحاولة لاحقاً.',
      status: response.status,
      data: body,
      traceId: body?.traceId,
    });
  }

  const data = await response.json();
  return { ...data, token: response.headers.get('X-Auth-Token') || '' };
}

export async function getCurrentUser() {
  return httpGet('/api/auth/me');
}
