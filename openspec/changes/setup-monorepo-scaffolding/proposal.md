## Why

Wanderlust no tiene ningún código todavía — solo un README. Antes de poder implementar cualquier funcionalidad (DI container, routing, módulos de dominio), necesitamos la infraestructura base: monorepo, build toolchain, linting, git hooks y estructura de directorios. Esta propuesta es el requisito previo de todas las demás (02–24) y establece la calidad enterprise desde el primer commit.

## What Changes

- Crear monorepo pnpm workspaces con `pnpm-workspace.yaml` (version catalogs para TypeScript 5.9, Zod 4, @types/node)
- Crear `apps/frontend/` con Vite 7 + React 19 + SWC (`@vitejs/plugin-react-swc`)
- Configurar TypeScript strict mode con decorators + emitDecoratorMetadata (requerido por Inversify)
- Configurar `tsconfig.base.json` (ES2023, ESNext, bundler resolution) y `tsconfig.app.json` con path aliases (`@di/*`, `@wanderlust/*`, `@core/*`, `@trip/*`, etc.)
- Configurar Vite con plugins: SWC, tsconfig-paths, svgr, Tailwind CSS 4
- Configurar vite.config split: `vite.config.base.ts` (plugins) + `vite.config.local.ts` (checker, proxy, HMR) + `vite.config.prod.ts`
- Configurar Tailwind CSS 4 con prefix `tw:`, `design-tokens.css` con `@theme` variables, y `tailwind.css` entry
- Instalar Ant Design 6 como dependencia
- Configurar ESLint 9 flat config: base en raíz (`eslint.config.ts`) + frontend override con typescript-eslint type-aware, React Hooks, Zod plugin
- Configurar Prettier con `prettier-plugin-organize-imports`, tab width 4, single attribute per line
- Configurar Stylelint con soporte SCSS y reglas Tailwind-aware (`@tailwind`, `@apply`, `@reference`, `@theme`)
- Configurar Husky 9 con:
    - `pre-commit`: validate-branch-name + lint-staged (Prettier + ESLint + Knip)
    - `commit-msg`: commitlint (conventional commits)
- Configurar Knip para detección de dead code/dependencies
- Crear `.nvmrc` (Node 22.21.0), `.npmrc` (engine-strict), `.editorconfig`
- Crear `.gitignore` completo (node_modules, dist, .env, .env.keys, coverage, storybook-static, etc.)
- Crear `index.html`, `main.tsx` (entry point mínimo), `App.tsx` (placeholder)
- Crear estructura vacía de módulos: `src/modules/{core,trip,itinerary,activity,budget,map-view,share,dashboard,analytics}/`
- Crear scripts raíz: `dev`, `build`, `lint:eslint`, `lint:prettier`, `lint:knip`, `web:dev`, `web:build`
- Crear `.env.example` con variables del frontend

## Capabilities

### New Capabilities

- `development-tools`: Toolchain completa del monorepo — pnpm workspaces, TypeScript, Vite, ESLint flat config, Prettier, Stylelint, Tailwind CSS 4, Husky, commitlint, lint-staged, Knip, validate-branch-name. Define las convenciones de código, build, y calidad que rigen todas las propuestas posteriores.

### Modified Capabilities

(ninguna — es el primer cambio del proyecto)

## Impact

- **Código afectado**: Todo el proyecto — es la creación desde cero
- **Dependencias nuevas**: ~40 paquetes entre dependencies y devDependencies
- **Runtime**: Node 22.21.0, pnpm 10.27.0
- **Issue de GitHub**: #1
- **Rama**: `feature/01-scaffolding`
- **Fase**: 0 (Scaffolding y setup)
- **Prioridad**: Core
- **Desbloquea**: Propuestas 02 (Core DI), 03 (i18n/routing), 20 (Backend scaffolding)
