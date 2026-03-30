## ADDED Requirements

### Requirement: MSW Node server for tests

The project SHALL provide a configured MSW Node server at `src/tests/msw/server.ts` using `setupServer()` from `msw/node`. The server SHALL be initialised with all handlers from the central barrel. Integration tests SHALL use this server for HTTP interception.

#### Scenario: Server starts and intercepts requests

- **WHEN** an integration test starts the MSW server and makes an HTTP request to a registered handler path
- **THEN** the request is intercepted and the mocked response is returned without hitting a real network

#### Scenario: Server resets handlers after each test

- **WHEN** an integration test adds a runtime handler override (`server.use(...)`) and the test completes
- **THEN** `server.resetHandlers()` restores the baseline handlers so subsequent tests are not affected

#### Scenario: Unhandled requests produce a warning

- **WHEN** an integration test makes a request to a path with no registered handler
- **THEN** MSW emits a console warning and the request passes through (not a test failure)

---

### Requirement: MSW browser worker for development

The project SHALL provide a configured MSW browser worker at `src/tests/msw/browser.ts` using `setupWorker()` from `msw/browser`. The worker SHALL register `public/mockServiceWorker.js` as a service worker in the browser during development.

#### Scenario: Worker starts in development mode

- **WHEN** the application starts with `VITE_USE_MSW=true`
- **THEN** the MSW browser worker registers and the browser console logs `[MSW] Mocking enabled`

#### Scenario: Worker does not start in production

- **WHEN** the application starts without `VITE_USE_MSW=true` (or with `VITE_USE_MSW=false`)
- **THEN** the MSW worker is never imported or started and no service worker is registered for mocking purposes

#### Scenario: Unhandled browser requests bypass MSW

- **WHEN** the development application makes a request to an unregistered path (e.g., a CDN font URL)
- **THEN** the request passes through to the real network without error or warning

---

### Requirement: Centralised handler barrel with per-module files

The project SHALL maintain a handler barrel at `src/tests/msw/handlers/index.ts` that composes handler arrays from per-module files. Each feature proposal SHALL add its own `{module}.handlers.ts` file and register it in the barrel. At this point the barrel exports an empty array.

#### Scenario: Empty handlers array at project initialisation

- **WHEN** the MSW server or worker is started with the default handlers from the barrel
- **THEN** no routes are intercepted (empty array)

#### Scenario: Feature handler file is added incrementally

- **WHEN** a future proposal adds `trip.handlers.ts` and imports it in `index.ts`
- **THEN** the server and worker both use the updated handler list without any other changes

---

### Requirement: VITE_USE_MSW environment variable

The application SHALL define `VITE_USE_MSW` as a typed environment variable in `vite-env.d.ts` and document it in `.env.example`. The variable SHALL control whether the MSW browser worker activates at startup.

#### Scenario: Variable is typed in ImportMetaEnv

- **WHEN** TypeScript compiles a file that accesses `import.meta.env.VITE_USE_MSW`
- **THEN** TypeScript resolves the type as `string` without error

#### Scenario: .env.example documents the variable

- **WHEN** a developer copies `.env.example` to `.env`
- **THEN** `VITE_USE_MSW=true` is present, enabling mock mode for local development by default

---

### Requirement: Dynamic MSW startup in main.tsx

The application entry point SHALL start the MSW browser worker asynchronously before mounting React. The worker SHALL be loaded via dynamic import so it is excluded from the production bundle.

#### Scenario: React mounts only after worker is ready

- **WHEN** the application starts with `VITE_USE_MSW=true`
- **THEN** `createRoot(...).render(...)` is called only after the worker's `start()` promise resolves

#### Scenario: MSW is tree-shaken from production bundle

- **WHEN** the application is built with `VITE_USE_MSW` not set to `"true"`
- **THEN** the production bundle does not contain any MSW browser worker code
