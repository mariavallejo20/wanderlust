## ADDED Requirements

### Requirement: DashboardPageViewModel manages trip list state reactively

`DashboardPageViewModel` SHALL extend `BaseViewModel`, be decorated with `@injectable()`, and call `makeObservable(this)` in its constructor. It SHALL declare the following observable state:

- `@observable trips: Trip[]` — full list loaded from the API, starts as `[]`
- `@observable isLoading: boolean` — starts as `true`, set to `false` after the first load completes or fails
- `@observable error: WanderlustError | null` — set when `TripsGetAllUseCase` returns `Err`, cleared on each new load attempt
- `@observable activeStatus: TripStatus | null` — `null` means "show all statuses"
- `@observable searchQuery: string` — debounced search string, starts as `""`

It SHALL expose:

- `@computed get filteredTrips(): Trip[]` — filters `trips` by `activeStatus` (skipped when `null`), then by `searchQuery` (case-insensitive substring match on `title`)
- `@action setActiveStatus(status: TripStatus | null): void`
- `@action setSearchQuery(query: string): void`

#### Scenario: filteredTrips applies status filter

- **WHEN** `activeStatus` is set to `"DRAFT"` and `trips` contains trips with mixed statuses
- **THEN** `filteredTrips` returns only trips where `status === "DRAFT"`

#### Scenario: filteredTrips applies search filter

- **WHEN** `searchQuery` is `"roma"` and `trips` contains a trip with title `"Viaje a Roma"` and another with `"Viaje a París"`
- **THEN** `filteredTrips` returns only the Roma trip (case-insensitive match)

#### Scenario: filteredTrips combines both filters

- **WHEN** `activeStatus` is `"UPCOMING"` and `searchQuery` is `"paris"`
- **THEN** `filteredTrips` returns only trips that are both `UPCOMING` and contain `"paris"` in the title

#### Scenario: filteredTrips returns all trips when both filters are cleared

- **WHEN** `activeStatus` is `null` and `searchQuery` is `""`
- **THEN** `filteredTrips` returns the full `trips` array

---

### Requirement: DashboardPageViewModel loads trips in didMount

`DashboardPageViewModel.didMount()` SHALL call `TripsGetAllUseCase.execute()` and update state via `runInAction`. On `Ok`: set `trips` to the result and `isLoading` to `false`. On `Err`: set `error` to the error and `isLoading` to `false`.

#### Scenario: Successful load populates trips

- **WHEN** `didMount()` is called and the use case returns `Ok<Trip[]>`
- **THEN** `trips` contains the returned array, `isLoading` is `false`, and `error` is `null`

#### Scenario: Failed load sets error state

- **WHEN** `didMount()` is called and the use case returns `Err`
- **THEN** `error` is set to the error, `isLoading` is `false`, and `trips` remains `[]`

---

### Requirement: DashboardPageViewModel is registered in DI as transient

`dashboard-module.di.ts` SHALL bind `DashboardTypes.DashboardPageViewModel` to `DashboardPageViewModel` with no scope modifier (transient). `inversify.config.ts` SHALL load `dashboardModule`.

#### Scenario: Fresh ViewModel instance on each page mount

- **WHEN** `container.get(DashboardTypes.DashboardPageViewModel)` is called twice
- **THEN** two distinct instances are returned

---

### Requirement: DashboardPage renders reactive state from the ViewModel

`DashboardPage` SHALL be an `observer` component. It SHALL resolve `DashboardPageViewModel` via `useViewModel(DashboardTypes.DashboardPageViewModel)`. It SHALL:

- Render `WlSpin` (full-page centered) while `vm.isLoading` is `true`
- Render `WlResult` with `status="error"` when `vm.error` is not `null`
- Render `SearchBar`, `TripStatusTabs`, and `TripList` (passing `vm.filteredTrips`) when loading is complete and there is no error

#### Scenario: Page shows loading state on mount

- **WHEN** `DashboardPage` mounts and `isLoading` is `true`
- **THEN** the loading spinner is visible and no trip cards are rendered

#### Scenario: Page shows trip list after successful load

- **WHEN** `isLoading` becomes `false` and `trips` contains at least one trip
- **THEN** trip cards are rendered and the spinner is not visible

#### Scenario: Page shows error state on fetch failure

- **WHEN** `isLoading` becomes `false` and `error` is not `null`
- **THEN** `WlResult` with error status is rendered and no trip cards are visible

---

### Requirement: DashboardPage integration test validates full render cycle

A `dashboard-page.integration.tsx` file SHALL render `DashboardPage` with a real DI container and MSW server. It SHALL verify that trip titles from the fixture appear in the DOM after `didMount` resolves.

#### Scenario: Trip titles render after mount

- **WHEN** `DashboardPage` is rendered and MSW returns the default trip fixture
- **THEN** the trip title `"Viaje a Roma"` is visible in the document
