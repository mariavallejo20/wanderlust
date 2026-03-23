## ADDED Requirements

### Requirement: Monorepo pnpm workspaces

The project SHALL be structured as a pnpm monorepo with workspaces for `apps/frontend` and future `apps/backend`. Version catalogs SHALL centralize shared dependency versions (TypeScript, Zod, @types/node) in `pnpm-workspace.yaml`.

#### Scenario: Fresh install succeeds

- **WHEN** a developer clones the repository and runs `pnpm install`
- **THEN** all dependencies install without errors and `node_modules` is created in root and `apps/frontend/`

#### Scenario: Version catalogs resolve correctly

- **WHEN** `apps/frontend/package.json` uses `"catalog:"` for a dependency version
- **THEN** pnpm resolves it to the version defined in `pnpm-workspace.yaml` catalogs.default

#### Scenario: pnpm is enforced as package manager

- **WHEN** a developer attempts to use npm or yarn to install dependencies
- **THEN** the operation fails due to `engine-strict=true` in `.npmrc` and `packageManager` field in root `package.json`

---

### Requirement: TypeScript strict compilation

TypeScript SHALL be configured with strict mode, ES2023 target, ESNext module, bundler module resolution, experimental decorators, and decorator metadata emission. The project SHALL use a base tsconfig at root level extended by workspace-specific configs.

#### Scenario: TypeScript compiles the scaffolded code without errors

- **WHEN** a developer runs `tsc --noEmit` in `apps/frontend/`
- **THEN** TypeScript compiles with zero errors and zero warnings

#### Scenario: Decorators are supported

- **WHEN** a TypeScript file uses `@injectable()` or `@inject()` decorators
- **THEN** TypeScript compiles the file without errors (experimentalDecorators + emitDecoratorMetadata enabled)

#### Scenario: Path aliases resolve in TypeScript

- **WHEN** a file imports from `@core/domain/models/example`
- **THEN** TypeScript resolves it to `src/modules/core/domain/models/example` without errors

---

### Requirement: Vite dev server and build

The frontend SHALL use Vite 7 with SWC for compilation. The dev server SHALL start with hot module replacement, TypeScript/ESLint/Stylelint checking overlay, and API proxy. Production build SHALL generate optimized static assets.

#### Scenario: Dev server starts successfully

- **WHEN** a developer runs `pnpm dev` (or `pnpm web:dev`)
- **THEN** Vite dev server starts on `0.0.0.0` with HMR enabled and the page renders the placeholder App component

#### Scenario: Production build succeeds

- **WHEN** a developer runs `pnpm build` (or `pnpm web:build`)
- **THEN** Vite produces a production bundle in `apps/frontend/dist/` with zero errors

#### Scenario: Checker overlay shows errors in dev

- **WHEN** a TypeScript error or ESLint violation is introduced while the dev server is running
- **THEN** the vite-plugin-checker overlay displays the error in the browser (initialIsOpen: "error")

#### Scenario: API proxy routes requests in dev

- **WHEN** the frontend makes a request to `/api/*` during development
- **THEN** Vite proxies the request to the configured backend URL (default `http://localhost:3000`)

---

### Requirement: Tailwind CSS 4 with prefix

Tailwind CSS 4 SHALL be configured with the `tw:` prefix to avoid class name collisions with Ant Design. Design tokens SHALL be defined as CSS custom properties in `design-tokens.css` using `@theme`.

#### Scenario: Tailwind utility classes render with prefix

- **WHEN** a component uses `className="tw:p-4 tw:flex tw:gap-2"`
- **THEN** the corresponding CSS utility styles are applied correctly

#### Scenario: Design tokens are available as CSS custom properties

- **WHEN** a CSS or component file references `var(--color-primary)` or `var(--font-size-base)`
- **THEN** the value resolves to the token defined in `design-tokens.css`

#### Scenario: Tailwind does not collide with Ant Design classes

- **WHEN** Ant Design components and Tailwind utilities are used in the same component
- **THEN** styles do not conflict because Tailwind classes require the `tw:` prefix

---

### Requirement: ESLint 9 flat config

ESLint SHALL use version 9 with flat config format (`eslint.config.ts`). A base config at root level SHALL be imported by workspace-specific configs. The frontend config SHALL include typescript-eslint with type-aware linting, React Hooks rules, and Zod plugin.

#### Scenario: ESLint passes on scaffolded code

- **WHEN** a developer runs `pnpm lint:eslint`
- **THEN** ESLint reports zero errors and zero warnings on the scaffolded code

#### Scenario: ESLint catches unused variables

- **WHEN** a TypeScript file declares an unused variable (not prefixed with `_`)
- **THEN** ESLint reports an `@typescript-eslint/no-unused-vars` error

#### Scenario: ESLint ignores generated and config files

- **WHEN** ESLint runs on the project
- **THEN** it ignores `node_modules`, `dist`, `coverage`, `.storybook`, `storybook-static`, `openspec`, and other non-source directories

---

### Requirement: Prettier code formatting

Prettier SHALL be configured with tab width 4, single attribute per line, and the `prettier-plugin-organize-imports` plugin for automatic import sorting.

#### Scenario: Prettier formats all source files consistently

- **WHEN** a developer runs `pnpm lint:prettier`
- **THEN** all source files pass the formatting check without differences

#### Scenario: Imports are automatically organized

- **WHEN** Prettier formats a TypeScript file with unordered imports
- **THEN** the imports are sorted and organized by the `prettier-plugin-organize-imports` plugin

---

### Requirement: Stylelint for CSS/SCSS

Stylelint SHALL be configured with standard rules, SCSS support, and Tailwind-aware rules that recognize `@tailwind`, `@apply`, `@reference`, and `@theme` directives.

#### Scenario: Stylelint passes on Tailwind CSS files

- **WHEN** a developer runs `pnpm lint:stylelint` on `tailwind.css` and `design-tokens.css`
- **THEN** Stylelint reports zero errors (Tailwind directives are not flagged as unknown)

#### Scenario: Stylelint catches invalid CSS

- **WHEN** a CSS file contains an invalid property or value
- **THEN** Stylelint reports the error

---

### Requirement: Git hooks with Husky

Husky SHALL configure two git hooks: `pre-commit` (runs validate-branch-name and lint-staged) and `commit-msg` (runs commitlint). Lint-staged SHALL run Prettier, ESLint, and Knip on staged files only.

#### Scenario: Pre-commit hook validates branch name

- **WHEN** a developer attempts to commit on a branch named `my-branch` (not matching the pattern)
- **THEN** the pre-commit hook rejects the commit with an error message about branch naming

#### Scenario: Pre-commit hook accepts valid branch names

- **WHEN** a developer commits on a branch named `feature/01-scaffolding`
- **THEN** the pre-commit hook accepts the branch name and proceeds to lint-staged

#### Scenario: Lint-staged runs on staged files

- **WHEN** a developer commits with staged files that have formatting issues
- **THEN** lint-staged auto-fixes formatting via Prettier and reports ESLint errors if any

#### Scenario: Commit message must follow conventional commits

- **WHEN** a developer creates a commit with message `updated stuff`
- **THEN** commitlint rejects the commit because it does not follow conventional commit format

#### Scenario: Valid conventional commit is accepted

- **WHEN** a developer creates a commit with message `chore: configure eslint flat config #1`
- **THEN** commitlint accepts the commit message

---

### Requirement: Knip dead code detection

Knip SHALL be configured to detect unused dependencies, exports, and files in the frontend workspace.

#### Scenario: Knip passes on scaffolded project

- **WHEN** a developer runs `pnpm lint:knip`
- **THEN** Knip reports zero issues (or within the configured max-issues threshold)

---

### Requirement: Module directory structure

The frontend SHALL have a predefined directory structure with empty module directories for all planned modules (core, trip, itinerary, activity, budget, map-view, share, dashboard, analytics). Each module SHALL have subdirectories for domain, data, and presentation layers.

#### Scenario: All module directories exist

- **WHEN** a developer lists `src/modules/`
- **THEN** directories exist for: core, trip, itinerary, activity, budget, map-view, share, dashboard, analytics

#### Scenario: Each module has clean architecture layers

- **WHEN** a developer lists any module directory (e.g., `src/modules/trip/`)
- **THEN** subdirectories exist for: domain, data, presentation

---

### Requirement: Environment variables configuration

The frontend SHALL have a `.env.example` file documenting all expected environment variables with sensible defaults for local development.

#### Scenario: .env.example contains all required variables

- **WHEN** a developer copies `.env.example` to `.env`
- **THEN** the application starts with the default values (VITE_API_BASE_URL, VITE_USE_MSW, VITE_APP_STAGE)

---

### Requirement: Root scripts orchestration

The root `package.json` SHALL provide scripts to orchestrate common operations across workspaces: `dev`, `build`, lint commands, and workspace-specific shortcuts.

#### Scenario: pnpm dev starts the frontend

- **WHEN** a developer runs `pnpm dev` from the repository root
- **THEN** the frontend dev server starts via the `web:dev` script

#### Scenario: pnpm build builds the frontend

- **WHEN** a developer runs `pnpm build` from the repository root
- **THEN** the frontend production build completes via `web:build`

#### Scenario: Lint scripts run all linters

- **WHEN** a developer runs `pnpm lint:eslint`, `pnpm lint:prettier`, or `pnpm lint:knip`
- **THEN** the corresponding linter executes across the project and reports results
