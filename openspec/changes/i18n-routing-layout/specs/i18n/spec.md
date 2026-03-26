## ADDED Requirements

### Requirement: i18next initialisation with browser detection and HTTP backend

The system SHALL initialise i18next with `i18next-browser-languagedetector` (detection order: `querystring → localStorage → navigator`) and `i18next-http-backend` that loads translations from `public/locales/{lng}/{ns}.json`. The default language SHALL be `es` with `en` as fallback. Initialisation MUST complete before the React tree renders.

#### Scenario: App loads with Spanish browser locale

- **WHEN** a user opens the app with browser language set to `es`
- **THEN** i18next detects `es` as the active language and loads Spanish translations

#### Scenario: App loads with English browser locale

- **WHEN** a user opens the app with browser language set to `en`
- **THEN** i18next detects `en` as the active language and loads English translations

#### Scenario: App loads with unsupported locale

- **WHEN** a user opens the app with browser language set to `fr` (unsupported)
- **THEN** i18next falls back to `es` as the default language

#### Scenario: Language persisted in localStorage

- **WHEN** a user has previously selected `en` and it is stored in localStorage
- **THEN** i18next uses `en` regardless of the browser's native language

### Requirement: Namespace auto-discovery via import.meta.glob

The system SHALL use Vite's `import.meta.glob` to discover all JSON files in `public/locales/es/` at build time and extract their filenames as namespace identifiers. These namespaces SHALL be passed to `i18next.init()` as the `ns` option.

#### Scenario: New namespace file added

- **WHEN** a developer adds `public/locales/es/trip.json` and `public/locales/en/trip.json`
- **THEN** the `trip` namespace is automatically available via `t("trip:key")` without modifying `i18n.ts`

#### Scenario: Initial namespaces loaded

- **WHEN** the app starts
- **THEN** the `common` and `validation` namespaces are loaded (they contain initial content), along with any other namespace files present in the locales directory

### Requirement: Translation file structure per module

The system SHALL provide translation files in `public/locales/{lng}/` with one JSON file per namespace. Initial namespaces with content SHALL be `common` (app title, navigation labels, generic actions like save/cancel/delete/confirm, empty states, error messages) and `validation` (shared form validation messages like required, minLength, maxLength, invalidDate). Placeholder namespace files (`trip.json`, `itinerary.json`, `activity.json`, `dashboard.json`, `share.json`) SHALL be created as empty `{}` in both `es` and `en`.

#### Scenario: Common namespace contains core UI text

- **WHEN** a component renders using `t("common:appTitle")`
- **THEN** the translated app title is displayed in the active language

#### Scenario: Validation namespace contains form messages

- **WHEN** a form field fails validation for being required
- **THEN** the translated message from `t("validation:required")` is available

#### Scenario: Module placeholder namespaces exist but are empty

- **WHEN** the app loads the `trip` namespace
- **THEN** it loads successfully with no keys (empty object), ready for future content

### Requirement: Type-safe translation keys

The system SHALL augment the `i18next` module via `src/@types/i18next.d.ts` with `CustomTypeOptions` pointing to a `Resources` type defined in `src/@types/resources.d.ts`. This SHALL provide TypeScript autocomplete and compile-time checking for translation keys and namespaces. The default namespace SHALL be `common`.

#### Scenario: Valid translation key autocompletes

- **WHEN** a developer types `t("common:` in their IDE
- **THEN** autocomplete suggests all keys defined in `common.json`

#### Scenario: Invalid translation key causes type error

- **WHEN** a developer writes `t("common:nonExistentKey")`
- **THEN** TypeScript reports a type error at compile time

### Requirement: useAppTranslation hook

The system SHALL provide a `useAppTranslation(ns)` hook that wraps `react-i18next`'s `useTranslation` with proper typing for the project's namespaces. It SHALL return the same `{ t, i18n }` tuple with namespace-scoped type safety.

#### Scenario: Hook used with specific namespace

- **WHEN** a component calls `useAppTranslation("common")`
- **THEN** the returned `t` function is scoped to `common` namespace keys with full type safety

### Requirement: Language switching

The system SHALL allow the active language to be changed at runtime via `i18n.changeLanguage(lng)`. When changed, all rendered translations MUST update reactively. The selected language SHALL be persisted to localStorage by the language detector so it survives page reloads.

#### Scenario: User switches from Spanish to English

- **WHEN** the user triggers a language change to `en`
- **THEN** all visible translated text updates to English immediately and the choice persists across reloads
