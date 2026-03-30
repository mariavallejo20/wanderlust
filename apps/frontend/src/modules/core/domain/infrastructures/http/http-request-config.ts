export interface HttpRequestConfig {
    headers?: Record<string, string>;
    params?: Record<string, unknown>;
    baseUrl?: string;
    responseType?: "json" | "blob" | "text" | "arraybuffer";
    withCredentials?: boolean;
    signal?: AbortSignal;
    paramsSerializer?: (params: Record<string, unknown>) => string;
}
