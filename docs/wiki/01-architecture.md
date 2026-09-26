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
| **PWA & Offline First** | `vite-plugin-pwa` + Workbox | Manifiesto PWA, Service Worker, cacheo de assets e instalación nativa |
| **Gestor de Estado** | Zustand + Middleware `persist` | Estado global reactivo, mínimo boilerplate y sync con LocalStorage |
| **Backend & Cloud DB** | Supabase (PostgreSQL + Auth + RLS) | Autenticación con JWT, persistencia en la nube y aislamiento por usuario |
| **Gráficos & Métricas** | Recharts 2.x | Visualización SVG declarativa adaptada a Liquid Glass |
| **Iconografía** | Lucide React | Iconos vectoriales limpios y consistentes |
| **Persistencia Local** | LocalStorage (`fluo_finance_storage_v3`) | Resiliencia offline y almacenamiento local de contingencia |
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
├── supabase/
│   └── schema.sql                  # DDL de PostgreSQL con políticas Row Level Security (RLS)
├── src/
│   ├── assets/                     # Imágenes y vectores estáticos
│   ├── components/
│   │   ├── auth/                   # Autenticación Liquid Glass
│   │   │   ├── AuthScreen.tsx      # Formulario reactivo de Login / Registro
│   │   │   └── SignOutConfirmModal.tsx # Confirmación modal de cierre de sesión
│   │   ├── common/                 # Primitivas Liquid Glass
│   │   │   ├── BrandAvatar.tsx     # Avatar de marca con cascada SVG y fallback
│   │   │   ├── CategoryIcon.tsx    # Icono Lucide de categoría con badge vítreo
│   │   │   ├── ErrorBoundary.tsx   # Escudo contra errores de renderizado
│   │   │   ├── GlassButton.tsx     # Botón háptico con material translúcido
│   │   │   ├── GlassCard.tsx       # Contenedor refractante con luz perimetral
│   │   │   ├── PillarBadge.tsx     # Insignia semántica de pilar financiero
│   │   │   └── PWAInstallPrompt.tsx # Banner inteligente de instalación PWA (Android / iOS)
│   │   ├── layout/                 # Estructura del dispositivo móvil
│   │   │   ├── FloatingNavbar.tsx  # Barra inferior flotante simétrica Liquid Glass (grid 4-cols)
│   │   │   └── MobileContainer.tsx # Contenedor responsive max-w-md
│   │   ├── home/                   # Vista de Inicio
│   │   │   ├── HeroBalance.tsx     # Tarjeta principal con balance neto y tasa de ahorro
│   │   │   ├── MetricPillars.tsx   # Los 3 pilares (Ingresos, Gastos, Inversión)
│   │   │   ├── RecentTransactionsList.tsx # Listado de últimos movimientos filtrable con modal de edición
│   │   │   ├── SwipeableTransactionItem.tsx # Elemento deslizable bidireccional (derecha: editar, izquierda: eliminar)
│   │   │   └── RecurrenceSummaryWidget.tsx # Widget de pagos y cobros próximos recurrentes
│   │   ├── investments/            # Vista de Cartera de Inversiones
│   │   │   ├── AddAssetModal.tsx   # Modal legado/independiente de alta de activos
│   │   │   └── InvestmentsView.tsx # Tarjetas de activos, rentabilidad P&L y filtros
│   │   ├── analytics/              # Vista de Estadísticas Financieras
│   │   │   └── AnalyticsView.tsx   # Selector de periodos, distribución y top marcas
│   │   └── forms/                  # Formularios modales unificados
│   │       ├── BrandPicker.tsx     # Buscador reactivo de marcas y brokers con autocompletado
│   │       └── QuickAddTransactionModal.tsx # Modal unificado de nuevo movimiento (Gasto / Ingreso / Inversión)
│   ├── context/
│   │   └── AuthContext.tsx         # Gestión global de sesión Supabase y estado de auth
│   ├── data/
│   │   ├── categoriesAndBrands.ts  # Catálogo oficial de categorías y 40+ marcas
│   │   └── initialMockData.ts      # Semilla inicial con transacciones y activos
│   ├── lib/
│   │   └── supabaseClient.ts       # Cliente Supabase tipado y mapeadores DB ↔ Frontend
│   ├── services/
│   │   ├── cloudSyncService.ts     # Sincronización reactiva bidireccional y CRUD en la nube
│   │   ├── companySearchService.ts # Motor de búsqueda global de empresas (Clearbit 25M+)
│   │   ├── marketDataService.ts    # Motor de búsqueda semántica, cotizaciones en vivo y caché resiliente
│   │   ├── priceFeedService.ts     # Puente compatible de cotizaciones
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

---

## 8. Búsqueda y Cotización en Tiempo Real de Inversiones (`marketDataService.ts`)

Fluo cuenta con un subsistema financiero de búsqueda inteligente y cotizaciones en vivo diseñado para garantizar máxima disponibilidad y fidelidad de datos sin depender de claves privadas ni verse bloqueado por restricciones de red.

### 1. Búsqueda Semántica Multi-Criterio (`searchAssets`)
Permite localizar cualquier instrumento mediante:
- **Nombres de Índices y Fondos**: Búsquedas como `"S&P 500"`, `"MSCI Europe"`, `"MSCI World"`, `"Nasdaq 100"` resuelven de inmediato los ETFs y fondos indexados asociados (`VUSA`, `VOO`, `SPY`, `VWCE`, `SWDA`, `IMEU`).
- **Nombres de Empresas y Marcas**: `"Apple"`, `"Santander"`, `"Nvidia"`, `"Microsoft"`, `"Inditex"`, `"BBVA"`, `"Tesla"`, `"Amazon"`.
- **Tickers Bursátiles**: `AAPL`, `BTC`, `ETH`, `SAN.MC`, `ITX.MC`, `NVDA`.
- **Códigos ISIN Normalizados**: `IE00B4L5Y983`, `IE00BK5BQT80`, `IE00B03HD191`, `ES0000012K21`.
- **Símbolos Personalizados**: Si el usuario introduce un ticker o ISIN no catalogado, el motor genera dinámicamente una opción para darlo de alta de inmediato.

### 2. Estrategia Híbrida de Cotizaciones y Resiliencia Offline
1. **Conexión a Endpoints Públicos en Vivo**: Para criptoactivos (`BTC`, `ETH`, `SOL`, etc.), el motor consulta en tiempo real el ticker de 24h de la API abierta de Binance con timeout agresivo (2s).
2. **Caché Local Persistente (`fluo_market_quotes_cache_v1`)**: Toda cotización recuperada se almacena en `localStorage` (y en memoria como fallback para testing y entornos aislados).
3. **Manejo de Caídas de Red y Rate-Limits**: Si la red falla, la API excede su cuota o hay problemas de CORS, el motor devuelve la última cotización conocida con el flag `isOfflineCached: true`, mostrando en la tarjeta del activo el badge `Dato en caché`.

### 3. Motor de P&L Dinámico en Cartera (`InvestmentsView.tsx`)
Calcula en tiempo real con estética Liquid Glass:
- **Capital Invertido**: `(cantidad * precio_compra) + comisiones`.
- **Valor Actual de Mercado**: `cantidad * precio_actual_real`.
- **Ganancia/Pérdida Neta**: `valor_actual - capital_invertido`.
- **Rentabilidad Porcentual**: `((valor_actual - capital_invertido) / capital_invertido) * 100`.
- **Métricas Globales de Cabecera**: Patrimonio total invertido y P&L global no realizado con feedback semántico (esmeralda translúcido para plusvalías, carmesí para minusvalías).

---

## 9. Flujo Unificado de Movimientos e Inversiones (`QuickAddTransactionModal.tsx`)

Para evitar duplicidad de formularios y unificar la experiencia de usuario bajo el paradigma Liquid Glass:

1. **Punto Único de Entrada (+)**:
   - El botón central flotante de la barra de navegación (`FloatingNavbar.tsx`) es ahora el punto de entrada maestro para registrar cualquier movimiento económico.
   - Se suprimió el botón redundante "Añadir Inversión" del encabezado de `InvestmentsView.tsx`.
   - **Detección Contextual de Pestaña**: Si el modal se abre mientras el usuario navega en la vista `/invest`, el modal preselecciona de forma automática el pilar de **Inversión**.

2. **Formulario Adaptativo de Inversión**:
   Al seleccionar el pilar `Inversión`:
   - Despliega el buscador en vivo con autocompletado semántico para instrumentos financieros (`marketDataService.ts`).
   - Muestra precios oficiales de mercado, variación 24h y autocompleta nombre, ticker e ISIN.
   - Ofrece cálculo bidireccional entre cantidad de participaciones/títulos y precio de compra unitario, sincronizando el importe total desembolsado.
   - **Selector de Broker / Plataforma**: Utiliza el componente reutilizable `BrandPicker` configurado con `categoryId="cat-invest"`, desplegando pastillas rápidas de brokers oficiales (MyInvestor, Trade Republic, Degiro, Interactive Brokers, Binance, Kraken, Scalable Capital, Coinbase, etc.), búsqueda global y alta de entidades personalizadas.
   - Configuración opcional de comisiones iniciales y fecha de adquisición.
   - Soporte para aportaciones automáticas recurrentes (DCA - Dollar Cost Averaging).

3. **Doble Registro Atómico**:
   Al confirmar el formulario con el pilar `invest`:
   - Inserta el activo en la cartera de inversiones (`addAsset`), asociándole `brandId` y el nombre de la plataforma.
   - Registra de forma paralela el apunte en el libro de transacciones (`addTransaction`) con pilar `'invest'`, importe, categoría correspondiente y marca del broker, garantizando que el flujo de caja refleje la salida del capital invertido.

---

## 10. Contextualización Dinámica de Pilares en Home y Refracción Atmosférica

El Dashboard principal implementa una experiencia reactiva al filtro de pilares:

1. **Estado Compartido y Deselección Inteligente**:
   - Al pulsar un pilar en `MetricPillars` (Ingresos, Gastos, Cartera), el estado `selectedPillar` conmuta al modo seleccionado.
   - Si se pulsa de nuevo o se hace clic en la pastilla `Ver Todo ✕` de la cabecera, regresa al estado neutro global (`'all'`).

2. **Transformación de Tarjeta Principal (`HeroBalance.tsx`)**:
   - **Modo Global (`all`)**: Muestra *Patrimonio Neto Total*, Tasa de Ahorro y Rendimiento global.
   - **Modo Ingresos (`income`)**: Muestra *Total Ingresos* en verde esmeralda con signo `+`, junto a métricas de *Ingresos Recurrentes* (fijos/nómina) y *Mayor Ingreso*.
   - **Modo Gastos (`expense`)**: Muestra *Total Gastos* en rojo coral con signo `-`, junto a métricas de *Gasto Medio Diario* (ritmo del mes) y *Gastos Recurrentes* (suscripciones/fijos).
   - **Modo Inversión (`invest`)**: Muestra *Cartera de Inversión* en índigo, *Patrimonio Invertido* (coste base) y *P&L No Realizado* con su porcentaje y tendencia.

3. **Inmersión Atmosférica (`MobileContainer.tsx`)**:
   - Los orbes de luz ambiental de fondo y el sustrato vítreo de pantalla completa adoptan transiciones suaves (`duration-700`):
     - Ingresos: Halo y tinte esmeralda (`bg-emerald-950/20`).
     - Gastos: Halo y tinte coral (`bg-rose-950/20`).
     - Inversión: Halo y tinte índigo (`bg-indigo-950/25`).
     - Neutro: Iluminación multicromática balanceada.

---

## 11. Backend Oficial, Autenticación y Sincronización en la Nube (Supabase)

Fluo integra **Supabase** como backend oficial para autenticación y persistencia de datos relacionales en la nube, operando bajo un modelo híbrido *Offline-First* con sincronización reactiva (*Optimistic UI*):

### 1. Cliente Tipado y Aislamiento (`supabaseClient.ts`)
- Configurado a partir de variables de entorno seguras (`VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY`).
- Esquema de base de datos tipado en TypeScript (`Database`) con soporte para tablas `transactions` e `investments`.
- Funciones bidireccionales de mapeo que traducen de forma transparente entre la convención `camelCase` del frontend de Fluo y `snake_case` de PostgreSQL.

### 2. Ciclo de Vida de Autenticación (`AuthContext.tsx`)
- Contexto centralizado que expone `user`, `session`, `loading`, `signInWithEmail`, `signUpWithEmail`, `signOut`, `enterDemoMode` y `exitDemoMode`.
- Escucha continua mediante `supabase.auth.onAuthStateChange` para mantener la sesión sincronizada ante renovaciones de tokens JWT, inicio o cierre de sesión en otras pestañas.
- Modo Demo no intrusivo: permite a desarrolladores o evaluadores explorar la aplicación localmente sin necesidad de registrar credenciales.

### 3. Pantalla de Bienvenida y Autenticación Liquid Glass (`AuthScreen.tsx`)
- Formulario mobile-first sobre una tarjeta flotante `bg-slate-900/60 backdrop-blur-2xl border border-white/15 rounded-3xl`.
- Destello especular cenital, alternador suave de cápsula para Login / Registro, soporte de visibilidad de contraseña y alertas translúcidas rojas (`bg-rose-500/10 border-rose-500/20 text-rose-300`).

### 4. Ciclo de Sincronización Reactiva (*Optimistic UI + Background Cloud Sync*)
- **Lectura Inicial (`SELECT`)**: Al autenticarse el usuario, `loadCloudData(user.id)` consulta en paralelo las tablas `transactions` e `investments` filtrando por `user_id = user.id`.
- **Escrituras Inmediatas (`INSERT / UPDATE / DELETE`)**:
  - Toda adición, modificación o eliminación se aplica de inmediato al store de Zustand (`useFinanceStore`), garantizando una respuesta táctil instantánea a 60 FPS sin latencias de red.
  - En segundo plano, `cloudSyncService.ts` ejecuta la mutación correspondiente en Supabase (`insertCloudTransaction`, `deleteCloudTransaction`, `insertCloudAsset`, etc.).
- **Manejo de Errores y Caídas de Red**: Si Supabase no responde o la red cae, el estado local permanece activo y se registra una advertencia, evitando bloqueos en la interfaz.

### 5. Seguridad a Nivel de Fila (Row Level Security - RLS)
- Definido en [`supabase/schema.sql`](file:///c:/Users/santi/Documents/UNI/Fluo/supabase/schema.sql).
- Cada usuario autenticado posee aislamiento criptográfico estricto mediante políticas RLS en PostgreSQL:
  ```sql
  CREATE POLICY "Users can view their own transactions"
      ON public.transactions FOR SELECT
      USING (auth.uid() = user_id);
  ```
  Impidiendo que un usuario pueda acceder, modificar o eliminar registros de cualquier otra cuenta.

---

## 12. Progressive Web App (PWA) y Experiencia Nativa Mobile

Fluo está optimizada como una PWA de alto rendimiento instalable como aplicación nativa en iOS (Safari WebKit) y Android (Chromium):

### 1. Configuración de Manifiesto y Service Worker (`vite-plugin-pwa`)
- Integrado en [`vite.config.ts`](file:///c:/Users/santi/Documents/UNI/Fluo/vite.config.ts) con estrategia `registerType: 'autoUpdate'`.
- Generación automática de `manifest.webmanifest` con:
  - Nombre: "Fluo", `short_name`: "Fluo".
  - Pantalla completa: `display: "standalone"`, orientación fija `portrait`.
  - Color de tema y fondo: `#0B0F19` (Obsidiana).
  - Iconos de alta densidad en `/public`: `icon-192.jpg` y `icon-512.jpg` con propósitos `any` y `maskable`.

### 2. Estrategia de Caché Offline (Workbox)
- **Precaching Estático**: HTML, JS, CSS compilados, SVG y tipografías empaquetadas.
- **Runtime Caching**:
  - Fuentes de Google (`fonts.googleapis.com` y `fonts.gstatic.com`): `CacheFirst` con expiración a 1 año.
  - Imágenes y logos de marcas (`.png`, `.jpg`, `.svg`, etc.): `StaleWhileRevalidate` con un límite de 50 entradas y 30 días de persistencia.

### 3. Integración para iOS / Safari Standalone
- Configurado en [`index.html`](file:///c:/Users/santi/Documents/UNI/Fluo/index.html):
  - `<meta name="apple-mobile-web-app-capable" content="yes" />`
  - `<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />`
  - `<meta name="apple-mobile-web-app-title" content="Fluo" />`
  - `<link rel="apple-touch-icon" href="/icon-180.jpg" />`
  - Viewport inmersivo con `viewport-fit=cover` y prevención de escalado accidental `user-scalable=no`.
- Soporte para áreas seguras (`safe-area-inset`) en [`MobileContainer.tsx`](file:///c:/Users/santi/Documents/UNI/Fluo/src/components/layout/MobileContainer.tsx) mediante padding adaptativo `pt-[max(1.5rem,env(safe-area-inset-top))]` y `pb-[max(7rem,calc(env(safe-area-inset-bottom)+5.5rem))]`.

### 4. Prompt de Instalación Inteligente Liquid Glass (`PWAInstallPrompt.tsx`)
- Detecta si la aplicación ya se ejecuta en modo `standalone`.
- En Chromium/Android: captura el evento `beforeinstallprompt` y presenta un botón de instalación con un solo toque.
- En iOS: presenta una guía contextual amigable explicando cómo usar el botón "Compartir" y "Añadir a la pantalla de inicio".

---

## 13. Blindaje de Ciberseguridad en Dispositivo Móvil & Nivel 1

Fluo implementa un modelo de defensa en profundidad (*Defense in Depth*) adaptado a finanzas personales en movilidad:

### 1. Bloqueo por Inactividad & Segundo Plano (`useSecurityLock.ts`)
- **Detección de Inactividad (3 Minutos)**: Temporizador continuo reseteado por interacciones del usuario (`touchstart`, `click`, `mousemove`, `keydown`, `scroll`). Si transcurren 180 segundos continuos sin actividad con PIN activo, la aplicación se bloquea de forma preventiva.
- **Segundo Plano Inteligente (`visibilitychange`)**: Al conmutar de pestaña o ventana, se registra la marca temporal. Al regresar, el sistema calcula si transcurrieron los 3 minutos de inactividad (`Date.now() - lastActivity >= 180s`). Si el usuario vuelve tras unos segundos o un lapso inferior, la app continúa abierta de forma fluida sin requerir desbloqueo forzado.
- **Ofuscación de Privacidad**: El contenido del dashboard se desenfoca de forma automática (`filter blur-2xl opacity-40 pointer-events-none`) evitando capturas de pantalla accidentales en el selector de aplicaciones de iOS/Android cuando la pantalla está bloqueada.

### 2. Criptografía Local y Bóveda de PIN (`SecurityLockScreen.tsx`)
- **Hashing SHA-256**: Los PINs de 4 dígitos nunca se persisten en texto plano. Se procesan mediante la Web Cryptography API nativa (`crypto.subtle.digest('SHA-256')`) con sal interna de aplicación (`fluo_salt_v1_...`), neutralizando ataques de diccionario o tablas arcoíris en almacenamiento local.
- **Diseño Liquid Glass Refractivo**: Telón de pantalla completa `fixed inset-0 z-[100] backdrop-blur-3xl bg-slate-950/85`, teclado numérico táctil translúcido y feedback háptico con animación de sacudida (*shake*) ante PIN incorrecto.

### 3. Autenticación Biométrica Nativa (WebAuthn)
- **API `PublicKeyCredential`**: Integración con el estándar W3C WebAuthn para desbloqueo rápido mediante Face ID, Touch ID, Windows Hello o sensor de huella dactilar de Android.
- **Fallback Automático**: Si el usuario no tiene biometría configurada o cancela el sensor, el flujo conmuta suavemente al teclado numérico de 4 dígitos.

### 4. Purga Integral y Sanitización de Datos (`purgeUserData`)
- Al confirmar el cierre de sesión en [`SignOutConfirmModal.tsx`](file:///c:/Users/santi/Documents/UNI/Fluo/src/components/auth/SignOutConfirmModal.tsx):
  - Se eliminan explícitamente las claves de estado de Zustand: `fluo_finance_storage_v3`, `fluo_finance_storage_v2`, `fluo_finance_storage_v1`.
  - Se purga la caché de cotizaciones financieras de terceros `fluo_market_quotes_cache_v1`.
  - Se limpian las marcas de sesión demo y el estado de bloqueo `fluo_security_lock_state`.
  - Se resetea el store de Zustand en memoria a colecciones vacías (`transactions: []`, `assets: []`, `userId: null`), impidiendo que un segundo usuario en el mismo dispositivo pueda acceder a datos residuales en memoria o almacenamiento.

### 5. Content Security Policy (CSP) y Encabezados de Blindaje
- Configurado en [`index.html`](file:///c:/Users/santi/Documents/UNI/Fluo/index.html):
  - Directiva `connect-src` restringida a Supabase (`https://*.supabase.co`, `wss://*.supabase.co`), APIs de cotizaciones (Yahoo Finance, CoinGecko) y CDNs autorizadas de logos.
  - Protección estricta contra clickjacking: `frame-ancestors 'none'`, `object-src 'none'`, `base-uri 'self'`, `form-action 'self'`.
  - Protección de tipos MIME con `X-Content-Type-Options: nosniff`.
  - Política de referencia `Referrer-Policy: strict-origin-when-cross-origin`.

---

## 14. Optimización de Rendimiento, Aceleración GPU & Estrategia de Bundling

Fluo está optimizada para garantizar una tasa de refresco constante de 60/120 fps en smartphones de alta y media gama, sub-second FCP/LCP y bajo consumo de memoria RAM/VRAM:

### 1. Aceleración por GPU y Composición de Liquid Glass
- **Aislamiento en Capa de Composición (`transform: translateZ(0)` / `will-change: transform`)**:
  - Clase utilitaria `.gpu-layer` y `transform-gpu` aplicada exclusivamente a contenedores fijos y modales:
    - [`FloatingNavbar.tsx`](file:///c:/Users/santi/Documents/UNI/Fluo/src/components/layout/FloatingNavbar.tsx) (Barra inferior flotante fija).
    - [`SecurityLockScreen.tsx`](file:///c:/Users/santi/Documents/UNI/Fluo/src/components/security/SecurityLockScreen.tsx) (Telón de seguridad y teclado numérico).
    - [`QuickAddTransactionModal.tsx`](file:///c:/Users/santi/Documents/UNI/Fluo/src/components/forms/QuickAddTransactionModal.tsx) (Modal de nuevo movimiento).
    - [`TimeSimulatorModal.tsx`](file:///c:/Users/santi/Documents/UNI/Fluo/src/components/common/TimeSimulatorModal.tsx) (Simulador temporal).
    - [`SignOutConfirmModal.tsx`](file:///c:/Users/santi/Documents/UNI/Fluo/src/components/auth/SignOutConfirmModal.tsx) (Confirmación de cierre).
  - Este aislamiento impide *paint storms* (repintados continuos del lienzo) al hacer scroll por el feed de transacciones.
- **Transiciones Compuestas**:
  - Las transiciones de tarjetas utilizan de forma estricta propiedades compuestas por GPU (`transform`, `opacity`), eliminando transiciones pesadas de `box-shadow` o `filter`.
- **Degradación Elegante & Accesibilidad**:
  - Media query `@media (prefers-reduced-motion: reduce)`: Desactiva animaciones y transiciones reduciendo la carga en CPUs modestas.
  - `@supports not (backdrop-filter: blur(1px))`: Degrada de forma automática a fondos sólidos translúcidos (`bg-slate-900/95`) en dispositivos antiguos que no soportan aceleración nativa de filtros de fondo.

### 2. Code Splitting, Lazy Loading & Pre-compresión
- **Carga Perezosa con `React.lazy` y `<Suspense>`** en [`App.tsx`](file:///c:/Users/santi/Documents/UNI/Fluo/src/App.tsx):
  - `AnalyticsView`: La pesada librería de gráficos Recharts (~400 kB) se extrae del bundle inicial y solo se descarga cuando el usuario navega a la pestaña de estadísticas.
  - `InvestmentsView`: Vista de activos bursátiles diferida a demanda.
  - Modales pesados (`QuickAddTransactionModal`, `TimeSimulatorModal`, `SignOutConfirmModal`, `SecurityLockScreen`) cargados bajo demanda únicamente al abrirse.
- **Particionamiento Manual de Chunks (`manualChunks`)** en [`vite.config.ts`](file:///c:/Users/santi/Documents/UNI/Fluo/vite.config.ts):
  - `vendor-react`: Núcleo de React 19 y React DOM (~207 kB / 65 kB gzip).
  - `vendor-charts`: Motor SVG de Recharts (~397 kB / 113 kB gzip).
  - `vendor-supabase`: Cliente de base de datos Supabase (~214 kB / 55 kB gzip).
  - `vendor-icons`: Iconografía Lucide React (~17 kB / 6 kB gzip).
  - `vendor-state`: Gestor reactivo Zustand (~3.4 kB / 1.5 kB gzip).
  - **Resultado**: El código JS inicial de la aplicación se reduce en más de un 65% (de 1,031 kB monolítico a solo ~115 kB JS inicial), logrando First Contentful Paint (FCP) casi instantáneo.
- **Pre-compresión de Assets (`vite-plugin-compression`)**:
  - Generación automática en cada build de archivos `.gz` (Gzip) y `.br` (Brotli) para servir assets pre-comprimidos con transferencia de red ultrarrápida.

### 3. Virtualización y Renderizado Eficiente de Listas
- **Selectores de Zustand con `useShallow`**:
  - Implementado en [`RecentTransactionsList.tsx`](file:///c:/Users/santi/Documents/UNI/Fluo/src/components/home/RecentTransactionsList.tsx) e [`InvestmentsView.tsx`](file:///c:/Users/santi/Documents/UNI/Fluo/src/components/investments/InvestmentsView.tsx), evitando renderizados innecesarios cuando cambian partes no relacionadas del store.
- **Memorización con `React.memo`**:
  - [`SwipeableTransactionItem.tsx`](file:///c:/Users/santi/Documents/UNI/Fluo/src/components/home/SwipeableTransactionItem.tsx): Cada fila deslizable está memorizada para evitar re-renderizados ante fluctuaciones de cotizaciones o saldos ajenos.
  - `AssetCard` en [`InvestmentsView.tsx`](file:///c:/Users/santi/Documents/UNI/Fluo/src/components/investments/InvestmentsView.tsx): Memorizado de forma individual con cálculo de P&L aislado.
- **Viewport Virtualization Nativa (`.cv-auto`)**:
  - Uso de `content-visibility: auto` y `contain-intrinsic-size: 0 72px` en cada elemento de lista, permitiendo al motor del navegador ignorar el diseño y pintado de elementos fuera de pantalla sin dependencias externas.
- **Paginación por Ventana Progresiva**:
  - Carga inicial limitada a 25 movimientos con botón expansor Liquid Glass ("Mostrar más movimientos"), garantizando tiempos de renderizado de menos de 16ms en móviles.

### 4. Caché de Logos y Cotizaciones Financieras
- **Caché en Memoria de Marcas (`BrandAvatar.tsx`)**:
  - Registro global `resolvedLogoCache = new Map<string, string>()` y `failedLogoSources = new Set<string>()`.
  - Atributos `loading="lazy"` y `decoding="async"` en `<img />`. Los logotipos confirmados se recuperan instantáneamente sin parpadeos de fallback ni re-peticiones de red durante el scroll.
- **Deduplicación de Peticiones y SWR (`marketDataService.ts`)**:
  - Registro de promesas en vuelo `inFlightQuotePromises = new Map<string, Promise<MarketQuoteResult>>()`, unificando consultas concurrentes hacia el mismo ticker.
  - Estrategia *Stale-While-Revalidate* con ventana de frescura de 25 segundos (`SWR_FRESH_WINDOW_MS`), devolviendo cotizaciones cacheadas en 0ms y revalidando en segundo plano.





