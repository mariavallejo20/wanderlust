## Context

The trip domain layer is complete: `Trip` model, `TripRepository` interface, 5 use cases, and DI Symbols are in place. The DI container has no binding for `TripRepository`, so any attempt to resolve a use case at runtime would throw. This design covers implementing the full data layer that wires the domain to HTTP calls, and the integration test strategy that validates the entire stack without manual mocks.

## Goals / Non-Goals

**Goals:**

- Implement `TripDto` (Zod schema for raw API response validation)
- Implement `TripRemoteDatasource` (HTTP via `WanderlustApiClient`)
- Implement `TripMapper` (DTO → domain model, two-level Zod validation)
- Implement `TripImplRepository` (binds datasource + mapper to the `TripRepository` interface)
- Add MSW handlers for the 5 trip endpoints and register them globally
- Update DI module to bind datasource and repository
- Write unit tests for the mapper and integration tests for all 5 use cases

**Non-Goals:**

- Dashboard or any presentation layer code
- Offline caching, optimistic updates, or request deduplication
- Pagination or filtering on `getAll` (added in a future proposal if needed)
- Real backend — all HTTP calls are intercepted by MSW

## Decisions

### 1. Two-level Zod validation (DTO → Model)

The API response is parsed first against `TripDtoSchema` (raw shape, no branded type). If valid, the mapper calls `Trip.create()` which re-validates against the domain `TripSchema` (includes cross-field rules and branded type). This means a malformed API response is rejected at the datasource boundary before it ever reaches domain code.

The DTO schema is intentionally a subset of the domain schema — it only validates the fields the API returns, tolerating extra fields via `.passthrough()`. The domain schema enforces business rules (e.g. `endDate >= startDate`) that are not re-validated in the DTO.

### 2. Datasource returns DTOs; repository returns domain models

`TripRemoteDatasource` methods return `ResultAsync<TripDto | TripDto[], WanderlustError>`. The repository calls the datasource, then maps each DTO through `TripMapper.toDomain()`. Mapping errors (malformed DTO that passed DTO-level validation but fails domain validation) are wrapped as `FallbackError`.

This keeps the datasource free of domain knowledge and makes it trivially testable by replacing only the datasource in future if needed.

### 3. DI binding: `TripDatasource` Symbol added to `TripTypes`

`TripRemoteDatasource` is bound to `TripTypes.TripDatasource` as a transient. `TripImplRepository` injects it via `@inject(TripTypes.TripDatasource)`. This allows swapping datasources (e.g. a local-storage datasource) without touching the repository.

`TripImplRepository` is bound to `TripTypes.TripRepository`. Use cases already inject `TripTypes.TripRepository`, so they need no changes.

### 4. MSW handlers: absolute URLs matching `VITE_API_BASE_URL`

MSW v2 handlers use absolute URLs. In tests, `VITE_API_BASE_URL` resolves to the value defined in `.env.test` (`http://localhost:3000/api`). The handlers match `http://localhost:3000/api/trips` and `http://localhost:3000/api/trips/:id`. This is the most explicit and debuggable approach — no path-only wildcards that may match unintended requests.

A `createTripDtoFixture()` helper (in `trip.handlers.ts`) returns plain JSON fixtures for handler responses. It is NOT `createMockTrip()` — that returns domain objects; the fixture helper returns raw DTO-shaped objects.

### 5. Integration tests: real container + MSW, no `vi.fn()`

Integration tests (`*.usecase.integration.ts`) resolve use cases directly from the DI container:

```ts
container.snapshot();
afterEach(() => container.restore());

const useCase = container.get<TripsGetAllUseCase>(TripTypes.TripsGetAllUseCase);
```

MSW server (already started in `vitest-setup.ts`) intercepts HTTP calls. Per-test overrides use `server.use(...)` to inject specific handlers (e.g. 404 responses). This validates the DI wiring, mapper, error mapping, and HTTP layer in a single test with no artificial mocks.

The existing `*.usecase.test.ts` unit tests (with mock repositories) are **kept** — they test use case logic in isolation. Integration tests add a second layer of confidence over the full stack.

## Risks / Trade-offs

- **`VITE_API_BASE_URL` not set in test env** → Axios sends requests to `http://localhost/api/trips`; MSW handlers expecting `http://localhost:3000/api/trips` won't intercept, causing unhandled request warnings and test failures. Mitigation: add `.env.test` with `VITE_API_BASE_URL=http://localhost:3000/api` and document it in `.env.example`.
- **Mapper maps `Trip.create()` errors** → If the API returns a DTO that passes DTO schema but fails domain validation (e.g. `endDate < startDate` stored in DB), the mapper wraps it as `FallbackError`. This is intentional: it surfaces data integrity issues early. Mitigation: keep the DTO schema strict enough to catch obvious issues first.
- **Container snapshot/restore in integration tests** → `container.snapshot()` and `container.restore()` are Inversify's mechanism for test isolation. If a test modifies bindings and forgets to call `restore()`, subsequent tests may fail. Mitigation: always call `restore()` in `afterEach`, which is idempotent.

## Open Questions

(none — design is fully constrained by existing codebase patterns)
