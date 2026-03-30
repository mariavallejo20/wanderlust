## ADDED Requirements

### Requirement: AppLayout with header and content area

The system SHALL provide an `AppLayout` component that renders an Ant Design `Layout` with a fixed `Header` containing the `AppHeader` component, and a `Content` area that renders the React Router `<Outlet />`. The layout SHALL fill the full viewport height.

#### Scenario: Layout renders header and routed content

- **WHEN** the user navigates to any route
- **THEN** the AppHeader is visible at the top and the matched route's page renders in the content area below

#### Scenario: Layout fills viewport

- **WHEN** the page has minimal content
- **THEN** the layout still fills the full viewport height with the content area expanding to fill available space

### Requirement: AppHeader with app title and language selector

The `AppHeader` component SHALL render the application title ("Wanderlust") on the left side and a language selector on the right side. The header SHALL use the primary color as background with white text.

#### Scenario: Header displays app title

- **WHEN** any page is rendered
- **THEN** the header shows "Wanderlust" as the app title

#### Scenario: Header is responsive

- **WHEN** the viewport is narrow (mobile)
- **THEN** the header adapts its padding and the title and language selector remain accessible

### Requirement: Language selector switches active language

The header SHALL include a language selector (dropdown or segmented control) that displays the available languages (`es`, `en`). Selecting a language SHALL call `i18n.changeLanguage()` and update all translations reactively. The selector SHALL reflect the currently active language.

#### Scenario: User switches to English

- **WHEN** the user selects "English" from the language selector
- **THEN** `i18n.changeLanguage("en")` is called, all UI text updates to English, and the selector shows English as active

#### Scenario: User switches to Spanish

- **WHEN** the user selects "Español" from the language selector
- **THEN** `i18n.changeLanguage("es")` is called, all UI text updates to Spanish, and the selector shows Spanish as active

#### Scenario: Selector shows current language on load

- **WHEN** the app loads with `es` as the detected language
- **THEN** the language selector shows Spanish as the active option

### Requirement: Ant Design ConfigProvider with design token theme

The system SHALL wrap the React tree with an Ant Design `ConfigProvider` that applies a custom theme. The theme token values SHALL be derived from the CSS design tokens in `design-tokens.css` via a `design-tokens.ts` parser. The mapping SHALL include:

- `colorPrimary` → `#007934`
- `colorSuccess` → `#52c41a`
- `colorError` → `#ff4d4f`
- `colorWarning` → `#faad14`
- `fontFamily` → `Montserrat, system-ui, sans-serif`
- `fontSize` → `16`
- `borderRadius` → `3`
- `controlHeight` → `40`
- `colorBgLayout` → `#f5f5f5`
- `colorBgContainer` → `#fff`
- `colorBorder` → `#d9d9d9`
- `colorText` → `rgba(0,0,0,0.88)`
- `colorTextSecondary` → `rgba(0,0,0,0.65)`
- `boxShadow` / `boxShadowSecondary` → matching CSS shadow values

#### Scenario: Ant Design button uses primary color

- **WHEN** a component renders `<Button type="primary" />`
- **THEN** the button background is `#007934` (the design token primary color)

#### Scenario: Ant Design input uses Montserrat font

- **WHEN** a component renders `<Input />`
- **THEN** the input text uses the Montserrat font family

#### Scenario: Design token change propagates to antd

- **WHEN** a developer changes `--color-primary` in `design-tokens.css`
- **THEN** the next build picks up the new value in the antd theme automatically (single source of truth)

### Requirement: Ant Design locale synced with i18n language

The `ConfigProvider` SHALL pass the matching Ant Design locale object (`es_ES` for Spanish, `en_GB` for English) based on the current i18next language. When the language changes, the antd locale MUST update reactively.

#### Scenario: Antd components show Spanish text

- **WHEN** the active language is `es`
- **THEN** Ant Design components (date pickers, pagination, table, etc.) render their built-in text in Spanish

#### Scenario: Language switch updates antd locale

- **WHEN** the user switches from `es` to `en`
- **THEN** Ant Design components update their built-in text to English

### Requirement: Design tokens TypeScript export

The system SHALL provide `src/styles/design-tokens.ts` that imports `design-tokens.css` as raw text and parses CSS custom properties into a typed object (`designTokens`). This object SHALL expose colour, font, radius, control height, and shadow values that can be consumed by the Ant Design theme and any programmatic usage.

#### Scenario: Token object matches CSS values

- **WHEN** `design-tokens.css` defines `--color-primary: #007934`
- **THEN** `designTokens.color.primary` equals `"#007934"`

#### Scenario: Numeric tokens parsed as numbers

- **WHEN** `design-tokens.css` defines `--font-size-base: 16px`
- **THEN** `designTokens.font.sizeBase` equals `16` (number, not string)

#### Scenario: Missing token throws error

- **WHEN** the parser looks for a token name that does not exist in the CSS file
- **THEN** it throws an error indicating which token is missing

### Requirement: Provider composition root in App.tsx

`App.tsx` SHALL be the provider composition root with the following nesting: `AntConfigProvider` → `Suspense` (with Spin fallback) → `RouterProvider`. `main.tsx` SHALL import `i18n.ts` as a side-effect before rendering and `reflect-metadata` for Inversify.

#### Scenario: App renders with all providers

- **WHEN** the app starts
- **THEN** the React tree is wrapped with AntConfigProvider (theme + locale), Suspense (lazy loading fallback), and RouterProvider (routing)

#### Scenario: Lazy route shows spinner while loading

- **WHEN** a route chunk is being loaded
- **THEN** a centered Ant Design `Spin` component is displayed as the Suspense fallback
