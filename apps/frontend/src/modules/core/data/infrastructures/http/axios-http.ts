import axios, {
    AxiosError,
    type AxiosInstance,
    type AxiosResponse,
} from "axios";
import { injectable } from "inversify";
import { ResultAsync } from "neverthrow";

import { WanderlustError } from "@core/domain/errors/wanderlust.error";
import { HttpConflictError } from "@core/domain/infrastructures/http/errors/http-conflict.error";
import {
    HttpFailedRequestError,
    HttpRejectedRequestError,
} from "@core/domain/infrastructures/http/errors/http-error";
import { HttpForbiddenError } from "@core/domain/infrastructures/http/errors/http-forbidden.error";
import { HttpNotFoundError } from "@core/domain/infrastructures/http/errors/http-not-found.error";
import { HttpTooManyRequestsError } from "@core/domain/infrastructures/http/errors/http-too-many-requests.error";
import { HttpUnauthorizedError } from "@core/domain/infrastructures/http/errors/http-unauthorized.error";
import { HttpUnprocessableContentError } from "@core/domain/infrastructures/http/errors/http-unprocessable-content.error";
import type {
    Http,
    HttpFactory,
    HttpFactoryConfig,
} from "@core/domain/infrastructures/http/http";
import type { HttpRequestConfig } from "@core/domain/infrastructures/http/http-request-config";
import type { HttpResponse } from "@core/domain/infrastructures/http/http-response";

import { toAxiosRequestConfig } from "./axios-http-config";

function mapAxiosError(
    error: AxiosError,
    onResponseRejected?: (error: WanderlustError) => void,
): WanderlustError {
    if (!error.response) {
        return new HttpRejectedRequestError(error.message);
    }

    const { status, statusText, data } = error.response;
    let mappedError: WanderlustError;

    switch (status) {
        case 401:
            mappedError = new HttpUnauthorizedError(data);
            break;
        case 403:
            mappedError = new HttpForbiddenError(data);
            break;
        case 404:
            mappedError = new HttpNotFoundError(data);
            break;
        case 409:
            mappedError = new HttpConflictError(data);
            break;
        case 422:
            mappedError = new HttpUnprocessableContentError(data);
            break;
        case 429:
            mappedError = new HttpTooManyRequestsError(data);
            break;
        default:
            mappedError = new HttpFailedRequestError(status, statusText, data);
            break;
    }

    onResponseRejected?.(mappedError);

    return mappedError;
}

function toHttpResponse<D>(response: AxiosResponse<D>): HttpResponse<D> {
    return {
        data: response.data,
        status: response.status,
        statusText: response.statusText,
    };
}

class AxiosHttpInstance implements Http {
    private readonly client: AxiosInstance;
    private readonly onResponseRejected?: (error: WanderlustError) => void;

    constructor(
        client: AxiosInstance,
        onResponseRejected?: (error: WanderlustError) => void,
    ) {
        this.client = client;
        this.onResponseRejected = onResponseRejected;
    }

    get<R>(
        url: string,
        config?: HttpRequestConfig,
    ): ResultAsync<HttpResponse<R>, WanderlustError> {
        return ResultAsync.fromPromise(
            this.client.get<R>(url, toAxiosRequestConfig(config)),
            (error) =>
                mapAxiosError(error as AxiosError, this.onResponseRejected),
        ).map(toHttpResponse);
    }

    post<R>(
        url: string,
        data?: unknown,
        config?: HttpRequestConfig,
    ): ResultAsync<HttpResponse<R>, WanderlustError> {
        return ResultAsync.fromPromise(
            this.client.post<R>(url, data, toAxiosRequestConfig(config)),
            (error) =>
                mapAxiosError(error as AxiosError, this.onResponseRejected),
        ).map(toHttpResponse);
    }

    put<R>(
        url: string,
        data?: unknown,
        config?: HttpRequestConfig,
    ): ResultAsync<HttpResponse<R>, WanderlustError> {
        return ResultAsync.fromPromise(
            this.client.put<R>(url, data, toAxiosRequestConfig(config)),
            (error) =>
                mapAxiosError(error as AxiosError, this.onResponseRejected),
        ).map(toHttpResponse);
    }

    patch<R>(
        url: string,
        data?: unknown,
        config?: HttpRequestConfig,
    ): ResultAsync<HttpResponse<R>, WanderlustError> {
        return ResultAsync.fromPromise(
            this.client.patch<R>(url, data, toAxiosRequestConfig(config)),
            (error) =>
                mapAxiosError(error as AxiosError, this.onResponseRejected),
        ).map(toHttpResponse);
    }

    delete<R>(
        url: string,
        config?: HttpRequestConfig,
    ): ResultAsync<HttpResponse<R>, WanderlustError> {
        return ResultAsync.fromPromise(
            this.client.delete<R>(url, toAxiosRequestConfig(config)),
            (error) =>
                mapAxiosError(error as AxiosError, this.onResponseRejected),
        ).map(toHttpResponse);
    }
}

@injectable()
export class AxiosHttp implements HttpFactory {
    create(config?: HttpFactoryConfig): Http {
        const client = axios.create({
            baseURL: config?.baseUrl,
            headers: config?.headers,
            withCredentials: config?.withCredentials,
        });

        return new AxiosHttpInstance(client, config?.onResponseRejected);
    }
}
