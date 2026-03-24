## Context

The Wanderlust repository has a fully configured monorepo (proposal 01) but zero application code. Every future feature module (trip, itinerary, activity, etc.) needs a shared infrastructure layer: dependency injection to wire components, an HTTP client to call APIs, error types for typed failure handling, and a ViewModel pattern to separate business logic from React components.

This design defines the exact architecture for `src/di/` and `src/modules/core/`, establishing the patterns that all subsequent modules will follow.

## Goals / Non-Goals

**Goals:**

- DI container initializes in `main.tsx` and is available throughout the app
- Any module can register its own bindings using `DiModuleBuilder` without touching the container directly
- HTTP calls return `ResultAsync<HttpResponse<R>, HttpError<E>>` — no try/catch anywhere
- Each HTTP status code (401, 403, 404, 409, 422, 429) maps to a specific error class for precise handling
- `WanderlustApiClient` provides a pre-configured Http instance for all API calls
- EventBus enables decoupled communication (e.g., 401 response triggers app-wide redirect)
- BaseViewModel manages RxJS subscriptions lifecycle automatically
- `useViewModel` hook resolves ViewModels from the DI container and connects them to React lifecycle
- TypeScript compiles with zero errors, ESLint passes clean

**Non-Goals:**

- Authentication logic (WON'T in v1 — simulated with mock user)
- i18n integration (proposal 03)
- Routing or layout components (proposal 03)
- MSW setup or test configuration (proposal 04)
- Any UI components or pages
- Backend API implementation (phase 6)

## Decisions

### D1 — DiModuleBuilder with submodule pattern

**Decision**: Use a builder class `DiModuleBuilder` that accepts submodules (datasources, infrastructure, repositories, mappers, useCases, viewModels, stores) and produces an Inversify `ContainerModule`.

**Alternatives considered**:

- Direct `Container.bind()` calls: Works but scatters bindings across files with no structure. Hard to see what a module provides.
- Nx-style module federation: Overkill for a single-app monorepo.

**Rationale**: Each feature module exports a single `ContainerModule` built by `DiModuleBuilder`. The main container loads all modules via `container.loadSync()`. This keeps DI registration co-located with each module while the container itself stays simple.

### D2 — Symbol-based DI identifiers with Object.seal

**Decision**: Each module defines its DI types as a sealed object of Symbols:

```typescript
export const CoreTypes = Object.seal({
    HttpFactory: Symbol.for("HttpFactory"),
    WanderlustApiClient: Symbol.for("WanderlustApiClient"),
    EventBusRepository: Symbol.for("EventBusRepository"),
    SessionStorage: Symbol.for("SessionStorage"),
});
```

**Alternatives considered**:

- String identifiers: No type safety, easy typos, no autocompletion.
- Class-based identifiers: Couples the identifier to the implementation.

**Rationale**: `Symbol.for()` ensures uniqueness while being debuggable (the string is visible in devtools). `Object.seal()` prevents accidental additions/modifications at runtime. TypeScript infers the exact symbol types for type-safe injection.

### D3 — Http interface with ResultAsync (neverthrow)

**Decision**: The `Http` interface returns `ResultAsync<HttpResponse<R>, HttpError<E>>` for all methods (get, post, put, patch, delete). No method throws exceptions.

**Alternatives considered**:

- try/catch with typed errors: Breaks the type chain — the caller doesn't know which errors to catch at compile time.
- Custom Promise wrappers: Reinventing neverthrow poorly.

**Rationale**: `ResultAsync` forces every caller to handle both success and failure paths. The error type `E` is visible in the type signature, making error handling explicit and exhaustive. This pattern eliminates an entire category of unhandled-rejection bugs.

### D4 — HTTP error class hierarchy

**Decision**: Two base classes:

- `HttpRejectedRequestError` — network errors (no response received)
- `HttpFailedRequestError<T>` — server responded with error status, optional data payload

Specific errors extend `HttpFailedRequestError`: `HttpUnauthorizedError` (401), `HttpForbiddenError` (403), `HttpNotFoundError` (404), `HttpConflictError` (409), `HttpUnprocessableContentError` (422), `HttpTooManyRequestsError` (429).

**Rationale**: `instanceof` checks enable precise error handling per status code. The generic `<T>` on `HttpFailedRequestError` allows typed error payloads (e.g., 422 validation errors include field details). Each error sets `Object.setPrototypeOf` for correct prototype chain in transpiled code.

### D5 — WanderlustApiClient as singleton with 401 interceptor

**Decision**: A single `WanderlustApiClient` class (@injectable, singleton) creates an Http instance configured with:

- `baseUrl` from `import.meta.env.VITE_API_BASE_URL`
- `onResponseRejected` interceptor that emits `UnauthorizedEventBus` on 401

**Alternatives considered**:

- Multiple API clients per domain: Unnecessary complexity when all endpoints share the same base URL and auth context.

**Rationale**: One API client, one base URL, one auth context. Feature modules inject `WanderlustApiClient` and use its Http instance. The 401 interceptor decouples auth-failure handling from individual API calls — the EventBus notifies subscribers (e.g., router guard in proposal 03) without the datasource knowing about navigation.

### D6 — EventBus with RxJS Subject

**Decision**: `EventBusRepository` interface with `emit(event)` and `bus` (Observable). Implementation uses `Subject<EventBus>`.

**Alternatives considered**:

- Custom event emitter: Loses RxJS operators (filter, debounce, takeUntil).
- React Context: Tight coupling to React, can't use in non-React code (services, interceptors).

**Rationale**: RxJS Subject is a natural fit — it's already a dependency (used in ViewModels), supports multiple subscribers, and works in any layer (domain, data, presentation). The EventBus model is an enum-like discriminated union for type-safe event matching.

### D7 — BaseViewModel with subscription management

**Decision**: Abstract class `BaseViewModel` (@injectable) with:

- `addSub(subscription)` — registers RxJS subscriptions
- `didMount()` — async lifecycle hook called after component mount
- `willUnmount()` — unsubscribes all and runs cleanup

The `useViewModel<T>(identifier)` hook resolves from the DI container, calls `didMount` on mount, `willUnmount` on unmount.

**Alternatives considered**:

- Hooks-only approach: Loses DI integration, testing requires React rendering.
- MobX stores without base class: No subscription lifecycle management, leaks.

**Rationale**: ViewModels are testable without React (just instantiate and call methods). The `useViewModel` hook is the only bridge to React — components become thin observers. `addSub` + `willUnmount` prevents RxJS subscription leaks automatically.

### D8 — SessionStorage wrapper with typed keys

**Decision**: `SessionStorage` class (@injectable, singleton) wrapping `window.sessionStorage` with typed methods and an enum of allowed keys.

**Rationale**: Direct `sessionStorage.getItem()` calls are stringly-typed and scattered. The wrapper centralizes all storage access behind a typed API, making it easy to test (mock the class, not the browser API) and audit (grep for the enum to find all storage usage).

## Risks / Trade-offs

**[R1] reflect-metadata must be imported before any Inversify decorator** → Mitigated by importing it as the very first line in `main.tsx`, before any other import. This is a hard requirement of Inversify's decorator-based DI.

**[R2] Inversify decorators require `experimentalDecorators` + `emitDecoratorMetadata`** → Already configured in `tsconfig.app.json` (proposal 01). If TypeScript ever removes these flags, Inversify would need to migrate to their decorator-free API.

**[R3] EventBus is a global communication channel — can become a "god bus"** → Mitigated by keeping the event type union small and well-documented. Only cross-cutting concerns (auth failures, global navigation) should use the EventBus. Feature-to-feature communication should use DI and use cases.

**[R4] AxiosHttp error mapping assumes specific status codes** → If the backend returns unexpected status codes, they fall through to the generic `HttpFailedRequestError`. This is acceptable — specific errors are added as needed.

## Open Questions

- None. All patterns are validated in the reference project and directly applicable to Wanderlust.
