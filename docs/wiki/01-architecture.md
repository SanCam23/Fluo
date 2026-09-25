# 01 - Arquitectura del Sistema: Fluo

## 1. Visión General
**Fluo** es una aplicación de finanzas personales *Mobile-First* concebida con los más altos estándares de fidelidad visual y rendimiento interactivo. Implementa el lenguaje estético **Liquid Glass** (inspirado en la API nativa de iOS 26+ y traducido a Tailwind CSS v4 y CSS3 moderno).

---

## 2. Stack Tecnológico

| Capa | Tecnología | Propósito |
| :--- | :--- | :--- |
| **Framework UI** | React 19 + TypeScript | Componentización declarativa con tipado estricto |
| **Bundler & Tooling** | Vite 8 + `@tailwindcss/vite` | HMR ultra-rápido, tree-shaking y compilación de CSS v4 |
| **Motor de Estilos** | Tailwind CSS v4 (Engine Oxide) | Clases de utilidad, soporte nativo de `@theme` y variables CSS |
| **Gestor de Estado** | Zustand + Middleware `persist` | Estado global reactivo, mínimo boilerplate y sync con LocalStorage |
| **Iconografía** | Lucide React | Iconos vectoriales limpios y consistentes |
| **Persistencia** | LocalStorage (Fase 1) → IndexedDB (Fase 2) | Almacenamiento local seguro de transacciones y carteras |

---

## 3. Estructura de Directorios

```text
Fluo/
├── .agents/
│   └── skills/
│       └── swiftui-liquid-glass/
│           ├── SKILL.md
│           ├── reference.md
│           └── WEB_MAPPING.md      # Guía de traslación Liquid Glass a Web
├── docs/
│   └── wiki/
│       ├── 01-architecture.md      # Este documento
│       ├── 02-data-models.md       # Esquemas y contratos de TypeScript
│       ├── 03-design-system.md     # Tokens Liquid Glass y paleta Fluo
│       └── 04-roadmap-status.md    # Estado de módulos y entregas
├── public/                         # Assets públicos y favicons
├── src/
│   ├── assets/                     # Imágenes y vectores estáticos
│   ├── components/
│   │   ├── common/                 # Primitivas Liquid Glass (GlassCard, GlassButton, PillBadge)
│   │   ├── layout/                 # MobileContainer, FloatingDock, TopBar
│   │   ├── home/                   # HeroBalance, PillarsSummary, RecentTransactions
│   │   ├── investments/            # AssetCard, PortfolioValuation, TickerSearch
│   │   ├── analytics/              # CategoryDistribution, CashflowChart, RangePicker
│   │   └── forms/                  # AddTransactionSheet, AddAssetSheet
│   ├── data/
│   │   ├── initialMockData.ts      # Datos iniciales realistas (Marcas, Tickers, Recurrencias)
│   │   └── brandsDirectory.ts      # Directorio de marcas comerciales reconocidas
│   ├── services/
│   │   ├── priceFeedService.ts     # Simulación / API en vivo de cotizaciones (Tickers/ISINs)
│   │   └── recurrenceEngine.ts     # Motor de cálculo de proyecciones y cobros
│   ├── store/
│   │   └── useFinanceStore.ts      # Store central Zustand con persistencia y selectores
│   ├── types/
│   │   └── finance.ts              # Modelado integral de entidades
│   ├── utils/
│   │   ├── currency.ts             # Formateo de divisas (EUR/USD) y porcentajes
│   │   └── dates.ts                # Operaciones de fechas y periodos
│   ├── App.tsx                     # Orquestador de vistas y layout móvil
│   ├── index.css                   # Tokens @theme Tailwind v4 y utilidades de cristal
│   └── main.tsx                    # Punto de entrada de la aplicación
```

---

## 4. Estrategia de Estado y Persistencia

1. **Store Reactivo (Zustand)**:
   - Administra el listado de transacciones, activos de inversión, marcas personalizadas, filtros de tiempo y preferencias del usuario.
   - Utiliza selectores memoizados para calcular valores derivados en tiempo real:
     - `netBalance`: Ingresos acumulados - Gastos acumulados + Valoración actual de inversiones.
     - `totalIncome`, `totalExpense`, `totalInvested`, `portfolioMarketValue`, `unrealizedPnL`.
2. **Capa de Persistencia**:
   - **Fase Actual**: `persist` de Zustand serializando en `localStorage` bajo la clave `fluo_finance_storage_v1`.
   - **Migración Proyectada**: Adaptador con `idb-keyval` / `Dexie.js` para persistencia en IndexedDB al escalar el historial a miles de registros o métricas temporales de alta resolución.
3. **Optimistic Updates**: Todas las operaciones CRUD (agregar gasto, editar inversión, marcar recurrencia) se aplican de forma inmediata en la UI con rollback en caso de error.

---

## 5. Principios de Renderizado y Liquid Glass

- **Viewport Restringido (Mobile-First)**: El layout se ancla a un contenedor central `max-w-md mx-auto min-h-screen`, simulando la experiencia de un dispositivo iOS moderno con `safe-area-inset-top` y `safe-area-inset-bottom`.
- **Regla de Oro de Desempeño**: Se evita la multiplicidad de capas de `backdrop-filter: blur()` dentro de listas virtuales o con scroll continuo. Los elementos con scroll usan fondos planos semi-translúcidos (`bg-white/[0.04]`), reservando el desenfoque volumétrico a tarjetas clave, encabezados y la barra flotante.
