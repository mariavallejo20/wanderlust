## Why

The trip data layer is fully wired (proposals 05–06) but the application shows only a placeholder page. This proposal replaces the stub `DashboardPage` with a functional trip list UI: the first screen the user sees, where they browse their trips, filter by status, and search by title. It is also the entry point to every other feature module.

## What Changes

- Replace the stub `DashboardPage` component with a full MobX-driven page that loads and displays trips
- Create `DashboardPageViewModel` — `@injectable()`, extends `BaseViewModel`, holds `@observable` trip list + loading + error state; loads trips via `TripsGetAllUseCase.execute()` in `didMount()`; exposes `@computed` filtered list driven by active status tab and search query; `@action` setters for filter and search
- Create `DashboardTypes` — sealed Symbol object with `DashboardPageViewModel` identifier
- Create `dashboard-module.di.ts` — registers `DashboardPageViewModel` in the DI container
- Register `dashboardModule` in `inversify.config.ts`
- Create components (each with co-located story):
    - `TripCard` — displays title, destination, date range, status badge and duration
    - `TripList` — renders a grid of `TripCard` with loading skeleton state
    - `TripStatusTabs` — Ant Design `Tabs` filtering trips by status (`ALL | DRAFT | UPCOMING | IN_PROGRESS | COMPLETED`)
    - `SearchBar` — controlled input with debounce that filters trips by title
    - `EmptyState` — shown when the filtered list is empty (reuses existing `common.emptyState` translations)
- Add `dashboard.json` translation namespace (es + en) with all UI strings
- Wire `useViewModel` hook in `DashboardPage` to resolve `DashboardPageViewModel` from the DI container
- Add component integration tests for `DashboardPage` using MSW + Testing Library

## Capabilities

### New Capabilities

- `dashboard-page`: DashboardPageViewModel with MobX reactive state, `DashboardTypes` DI symbols, `dashboard-module.di.ts`, full `DashboardPage` wiring — loads trips, filters by status, searches by title
- `dashboard-components`: `TripCard`, `TripList`, `TripStatusTabs`, `SearchBar`, `EmptyState` — presentational components with Storybook stories and `dashboard.json` translations

### Modified Capabilities

(none)

## Impact

- **New files**:
    - `src/modules/dashboard/presentation/pages/dashboard/dashboard-page.viewmodel.ts`
    - `src/modules/dashboard/presentation/components/trip-card/trip-card.component.tsx`
    - `src/modules/dashboard/presentation/components/trip-card/trip-card.component.stories.tsx`
    - `src/modules/dashboard/presentation/components/trip-list/trip-list.component.tsx`
    - `src/modules/dashboard/presentation/components/trip-list/trip-list.component.stories.tsx`
    - `src/modules/dashboard/presentation/components/trip-status-tabs/trip-status-tabs.component.tsx`
    - `src/modules/dashboard/presentation/components/trip-status-tabs/trip-status-tabs.component.stories.tsx`
    - `src/modules/dashboard/presentation/components/search-bar/search-bar.component.tsx`
    - `src/modules/dashboard/presentation/components/search-bar/search-bar.component.stories.tsx`
    - `src/modules/dashboard/presentation/components/empty-state/empty-state.component.tsx`
    - `src/modules/dashboard/presentation/components/empty-state/empty-state.component.stories.tsx`
    - `src/modules/dashboard/presentation/pages/dashboard/dashboard-page.integration.tsx`
    - `src/modules/dashboard/dashboard-types.di.ts`
    - `src/modules/dashboard/dashboard-module.di.ts`
    - `public/locales/es/dashboard.json`
    - `public/locales/en/dashboard.json`
- **Modified files**:
    - `src/modules/dashboard/presentation/pages/dashboard/dashboard-page.tsx` — replace stub with full implementation
    - `src/di/inversify.config.ts` — register `dashboardModule`
- **GitHub issue**: #7
- **Branch**: `feature/07-dashboard`
- **Phase**: 1 (Trip CRUD + Dashboard)
- **Priority**: Core
- **Unblocks**: Proposal 08 (Trip form — create/edit)
