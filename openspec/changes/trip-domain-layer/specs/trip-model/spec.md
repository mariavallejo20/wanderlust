## ADDED Requirements

### Requirement: Trip model is created only via factory method

The `Trip` class SHALL have a private constructor. The only public way to create an instance is via the static factory method `Trip.create(props: TripInputProps): Result<Trip, ZodError>`. The factory SHALL validate the input with the Zod schema and return `Ok(instance)` on success or `Err(zodError)` on failure.

#### Scenario: Valid props produce an Ok result

- **WHEN** `Trip.create()` is called with all required fields valid
- **THEN** the result is `Ok` and the returned instance has the same field values as the input

#### Scenario: Missing required field produces an Err result

- **WHEN** `Trip.create()` is called with a missing required field (e.g., empty `title`)
- **THEN** the result is `Err` and the error is a `ZodError` identifying the failing field

#### Scenario: Invalid UUID produces an Err result

- **WHEN** `Trip.create()` is called with a non-UUID string as `id`
- **THEN** the result is `Err` with a `ZodError` on the `id` path

---

### Requirement: Trip schema enforces endDate >= startDate

The `Trip` Zod schema SHALL include a cross-field refinement that rejects any input where `endDate` is strictly before `startDate`.

#### Scenario: endDate equal to startDate is valid

- **WHEN** `Trip.create()` is called with `startDate === endDate`
- **THEN** the result is `Ok`

#### Scenario: endDate before startDate is invalid

- **WHEN** `Trip.create()` is called with `endDate < startDate`
- **THEN** the result is `Err` with a `ZodError` on the `endDate` path

---

### Requirement: Trip status is constrained to the TripStatusEnum

The `status` field SHALL only accept the values `DRAFT`, `UPCOMING`, `IN_PROGRESS`, or `COMPLETED` as defined in `TripStatusSchema`.

#### Scenario: Valid status value is accepted

- **WHEN** `Trip.create()` is called with `status: "UPCOMING"`
- **THEN** the result is `Ok`

#### Scenario: Unknown status value is rejected

- **WHEN** `Trip.create()` is called with `status: "ACTIVE"` (not in the enum)
- **THEN** the result is `Err` with a `ZodError` on the `status` path

---

### Requirement: Trip exposes computed properties

The `Trip` class SHALL expose the following read-only computed getters derived from its stored props:

- `durationInDays: number` — number of days from `startDate` to `endDate` inclusive (minimum 1)
- `isActive: boolean` — true when `status === "IN_PROGRESS"`
- `isPast: boolean` — true when `status === "COMPLETED"`
- `isDraft: boolean` — true when `status === "DRAFT"`

#### Scenario: durationInDays for a single-day trip

- **WHEN** a `Trip` has `startDate === endDate`
- **THEN** `durationInDays` returns `1`

#### Scenario: durationInDays for a multi-day trip

- **WHEN** a `Trip` has `startDate: "2026-04-01"` and `endDate: "2026-04-07"`
- **THEN** `durationInDays` returns `7`

#### Scenario: isActive reflects IN_PROGRESS status

- **WHEN** a `Trip` has `status: "IN_PROGRESS"`
- **THEN** `isActive` is `true` and `isPast` and `isDraft` are `false`

#### Scenario: isDraft reflects DRAFT status

- **WHEN** a `Trip` has `status: "DRAFT"`
- **THEN** `isDraft` is `true` and `isActive` and `isPast` are `false`

---

### Requirement: Trip exposes a validate static method

The `Trip` class SHALL expose a static `validate(props): Result<TripProps, ZodError>` method that validates input and returns the parsed props without constructing an instance. This is used by mappers and data layers that need to validate without creating a full domain object.

#### Scenario: validate returns parsed props on success

- **WHEN** `Trip.validate()` is called with valid input
- **THEN** the result is `Ok` containing the Zod-parsed props (with defaults applied)

#### Scenario: validate returns ZodError on failure

- **WHEN** `Trip.validate()` is called with invalid input
- **THEN** the result is `Err` containing a `ZodError`

---

### Requirement: Trip uses a branded type to prevent raw object substitution

The `TripProps` type SHALL be branded with `"Trip"` so that plain objects structurally matching `TripProps` cannot be assigned to `Trip`-typed variables without going through the factory.

#### Scenario: Branded type rejects plain object at compile time

- **WHEN** a function expects a parameter of type `Trip` (branded)
- **THEN** TypeScript SHALL reject a plain `TripProps` object passed directly without calling `Trip.create()`
