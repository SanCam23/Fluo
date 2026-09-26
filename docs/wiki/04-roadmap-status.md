# 04 - Hoja de Ruta y Estado de Módulos (Roadmap): Fluo

Control de hitos, módulos completados, en desarrollo y planificados para la aplicación de finanzas personales Fluo.

---

## Estado Actual de Módulos

| Módulo / Característica | Estado | Detalle Técnico |
| :--- | :---: | :--- |
| **Auditoría & Setup Inicial** | ✅ Completado | Vite 8 + React 19 + Tailwind CSS v4 + Skill Liquid Glass |
| **Wiki Interna de Arquitectura** | ✅ Completado | Documentación viva en `/docs/wiki/` (01 al 04) |
| **Modelado de Tipos TypeScript** | ✅ Completado | Contratos oficiales en `src/types/finance.ts` |
| **Store Central & Persistencia** | ✅ Completado | Zustand v3 con middleware `persist` en `localStorage` y selectores seguros |
| **Directorio de Marcas (120+ marcas)** | ✅ Completado | Catálogo extendido con comercios cotidianos de España, Europa y globales |
| **Buscador Interactivo & Global de Marcas** | ✅ Completado | Componente `BrandPicker.tsx` con motor en vivo `companySearchService.ts` (25M+ empresas) |
| **Resolución de Logos Vectoriales (SVG)** | ✅ Completado | Mapeo multi-fuente SVG (`SimpleIcons`, `WorldVectorLogo`, `unavatar`, `Google Favicons 128px`) |
| **Búsqueda & Cotizaciones en Vivo** | ✅ Completado | Motor `marketDataService.ts` con búsqueda semántica (S&P 500, Apple, ISIN), endpoint público cripto y caché offline |
| **Dashboard Home (Mobile-First)** | ✅ Completado | Hero Balance, 3 Pilares Liquid Glass y Movimientos Recientes con logos |
| **Barra de Navegación Flotante** | ✅ Completado | Dock Liquid Glass ultra-refractivo: `saturate-200`, `blur-3xl`, cáustica subsuperficial, biselado 3D y cápsulas vítreas |
| **Módulo de Inversiones & P&L Real** | ✅ Completado | Cartera completa con P&L dinámico, botón de sincronización oficial, cálculo de plusvalías y modal Liquid Glass |
| **Módulo de Estadísticas y Métricas (/stats)** | ✅ Completado | Visualización con Recharts: Donut con centro hueco, Barras comparativas, Área de Patrimonio Neto y Ranking de Marcas |
| **Motor de Recurrencias & Catch-up** | ✅ Completado | Motor en cliente `recurringEngine.ts`, calendar clamping para meses cortos, generación histórica idempotente |
| **Formulario Granular de Recurrencias** | ✅ Completado | Modal Liquid Glass con switch iOS, periodicidad semanal/quincenal/mensual/anual, días de semana/mes y auto-registro |
| **Formulario Unificado & Selector de Brokers** | ✅ Completado | Consolidación del alta de inversiones dentro del modal (+) de movimientos, selector de broker con `BrandPicker` y doble registro atómico |
| **Suite de Tests Unitarios (Vitest)** | ✅ Completado | 20 tests automatizados pasando: recurrencias (12 tests) + mercado y búsqueda semántica (8 tests) |
| **Simulador Temporal de Depuración** | ✅ Completado | Debug Tool `TimeSimulatorModal.tsx` con saltos de +1 semana, +1 mes, ejecución manual y badge reactivo |
| **Autenticación en la Nube (Supabase)** | ✅ Completado | Login y Registro con Liquid Glass, gestión de sesiones JWT (`AuthContext`) y bypass Demo |
| **Persistencia en la Nube & RLS** | ✅ Completado | Base de datos PostgreSQL en Supabase con Row Level Security, Optimistic UI y sincronización en segundo plano |
| **Progressive Web App (PWA & iOS WebKit)** | ✅ Completado | `vite-plugin-pwa`, Workbox offline caching, soporte WebKit standalone, `safe-area-inset` y banner inteligente |
| **Ciberseguridad Nivel 1 & Bloqueo Biométrico** | ✅ Completado | Detección de inactividad (3m), backgrounding, bóveda PIN SHA-256, WebAuthn, CSP y purga de sesión (`purgeUserData`) |
| **Optimización de Rendimiento & Aceleración GPU** | ✅ Completado | Aceleración GPU en Liquid Glass, bundle splitting (65% reducción), compresión Gzip/Brotli, viewport virtualization y SWR |
| **Documentación Oficial & README Maestro** | ✅ Completado | `README.md` exhaustivo con arquitectura, diseño Liquid Glass, ciberseguridad, guía local y despliegue |

---

## Registro de Versiones

### v0.1.0 (Entorno y Fundamentos)
- Inicialización con `@tailwindcss/vite` v4.
- Smoke test de compilación y verificación de tokens oficiales.
- Instalación de `lucide-react` y `zustand`.
- Creación de la Wiki Interna con diseño de arquitectura y modelos de datos.

### v0.2.0 (Core Data, Liquid Glass Design System & Home View)
- Modelado exhaustivo de entidades en [`finance.ts`](file:///c:/Users/santi/Documents/UNI/Fluo/src/types/finance.ts).
- Store reactivo [`useFinanceStore.ts`](file:///c:/Users/santi/Documents/UNI/Fluo/src/store/useFinanceStore.ts) con persistencia local y hook seguro `useFinancialSummary()`.
- Primitivas visuales Liquid Glass ([`GlassCard`](file:///c:/Users/santi/Documents/UNI/Fluo/src/components/common/GlassCard.tsx), [`GlassButton`](file:///c:/Users/santi/Documents/UNI/Fluo/src/components/common/GlassButton.tsx), [`PillarBadge`](file:///c:/Users/santi/Documents/UNI/Fluo/src/components/common/PillarBadge.tsx)).
- Dashboard Home interactivo con Hero Balance, 3 Pilares y Próximas Recurrencias.
- Escudo protector con [`ErrorBoundary`](file:///c:/Users/santi/Documents/UNI/Fluo/src/components/common/ErrorBoundary.tsx).

### v0.3.0 (Navegación Flotante, Logos Reales, Inversiones e Inteligencia de Estadísticas)
- **Barra Flotante Refactorizada**: Anclada en `fixed bottom-4 inset-x-4 max-w-sm mx-auto z-50` con estética nativa de iOS 26+.
- **Sistema de Logos Vectoriales (SVG)**: Resolución de logos vectoriales nítidos (`image/svg+xml`) sin halos blancos.
- **Módulo de Inversiones Completo**: Pestaña dedicada con selector por clases de activo, P&L y modal [`AddAssetModal`](file:///c:/Users/santi/Documents/UNI/Fluo/src/components/investments/AddAssetModal.tsx).
- **Módulo de Estadísticas Avanzado**: Selector de periodos temporales, barras de progreso y ranking de marcas comerciales.

### v0.3.5 (Buscador Interactivo de Marcas y Catálogo Extendido de 40+ Marcas)
- **Componente [`BrandPicker.tsx`](file:///c:/Users/santi/Documents/UNI/Fluo/src/components/forms/BrandPicker.tsx)**: Reemplazo del `<select>` tradicional por un buscador reactivo con autocompletado en tiempo real, pastillas de selección rápida (Mercadona, Netflix, Amazon...) y tarjeta de marca vinculada con botón de deselección.
- **Catálogo de 40+ Marcas Oficiales**: Integración de supermercados, streaming, delivery, movilidad, compras, telecomunicaciones y fintechs.
- **Depuración Visual**: Eliminación de cualquier línea o halo blanco en los avatares de marcas.

### v0.3.8 (Motor de Búsqueda Global de Marcas & 25M+ Empresas en Vivo)
- **Servicio [`companySearchService.ts`](file:///c:/Users/santi/Documents/UNI/Fluo/src/services/companySearchService.ts)**: Integración con la API pública de autocompletado empresarial de Clearbit para acceder dinámicamente a más de 25 millones de empresas de todo el mundo sin inflar el bundle ni necesitar claves API.
- **Inferencia Heurística de Categoría**: Algoritmo inteligente que predice la categoría adecuada (Supermercado, Suscripciones, Hostelería, Movilidad, Salud, Hogar, Finanzas) a partir del nombre comercial y dominio web.
- **Ampliación del Catálogo Base (120+ Marcas Offline)**: Cobertura integral instantánea de comercios cotidianos con asignación inmediata.
- **Ingesta Dinámica en Zustand y Persistencia**: Acción `addBrand` en [`useFinanceStore.ts`](file:///c:/Users/santi/Documents/UNI/Fluo/src/store/useFinanceStore.ts) que guarda cualquier marca global o personalizada en el catálogo permanente de `fluo_finance_storage_v3`.
- **Creación de Marcas al Vuelo**: Posibilidad de registrar cualquier negocio local o tienda de barrio con un solo toque.

### v0.4.0 (Módulo Completo de Estadísticas y Métricas Visuales con Recharts)
- **Integración de Recharts**: Librería de visualización SVG declarativa adaptada a Liquid Glass.
- **3 Tarjetas KPI Flotantes**:
  - *Tasa de Ahorro*: Porcentaje de ingresos retenidos y ahorro neto.
  - *Gasto Medio Diario*: Gasto total dividido entre los días analizados del periodo.
  - *Rendimiento de Cartera*: ROI global de inversiones (+X.XX%) y valor de mercado.
- **Gráfico de Dona (Distribución de Gastos)**:
  - Centro hueco con total gastado en doble tipografía.
  - Leyenda interactiva con pastillas de cristal, porcentajes y colores semánticos.
- **Gráfico de Barras Comparativas (Flujo de Caja)**:
  - Comparativa mensual de Ingresos (#10B981), Gastos (#EF4444) y Ahorro (#6366F1).
  - Indicador visual rápido de superávit o déficit mensual.
- **Gráfico de Área Suave (Evolución de Patrimonio Neto)**:
  - Trayectoria acumulada con gradiente translúcido `#gradientNetWorth`.
- **Ranking de Marcas Top con Logos**:
  - Top 5 comercios con podio de medallas (#1 Oro, #2 Plata, #3 Bronce), avatar oficial `BrandAvatar` y barra proporcional de progreso.
- **Filtros Temporales Intuitivos**: Segmented control con "Este Mes", "Mes Pasado", "Últimos 3 Meses", "Últimos 6 Meses", "Este Año" y "Todo".

### v0.4.5 (Lógica Completa de Recurrencias, Automatización en Cliente, Tests & Simulador)
- **Formulario con Recurrencia Granular (`QuickAddTransactionModal.tsx`)**:
  - Toggle Liquid Glass "Hacer recurrente" con switch interactivo tipo iOS.
  - Selector de frecuencias: Semanal, Quincenal, Mensual y Anual con pastillas de cristal.
  - Selector de días: días de la semana (L, M, X, J, V, S, D) para periodicidad semanal; día del mes (1 al 31) con alerta informativa de adaptación automática para meses cortos.
  - Rango de fechas (inicio y fin opcional) y toggle para auto-registro o recordatorio.
- **Motor de Automatización Descentralizado (`recurringEngine.ts`)**:
  - Algoritmo de catch-up histórico: genera de golpe todas las transacciones vencidas entre la última ejecución y hoy (o la fecha simulada).
  - Flags de auditoría: `isRecurring: true`, `isRecurringGenerated: true` y enlace `recurrenceId`.
  - Prevención de duplicados mediante firma idempotente `${ruleId}_${date}`.
  - Calendar Clamping: adaptación matemática de días inexistentes (día 31 en febrero o abril) al último día del mes.
- **Suite de Pruebas Automatizadas con Vitest (`recurringEngine.test.ts`)**:
  - 12 pruebas unitarias pasando al 100%: regla semanal, regla mensual clamped en febrero y abril, catch-up consecutivo de 3 meses, desactivación automática por `endDate` y verificación de años bisiestos.
- **Herramienta de Simulación y Depuración (`TimeSimulatorModal.tsx`)**:
  - Panel desplegable Liquid Glass en el encabezado (`Simular`).
  - Botones de salto temporal: "Avanzar 1 semana", "Avanzar 1 mes", "Ejecutar comprobación ahora" y "Restablecer tiempo".
  - Feedback visual reactivo en tiempo real con actualización inmediata del balance, transacciones y gráficos.
- **Insignia Visual en Home (`RecentTransactionsList.tsx`)**:
  - Badge estilizado con icono `Repeat` de Lucide y etiqueta `Recurrente Auto` para los movimientos generados automáticamente por el motor.

### v0.4.8 (Búsqueda Semántica de Activos, Cotizaciones en Vivo, P&L Real & Resiliencia Offline)
- **Servicio de Datos Financieros (`marketDataService.ts`)**:
  - Catálogo exhaustivo de activos: índices mundiales y ETFs (S&P 500, MSCI World, MSCI Europe, Nasdaq 100, etc.), acciones líderes globales y españolas (Apple, Nvidia, Microsoft, Amazon, Santander, BBVA, Inditex, etc.), criptomonedas, renta fija pública y depósitos remunerados.
  - Búsqueda semántica por nombre comercial, índice de referencia, Ticker bursátil o código ISIN.
  - Generador dinámico de símbolos personalizados para activos no listados.
  - Endpoint en vivo con fallback estocástico y persistencia en caché local (`fluo_market_quotes_cache_v1`).
  - Resiliencia offline total con flag `isOfflineCached` ante rate-limits o cortes de red.
- **Formulario Inteligente de Inversión (`AddAssetModal.tsx`)**:
  - Input de búsqueda en tiempo real con tarjeta flotante desplegable Liquid Glass (`bg-[#0E1526]/95 backdrop-blur-2xl border border-white/15 rounded-2xl`).
  - Precios oficiales de mercado, variación 24h y autorrelleno instantáneo al seleccionar un activo.
  - Cálculo bidireccional automático: relación interactiva entre cantidad de títulos, precio unitario y capital total desembolsado.
  - Soporte de campos de precisión: títulos fraccionados (ej. 0.045 BTC), comisiones iniciales y fecha de compra.
- **Pantalla de Inversiones con P&L Dinámico (`InvestmentsView.tsx`)**:
  - Botón "Cotizaciones" con animación de giro (`RefreshCw`) y timestamp de última sincronización.
  - Métricas de cabecera: Valor total de cartera, Patrimonio total invertido y Plusvalía/Minusvalía global no realizada (€ y %).
  - Tarjetas de activos con cálculo dinámico en tiempo real (`cantidad * precio_actual` vs coste base).
  - Feedback cromático Liquid Glass con sombras difusas: Verde esmeralda para ganancias y Rojo carmesí para pérdidas.
  - Badge visual de advertencia suave `Dato offline / en caché` cuando se recupera de la caché local.
- **Suite de Pruebas Automatizadas (`marketDataService.test.ts`)**:
  - 8 tests unitarios pasando al 100%: búsqueda semántica por índice, búsqueda por marca/empresa, búsqueda por ISIN exacto, búsqueda de criptoactivos, símbolos personalizados, fetch de cotizaciones, guardado en caché y batch update múltiple. (20 tests en total en la suite).

### v0.4.9 (Unificación de Flujo de Inversión y Selector de Broker Liquid Glass)
- **Eliminación del Botón Redundante**: Se eliminó el botón "Añadir Inversión" del encabezado en [`InvestmentsView.tsx`](file:///c:/Users/santi/Documents/UNI/Fluo/src/components/investments/InvestmentsView.tsx).
- **Consolidación en [`QuickAddTransactionModal.tsx`](file:///c:/Users/santi/Documents/UNI/Fluo/src/components/forms/QuickAddTransactionModal.tsx)**:
  - Apertura inteligente: si el modal se despliega desde la pestaña de Inversión (`activeTab === 'invest'`), se selecciona automáticamente el pilar `invest`.
  - Integración del motor de búsqueda semántica en tiempo real (`marketDataService.ts`) para autocompletar acciones, fondos indexados, ETFs y criptos.
  - Cálculo interactivo bidireccional de títulos / precio medio de compra / importe total.
- **Selector de Broker / Plataforma con [`BrandPicker.tsx`](file:///c:/Users/santi/Documents/UNI/Fluo/src/components/forms/BrandPicker.tsx)**:
  - Selector reutilizable con `categoryId="cat-invest"`, habilitando pastillas interactivas de entidades financieras (MyInvestor, Trade Republic, DEGIRO, Interactive Brokers, Scalable Capital, Binance, Kraken, etc.).
  - Búsqueda global de brokers en vivo y opción para añadir brokers personalizados.
- **Doble Registro Atómico**:
  - Inserción en la cartera de activos (`addAsset`) con `brandId` y `platform`.
  - Inserción en el libro contable de transacciones (`addTransaction`) con pilar `'invest'`, importe total y categoría adecuada, reflejando el egreso en el flujo de caja.
- **Validación & Tests**: 0 errores de compilación TypeScript (`npx tsc -b`) y 20 tests unitarios pasando al 100%.

### v0.4.10 (Refactor Ergonómico Visual: Hero Balance y Tarjeta de Movimientos)
- **Corrección de Márgenes y Sub-Métricas en [`HeroBalance.tsx`](file:///c:/Users/santi/Documents/UNI/Fluo/src/components/home/HeroBalance.tsx)**:
  - Reemplazo del contenedor colapsable horizontal por una cuadrícula de 2 columnas (`grid grid-cols-2 gap-2`).
  - Tarjetas vítreas aisladas para *Tasa de Ahorro* y *Rendimiento*: eliminación de saltos de línea antiestéticos ("Tasa de \n ahorro") y fin de la colisión entre el porcentaje y el icono Sparkles.
- **Rediseño Completo de la Tarjeta de Movimiento en [`RecentTransactionsList.tsx`](file:///c:/Users/santi/Documents/UNI/Fluo/src/components/home/RecentTransactionsList.tsx)**:
  - **Eliminación de la etiqueta de texto del pilar (`EXPENSE`, `INCOME`, `INVEST`)**: El color del importe (`text-rose-400`, `text-emerald-400`, `text-indigo-400`) y el signo ya comunican inequívocamente la naturaleza del movimiento sin sobrecargar la interfaz.
  - **Alineación en Doble Eje Paralelo**:
    - Eje Central: Concepto en fila 1 (sin truncamientos tempranos) y Categoría + Badge de recurrencia en fila 2.
    - Eje Derecho: Importe prominente en fila 1 y fecha relativa en fila 2 (`Hoy`, `Ayer`, `24 sept`).
  - **Separación Limpia de Avatar**: Margen ergonómico `mr-3.5` respecto al contenido central.
- **Documentación Viva**: Actualizadas las especificaciones en [`/docs/wiki/03-design-system.md`](file:///c:/Users/santi/Documents/UNI/Fluo/docs/wiki/03-design-system.md) y [`/docs/wiki/04-roadmap-status.md`](file:///c:/Users/santi/Documents/UNI/Fluo/docs/wiki/04-roadmap-status.md).

### v0.4.11 (Contextualización Dinámica de Pilares en Home e Iluminación Atmosférica)
- **Reorganización del Texto Verde de P&L en [`InvestmentsView.tsx`](file:///c:/Users/santi/Documents/UNI/Fluo/src/components/investments/InvestmentsView.tsx)**:
  - Eliminado el desbordamiento horizontal: separación en 3 niveles con importe principal en `text-base font-bold` y porcentaje con icono `TrendingUp` en `text-[11px] font-semibold`.
  - Simetría y balance de altura perfecto con la tarjeta de *Patrimonio Invertido*.
- **Transformación Reactiva de [`HeroBalance.tsx`](file:///c:/Users/santi/Documents/UNI/Fluo/src/components/home/HeroBalance.tsx)**:
  - Si el usuario no filtra ningún pilar (`all`), se mantiene el *Patrimonio Neto Total*, tasa de ahorro y rendimiento global.
  - Al seleccionar **Ingresos**: tarjeta adaptada a *Total Ingresos* (`+`), *Ingresos Recurrentes* y *Mayor Ingreso*.
  - Al seleccionar **Gastos**: tarjeta adaptada a *Total Gastos* (`-`), *Gasto Medio Diario* y *Gastos Fijos / Recurrentes*.
  - Al seleccionar **Inversión**: tarjeta adaptada a *Cartera de Inversión*, *Patrimonio Invertido* y *P&L No Realizado*.
  - Deselección directa e intuitiva pulsando de nuevo el pilar activo en `MetricPillars`.
- **Iluminación Atmosférica Reactiva Ultra-Suave en [`MobileContainer.tsx`](file:///c:/Users/santi/Documents/UNI/Fluo/src/components/layout/MobileContainer.tsx)**:
  - Eliminado el tinte de pantalla completa para preservar la pureza del lienzo obsidiana oscuro (`#0B0F19`).
  - Suavizados los focos difusos (`10%-14%` de opacidad, `blur-[160px]`) e introducido un sutil foco degradado cenital (`h-64 from-.../[0.04]`) que enmarca la parte superior de forma etérea y sin invasión.
- **Validación de Calidad**: `npx tsc -b` (0 errores) y `npm test` (20/20 tests pasando).

### v0.4.12 (Gesto Deslizar para Eliminar y Limpieza de Cabecera)
- **Eliminación del Botón `Ver Todo ✕`**:
  - En [`HeroBalance.tsx`](file:///c:/Users/santi/Documents/UNI/Fluo/src/components/home/HeroBalance.tsx), se suprimió el botón redundante en favor de la interacción directa en [`MetricPillars.tsx`](file:///c:/Users/santi/Documents/UNI/Fluo/src/components/home/MetricPillars.tsx), despejando el encabezado de la tarjeta principal.
- **Gesto Nativo Deslizar para Eliminar (`Swipe-to-Delete`)**:
  - Creado el componente [`SwipeableTransactionItem.tsx`](file:///c:/Users/santi/Documents/UNI/Fluo/src/components/home/SwipeableTransactionItem.tsx) e integrado en [`RecentTransactionsList.tsx`](file:///c:/Users/santi/Documents/UNI/Fluo/src/components/home/RecentTransactionsList.tsx).
  - Reconocimiento de arrastre táctil con `touch-action: pan-y` para no interferir con el scroll vertical de la pantalla móvil.
  - Capa de acción Liquid Glass revelada en el fondo con gradiente carmesí (`bg-rose-600/90 backdrop-blur-xl`), texto interactivo *"Soltar para eliminar"* e icono `Trash2` con escalado dinámico.
  - **Corrección de Fuga Cromática**: Capa roja configurada en `visibility: hidden; opacity: 0` durante el estado de reposo, asegurando que la superficie translúcida de cristal (`bg-white/[0.05]`) de la tarjeta nunca transparente bordes o sombras rojas indebidas.
  - Umbral ergonómico a -80px con expulsión horizontal completa (`translateX(-100%)`) y animación de colapso de fila (`duration-300`).
  - Efecto resorte suave de retorno si se libera antes del umbral.
- **Validación & Tests**: `npx tsc -b` (0 errores) y `npm test` (20/20 tests pasando).

### v0.4.13 (Refactor Liquid Glass Suave & Refinado en FloatingNavbar)
- **Calibración Óptica Equilibrada en [`FloatingNavbar.tsx`](file:///c:/Users/santi/Documents/UNI/Fluo/src/components/layout/FloatingNavbar.tsx)**:
  - **Sustrato Ahumado**: `bg-slate-900/60 backdrop-blur-2xl backdrop-saturate-150`, sustituyendo cualquier blanco lechoso por un cristal ahumado oscuro que realza el contenido subyacente sin estridencias.
  - **Biselado Especular Atenuado**: Borde perimetral fino `border-white/12` y luz cenital interior suave `shadow-[inset_0_1px_0_0_rgba(255,255,255,0.18)]` (en vez de trazos opacos duros).
  - **Aura Atmosférica Sutil**: Resplandor inferior atenuado (`bg-indigo-500/10 blur-xl h-4`) que proporciona flotabilidad sin saturar con color la parte inferior.
  - **Línea Especular Hairline**: Hilo de luz cenital de 1px a `via-white/35`.
  - **Cápsula Activa en Cristal Ahumado**: `bg-white/10 backdrop-blur-md border border-white/15 shadow-[inset_0_1px_0_rgba(255,255,255,0.2)]`, logrando un contraste suave y armonioso con el fondo obsidiana.
  - **Botón (+) Como Gema Suave**: Resplandor reducido a `shadow-[0_4px_16px_rgba(99,102,241,0.3)]` con halo equilibrado y destello fino.
- **Validación de Calidad**: `npx tsc -b` (0 errores) y `npm test` (20/20 tests pasando).

### v0.5.0 (Autenticación Oficial Supabase, Persistencia Cloud con RLS & Optimistic UI)
- **Cliente Supabase Oficial (`supabaseClient.ts`)**:
  - Lectura de variables de entorno seguras (`VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY`).
  - Tipado integral con el esquema de tablas `transactions` e `investments`.
  - Mapeadores bidireccionales TypeScript `camelCase` ↔ PostgreSQL `snake_case`.
- **Gestión Global de Sesión (`AuthContext.tsx`)**:
  - Contexto unificado con `user`, `session`, `loading`, `signInWithEmail`, `signUpWithEmail`, `signOut`.
  - Suscripción reactiva en tiempo real al evento `supabase.auth.onAuthStateChange`.
  - Soporte de modo Demo no destructivo con persistencia de preferencia local.
- **Pantalla de Autenticación Liquid Glass (`AuthScreen.tsx`)**:
  - Tarjeta flotante `bg-slate-900/60 backdrop-blur-2xl border border-white/15 rounded-3xl p-6`.
  - Iconografía Lucide (`Mail`, `Lock`, `Eye`, `EyeOff`, `Wallet`, `ArrowRight`).
  - Alternador tipo pastilla entre Iniciar Sesión y Registro con validación de fortaleza y confirmación.
  - Alertas translúcidas con diseño Liquid Glass en rojo coral (`bg-rose-500/10 border-rose-500/20 text-rose-300`).
- **Sincronización Reactiva en Nube (`cloudSyncService.ts` & `useFinanceStore.ts`)**:
  - Al iniciar sesión: consulta en paralelo (`SELECT`) de movimientos e inversiones asociados al `user_id`.
  - Al crear transacciones o activos: mutación optimista inmediata en UI a 60 FPS e `INSERT` asíncrono en Supabase.
  - Al eliminar o actualizar: `DELETE` y `UPDATE` sincronizados en segundo plano.
- **Seguridad en Servidor (Row Level Security - RLS)**:
  - Script DDL completo [`supabase/schema.sql`](file:///c:/Users/santi/Documents/UNI/Fluo/supabase/schema.sql) con políticas de aislamiento por `auth.uid() = user_id` e índices optimizados por fecha e identificador.
- **Modal de Confirmación de Cierre de Sesión (`SignOutConfirmModal.tsx`)**:
  - Diálogo Liquid Glass con información de la cuenta activa y confirmación explícita para evitar pérdidas involuntarias de sesión.
- **Validación de Calidad**: 0 errores de compilación TypeScript (`npx tsc -b`) y 20/20 tests unitarios pasando (`npm test`).

### v0.5.5 (Progressive Web App - PWA Oficial, iOS Standalone & Workbox Caching)
- **Plugin Oficial PWA (`vite-plugin-pwa`)**:
  - Configurado en [`vite.config.ts`](file:///c:/Users/santi/Documents/UNI/Fluo/vite.config.ts) con `registerType: 'autoUpdate'`.
  - Manifiesto completo `manifest.webmanifest`: nombre "Fluo", short_name "Fluo", color `#0B0F19`, orientación vertical fija e iconos de 192px y 512px (incluyendo propósito `maskable`).
  - Service Worker con Workbox: precaching de bundles Vite, caché anual para Google Fonts y `StaleWhileRevalidate` para imágenes y logos comerciales.
- **Optimización Integral para iOS (WebKit Standalone)**:
  - Meta tags nativos en [`index.html`](file:///c:/Users/santi/Documents/UNI/Fluo/index.html): `apple-mobile-web-app-capable`, `apple-mobile-web-app-status-bar-style: black-translucent`, `apple-touch-icon` (180px) y `viewport-fit=cover`.
  - Respeto de Safe Areas en [`MobileContainer.tsx`](file:///c:/Users/santi/Documents/UNI/Fluo/src/components/layout/MobileContainer.tsx) mediante `pt-[max(1.5rem,env(safe-area-inset-top))]` y padding inferior acoplado a la barra flotante.
- **Prompt de Instalación Inteligente Liquid Glass (`PWAInstallPrompt.tsx`)**:
  - Detección de modo `standalone` para silenciar prompts una vez instalada la app.
  - Soporte dual: botón directo de instalación en Android/Chromium vía `beforeinstallprompt` y guía interactiva para iOS Safari.
  - Tarjeta flotante vítrea `bg-slate-900/80 backdrop-blur-2xl border border-white/15` con opción de descarte temporal (7 días).
- **Validación de Calidad**: Build de producción verificado (`tsc -b && vite build`) y 20/20 tests pasando (`npm test`).

### v0.5.6 (Depuración Visual de Cabecera & Barra Inferior Ultra-Translúcida)
- **Limpieza de Cabecera Superior ([`App.tsx`](file:///c:/Users/santi/Documents/UNI/Fluo/src/App.tsx))**:
  - Eliminados el botón "Demo" y la pastilla decorativa "Liquid Glass", logrando una cabecera minimalista y limpia con el título Fluo, el indicador de sincronización en la nube, el botón de simulación y el perfil de usuario.
- **Dock de Navegación Más Translúcido ([`FloatingNavbar.tsx`](file:///c:/Users/santi/Documents/UNI/Fluo/src/components/layout/FloatingNavbar.tsx))**:
  - Calibración de sustrato a `bg-slate-900/40 backdrop-blur-2xl backdrop-saturate-150` con borde `border-white/10`.
  - Mayor paso de luz y refracción sobre el contenido que hace scroll por detrás.
- **Validación de Calidad**: `npx tsc -b` (0 errores) y `npm test` (20/20 tests pasando).

### v0.5.7 (Integración de Wordmark Oficial Liquid Glass en Cabecera)
- **Wordmark Oficial "Fluo" ([`public/fluo-wordmark.png`](file:///c:/Users/santi/Documents/UNI/Fluo/public/fluo-wordmark.png))**:
  - Incorporada la tipografía tubular Liquid Glass con cintas internas de color que replican el isotipo `F` de la aplicación (esmeralda, coral y violeta neón).
  - **Recorte Técino de Bounding Box**: Se eliminaron los márgenes transparentes superiores e inferiores de 2048x2048 a 1665x721 píxeles, permitiendo que la tipografía ocupe el 100% de la altura visual asignada sin desperdiciar espacio en padding invisible.
  - Rediseño minimalista en [`App.tsx`](file:///c:/Users/santi/Documents/UNI/Fluo/src/App.tsx): eliminados el icono de billetera y el texto secundario redundante "Smart Financial OS", luciendo el wordmark "Fluo" con tamaño sustancialmente mayor, presencia destacada y resplandor ambiental `drop-shadow-[0_2px_14px_rgba(99,102,241,0.35)]`.
  - Integrado también en la pantalla de bienvenida y login [`AuthScreen.tsx`](file:///c:/Users/santi/Documents/UNI/Fluo/src/components/auth/AuthScreen.tsx).
- **Validación de Calidad**: `npx tsc -b` (0 errores) y `npm test` (20/20 tests pasando).

### v0.5.8 (Blindaje de Ciberseguridad Nivel 1 & Bloqueo Biométrico)
- **Hook de Inactividad & Bloqueo Preventivo ([`useSecurityLock.ts`](file:///c:/Users/santi/Documents/UNI/Fluo/src/hooks/useSecurityLock.ts))**:
  - Temporizador de inactividad de 3 minutos con reseteo ante actividad (`touch`, `click`, `scroll`, `keypress`).
  - Bloqueo instantáneo al pasar a segundo plano mediante `visibilitychange` (`document.visibilityState === 'hidden'`).
  - Hashing seguro SHA-256 en cliente con sal de aplicación vía Web Cryptography API (`crypto.subtle.digest`).
  - Desbloqueo nativo biométrico con WebAuthn (`PublicKeyCredential`) compatible con Face ID, Touch ID, Windows Hello y sensor Android.
- **Bóveda de Seguridad Liquid Glass ([`SecurityLockScreen.tsx`](file:///c:/Users/santi/Documents/UNI/Fluo/src/components/security/SecurityLockScreen.tsx))**:
  - Telón de pantalla completa ultra-desenfocado `z-[100] backdrop-blur-3xl bg-slate-950/85`.
  - Teclado táctil translúcido para PIN de 4 dígitos, esferas indicadoras Liquid Glass y animación de sacudida (*shake*) ante código incorrecto.
  - Ofuscación visual preventiva del dashboard (`filter blur-2xl opacity-40`) mientras la app permanece bloqueada.
  - Botón de acceso directo en cabecera superior para bloquear o configurar PIN en cualquier instante.
- **Purga y Sanitización Completa al Cerrar Sesión ([`purgeUserData`](file:///c:/Users/santi/Documents/UNI/Fluo/src/store/useFinanceStore.ts))**:
  - Eliminación integral de `fluo_finance_storage_v3`, cachés de cotizaciones `fluo_market_quotes_cache_v1` y marcas residuales de sesión.
  - Reseteo atómico de las colecciones en memoria de Zustand, garantizando cero fugas de datos entre sesiones en dispositivos compartidos.
- **Content Security Policy (CSP) en Cabecera ([`index.html`](file:///c:/Users/santi/Documents/UNI/Fluo/index.html))**:
  - Directivas restrictivas: `connect-src` exclusivamente a Supabase y servicios de cotizaciones autorizados, `frame-ancestors 'none'` contra clickjacking, `X-Content-Type-Options: nosniff` y `strict-origin-when-cross-origin`.
- **Suite de Pruebas Automatizadas**:
  - Incorporados tests unitarios de hashing criptográfico SHA-256 en [`useSecurityLock.test.ts`](file:///c:/Users/santi/Documents/UNI/Fluo/src/hooks/useSecurityLock.test.ts).
  - 23 tests automatizados pasando al 100% (`npm test`).

### v0.5.9 (Depuración Minimalista de la Pantalla de Acceso)
- **Limpieza de Cabecera ([`AuthScreen.tsx`](file:///c:/Users/santi/Documents/UNI/Fluo/src/components/auth/AuthScreen.tsx))**:
  - Eliminado el recuadro con el icono de la cartera (`Wallet`).
  - Eliminados los textos redundantes *"Smart Financial OS"* y *"Liquid Glass"*.
  - El wordmark oficial `fluo-wordmark.png` se presenta en tamaño ampliado (`h-12`) con resplandor ambiental índigo como protagonista único y limpio.
- **Depuración de Botones de Acción**:
  - Eliminada la flecha (`ArrowRight`) en el botón de "Entrar a Fluo".
  - Eliminado el icono de estrellas (`Sparkles`) en el botón de "Crear Mi Cuenta".
- **Validación de Calidad**: `npx tsc -b` (0 errores) y `npm test` (23/23 tests pasando).

### v0.5.10 (Selectores Desplegables Oficiales Liquid Glass - `GlassSelect`)
- **Componente Reutilizable ([`GlassSelect.tsx`](file:///c:/Users/santi/Documents/UNI/Fluo/src/components/common/GlassSelect.tsx))**:
  - Sustitución de los `<select>` nativos del sistema operativo por componentes Liquid Glass personalizados con sustrato translúcido, biselado refractivo y chevron interactivo.
  - Menú desplegable flotante `bg-[#0D1527]/95 backdrop-blur-2xl` con línea especular superior, soporte para iconos semánticos, checkmarks y control de cierre al hacer clic fuera o pulsar `Escape`.
- **Integración en Modal de Añadir Movimiento ([`QuickAddTransactionModal.tsx`](file:///c:/Users/santi/Documents/UNI/Fluo/src/components/forms/QuickAddTransactionModal.tsx))**:
  - **Selector de Categoría**: Desplegable enriquecido con los iconos vectoriales oficiales de `CategoryIcon` e insignias coloreadas por categoría.
  - **Selector de Tipo de Activo**: Desplegable con iconografía dedicada para acciones, ETFs, fondos indexados, criptoactivos, renta fija y depósitos.
  - **Selector de Divisa**: Desplegable vítreo para EUR (€) y USD ($).
- **Consistencia en Cartera ([`AddAssetModal.tsx`](file:///c:/Users/santi/Documents/UNI/Fluo/src/components/investments/AddAssetModal.tsx))**:
  - Implementación homóloga de `GlassSelect` en el modal de alta de activos.
- **Validación de Calidad**: `npx tsc -b` (0 errores) y `npm test` (23/23 tests pasando).

### v0.5.11 (Calibración Ergonómica de Bloqueo por Inactividad y Búsqueda Bajo Demanda)
- **Calibración de Inactividad Real ([`useSecurityLock.ts`](file:///c:/Users/santi/Documents/UNI/Fluo/src/hooks/useSecurityLock.ts))**:
  - Eliminado el bloqueo prematuro en el milisegundo de cambio de ventana/pestaña (`visibilitychange`).
  - Ahora se calcula con precisión el tiempo real transcurrido (`Date.now() - lastActivityTimestamp`): si el usuario conmuta entre aplicaciones durante unos segundos o minutos, la aplicación permanece desbloqueada, activando el bloqueo únicamente si han transcurrido los 3 minutos completos de inactividad.
- **Búsqueda de Activos Estrictamente Bajo Demanda ([`QuickAddTransactionModal.tsx`](file:///c:/Users/santi/Documents/UNI/Fluo/src/components/forms/QuickAddTransactionModal.tsx) y [`AddAssetModal.tsx`](file:///c:/Users/santi/Documents/UNI/Fluo/src/components/investments/AddAssetModal.tsx))**:
  - Corregido el auto-despliegue del menú de fondos al abrir la pestaña de inversiones: el menú flotante ahora permanece cerrado de forma predeterminada y solo se activa cuando el usuario escribe activamente una consulta en el campo de búsqueda (`query.trim().length > 0`).
- **Validación de Calidad**: `npx tsc -b` (0 errores) y `npm test` (23/23 tests pasando).

### v0.5.12 (Auditoría Integral de Rendimiento: Aceleración GPU, Code Splitting, Virtualización & Caché SWR)
- **Aceleración por GPU en Liquid Glass ([`index.css`](file:///c:/Users/santi/Documents/UNI/Fluo/src/index.css))**:
  - Implementación de `.gpu-layer` (`transform: translateZ(0)` y `will-change: transform`) en contenedores fijos y modales (`FloatingNavbar`, `SecurityLockScreen`, `QuickAddTransactionModal`, `TimeSimulatorModal`, `SignOutConfirmModal`), forzando composición por GPU sin saturar la VRAM en móviles.
  - Reglas de degradación elegante y accesibilidad para hardware modesto: `@media (prefers-reduced-motion: reduce)` y `@supports not (backdrop-filter: blur(1px))`.
- **Code Splitting & Bundle Partitioning ([`vite.config.ts`](file:///c:/Users/santi/Documents/UNI/Fluo/vite.config.ts) & [`App.tsx`](file:///c:/Users/santi/Documents/UNI/Fluo/src/App.tsx))**:
  - Carga diferida (`React.lazy` + `Suspense`) de `AnalyticsView` (aísla ~400 kB de Recharts), `InvestmentsView` y todos los modales de creación y configuración.
  - Particionamiento manual de chunks (`vendor-react`, `vendor-charts`, `vendor-supabase`, `vendor-icons`, `vendor-state`).
  - Reducción del JS inicial de 1,031 kB a solo 115 kB (~65% reducción con dependencias core, sub-second FCP/LCP).
  - Pre-compresión de assets estáticos en `.gz` (Gzip) y `.br` (Brotli) mediante `vite-plugin-compression`.
- **Virtualización y Renderizado Eficiente**:
  - Selectores optimizados con `useShallow` de Zustand en [`RecentTransactionsList.tsx`](file:///c:/Users/santi/Documents/UNI/Fluo/src/components/home/RecentTransactionsList.tsx) e [`InvestmentsView.tsx`](file:///c:/Users/santi/Documents/UNI/Fluo/src/components/investments/InvestmentsView.tsx).
  - Memorización con `React.memo` en componentes de fila: [`SwipeableTransactionItem.tsx`](file:///c:/Users/santi/Documents/UNI/Fluo/src/components/home/SwipeableTransactionItem.tsx) y `AssetCard`.
  - Viewport virtualization nativa con `.cv-auto` (`content-visibility: auto`) y ventana progresiva (25 registros iniciales + "Mostrar más").
- **Caché en Memoria y Red SWR**:
  - In-memory cache de marcas en [`BrandAvatar.tsx`](file:///c:/Users/santi/Documents/UNI/Fluo/src/components/common/BrandAvatar.tsx) con `loading="lazy"` y `decoding="async"` para eliminar parpadeos de fallback.
  - Deduplicación de peticiones concurrentes y Stale-While-Revalidate (SWR) de 25s en [`marketDataService.ts`](file:///c:/Users/santi/Documents/UNI/Fluo/src/services/marketDataService.ts) para cotizaciones bursátiles y cripto.
- **Validación de Calidad**: `npx tsc -b` (0 errores), `npm test` (23/23 tests pasando) y `npx vite build` exitoso.

### v0.5.13 (Equidistancia Simétrica en Barra Flotante y Edición por Deslizamiento)
- **Barra de Navegación 100% Equidistante ([`FloatingNavbar.tsx`](file:///c:/Users/santi/Documents/UNI/Fluo/src/components/layout/FloatingNavbar.tsx))**:
  - Reestructuración de la barra flotante a una cuadrícula simétrica de 4 columnas (`grid grid-cols-4 items-stretch gap-1.5 p-1.5`).
  - Los 4 elementos (Inicio, Estadísticas, Inversiones y el botón de acción rápida `+`) comparten idéntico ancho, centrado vertical y separación geométrica perfecta, eliminando la asimetría visual anterior.
  - **Botón `+` Destacado**: Se eliminó la etiqueta de texto *"Añadir"* para optimizar la pureza visual y se aumentó el tamaño del icono a 24px (`h-6 w-6 stroke-[2.5]`), centrándolo como acción principal flotante.
- **Gesto de Deslizamiento Bidireccional ([`SwipeableTransactionItem.tsx`](file:///c:/Users/santi/Documents/UNI/Fluo/src/components/home/SwipeableTransactionItem.tsx))**:
  - **Deslizar a la Derecha (Editar)**: Muestra una capa Liquid Glass índigo (`bg-indigo-500/80` o `bg-indigo-600/90`), icono `Pencil` y texto "Soltar para editar". Al superar 80px y soltar, activa el modal de edición.
  - **Deslizar a la Izquierda (Eliminar)**: Muestra la capa Liquid Glass rojo coral para borrado.
  - Botón de edición adicional visible en *hover* para uso en ordenadores de sobremesa.
- **Edición en Modal ([`QuickAddTransactionModal.tsx`](file:///c:/Users/santi/Documents/UNI/Fluo/src/components/forms/QuickAddTransactionModal.tsx))**:
  - Soporta la propiedad `editingTransaction`. Carga automáticamente importe, concepto, categoría, marca, fecha y pilar.
  - Cambia dinámicamente el título a *"Editar Movimiento"* y el botón a *"Guardar Cambios"*.
- **Persistencia en Store y Cloud ([`useFinanceStore.ts`](file:///c:/Users/santi/Documents/UNI/Fluo/src/store/useFinanceStore.ts) & [`cloudSyncService.ts`](file:///c:/Users/santi/Documents/UNI/Fluo/src/services/cloudSyncService.ts))**:
  - Acción `updateTransaction` que actualiza el estado local y sincroniza los cambios en la base de datos de Supabase vía `updateCloudTransaction`.
- **Validación de Calidad**: `npx tsc -b` (0 errores), `npm test` (23/23 tests pasando) y `npx vite build` exitoso.

### v0.5.14 (Ampliación del Catálogo de Categorías de Ingresos y Rehidratación Inteligente)
- **10 Categorías Semánticas de Ingresos ([`categoriesAndBrands.ts`](file:///c:/Users/santi/Documents/UNI/Fluo/src/data/categoriesAndBrands.ts))**:
  - Ampliado el catálogo de ingresos con 7 nuevas categorías esenciales: *Bizum y Transferencias* (`cat-bizum-transfers`), *Freelance y Facturación* (`cat-freelance`), *Ventas y Segunda Mano* (`cat-sales`), *Alquileres e Inmuebles* (`cat-rental-income`), *Intereses y Cuentas Remuneradas* (`cat-bank-interest`), *Devoluciones y Reembolsos* (`cat-refunds`), *Premios, Regalos y Becas* (`cat-gifts-grants`) y *Otros Ingresos* (`cat-other-income`).
  - Cada categoría cuenta con color esmeralda semántico armonizado y glifo vectorial representativo.
- **Soporte Vectorial Completo ([`CategoryIcon.tsx`](file:///c:/Users/santi/Documents/UNI/Fluo/src/components/common/CategoryIcon.tsx))**:
  - Incorporados nuevos glifos de Lucide React: `ArrowDownLeft`, `Building2`, `RotateCcw`, `Gift`, `Percent`, `Wallet` y `Laptop`.
- **Rehidratación Inmediata de Categorías en Cliente ([`useFinanceStore.ts`](file:///c:/Users/santi/Documents/UNI/Fluo/src/store/useFinanceStore.ts))**:
  - Implementado algoritmo de *merge* inteligente en Zustand que propaga automáticamente las nuevas categorías a usuarios con sesiones activas en `localStorage` sin requerir reinicio de datos.
- **Validación de Calidad**: `npx tsc -b` (0 errores), `npm test` (23/23 tests pasando) y `npx vite build` exitoso.

### v0.5.15 (Documentación Maestra del Repositorio - README.md)
- **README Oficial y Exhaustivo ([`README.md`](file:///c:/Users/santi/Documents/UNI/Fluo/README.md))**:
  - Redacción técnica integral con cabecera de presentación, badges oficiales (React 19, TypeScript, Vite, Tailwind CSS v4, Supabase, PWA, Vitest, MIT License).
  - Propuesta de valor detallada: flujo de caja, marcas vectoriales, motor de recurrencias descentralizado, seguimiento multiactivo con cotizaciones en vivo y analítica con Recharts.
  - Diagrama de arquitectura del sistema (Local-First con Cloud Sync), tabla exhaustiva de tecnologías y explicación del diseño Liquid Glass.
  - Modelo de ciberseguridad por 3 capas (dispositivo, transporte y base de datos con RLS).
  - Guía completa de instalación, desarrollo en red local con QR (`--host`), comandos de testing y verificación estricta.
  - Instrucciones de despliegue en Vercel y guía de instalación PWA en iOS y Android.
  - Árbol de directorios representativo y enlaces a la wiki técnica interna (`/docs/wiki/`).
- **Validación de Calidad**: `npx tsc -b` (0 errores), `npm test` (23/23 tests pasando) y `npx vite build` exitoso.

---

## Próximos Hitos (v0.6.0)
- [ ] **Presupuestos Mensuales & Metas de Ahorro**: Límites de gasto por categoría con barras de advertencia translúcidas.
- [ ] **Exportación / Importación de Datos**: Backups locales en formato JSON y exportación de movimientos en CSV/Excel.
- [ ] **Migración a IndexedDB**: Capacidad de soporte para miles de registros y series temporales históricas con `Dexie.js`.
- [x] **Widgets de PWA & Offline First**: Service Worker y manifiesto PWA para instalación nativa en dispositivos iOS/Android.
