## Context

The monorepo has a fully configured infrastructure (DI container, HTTP factory, EventBus, i18n, MSW, Vitest) but no feature code. The `trip` module is the root entity of the application — every other module references a `tripId`. This design defines the domain layer of the trip module: the `Trip` model, the `TripRepository` interface, five CRUD use cases, and their DI registration, following the same Clean Architecture patterns already established in the `core` module.

## Goals / Non-Goals

**Goals:**

- `Trip` model is a rich domain object: Zod schema validation, branded type, factory method returning `Result<Trip, ZodError>`, and computed properties encapsulating business rules
- `TripRepository` interface is the only coupling point between domain and data — the domain does not know how trips are stored
- Each use case is a single `@injectable` class with one public method returning `ResultAsync`
- TypeScript strict mode compiles clean; all unit tests pass

**Non-Goals:**

- Data layer: `TripImplRepository`, `TripRemoteDatasource`, DTOs, mapper, MSW handlers (proposal 06)
- Presentation layer: pages, ViewModels, components (proposals 07–08)
- Authentication or multi-user ownership (WON'T in v1)

## Decisions

### D1 — Rich domain model with private constructor and factory method

**Decision**: `Trip` is a class with a private constructor. The only way to create an instance is via the static factory `Trip.create(props): Result<Trip, ZodError>`. Internally it runs the Zod schema and returns `Ok(instance)` or `Err(zodError)`.

**Alternatives considered**:

- Plain object / interface: No encapsulation, validation scattered across callers.
- Public constructor with `validate()` separate: Allows creating invalid instances.

**Rationale**: The private constructor guarantees that every `Trip` instance in memory is valid. The `Result` return type forces callers to handle the error path at compile time.

### D2 — Zod 4 schema with branded type and cross-field refinement

**Decision**: The Zod schema uses `.brand<"Trip">()` to create a nominal type and `.refine()` to enforce `endDate >= startDate` at the schema level.

```typescript
const TripSchema = z
    .object({
        id: z.string().uuid(),
        title: z.string().min(1).max(120),
        description: z.string().max(2000).optional(),
        destination: z.string().min(1).max(200),
        coverImage: z.string().url().optional(),
        startDate: z.string().date(),
        endDate: z.string().date(),
        status: TripStatusSchema,
        currency: z.string().length(3),
        tags: z.array(z.string()).max(10).default([]),
        createdAt: z.string().datetime(),
        updatedAt: z.string().datetime(),
    })
    .refine((d) => d.endDate >= d.startDate, {
        path: ["endDate"],
        message: "endDate must be >= startDate",
    })
    .brand<"Trip">();
```

**Rationale**: The branded type prevents raw objects from being passed where a `Trip` is expected. The refinement enforces the core business rule at the model boundary.

### D3 — Separate `TripInputProps` and `TripProps` types

**Decision**: Two derived types:

- `TripProps` — full validated output (`z.infer<typeof TripSchema>`)
- `TripInputProps` — input to the factory (same fields but without brand, used in `create()`)

**Rationale**: Callers pass plain objects to `create()`; the branded type is only produced after successful validation. This avoids requiring callers to have a `Trip` to create a `Trip`.

### D4 — Computed properties as getters, not stored fields

**Decision**: `durationInDays`, `isActive`, `isPast`, `isDraft` are TypeScript getters on the class, not stored in the Zod schema.

```typescript
get durationInDays(): number {
    return DateTime.fromISO(this.props.endDate)
        .diff(DateTime.fromISO(this.props.startDate), "days").days + 1;
}
get isActive(): boolean { return this.props.status === "IN_PROGRESS"; }
get isPast(): boolean   { return this.props.status === "COMPLETED"; }
get isDraft(): boolean  { return this.props.status === "DRAFT"; }
```

**Rationale**: Computed properties belong to the domain, not to persistence. Keeping them as getters avoids derived-state drift.

### D5 — TripRepository interface returns `ResultAsync<T, WanderlustError>`

**Decision**: All repository methods return `ResultAsync` from neverthrow. The error type is `WanderlustError` (the base error from `@core`).

```typescript
export interface TripRepository {
    getAll(): ResultAsync<Trip[], WanderlustError>;
    getById(id: string): ResultAsync<Trip, WanderlustError>;
    create(props: TripInputProps): ResultAsync<Trip, WanderlustError>;
    update(
        id: string,
        props: Partial<TripInputProps>,
    ): ResultAsync<Trip, WanderlustError>;
    delete(id: string): ResultAsync<void, WanderlustError>;
}
```

**Rationale**: The domain only knows `WanderlustError`. Concrete errors (HTTP 404, DB constraint) are the data layer's responsibility — they map to `WanderlustError` subtypes before returning. This keeps the domain free of infrastructure concerns.

### D6 — Use cases are `@injectable` classes, one method each

**Decision**: Each use case is a class decorated with `@injectable()`, receives the repository via `@inject(TripTypes.TripRepository)` in its constructor, and exposes a single `execute(...)` method.

```typescript
@injectable()
export class TripCreateUseCase {
    constructor(
        @inject(TripTypes.TripRepository) private readonly repo: TripRepository,
    ) {}

    execute(props: TripInputProps): ResultAsync<Trip, WanderlustError> {
        return this.repo.create(props);
    }
}
```

**Rationale**: Consistent with the `core` module's ViewModel pattern. Single-method classes are trivially testable — inject a mock repository and call `execute()`.

### D7 — `TripTypes` sealed Symbol object, module DI registers use cases only

**Decision**: `trip-types.di.ts` defines `TripTypes` with symbols for `TripRepository` and all use cases. `trip-module.di.ts` registers only the use cases (transient). The repository binding is added in proposal 06 when the implementation exists.

**Rationale**: DI registration requires both interface and implementation. The repository implementation doesn't exist yet. Use cases can be registered now because they only depend on the `TripRepository` symbol, which will be bound before any resolution happens.

## Risks / Trade-offs

- **ZodError as factory error type**: The factory returns `Result<Trip, ZodError>` rather than a custom domain error. This couples the domain to Zod. Mitigation: acceptable trade-off — Zod is already a core dependency of the project, and `ZodError` contains precise field-level validation messages useful for form feedback.
- **Partial update type**: `update()` receives `Partial<TripInputProps>`. The repository implementation must handle deep-merge logic. Mitigation: documented in proposal 06.

## Open Questions

(none — scope is fully defined by the project plan)
