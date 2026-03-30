## ADDED Requirements

### Requirement: EventBus for cross-cutting communication

The `EventBusRepository` interface SHALL provide an `emit(event: EventBus)` method and a `bus` property returning an `Observable<EventBus>`. The implementation SHALL use an RxJS `Subject<EventBus>` and be registered as a singleton.

#### Scenario: Event is emitted and received

- **WHEN** a subscriber observes `eventBus.bus` and `eventBus.emit(new UnauthorizedEventBus())` is called
- **THEN** the subscriber receives the `UnauthorizedEventBus` event

#### Scenario: Multiple subscribers receive the same event

- **WHEN** two subscribers observe `eventBus.bus` and an event is emitted
- **THEN** both subscribers receive the event

#### Scenario: EventBus is a singleton

- **WHEN** `EventBusRepository` is resolved multiple times from the DI container
- **THEN** the same instance is returned, ensuring all subscribers share the same event stream

---

### Requirement: EventBus typed event model

The EventBus SHALL use a discriminated union of event types. The base `EventBus` class SHALL be extended by specific event types. Initially, only `UnauthorizedEventBus` SHALL be defined.

#### Scenario: Event types are distinguishable

- **WHEN** a subscriber receives an event from the bus
- **THEN** it can use `instanceof` to determine the specific event type (e.g., `event instanceof UnauthorizedEventBus`)

---

### Requirement: Typed SessionStorage wrapper

`SessionStorage` SHALL be an @injectable singleton wrapping `window.sessionStorage` with typed methods:

- `get(key): string | null` and `set(key, value: string)`
- `getObject<T>(key): T | null` and `setObject<T>(key, value: T)`
- `getInt(key): number | null` and `setInt(key, value: number)`
- `remove(key)` and `clear()`

Keys SHALL be defined as a TypeScript enum for type safety.

#### Scenario: Store and retrieve a string

- **WHEN** `sessionStorage.set(SessionStorageKeys.AppMode, "dark")` is called
- **THEN** `sessionStorage.get(SessionStorageKeys.AppMode)` returns `"dark"`

#### Scenario: Store and retrieve an object

- **WHEN** `sessionStorage.setObject(key, { foo: "bar" })` is called
- **THEN** `sessionStorage.getObject(key)` returns `{ foo: "bar" }`

#### Scenario: getObject returns null for missing key

- **WHEN** `sessionStorage.getObject(key)` is called for a key that does not exist
- **THEN** it returns `null` (not an error)

#### Scenario: getObject returns null for invalid JSON

- **WHEN** the stored value is not valid JSON
- **THEN** `sessionStorage.getObject(key)` returns `null` (not an error)

---

### Requirement: BaseViewModel with subscription lifecycle

`BaseViewModel` SHALL be an abstract @injectable class providing:

- `addSub(subscription: Subscription)` — registers an RxJS subscription for cleanup
- `didMount(): Promise<void>` — async lifecycle hook, called after component mount
- `willUnmount()` — unsubscribes all registered subscriptions

#### Scenario: Subscriptions are cleaned up on unmount

- **WHEN** a ViewModel registers subscriptions via `addSub()` and `willUnmount()` is called
- **THEN** all registered subscriptions are unsubscribed

#### Scenario: didMount is called after component mount

- **WHEN** a component using `useViewModel` mounts
- **THEN** the ViewModel's `didMount()` method is called once

---

### Requirement: useViewModel hook

The `useViewModel<T extends BaseViewModel>(identifier: symbol)` hook SHALL:

1. Resolve the ViewModel from the DI container on first render
2. Call `viewModel.didMount()` after the component mounts
3. Call `viewModel.willUnmount()` when the component unmounts
4. Return the ViewModel instance

#### Scenario: ViewModel is resolved from DI container

- **WHEN** a component calls `useViewModel<TripViewModel>(TripTypes.TripViewModel)`
- **THEN** the hook resolves and returns the ViewModel instance from the Inversify container

#### Scenario: Lifecycle methods are called correctly

- **WHEN** a component using `useViewModel` mounts and later unmounts
- **THEN** `didMount()` is called once on mount and `willUnmount()` is called once on unmount

---

### Requirement: useDidMount and useWillUnmount hooks

`useDidMount(callback)` SHALL execute the callback once after the component mounts. `useWillUnmount(callback)` SHALL execute the callback once when the component unmounts.

#### Scenario: useDidMount runs on mount only

- **WHEN** a component using `useDidMount(() => init())` renders
- **THEN** `init()` is called once after the first render, not on subsequent re-renders

#### Scenario: useWillUnmount runs on unmount only

- **WHEN** a component using `useWillUnmount(() => cleanup())` unmounts
- **THEN** `cleanup()` is called exactly once

---

### Requirement: Utility types

The core module SHALL export the following utility types:

- `Nullable<T>` = `T | null`
- `Undefinable<T>` = `T | undefined`
- `ObjectLike<T>` = `Record<string, T>`

#### Scenario: Utility types are importable

- **WHEN** a module imports `Nullable` from `@core/domain/types/utility.types`
- **THEN** it can use `Nullable<string>` as a type alias for `string | null`
