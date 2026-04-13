## ADDED Requirements

### Requirement: TripRepository defines the domain contract for trip persistence

The `TripRepository` interface SHALL define five methods, each returning `ResultAsync<T, WanderlustError>`. The domain layer SHALL depend only on this interface — never on a concrete implementation.

```
getAll(): ResultAsync<Trip[], WanderlustError>
getById(id: string): ResultAsync<Trip, WanderlustError>
create(props: TripInputProps): ResultAsync<Trip, WanderlustError>
update(id: string, props: Partial<TripInputProps>): ResultAsync<Trip, WanderlustError>
delete(id: string): ResultAsync<void, WanderlustError>
```

#### Scenario: Interface is resolved from DI container

- **WHEN** a use case requests `TripRepository` from the Inversify container via `TripTypes.TripRepository`
- **THEN** the container returns the bound implementation without the use case knowing the concrete class

---

### Requirement: TripsGetAllUseCase returns all trips

`TripsGetAllUseCase` SHALL delegate to `TripRepository.getAll()` and return its result unchanged.

#### Scenario: Repository returns a list

- **WHEN** `TripsGetAllUseCase.execute()` is called and the repository has trips
- **THEN** the result is `Ok` containing the array of `Trip` instances

#### Scenario: Repository returns empty list

- **WHEN** `TripsGetAllUseCase.execute()` is called and the repository has no trips
- **THEN** the result is `Ok` containing an empty array

#### Scenario: Repository error is propagated

- **WHEN** `TripsGetAllUseCase.execute()` is called and the repository returns `Err`
- **THEN** the use case returns the same `Err` without modification

---

### Requirement: TripGetByIdUseCase returns a single trip by ID

`TripGetByIdUseCase` SHALL delegate to `TripRepository.getById(id)` and return its result unchanged.

#### Scenario: Existing trip is found

- **WHEN** `TripGetByIdUseCase.execute(id)` is called with a valid ID that exists
- **THEN** the result is `Ok` containing the matching `Trip`

#### Scenario: Non-existing trip returns Err

- **WHEN** `TripGetByIdUseCase.execute(id)` is called with an ID that does not exist
- **THEN** the result is `Err` (specific error type determined by the repository implementation)

---

### Requirement: TripCreateUseCase creates a new trip

`TripCreateUseCase` SHALL delegate to `TripRepository.create(props)` and return its result unchanged.

#### Scenario: Valid props create a trip

- **WHEN** `TripCreateUseCase.execute(props)` is called with valid input
- **THEN** the result is `Ok` containing the newly created `Trip`

#### Scenario: Repository error on creation is propagated

- **WHEN** `TripCreateUseCase.execute(props)` is called and the repository returns `Err`
- **THEN** the use case returns the same `Err`

---

### Requirement: TripUpdateUseCase updates an existing trip

`TripUpdateUseCase` SHALL delegate to `TripRepository.update(id, props)` with the provided partial props and return its result unchanged.

#### Scenario: Partial update returns updated trip

- **WHEN** `TripUpdateUseCase.execute(id, props)` is called with a valid ID and partial fields
- **THEN** the result is `Ok` containing the updated `Trip`

#### Scenario: Update on non-existing ID returns Err

- **WHEN** `TripUpdateUseCase.execute(id, props)` is called with an ID that does not exist
- **THEN** the result is `Err`

---

### Requirement: TripDeleteUseCase deletes a trip by ID

`TripDeleteUseCase` SHALL delegate to `TripRepository.delete(id)` and return its result unchanged.

#### Scenario: Existing trip is deleted

- **WHEN** `TripDeleteUseCase.execute(id)` is called with a valid ID that exists
- **THEN** the result is `Ok<void>`

#### Scenario: Deleting non-existing trip returns Err

- **WHEN** `TripDeleteUseCase.execute(id)` is called with an ID that does not exist
- **THEN** the result is `Err`

---

### Requirement: All use cases are injectable and resolve TripRepository from DI

Each use case class SHALL be decorated with `@injectable()`. Each SHALL declare `TripRepository` as a constructor dependency decorated with `@inject(TripTypes.TripRepository)`. Use cases SHALL be bound as transient in the DI container (new instance per resolution).

#### Scenario: Use case is resolved from DI container

- **WHEN** a ViewModel resolves a use case from the container
- **THEN** a new use case instance is returned with the repository already injected

#### Scenario: Multiple resolutions produce independent instances

- **WHEN** a use case is resolved twice from the container
- **THEN** two different instances are returned (transient scope)

---

### Requirement: TripTypes provides sealed Symbol identifiers for DI

`TripTypes` SHALL be a sealed object (`Object.seal`) with one `Symbol.for()` per injectable: `TripRepository`, `TripsGetAllUseCase`, `TripGetByIdUseCase`, `TripCreateUseCase`, `TripUpdateUseCase`, `TripDeleteUseCase`.

#### Scenario: Symbols are globally unique

- **WHEN** `TripTypes.TripRepository` is used as an injection token
- **THEN** it refers to the same symbol across all module imports

#### Scenario: TripTypes object is immutable

- **WHEN** code attempts to add a new property to `TripTypes`
- **THEN** the operation fails silently (non-strict) or throws `TypeError` (strict mode)
