## ADDED Requirements

### Requirement: Use case integration tests exercise the full DI-wired stack via MSW

Each use case SHALL have a corresponding `*.usecase.integration.ts` file co-located with the use case source. Integration tests SHALL resolve use cases from the real DI container (not construct them manually) and SHALL rely on MSW handlers for HTTP interception — no `vi.fn()` mocks are allowed in integration tests.

Each integration test file SHALL:

- Call `container.snapshot()` before each test and `container.restore()` in `afterEach`
- Resolve the use case via `container.get<T>(TripTypes.<UseCaseSymbol>)`
- Use `server.use(...)` for per-test handler overrides (e.g. to simulate 404 or 500)
- Assert error types using `expect.assert(error instanceof XError)` (not `instanceof` in `expect`)

#### Scenario: TripsGetAllUseCase resolves from container and returns trips via MSW

- **WHEN** `container.get(TripTypes.TripsGetAllUseCase).execute()` is called and MSW returns a trip array
- **THEN** the result is `Ok<Trip[]>` with the mapped domain instances

#### Scenario: TripGetByIdUseCase resolves from container and returns 404 as Err

- **WHEN** `container.get(TripTypes.TripGetByIdUseCase).execute(id)` is called and MSW responds with `404`
- **THEN** the result is `Err` and `expect.assert(error instanceof HttpNotFoundError)` passes

#### Scenario: TripCreateUseCase resolves from container and returns created Trip

- **WHEN** `container.get(TripTypes.TripCreateUseCase).execute(props)` is called and MSW returns `201` with a DTO
- **THEN** the result is `Ok<Trip>` with properties matching the MSW response

#### Scenario: TripUpdateUseCase resolves from container and returns updated Trip

- **WHEN** `container.get(TripTypes.TripUpdateUseCase).execute(id, partial)` is called and MSW returns `200` with the merged DTO
- **THEN** the result is `Ok<Trip>` with the updated field values

#### Scenario: TripDeleteUseCase resolves from container and returns Ok void

- **WHEN** `container.get(TripTypes.TripDeleteUseCase).execute(id)` is called and MSW returns `204`
- **THEN** the result is `Ok<void>`

#### Scenario: Container state is isolated between integration tests

- **WHEN** one integration test modifies container bindings
- **THEN** subsequent tests start with a clean snapshot restored by `afterEach`
