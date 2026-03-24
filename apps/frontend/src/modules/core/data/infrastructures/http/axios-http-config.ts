import type { AxiosRequestConfig } from "axios";

import type { HttpRequestConfig } from "@core/domain/infrastructures/http/http-request-config";

export function toAxiosRequestConfig(
    config?: HttpRequestConfig,
): AxiosRequestConfig {
    if (!config) {
        return {};
    }

    return {
        headers: config.headers,
        params: config.params,
        baseURL: config.baseUrl,
        responseType: config.responseType,
        withCredentials: config.withCredentials,
        signal: config.signal,
        paramsSerializer: config.paramsSerializer
            ? { serialize: config.paramsSerializer }
            : undefined,
    };
}
