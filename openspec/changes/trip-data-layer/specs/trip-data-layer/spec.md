## ADDED Requirements

### Requirement: TripDto validates the raw API response shape

`TripDtoSchema` SHALL be a Zod schema that validates the JSON payload returned by the trips API. All fields SHALL match the names and types returned by the backend. Fields that are optional in the API response SHALL be marked `.optional()`. The schema SHALL use `.passthrough()` to tolerate extra fields without failing.

#### Scenario: Valid API response passes DTO validation

- **WHEN** the API returns a JSON object with all required trip fields
- **THEN** `TripDtoSchema.safeParse()` returns `success: true` and a typed `TripDto` object

#### Scenario: API response missing required field fails DTO validation

- **WHEN** the API returns a JSON object without a required field (e.g. `id`)
- **THEN** `TripDtoSchema.safeParse()` returns `success: false` with a `ZodError`

#### Scenario: API response with extra fields passes DTO validation

- **WHEN** the API returns a JSON object with additional unknown fields
- **THEN** `TripDtoSchema.safeParse()` returns `success: true` and the extra fields are preserved

---

### Requirement: TripRemoteDatasource performs HTTP operations for all CRUD operations

`TripRemoteDatasource` SHALL be decorated with `@injectable()` and SHALL inject `WanderlustApiClient` via `CoreTypes.WanderlustApiClient`. It SHALL expose five methods that delegate to `this.apiClient.http`, each returning `ResultAsync<TripDto | TripDto[], WanderlustError>`.

| Method              | HTTP verb | Path         | Returns                                   |
| ------------------- | --------- | ------------ | ----------------------------------------- |
| `getAll()`          | GET       | `/trips`     | `ResultAsync<TripDto[], WanderlustError>` |
| `getById(id)`       | GET       | `/trips/:id` | `ResultAsync<TripDto, WanderlustError>`   |
| `create(props)`     | POST      | `/trips`     | `ResultAsync<TripDto, WanderlustError>`   |
| `update(id, props)` | PUT       | `/trips/:id` | `ResultAsync<TripDto, WanderlustError>`   |
| `delete(id)`        | DELETE    | `/trips/:id` | `ResultAsync<void, WanderlustError>`      |

#### Scenario: Successful GET /trips returns array of TripDto

- **WHEN** `TripRemoteDatasource.getAll()` is called and the server returns `200` with a JSON array
- **THEN** the result is `Ok` containing an array of `TripDto` objects

#### Scenario: HTTP 404 on getById returns HttpNotFoundError

- **WHEN** `TripRemoteDatasource.getById(id)` is called with an ID that does not exist
- **THEN** the result is `Err` containing `HttpNotFoundError`

#### Scenario: Successful POST /trips returns created TripDto

- **WHEN** `TripRemoteDatasource.create(props)` is called and the server returns `201` with the created trip JSON
- **THEN** the result is `Ok` containing the `TripDto` from the response

#### Scenario: Successful DELETE /trips/:id returns void

- **WHEN** `TripRemoteDatasource.delete(id)` is called and the server returns `204`
- **THEN** the result is `Ok<void>`

---

### Requirement: TripMapper converts TripDto to Trip domain model

`TripMapper` SHALL expose a static method `toDomain(dto: TripDto): Result<Trip, WanderlustError>`. It SHALL call `Trip.create(dto)` and map a `ZodError` result to `FallbackError`. If `Trip.create()` returns `Ok`, the mapper returns the same `Ok<Trip>`.

#### Scenario: Valid DTO maps to Trip domain model

- **WHEN** `TripMapper.toDomain(dto)` is called with a DTO that satisfies the domain schema
- **THEN** the result is `Ok` containing a `Trip` instance with matching property values

#### Scenario: DTO that fails domain validation maps to FallbackError

- **WHEN** `TripMapper.toDomain(dto)` is called with a DTO where `endDate < startDate`
- **THEN** the result is `Err` containing `FallbackError`

---

### Requirement: TripImplRepository implements TripRepository using datasource and mapper

`TripImplRepository` SHALL be decorated with `@injectable()`, inject `TripRemoteDatasource` via `TripTypes.TripDatasource`, and implement all five methods of the `TripRepository` interface. Each method SHALL call the corresponding datasource method, then map the DTO result(s) through `TripMapper.toDomain()`.

#### Scenario: getAll maps all DTOs to domain models

- **WHEN** `TripImplRepository.getAll()` is called and the datasource returns an array of DTOs
- **THEN** each DTO is mapped to a `Trip` and the result is `Ok<Trip[]>`

#### Scenario: getById maps single DTO to domain model

- **WHEN** `TripImplRepository.getById(id)` is called and the datasource returns one DTO
- **THEN** the result is `Ok<Trip>` with the mapped domain instance

#### Scenario: Datasource error propagates through repository

- **WHEN** the datasource returns `Err`
- **THEN** `TripImplRepository` returns the same `Err` without wrapping

---

### Requirement: TripDatasource Symbol is registered in TripTypes

`TripTypes` SHALL include a `TripDatasource: Symbol.for("TripDatasource")` entry. `trip-module.di.ts` SHALL bind `TripTypes.TripDatasource` to `TripRemoteDatasource` (transient) and `TripTypes.TripRepository` to `TripImplRepository` (transient).

#### Scenario: Repository is resolved from DI container after registration

- **WHEN** `container.get(TripTypes.TripRepository)` is called after loading `tripModule`
- **THEN** an instance of `TripImplRepository` is returned with `TripRemoteDatasource` injected
