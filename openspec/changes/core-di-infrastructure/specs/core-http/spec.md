## ADDED Requirements

### Requirement: Http interface with ResultAsync

The `Http` interface SHALL provide methods `get`, `post`, `put`, `patch`, and `delete` that return `ResultAsync<HttpResponse<R>, HttpError<E>>`. No method SHALL throw exceptions.

#### Scenario: Successful GET request

- **WHEN** an Http instance makes a GET request and the server responds with status 200
- **THEN** the result is `Ok` containing an `HttpResponse` with the response data, status code, and status text

#### Scenario: Failed GET request (network error)

- **WHEN** an Http instance makes a GET request and the network is unreachable
- **THEN** the result is `Err` containing an `HttpRejectedRequestError`

#### Scenario: Failed GET request (server error)

- **WHEN** an Http instance makes a GET request and the server responds with status 404
- **THEN** the result is `Err` containing an `HttpNotFoundError`

---

### Requirement: HttpFactory creates configured Http instances

The `HttpFactory` interface SHALL provide a `create` method that accepts configuration options (baseUrl, headers, interceptors, credentials) and returns an `Http` instance.

#### Scenario: Create Http with custom baseUrl

- **WHEN** `HttpFactory.create({ baseUrl: "https://api.example.com" })` is called
- **THEN** all requests from the returned Http instance are prefixed with that baseUrl

#### Scenario: Create Http with response interceptor

- **WHEN** `HttpFactory.create({ onResponseRejected: callback })` is called
- **THEN** the callback is invoked on every failed response before the error is returned

---

### Requirement: AxiosHttp maps status codes to typed errors

The `AxiosHttp` implementation SHALL map HTTP response status codes to specific error classes:

| Status Code   | Error Class                     |
| ------------- | ------------------------------- |
| 401           | `HttpUnauthorizedError`         |
| 403           | `HttpForbiddenError`            |
| 404           | `HttpNotFoundError`             |
| 409           | `HttpConflictError`             |
| 422           | `HttpUnprocessableContentError` |
| 429           | `HttpTooManyRequestsError`      |
| Other 4xx/5xx | `HttpFailedRequestError`        |
| No response   | `HttpRejectedRequestError`      |

#### Scenario: 401 response maps to HttpUnauthorizedError

- **WHEN** a request receives a 401 response
- **THEN** the result is `Err` containing an `HttpUnauthorizedError` instance
- **AND** `error instanceof HttpUnauthorizedError` returns `true`

#### Scenario: Unknown 5xx maps to generic HttpFailedRequestError

- **WHEN** a request receives a 503 response
- **THEN** the result is `Err` containing an `HttpFailedRequestError` with status 503

#### Scenario: Network failure maps to HttpRejectedRequestError

- **WHEN** a request fails without receiving any response (timeout, DNS failure, etc.)
- **THEN** the result is `Err` containing an `HttpRejectedRequestError`

---

### Requirement: HTTP error hierarchy

All HTTP errors SHALL extend from `WanderlustError` (base error class). The hierarchy SHALL be:

- `WanderlustError` (base)
    - `HttpRejectedRequestError` (no response received)
    - `HttpFailedRequestError<T>` (response received with error status)
        - `HttpUnauthorizedError` (401)
        - `HttpForbiddenError` (403)
        - `HttpNotFoundError` (404)
        - `HttpConflictError` (409)
        - `HttpUnprocessableContentError` (422)
        - `HttpTooManyRequestsError` (429)

Each error SHALL set `Object.setPrototypeOf` in the constructor for correct `instanceof` behavior in transpiled code.

#### Scenario: Error prototype chain is correct

- **WHEN** an `HttpNotFoundError` is created
- **THEN** `error instanceof HttpNotFoundError` is `true`
- **AND** `error instanceof HttpFailedRequestError` is `true`
- **AND** `error instanceof WanderlustError` is `true`

#### Scenario: HttpFailedRequestError carries response data

- **WHEN** a server responds with 422 and a JSON body `{ "errors": ["field required"] }`
- **THEN** the `HttpUnprocessableContentError` instance contains the response data accessible via a typed property

---

### Requirement: WanderlustApiClient

`WanderlustApiClient` SHALL be an @injectable singleton that creates an Http instance configured with:

- `baseUrl` from `import.meta.env.VITE_API_BASE_URL`
- An `onResponseRejected` interceptor that emits `UnauthorizedEventBus` via EventBus when a 401 error is received

#### Scenario: API client uses environment baseUrl

- **WHEN** `WanderlustApiClient` is resolved from the DI container
- **THEN** its Http instance makes requests to the URL defined in `VITE_API_BASE_URL`

#### Scenario: 401 response triggers EventBus emission

- **WHEN** any API request receives a 401 response
- **THEN** the `WanderlustApiClient` interceptor emits an `UnauthorizedEventBus` event
- **AND** the original error is still returned as `Err` to the caller
