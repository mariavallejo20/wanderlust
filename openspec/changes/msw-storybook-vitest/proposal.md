## Why

Proposals 01–03 established the monorepo, the DI/HTTP infrastructure, and the i18n/routing/layout foundation. The application compiles and renders, but there is no way to test any of that code and no way to develop components in isolation. Every subsequent feature proposal (Trip CRUD, Dashboard, Itinerary, Activity) will introduce domain models, use cases, ViewModels, and UI components — all of which require a test harness to be validated correctly and a component workbench to be developed efficiently. This proposal closes that gap before any feature work begins, so testing and component development are first-class citizens from proposal 05 onwards.

## What Changes

**MSW (Mock Service Worker)**

- Install and configure MSW 2 — the same package already listed in `pnpm-workspace.yaml` `onlyBuiltDependencies`
- Create MSW service worker in `public/` via `msw init` for browser interception
- Create `src/tests/msw/server.ts` — Node.js server using `setupServer()` for Vitest integration and unit tests
- Create `src/tests/msw/browser.ts` — browser handler using `setupWorker()` for Vite dev mode
- Create `src/tests/msw/handlers/index.ts` — barrel exporting all handler arrays (empty at this point; each feature proposal adds its own handlers)
- Integrate MSW worker startup in `main.tsx` behind `VITE_USE_MSW=true` guard — zero impact on production builds
- Add `VITE_USE_MSW` to `.env.example` and `vite-env.d.ts`

**Vitest**

- Install Vitest 4 + `@vitest/browser` + `@vitest/coverage-v8` + `jsdom` + `@testing-library/react` + `@testing-library/user-event` + `@testing-library/jest-dom`
- Create `vitest.config.ts` with three workspace projects:
    - `unit` — `.test.ts` / `.test.tsx` files, jsdom environment, fast
    - `integration` — `.integration.ts` / `.integration.tsx` files, jsdom environment, 30 s timeout, MSW server enabled globally
    - `browser` — `.browser.ts` / `.browser.tsx` files, Playwright Chromium, MSW browser worker
- Create `src/tests/setup/vitest-setup.ts` — global setup: `@testing-library/jest-dom` matchers, custom `toBeOk` / `toBeErr` matchers for neverthrow `Result<T,E>`, MSW server lifecycle (`beforeAll` / `afterEach` / `afterAll`)
- Create `src/tests/utils/custom-matchers.ts` — `toBeOk` and `toBeErr` implementations with correct TypeScript types
- Create `src/tests/utils/render-with-providers.tsx` — test utility that wraps components with DI container, i18n, antd ConfigProvider, and router — the standard render helper for integration tests
- Add Vitest scripts to `apps/frontend/package.json`: `test`, `test:unit`, `test:integration`, `test:browser`, `test:coverage`
- Add root workspace scripts: `test`, `test:unit`, `test:integration`
- Configure coverage thresholds (lines/functions/statements ≥ 70 %, branches ≥ 60 %)

**Storybook**

- Install Storybook 9 with `@storybook/react-vite` builder — uses the existing Vite config, no separate bundler
- Run `storybook init` to generate `.storybook/` directory
- Create `.storybook/main.ts` — configures `@storybook/react-vite`, stories glob `src/**/*.stories.tsx`, addons: essentials, a11y, interactions
- Create `.storybook/preview.ts` — global decorators:
    - `I18nextProvider` with default language `es` (mirrors production behaviour)
    - Ant Design `ConfigProvider` with the Wanderlust theme tokens
    - `MemoryRouter` for components that use `useNavigate` / `Link`
- Add `storybook` and `build-storybook` scripts to `apps/frontend/package.json`
- Add root workspace script `storybook`
- Configure Storybook to respect the existing `tw:` Tailwind prefix and path aliases (`@core/*`, `@wanderlust/*`, etc.)
- Add `storybook-static/` to root `.gitignore`

**ESLint integration**

- Add `eslint-plugin-vitest` rules to the existing ESLint flat config (no-skipped-tests, consistent-test-names, expect-expect)
- Add `eslint-plugin-storybook` rules to enforce story conventions

**Knip**

- Add Vitest, Storybook, and testing utilities to `knip.config.ts` so the dead-code checker understands test/story entry points and does not flag test utilities as unused

## Capabilities

### New Capabilities

- `msw-setup`: Mock Service Worker configuration — Node server for tests, browser worker for development, handler barrel with placeholder arrays, VITE_USE_MSW guard integration in main.tsx
- `vitest-setup`: Vitest multi-project configuration — unit (jsdom), integration (jsdom + MSW), browser (Playwright) projects; global setup with jest-dom, custom neverthrow matchers, MSW lifecycle hooks; coverage v8 with thresholds
- `test-utilities`: Shared test utilities — `renderWithProviders` helper wrapping DI + i18n + antd + router, `custom-matchers.ts` with `toBeOk`/`toBeErr`, re-exported testing-library helpers
- `storybook-setup`: Storybook 9 configuration — react-vite builder, global decorators (i18n, antd theme, MemoryRouter), essentials + a11y + interactions addons, Tailwind tw: prefix support, path alias resolution

### Modified Capabilities

- `development-tools` (delta): Add Vitest, Storybook, and MSW to the existing ESLint flat config and Knip configuration. No spec-level behaviour changes — only toolchain extension.

## Impact

- **New files**: `vitest.config.ts`, `src/tests/setup/vitest-setup.ts`, `src/tests/utils/custom-matchers.ts`, `src/tests/utils/render-with-providers.tsx`, `src/tests/msw/server.ts`, `src/tests/msw/browser.ts`, `src/tests/msw/handlers/index.ts`, `.storybook/main.ts`, `.storybook/preview.ts`, `public/mockServiceWorker.js`
- **Modified files**: `apps/frontend/package.json` (new devDependencies + scripts), `pnpm-workspace.yaml` (catalog entries for new packages), `src/main.tsx` (MSW conditional start), `src/vite-env.d.ts` (`VITE_USE_MSW` type), `apps/frontend/.env.example` (`VITE_USE_MSW=true`), `eslint.config.ts` (vitest + storybook plugins), `knip.config.ts` (test/story entry points), root `package.json` (test + storybook scripts)
- **New dependencies**: `msw`, `vitest`, `@vitest/browser`, `@vitest/coverage-v8`, `jsdom`, `@testing-library/react`, `@testing-library/user-event`, `@testing-library/jest-dom`, `@storybook/react-vite`, `@storybook/addon-essentials`, `@storybook/addon-a11y`, `@storybook/addon-interactions`, `eslint-plugin-vitest`, `eslint-plugin-storybook`
- **Runtime impact**: None — MSW worker only starts when `VITE_USE_MSW=true`; Vitest and Storybook are devDependencies only
- **GitHub issue**: #4
- **Branch**: `feature/04-msw-storybook-vitest`
- **Phase**: 0 (Scaffolding and setup)
- **Priority**: Core
- **Unblocks**: All feature proposals (05–19) — every domain model needs unit tests, every page needs integration tests, every component needs a Story
