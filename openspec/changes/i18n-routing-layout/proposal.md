## Why

Proposals 01 and 02 established the monorepo scaffolding and core DI/HTTP/ViewModel infrastructure. Before any feature module can render UI, we need three foundational pieces that every page depends on: internationalisation (so all user-facing text is translatable from day one), a routing skeleton (so modules can register lazy-loaded pages), and a base layout with an Ant Design theme that consumes the existing CSS design tokens. Without these, feature work would have to introduce them retroactively, creating rework across all modules.

## What Changes

- Configure i18next with browser language detection, HTTP backend loading JSON from `public/locales/{lng}/{ns}.json`, default language `es` with `en` fallback, and type-safe translation keys via `i18next.d.ts` augmentation
- Create namespace structure per module (`common`, `validation` with initial content; `trip`, `itinerary`, `activity`, `dashboard`, `share` as empty placeholders)
- Create `route-paths.ts` with typed route constants and helper functions for parameterised paths (e.g., `tripDetail(id)`)
- Configure React Router 7 with `createBrowserRouter`, a root `AppLayout` route, and child routes using `React.lazy()` for code splitting
- Create placeholder pages for all planned routes: dashboard (`/`), trip detail, itinerary, budget, map, shared view, not found
- Create `AppLayout` component: Ant Design `Layout` with header + content area wrapping the router `Outlet`
- Create `AppHeader` component: app title, language selector that switches `i18n.changeLanguage()`
- Configure Ant Design `ConfigProvider` theme mapping the existing `design-tokens.css` values (colors, typography, border radius, control heights, shadows) to antd token overrides
- Create `design-tokens.ts` exporting token values as a TS object so antd ConfigProvider and CSS share a single source of truth
- Modify `App.tsx` to become the provider composition root: `I18nextProvider` → `Suspense` → `RouterProvider`
- Modify `main.tsx` to import `i18n.ts` side-effect

## Capabilities

### New Capabilities

- `i18n`: Internationalisation system — i18next configuration, browser language detection, HTTP backend, type-safe namespaced translations, `useAppTranslation` hook, es/en locale files
- `routing`: Application routing — React Router 7 with lazy loading, centralised route-paths with typed constants and param helpers, placeholder pages for all planned routes
- `layout`: Base layout and Ant Design theme — AppLayout, AppHeader with language selector, ConfigProvider with theme tokens mapped from design-tokens.css, design-tokens.ts export

### Modified Capabilities

(none — no existing specs to modify)

## Impact

- **New files**: `src/i18n.ts`, `src/router.tsx`, `src/route-paths.ts`, `src/@types/i18next.d.ts`, `src/styles/design-tokens.ts`, layout components in `src/modules/core/presentation/`, placeholder pages in `src/modules/*/presentation/pages/`, translation files in `public/locales/`
- **Modified files**: `src/App.tsx`, `src/main.tsx`
- **Dependencies activated**: `i18next`, `react-i18next`, `i18next-browser-languagedetector`, `i18next-http-backend`, `react-router`, `antd`, `@ant-design/icons` (all already installed in proposal 01)
- **No new npm dependencies required**
- **GitHub issue**: #3
- **Branch**: `feature/03-i18n-routing`
- **Phase**: 0 (Scaffolding and setup)
- **Unblocks**: Proposal 04 (MSW/Storybook), proposals 05-08 (Trip + Dashboard — need routes, layout, and i18n to render pages)
