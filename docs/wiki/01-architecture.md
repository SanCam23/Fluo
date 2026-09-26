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
| **Gráficos & Métricas** | Recharts 2.x | Visualización SVG declarativa adaptada a Liquid Glass |
| **Iconografía** | Lucide React | Iconos vectoriales limpios y consistentes |
| **Persistencia** | LocalStorage (Fase 1) → IndexedDB (Fase 2) | Almacenamiento local seguro de transacciones y carteras |
| **Testing Automatizado** | Vitest 5.x | Pruebas unitarias de motores lógicos y casos extremos temporales |

---

## 3. Estructura de Directorios

```text
Fluo/
├── .agents/
│   ├── rules/
│   │   └── liquid-glass.md         # Reglas maestras de desarrollo y consulta wiki
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
│   │   ├── common/                 # Primitivas Liquid Glass
│   │   │   ├── BrandAvatar.tsx     # Avatar de marca con cascada SVG y fallback
│   │   │   ├── CategoryIcon.tsx    # Icono Lucide de categoría con badge vítreo
│   │   │   ├── ErrorBoundary.tsx   # Escudo contra errores de renderizado
│   │   │   ├── GlassButton.tsx     # Botón háptico con material translúcido
│   │   │   ├── GlassCard.tsx       # Contenedor refractante con luz perimetral
│   │   │   └── PillarBadge.tsx     # Insignia semántica de pilar financiero
│   │   ├── layout/                 # Estructura del dispositivo móvil
│   │   │   ├── FloatingNavbar.tsx  # Barra inferior flotante Liquid Glass (fixed)
│   │   │   └── MobileContainer.tsx # Contenedor responsive max-w-md
│   │   ├── home/                   # Vista de Inicio
│   │   │   ├── HeroBalance.tsx     # Tarjeta principal con balance neto y tasa de ahorro
│   │   │   ├── MetricPillars.tsx   # Los 3 pilares (Ingresos, Gastos, Inversión)
│   │   │   ├── RecentTransactions.tsx # Listado de últimos movimientos con BrandAvatar
│   │   │   └── UpcomingRecurrences.tsx# Widget de pagos y cobros próximos
│   │   ├── investments/            # Vista de Cartera de Inversiones
│   │   │   ├── AddAssetModal.tsx   # Modal con búsqueda de tickers en vivo
│   │   │   └── InvestmentsView.tsx # Tarjetas de activos, rentabilidad P&L y filtros
│   │   ├── analytics/              # Vista de Estadísticas Financieras
│   │   │   └── AnalyticsView.tsx   # Selector de periodos, distribución y top marcas
│   │   └── forms/                  # Formularios modales
│   │       ├── BrandPicker.tsx     # Buscador reactivo de marcas con autocompletado
│   │       └── QuickAddTransactionModal.tsx # Modal de nueva transacción
│   ├── data/
│   │   ├── categoriesAndBrands.ts  # Catálogo oficial de categorías y 40+ marcas
│   │   └── initialMockData.ts      # Semilla inicial con transacciones y activos
│   ├── services/
│   │   ├── companySearchService.ts # Motor de búsqueda global de empresas (Clearbit 25M+)
│   │   ├── priceFeedService.ts     # API estocástica simulada de cotizaciones en tiempo real
│   │   └── recurrenceEngine.ts     # Motor de cálculo de periodicidad y vencimientos
│   ├── store/
│   │   └── useFinanceStore.ts      # Store central Zustand con persistencia y selector memoizado
│   ├── types/
│   │   └── finance.ts              # Modelado TypeScript exhaustivo de entidades
│   ├── utils/
│   │   ├── brandLogo.ts            # Resolver multi-CDN con prioridad SVG vectorial
│   │   ├── currency.ts             # Formateo de divisas (EUR/USD) y porcentajes
│   │   └── dates.ts                # Operaciones de fechas y cálculo de días
│   ├── App.tsx                     # Orquestador de navegación por pestañas y modales
│   ├── index.css                   # Tokens @theme Tailwind v4 y clases de cristal
│   └── main.tsx                    # Punto de entrada con ErrorBoundary
```

---

## 4. Estrategia de Estado y Persistencia

1. **Store Reactivo (Zustand) y Selector Seguro `useFinancialSummary`**:
   - Administra el listado de transacciones, activos de inversión, marcas personalizadas, filtros de tiempo y preferencias del usuario.
   - **Solución al bucle de renderizado en React 19**: En React 19, retornar un objeto recién instanciado `{ netBalance, totalIncome, ... }` dentro de una función de suscripción `useFinanceStore(state => state.getFinancialSummary())` rompe la igualdad referencial (`Object.is`) en cada ciclo, disparando un error de *Maximum update depth exceeded*. Para resolver esto de raíz, se implementó el hook independiente:
     ```typescript
     export function useFinancialSummary() {
       const transactions = useFinanceStore((state) => state.transactions);
       const assets = useFinanceStore((state) => state.assets);
       return useMemo(() => {
         // Cálculo memoizado reactivo únicamente ante cambios en arrays
       }, [transactions, assets]);
     }
     ```
2. **Capa de Persistencia Versionada (`fluo_finance_storage_v3`)**:
   - Serialización automática en `localStorage` con middleware `persist` de Zustand.
   - Incluye estrategia de fusión (`merge`) personalizada que preserva metadatos nuevos como `domain`, `brandColor` y `logoUrl` e incluye automáticamente las marcas dinámicas creadas o buscadas por el usuario.
   - Clave actual: `fluo_finance_storage_v3`.
3. **Escudo de Resiliencia (`ErrorBoundary`)**:
   - Envuelve el árbol raíz de React en [`main.tsx`](file:///c:/Users/santi/Documents/UNI/Fluo/src/main.tsx).
   - Proporciona recuperación visual Liquid Glass con opciones para reintentar la renderización o limpiar la caché local ante datos corruptos.

---

## 5. Principios de Renderizado y Liquid Glass

- **Viewport Restringido (Mobile-First)**: El layout se ancla a un contenedor central `max-w-md mx-auto min-h-screen`, simulando la experiencia de un dispositivo iOS moderno con `safe-area-inset-top` y `safe-area-inset-bottom`.
- **Regla de Oro de Desempeño**: Se evita la multiplicidad de capas de `backdrop-filter: blur()` dentro de listas virtuales o con scroll continuo. Los elementos con scroll usan fondos planos semi-translúcidos (`bg-white/[0.04]`), reservando el desenfoque volumétrico a tarjetas clave, encabezados y la barra flotante.
- **Logotipos e Identidad de Marcas**: Los avatares de marcas utilizan un fondo oscuro neutro `#111726` sin degradados o líneas especulares blancas que distorsionen los logotipos corporativos, garantizando que el diseño respete las guías de estilo oficiales de cada firma.

---

## 6. Arquitectura Híbrida de Marcas y Logotipos a Escala Global

Para disponer de millones de marcas y logotipos sin inflar el peso del paquete de la aplicación ni requerir la introducción manual de cada comercio, Fluo adopta una **estrategia híbrida en 4 niveles** inspirada en las fintechs más punteras (Revolut, N26, Monzo):

1. **Nivel 1: Catálogo Base Local (120+ Marcas Offline Pre-categorizadas)**:
   - Indexado en [`categoriesAndBrands.ts`](file:///c:/Users/santi/Documents/UNI/Fluo/src/data/categoriesAndBrands.ts).
   - Contiene los comercios cotidianos de mayor recurrencia en España, Europa e Iberoamérica.
   - Latencia cero, disponibilidad offline total y asignación inmediata de pilar y categoría al seleccionarse.

2. **Nivel 2: Motor de Autocompletado Global en Tiempo Real (`companySearchService.ts`)**:
   - Conexión debounced (280ms) con la API abierta de autocompletado empresarial de **Clearbit** (que indexa más de 25 millones de empresas globales).
   - Inferencia heurística de categoría por palabras clave en nombre y dominio (`inferCategoryId`).
   - Gestión de concurrencia y cancelación de peticiones desfasadas mediante `AbortController`.
   - Caché en memoria para evitar llamadas redundantes de red durante la escritura.

3. **Nivel 3: Ingesta Reactiva en el Store Local (`addBrand`)**:
   - Cuando el usuario pulsa sobre cualquier resultado del directorio global, Fluo lo transforma en una entidad `Brand` y lo inserta automáticamente en el estado de Zustand.
   - La persistencia `localStorage` (`fluo_finance_storage_v3`) lo almacena indefinidamente, haciéndolo parte del catálogo local del usuario a partir de ese momento.

4. **Nivel 4: Creación de Marcas Personalizadas al Vuelo**:
   - Si el usuario introduce un negocio local o tienda de barrio que no figura en ninguna base de datos, Fluo le permite crear la marca con un clic, generando su slug y asociándolo a la transacción.

5. **Nivel 5: Cascada de Resolución Visual de Logos (`brandLogo.ts`)**:
   - Cada marca (local, global o personalizada con dominio) se resuelve dinámicamente mediante:
     `SimpleIcons SVG` ➔ `WorldVectorLogo` ➔ `unavatar.io` ➔ `Google Favicons 128px HD` ➔ `Clearbit CDN` ➔ `CategoryIcon (Lucide Fallback)`.

---

## 7. Motor de Automatización en Cliente (`recurringEngine.ts`)

Fluo ejecuta la generación de movimientos recurrentes de manera 100% descentralizada en el cliente, asegurando que los balances históricos, estadísticas y métricas sean fieles a la realidad financiera del usuario aunque este pase semanas o meses sin acceder a la aplicación.

### Ciclo de Vida y Ejecución Automática
1. **Inicialización y Rehidratación (`onRehydrateStorage`)**:
   - Al cargar la aplicación y recuperar el estado guardado en `localStorage`, el store dispara `triggerRecurrencesCheck()`.
2. **Evaluación de Fechas Vencidas (Catch-up Histórico)**:
   - El motor compara `nextDueDate` de cada regla activa (`autoCharge !== false`) contra la fecha de referencia (fecha real del sistema o fecha del simulador).
   - Si la fecha de vencimiento es menor o igual a la fecha de corte, el motor genera la transacción correspondiente con:
     - `isRecurring: true`
     - `isRecurringGenerated: true`
     - `recurrenceId: rule.id`
     - `date: nextDue.toISOString()`
   - Avanza secuencialmente el puntero temporal de la regla (`computeNextDueDate`) repitiendo el proceso hasta alcanzar el día actual.
3. **Idempotencia y Prevención de Duplicados**:
   - Para evitar duplicación de cargos ante aperturas repetidas o recargas, cada transacción programada se identifica con una firma determinista:
     `${rule.id}_${tx.date.substring(0, 10)}`.
   - Si una transacción con dicha firma ya existe en el histórico de la app, el motor no la replica.
4. **Ajuste Inteligente a Fin de Mes (Calendar Clamping)**:
   - Si una regla se configura para el día 31 de cada mes y el mes de destino posee 28, 29 o 30 días (ej. Febrero, Abril, Noviembre), el motor clampa automáticamente el día de cobro mediante `getDaysInMonth(year, month)` asegurando que ningún movimiento se pierda o salte al mes siguiente.
5. **Finalización de Reglas (`endDate`)**:
   - Si una regla contiene una fecha límite (`endDate`) y el siguiente ciclo la sobrepasa, la regla se desactiva de forma automática (`isActive: false`).

### Herramienta de Depuración y Simulación de Tiempo (`TimeSimulatorModal.tsx`)
Para validar el comportamiento del motor sin esperar semanas reales, se integró un panel accesible desde la barra superior de Fluo:
- **Avanzar 1 semana (+7 días)** o **Avanzar 1 mes (+30 días)**.
- **Ejecutar comprobación manual en caliente**.
- **Restablecer fecha real del sistema**.
- Todas las transacciones generadas en la simulación se insertan de inmediato en el store reactivo, actualizando el saldo en pantalla, los gráficos de estadísticas y el listado de transacciones recientes con el badge `Recurrente Auto`.
