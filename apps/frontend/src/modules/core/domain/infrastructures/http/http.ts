import type { ResultAsync } from "neverthrow";

import type { WanderlustError } from "../../errors/wanderlust.error";
import type { HttpRequestConfig } from "./http-request-config";
import type { HttpResponse } from "./http-response";

export interface Http {
    get<R, E = WanderlustError>(
        url: string,
        config?: HttpRequestConfig,
    ): ResultAsync<HttpResponse<R>, E>;
    post<R, E = WanderlustError>(
        url: string,
        data?: unknown,
        config?: HttpRequestConfig,
    ): ResultAsync<HttpResponse<R>, E>;
    put<R, E = WanderlustError>(
        url: string,
        data?: unknown,
        config?: HttpRequestConfig,
    ): ResultAsync<HttpResponse<R>, E>;
    patch<R, E = WanderlustError>(
        url: string,
        data?: unknown,
        config?: HttpRequestConfig,
    ): ResultAsync<HttpResponse<R>, E>;
    delete<R, E = WanderlustError>(
        url: string,
        config?: HttpRequestConfig,
    ): ResultAsync<HttpResponse<R>, E>;
}

export interface HttpFactory {
    create(config?: HttpFactoryConfig): Http;
}

export interface HttpFactoryConfig extends HttpRequestConfig {
    onResponseRejected?: (error: WanderlustError) => void;
}
