## ADDED Requirements

### Requirement: Storybook with react-vite builder

The project SHALL configure Storybook 9 using the `@storybook/react-vite` framework at `.storybook/main.ts`. The builder SHALL reuse `vite.config.base.ts` so path aliases and plugins are available in stories without duplication.

#### Scenario: Storybook starts successfully

- **WHEN** a developer runs `pnpm storybook` in `apps/frontend/`
- **THEN** the Storybook dev server starts on port 6006 and the browser displays the Storybook UI

#### Scenario: Path aliases resolve in stories

- **WHEN** a story file imports a component using `@core/presentation/components/feedback/spin/wl-spin.component`
- **THEN** Storybook resolves the alias correctly and the story renders without import error

#### Scenario: Storybook discovers all story files

- **WHEN** a `.stories.tsx` file is created anywhere under `src/`
- **THEN** Storybook discovers and registers the story automatically via the `src/**/*.stories.tsx` glob

---

### Requirement: Global provider decorators

Every story SHALL receive global decorators providing `I18nextProvider`, `AntConfigProvider`, and `MemoryRouter`. Decorators SHALL be registered in `.storybook/preview.ts` and SHALL use the same shared instances as `renderWithProviders`.

#### Scenario: Story renders translated text

- **WHEN** a story renders a component that calls `useTranslation`
- **THEN** the translated string is displayed using the default language (`es`) without manual i18n setup in the story

#### Scenario: Story renders Ant Design components with Wanderlust theme

- **WHEN** a story renders any Wl\* wrapper component (e.g., `WlButton`)
- **THEN** the component displays with Wanderlust brand colours and typography, not the default antd theme

#### Scenario: Story renders components using React Router hooks

- **WHEN** a story renders a component that calls `useNavigate` or renders a `<Link>`
- **THEN** the story renders without throwing a router context error

---

### Requirement: Storybook addons

The Storybook configuration SHALL include three addons: `@storybook/addon-essentials` (controls, actions, docs, viewport), `@storybook/addon-a11y` (accessibility audit), and `@storybook/addon-interactions` (play function testing).

#### Scenario: Controls panel is available

- **WHEN** a story defines `argTypes` or component props
- **THEN** the Controls panel in Storybook displays interactive prop controls

#### Scenario: Accessibility panel is available

- **WHEN** a developer opens any story
- **THEN** the Accessibility panel runs an axe audit and reports violations

#### Scenario: Interactions panel is available

- **WHEN** a story defines a `play` function
- **THEN** the Interactions panel shows the step-by-step execution and pass/fail status

---

### Requirement: Storybook scripts in package.json

`apps/frontend/package.json` SHALL provide `storybook` (dev server) and `build-storybook` (static build) scripts. The root `package.json` SHALL provide a `storybook` convenience script.

#### Scenario: Dev server starts via root script

- **WHEN** a developer runs `pnpm storybook` from the repository root
- **THEN** the Storybook dev server starts in `apps/frontend/`

#### Scenario: Static build completes

- **WHEN** a developer runs `pnpm build-storybook` in `apps/frontend/`
- **THEN** a static Storybook is generated in `apps/frontend/storybook-static/`

---

### Requirement: storybook-static excluded from git

The generated `storybook-static/` directory SHALL be listed in the root `.gitignore` so built artefacts are never committed.

#### Scenario: storybook-static is not tracked by git

- **WHEN** a developer runs `pnpm build-storybook` and then `git status`
- **THEN** `apps/frontend/storybook-static/` does not appear as an untracked or modified file
