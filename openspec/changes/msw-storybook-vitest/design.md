## Context

Proposals 01–03 delivered the monorepo, the DI/HTTP/ViewModel infrastructure, and the i18n/routing/layout foundation. The application compiles, boots, and routes correctly — but there is zero test coverage and no isolated component development environment.

All MSW, Vitest, and Storybook packages are intentionally absent from `apps/frontend/package.json` at this point. `msw` is already listed in `pnpm-workspace.yaml` `onlyBuiltDependencies` to handle its native postinstall step; the remaining packages need to be added.

This design defines the exact configuration for the testing infrastructure (`vitest.config.ts`, three projects, global setup, custom matchers, render helpers) and the Storybook workbench (`.storybook/main.ts`, decorators, alias resolution), establishing the patterns every subsequent feature proposal must follow for tests and stories.

## Goals / Non-Goals

**Goals:**

- A single `pnpm test` command runs all Vitest projects (unit + integration + browser) from the workspace root
- Unit tests run in jsdom with no network — pure domain, mapper, and ViewModel logic
- Integration tests run in jsdom with a real MSW Node server intercepting HTTP — full page renders with DI container
- Browser tests run in a real Chromium instance via Playwright with the MSW browser worker — critical UI flows
- `toBeOk` / `toBeErr` custom matchers work on neverthrow `Result<T, E>` and `ResultAsync<T, E>` in all three projects
- `renderWithProviders` wraps any component with the full provider tree (DI, i18n, antd theme, router) for integration tests
- Storybook starts with `pnpm storybook` and renders any component in isolation with the same provider tree used in tests
- MSW `VITE_USE_MSW=true` guard in `main.tsx` activates the browser worker in development without affecting production builds
- Coverage report generated with `--coverage` flag; thresholds enforced in CI
- TypeScript compiles with zero errors across `vitest.config.ts` and `.storybook/` files

**Non-Goals:**

- Playwright standalone e2e tests (`apps/frontend/e2e/`) — configured in a future proposal when the first complete user flow exists
- Any actual test content (unit tests, integration tests, stories) — each feature proposal adds its own
- MSW handlers for specific API endpoints — each feature proposal adds its own handler file
- Storybook deployment or publishing
- Visual regression testing (Chromatic or similar)

## Decisions

### D1 — Vitest workspace with three named projects

**Decision**: Define `vitest.config.ts` at `apps/frontend/` level using Vitest's `defineWorkspace` with three named projects:

```typescript
// apps/frontend/vitest.config.ts
import { defineWorkspace } from "vitest/config";

export default defineWorkspace([
    {
        extends: "./vite.config.base.ts",
        test: {
            name: "unit",
            include: ["src/**/*.test.{ts,tsx}"],
            environment: "jsdom",
            setupFiles: ["src/tests/setup/vitest-setup.ts"],
            globals: true,
        },
    },
    {
        extends: "./vite.config.base.ts",
        test: {
            name: "integration",
            include: ["src/**/*.integration.{ts,tsx}"],
            environment: "jsdom",
            setupFiles: ["src/tests/setup/vitest-setup.ts"],
            globals: true,
            testTimeout: 30_000,
            hookTimeout: 30_000,
        },
    },
    {
        extends: "./vite.config.base.ts",
        test: {
            name: "browser",
            include: ["src/**/*.browser.{ts,tsx}"],
            browser: {
                enabled: true,
                provider: "playwright",
                name: "chromium",
                headless: true,
            },
            setupFiles: ["src/tests/setup/vitest-setup.ts"],
        },
    },
]);
```

**Why three projects over one**: Each project targets a different test type with different requirements: unit tests need no network and fast boot; integration tests need MSW + 30 s timeout; browser tests need a real DOM engine. Separating them allows `--project unit` to run in under a second on CI without waiting for Playwright.

**Each project extends `vite.config.base.ts`**: This gives all three projects the same path alias resolution (`vite-tsconfig-paths`), the same SWC React transform, and the same Tailwind plugin — zero duplication and guaranteed consistency with the production build.

**Alternatives considered**:

- Single project with environment per file: Vitest supports `@vitest-environment` pragma comments, but this removes the ability to run projects independently and forces developers to remember to annotate each file.
- Separate `vitest.unit.config.ts` / `vitest.integration.config.ts`: Multiple config files with no shared base cause duplication. Workspace is the canonical Vitest pattern.

### D2 — Global setup file with MSW server lifecycle

**Decision**: A single `src/tests/setup/vitest-setup.ts` is used as `setupFiles` across all three projects. It handles:

1. `@testing-library/jest-dom` extended matchers (`.toBeInTheDocument()`, etc.)
2. Custom neverthrow matchers via `expect.extend(customMatchers)`
3. MSW Node server lifecycle — but **only in the `integration` project**:

```typescript
// src/tests/setup/vitest-setup.ts
import "@testing-library/jest-dom/vitest";
import { expect, beforeAll, afterEach, afterAll } from "vitest";
import { customMatchers } from "../utils/custom-matchers";
import { server } from "../msw/server";

expect.extend(customMatchers);

// MSW Node server — only used by integration and browser (Node side) projects
if (typeof server !== "undefined") {
    beforeAll(() => server.listen({ onUnhandledRequest: "warn" }));
    afterEach(() => server.resetHandlers());
    afterAll(() => server.close());
}
```

**Why a single setup file**: All three projects get jest-dom matchers and `toBeOk`/`toBeErr` without duplication. The MSW server guard means unit tests are not affected by the server lifecycle.

**`onUnhandledRequest: "warn"`**: Integration tests may make requests to paths not yet covered by handlers. A warning (not an error) prevents test suite failures when handlers are added incrementally across feature proposals.

### D3 — Custom matchers: `toBeOk` and `toBeErr`

**Decision**: Implement `toBeOk` and `toBeErr` as Vitest custom matchers in `src/tests/utils/custom-matchers.ts` using neverthrow's `isOk()` / `isErr()` guards. Augment Vitest's `Assertion` and `AsymmetricMatchersContaining` interfaces for full TypeScript support:

```typescript
// src/tests/utils/custom-matchers.ts
import type { Result } from "neverthrow";
import { expect } from "vitest";

export const customMatchers = {
    toBeOk(received: Result<unknown, unknown>) {
        return received.isOk()
            ? {
                  pass: true,
                  message: () => "Expected Result to be Err but it was Ok",
              }
            : {
                  pass: false,
                  message: () =>
                      `Expected Result to be Ok but got Err: ${JSON.stringify(received.error)}`,
              };
    },
    toBeErr(received: Result<unknown, unknown>) {
        return received.isErr()
            ? {
                  pass: true,
                  message: () => "Expected Result to be Ok but it was Err",
              }
            : {
                  pass: false,
                  message: () =>
                      `Expected Result to be Err but it was Ok: ${JSON.stringify(received.value)}`,
              };
    },
};

declare module "vitest" {
    interface Assertion<T = unknown> {
        toBeOk(): T;
        toBeErr(): T;
    }
    interface AsymmetricMatchersContaining {
        toBeOk(): void;
        toBeErr(): void;
    }
}
```

**Why dedicated matchers over manual `isOk()` checks**: `expect(result).toBeOk()` produces a meaningful Vitest diff on failure, naming the exact value or error. Manual `expect(result.isOk()).toBe(true)` only says "expected false to be true" — no indication of what the result contained.

### D4 — `renderWithProviders` as the standard integration test render

**Decision**: Create `src/tests/utils/render-with-providers.tsx` that wraps `@testing-library/react`'s `render` with the full provider stack:

```typescript
// src/tests/utils/render-with-providers.tsx
import { render, type RenderOptions } from "@testing-library/react";
import { I18nextProvider } from "react-i18next";
import { MemoryRouter } from "react-router";
import { AntConfigProvider } from "@core/presentation/context/ant-config.provider";
import i18n from "../../i18n";

function AllProviders({ children }: { children: React.ReactNode }) {
    return (
        <I18nextProvider i18n={i18n}>
            <AntConfigProvider>
                <MemoryRouter>{children}</MemoryRouter>
            </AntConfigProvider>
        </I18nextProvider>
    );
}

export function renderWithProviders(ui: React.ReactElement, options?: RenderOptions) {
    return render(ui, { wrapper: AllProviders, ...options });
}
```

**Why not wrap in the Inversify DI container**: Integration tests typically construct use case dependencies explicitly or use real instances with MSW-intercepted HTTP. Including the production `container` in the render wrapper would make every integration test load all DI bindings, coupling tests to the full module graph. Tests that need DI inject it explicitly or use `useViewModel` with a real container provided at the test level.

**Why `MemoryRouter` over `BrowserRouter`**: `MemoryRouter` works in jsdom without `window.history` limitations and does not require a DOM URL reset between tests. Each test controls initial route via `initialEntries`.

**Alternatives considered**:

- Per-test custom wrappers: Every integration test file duplicates the same provider boilerplate. A shared helper eliminates that.
- Including `RouterProvider` with the production router: Requires starting from the top-level router, which loads all lazy routes and is harder to control per-test.

### D5 — MSW handler organisation by module namespace

**Decision**: All handlers live under `src/tests/msw/handlers/` with one file per feature module:

```
src/tests/msw/handlers/
├── index.ts          ← barrel: export const handlers = [...tripHandlers, ...itineraryHandlers, ...]
├── trip.handlers.ts  ← added in proposal 06
├── itinerary.handlers.ts ← added in proposal 09
├── activity.handlers.ts  ← added in proposal 10
└── ...
```

At this point (proposal 04) only `index.ts` exists, exporting an empty `handlers` array. Each feature proposal adds its own handler file and extends the barrel.

**Server (`src/tests/msw/server.ts`)**: Node environment only, used by Vitest integration tests:

```typescript
import { setupServer } from "msw/node";
import { handlers } from "./handlers";
export const server = setupServer(...handlers);
```

**Browser worker (`src/tests/msw/browser.ts`)**: Browser environment only, used by Vite dev mode and Vitest browser tests:

```typescript
import { setupWorker } from "msw/browser";
import { handlers } from "./handlers";
export const worker = setupWorker(...handlers);
```

**Why separate server and worker**: `msw/node` uses Node's `http` interception; `msw/browser` registers a service worker. They cannot be swapped. Separating the files prevents accidental Node-only imports in browser bundles and vice versa.

### D6 — MSW dev mode activation in `main.tsx`

**Decision**: Conditionally start the MSW browser worker before React renders:

```typescript
// src/main.tsx
async function enableMocking() {
    if (import.meta.env.VITE_USE_MSW !== "true") return;
    const { worker } = await import("./tests/msw/browser");
    return worker.start({ onUnhandledRequest: "bypass" });
}

enableMocking().then(() => {
    createRoot(document.getElementById("root")!).render(
        <StrictMode>
            <App />
        </StrictMode>,
    );
});
```

**Why dynamic import**: The MSW browser worker and service worker file (`public/mockServiceWorker.js`) are excluded from production bundles. A static `import` would include them regardless of the env flag.

**`onUnhandledRequest: "bypass"`** in the browser worker (vs `"warn"` in the test server): In dev mode, unhandled requests pass through to the real network. This avoids noise when third-party scripts (fonts, analytics) make requests that MSW shouldn't intercept. In tests, `"warn"` is better to surface missing handlers during feature development.

**`VITE_USE_MSW` type in `vite-env.d.ts`**:

```typescript
interface ImportMetaEnv {
    readonly VITE_API_BASE_URL: string;
    readonly VITE_USE_MSW: string;
    readonly VITE_APP_STAGE: string;
}
```

### D7 — Storybook with `@storybook/react-vite` builder

**Decision**: Use `@storybook/react-vite` which reuses the existing `vite.config.base.ts` directly — same SWC transform, same path aliases (`vite-tsconfig-paths`), same Tailwind plugin.

**`.storybook/main.ts`**:

```typescript
import type { StorybookConfig } from "@storybook/react-vite";

const config: StorybookConfig = {
    stories: ["../src/**/*.stories.tsx"],
    addons: [
        "@storybook/addon-essentials",
        "@storybook/addon-a11y",
        "@storybook/addon-interactions",
    ],
    framework: {
        name: "@storybook/react-vite",
        options: {
            builder: { viteConfigPath: "./vite.config.base.ts" },
        },
    },
};

export default config;
```

**Why `vite.config.base.ts` (not `vite.config.ts`)**: The main `vite.config.ts` conditionally merges `localConfig` (proxy, HMR, checker) or `prodConfig` (minification, chunk splitting). Storybook needs neither — it has its own dev server and its own build pipeline. Pointing at `base.ts` gives Storybook exactly the plugins it needs without the local/prod overrides.

**Alternatives considered**:

- `@storybook/react-webpack5`: Separate bundler, slower, incompatible with Vite-specific features (`import.meta`, CSS modules). No reason to add a second bundler.
- Storybook without a custom Vite config: Storybook would not pick up `vite-tsconfig-paths`, breaking all `@core/*`, `@trip/*` path aliases in stories.

### D8 — Storybook global decorators

**Decision**: `.storybook/preview.ts` registers three global decorators applied to every story:

1. **`I18nextProvider`** with the shared `i18n` instance (default language `es`) — stories display translated text without manual `t()` calls
2. **`AntConfigProvider`** with the Wanderlust theme — stories use branded antd components out of the box
3. **`MemoryRouter`** — stories with `Link` or `useNavigate` work without a full router setup

```typescript
// .storybook/preview.ts
import type { Preview, Decorator } from "@storybook/react";
import { I18nextProvider } from "react-i18next";
import { MemoryRouter } from "react-router";
import { AntConfigProvider } from "../src/modules/core/presentation/context/ant-config.provider";
import i18n from "../src/i18n";

const withProviders: Decorator = (Story) => (
    <I18nextProvider i18n={i18n}>
        <AntConfigProvider>
            <MemoryRouter>
                <Story />
            </MemoryRouter>
        </AntConfigProvider>
    </I18nextProvider>
);

const preview: Preview = {
    decorators: [withProviders],
    parameters: {
        layout: "centered",
        backgrounds: { default: "light" },
    },
};

export default preview;
```

**Why the same providers as `renderWithProviders`**: Stories and integration tests see the same rendering environment. A component that renders correctly in Storybook is guaranteed to render correctly in integration tests and vice versa.

### D9 — Coverage configuration

**Decision**: Configure V8 coverage provider with thresholds enforced per run:

```typescript
// inside vitest.config.ts global options
coverage: {
    provider: "v8",
    include: ["src/**/*.{ts,tsx}"],
    exclude: [
        "src/main.tsx",
        "src/**/*.stories.tsx",
        "src/**/*.mock.ts",
        "src/tests/**",
        "src/**/*.di.ts",
        "src/di/**",
        "src/router.tsx",
        "src/i18n.ts",
    ],
    thresholds: {
        lines: 70,
        functions: 70,
        statements: 70,
        branches: 60,
    },
    reporter: ["text", "lcov", "html"],
},
```

**Why exclude DI files and stories**: `*.di.ts` files are binding registration — they have no testable logic. Stories are test fixtures. `router.tsx` and `i18n.ts` are configuration entry points; their correctness is validated by integration tests of the pages that use them.

**Why 60% branch threshold (vs 70% for others)**: Branch coverage is harder to achieve in domain models with many guard clauses and conditional paths. 60% is a realistic initial target that tightens as coverage accumulates across proposals.

### D10 — ESLint and Knip integration

**Decision**: Add `eslint-plugin-vitest` to the existing flat config scoped to test files:

```typescript
// apps/frontend/eslint.config.ts (addition to existing config)
import pluginVitest from "eslint-plugin-vitest";

{
    files: ["src/**/*.{test,integration,browser}.{ts,tsx}"],
    plugins: { vitest: pluginVitest },
    rules: {
        ...pluginVitest.configs.recommended.rules,
        "vitest/no-skipped-tests": "warn",
        "vitest/expect-expect": "error",
    },
    settings: { vitest: { typecheck: true } },
}
```

**Knip**: Add story and test entry points so the dead-code checker does not flag test utilities or story decorators as unused:

```typescript
// knip.config.ts (addition to existing frontend workspace entry)
entry: [
    "src/main.tsx",
    "src/**/*.stories.tsx",
    "src/tests/setup/vitest-setup.ts",
    ".storybook/main.ts",
    ".storybook/preview.ts",
],
ignoreDependencies: [
    // existing entries...
    "msw",           // used via dynamic import in main.tsx
    "@storybook/addon-essentials",
    "@storybook/addon-a11y",
    "@storybook/addon-interactions",
    "eslint-plugin-vitest",
    "eslint-plugin-storybook",
],
```

## Risks / Trade-offs

**[R1] MSW browser worker requires `public/mockServiceWorker.js` to be committed** → The file is generated by `msw init public/` and must be served at the app root for the service worker to register. It should be committed and `.gitignore` must not exclude `public/mockServiceWorker.js` specifically (only `public/.env*` patterns are excluded). The file is stable between MSW minor versions.

**[R2] `defineWorkspace` runs all three projects by default on `pnpm test`** → Browser tests require Playwright and take longer. Mitigation: `--project unit` and `--project integration` flags run subsets; CI runs all. Developers are encouraged to use `--project unit` during normal development.

**[R3] Storybook and Vitest share `vite.config.base.ts` — a breaking change there affects both** → Acceptable trade-off: the alternative (separate configs per tool) causes drift and duplication. Any Vite plugin added to `base.ts` is intentionally global.

**[R4] `renderWithProviders` uses the real i18n instance (loads JSON over HTTP in jsdom)** → jsdom does not have a real fetch, so `i18next-http-backend` will fail silently and fall back to keys. Mitigation: configure `i18next` with `initImmediate: false` and inline the `common` and `validation` namespaces as inline resources in the test i18n instance. Feature-specific namespaces load from inline fixtures in their own integration tests.

**[Trade-off] No DI container in `renderWithProviders` default** → Integration tests must wire dependencies manually or use the real production container explicitly. This adds a few lines per test but keeps tests decoupled from the full module graph and easier to reason about.

## Open Questions

- None. All patterns are validated and the implementation is unambiguous.
