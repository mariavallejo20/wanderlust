## Why

The trip domain layer (proposal 05) defines what a `Trip` is and the repository interface contract, but there is no real implementation yet — the DI container has no repository binding and requests would fail at runtime. This proposal closes that gap by implementing the full data layer for the `trip` module: DTO validation, HTTP datasource, domain mapper, repository implementation, and MSW handlers. It also upgrades the existing use case unit tests to integration tests that exercise the full stack (DI container → use case → repository → datasource → MSW).

## What Changes

- Create `TripDto` — Zod schema mirroring the API response shape; validates raw HTTP payloads before mapping
- Create `TripRemoteDatasource` — `@injectable` class that uses `WanderlustApiClient` to call the REST API; exposes all 5 CRUD operations returning `ResultAsync`
- Create `TripMapper` — pure static class that converts `TripDto` → `Trip` domain model via `Trip.create()`
- Create `TripImplRepository` — `@injectable` class implementing `TripRepository`; delegates to `TripRemoteDatasource` and maps results through `TripMapper`
- Add `TripDatasource` Symbol to `trip-types.di.ts`
- Update `trip-module.di.ts` — register `TripRemoteDatasource` and `TripImplRepository` alongside existing use case bindings
- Create MSW handlers for all 5 trip endpoints (`GET /trips`, `GET /trips/:id`, `POST /trips`, `PUT /trips/:id`, `DELETE /trips/:id`) and register them in `handlers/index.ts`
- Create unit tests for `TripMapper`
- Create integration tests for all 5 use cases using a real DI container and MSW (no `vi.fn()` mocks); replace the existing `*.usecase.test.ts` mock-based pattern with `*.usecase.integration.ts` that resolve use cases from the container

## Capabilities

### New Capabilities

- `trip-data-layer`: DTO schema, datasource, mapper, and repository implementation for the trip module — wires the domain repository interface to actual HTTP calls and validates raw API responses
- `trip-msw-handlers`: MSW request handlers for all trip endpoints — shared between integration tests and browser dev mode

### Modified Capabilities

- `trip-use-cases`: Adding integration tests that exercise the full DI-wired stack via MSW (no mock repo); the use case logic is unchanged but the test approach gains a new layer

## Impact

- **New files**:
    - `src/modules/trip/data/dto/trip.dto.ts`
    - `src/modules/trip/data/datasources/trip-remote.datasource.ts`
    - `src/modules/trip/data/mappers/trip.mapper.ts`
    - `src/modules/trip/data/mappers/trip.mapper.test.ts`
    - `src/modules/trip/data/repositories/trip.impl-repository.ts`
    - `src/tests/msw/handlers/trip.handlers.ts`
    - `src/modules/trip/domain/usecases/*.usecase.integration.ts` (×5)
- **Modified files**:
    - `src/modules/trip/trip-types.di.ts` — add `TripDatasource` Symbol
    - `src/modules/trip/trip-module.di.ts` — register datasource and repository
    - `src/tests/msw/handlers/index.ts` — add trip handlers
- **Dependencies activated**: `msw` (already installed, first handler for a feature module)
- **GitHub issue**: #6
- **Branch**: `feature/06-trip-data`
- **Phase**: 1 (Trip CRUD + Dashboard)
- **Priority**: Core
- **Unblocks**: Proposal 07 (Dashboard presentation layer)
