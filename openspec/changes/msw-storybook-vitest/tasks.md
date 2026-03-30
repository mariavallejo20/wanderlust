## 1. Dependencies

- [x] 1.1 Add test dependencies to `apps/frontend/package.json` devDependencies: `msw` (latest 2.x), `vitest` (latest 4.x), `@vitest/browser` (same version as vitest), `@vitest/coverage-v8` (same version as vitest), `jsdom`, `@testing-library/react`, `@testing-library/user-event`, `@testing-library/jest-dom`, `@types/testing-library__jest-dom` — run `pnpm install` to resolve
- [x] 1.2 Add Storybook devDependencies to `apps/frontend/package.json`: `@storybook/react-vite`, `@storybook/addon-essentials`, `@storybook/addon-a11y`, `@storybook/addon-interactions`, `storybook` — run `pnpm install`
- [x] 1.3 Add ESLint plugin devDependencies to `apps/frontend/package.json`: `eslint-plugin-vitest`, `eslint-plugin-storybook` — run `pnpm install`
- [x] 1.4 Add Playwright devDependency to `apps/frontend/package.json`: `@vitest/browser` requires `playwright` — add `playwright` and run `pnpm exec playwright install chromium` to download the browser binary

## 2. Environment Variables

- [x] 2.1 Update `apps/frontend/src/vite-env.d.ts` — add `VITE_USE_MSW: string` and `VITE_APP_STAGE: string` to the `ImportMetaEnv` interface alongside the existing `VITE_API_BASE_URL`
- [x] 2.2 Update `apps/frontend/.env.example` — add `VITE_USE_MSW=true` and `VITE_APP_STAGE=development` entries with inline comments explaining their purpose

## 3. MSW Node Server and Browser Worker

- [x] 3.1 Run `pnpm exec msw init public/` in `apps/frontend/` to generate `public/mockServiceWorker.js` — commit this file (do not add it to `.gitignore`)
- [x] 3.2 Create `apps/frontend/src/tests/msw/handlers/index.ts` — export `export const handlers: RequestHandler[] = []` (empty array; feature proposals will extend it). Import alias: `@tests/msw/handlers`
- [x] 3.3 Create `apps/frontend/src/tests/msw/server.ts` — import `setupServer` from `msw/node` and `handlers` from `./handlers/index`; export `export const server = setupServer(...handlers)`. Import alias: `@tests/msw/server`
- [x] 3.4 Create `apps/frontend/src/tests/msw/browser.ts` — import `setupWorker` from `msw/browser` and `handlers` from `./handlers/index`; export `export const worker = setupWorker(...handlers)`. Import alias: `@tests/msw/browser`
- [x] 3.5 Update `apps/frontend/src/main.tsx` — wrap `createRoot(...).render(...)` in an `enableMocking()` async function that dynamically imports `./tests/msw/browser` and calls `worker.start({ onUnhandledRequest: "bypass" })` when `import.meta.env.VITE_USE_MSW === "true"`. Call `enableMocking().then(() => { /* render */ })` to guarantee React mounts only after the worker is ready

## 4. Test Utilities

- [x] 4.1 Add `@tests/*` path alias to `apps/frontend/tsconfig.app.json` paths: `"@tests/*": ["src/tests/*"]` — required for import resolution in test files
- [x] 4.2 Create `apps/frontend/src/tests/utils/custom-matchers.ts` — implement `toBeOk` and `toBeErr` matchers using neverthrow's `isOk()` / `isErr()` guards; include descriptive failure messages that stringify the actual value or error; augment the `vitest` module with `Assertion<T>` and `AsymmetricMatchersContaining` interfaces declaring both matchers
- [x] 4.3 Create `apps/frontend/src/tests/setup/vitest-setup.ts` — (1) import `@testing-library/jest-dom/vitest` for extended DOM matchers; (2) import `customMatchers` from `@tests/utils/custom-matchers` and call `expect.extend(customMatchers)`; (3) import `server` from `@tests/msw/server` and register `beforeAll(() => server.listen({ onUnhandledRequest: "warn" }))`, `afterEach(() => server.resetHandlers())`, `afterAll(() => server.close())`
- [x] 4.4 Create `apps/frontend/src/tests/utils/render-with-providers.tsx` — export `renderWithProviders(ui, options?)` wrapping `@testing-library/react`'s `render` with an `AllProviders` component that composes `I18nextProvider` (using the shared `i18n` instance from `../../i18n`) → `AntConfigProvider` → `MemoryRouter`; forward all `RenderOptions` to the underlying `render` call
- [x] 4.5 Create `apps/frontend/src/tests/utils/index.ts` — re-export `renderWithProviders` from `./render-with-providers`, and re-export `screen`, `fireEvent`, `waitFor`, `within` from `@testing-library/react`, and `userEvent` from `@testing-library/user-event`

## 5. Vitest Configuration

- [x] 5.1 Create `apps/frontend/vitest.config.ts` — use `defineWorkspace` with three named project objects, each extending `./vite.config.base.ts`:
    - `unit`: include `src/**/*.test.{ts,tsx}`, environment `jsdom`, setupFiles `src/tests/setup/vitest-setup.ts`, globals `true`
    - `integration`: include `src/**/*.integration.{ts,tsx}`, environment `jsdom`, setupFiles same, globals `true`, testTimeout `30_000`, hookTimeout `30_000`
    - `browser`: include `src/**/*.browser.{ts,tsx}`, browser provider `playwright`, name `chromium`, headless `true`, setupFiles same
- [x] 5.2 Add coverage configuration to the workspace-level options in `vitest.config.ts`: provider `v8`, include `src/**/*.{ts,tsx}`, exclude `src/tests/**`, `src/**/*.stories.tsx`, `src/**/*.mock.ts`, `src/**/*.di.ts`, `src/di/**`, `src/main.tsx`, `src/router.tsx`, `src/i18n.ts`; thresholds lines/functions/statements `70`, branches `60`; reporter `["text", "lcov", "html"]`

## 6. Scripts

- [x] 6.1 Add test scripts to `apps/frontend/package.json` scripts: `"test": "vitest"`, `"test:unit": "vitest --project unit"`, `"test:integration": "vitest --project integration"`, `"test:browser": "vitest --project browser"`, `"test:coverage": "vitest --coverage"`
- [x] 6.2 Add root workspace scripts to root `package.json`: `"test": "pnpm --filter @wanderlust/frontend test"`, `"test:unit": "pnpm --filter @wanderlust/frontend test:unit"`, `"test:integration": "pnpm --filter @wanderlust/frontend test:integration"`

## 7. Storybook Configuration

- [x] 7.1 Create `.storybook/main.ts` — configure `@storybook/react-vite` framework with `viteConfigPath: "./vite.config.base.ts"`, stories glob `["../src/**/*.stories.tsx"]`, addons `["@storybook/addon-essentials", "@storybook/addon-a11y", "@storybook/addon-interactions"]`
- [x] 7.2 Create `.storybook/preview.ts` — define a `withProviders` decorator composing `I18nextProvider` (shared `i18n` instance from `../src/i18n`) → `AntConfigProvider` (from `@core/presentation/context/ant-config.provider`) → `MemoryRouter`; export `preview` with `decorators: [withProviders]`, `parameters: { layout: "centered", backgrounds: { default: "light" } }`
- [x] 7.3 Add Storybook scripts to `apps/frontend/package.json`: `"storybook": "storybook dev -p 6006"`, `"build-storybook": "storybook build"`
- [x] 7.4 Add root workspace script: `"storybook": "pnpm --filter @wanderlust/frontend storybook"`

## 8. ESLint and Knip Updates

- [x] 8.1 Update `eslint.config.ts` — add a new config block scoped to `files: ["**/*.{test,integration,browser}.{ts,tsx}"]` with `eslint-plugin-vitest` rules: spread `pluginVitest.configs.recommended.rules`, set `"vitest/no-skipped-tests": "warn"` and `"vitest/expect-expect": "error"`, add `settings: { vitest: { typecheck: true } }`
- [x] 8.2 Update `knip.config.ts` — extend the `apps/frontend` workspace `entry` array to include `"src/**/*.stories.tsx"`, `"src/tests/setup/vitest-setup.ts"`, `".storybook/main.ts"`, `".storybook/preview.ts"`; extend `ignoreDependencies` to include `"msw"`, `"@storybook/addon-essentials"`, `"@storybook/addon-a11y"`, `"@storybook/addon-interactions"`, `"eslint-plugin-vitest"`, `"eslint-plugin-storybook"`, `"playwright"`

## 9. Git and TypeScript Updates

- [x] 9.1 Verify root `.gitignore` already contains `storybook-static/` — add it if missing (it should be present from proposal 01 scaffolding)
- [x] 9.2 Verify `public/mockServiceWorker.js` is NOT in `.gitignore` — the file must be committed so the service worker can be served at `/mockServiceWorker.js`
- [x] 9.3 Add `vitest/globals` to `compilerOptions.types` in `apps/frontend/tsconfig.app.json` — required for Vitest globals (`describe`, `it`, `expect`, `beforeAll`, etc.) to be available without explicit imports in test files

## 10. Verification

- [x] 10.1 Run `pnpm test:unit` — verify Vitest starts with zero tests (no test files yet) and exits successfully
- [x] 10.2 Run `pnpm build` — verify TypeScript compilation and Vite bundle complete without errors after all config changes
- [x] 10.3 Run `pnpm lint:eslint` — verify ESLint passes with the new Vitest plugin config
- [x] 10.4 Run `pnpm lint:knip` — verify Knip reports zero issues with the new entry points and ignoreDependencies
- [x] 10.5 Run `pnpm storybook` — verify Storybook dev server starts on port 6006 with zero stories and no errors in the console
