## Why

The infrastructure is in place (DI, HTTP, i18n, MSW, Vitest) but there is no feature code yet. The `trip` module is the central entity of Wanderlust — every other module (itinerary, activity, budget, map-view, dashboard) depends on it. Before implementing any UI or data layer, the domain must define what a `Trip` is, what operations are allowed on it, and how errors are represented. This proposal establishes the domain layer of the trip module as the foundation for proposals 06 (data layer) and 07 (dashboard UI).

## What Changes

- Create `TripStatusEnum` — Zod enum with values `DRAFT | UPCOMING | IN_PROGRESS | COMPLETED`
- Create `Trip` domain model — class with private constructor, Zod schema with cross-field validation (`endDate >= startDate`), branded type `Trip`, factory methods `create()` and `validate()` returning `Result<Trip, ZodError>`, read-only getters for all properties, computed properties: `durationInDays`, `isActive`, `isPast`, `isDraft`
- Create `TripRepository` interface — defines 5 async operations returning `ResultAsync<T, WanderlustError>`: `getAll()`, `getById(id)`, `create(props)`, `update(id, props)`, `delete(id)`
- Create 5 use cases: `TripsGetAllUseCase`, `TripGetByIdUseCase`, `TripCreateUseCase`, `TripUpdateUseCase`, `TripDeleteUseCase` — each `@injectable`, receives `TripRepository` via DI, returns `ResultAsync`
- Create `TripTypes` — sealed Symbol object for DI identifiers (`TripRepository`, and one per use case)
- Create `trip-module.di.ts` (use-case bindings only — repository binding added in proposal 06)
- Write unit tests for the `Trip` model (validation rules, factory methods, computed properties) and for all 5 use cases (with a mock repository)

## Capabilities

### New Capabilities

- `trip-model`: Trip domain entity — Zod schema with validation rules, TripStatusEnum, branded type, factory create/validate, computed properties (durationInDays, isActive, isPast, isDraft)
- `trip-use-cases`: CRUD use cases — TripRepository interface contract, 5 injectable use cases wired through DI, unit tests with mock repository

### Modified Capabilities

(none)

## Impact

- **New files**: `src/modules/trip/domain/models/trip.model.ts`, `src/modules/trip/domain/repositories/trip.repository.ts`, `src/modules/trip/domain/usecases/*.usecase.ts` (×5), `src/modules/trip/domain/errors/trip-not-found.error.ts`, `src/modules/trip/trip-types.di.ts`, `src/modules/trip/trip-module.di.ts`, `src/modules/trip/domain/models/trip.model.test.ts`, `src/modules/trip/domain/usecases/*.usecase.test.ts` (×5)
- **Dependencies activated**: `zod`, `neverthrow`, `inversify` (already installed, first use in a feature module)
- **Path alias activated**: `@trip/*` → `src/modules/trip/*` (already declared in `tsconfig.app.json`)
- **GitHub issue**: #5
- **Branch**: `feature/05-trip-domain`
- **Phase**: 1 (Trip CRUD + Dashboard)
- **Priority**: Core
- **Unblocks**: Proposal 06 (Trip data layer + MSW handlers)
