## Why

Wanderlust has no application code yet — only the monorepo scaffolding (proposal 01). Before implementing any feature (trip CRUD, dashboard, itineraries), we need the architectural foundation: dependency injection container, typed HTTP client with functional error handling, EventBus for cross-cutting communication, typed SessionStorage, and the BaseViewModel + useViewModel pattern that all features will use. This proposal is the foundation on which all domain/data/presentation layers are built.

## What Changes

- Create DI system with `DiModuleBuilder` (builder pattern to register Inversify modules with submodules: datasources, repositories, useCases, viewModels, stores)
- Create `Http` interface returning `ResultAsync<HttpResponse<R>, HttpError<E>>` (neverthrow) — no exceptions, fully typed
- Create `HttpFactory` to instantiate Http clients with custom configuration (baseUrl, interceptors, credentials)
- Create `AxiosHttp` implementation (@injectable) with automatic error mapping (status code → specific error class)
- Create typed HTTP error hierarchy: base `WanderlustError`, `HttpRejectedRequestError` (network), `HttpFailedRequestError<T>` (status), and specific errors (401, 403, 404, 409, 422, 429)
- Create `WanderlustApiClient` — singleton configuring Http with baseUrl from `VITE_API_BASE_URL` and 401 → EventBus interceptor
- Create `EventBusRepository` (interface) + implementation with RxJS Subject for decoupled communication
- Create `SessionStorage` — typed wrapper over `window.sessionStorage` with get/set, getObject/setObject, getInt/setInt methods
- Create `BaseViewModel` — abstract @injectable class with RxJS subscription management (addSub, didMount, willUnmount)
- Create hooks `useViewModel`, `useDidMount`, `useWillUnmount` to connect ViewModels to React lifecycle
- Create utility types: `Nullable<T>`, `Undefinable<T>`, `ObjectLike<T>`
- Create core DI registration with sealed Symbols and ContainerModule
- Integrate DI container in `main.tsx` with `reflect-metadata` import

## Capabilities

### New Capabilities

- `core-di`: Dependency injection system — DiModuleBuilder, Inversify container, modular binding registration with typed Symbols
- `core-http`: HTTP infrastructure — Http interface with ResultAsync, HttpFactory, AxiosHttp, typed HTTP error hierarchy, WanderlustApiClient
- `core-infrastructure`: Cross-cutting services — EventBus (RxJS Subject), typed SessionStorage, BaseViewModel with lifecycle, useViewModel/useDidMount/useWillUnmount hooks, utility types

### Modified Capabilities

(none — this is the first application code in the project)

## Impact

- **Code affected**: `src/di/`, `src/modules/core/` (domain, data, presentation) — all new
- **Dependencies activated**: `inversify`, `reflect-metadata`, `axios`, `neverthrow`, `rxjs`, `mobx` (already installed in proposal 01, now imported for the first time)
- **Entry point**: `main.tsx` modified to import `reflect-metadata` and initialize the DI container
- **GitHub issue**: #2
- **Branch**: `feature/02-core-di`
- **Phase**: 0 (Scaffolding and setup)
- **Priority**: Core
- **Unblocks**: Proposals 03 (i18n/routing), 05 (Trip domain), and all features using DI + Http + ViewModels
