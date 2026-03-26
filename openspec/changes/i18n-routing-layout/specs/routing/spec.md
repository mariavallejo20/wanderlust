## ADDED Requirements

### Requirement: Centralised route constants with typed helpers

The system SHALL provide a `route-paths.ts` file exporting a `RoutePaths` object with typed constants for all planned routes. Parameterised routes SHALL have helper functions that accept parameters and return the resolved path string.

Routes:

- `/` — Dashboard
- `/trips/:tripId` — Trip detail
- `/trips/:tripId/itinerary` — Itinerary view
- `/trips/:tripId/budget` — Budget view
- `/trips/:tripId/map` — Map view
- `/shared/:shareId` — Public shared view
- `*` — Not found

#### Scenario: Static route constant

- **WHEN** a component needs to navigate to the dashboard
- **THEN** it uses `RoutePaths.dashboard` which resolves to `"/"`

#### Scenario: Parameterised route helper

- **WHEN** a component needs to navigate to trip detail for trip `"abc-123"`
- **THEN** it calls `RoutePaths.tripDetail("abc-123")` which returns `"/trips/abc-123"`

#### Scenario: Nested parameterised route helper

- **WHEN** a component needs to navigate to the itinerary of trip `"abc-123"`
- **THEN** it calls `RoutePaths.itinerary("abc-123")` which returns `"/trips/abc-123/itinerary"`

### Requirement: Browser router with lazy-loaded routes

The system SHALL configure React Router 7 using `createBrowserRouter` with a root route that renders `AppLayout`. All child page routes SHALL use the `lazy` property for code splitting, so page components are only loaded when their route is navigated to.

#### Scenario: Initial page load

- **WHEN** the user navigates to `/`
- **THEN** only the dashboard page chunk is loaded, not trip detail or other page bundles

#### Scenario: Navigate to trip detail

- **WHEN** the user navigates to `/trips/abc-123`
- **THEN** the trip detail page chunk is loaded on demand

#### Scenario: Suspense fallback during lazy load

- **WHEN** a lazy-loaded route chunk is being fetched
- **THEN** a loading spinner (Ant Design `Spin`) is displayed until the chunk resolves

### Requirement: Per-module router files

Each module that has pages SHALL export its own `{module}.router.tsx` file defining its `<Route>` subtree. The main `router.tsx` SHALL compose these module routers into the root route tree.

#### Scenario: Dashboard module router

- **WHEN** the main router is configured
- **THEN** it imports and includes `dashboardRouter` which defines the index route

#### Scenario: Trip module router

- **WHEN** the main router is configured
- **THEN** it imports and includes `tripRouter` which defines the `/trips/:tripId` route and its nested child routes (itinerary, budget, map)

#### Scenario: Share module router

- **WHEN** the main router is configured
- **THEN** it imports and includes `shareRouter` which defines the `/shared/:shareId` route

### Requirement: Placeholder pages for all planned routes

Each route SHALL render a minimal placeholder page component located in its future module directory (e.g., `src/modules/dashboard/presentation/pages/dashboard/dashboard-page.tsx`). The placeholder SHALL display a translated page title using the `common` namespace.

#### Scenario: Dashboard placeholder

- **WHEN** the user navigates to `/`
- **THEN** a page with the translated title "Dashboard" is displayed

#### Scenario: Trip detail placeholder

- **WHEN** the user navigates to `/trips/:tripId`
- **THEN** a page with the translated title "Trip Detail" is displayed

#### Scenario: Not found page

- **WHEN** the user navigates to an undefined route like `/xyz`
- **THEN** a "Not Found" page is displayed with a translated message

### Requirement: Not found route catches unmatched paths

The router SHALL include a catch-all `*` route that renders a Not Found page. This page SHALL display a translated message and a link to navigate back to the dashboard.

#### Scenario: Unknown path shows not found

- **WHEN** the user navigates to `/this-does-not-exist`
- **THEN** the Not Found page renders with a message and a link to `/`
