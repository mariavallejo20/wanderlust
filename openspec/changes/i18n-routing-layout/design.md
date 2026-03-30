## Context

Proposals 01 and 02 delivered the monorepo scaffolding and core DI infrastructure (Inversify container, Http/Axios, EventBus, SessionStorage, BaseViewModel). The frontend entry point (`main.tsx` → `App.tsx`) renders a static placeholder with no routing, no translations, and no Ant Design theme.

All dependencies required for this proposal are already installed: `i18next`, `react-i18next`, `i18next-browser-languagedetector`, `i18next-http-backend`, `react-router`, `antd`, `@ant-design/icons`. Design tokens exist in `src/styles/design-tokens.css` with colors, typography, spacing, and shadows.

## Goals / Non-Goals

**Goals:**

- Every user-facing string goes through i18n from day one — no hardcoded text in components
- Routes are lazy-loaded so adding a new module page is a one-line addition
- Ant Design components inherit Wanderlust branding (colors, fonts, radius) without per-component overrides
- The layout provides a consistent shell (header + content) that all pages inherit via Outlet
- File structure matches the Clean Architecture module pattern so feature proposals slot in without restructuring

**Non-Goals:**

- Authentication guards (no auth in v1)
- Real page content — only translated placeholder titles
- Storybook or MSW integration (proposal 04)
- Mobile-native navigation patterns (hamburger menu, drawer) — basic responsive is enough
- Footer component (added when there's content for it)

## Decisions

### D1 — i18n namespace discovery via `import.meta.glob`

**Choice**: Use Vite's `import.meta.glob("/locales/es/*.json")` to auto-discover namespace filenames at build time, then pass them as `ns` to `i18next.init()`.

**Why over manual list**: Adding a new module's translations (e.g., `trip.json`) requires zero changes to `i18n.ts` — just drop the file in `public/locales/{lng}/`. This prevents namespace drift between the file system and the config.

**Alternative considered**: Hardcoded namespace array in `i18n.ts`. Rejected because it's a maintenance burden and risks missing namespaces when new modules are added.

### D2 — Type-safe translations via manual `i18next.d.ts` + `resources.d.ts`

**Choice**: Augment `i18next` module with `CustomTypeOptions` pointing to a `Resources` type. For now, maintain `resources.d.ts` manually (it only has `common` and `validation`). When the number of namespaces grows (proposal 04+), introduce `i18next-resources-for-ts` to auto-generate it.

**Why**: Full autocomplete on `t("common:appTitle")` from the start. The manual approach is fine for 2 namespaces; auto-generation adds a build step that isn't justified yet.

**Alternative considered**: Skip type-safety and use plain `t("key")`. Rejected — catching typos at build time is worth the small type file.

### D3 — Centralised `route-paths.ts` + per-module router files

**Choice**: `route-paths.ts` exports a `RoutePaths` object with static segments and helper functions for parameterised paths. Each module exports its own `{module}.router.tsx` that defines its `<Route>` tree with lazy-loaded pages. The main `router.tsx` composes them under the root `AppLayout` route.

**Why**: Modules own their routes, avoiding a monolithic router file. `route-paths.ts` prevents magic strings and gives a single place to see all URLs.

**Pattern**:

```typescript
// route-paths.ts
export const RoutePaths = {
    dashboard: "/",
    tripDetail: (tripId: string) => `/trips/${tripId}`,
    itinerary: (tripId: string) => `/trips/${tripId}/itinerary`,
    budget: (tripId: string) => `/trips/${tripId}/budget`,
    mapView: (tripId: string) => `/trips/${tripId}/map`,
    shared: (shareId: string) => `/shared/${shareId}`,
} as const;
```

```typescript
// modules/dashboard/dashboard.router.tsx
export const dashboardRouter = (
    <Route
        index
        lazy={async () => {
            const { DashboardPage } = await import(
                "@dashboard/presentation/pages/dashboard/dashboard-page"
            );
            return { Component: DashboardPage };
        }}
    />
);
```

### D4 — Design tokens: CSS → TS parser using `?raw` import

**Choice**: `design-tokens.ts` imports `design-tokens.css?raw` and parses CSS custom properties with regex into a typed object. The Ant Design theme and any programmatic usage consume this object.

**Why**: Single source of truth. Tokens are authored in CSS (where Tailwind reads them via `@theme`), and the TS parser extracts the same values for antd's `ConfigProvider`. No risk of CSS and JS diverging.

**Pattern**:

```typescript
import cssRaw from "./design-tokens.css?raw";

function parseVar(name: string): string {
    const re = new RegExp(`${name}:\\s*(.+?)\\s*;`);
    const match = cssRaw.match(re);
    if (!match) throw new Error(`Token ${name} not found`);
    return match[1];
}
```

### D5 — Ant Design theme structure

**Choice**: Create `ant-design.theme.ts` that builds a `ThemeConfig` from `designTokens`, covering global tokens (colors, fonts, radius, control heights, shadows) and component-level overrides (Button font weight, Input active shadow, Card border radius).

**Why**: Centralises all antd customisation. Feature components use antd out of the box without custom styles.

**Locale sync**: `AntConfigProvider` reads the current i18n language and passes the matching antd locale (`es_ES` / `en_GB`) to `ConfigProvider`.

### D6 — Layout: AppLayout + AppHeader as core presentation components

**Choice**: Place layout components in `src/modules/core/presentation/components/layout/`. `AppLayout` renders antd `Layout` with `Header` + `Content` + `<Outlet />`. `AppHeader` renders the app title and a language selector dropdown.

**Structure**:

```
src/modules/core/presentation/
├── components/
│   └── layout/
│       ├── app-layout/
│       │   └── app-layout.component.tsx
│       └── app-header/
│           ├── app-header.component.tsx
│           └── language-selector.component.tsx
├── context/
│   ├── ant-config.provider.tsx
│   └── ant-design.theme.ts
└── hook/
    └── use-app-translation/
        └── use-app-translation.hook.ts
```

**Why**: Layout is cross-cutting infrastructure — it belongs in `core`, not a standalone module. The Outlet pattern means adding new pages requires zero changes to the layout.

### D7 — Language management: simple hook, no full DI layer

**Choice**: Use a `useAppTranslation(ns)` hook wrapping `useTranslation` for type-safe namespace access, and call `i18n.changeLanguage()` directly from the language selector. Skip a full LanguageRepository/UseCase/Datasource DI layer.

**Why**: Wanderlust has no auth, no server-side language persistence, and no external consumers of language state. The full DI layer would add 4-5 files with no benefit at this scale. If language logic grows (e.g., persisting preference to backend), it can be promoted to a DI-managed service later.

**Alternative considered**: Full DI pattern (LanguageRepository + datasource + useCase + RxJS Observable). Rejected as over-engineering for a simple `changeLanguage()` call.

### D8 — Placeholder pages in module directories

**Choice**: Create minimal placeholder pages directly in their future module directories (e.g., `src/modules/dashboard/presentation/pages/dashboard/dashboard-page.tsx`) rather than a single `pages/` folder.

**Why**: When feature proposals start (05+), the page file already exists in the right location. The module directory structure is ready for domain/data layers to be added alongside it.

### D9 — Provider composition in App.tsx

**Choice**: `App.tsx` becomes the composition root:

```
AntConfigProvider → App (antd locale sync) → Suspense (lazy route fallback) → RouterProvider
```

`main.tsx` imports `i18n.ts` as a side-effect (before React renders) and `reflect-metadata` (for Inversify).

**Why**: Separates initialisation (main.tsx) from provider tree (App.tsx). The Suspense boundary around RouterProvider catches all lazy-loaded route chunks with a single Spin fallback.

## Risks / Trade-offs

**[Risk] Namespace auto-discovery depends on Vite's `import.meta.glob`** → This is a Vite-specific API. If the build tool changes, the glob call needs migration. Mitigation: the fallback is trivial (replace with a hardcoded array). Vite is deeply embedded in the project anyway.

**[Risk] Manual `resources.d.ts` can drift from JSON files** → If someone adds a key to `common.json` but forgets to update the type file, TS won't autocomplete it. Mitigation: the type file is small (2 namespaces). A later proposal can introduce auto-generation.

**[Risk] Design tokens CSS parsing with regex is fragile** → An unusual formatting change in `design-tokens.css` could break the parser. Mitigation: the regex is simple (`name:\s*(.+?)\s*;`), the CSS file is auto-formatted by Prettier, and the pattern is straightforward to debug.

**[Trade-off] Simpler language management vs full DI pattern** → We gain fewer files and faster delivery. We lose RxJS-based reactivity for language changes across non-React code. Acceptable because Wanderlust has no non-React consumers of language state.

## Open Questions

(none)
