## ADDED Requirements

### Requirement: toBeOk and toBeErr custom matchers

The project SHALL provide `toBeOk` and `toBeErr` Vitest custom matchers for asserting on neverthrow `Result<T, E>` values. Both matchers SHALL be typed via a `vitest` module augmentation and SHALL produce descriptive failure messages that include the actual value or error.

#### Scenario: toBeOk passes for an Ok result

- **WHEN** `expect(ok("value")).toBeOk()` is called
- **THEN** the assertion passes without error

#### Scenario: toBeOk fails with descriptive message for an Err result

- **WHEN** `expect(err("something went wrong")).toBeOk()` is called
- **THEN** the assertion fails and the error message includes the error value (`"something went wrong"`)

#### Scenario: toBeErr passes for an Err result

- **WHEN** `expect(err({ code: 404 })).toBeErr()` is called
- **THEN** the assertion passes without error

#### Scenario: toBeErr fails with descriptive message for an Ok result

- **WHEN** `expect(ok({ id: 1 })).toBeErr()` is called
- **THEN** the assertion fails and the error message includes the ok value (`{ id: 1 }`)

#### Scenario: Custom matchers are TypeScript-typed

- **WHEN** TypeScript checks `expect(result).toBeOk()` where `result` is `Result<T, E>`
- **THEN** TypeScript compiles without error (no `TS2339: Property 'toBeOk' does not exist`)

---

### Requirement: renderWithProviders test helper

The project SHALL provide a `renderWithProviders` function at `src/tests/utils/render-with-providers.tsx` that wraps `@testing-library/react`'s `render` with the full Wanderlust provider tree: `I18nextProvider`, `AntConfigProvider`, and `MemoryRouter`. It SHALL accept all standard `RenderOptions` and forward them to the underlying `render` call.

#### Scenario: Component renders with i18n available

- **WHEN** `renderWithProviders(<MyComponent />)` is called in an integration test and `MyComponent` calls `useTranslation`
- **THEN** the component renders without throwing and translated strings are resolved using the shared i18n instance

#### Scenario: Component renders with Ant Design theme

- **WHEN** `renderWithProviders(<WlButton>Save</WlButton>)` is called
- **THEN** the button renders with the Wanderlust antd theme applied (no `ConfigProvider` error)

#### Scenario: Component renders with router context

- **WHEN** `renderWithProviders(<Link to="/trips">Go</Link>)` is called
- **THEN** the `Link` renders without throwing a "You should not use Link outside a Router" error

#### Scenario: Custom render options are forwarded

- **WHEN** `renderWithProviders(<MyComponent />, { container: customContainer })` is called
- **THEN** the component is rendered into the provided custom container

---

### Requirement: Re-exported testing-library helpers

The `src/tests/utils/` directory SHALL re-export `screen`, `fireEvent`, `waitFor`, `within`, and `userEvent` from `@testing-library/react` and `@testing-library/user-event` so integration tests import from a single path.

#### Scenario: Integration tests import from shared utils

- **WHEN** a test file imports `{ screen, waitFor }` from `@tests/utils`
- **THEN** these resolve to the standard testing-library utilities without needing separate imports

---

### Requirement: @tests path alias

The `src/tests/` directory SHALL be accessible via the `@tests/*` path alias in `tsconfig.app.json` and `vite.config.base.ts`. Test files SHALL use this alias instead of relative paths when importing from the shared utilities directory.

#### Scenario: @tests alias resolves in test files

- **WHEN** a test file imports from `@tests/utils/render-with-providers`
- **THEN** TypeScript and Vitest both resolve the import correctly without relative path traversal
