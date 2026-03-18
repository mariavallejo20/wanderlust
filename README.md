# Wanderlust

Aplicacion web SPA para planificar y organizar viajes de forma visual, detallada y sencilla. Crea viajes, define itinerarios dia a dia con actividades categorizadas, controla tu presupuesto, visualiza tus planes en un mapa interactivo y comparte o exporta tus itinerarios.

## Que problema resuelve

Las alternativas actuales para planificar viajes son fragmentadas: hojas de calculo, notas en el movil, links en favoritos, PDFs de reservas... Wanderlust centraliza toda la planificacion en una interfaz visual e intuitiva con timeline, mapa, presupuesto y exportacion.

## Stack tecnologico

| Categoria | Tecnologia |
|---|---|
| Package manager | pnpm 10.x (monorepo workspaces) |
| Framework | React 19 |
| Lenguaje | TypeScript 5.9 (strict) |
| Build | Vite 7 + SWC |
| Estilos | Tailwind CSS 4 + Ant Design 6 |
| Estado | MobX 6 + mobx-react |
| DI | Inversify 7 |
| Routing | React Router 7 |
| HTTP | Axios + neverthrow (Result pattern) |
| Validacion | Zod 4 |
| Formularios | react-hook-form + Zod resolver |
| i18n | i18next + react-i18next |
| Mapa | Leaflet + react-leaflet (OpenStreetMap) |
| Testing | Vitest 4 + Playwright + MSW 2 |
| Backend | Fastify 5 + Drizzle ORM + SQLite |
| DX | ESLint 9, Prettier, Stylelint, Husky, commitlint, Knip, Storybook 10 |

## Arquitectura

Clean Architecture con separacion estricta domain/data/presentation:

```
Presentation (Pages, ViewModels, Components)
       |
    Domain (Models, Use Cases, Repository interfaces)
       |
     Data (Datasources, DTOs, Mappers, Repository implementations)
       |
  Infrastructure (Http, DI Container, EventBus, i18n)
```

- **Domain models ricos**: clases con constructor privado, factory methods, validacion Zod, branded types, `Result<T, E>`
- **Repository pattern**: mocks sustituibles por API real sin tocar capas superiores
- **MVVM con MobX**: ViewModels inyectables via Inversify, stores observables
- **Testing multi-nivel**: unit, integration, browser y e2e

## Estructura del monorepo

```
wanderlust/
├── apps/
│   ├── frontend/          # SPA React
│   └── backend/           # API Node.js (Fastify + SQLite)
├── pnpm-workspace.yaml
├── package.json
├── tsconfig.base.json
└── eslint.config.ts
```

## Setup local

```bash
# Requisitos: Node.js 22+, pnpm 10+

# 1. Clonar
git clone <repo-url> wanderlust && cd wanderlust

# 2. Instalar dependencias
pnpm install

# 3. Configurar variables de entorno
cp apps/frontend/.env.example apps/frontend/.env

# 4. Arrancar
pnpm dev
```

