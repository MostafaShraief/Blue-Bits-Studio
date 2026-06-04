/**
 * Format rate-limit error with remaining time.
 * @param {number} retryAfter - seconds to wait
 * @returns {string} Arabic error message
 */
export function formatRateLimitError(retryAfter) {
    const seconds = Math.ceil(Number(retryAfter) || 60);
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;

    if (minutes > 0) {
        return `طلبات كثيرة جداً. الرجاء الانتظار ${minutes} دقيقة و ${secs} ثانية قبل المحاولة مرة أخرى.`;
    }
    return `طلبات كثيرة جداً. الرجاء الانتظار ${secs} ثوانٍ قبل المحاولة مرة أخرى.`;
}

/**
 * Convert raw validation errors (Record<string, string[]>) to a flat
 * { field: firstMessage } map for direct UI display.
 * @param {Record<string, string[]>} raw
 * @returns {Record<string, string>}
 */
export function formatValidationErrors(raw) {
    if (!raw || typeof raw !== 'object') return {};
    const result = {};
    for (const [key, messages] of Object.entries(raw)) {
        if (Array.isArray(messages) && messages.length > 0) {
            result[key.charAt(0).toLowerCase() + key.slice(1)] = messages[0];
        }
    }
    return result;
}

/**
 * Format a generic API error into an Arabic fallback message.
 * @param {Error|{message?: string, status?: number, error?: string}} apiError
 * @returns {string} Arabic error message
 */
export function formatGeneralError(apiError) {
    if (!apiError) return 'حدث خطأ غير متوقع. الرجاء المحاولة مرة أخرى.';

    const message = apiError.message || apiError.error || '';

    if (apiError.status === 404 || message.includes('404') || message.includes('Not Found')) {
        return 'المورد المطلوب غير موجود.';
    }
    if (apiError.status === 403 || message.includes('403') || message.includes('Forbidden')) {
        return 'ليس لديك صلاحية للوصول إلى هذا المورد.';
    }
    if (apiError.status === 409 || message.includes('409') || message.includes('Conflict')) {
        return 'تعارض في البيانات. قد يكون الإدخال مكرراً.';
    }
    if (apiError.status === 500 || message.includes('500') || message.includes('Server Error')) {
        return 'خطأ في الخادم. الرجاء المحاولة لاحقاً.';
    }
    if (apiError.status === 503 || message.includes('503') || message.includes('Service Unavailable')) {
        return 'الخدمة غير متوفرة حالياً. الرجاء المحاولة لاحقاً.';
    }

    if (message) return message;

    return 'حدث خطأ غير متوقع. الرجاء المحاولة مرة أخرى.';
}
