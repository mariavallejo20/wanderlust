## Context

The Wanderlust repository only contains a `README.md` on the `develop` branch. No configuration files, dependencies, or code structure exist. This design defines exactly which files to create, with what content and versions.

The project uses Node 22.21.0, pnpm 10.27.0, and a monorepo with `apps/frontend/` + `apps/backend/` (later phase).

## Goals / Non-Goals

**Goals:**

- Working monorepo: `pnpm install` + `pnpm dev` starts the frontend without errors
- TypeScript compiles without errors with strict + decorators
- ESLint, Prettier, and Stylelint run without warnings on the scaffolded code
- Husky intercepts commits: validates branch name, runs lint-staged, validates conventional commits
- Tailwind CSS 4 with prefix `tw:` renders correctly
- Directory structure ready for proposals 02–04 to start directly
- `pnpm build` generates a valid production bundle

**Non-Goals:**

- Functional code in any module (domain, data, presentation) — only empty directories with `.gitkeep`
- Inversify container, Http factory, or any core infrastructure (proposal 02)
- i18n, routing, or layout (proposal 03)
- MSW, Storybook, or Vitest configuration (proposal 04)
- Tests of any kind
- Backend (`apps/backend/`) — proposal 20

## Decisions

### D1 — Monorepo structure: pnpm workspaces without Nx

**Decision**: Use native pnpm workspaces, without Nx or Turborepo.

**Alternatives considered**:

- Nx: Overkill for a project with 2 workspaces. Adds configuration complexity (nx.json, project.json) and heavy dependency.
- Turborepo: Similar to Nx in overhead. Adds no value with just one frontend.

**Rationale**: pnpm workspaces with version catalogs covers all needs (dependency hoisting, shared versions, script orchestration with `--filter`).

### D2 — Version catalogs in pnpm-workspace.yaml

**Decision**: Centralise shared versions across workspaces using `catalogs.default` in `pnpm-workspace.yaml`.

```yaml
catalogs:
    default:
        "@types/node": 25.0.3
        dotenv: 17.2.3
        typescript: 5.9.3
        zod: 4.1.12
```

**Rationale**: Prevents version drift between `apps/frontend` and future `apps/backend`. Packages use `"catalog:"` in their `package.json`.

### D3 — Vite config split into 3 files

**Decision**: Split Vite configuration into `vite.config.base.ts` (shared plugins), `vite.config.local.ts` (dev server, checker, proxy), and `vite.config.prod.ts` (build optimisations). `vite.config.ts` composes them with `mergeConfig`.

**Alternatives considered**:

- Single `vite.config.ts` with conditionals: Works but becomes hard to maintain with the checker plugin, proxy config, and future plugins.

**Rationale**: Clear separation of concerns. The checker plugin (TypeScript + ESLint + Stylelint overlay) only activates in dev, not in build.

### D4 — Tailwind CSS 4 with prefix `tw:`

**Decision**: Use Tailwind CSS 4 with `@import "tailwindcss" prefix(tw)` to avoid collisions with Ant Design classes.

```css
@import "tailwindcss";
@import "tailwindcss" prefix(tw);
@import "tailwindcss" important;
@import "./design-tokens.css";
```

**Alternatives considered**:

- No prefix: Risk of collision between Tailwind utilities and Ant Design classes (both use `p-*`, `m-*`, `text-*`).

**Rationale**: The `tw:` prefix avoids collisions and makes it clear in JSX which classes are Tailwind vs. others.

### D5 — Design tokens as CSS custom properties

**Decision**: Define design tokens in `design-tokens.css` using Tailwind 4's `@theme`, and also export them as TS constants in `design-tokens.ts` for programmatic use (Ant Design ConfigProvider).

**Rationale**: Single source of truth for colours, typography, spacing. Ant Design consumes tokens via TS, Tailwind consumes them via CSS.

### D6 — ESLint 9 flat config with typescript-eslint type-aware

**Decision**: ESLint 9 with flat config (`eslint.config.ts`). Base config at root (inherited by all workspaces) + specific config in `apps/frontend/eslint.config.ts` adding React Hooks and type-aware rules.

**Plugins**:

- `@eslint/js` — recommended base rules
- `typescript-eslint` — type-aware linting with `projectService: true`
- `eslint-config-prettier` — disables rules that conflict with Prettier
- `eslint-plugin-zod` — rules for Zod schemas
- `eslint-plugin-react-hooks` — hooks rules

**Rationale**: The `--flag v10_config_lookup_from_file` is needed for ESLint 9 to look up config from the file, not from the CWD.

### D7 — Husky + lint-staged + validate-branch-name

**Decision**: Pre-commit hook runs `validate-branch-name` (enforces `feature|bugfix|fix|hotfix|release/*` pattern) + `lint-staged` (Prettier + ESLint + Knip on staged files). Commit-msg hook runs `commitlint` (conventional commits).

```bash
# .husky/pre-commit
export NODE_OPTIONS="--experimental-strip-types"
validate-branch-name
lint-staged --config lint-staged.config.ts
```

**Rationale**: Catch issues before they reach the repo. `--experimental-strip-types` allows executing `.ts` config files without compilation.

### D8 — Path aliases with tsconfig paths

**Decision**: Define path aliases in `tsconfig.app.json` and resolve in Vite via `vite-tsconfig-paths`.

```json
{
    "paths": {
        "@di/*": ["src/di/*"],
        "@wanderlust/*": ["src/*"],
        "@tests/*": ["tests/*"],
        "@core/*": ["src/modules/core/*"],
        "@trip/*": ["src/modules/trip/*"],
        "@itinerary/*": ["src/modules/itinerary/*"],
        "@activity/*": ["src/modules/activity/*"],
        "@budget/*": ["src/modules/budget/*"],
        "@map-view/*": ["src/modules/map-view/*"],
        "@share/*": ["src/modules/share/*"],
        "@dashboard/*": ["src/modules/dashboard/*"],
        "@analytics/*": ["src/modules/analytics/*"]
    }
}
```

**Rationale**: Clean imports (`@trip/domain/models/trip.model` vs `../../../modules/trip/domain/models/trip.model`). Aliases resolve in both TypeScript and Vite (runtime).

## Exact Dependency Versions

### Root `package.json` devDependencies

| Package                            | Version |
| ---------------------------------- | ------- |
| `@commitlint/cli`                  | 20.2.0  |
| `@commitlint/config-conventional`  | 20.2.0  |
| `@eslint/js`                       | 9.39.3  |
| `concurrently`                     | 9.2.1   |
| `eslint`                           | 9.39.3  |
| `eslint-config-prettier`           | 10.1.8  |
| `eslint-plugin-zod`                | 3.5.0   |
| `husky`                            | 9.1.7   |
| `knip`                             | 5.76.3  |
| `lint-staged`                      | 16.2.7  |
| `prettier`                         | 3.7.4   |
| `prettier-plugin-organize-imports` | 4.3.0   |
| `typescript-eslint`                | 8.50.0  |
| `validate-branch-name`             | 1.3.2   |

### Frontend `package.json` dependencies

| Package                            | Version  |
| ---------------------------------- | -------- |
| `@ant-design/icons`                | 6.1.0    |
| `antd`                             | 6.1.4    |
| `axios`                            | 1.13.2   |
| `es-toolkit`                       | 1.43.0   |
| `inversify`                        | 7.10.8   |
| `luxon`                            | 3.7.2    |
| `mobx`                             | 6.15.0   |
| `mobx-react`                       | 9.2.1    |
| `neverthrow`                       | 8.2.0    |
| `query-string`                     | 9.3.1    |
| `react`                            | 19.2.4   |
| `react-dom`                        | 19.2.4   |
| `react-hook-form`                  | 7.69.0   |
| `@hookform/resolvers`              | 5.2.2    |
| `react-router`                     | 7.11.0   |
| `reflect-metadata`                 | 0.2.2    |
| `rxjs`                             | 7.8.2    |
| `zod`                              | catalog: |
| `i18next`                          | 25.7.3   |
| `react-i18next`                    | 16.5.0   |
| `i18next-browser-languagedetector` | 8.2.0    |
| `i18next-http-backend`             | 3.0.2    |

### Frontend `package.json` devDependencies

| Package                          | Version  |
| -------------------------------- | -------- |
| `@tailwindcss/vite`              | 4.1.18   |
| `@types/node`                    | catalog: |
| `@types/react`                   | 19.2.14  |
| `@types/react-dom`               | 19.2.3   |
| `@types/luxon`                   | 3.7.1    |
| `@vitejs/plugin-react-swc`       | 4.2.3    |
| `@total-typescript/ts-reset`     | 0.6.1    |
| `eslint-plugin-react-hooks`      | 6.1.0    |
| `globals`                        | 16.5.0   |
| `sass`                           | 1.96.0   |
| `stylelint`                      | 16.26.1  |
| `stylelint-config-standard`      | 39.0.1   |
| `stylelint-config-standard-scss` | 16.0.0   |
| `stylelint-config-prettier-scss` | 1.0.0    |
| `stylelint-scss`                 | 6.13.0   |
| `tailwindcss`                    | 4.1.18   |
| `typescript`                     | catalog: |
| `vite`                           | 7.3.1    |
| `vite-plugin-checker`            | 0.12.0   |
| `vite-plugin-svgr`               | 4.5.0    |
| `vite-tsconfig-paths`            | 6.0.5    |

## Files to Create (complete list)

### Monorepo root

| File                             | Key content                                                   |
| -------------------------------- | ------------------------------------------------------------- |
| `pnpm-workspace.yaml`            | packages: `apps/*`, catalogs, allowBuilds, blockExoticSubdeps |
| `package.json`                   | name `@wanderlust/workspace`, root scripts, devDependencies   |
| `tsconfig.base.json`             | ES2023, ESNext, bundler, strict, skipLibCheck                 |
| `tsconfig.json`                  | References to `apps/frontend`                                 |
| `eslint.config.ts`               | Exported base config + default config                         |
| `.prettierrc.json`               | tabWidth 4, singleAttributePerLine, organize-imports plugin   |
| `commitlint.config.ts`           | Extends `@commitlint/config-conventional`                     |
| `lint-staged.config.ts`          | Prettier + ESLint + Knip                                      |
| `validate-branch-name.config.ts` | Branch pattern                                                |
| `knip.config.ts`                 | Frontend workspace with entry/project                         |
| `.husky/pre-commit`              | validate-branch-name + lint-staged                            |
| `.husky/commit-msg`              | commitlint --edit                                             |
| `.nvmrc`                         | `22.21.0`                                                     |
| `.npmrc`                         | engine-strict, auto-install-peers                             |
| `.editorconfig`                  | UTF-8, LF, indent 2 spaces, trim trailing                     |
| `.gitignore`                     | node_modules, dist, .env, coverage, storybook-static, etc.    |

### `apps/frontend/`

| File                   | Key content                                                 |
| ---------------------- | ----------------------------------------------------------- |
| `package.json`         | name `@wanderlust/frontend`, dependencies + devDependencies |
| `tsconfig.app.json`    | Extends base, jsx react-jsx, decorators, path aliases       |
| `vite.config.ts`       | Compose base + local/prod                                   |
| `vite.config.base.ts`  | Plugins: react-swc, tsconfigPaths, svgr, tailwindcss        |
| `vite.config.local.ts` | Checker (TS+ESLint+Stylelint), dev server, proxy            |
| `vite.config.prod.ts`  | (empty, extensible)                                         |
| `eslint.config.ts`     | Imports baseConfig, adds React Hooks, type-aware            |
| `stylelint.config.cjs` | SCSS + Tailwind rules                                       |
| `index.html`           | div#root, script module src/main.tsx                        |
| `.env.example`         | VITE_API_BASE_URL, VITE_USE_MSW, VITE_APP_STAGE             |

### `apps/frontend/src/`

| File                       | Content                                             |
| -------------------------- | --------------------------------------------------- |
| `main.tsx`                 | createRoot + StrictMode + placeholder App           |
| `App.tsx`                  | Minimal component with placeholder text             |
| `vite-env.d.ts`            | Triple-slash reference vite/client                  |
| `styles/tailwind.css`      | Tailwind imports with prefix tw, design-tokens      |
| `styles/design-tokens.css` | @theme with colours, fonts, spacing, radii, shadows |

### Empty directories (with `.gitkeep`)

```
src/di/
src/@types/
src/modules/core/domain/
src/modules/core/data/
src/modules/core/presentation/
src/modules/trip/domain/
src/modules/trip/data/
src/modules/trip/presentation/
src/modules/itinerary/domain/
src/modules/itinerary/data/
src/modules/itinerary/presentation/
src/modules/activity/domain/
src/modules/activity/data/
src/modules/activity/presentation/
src/modules/budget/domain/
src/modules/budget/data/
src/modules/budget/presentation/
src/modules/map-view/domain/
src/modules/map-view/data/
src/modules/map-view/presentation/
src/modules/share/domain/
src/modules/share/data/
src/modules/share/presentation/
src/modules/dashboard/domain/
src/modules/dashboard/data/
src/modules/dashboard/presentation/
src/modules/analytics/domain/
src/modules/analytics/data/
src/modules/analytics/presentation/
tests/msw/handlers/
tests/utils/
```

## Risks / Trade-offs

**[R1] Versions may be outdated at implementation time** → If minor bumps are available when implementing, they can be updated without risk. Keep the same major versions.

**[R2] ESLint 9 flat config still requires `--flag v10_config_lookup_from_file`** → This flag will be unnecessary in ESLint 10. For now it's included in all scripts.

**[R3] `vite-plugin-checker` can slow down the dev server** → Only activates in `vite.config.local.ts` (dev), not in build. The overlay is configured with `initialIsOpen: "error"` to avoid disrupting with warnings.

**[R4] Tailwind prefix `tw:` adds verbosity to JSX** → Accepted trade-off: the clarity of which classes are Tailwind vs Ant Design is worth more than brevity.

## Open Questions

- None. This proposal is purely configuration.
