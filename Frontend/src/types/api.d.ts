export interface ErrorResponse {
    error: string;
    statusCode: number;
    traceId: string;
}

export interface PandocResult {
    success: boolean;
    fileUrl?: string | null;
    error?: string | null;
    details?: string | null;
}

export interface MergeResult {
    url?: string | null;
    finalFileName?: string | null;
    error?: string | null;
}

export type ValidationErrors = Record<string, string[]>;

export interface PaginatedResponse<T> {
    items: T[];
    totalCount: number;
    page: number;
    limit: number;
    hasMore: boolean;
}
