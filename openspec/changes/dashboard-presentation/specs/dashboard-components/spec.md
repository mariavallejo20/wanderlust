## ADDED Requirements

### Requirement: TripCard displays trip summary information

`TripCard` SHALL be a pure presentational component accepting a `trip: Trip` prop and an `onClick: (id: string) => void` prop. It SHALL display:

- Trip `title` as a heading
- Trip `destination` with a location icon
- Formatted date range (`startDate` → `endDate`) using Luxon
- `durationInDays` (e.g., "7 days")
- Status badge with a distinct color per status: `DRAFT` → gray, `UPCOMING` → blue, `IN_PROGRESS` → green, `COMPLETED` → default/neutral

Clicking anywhere on the card SHALL call `onClick(trip.id)`.

#### Scenario: Card renders all trip fields

- **WHEN** `TripCard` receives a complete `Trip` prop
- **THEN** the title, destination, date range, duration, and status badge are all visible

#### Scenario: Click triggers onClick with correct ID

- **WHEN** the user clicks the card
- **THEN** `onClick` is called with the trip's `id`

#### Scenario: Status badge color matches status

- **WHEN** the trip status is `"IN_PROGRESS"`
- **THEN** the badge renders with the green color token

---

### Requirement: TripList renders a grid of TripCards or a skeleton

`TripList` SHALL accept `trips: Trip[]`, `isLoading: boolean`, and `onTripClick: (id: string) => void` props. When `isLoading` is `true` it SHALL render a 3-column grid of `antd Skeleton` placeholders (3 items). When `isLoading` is `false` and `trips` is non-empty it SHALL render one `TripCard` per trip. When `trips` is empty it SHALL render nothing (the empty state is handled by `DashboardPage`).

#### Scenario: Shows skeleton while loading

- **WHEN** `isLoading` is `true`
- **THEN** skeleton placeholders are rendered and no `TripCard` is visible

#### Scenario: Shows trip cards when loaded

- **WHEN** `isLoading` is `false` and `trips` has 2 items
- **THEN** 2 `TripCard` components are rendered

#### Scenario: Renders nothing when trips is empty

- **WHEN** `isLoading` is `false` and `trips` is `[]`
- **THEN** no `TripCard` or skeleton is rendered

---

### Requirement: TripStatusTabs filters trips by status

`TripStatusTabs` SHALL accept `activeStatus: TripStatus | null` and `onChange: (status: TripStatus | null) => void` props. It SHALL render one tab per status value plus an "All" tab (`null`). The active tab SHALL be highlighted. Clicking a tab SHALL call `onChange` with the corresponding status (or `null` for "All").

#### Scenario: "All" tab is active by default

- **WHEN** `activeStatus` is `null`
- **THEN** the "All" tab is visually selected

#### Scenario: Clicking a status tab calls onChange

- **WHEN** the user clicks the "DRAFT" tab
- **THEN** `onChange` is called with `"DRAFT"`

#### Scenario: Clicking "All" tab calls onChange with null

- **WHEN** the user clicks the "All" tab
- **THEN** `onChange` is called with `null`

---

### Requirement: SearchBar debounces input and calls onSearch

`SearchBar` SHALL accept `onSearch: (query: string) => void` and an optional `placeholder: string` prop. It SHALL debounce the input by 300 ms before calling `onSearch`. Clearing the input SHALL immediately call `onSearch("")`.

#### Scenario: onSearch is called after debounce delay

- **WHEN** the user types "roma" in the search input
- **THEN** `onSearch("roma")` is called after 300 ms of inactivity

#### Scenario: Clearing input calls onSearch immediately

- **WHEN** the user clears the input
- **THEN** `onSearch("")` is called without waiting for the debounce delay

---

### Requirement: EmptyState renders when the filtered list is empty

`EmptyState` SHALL be a presentational component with no required props. It SHALL display the `common:emptyState.title` and `common:emptyState.description` translation keys and an illustration or icon. It is rendered by `DashboardPage` when `vm.filteredTrips` is empty and `vm.isLoading` is `false`.

#### Scenario: EmptyState is shown when filteredTrips is empty

- **WHEN** `DashboardPage` renders with `filteredTrips === []` and `isLoading === false`
- **THEN** the empty state component is visible

#### Scenario: EmptyState is not shown when trips exist

- **WHEN** `filteredTrips` has at least one item
- **THEN** the empty state component is not rendered

---

### Requirement: All dashboard components have Storybook stories and dashboard translations

Each component (`TripCard`, `TripList`, `TripStatusTabs`, `SearchBar`, `EmptyState`) SHALL have a co-located `*.stories.tsx` file with at least one story covering the default state and one covering an edge case. `dashboard.json` (es + en) SHALL contain all UI strings used by these components and `DashboardPage`. The namespace SHALL be loaded lazily by i18next.

#### Scenario: TripCard default story renders without errors

- **WHEN** the TripCard story is opened in Storybook
- **THEN** the card renders with the mock trip data and no console errors

#### Scenario: TripList loading story renders skeletons

- **WHEN** the TripList story with `isLoading=true` is opened
- **THEN** skeleton placeholders are visible
