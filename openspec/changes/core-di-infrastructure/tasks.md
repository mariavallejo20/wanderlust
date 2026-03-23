**Issue**: #2
**Branch**: `feature/02-core-di`

## 1. DI Builder system

- [ ] 1.1 Create `src/di/builder/di-type.ts` — type alias `DiType = Record<string, symbol>`
- [ ] 1.2 Create `src/di/builder/di-types.ts` — interface `DiTypes` with optional fields: datasources, infrastructure, repositories, mappers, useCases, viewModels, stores (each `DiType`)
- [ ] 1.3 Create `src/di/builder/di-submodule.ts` — interface `DiSubmodule` with register method receiving bind function
- [ ] 1.4 Create `src/di/builder/di-module-builder.ts` — class `DiModuleBuilder` with `registerSubModules(factory)` and `registerModule(): ContainerModule`
- [ ] 1.5 Create `src/di/inversify.config.ts` — create Container, import and loadSync core module, export container

## 2. Core domain errors

- [ ] 2.1 Create `src/modules/core/domain/errors/wanderlust.error.ts` — base error class with `Object.setPrototypeOf` for correct prototype chain
- [ ] 2.2 Create `src/modules/core/domain/errors/fallback.error.ts` — generic error extending WanderlustError with message string

## 3. Core domain HTTP types

- [ ] 3.1 Create `src/modules/core/domain/infrastructures/http/http-request-config.ts` — interface HttpRequestConfig (headers, params, baseUrl, responseType, withCredentials, signal, paramsSerializer)
- [ ] 3.2 Create `src/modules/core/domain/infrastructures/http/http-response.ts` — interface HttpResponse<D> with data, status, statusText
- [ ] 3.3 Create `src/modules/core/domain/infrastructures/http/http.ts` — interface Http (get, post, put, patch, delete returning ResultAsync) and interface HttpFactory with create method
- [ ] 3.4 Create `src/modules/core/domain/infrastructures/http/errors/http-error.ts` — HttpRejectedRequestError and HttpFailedRequestError<T> extending WanderlustError
- [ ] 3.5 Create `src/modules/core/domain/infrastructures/http/errors/http-unauthorized.error.ts` — 401 error
- [ ] 3.6 Create `src/modules/core/domain/infrastructures/http/errors/http-forbidden.error.ts` — 403 error
- [ ] 3.7 Create `src/modules/core/domain/infrastructures/http/errors/http-not-found.error.ts` — 404 error
- [ ] 3.8 Create `src/modules/core/domain/infrastructures/http/errors/http-conflict.error.ts` — 409 error
- [ ] 3.9 Create `src/modules/core/domain/infrastructures/http/errors/http-unprocessable-content.error.ts` — 422 error
- [ ] 3.10 Create `src/modules/core/domain/infrastructures/http/errors/http-too-many-requests.error.ts` — 429 error

## 4. Core domain models, repositories, and types

- [ ] 4.1 Create `src/modules/core/domain/models/event-bus.model.ts` — base EventBus class and UnauthorizedEventBus extending it
- [ ] 4.2 Create `src/modules/core/domain/repositories/event-bus.repository.ts` — interface EventBusRepository with emit(event) and bus: Observable<EventBus>
- [ ] 4.3 Create `src/modules/core/domain/types/utility.types.ts` — Nullable<T>, Undefinable<T>, ObjectLike<T>

## 5. Core data layer

- [ ] 5.1 Create `src/modules/core/data/infrastructures/http/axios-http-config.ts` — function to convert HttpRequestConfig to AxiosRequestConfig
- [ ] 5.2 Create `src/modules/core/data/infrastructures/http/axios-http.ts` — @injectable AxiosHttp implementing Http and HttpFactory, with error mapping (status code → specific error class), AbortController support, response interceptor support
- [ ] 5.3 Create `src/modules/core/data/infrastructures/api/wanderlust-api-client.ts` — @injectable singleton, injects HttpFactory + EventBusRepository, creates Http with VITE_API_BASE_URL and 401 interceptor
- [ ] 5.4 Create `src/modules/core/data/infrastructures/session-storage/session-storage.ts` — @injectable singleton with typed methods (get/set, getObject/setObject, getInt/setInt, remove, clear) and SessionStorageKeys enum
- [ ] 5.5 Create `src/modules/core/data/repositories/event-bus.impl-repository.ts` — @injectable singleton implementing EventBusRepository with RxJS Subject<EventBus>

## 6. Core presentation

- [ ] 6.1 Create `src/modules/core/presentation/view-model/base/base.viewmodel.ts` — abstract @injectable class with addSub(Subscription), async didMount(), willUnmount() with Subscription cleanup
- [ ] 6.2 Create `src/modules/core/presentation/hook/use-did-mount.hook.ts` — hook that runs callback once on mount
- [ ] 6.3 Create `src/modules/core/presentation/hook/use-will-unmount.hook.ts` — hook that runs callback on unmount
- [ ] 6.4 Create `src/modules/core/presentation/hook/use-view-model/use-view-model.hook.ts` — generic hook useViewModel<T extends BaseViewModel>(identifier: symbol) that resolves from container, calls didMount/willUnmount

## 7. Core DI registration

- [ ] 7.1 Create `src/modules/core/core-types.di.ts` — CoreTypes object with Symbols for HttpFactory, WanderlustApiClient, EventBusRepository, SessionStorage (sealed with Object.seal)
- [ ] 7.2 Create `src/modules/core/core-module.di.ts` — build ContainerModule using DiModuleBuilder, register all core bindings (infrastructure as singletons, repositories as singletons)

## 8. Integration

- [ ] 8.1 Add `import "reflect-metadata"` as first import in `src/main.tsx`
- [ ] 8.2 Import and initialize the DI container from `@di/inversify.config` in `main.tsx`
- [ ] 8.3 Verify `pnpm build:typecheck` passes with zero errors
- [ ] 8.4 Verify `pnpm lint:eslint` passes with zero errors
- [ ] 8.5 Verify `pnpm web:build` produces dist/ without errors
