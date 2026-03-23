## Context

El repositorio Wanderlust solo contiene un `README.md` en la rama `develop`. No existe ningún archivo de configuración, dependencia ni estructura de código. Este diseño define exactamente qué archivos crear, con qué contenido y qué versiones, replicando fielmente la arquitectura del proyecto de referencia ECI AV.

El proyecto de referencia (`/home/mvo/dev/ECI/eci-av`) usa Node 22.21.0, pnpm 10.27.0, y tiene un monorepo con `apps/frontend/` + `lambdas/`. Wanderlust replica la parte frontend y sustituye `lambdas/` por `apps/backend/` (fase posterior).

## Goals / Non-Goals

**Goals:**

- Monorepo funcional: `pnpm install` + `pnpm dev` arrancan el frontend sin errores
- TypeScript compila sin errores con strict + decorators
- ESLint, Prettier y Stylelint ejecutan sin warnings sobre el código scaffolded
- Husky intercepta commits: valida branch name, ejecuta lint-staged, valida conventional commits
- Tailwind CSS 4 con prefix `tw:` renderiza correctamente
- Estructura de directorios lista para que las propuestas 02–04 puedan empezar directamente
- `pnpm build` genera un bundle de producción válido

**Non-Goals:**

- Código funcional de ningún módulo (domain, data, presentation) — solo directorios vacíos con `.gitkeep`
- Inversify container, Http factory, o cualquier infraestructura de core (propuesta 02)
- i18n, routing, o layout (propuesta 03)
- MSW, Storybook, o configuración de Vitest (propuesta 04)
- Tests de cualquier tipo
- Backend (`apps/backend/`) — propuesta 20

## Decisions

### D1 — Estructura del monorepo: pnpm workspaces sin Nx

**Decisión**: Usar pnpm workspaces nativo, sin Nx ni Turborepo.

**Alternativas consideradas**:
- Nx: Overkill para un proyecto con 2 workspaces. Añade complejidad de configuración (nx.json, project.json) y dependencia pesada. ECI AV tampoco lo usa en su setup base.
- Turborepo: Similar a Nx en overhead. No aporta valor con solo un frontend.

**Razón**: pnpm workspaces con version catalogs cubre todas las necesidades (dependency hoisting, shared versions, script orchestration con `--filter`). Misma decisión que ECI AV.

### D2 — Version catalogs en pnpm-workspace.yaml

**Decisión**: Centralizar versiones compartidas entre workspaces usando `catalogs.default` en `pnpm-workspace.yaml`.

```yaml
catalogs:
    default:
        "@types/node": 25.0.3
        dotenv: 17.2.3
        typescript: 5.9.3
        zod: 4.1.12
```

**Razón**: Evita desincronización de versiones entre `apps/frontend` y futuro `apps/backend`. Los packages usan `"catalog:"` en su `package.json`. Patrón idéntico a ECI AV.

### D3 — Vite config split en 3 archivos

**Decisión**: Dividir la configuración de Vite en `vite.config.base.ts` (plugins compartidos), `vite.config.local.ts` (dev server, checker, proxy) y `vite.config.prod.ts` (optimizaciones de build). El `vite.config.ts` los compone con `mergeConfig`.

**Alternativas consideradas**:
- Un solo `vite.config.ts` con condicionales: Funciona pero se vuelve difícil de mantener con el checker plugin, proxy config, y futuros plugins.

**Razón**: Separación clara de concerns. El checker plugin (TypeScript + ESLint + Stylelint overlay) solo se activa en dev, no en build. Patrón exacto de ECI AV.

### D4 — Tailwind CSS 4 con prefix `tw:`

**Decisión**: Usar Tailwind CSS 4 con `@import "tailwindcss" prefix(tw)` para evitar colisiones con clases de Ant Design.

```css
@import "tailwindcss";
@import "tailwindcss" prefix(tw);
@import "tailwindcss" important;
@import "./design-tokens.css";
```

**Alternativas consideradas**:
- Sin prefix: Riesgo de colisión entre utilidades de Tailwind y clases de Ant Design (ambos usan `p-*`, `m-*`, `text-*`).

**Razón**: El prefix `tw:` evita colisiones y deja claro en el JSX qué clases son Tailwind vs. otras. ECI AV usa el mismo patrón.

### D5 — Design tokens como CSS custom properties

**Decisión**: Definir tokens de diseño en `design-tokens.css` usando `@theme` de Tailwind 4, y exportarlos también como constantes TS en `design-tokens.ts` para uso programático (Ant Design ConfigProvider).

**Razón**: Single source of truth para colores, tipografía, spacing. Ant Design consume los tokens via TS, Tailwind los consume via CSS. Patrón de ECI AV.

### D6 — ESLint 9 flat config con typescript-eslint type-aware

**Decisión**: ESLint 9 con flat config (`eslint.config.ts`). Config base en raíz (heredada por todos los workspaces) + config específica en `apps/frontend/eslint.config.ts` que añade React Hooks y reglas type-aware.

**Plugins**:
- `@eslint/js` — reglas base recomendadas
- `typescript-eslint` — type-aware linting con `projectService: true`
- `eslint-config-prettier` — desactiva reglas que conflictúan con Prettier
- `eslint-plugin-zod` — reglas para schemas Zod
- `eslint-plugin-react-hooks` — reglas de hooks

**Razón**: Idéntico a ECI AV. El `--flag v10_config_lookup_from_file` se necesita para que ESLint 9 busque config desde el archivo, no desde el CWD.

### D7 — Husky + lint-staged + validate-branch-name

**Decisión**: Pre-commit hook ejecuta `validate-branch-name` (fuerza patrón `feature|bugfix|fix|hotfix|release/*`) + `lint-staged` (Prettier + ESLint + Knip sobre archivos staged). Commit-msg hook ejecuta `commitlint` (conventional commits).

```bash
# .husky/pre-commit
export NODE_OPTIONS="--experimental-strip-types"
validate-branch-name
lint-staged --config lint-staged.config.ts
```

**Razón**: Catch issues antes de que lleguen al repo. `--experimental-strip-types` permite ejecutar config files `.ts` sin compilación. Idéntico a ECI AV.

### D8 — Path aliases con tsconfig paths

**Decisión**: Definir path aliases en `tsconfig.app.json` y resolver en Vite via `vite-tsconfig-paths`.

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

**Razón**: Imports limpios (`@trip/domain/models/trip.model` vs `../../../modules/trip/domain/models/trip.model`). Los alias se resuelven tanto en TypeScript como en Vite (runtime). Patrón idéntico a ECI AV.

## Versiones exactas de dependencias

Todas las versiones se toman del proyecto de referencia ECI AV (última revisión):

### Root `package.json` devDependencies

| Package | Version |
|---------|---------|
| `@commitlint/cli` | 20.2.0 |
| `@commitlint/config-conventional` | 20.2.0 |
| `@eslint/js` | 9.39.3 |
| `concurrently` | 9.2.1 |
| `eslint` | 9.39.3 |
| `eslint-config-prettier` | 10.1.8 |
| `eslint-plugin-zod` | 3.5.0 |
| `husky` | 9.1.7 |
| `knip` | 5.76.3 |
| `lint-staged` | 16.2.7 |
| `prettier` | 3.7.4 |
| `prettier-plugin-organize-imports` | 4.3.0 |
| `typescript-eslint` | 8.50.0 |
| `validate-branch-name` | 1.3.2 |

### Frontend `package.json` dependencies

| Package | Version |
|---------|---------|
| `@ant-design/icons` | 6.1.0 |
| `antd` | 6.1.4 |
| `axios` | 1.13.2 |
| `es-toolkit` | 1.43.0 |
| `inversify` | 7.10.8 |
| `luxon` | 3.7.2 |
| `mobx` | 6.15.0 |
| `mobx-react` | 9.2.1 |
| `neverthrow` | 8.2.0 |
| `query-string` | 9.3.1 |
| `react` | 19.2.4 |
| `react-dom` | 19.2.4 |
| `react-hook-form` | 7.69.0 |
| `@hookform/resolvers` | 5.2.2 |
| `react-router` | 7.11.0 |
| `reflect-metadata` | 0.2.2 |
| `rxjs` | 7.8.2 |
| `zod` | catalog: |
| `i18next` | 25.7.3 |
| `react-i18next` | 16.5.0 |
| `i18next-browser-languagedetector` | 8.2.0 |
| `i18next-http-backend` | 3.0.2 |

### Frontend `package.json` devDependencies

| Package | Version |
|---------|---------|
| `@tailwindcss/vite` | 4.1.18 |
| `@types/node` | catalog: |
| `@types/react` | 19.2.14 |
| `@types/react-dom` | 19.2.3 |
| `@types/luxon` | 3.7.1 |
| `@vitejs/plugin-react-swc` | 4.2.3 |
| `@total-typescript/ts-reset` | 0.6.1 |
| `eslint-plugin-react-hooks` | 6.1.0 |
| `globals` | 16.5.0 |
| `sass` | 1.96.0 |
| `stylelint` | 16.26.1 |
| `stylelint-config-standard` | 39.0.1 |
| `stylelint-config-standard-scss` | 16.0.0 |
| `stylelint-config-prettier-scss` | 1.0.0 |
| `stylelint-scss` | 6.13.0 |
| `tailwindcss` | 4.1.18 |
| `typescript` | catalog: |
| `vite` | 7.3.1 |
| `vite-plugin-checker` | 0.12.0 |
| `vite-plugin-svgr` | 4.5.0 |
| `vite-tsconfig-paths` | 6.0.5 |

## Archivos a crear (listado completo)

### Raíz del monorepo

| Archivo | Contenido clave |
|---------|----------------|
| `pnpm-workspace.yaml` | packages: `apps/*`, catalogs, allowBuilds, blockExoticSubdeps |
| `package.json` | name `@wanderlust/workspace`, scripts raíz, devDependencies |
| `tsconfig.base.json` | ES2023, ESNext, bundler, strict, skipLibCheck |
| `tsconfig.json` | References a `apps/frontend` |
| `eslint.config.ts` | Base config exportada + default config |
| `.prettierrc.json` | tabWidth 4, singleAttributePerLine, organize-imports plugin |
| `commitlint.config.ts` | Extends `@commitlint/config-conventional` |
| `lint-staged.config.ts` | Prettier + ESLint + Knip |
| `validate-branch-name.config.ts` | Pattern para ramas |
| `knip.config.ts` | Workspace frontend con entry/project |
| `.husky/pre-commit` | validate-branch-name + lint-staged |
| `.husky/commit-msg` | commitlint --edit |
| `.nvmrc` | `22.21.0` |
| `.npmrc` | engine-strict, auto-install-peers |
| `.editorconfig` | UTF-8, LF, indent 2 spaces, trim trailing |
| `.gitignore` | node_modules, dist, .env, coverage, storybook-static, etc. |

### `apps/frontend/`

| Archivo | Contenido clave |
|---------|----------------|
| `package.json` | name `@wanderlust/frontend`, dependencies + devDependencies |
| `tsconfig.app.json` | Extends base, jsx react-jsx, decorators, path aliases |
| `vite.config.ts` | Compose base + local/prod |
| `vite.config.base.ts` | Plugins: react-swc, tsconfigPaths, svgr, tailwindcss |
| `vite.config.local.ts` | Checker (TS+ESLint+Stylelint), dev server, proxy |
| `vite.config.prod.ts` | (vacío, extensible) |
| `eslint.config.ts` | Importa baseConfig, añade React Hooks, type-aware |
| `stylelint.config.cjs` | SCSS + Tailwind rules |
| `index.html` | div#root, script module src/main.tsx |
| `.env.example` | VITE_API_BASE_URL, VITE_USE_MSW, VITE_APP_STAGE |

### `apps/frontend/src/`

| Archivo | Contenido |
|---------|-----------|
| `main.tsx` | createRoot + StrictMode + placeholder App |
| `App.tsx` | Componente mínimo con texto placeholder |
| `vite-env.d.ts` | Triple-slash reference vite/client |
| `styles/tailwind.css` | Imports Tailwind con prefix tw, design-tokens |
| `styles/design-tokens.css` | @theme con colores, fonts, spacing, radios, shadows |

### Directorios vacíos (con `.gitkeep`)

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

**[R1] Versiones pueden estar desactualizadas al momento de implementar** → Las versiones se toman del proyecto ECI AV que se actualiza frecuentemente. Si hay minor bumps disponibles al implementar, se pueden actualizar sin riesgo. Mantener las mismas major versions.

**[R2] ESLint 9 flat config aún requiere `--flag v10_config_lookup_from_file`** → Este flag será innecesario en ESLint 10. Por ahora se incluye en todos los scripts. Idéntico a como lo maneja ECI AV.

**[R3] `vite-plugin-checker` puede ralentizar el dev server** → Solo se activa en `vite.config.local.ts` (dev), no en build. El overlay se configura con `initialIsOpen: "error"` para no molestar con warnings.

**[R4] Tailwind prefix `tw:` añade verbosidad al JSX** → Trade-off aceptado: la claridad de qué clases son Tailwind vs Ant Design vale más que la brevedad. Mismo trade-off que ECI AV.

## Open Questions

- Ninguna. Esta propuesta es puramente de configuración y replica decisiones ya validadas en producción en el proyecto de referencia.
