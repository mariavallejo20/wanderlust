# Scaffolding Overview — Engineering Decisions

> This document explains every configuration file in the Wanderlust monorepo scaffolding,
> why each one exists, and the architectural decisions behind the toolchain choices.
> The setup replicates enterprise-grade patterns validated in production.

---

## Table of Contents

1. [Monorepo Foundation](#1-monorepo-foundation)
2. [TypeScript Configuration](#2-typescript-configuration)
3. [Build Toolchain (Vite)](#3-build-toolchain-vite)
4. [Styling (Tailwind CSS 4 + Ant Design 6)](#4-styling-tailwind-css-4--ant-design-6)
5. [Code Quality (ESLint + Prettier + Stylelint)](#5-code-quality-eslint--prettier--stylelint)
6. [Git Workflow (Husky + Commitlint + Lint-staged)](#6-git-workflow-husky--commitlint--lint-staged)
7. [Dead Code Detection (Knip)](#7-dead-code-detection-knip)
8. [Frontend Source Files](#8-frontend-source-files)
9. [Module Directory Structure](#9-module-directory-structure)

---

## 1. Monorepo Foundation

### `.nvmrc`

```
22.21.0
```

**What**: Pins the exact Node.js version for all contributors.
**Why**: Ensures zero "works on my machine" issues. Any developer running `nvm use` automatically switches to the correct runtime. CI/CD can read this file to match the local environment.

---

### `.npmrc`

```ini
engine-strict=true
auto-install-peers=true
```

**What**: pnpm/npm configuration that enforces engine constraints.
**Why**:

- `engine-strict=true` — If someone tries to `pnpm install` with a wrong Node or pnpm version, it fails immediately instead of silently proceeding. This is a safety net that prevents subtle runtime incompatibilities.
- `auto-install-peers=true` — Automatically resolves peer dependency requirements. Without this, pnpm would warn or fail on unmet peers, requiring manual resolution for every dependency that declares peerDependencies.

---

### `.editorconfig`

**What**: Universal editor configuration (VS Code, IntelliJ, Vim, etc.).
**Why**: Before any linter runs, `.editorconfig` ensures that every editor produces the same baseline formatting: UTF-8 encoding, LF line endings, 2-space indentation, trimmed trailing whitespace. Makefile gets a tab override because `make` requires tabs syntactically. This eliminates an entire category of diff noise in pull requests.

---

### `pnpm-workspace.yaml`

```yaml
packages:
    - "apps/*"

catalogs:
    default:
        "@types/node": 25.0.3
        typescript: 5.9.3
        zod: 4.1.12
        dotenv: 17.2.3

onlyBuiltDependencies:
    - "@parcel/watcher"
    - "@swc/core"
    - esbuild
    - msw

blockExoticSubdeps: true
minimumReleaseAge: 1440
```

**What**: Declares this as a pnpm monorepo and configures workspace behavior.
**Why**:

- `packages: [apps/*]` — Tells pnpm that `apps/frontend` (and future `apps/backend`) are workspaces. Each workspace gets its own `package.json` and `node_modules`, but dependencies are hoisted to the root for deduplication.
- **Version catalogs** (`catalogs.default`) — Centralizes shared dependency versions. When both frontend and backend need TypeScript or Zod, they use `"catalog:"` in their `package.json` instead of hardcoding a version. This prevents version drift between workspaces — a common source of subtle bugs in monorepos.
- `onlyBuiltDependencies` — Whitelists packages that need native compilation (SWC, esbuild). pnpm blocks postinstall scripts by default for security; this explicitly allows only the ones we trust.
- `blockExoticSubdeps` — Prevents sub-dependencies from using git URLs or other non-registry sources. Supply chain security measure.
- `minimumReleaseAge: 1440` — Packages must be published for at least 24 hours before pnpm will install them. Protects against supply chain attacks where a compromised package is published and quickly consumed.

---

### Root `package.json`

**What**: The monorepo root package — orchestration scripts and shared devDependencies.
**Why**:

- `"private": true` — Prevents accidental publishing to npm.
- `"type": "module"` — All `.ts`/`.js` files use ESM imports (`import`/`export`) instead of CommonJS (`require`). Modern standard.
- `"packageManager": "pnpm@10.27.0"` — Corepack reads this to auto-install the exact pnpm version. No global pnpm install needed.
- **Scripts** — `pnpm dev` and `pnpm build` are root-level aliases that delegate to the frontend workspace via `--filter`. A developer never needs to `cd` into a workspace.
- **devDependencies** — Only tools that operate at the monorepo level live here: ESLint, Prettier, Husky, commitlint, Knip, lint-staged. Workspace-specific dependencies (React, Vite, etc.) live in `apps/frontend/package.json`.

---

### `.gitignore`

**What**: Standard ignore rules for a TypeScript monorepo.
**Why**: Prevents committing build artifacts (`dist/`, `*.tsbuildinfo`), dependencies (`node_modules/`), secrets (`.env`, `.env.keys`), IDE files (`.idea/`, `.vscode/*`), coverage reports, and OS files (`.DS_Store`). The `openspec/` exclusion keeps the specification artifacts from being linted by ESLint (they're markdown, not code).

---

## 2. TypeScript Configuration

### `tsconfig.base.json`

**What**: Shared TypeScript compiler options inherited by all workspaces.
**Why**:

- `target: ES2023` — Emits modern JavaScript. No need to transpile `async/await`, optional chaining, or nullish coalescing.
- `module: ESNext` + `moduleResolution: bundler` — Uses ESM modules and lets the bundler (Vite) handle resolution. The `bundler` resolution mode is specifically designed for tools like Vite/webpack that handle module resolution themselves.
- `strict: true` — Enables all strict type-checking flags (`noImplicitAny`, `strictNullChecks`, `strictFunctionTypes`, etc.). This is the single most impactful setting for catching bugs at compile time.
- `skipLibCheck: true` — Skips type-checking `.d.ts` files from `node_modules`. Dramatically speeds up compilation without sacrificing type safety in your own code.
- `isolatedModules: true` — Ensures every file can be transpiled independently (required by SWC/esbuild, which process files one at a time).
- `types: []` — Prevents TypeScript from auto-including `@types/*` packages globally. Each workspace explicitly declares which type packages it needs, avoiding type pollution.

---

### Root `tsconfig.json`

```json
{
    "files": [],
    "references": [{ "path": "./apps/frontend" }]
}
```

**What**: Project references configuration.
**Why**: `files: []` means the root doesn't compile anything itself. The `references` array tells TypeScript about workspace relationships, enabling incremental builds — when you change a file in one workspace, only that workspace recompiles.

---

### `apps/frontend/tsconfig.app.json`

**What**: Frontend-specific TypeScript configuration.
**Why**:

- `extends: ../../tsconfig.base.json` — Inherits all base options, only adds frontend-specific ones.
- `composite: true` — Required for project references. Enables incremental compilation.
- `jsx: react-jsx` — Uses React 17+ JSX transform (no need to `import React` in every file).
- `experimentalDecorators` + `emitDecoratorMetadata` — Required by Inversify (the DI container). Decorators like `@injectable()` and `@inject()` need these flags to generate the runtime metadata that Inversify reads to resolve dependencies.
- **Path aliases** (`@core/*`, `@trip/*`, etc.) — Transform deep relative imports (`../../../modules/core/domain/models/entity`) into clean absolute imports (`@core/domain/models/entity`). This makes imports readable and refactor-proof — moving a file doesn't break imports in other files.

---

## 3. Build Toolchain (Vite)

### Why 3 config files?

The Vite configuration is split into `vite.config.base.ts`, `vite.config.local.ts`, and `vite.config.prod.ts`, composed in `vite.config.ts` via `mergeConfig()`.

**Why not one file with conditionals?** Separation of concerns. The base config (plugins, build target) is always needed. The local config (dev server, checker overlay, proxy) is only for development. The prod config (future optimizations) is only for builds. This prevents dev-only plugins from being loaded during production builds and makes each file small and focused.

### `vite.config.base.ts`

**Plugins**:

- `@vitejs/plugin-react-swc` — Uses SWC (Rust-based compiler) instead of Babel for JSX transformation. 20-30x faster than Babel. `tsDecorators: true` enables the decorator syntax that Inversify requires.
- `vite-tsconfig-paths` — Resolves the TypeScript path aliases (`@core/*`, `@trip/*`) at runtime. Without this, Vite wouldn't know that `@core/domain/models/trip` maps to `src/modules/core/domain/models/trip`.
- `vite-plugin-svgr` — Allows importing SVG files as React components (`import { ReactComponent as Logo } from './logo.svg'`).
- `@tailwindcss/vite` — Tailwind CSS 4's official Vite integration. Processes CSS with Tailwind at build time.

**Build**: Target ES2023 to match the TypeScript target. SCSS uses the `modern-compiler` API (Dart Sass's new faster API).

### `vite.config.local.ts`

**What**: Dev-only configuration.
**Why**:

- `vite-plugin-checker` — Runs TypeScript, ESLint, and Stylelint checks in a separate worker thread and displays errors as a browser overlay. This gives instant feedback without blocking HMR. `initialIsOpen: "error"` means the overlay only opens for errors, not warnings.
- `usePolling: true` — Required for file watching in WSL2/Docker environments where native filesystem events are unreliable.
- `host: 0.0.0.0` — Makes the dev server accessible from other devices on the network (useful for mobile testing).
- `/api` proxy — Forwards API requests to the backend during development, avoiding CORS issues. The backend URL is configurable via environment variable.

### `vite.config.prod.ts`

**What**: Empty for now, returns `{}`.
**Why**: Placeholder for future production optimizations (code splitting strategies, chunk naming, compression). Having the file ready means adding optimizations later doesn't require restructuring the config.

### `vite.config.ts`

**What**: The entry point that composes the other configs.
**Why**: Uses Vite's `command` parameter (`serve` vs `build`) to merge the appropriate config with the base. Clean composition pattern.

---

## 4. Styling (Tailwind CSS 4 + Ant Design 6)

### `src/styles/tailwind.css`

```css
@import "tailwindcss" prefix(tw);
@import "./design-tokens.css";
```

**What**: The CSS entry point that loads Tailwind with a prefix.
**Why**: The `prefix(tw)` directive makes all Tailwind utility classes require a `tw:` prefix — `tw:flex`, `tw:p-4`, `tw:text-lg` instead of `flex`, `p-4`, `text-lg`. This is critical because Ant Design uses many of the same class names (`p-*`, `m-*`, `text-*`). Without the prefix, Tailwind would silently override Ant Design styles, causing layout bugs that are extremely hard to debug.

### `src/styles/design-tokens.css`

**What**: Centralized design tokens using Tailwind 4's `@theme` directive.
**Why**: Defines the visual language of the application — colors, typography, spacing, shadows — in a single file. These CSS custom properties are:

1. Available in Tailwind utility classes (`tw:text-primary`, `tw:bg-bg-layout`)
2. Available in any CSS via `var(--color-primary)`
3. Can be mapped to Ant Design's theme system via a TypeScript file (future task)

This "single source of truth" pattern means changing the primary color from `#007934` to another value automatically updates both Tailwind utilities and Ant Design components.

---

## 5. Code Quality (ESLint + Prettier + Stylelint)

### Root `eslint.config.ts`

**What**: ESLint 9 flat config with a shared `baseConfig` export.
**Why**:

- **Flat config** — ESLint 9's new configuration format replaces `.eslintrc.*`. It's a plain TypeScript array of config objects — more predictable, no cascading inheritance, easier to debug.
- **Exported `baseConfig`** — The frontend imports and extends this base config, adding React-specific rules. Any future workspace (backend) can do the same. This DRY pattern avoids duplicating 50+ lines of config per workspace.
- **typescript-eslint** — Enables type-aware linting rules that use the TypeScript compiler's understanding of your code. These catch bugs that basic ESLint can't (e.g., `await` on a non-Promise, unsafe `any` usage).
- **eslint-plugin-zod** — Zod-specific rules that catch common mistakes when writing validation schemas.
- **eslint-config-prettier** — Disables all ESLint rules that conflict with Prettier. Without this, ESLint and Prettier would fight over formatting.
- `@typescript-eslint/no-unused-vars` with `_` pattern — Variables prefixed with `_` are allowed to be unused. Convention for intentionally ignored parameters (e.g., `(_event) => ...`).

### `apps/frontend/eslint.config.ts`

**What**: Frontend-specific ESLint config.
**Why**:

- Imports `baseConfig` from root and adds React-specific rules.
- `eslint-plugin-react-hooks` — Enforces the Rules of Hooks (no conditional hooks, correct dependency arrays in `useEffect`). These rules prevent an entire category of React bugs.
- `projectService: true` — Enables type-aware linting by connecting ESLint to the TypeScript project service. This is what makes rules like "no unsafe any" possible.
- `no-console: warn` — Console statements are warnings, not errors. Useful during development but flagged for cleanup before merge.

### `.prettierrc.json`

**What**: Code formatter configuration.
**Why**:

- `tabWidth: 4` — 4-space indentation for better readability in deeply nested JSX.
- `singleAttributePerLine: true` — Each JSX attribute gets its own line. This makes diffs cleaner — adding/removing a prop shows exactly one line changed.
- `prettier-plugin-organize-imports` — Auto-sorts imports alphabetically and removes unused ones on every save/format. Eliminates import ordering debates in code review.
- `.nvmrc` override — Tells Prettier to parse `.nvmrc` as YAML (it's just a version number, but Prettier needs to know the format).

### `apps/frontend/stylelint.config.cjs`

**What**: CSS/SCSS linter configuration.
**Why**:

- Uses CommonJS (`.cjs`) because Stylelint doesn't fully support ESM config yet.
- **Tailwind-aware rules** — Without these, Stylelint would report `@tailwind`, `@apply`, `@reference`, and `@theme` as unknown at-rules. The config tells Stylelint to recognize these Tailwind-specific directives.
- `stylelint-config-prettier-scss` — Same pattern as ESLint: disables rules that conflict with Prettier.

---

## 6. Git Workflow (Husky + Commitlint + Lint-staged)

### `.husky/pre-commit`

**What**: Runs before every `git commit`.
**Why**:

- `NODE_OPTIONS="--experimental-strip-types"` — Allows running `.ts` config files directly without compilation. Node 22+ supports this natively.
- `validate-branch-name` — Enforces the naming convention (`feature/*`, `bugfix/*`, `hotfix/*`, etc.). Prevents commits on random branch names like `my-stuff` or `test123`.
- `lint-staged` — Only runs linters on staged files (not the entire codebase). A commit that touches 3 files runs Prettier and ESLint on only those 3 files — fast feedback loop.

### `.husky/commit-msg`

**What**: Runs after the commit message is written, before the commit is finalized.
**Why**: `commitlint` validates that the message follows [Conventional Commits](https://www.conventionalcommits.org/) format: `type(scope): description`. Examples: `feat: add trip creation form`, `fix: resolve date validation bug`, `chore: update dependencies`. This enables automated changelog generation and semantic versioning.

### `commitlint.config.ts`

**What**: Extends the standard conventional commits ruleset.
**Why**: Enforces types like `feat`, `fix`, `chore`, `refactor`, `docs`, `test`, `ci`. Rejects messages like "updated stuff" or "wip". This creates a clean, machine-readable git history.

### `validate-branch-name.config.ts`

**What**: Regex pattern for allowed branch names.
**Why**: The pattern `^(feature|bugfix|fix|hotfix|release)/.+$` ensures all feature branches follow a consistent naming scheme. Combined with commit conventions, this makes the git log self-documenting.

### `lint-staged.config.ts`

**What**: Defines which linters run on which staged file types.
**Why**:

- `*` → Prettier — Every file gets formatted.
- `*.{ts,tsx}` → ESLint with auto-fix — TypeScript files get linted and auto-fixed.
- `**/*.{ts,tsx}` → Knip — Runs dead code detection to catch unused exports before they're committed.
- `--max-warnings 60` / `--max-issues 150` — Tolerance thresholds. During active development, some warnings are expected. These thresholds prevent the codebase from degrading while allowing incremental progress.

---

## 7. Dead Code Detection (Knip)

### `knip.config.ts`

**What**: Configuration for Knip, a tool that detects unused dependencies, exports, and files.
**Why**:

- Entry point `src/main.tsx` tells Knip where to start tracing the dependency graph.
- `ignoreDependencies` lists packages that are used via config files or build plugins, not via direct imports. Knip can't detect these automatically (e.g., `@tailwindcss/vite` is used in `vite.config.ts`, not in source code).
- Running Knip in lint-staged catches dead code early — before unused exports accumulate into tech debt.

---

## 8. Frontend Source Files

### `apps/frontend/index.html`

**What**: The single HTML file for the SPA.
**Why**: Vite uses `index.html` as the entry point (unlike webpack which uses a JS file). The `<script type="module" src="src/main.tsx">` tells the browser to load the app as an ES module. The `<div id="root">` is where React mounts.

### `apps/frontend/src/main.tsx`

**What**: React entry point.
**Why**: Creates the React root, wraps the app in `StrictMode` (catches common bugs during development), and imports the Tailwind CSS entry point. This is the minimal bootstrap — all routing, providers, and DI will be added in subsequent proposals.

### `apps/frontend/src/App.tsx`

**What**: Placeholder root component.
**Why**: Renders "Wanderlust" centered on screen using Tailwind `tw:` prefix classes. This validates that React, Vite, and Tailwind are all wired up correctly. It will be replaced with the actual layout (header, sidebar, router outlet) in proposal 03.

### `apps/frontend/src/vite-env.d.ts`

**What**: TypeScript ambient declaration for Vite.
**Why**: The triple-slash reference `/// <reference types="vite/client" />` tells TypeScript about Vite-specific types: `import.meta.env` (environment variables), asset imports (`.svg`, `.png`), and CSS module types. Without this, TypeScript would error on `import logo from './logo.svg'`.

### `apps/frontend/.env.example`

**What**: Template for environment variables.
**Why**: Documents every `VITE_*` variable the app expects. A new developer copies this to `.env` and has a working local setup immediately. The `VITE_` prefix is required by Vite — only prefixed variables are exposed to client code (security measure to prevent leaking server secrets).

---

## 9. Module Directory Structure

```
src/modules/{core,trip,itinerary,activity,budget,map-view,share,dashboard,analytics}/
    ├── domain/        # Business logic, models, repository interfaces
    ├── data/          # API calls, DTOs, mappers, repository implementations
    └── presentation/  # React components, pages, view models, stores
```

**What**: Empty directories with `.gitkeep` for 9 feature modules.
**Why**: This is the **Clean Architecture** pattern applied to a frontend application:

- **Domain layer** — Pure business logic. No React, no HTTP, no UI. Contains entity models (validated with Zod), repository interfaces (contracts), and use cases (application logic). This layer has zero external dependencies.
- **Data layer** — Implements the domain interfaces. Contains datasources (HTTP calls), DTOs (API response shapes), mappers (DTO → domain model conversion), and repository implementations. Swapping MSW mocks for a real API only changes this layer.
- **Presentation layer** — React components, pages, MobX stores, and ViewModels. Consumes domain use cases through dependency injection. Components are "dumb" — they observe state and render, all logic lives in ViewModels.

The `.gitkeep` files exist because Git doesn't track empty directories. They'll be removed as actual code is added in subsequent proposals.

Additional directories:

- `src/di/` — Inversify dependency injection container configuration
- `src/@types/` — Auto-generated TypeScript types (e.g., i18n resource types)
- `tests/msw/handlers/` — Mock Service Worker API handlers for testing
- `tests/utils/` — Shared test utilities and custom matchers

---

## Architecture Summary

```
Developer commits code
    → Husky pre-commit hook fires
        → validate-branch-name (branch naming convention)
        → lint-staged (only staged files)
            → Prettier (formatting)
            → ESLint (code quality + type-aware rules)
            → Knip (dead code detection)
    → Husky commit-msg hook fires
        → commitlint (conventional commit format)
    → Commit succeeds ✓

Developer runs `pnpm dev`
    → Vite dev server starts (base + local config merged)
        → SWC compiles TypeScript + JSX (fast)
        → Tailwind CSS processes styles (tw: prefix)
        → vite-plugin-checker runs TS + ESLint + Stylelint in background
        → Browser overlay shows errors in real-time
        → /api requests proxied to backend

Developer runs `pnpm build`
    → TypeScript type-checks (tsc --noEmit)
    → Vite builds (base + prod config merged)
        → ES2023 target, tree-shaking, code splitting
        → Output in dist/
```

This toolchain ensures that no broken code, unformatted files, or non-conventional commits enter the repository. Quality is enforced automatically, not by code review.
