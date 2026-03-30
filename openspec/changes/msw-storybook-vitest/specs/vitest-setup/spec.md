## ADDED Requirements

### Requirement: Vitest workspace with three named projects

The project SHALL configure Vitest at `apps/frontend/vitest.config.ts` using `defineWorkspace` with three named projects: `unit`, `integration`, and `browser`. Each project SHALL extend `vite.config.base.ts` to inherit path aliases and plugins.

#### Scenario: Running all projects

- **WHEN** a developer runs `pnpm test` in `apps/frontend/`
- **THEN** Vitest executes all three projects (unit, integration, browser) and reports results per project

#### Scenario: Running a specific project

- **WHEN** a developer runs `pnpm test:unit` (or `--project unit`)
- **THEN** only unit tests execute; integration and browser tests are skipped

#### Scenario: Path aliases resolve in tests

- **WHEN** a test file imports from `@core/domain/models/example` or `@trip/presentation/pages/example`
- **THEN** the import resolves correctly via `vite-tsconfig-paths` inherited from `vite.config.base.ts`

---

### Requirement: Unit project — jsdom environment, no network

The `unit` project SHALL run files matching `src/**/*.test.{ts,tsx}` in a jsdom environment with no network access. It SHALL complete in under 10 seconds for the full suite.

#### Scenario: Unit test runs in jsdom

- **WHEN** a `.test.ts` file accesses `document` or `window`
- **THEN** the jsdom DOM environment provides these globals without error

#### Scenario: Unit test does not make HTTP calls

- **WHEN** a use case unit test calls a method that would normally trigger HTTP
- **THEN** the dependency is mocked at the repository interface level — no real or MSW-intercepted HTTP occurs

---

### Requirement: Integration project — jsdom with MSW, 30 s timeout

The `integration` project SHALL run files matching `src/**/*.integration.{ts,tsx}` in jsdom with the MSW Node server active globally. The test timeout SHALL be 30 000 ms. The hook timeout SHALL also be 30 000 ms.

#### Scenario: Integration test renders a page with mocked API

- **WHEN** an integration test renders a page component that fetches data via the HTTP client
- **THEN** MSW intercepts the request and returns mock data, and the rendered output reflects that data

#### Scenario: Integration test timeout is 30 seconds

- **WHEN** an integration test exceeds 30 000 ms
- **THEN** Vitest marks the test as failed with a timeout error

#### Scenario: MSW server is active for every integration test

- **WHEN** any `.integration.ts` file runs
- **THEN** `server.listen()` has been called before the first test and `server.close()` is called after the last

---

### Requirement: Browser project — Playwright Chromium

The `browser` project SHALL run files matching `src/**/*.browser.{ts,tsx}` in a real Chromium instance managed by Playwright, in headless mode. The MSW browser worker SHALL be active inside the test browser.

#### Scenario: Browser test runs in real Chromium

- **WHEN** a `.browser.ts` test accesses `document.querySelector`
- **THEN** the query executes in a real Chromium DOM, not jsdom

#### Scenario: Headless mode is active

- **WHEN** browser tests run on CI or locally via `pnpm test:browser`
- **THEN** no browser window opens; Chromium runs headlessly

---

### Requirement: Global setup file applied to all projects

All three Vitest projects SHALL use `src/tests/setup/vitest-setup.ts` as their `setupFiles` entry. This file SHALL import `@testing-library/jest-dom/vitest`, extend `expect` with custom neverthrow matchers, and manage the MSW Node server lifecycle for the integration project.

#### Scenario: jest-dom matchers are available everywhere

- **WHEN** any test (unit, integration, or browser) calls `expect(element).toBeInTheDocument()`
- **THEN** the matcher resolves without error

#### Scenario: Custom matchers are available everywhere

- **WHEN** any test calls `expect(result).toBeOk()` on a neverthrow `Result`
- **THEN** the assertion passes if the result is `Ok` and fails with a descriptive message if it is `Err`

---

### Requirement: Test scripts in package.json

`apps/frontend/package.json` SHALL provide scripts for running each project independently and for generating coverage. The root `package.json` SHALL provide convenience scripts that delegate to the frontend.

#### Scenario: Individual project scripts exist

- **WHEN** a developer runs `pnpm test:unit`, `pnpm test:integration`, or `pnpm test:browser` in `apps/frontend/`
- **THEN** the corresponding Vitest project runs with `--project <name>`

#### Scenario: Coverage script exists

- **WHEN** a developer runs `pnpm test:coverage`
- **THEN** Vitest runs all projects and generates a coverage report in `coverage/` using V8

---

### Requirement: Coverage thresholds enforced

The coverage configuration SHALL enforce minimum thresholds: 70 % for lines, functions, and statements; 60 % for branches. Coverage SHALL exclude test files, stories, mocks, DI registration files, and framework entry points.

#### Scenario: Coverage passes when thresholds are met

- **WHEN** `pnpm test:coverage` runs and all thresholds are satisfied
- **THEN** the command exits with code 0

#### Scenario: Coverage fails when threshold is not met

- **WHEN** line coverage drops below 70 %
- **THEN** Vitest exits with a non-zero code and reports which threshold was not met

#### Scenario: Test and infrastructure files are excluded from coverage

- **WHEN** coverage is calculated
- **THEN** `src/tests/**`, `src/**/*.stories.tsx`, `src/**/*.mock.ts`, `src/**/*.di.ts`, and `src/main.tsx` are excluded from the report
