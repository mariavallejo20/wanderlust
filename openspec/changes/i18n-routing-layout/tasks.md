## 1. Design Tokens TypeScript Export

- [ ] 1.1 Create `src/styles/design-tokens.ts` — import `design-tokens.css?raw`, implement `parseVar(name)` and `parseNum(name)` helpers, export `designTokens` object with `color`, `font`, `radius`, `control`, and `shadow` groups matching all CSS custom properties. Import alias: `@wanderlust/styles/design-tokens`

## 2. i18n Configuration

- [ ] 2.1 Create translation files in `public/locales/es/common.json` and `public/locales/en/common.json` with keys: `appTitle`, `nav.dashboard`, `nav.trips`, `actions.save`, `actions.cancel`, `actions.delete`, `actions.confirm`, `actions.back`, `emptyState.title`, `emptyState.description`, `error.generic`, `error.notFound`, `pages.dashboard`, `pages.tripDetail`, `pages.itinerary`, `pages.budget`, `pages.mapView`, `pages.shared`, `pages.notFound`, `notFound.message`, `notFound.backHome`
- [ ] 2.2 Create translation files in `public/locales/es/validation.json` and `public/locales/en/validation.json` with keys: `required`, `minLength`, `maxLength`, `invalidDate`, `invalidEmail`, `invalidUrl`, `positiveNumber`, `endAfterStart`
- [ ] 2.3 Create empty placeholder namespace files (`{}`) for both `es` and `en`: `trip.json`, `itinerary.json`, `activity.json`, `dashboard.json`, `share.json`
- [ ] 2.4 Create `src/i18n.ts` — initialise i18next with `i18next-browser-languagedetector` (detection order: `querystring`, `localStorage`, `navigator`), `i18next-http-backend` (loadPath: `/locales/{{lng}}/{{ns}}.json`), namespace auto-discovery via `import.meta.glob("/locales/es/*.json")`, default language `es`, fallback `en`, default namespace `common`
- [ ] 2.5 Create `src/@types/resources.d.ts` — type definition exporting `Resources` interface with `common` and `validation` namespace types imported from the JSON files
- [ ] 2.6 Create `src/@types/i18next.d.ts` — augment `i18next` module with `CustomTypeOptions` setting `defaultNS: "common"` and `resources: Resources`
- [ ] 2.7 Create `src/modules/core/presentation/hook/use-app-translation/use-app-translation.hook.ts` — typed wrapper over `useTranslation(ns)` returning `{ t, i18n }`

## 3. Ant Design Theme and ConfigProvider

- [ ] 3.1 Create `src/modules/core/presentation/context/ant-design.theme.ts` — build `ThemeConfig` from `designTokens` mapping global tokens (colors, fonts, radius, control heights, shadows) and component overrides (Button fontWeight, Input activeShadow, Card borderRadius)
- [ ] 3.2 Create `src/modules/core/presentation/context/ant-config.provider.tsx` — `AntConfigProvider` component wrapping `ConfigProvider` with the theme and antd locale synced to i18n language (`es_ES` / `en_GB`), using `useTranslation` to react to language changes

## 4. Route Paths and Module Routers

- [ ] 4.1 Create `src/route-paths.ts` — export `RoutePaths` object with `dashboard: "/"` and helper functions `tripDetail(tripId)`, `itinerary(tripId)`, `budget(tripId)`, `mapView(tripId)`, `shared(shareId)` returning resolved path strings
- [ ] 4.2 Create placeholder page `src/modules/dashboard/presentation/pages/dashboard/dashboard-page.tsx` — displays translated title `t("common:pages.dashboard")`
- [ ] 4.3 Create placeholder page `src/modules/trip/presentation/pages/trip-detail/trip-detail-page.tsx` — displays translated title `t("common:pages.tripDetail")`
- [ ] 4.4 Create placeholder page `src/modules/itinerary/presentation/pages/itinerary/itinerary-page.tsx` — displays translated title `t("common:pages.itinerary")`
- [ ] 4.5 Create placeholder page `src/modules/budget/presentation/pages/budget/budget-page.tsx` — displays translated title `t("common:pages.budget")`
- [ ] 4.6 Create placeholder page `src/modules/map-view/presentation/pages/map-view/map-view-page.tsx` — displays translated title `t("common:pages.mapView")`
- [ ] 4.7 Create placeholder page `src/modules/share/presentation/pages/shared/shared-page.tsx` — displays translated title `t("common:pages.shared")`
- [ ] 4.8 Create not-found page `src/modules/core/presentation/pages/not-found/not-found-page.tsx` — displays translated message and a link back to dashboard using `RoutePaths.dashboard`
- [ ] 4.9 Create `src/modules/dashboard/dashboard.router.tsx` — export `dashboardRouter` with index route using `lazy` to import `DashboardPage`
- [ ] 4.10 Create `src/modules/trip/trip.router.tsx` — export `tripRouter` with `/trips/:tripId` route and nested children (itinerary, budget, map) using `lazy`
- [ ] 4.11 Create `src/modules/share/share.router.tsx` — export `shareRouter` with `/shared/:shareId` route using `lazy`
- [ ] 4.12 Create `src/router.tsx` — `createBrowserRouter` composing `AppLayout` as root route with `dashboardRouter`, `tripRouter`, `shareRouter`, and catch-all not-found route

## 5. Layout Components

- [ ] 5.1 Create `src/modules/core/presentation/components/layout/language-selector/language-selector.component.tsx` — Ant Design `Select` or `Dropdown` displaying `es`/`en` options, calls `i18n.changeLanguage()` on selection, shows current language as active
- [ ] 5.2 Create `src/modules/core/presentation/components/layout/app-header/app-header.component.tsx` — Ant Design `Layout.Header` with app title "Wanderlust" on the left and `LanguageSelector` on the right, primary color background, responsive padding
- [ ] 5.3 Create `src/modules/core/presentation/components/layout/app-layout/app-layout.component.tsx` — Ant Design `Layout` with `AppHeader` + `Layout.Content` wrapping `<Outlet />`, full viewport height

## 6. App Entry Point Integration

- [ ] 6.1 Update `src/App.tsx` — replace placeholder with provider composition: `AntConfigProvider` → `Suspense` (fallback: centered `Spin`) → `RouterProvider` with the router
- [ ] 6.2 Update `src/main.tsx` — add `import "./i18n"` side-effect import before React render (after `reflect-metadata` and DI container imports)

## 7. Verification

- [ ] 7.1 Verify `pnpm build` completes without errors (TypeScript compilation, Vite bundle)
- [ ] 7.2 Verify `pnpm lint` passes (ESLint, Prettier, Stylelint)
- [ ] 7.3 Verify dev server renders AppLayout with header, language selector works, routes navigate correctly, translations switch between es/en
