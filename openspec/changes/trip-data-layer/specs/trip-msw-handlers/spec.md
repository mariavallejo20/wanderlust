## ADDED Requirements

### Requirement: MSW handlers intercept all trip REST endpoints

The file `src/tests/msw/handlers/trip.handlers.ts` SHALL export a `tripHandlers` array containing one MSW v2 `http` handler per trip endpoint. Handlers SHALL use absolute URLs constructed from `VITE_API_BASE_URL` (resolved at module load time). The array SHALL include handlers for: `GET /trips`, `GET /trips/:id`, `POST /trips`, `PUT /trips/:id`, `DELETE /trips/:id`.

#### Scenario: GET /trips handler returns a list of trip fixtures

- **WHEN** a test makes a `GET` request to `/trips`
- **THEN** the handler responds with `200` and a JSON array of trip DTO fixtures

#### Scenario: GET /trips/:id handler returns a single trip fixture

- **WHEN** a test makes a `GET` request to `/trips/:id` with a known fixture ID
- **THEN** the handler responds with `200` and the matching trip DTO fixture

#### Scenario: POST /trips handler returns the created trip

- **WHEN** a test makes a `POST` request to `/trips` with a valid body
- **THEN** the handler responds with `201` and the request body echoed back with a generated `id`, `createdAt`, and `updatedAt`

#### Scenario: PUT /trips/:id handler returns the updated trip

- **WHEN** a test makes a `PUT` request to `/trips/:id` with partial fields
- **THEN** the handler responds with `200` and the merged trip DTO (fixture defaults overridden by request body)

#### Scenario: DELETE /trips/:id handler returns 204

- **WHEN** a test makes a `DELETE` request to `/trips/:id`
- **THEN** the handler responds with `204` and no body

---

### Requirement: TripHandlers are registered in the global MSW handler index

`src/tests/msw/handlers/index.ts` SHALL export a `handlers` array that includes `tripHandlers` spread into it. This ensures all trip handlers are active in both `server.ts` (integration tests) and `browser.ts` (dev mode).

#### Scenario: Handlers are active in the test server

- **WHEN** the Vitest setup starts the MSW server via `server.listen()`
- **THEN** all trip handlers in `tripHandlers` intercept matching requests

---

### Requirement: createTripDtoFixture produces raw DTO-shaped test data

`trip.handlers.ts` SHALL export a `createTripDtoFixture(overrides?)` helper that returns a plain object matching `TripDto` (all required fields populated, no class instances). This helper SHALL be used in handler responses and in mapper unit tests.

#### Scenario: Fixture has sensible defaults

- **WHEN** `createTripDtoFixture()` is called with no arguments
- **THEN** the returned object has all required DTO fields with valid values (valid UUID, ISO dates, etc.)

#### Scenario: Fixture fields can be overridden

- **WHEN** `createTripDtoFixture({ title: "Custom" })` is called
- **THEN** the returned object has `title` equal to `"Custom"` and all other fields from defaults
