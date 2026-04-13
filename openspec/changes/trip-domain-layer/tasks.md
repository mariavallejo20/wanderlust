**Issue**: #5
**Branch**: `feature/05-trip-domain`

## 1. DI types

- [ ] 1.1 Create `src/modules/trip/trip-types.di.ts` — `TripTypes` sealed object with `Symbol.for()` for: `TripRepository`, `TripsGetAllUseCase`, `TripGetByIdUseCase`, `TripCreateUseCase`, `TripUpdateUseCase`, `TripDeleteUseCase`

## 2. Domain model

- [ ] 2.1 Create `src/modules/trip/domain/models/trip.model.ts` — `TripStatusSchema` (Zod enum: `DRAFT | UPCOMING | IN_PROGRESS | COMPLETED`), `TripSchema` (Zod object with all fields + cross-field refinement `endDate >= startDate` + `.brand<"Trip">()`), `TripInputProps` type (input to factory), `TripProps` type (`z.infer<typeof TripSchema>`)
- [ ] 2.2 Add `Trip` class to `trip.model.ts` — private constructor storing `TripProps`, static `create(props: TripInputProps): Result<Trip, ZodError>`, static `validate(props: TripInputProps): Result<TripProps, ZodError>`, read-only getters for all fields, computed getters: `durationInDays` (Luxon diff, min 1), `isActive`, `isPast`, `isDraft`

## 3. Domain repository interface

- [ ] 3.1 Create `src/modules/trip/domain/repositories/trip.repository.ts` — `TripRepository` interface with: `getAll(): ResultAsync<Trip[], WanderlustError>`, `getById(id: string): ResultAsync<Trip, WanderlustError>`, `create(props: TripInputProps): ResultAsync<Trip, WanderlustError>`, `update(id: string, props: Partial<TripInputProps>): ResultAsync<Trip, WanderlustError>`, `delete(id: string): ResultAsync<void, WanderlustError>`

## 4. Use cases

- [ ] 4.1 Create `src/modules/trip/domain/usecases/trips-get-all.usecase.ts` — `@injectable()` class, `@inject(TripTypes.TripRepository)` in constructor, `execute(): ResultAsync<Trip[], WanderlustError>` delegating to `repo.getAll()`
- [ ] 4.2 Create `src/modules/trip/domain/usecases/trip-get-by-id.usecase.ts` — `execute(id: string): ResultAsync<Trip, WanderlustError>` delegating to `repo.getById(id)`
- [ ] 4.3 Create `src/modules/trip/domain/usecases/trip-create.usecase.ts` — `execute(props: TripInputProps): ResultAsync<Trip, WanderlustError>` delegating to `repo.create(props)`
- [ ] 4.4 Create `src/modules/trip/domain/usecases/trip-update.usecase.ts` — `execute(id: string, props: Partial<TripInputProps>): ResultAsync<Trip, WanderlustError>` delegating to `repo.update(id, props)`
- [ ] 4.5 Create `src/modules/trip/domain/usecases/trip-delete.usecase.ts` — `execute(id: string): ResultAsync<void, WanderlustError>` delegating to `repo.delete(id)`

## 5. DI module (use cases only)

- [ ] 5.1 Create `src/modules/trip/trip-module.di.ts` — `DiModuleBuilder` registering all 5 use cases as transient bindings using `TripTypes` symbols (repository binding will be added in proposal 06 when the implementation exists)
- [ ] 5.2 Import and load `tripModule` in `src/di/inversify.config.ts` alongside the existing `coreModule`

## 6. Unit tests — Trip model

- [ ] 6.1 Create `src/modules/trip/domain/models/trip.model.test.ts` — test group "Trip.create()": valid props → `toBeOk`, missing title → `toBeErr`, invalid UUID → `toBeErr`, endDate < startDate → `toBeErr` on `endDate` path, endDate === startDate → `toBeOk`
- [ ] 6.2 Add test group "TripStatusSchema": valid enum values → accepted, unknown value → `toBeErr`
- [ ] 6.3 Add test group "Trip computed properties": `durationInDays` single day = 1, 7-day trip = 7; `isActive` true only for IN_PROGRESS; `isDraft` true only for DRAFT; `isPast` true only for COMPLETED
- [ ] 6.4 Add test group "Trip.validate()": valid props → `toBeOk` with parsed props; invalid props → `toBeErr`

## 7. Unit tests — Use cases

- [ ] 7.1 Create `src/modules/trip/domain/usecases/trips-get-all.usecase.test.ts` — mock `TripRepository` (vi.fn()), `execute()` with list → `toBeOk`, empty list → `toBeOk([])`, repo error → `toBeErr`
- [ ] 7.2 Create `src/modules/trip/domain/usecases/trip-get-by-id.usecase.test.ts` — found → `toBeOk`, not found → `toBeErr`
- [ ] 7.3 Create `src/modules/trip/domain/usecases/trip-create.usecase.test.ts` — success → `toBeOk`, repo error → `toBeErr`
- [ ] 7.4 Create `src/modules/trip/domain/usecases/trip-update.usecase.test.ts` — success → `toBeOk`, not found → `toBeErr`
- [ ] 7.5 Create `src/modules/trip/domain/usecases/trip-delete.usecase.test.ts` — success → `toBeOk(undefined)`, not found → `toBeErr`
