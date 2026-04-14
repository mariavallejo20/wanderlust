## 1. DI Types & Module Registration

- [x] 1.1 Create `src/modules/dashboard/dashboard-types.di.ts` with `DashboardTypes` sealed symbol object (`DashboardPageViewModel`)
- [x] 1.2 Create `src/modules/dashboard/dashboard-module.di.ts` using `DiModuleBuilder` — bind `DashboardTypes.DashboardPageViewModel` to `DashboardPageViewModel` (no scope, transient)
- [x] 1.3 Register `dashboardModule` in `src/di/inversify.config.ts`

## 2. Translations

- [x] 2.1 Create `public/locales/en/dashboard.json` with all UI strings (page title, search placeholder, status tab labels, empty state messages)
- [x] 2.2 Create `public/locales/es/dashboard.json` with Spanish translations for the same keys
- [x] 2.3 Add `dashboard` namespace to i18next type definitions in `src/i18n/resources.d.ts` (or equivalent type file)

## 3. DashboardPageViewModel

- [x] 3.1 Create `src/modules/dashboard/presentation/pages/dashboard/dashboard-page.viewmodel.ts` — `@injectable()`, extends `BaseViewModel`, `makeObservable(this)`, observables: `trips`, `isLoading`, `error`, `activeStatus`, `searchQuery`
- [x] 3.2 Implement `@computed get filteredTrips()` — status filter (skip when null) then case-insensitive title substring match
- [x] 3.3 Implement `@action setActiveStatus()` and `@action setSearchQuery()`
- [x] 3.4 Implement `override async didMount()` — calls `TripsGetAllUseCase.execute()`, updates state via `runInAction` on both Ok and Err branches
- [x] 3.5 Create `src/modules/dashboard/presentation/pages/dashboard/dashboard-page.viewmodel.test.ts` — unit tests for `filteredTrips` (status filter, search filter, combined, cleared), `didMount` success and error scenarios

## 4. Presentational Components

- [x] 4.1 Create `src/modules/dashboard/presentation/components/trip-card/trip-card.component.tsx` — pure component, props: `trip: Trip`, `onClick: (id: string) => void`; renders title, destination with icon, Luxon-formatted date range, `durationInDays`, status badge with color per status; clicking calls `onClick(trip.id)`
- [x] 4.2 Create `src/modules/dashboard/presentation/components/trip-card/trip-card.component.stories.tsx` — default story (complete trip) and edge-case story (minimal fields / different status)
- [x] 4.3 Create `src/modules/dashboard/presentation/components/trip-list/trip-list.component.tsx` — props: `trips: Trip[]`, `isLoading: boolean`, `onTripClick: (id: string) => void`; loading → 3-column antd `Skeleton` grid (3 items); loaded → one `TripCard` per trip; empty → renders nothing
- [x] 4.4 Create `src/modules/dashboard/presentation/components/trip-list/trip-list.component.stories.tsx` — loading story and loaded story (2+ trips)
- [x] 4.5 Create `src/modules/dashboard/presentation/components/trip-status-tabs/trip-status-tabs.component.tsx` — props: `activeStatus: TripStatus | null`, `onChange: (status: TripStatus | null) => void`; renders "All" tab (null) plus one tab per `TripStatus` value; active tab highlighted; clicking calls `onChange`
- [x] 4.6 Create `src/modules/dashboard/presentation/components/trip-status-tabs/trip-status-tabs.component.stories.tsx` — "All" active story and specific status active story
- [x] 4.7 Create `src/modules/dashboard/presentation/components/search-bar/search-bar.component.tsx` — props: `onSearch: (query: string) => void`, optional `placeholder: string`; debounces input 300 ms via `useEffect`/`setTimeout`; clearing input calls `onSearch("")` immediately
- [x] 4.8 Create `src/modules/dashboard/presentation/components/search-bar/search-bar.component.stories.tsx` — default story and story with custom placeholder
- [x] 4.9 Create `src/modules/dashboard/presentation/components/empty-state/empty-state.component.tsx` — no required props; renders `common:emptyState.title` and `common:emptyState.description` translation keys with an icon
- [x] 4.10 Create `src/modules/dashboard/presentation/components/empty-state/empty-state.component.stories.tsx` — single default story

## 5. DashboardPage

- [x] 5.1 Replace stub in `src/modules/dashboard/presentation/pages/dashboard/dashboard-page.tsx` — `observer` component, resolves `DashboardPageViewModel` via `useViewModel(DashboardTypes.DashboardPageViewModel)`; renders `WlSpin` (full-page) while `vm.isLoading`; renders `WlResult` with `status="error"` when `vm.error !== null`; renders `SearchBar`, `TripStatusTabs`, `TripList` (with `vm.filteredTrips`) and `EmptyState` (when `filteredTrips` is empty) otherwise

## 6. Integration Test

- [x] 6.1 Create `src/modules/dashboard/presentation/pages/dashboard/dashboard-page.integration.tsx` — renders `DashboardPage` with real DI container and MSW server; asserts trip title `"Viaje a Roma"` is visible after `didMount` resolves
