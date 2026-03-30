## ADDED Requirements

### Requirement: DI container initialization

The application SHALL initialize an Inversify Container in `main.tsx` that loads all registered module bindings. The `reflect-metadata` polyfill SHALL be imported before any other import.

#### Scenario: Container initializes on app start

- **WHEN** the application starts
- **THEN** the Inversify container is created and all core module bindings are available for resolution

#### Scenario: reflect-metadata is loaded first

- **WHEN** `main.tsx` is executed
- **THEN** `reflect-metadata` is the first import, before React, App, or any other module

---

### Requirement: DiModuleBuilder creates container modules

The `DiModuleBuilder` class SHALL accept a module name and provide a `registerSubModules` method that receives a factory function. The factory function SHALL receive a `bind` function and register bindings for submodule categories (datasources, infrastructure, repositories, mappers, useCases, viewModels, stores). The `registerModule` method SHALL return an Inversify `ContainerModule`.

#### Scenario: Feature module registers bindings

- **WHEN** a feature module creates a `DiModuleBuilder` and calls `registerSubModules` with binding definitions
- **THEN** `registerModule()` returns a `ContainerModule` that can be loaded into the container with `loadSync()`

#### Scenario: Multiple modules can be loaded independently

- **WHEN** multiple modules (core, trip, itinerary) each produce a `ContainerModule`
- **THEN** all modules can be loaded into the same container without conflicts

---

### Requirement: DI types use sealed Symbol objects

Each module SHALL define its DI identifiers as a sealed object of `Symbol.for()` values. The object SHALL be frozen with `Object.seal()` to prevent runtime modifications.

#### Scenario: Symbols are unique and debuggable

- **WHEN** a DI type is defined as `Symbol.for("HttpFactory")`
- **THEN** the symbol is globally unique and its description is visible in debugging tools

#### Scenario: Type object is immutable

- **WHEN** code attempts to add or modify a property on a sealed types object
- **THEN** the operation fails (TypeError in strict mode)

---

### Requirement: DI bindings follow consistent scope rules

Infrastructure and repository bindings SHALL be registered as singletons. UseCase and ViewModel bindings SHALL be registered as transient (new instance per resolution).

#### Scenario: Infrastructure is singleton

- **WHEN** `WanderlustApiClient` is resolved multiple times from the container
- **THEN** the same instance is returned each time

#### Scenario: ViewModels are transient

- **WHEN** a ViewModel is resolved multiple times from the container
- **THEN** a new instance is returned each time
