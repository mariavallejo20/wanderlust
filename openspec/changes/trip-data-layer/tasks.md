## 1. Environment

- [ ] 1.1 Create `apps/frontend/.env.test` with `VITE_API_BASE_URL=http://localhost:3000/api` so MSW handlers use a deterministic base URL in integration tests
- [ ] 1.2 Update `apps/frontend/.env.example` to document `VITE_API_BASE_URL` with a comment explaining it must match MSW handler base URLs in `.env.test`

## 2. DTO

- [ ] 2.1 Create `src/modules/trip/data/dto/trip.dto.ts` — export `TripDtoSchema` (Zod schema with `.passthrough()`, all fields matching API response shape) and `TripDto` type (`z.infer<typeof TripDtoSchema>`)

## 3. Datasource

- [ ] 3.1 Create `src/modules/trip/data/datasources/trip-remote.datasource.ts` — `@injectable()` class `TripRemoteDatasource` that injects `WanderlustApiClient` via `@inject(CoreTypes.WanderlustApiClient)` and implements `getAll()`, `getById(id)`, `create(props)`, `update(id, props)`, `delete(id)` using `this.apiClient.http`; each method returns `ResultAsync` and maps the response data via `.map(r => r.data)`

## 4. Mapper

- [ ] 4.1 Create `src/modules/trip/data/mappers/trip.mapper.ts` — export class `TripMapper` with static method `toDomain(dto: TripDto): Result<Trip, WanderlustError>`; calls `Trip.create(dto)` and maps `ZodError` to `new FallbackError(error.message)`
- [ ] 4.2 Create `src/modules/trip/data/mappers/trip.mapper.test.ts` — unit tests: valid DTO produces `Ok<Trip>`, DTO with `endDate < startDate` produces `Err<FallbackError>`, mapper preserves all field values

## 5. Repository Implementation

- [ ] 5.1 Create `src/modules/trip/data/repositories/trip.impl-repository.ts` — `@injectable()` class `TripImplRepository` implementing `TripRepository`; injects `TripRemoteDatasource` via `@inject(TripTypes.TripDatasource)`; `getAll()` maps each DTO via `TripMapper.toDomain()` collecting failures as `FallbackError`; `getById()`, `create()`, `update()` chain `.andThen(dto => TripMapper.toDomain(dto))`; `delete()` passes through

## 6. DI Module

- [ ] 6.1 Update `src/modules/trip/trip-types.di.ts` — add `TripDatasource: Symbol.for("TripDatasource")` to the sealed `TripTypes` object
- [ ] 6.2 Update `src/modules/trip/trip-module.di.ts` — add a `datasources` submodule that binds `TripTypes.TripDatasource` to `TripRemoteDatasource`; add a `repositories` submodule that binds `TripTypes.TripRepository` to `TripImplRepository`

## 7. MSW Handlers

- [ ] 7.1 Create `src/tests/msw/handlers/trip.handlers.ts` — export `createTripDtoFixture(overrides?: Partial<TripDto>): TripDto` helper with sensible defaults (valid UUID, ISO dates, `DRAFT` status, `EUR` currency); export `tripHandlers` array with 5 MSW `http` handlers using `import.meta.env.VITE_API_BASE_URL` as base URL; `POST` handler echoes request body with generated `id`/`createdAt`/`updatedAt`; `PUT` handler merges request body over fixture defaults; `DELETE` handler returns `204`
- [ ] 7.2 Update `src/tests/msw/handlers/index.ts` — spread `tripHandlers` into the exported `handlers` array

## 8. Integration Tests

- [ ] 8.1 Create `src/modules/trip/domain/usecases/trips-get-all.usecase.integration.ts` — import `container` from `@di/inversify.config`; `beforeEach` calls `container.snapshot()`, `afterEach` calls `container.restore()`; test: MSW returns array → `Ok<Trip[]>`; test: MSW overridden to return `500` → `Err`
- [ ] 8.2 Create `src/modules/trip/domain/usecases/trip-get-by-id.usecase.integration.ts` — same container pattern; test: known ID → `Ok<Trip>`; test: MSW overridden to return `404` → `Err` with `expect.assert(error instanceof HttpNotFoundError)`
- [ ] 8.3 Create `src/modules/trip/domain/usecases/trip-create.usecase.integration.ts` — same container pattern; test: valid props → `Ok<Trip>` with correct fields; test: MSW overridden to return `422` → `Err`
- [ ] 8.4 Create `src/modules/trip/domain/usecases/trip-update.usecase.integration.ts` — same container pattern; test: partial props → `Ok<Trip>` with updated field; test: MSW overridden to return `404` → `Err`
- [ ] 8.5 Create `src/modules/trip/domain/usecases/trip-delete.usecase.integration.ts` — same container pattern; test: existing ID → `Ok<void>`; test: MSW overridden to return `404` → `Err`
