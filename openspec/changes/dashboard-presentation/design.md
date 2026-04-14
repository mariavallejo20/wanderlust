## Context

The routing and layout are in place; `DashboardPage` exists as a stub that only renders a title. The trip data layer is complete: the DI container can resolve all trip use cases and returns real data via MSW. This design wires the presentation layer to that stack, establishing the first functional screen and setting the ViewModel + component pattern that every subsequent feature module will follow.

## Goals / Non-Goals

**Goals:**

- Implement `DashboardPageViewModel` as the first real ViewModel in the project, establishing the MobX pattern for all future modules
- Build the 5 UI components that compose the dashboard (TripCard, TripList, TripStatusTabs, SearchBar, EmptyState)
- Add `dashboard.json` translations (es + en)
- Write Storybook stories for every component
- Write an integration test for `DashboardPage` that validates the full render cycle via MSW

**Non-Goals:**

- Trip creation or editing — those are proposals 08 and beyond
- Pagination or infinite scroll on the trip list
- Drag-to-reorder trips
- Optimistic state updates

## Decisions

### 1. ViewModel uses `makeObservable(this)` + decorator syntax

Following the established pattern (`@observable`, `@action`, `@computed`, `makeObservable(this)` in constructor). Async state mutations use `runInAction(() => {...})` to batch changes after awaiting. This is consistent with the reference architecture and avoids `makeAutoObservable` which conflicts with class inheritance (`BaseViewModel`).

```ts
@injectable()
export class DashboardPageViewModel extends BaseViewModel {
    @observable trips: Trip[] = [];
    @observable isLoading = true;
    @observable error: WanderlustError | null = null;
    @observable activeStatus: TripStatus | null = null; // null = ALL
    @observable searchQuery = "";

    constructor(@inject(TripTypes.TripsGetAllUseCase) ...) {
        super();
        makeObservable(this);
    }

    @computed get filteredTrips(): Trip[] { ... }

    @action setActiveStatus(status: TripStatus | null): void { ... }
    @action setSearchQuery(query: string): void { ... }

    override async didMount(): Promise<void> {
        await this.loadTrips();
    }

    @action private async loadTrips(): Promise<void> { ... }
}
```

### 2. Status filter uses `TripStatus | null` — null means "ALL"

Using `null` for "show all" avoids introducing a synthetic `"ALL"` string that does not belong to the domain `TripStatus` enum. The `@computed get filteredTrips` checks `this.activeStatus === null` before filtering by status, then applies the search query on top.

### 3. Search debounce lives in `SearchBar`, not in the ViewModel

`SearchBar` manages its own debounce (300 ms, via `useEffect` + `setTimeout` cleanup) and calls `vm.setSearchQuery` only after the delay. The ViewModel stores the final debounced value and remains free of setTimeout logic. Alternative (debounce in ViewModel) was rejected because ViewModels should not manage browser timers directly.

### 4. No separate MobX Store

The ViewModel already holds all the observable state needed for this page. A separate store would add a layer of indirection without benefit. If state needs to be shared across multiple pages in the future (e.g., badge count in the header), a `TripsStore` can be extracted then.

### 5. TripCard navigation is wired to `RoutePaths.tripDetail`

Clicking a TripCard calls `navigate(RoutePaths.tripDetail(trip.id))` via React Router `useNavigate`. The trip detail page does not exist yet (proposal 11), so it falls through to the 404 page. This is intentional and acceptable — the routing is already declared and the navigation works correctly.

### 6. TripCard uses Tailwind layout, not an antd Card wrapper

`TripCard` uses divs + Tailwind (`tw:` prefix) for layout. Creating a `WlCard` wrapper just for this component would be premature abstraction. If multiple feature modules need a generic card, `WlCard` will be created then.

### 7. Loading state renders a skeleton grid, error state renders `WlResult`

`TripList` accepts an `isLoading` prop. When true it renders a 3-column grid of antd `Skeleton` (via a direct one-off import — not wrapped, since `WlSkeleton` does not yet exist). When `error !== null`, `DashboardPage` renders `WlResult` with status `error`.

### 8. DashboardPageViewModel registered as transient in DI

Each `DashboardPage` mount gets a fresh ViewModel instance. This avoids stale state if the user navigates away and back. The `useViewModel` hook already handles lifecycle (calls `didMount` and `willUnmount`).

## Risks / Trade-offs

- **ViewModel is transient → trips reload on every mount** — If the user navigates away and returns, trips are re-fetched. This is a conscious trade-off: simpler code and always-fresh data vs. unnecessary network calls. A future `TripsStore` (singleton) can cache the list if this becomes noticeable.
- **Skeleton uses antd `Skeleton` directly** — If the ESLint rule `no-restricted-imports` blocks direct antd imports, a `WlSkeleton` wrapper will need to be created first. Mitigation: check the ESLint config before coding.
- **SearchBar 300 ms debounce** — Too slow for users typing fast on a long list; too fast to be useful with network filtering. Acceptable for the current MSW-only setup where filtering is synchronous on the client.

## Open Questions

(none)
