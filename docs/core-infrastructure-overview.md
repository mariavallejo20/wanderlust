# Core Infrastructure Overview

> Architectural foundation for all feature modules. Every pattern is extracted from a production codebase.

---

## What This Layer Provides

| Component             | Purpose                                                | Key files                                                    |
| --------------------- | ------------------------------------------------------ | ------------------------------------------------------------ |
| **DI System**         | Inversify container + modular registration             | `src/di/`, `core-types.di.ts`, `core-module.di.ts`           |
| **HTTP Client**       | Typed HTTP with `ResultAsync` — no exceptions          | `domain/infrastructures/http/`, `data/infrastructures/http/` |
| **Error Hierarchy**   | One class per HTTP status code, `instanceof`-checkable | `domain/errors/`, `domain/infrastructures/http/errors/`      |
| **EventBus**          | Pub/sub with RxJS Subject for cross-cutting events     | `domain/models/event-bus.model.ts`, `data/repositories/`     |
| **SessionStorage**    | Typed wrapper over `window.sessionStorage`             | `data/infrastructures/session-storage/`                      |
| **ViewModel Pattern** | Base class + hooks bridging business logic to React    | `presentation/view-model/`, `presentation/hook/`             |

All paths relative to `apps/frontend/src/modules/core/`.

---

## Key Decisions

### DI: DiModuleBuilder + sealed Symbols

Each module registers its bindings via `DiModuleBuilder`, organizing them into submodule categories (datasources, repositories, useCases, viewModels). DI identifiers are `Symbol.for()` values in `Object.seal()`-ed objects — globally unique, debuggable, and immutable at runtime.

**Why not string identifiers?** No autocompletion, easy typos, no compile-time safety.
**Why not class-based identifiers?** Couples the identifier to the implementation, breaking the interface/implementation split.

### HTTP: ResultAsync instead of try/catch

The `Http` interface returns `ResultAsync<HttpResponse<R>, HttpError<E>>` for every method. The caller is forced by the type system to handle both success and failure paths — no unhandled rejections, no forgotten `catch` blocks.

**Why not raw Axios?** Exceptions break the type chain. The caller can't know at compile time which errors are possible. `ResultAsync` makes error handling explicit and exhaustive.

### Errors: Class hierarchy with Object.setPrototypeOf

Each HTTP status code (401, 403, 404, 409, 422, 429) maps to its own error class extending `HttpFailedRequestError<T>`. Network failures get `HttpRejectedRequestError`. Every constructor calls `Object.setPrototypeOf(this, new.target.prototype)` to ensure correct `instanceof` behavior after transpilation.

**Why not error codes or enums?** Classes support `instanceof` for pattern matching, carry typed payloads (e.g., 422 validation details via the generic `<T>`), and are extensible without modifying existing code.

### EventBus: Decoupled cross-cutting communication

When the API returns 401, the HTTP interceptor emits `UnauthorizedEventBus` — it doesn't know about routing. The router guard subscribes and redirects to login — it doesn't know about HTTP. Neither module imports the other.

**Why not React Context?** Can't be used outside React (services, interceptors). **Why not a custom emitter?** Loses RxJS operators (filter, debounce, takeUntil) that are already in the dependency tree.

### ViewModel: Business logic outside React

ViewModels are `@injectable()` classes resolved from the DI container. `useViewModel<T>(identifier)` creates the instance once, calls `didMount()` on mount, and `willUnmount()` on unmount (which auto-unsubscribes all RxJS subscriptions). Components become thin observers with zero business logic.

**Why not hooks-only?** Loses DI integration, testing requires React rendering. **Why not MobX stores alone?** No lifecycle management, no automatic subscription cleanup.

---

## Startup Flow

```
main.tsx
  ├── import "reflect-metadata"       ← Required before any Inversify decorator
  ├── import "./di/inversify.config"  ← Creates Container, loads coreModule
  └── createRoot().render(<App />)    ← React starts with all bindings ready
```

Adding a feature module: define types (Symbols), create module (DiModuleBuilder), add `loadSync()` call. No existing code changes.

---

## Scope Rules

| Type                          | Scope     | Reason                                      |
| ----------------------------- | --------- | ------------------------------------------- |
| Infrastructure / Repositories | Singleton | Stateful — must share state across the app  |
| UseCases                      | Transient | Stateless — safe to recreate per resolution |
| ViewModels                    | Transient | Each component gets its own instance        |
