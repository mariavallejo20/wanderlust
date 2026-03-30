## Why

Wanderlust has no code yet — only a README. Before implementing any feature (DI container, routing, domain modules), we need the base infrastructure: monorepo, build toolchain, linting, git hooks, and directory structure. This proposal is a prerequisite for all others (02–24) and establishes enterprise-quality standards from the first commit.

## What Changes

- Create pnpm workspaces monorepo with `pnpm-workspace.yaml` (version catalogs for TypeScript 5.9, Zod 4, @types/node)
- Create `apps/frontend/` with Vite 7 + React 19 + SWC (`@vitejs/plugin-react-swc`)
- Configure TypeScript strict mode with decorators + emitDecoratorMetadata (required by Inversify)
- Configure `tsconfig.base.json` (ES2023, ESNext, bundler resolution) and `tsconfig.app.json` with path aliases (`@di/*`, `@wanderlust/*`, `@core/*`, `@trip/*`, etc.)
- Configure Vite with plugins: SWC, tsconfig-paths, svgr, Tailwind CSS 4
- Configure vite.config split: `vite.config.base.ts` (plugins) + `vite.config.local.ts` (checker, proxy, HMR) + `vite.config.prod.ts`
- Configure Tailwind CSS 4 with prefix `tw:`, `design-tokens.css` with `@theme` variables, and `tailwind.css` entry
- Install Ant Design 6 as a dependency
- Configure ESLint 9 flat config: base at root (`eslint.config.ts`) + frontend override with typescript-eslint type-aware, React Hooks, Zod plugin
- Configure Prettier with `prettier-plugin-organize-imports`, tab width 4, single attribute per line
- Configure Stylelint with SCSS support and Tailwind-aware rules (`@tailwind`, `@apply`, `@reference`, `@theme`)
- Configure Husky 9 with:
    - `pre-commit`: validate-branch-name + lint-staged (Prettier + ESLint + Knip)
    - `commit-msg`: commitlint (conventional commits)
- Configure Knip for dead code/dependency detection
- Create `.nvmrc` (Node 22.21.0), `.npmrc` (engine-strict), `.editorconfig`
- Create comprehensive `.gitignore` (node_modules, dist, .env, .env.keys, coverage, storybook-static, etc.)
- Create `index.html`, `main.tsx` (minimal entry point), `App.tsx` (placeholder)
- Create empty module structure: `src/modules/{core,trip,itinerary,activity,budget,map-view,share,dashboard,analytics}/`
- Create root scripts: `dev`, `build`, `lint:eslint`, `lint:prettier`, `lint:knip`, `web:dev`, `web:build`
- Create `.env.example` with frontend environment variables

## Capabilities

### New Capabilities

- `development-tools`: Full monorepo toolchain — pnpm workspaces, TypeScript, Vite, ESLint flat config, Prettier, Stylelint, Tailwind CSS 4, Husky, commitlint, lint-staged, Knip, validate-branch-name. Defines the code, build, and quality conventions that govern all subsequent proposals.

### Modified Capabilities

(none — this is the first change in the project)

## Impact

- **Code affected**: Entire project — created from scratch
- **New dependencies**: ~40 packages across dependencies and devDependencies
- **Runtime**: Node 22.21.0, pnpm 10.27.0
- **GitHub issue**: #1
- **Branch**: `feature/01-scaffolding`
- **Phase**: 0 (Scaffolding and setup)
- **Priority**: Core
- **Unblocks**: Proposals 02 (Core DI), 03 (i18n/routing), 20 (Backend scaffolding)
