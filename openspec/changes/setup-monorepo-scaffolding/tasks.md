**Issue**: #1
**Rama**: `feature/01-scaffolding`

## 1. Root monorepo setup

- [x] 1.1 Create `.nvmrc` with content `22.21.0`
- [x] 1.2 Create `.npmrc` with `engine-strict=true` and `auto-install-peers=true`
- [x] 1.3 Create `.editorconfig` (UTF-8, LF, indent 2 spaces, trim trailing whitespace, Makefile tab indent)
- [x] 1.4 Create `pnpm-workspace.yaml` with `packages: [apps/*]`, version catalogs (`@types/node: 25.0.3`, `dotenv: 17.2.3`, `typescript: 5.9.3`, `zod: 4.1.12`), `allowBuilds` for `@parcel/watcher`, `@swc/core`, `esbuild`, `msw`, `blockExoticSubdeps: true`, `minimumReleaseAge: 1440`
- [x] 1.5 Create root `package.json` with `name: @wanderlust/workspace`, `version: 0.1.0`, `private: true`, `type: module`, `packageManager: pnpm@10.27.0`, `engines` (node 22.21.0, pnpm 10.27.0), scripts (`dev`, `build`, `web:dev`, `web:build`, `lint:eslint`, `lint:eslint:fix`, `lint:prettier`, `lint:prettier:fix`, `lint:knip`, `prepare: husky`), and devDependencies as specified in design.md
- [x] 1.6 Create `.gitignore` covering: node*modules, dist, *.log, _.tsbuildinfo, .env, .env.local, .env._.local, .env.keys, \*\*/.env.keys, coverage, storybook-static, .idea, .vscode/\_, .DS_Store, .pnpm-store, .claude/worktrees, .worktrees/, \*.db, openspec (ESLint ignore)

## 2. TypeScript configuration

- [x] 2.1 Create `tsconfig.base.json` with: target ES2023, module ESNext, moduleResolution bundler, strict true, skipLibCheck true, forceConsistentCasingInFileNames true, allowSyntheticDefaultImports true, esModuleInterop true, resolveJsonModule true, isolatedModules true, lib [ESNext], types []
- [x] 2.2 Create root `tsconfig.json` with `files: []` and `references: [{ path: "./apps/frontend" }]`

## 3. ESLint configuration

- [x] 3.1 Create root `eslint.config.ts` exporting `baseConfig` array: global ignores (node*modules, dist, build, coverage, .pnpm-store, \*.tsbuildinfo, .storybook, storybook-static, openspec, CLAUDE.md, AGENTS.md), `reportUnusedDisableDirectives: error`, `eslint.configs.recommended`, `tseslint.configs.recommended`, `pluginZod.configs.recommended`, custom rules (`@typescript-eslint/no-unused-vars` with `*`pattern ignore, zod rules),`eslintConfigPrettier`

## 4. Prettier configuration

- [x] 4.1 Create `.prettierrc.json` with: `singleAttributePerLine: true`, `tabWidth: 4`, override for `.nvmrc` (parser yaml), `plugins: ["prettier-plugin-organize-imports"]`

## 5. Commitlint configuration

- [x] 5.1 Create `commitlint.config.ts` extending `@commitlint/config-conventional`

## 6. Validate branch name

- [x] 6.1 Create `validate-branch-name.config.ts` with pattern `^(origin|master|main|develop){1}$|^(feature|bugfix|fix|hotfix|release)/.+$` and error message

## 7. Lint-staged configuration

- [x] 7.1 Create `lint-staged.config.ts` running: `prettier --write --ignore-unknown`, `eslint --flag v10_config_lookup_from_file --fix --max-warnings 60 --no-warn-ignored`, and `knip --max-issues 150` (callback function)

## 8. Knip configuration

- [x] 8.1 Create `knip.config.ts` with workspace `apps/frontend`: entry `src/main.tsx`, project `src/**/*.{ts,tsx}`. Add `ignoreDependencies` for build tooling not detected by knip (@tailwindcss/vite, tailwindcss, @vitejs/plugin-react-swc, vite-plugin-checker, vite-plugin-svgr, @eslint/js, globals, path, eslint-plugin-react-hooks, validate-branch-name, @commitlint/types). Add `ignore` for config files (validate-branch-name.config.ts)

## 9. Husky git hooks

- [x] 9.1 Create `.husky/pre-commit` with: `export NODE_OPTIONS="--experimental-strip-types"`, `validate-branch-name`, `lint-staged --config lint-staged.config.ts`
- [x] 9.2 Create `.husky/commit-msg` with: `commitlint --edit $1`

## 10. Frontend package.json

- [x] 10.1 Create `apps/frontend/package.json` with `name: @wanderlust/frontend`, `private: true`, `version: 0.1.0`, `type: module`, `packageManager: pnpm@10.27.0`, `engines` (node 22.21.0, pnpm 10.27.0), scripts (`dev`, `build`, `build:typecheck`, `dev:typecheck`, `preview`, `lint:stylelint`, `lint:stylelint:fix`), dependencies and devDependencies as specified in design.md version tables

## 11. Frontend TypeScript config

- [x] 11.1 Create `apps/frontend/tsconfig.app.json` extending `../../tsconfig.base.json` with: composite true, jsx react-jsx, lib [ESNext, DOM, DOM.Iterable], experimentalDecorators true, emitDecoratorMetadata true, types [vite/client, node], baseUrl `.`, paths for all module aliases (`@di/*` → `src/di/*`, `@wanderlust/*` → `src/*`, `@tests/*` → `tests/*`, `@core/*` → `src/modules/core/*`, `@trip/*` → `src/modules/trip/*`, `@itinerary/*` → `src/modules/itinerary/*`, `@activity/*` → `src/modules/activity/*`, `@budget/*` → `src/modules/budget/*`, `@map-view/*` → `src/modules/map-view/*`, `@share/*` → `src/modules/share/*`, `@dashboard/*` → `src/modules/dashboard/*`, `@analytics/*` → `src/modules/analytics/*`), include [src, tests]

## 12. Vite configuration

- [x] 12.1 Create `apps/frontend/vite.config.base.ts` with plugins: `@vitejs/plugin-react-swc` (tsDecorators true), `vite-tsconfig-paths`, `vite-plugin-svgr`, `@tailwindcss/vite`. Set build target ES2023, SCSS preprocessor modern-compiler API
- [x] 12.2 Create `apps/frontend/vite.config.local.ts` with `vite-plugin-checker` (TypeScript true, ESLint with `./src/**/*.{ts,tsx}` flat config, Stylelint with `./src/**/*.{css,scss}`, overlay initialIsOpen error). Dev server: watch with usePolling true (ignored coverage/html), strictPort true, host 0.0.0.0, proxy `/api` to `process.env.VITE_PROXY_TARGET || http://localhost:3000`
- [x] 12.3 Create `apps/frontend/vite.config.prod.ts` (empty, extensible — returns `{}`)
- [x] 12.4 Create `apps/frontend/vite.config.ts` composing base + local (serve) or base + prod (build) via `mergeConfig`

## 13. Frontend ESLint config

- [x] 13.1 Create `apps/frontend/eslint.config.ts` importing `baseConfig` from `../../eslint.config.ts`, adding: ignores for config files (lint-staged, playwright, stylelint, vitest configs, mockServiceWorker.js, locales), `...baseConfig`, `...reactHooks.configs["flat/recommended"]`, languageOptions with `parserOptions: { projectService: true }`, rule `no-console: warn`

## 14. Stylelint config

- [x] 14.1 Create `apps/frontend/stylelint.config.cjs` with plugins [stylelint-scss], extends [stylelint-config-standard, stylelint-config-standard-scss, stylelint-config-prettier-scss], ignoreFiles [coverage, html, dist], rules: `selector-pseudo-class-no-unknown` (ignore global), `at-rule-no-deprecated` (ignore apply), `at-rule-no-unknown: null`, `scss/at-rule-no-unknown` (ignore tailwind, apply, reference, theme)

## 15. HTML entry point

- [x] 15.1 Create `apps/frontend/index.html` with: doctype html, lang en, meta charset UTF-8, meta viewport, favicon link, div#root, script module `src/main.tsx`, title "Wanderlust — Travel Itinerary Planner"

## 16. Frontend source files

- [x] 16.1 Create `apps/frontend/src/main.tsx` with minimal entry: import React StrictMode, import createRoot, import App, import `./styles/tailwind.css`, render `<StrictMode><App /></StrictMode>` into `#root`
- [x] 16.2 Create `apps/frontend/src/App.tsx` as a minimal placeholder component returning a div with "Wanderlust" text styled with Tailwind `tw:` prefix classes
- [x] 16.3 Create `apps/frontend/src/vite-env.d.ts` with triple-slash reference to `vite/client`

## 17. Tailwind CSS and design tokens

- [x] 17.1 Create `apps/frontend/src/styles/design-tokens.css` with `@theme` block defining: colors (primary #007934, primary-light, success, error, warning, text, text-secondary, text-tertiary, bg-container, bg-layout, border, border-secondary), font family (--font-wanderlust: Montserrat, system-ui, sans-serif), font sizes (sm 14px, base 16px, lg 18px, xl 20px, 2xl 24px), border radius (default 3px, lg 12px, sm 3px), control heights (default 40px, lg 48px, sm 32px), shadows
- [x] 17.2 Create `apps/frontend/src/styles/tailwind.css` with: `@import "tailwindcss"`, `@import "tailwindcss" prefix(tw)`, `@import "tailwindcss" important`, `@import "./design-tokens.css"`. Add base layer with body background-size cover

## 18. Environment variables

- [x] 18.1 Create `apps/frontend/.env.example` with: `VITE_API_BASE_URL=http://localhost:3000/api`, `VITE_USE_MSW=true`, `VITE_APP_STAGE=development`, `VITE_MAP_TILE_URL=https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png`

## 19. Module directory structure

- [x] 19.1 Create empty directory structure with `.gitkeep` files for all modules: `src/modules/{core,trip,itinerary,activity,budget,map-view,share,dashboard,analytics}/{domain,data,presentation}/`
- [x] 19.2 Create empty directories with `.gitkeep` for: `src/di/`, `src/@types/`, `tests/msw/handlers/`, `tests/utils/`

## 20. Install and verify

- [ ] 20.1 Run `pnpm install` and verify zero errors
- [ ] 20.2 Run `pnpm build:typecheck` (tsc --noEmit) and verify zero errors
- [ ] 20.3 Run `pnpm lint:eslint` and verify zero errors/warnings
- [ ] 20.4 Run `pnpm lint:prettier` and verify all files formatted
- [ ] 20.5 Run `pnpm web:build` (vite build) and verify dist/ output
- [ ] 20.6 Run `pnpm web:dev` and verify dev server starts, page renders placeholder
- [ ] 20.7 Verify Husky hooks: attempt a bad commit message and confirm commitlint rejects it
- [ ] 20.8 Run `pnpm lint:knip` and verify it passes within max-issues threshold
