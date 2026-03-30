## ADDED Requirements

### Requirement: ESLint rules for test files

The ESLint flat config SHALL include `eslint-plugin-vitest` rules scoped to test files (`*.test.*`, `*.integration.*`, `*.browser.*`). The rules SHALL enforce: no skipped tests (`vitest/no-skipped-tests`), every test has at least one assertion (`vitest/expect-expect`), and follow Vitest's recommended ruleset.

#### Scenario: ESLint catches a skipped test

- **WHEN** a test file contains `it.skip(...)` or `describe.skip(...)`
- **THEN** ESLint reports a `vitest/no-skipped-tests` warning

#### Scenario: ESLint catches a test with no assertions

- **WHEN** a test file contains a test body with no `expect()` call
- **THEN** ESLint reports a `vitest/expect-expect` error

#### Scenario: Vitest rules only apply to test files

- **WHEN** ESLint runs on a non-test TypeScript file (e.g., `*.model.ts`)
- **THEN** Vitest plugin rules do not apply and no false positives are reported

---

### Requirement: Knip aware of test and story entry points

The Knip configuration SHALL include Vitest setup files and Storybook config files as entry points so test utilities, custom matchers, and story decorators are not flagged as unused exports or dead code.

#### Scenario: Knip passes after proposal 04 is implemented

- **WHEN** a developer runs `pnpm lint:knip`
- **THEN** Knip reports zero issues related to test utilities, MSW handlers, or Storybook configuration

#### Scenario: Knip ignoreDependencies covers new devDependencies

- **WHEN** Knip analyses `apps/frontend/package.json`
- **THEN** `msw`, Storybook addons, and `eslint-plugin-vitest` are not flagged as unused dependencies
