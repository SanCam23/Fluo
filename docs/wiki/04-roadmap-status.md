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
| **Entrada Flexible de Inversiones & Validaciones en Vivo** | ✅ Completado | Conmutador Segmented Control Liquid Glass (Total € vs Títulos), recálculo reactivo bidireccional, sanitización de comas y suite de 31 tests unitarios |
| **Módulo de Estadísticas y Métricas (/stats)** | ✅ Completado | Visualización con Recharts: Donut con centro hueco, Barras comparativas, Área de Patrimonio Neto y Ranking de Marcas |
| **Motor de Recurrencias & Catch-up** | ✅ Completado | Motor en cliente `recurringEngine.ts`, calendar clamping para meses cortos, generación histórica idempotente |
| **Formulario Granular de Recurrencias** | ✅ Completado | Modal Liquid Glass con switch iOS, periodicidad semanal/quincenal/mensual/anual, días de semana/mes y auto-registro |
| **Formulario Unificado & Selector de Brokers** | ✅ Completado | Consolidación del alta de inversiones dentro del modal (+) de movimientos, selector de broker con `BrandPicker` y doble registro atómico |
| **Selector de Fecha & Orden Cronológico** | ✅ Completado | Selector Liquid Glass de fecha en modal (+) con píldoras "Hoy", "Ayer", "Elegir fecha", ordenación cronológica descendente y recálculo de estadísticas |
| **Suite de Tests Unitarios (Vitest)** | ✅ Completado | 30 tests automatizados pasando: recurrencias (12 tests), seguridad/PIN (3 tests), store y fechas (7 tests) + mercado (8 tests) |
| **Simulador Temporal de Depuración** | ✅ Completado | Debug Tool `TimeSimulatorModal.tsx` con saltos de +1 semana, +1 mes, ejecución manual y badge reactivo |
| **Autenticación en la Nube (Supabase)** | ✅ Completado | Login y Registro con Liquid Glass, gestión de sesiones JWT (`AuthContext`) y bypass Demo |
| **Persistencia en la Nube & RLS** | ✅ Completado | Base de datos PostgreSQL en Supabase con Row Level Security, Optimistic UI y sincronización en segundo plano |
| **Progressive Web App (PWA & iOS WebKit)** | ✅ Completado | `vite-plugin-pwa`, Workbox offline caching, soporte WebKit standalone, `safe-area-inset` y banner inteligente |
| **Ciberseguridad Nivel 1 & Bloqueo Biométrico** | ✅ Completado | Detección de inactividad (3m), backgrounding, bóveda PIN SHA-256, WebAuthn, CSP y purga de sesión (`purgeUserData`) |
| **Optimización de Rendimiento & Aceleración GPU** | ✅ Completado | Aceleración GPU en Liquid Glass, bundle splitting (65% reducción), compresión Gzip/Brotli, viewport virtualization y SWR |
| **Documentación Oficial & README Maestro** | ✅ Completado | `README.md` exhaustivo con arquitectura, diseño Liquid Glass, ciberseguridad, guía local y despliegue |
| **Onboarding Limpio a Cero (Zero-State)** | ✅ Completado | Estado inicial a 0 € para cuentas nuevas sin filtración de datos demo; empty states Liquid Glass en Home, Inversiones y Estadísticas |
| **Centro de Control de Cuenta & Perfil** | ✅ Completado | Avatar flotante en cabecera, `ProfileSettingsModal`, gestión de PIN y WebAuthn, cambio de contraseña Supabase y borrado GDPR (`delete_user_account`) |
| **Sistema Multicuenta & Carrusel de Fuentes** | ✅ Completado | Gestión de orígenes de dinero (bancos/efectivo), carrusel scroll-snap a 120fps en `HeroBalance.tsx`, onboarding obligatorio, vinculación `sourceId` y reordenación en ajustes |
| **Importe Ahorrado & Evolución (/stats)** | ✅ Completado | Tarjeta destacada Liquid Glass con Ahorro Neto Real, Tasa, Ritmo Diario, Proyección Cierre, Gráfico de Área interactivo y reactividad multicuenta |
| **AppSec & Web Performance (A+)** | ✅ Completado | Migración CSP y cabeceras a `vercel.json`, `robots.txt` estático, WebP (<30 KB) LCP y accesibilidad WCAG |
| **Sincronización de Fondos por ISIN & Ticker de Referencia** | ✅ Completado | Pipeline multiruta (Yahoo/Morningstar + Twin ETFs VUSA/VEUR), SWR background sync (>6h) y P&L dinámico |
| **Reconciliación & Persistencia Resiliente de Inversiones** | ✅ Completado | Auto-reconciliación reactiva desde movimientos (`pillar: invest`), multi-esquema adaptativo en Supabase (`identifier`/`symbol_or_isin`) y preservación local |
| **Cálculo Exacto de Unidades & Auto-Corrección de Cartera** | ✅ Completado | Derivación estricta de títulos en modo importe total (`shares = total / price`), auto-reparación transparente de activos con `shares = 1` distorsionados (`autoCorrectAssetShares`) y sincronización atómica a Supabase |
| **Nuevas Categorías de Gasto & Flujo Cajero** | ✅ Completado | 6 nuevas categorías (Estudios, Cajero, Bizum, Viajes, Regalos, Otros), auto-ingreso gemelo en efectivo en Cajero y restricción a 1 sola cuenta de efectivo |
| **Selector Dual en Estadísticas (Periodo vs Mes)** | ✅ Completado | Conmutador Liquid Glass en `/stats`: selección por periodos relativos o mes específico con stepper, picker nativo y evolución diaria continua |
| **Auto-Sanación de Fondos Eclipsados & Purga Huérfana** | ✅ Completado | Detección reactiva de discrepancias en `reconcileAssetsFromTransactions`, auto-renombrado y recálculo según movimientos activos, purga de `reconciled-asset-*` huérfanos y botón de borrado visible en móvil (`opacity-80`) |
| **Optimización Integral & Consolidación** | ✅ Completado | Eliminación de código muerto (5 archivos), importación dinámica de mock data, Mapas O(1) en store y vistas, y consolidación de bucles en una sola pasada |
| **Multi-Aportaciones, Fondos Externos & Retiradas** | ✅ Completado | Consolidación visual a 1 tarjeta por índice con historial desplegable de aportaciones, fondos externos opcionales, eliminación de borrado directo y modal de retirada con liquidación hacia cuentas |

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

### v0.5.16 (Preparación Integral para Despliegue en Vercel & Blindaje de Ciberseguridad)
- **Configuración Oficial para Vercel ([`vercel.json`](file:///c:/Users/santi/Documents/UNI/Fluo/vercel.json))**:
  - Reescritura universal de rutas SPA (`rewrites: [{ source: "/(.*)", destination: "/index.html" }]`) que elimina por completo los errores 404 al recargar subrutas o con el Service Worker PWA.
  - Cabeceras HTTP de seguridad emitidas por el servidor: `Strict-Transport-Security` (HSTS de 2 años), `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, `Permissions-Policy` y CSP completa.
  - Estrategia de caché en CDN: `Cache-Control: public, max-age=0, must-revalidate` para `index.html`, `sw.js` y `manifest.webmanifest`, asegurando despliegues atómicos sin usuarios atascados en versiones antiguas; y `Cache-Control: immutable` para `/assets/*`.
- **Corrección de Conectividad CSP ([`index.html`](file:///c:/Users/santi/Documents/UNI/Fluo/index.html))**:
  - Incorporado `https://api.binance.com` a la directiva `connect-src`, permitiendo la ingesta de cotizaciones cripto en vivo sin bloqueos de navegador.
- **Protección contra Fuerza Bruta y Lockout en PIN ([`useSecurityLock.ts`](file:///c:/Users/santi/Documents/UNI/Fluo/src/hooks/useSecurityLock.ts) y [`SecurityLockScreen.tsx`](file:///c:/Users/santi/Documents/UNI/Fluo/src/components/security/SecurityLockScreen.tsx))**:
  - Retardo artificial defensivo (200ms) entre verificaciones para neutralizar scripts automatizados.
  - Penalización temporal progresiva: 30 segundos tras 5 intentos fallidos, 60 segundos tras 8 intentos y 300 segundos (5 minutos) tras 10+ intentos erróneos.
  - Interfaz Liquid Glass con aviso de advertencia, cuenta regresiva dinámica en vivo y bloqueo temporal del teclado táctil.
  - Detección dinámica de `rp.id` para autenticación WebAuthn en dominios públicos de producción.
- **Validación de Calidad**: `npx tsc -b` (0 errores), `npm test` (23/23 tests pasando) y `npx vite build` exitoso.

### v0.5.17 (Onboarding Limpio a Cero, Avatar Flotante & Centro de Control de Cuenta)
- **Onboarding Limpio a Cero (Zero-State Onboarding)**:
  - Inicialización estricta a 0 € y colecciones vacías (`transactions: []`, `assets: []`, `recurrences: []`) para cuentas registradas e inicios de sesión reales.
  - Corrección de la lógica de merge en persistencia de Zustand (`useFinanceStore.ts`) para preservar arrays vacíos sin revertir a datos semilla (`INITIAL_TRANSACTIONS`).
  - Separación formal de datos de demostración mediante acción `loadDemoData()` activada únicamente bajo `isDemoMode: true` y purgada al salir.
  - **Empty States Liquid Glass Reutilizables**:
    - **Home ([`RecentTransactionsList.tsx`](file:///c:/Users/santi/Documents/UNI/Fluo/src/components/home/RecentTransactionsList.tsx))**: Mensaje inspirador con icono vítreo `Receipt` indicando cómo registrar el primer movimiento.
    - **Inversiones ([`InvestmentsView.tsx`](file:///c:/Users/santi/Documents/UNI/Fluo/src/components/investments/InvestmentsView.tsx))**: Tarjeta con icono `PieChart` invitando a añadir activos para monitorizar cotizaciones en vivo.
    - **Estadísticas ([`AnalyticsView.tsx`](file:///c:/Users/santi/Documents/UNI/Fluo/src/components/analytics/AnalyticsView.tsx))**: Ilustración translúcida Liquid Glass informando que las métricas y gráficos se generarán con los primeros registros.
- **Botón Flotante de Avatar en Cabecera ([`App.tsx`](file:///c:/Users/santi/Documents/UNI/Fluo/src/App.tsx))**:
  - Reemplazo del correo en texto plano por un botón circular Liquid Glass `w-10 h-10` con inicial en relieve o icono `User` y punto de estado en vivo (verde esmeralda para cuenta cloud con RLS activo, ámbar para modo demo local).
- **Centro de Control de Perfil y Ajustes ([`ProfileSettingsModal.tsx`](file:///c:/Users/santi/Documents/UNI/Fluo/src/components/profile/ProfileSettingsModal.tsx))**:
  - Modal flotante Liquid Glass con cobertura móvil completa y desenfoque vítreo `backdrop-blur-2xl`.
  - **Cabecera de Perfil**: Avatar con gradiente y destello especular, correo electrónico y badge de protección cloud.
  - **Gestión de PIN & Bóveda**: Flujo de activación, cambio de PIN de 4 dígitos validado con SHA-256 (`changePin`) y opción de desactivación (`removePin`).
  - **Toggle Biométrico**: Conmutador estilo iOS para activar/desactivar WebAuthn (`toggleBiometrics`).
  - **Cambio de Contraseña**: Integración nativa con `supabase.auth.updateUser({ password })` con alternador de visibilidad (`Eye`/`EyeOff`) y alertas translúcidas.
### v0.5.19 (PWA Live Updates Automático y Calibración Milimétrica de Isotipo)
- **Calibración Equilibrada de la 'F' en el Isotipo Móvil**:
  - Re-escalado suave a factor +23% (crop `415×415`) en `public/icon-512.jpg`, `icon-192.jpg` e `icon-180.jpg`.
  - Proporción visual armónica: la letra `F` tubular destaca con nitidez sin quedar encajonada, asegurando aire perimetral suficiente para el recorte curvo de Apple y Android.
- **PWA Live Update Controller ([`pwaUpdateService.ts`](file:///c:/Users/santi/Documents/UNI/Fluo/src/services/pwaUpdateService.ts))**:
  - Eliminado el problema en el que la PWA móvil servía código obsoleto desde memoria al volver a la app tras un despliegue en Vercel.
  - Comprobación inmediata ante eventos de reanudación: `visibilitychange` (`document.visibilityState === 'visible'`), `focus` y reconexión de red (`online`) disparan `registration.update()`.
  - Configuración atómica en VitePWA Workbox: `skipWaiting: true`, `clientsClaim: true`, `cleanupOutdatedCaches: true`.
  - Detección reactiva de toma de control (`controllerchange`): recarga automática limpia de la ventana para usuarios con sesión activa (sin recargas indeseadas en la primera instalación).
- **Hardening de Caché Edge en CDN ([`vercel.json`](file:///c:/Users/santi/Documents/UNI/Fluo/vercel.json))**:
  - Reglas estrictas `Cache-Control: no-cache, no-store, must-revalidate` para `/`, `sw.js`, `workbox-*.js`, `manifest.webmanifest` e `index.html`.
  - Garantiza que las comprobaciones del navegador móvil consulten siempre el último bundle de producción.
### v0.5.21 (Soporte Oficial de Modo Claro "Blanco Perla iOS" y Selector en Ajustes)
- **Modo Claro "Blanco Perla iOS"**:
  - Lienzo frío slate-100 (`#F1F5F9`) y tarjetas de cristal perlado translúcido (`bg-white/[0.78] backdrop-blur-2xl border-white/95 shadow-[0_10px_30px_rgba(15,23,42,0.06),inset_0_1px_1px_rgba(255,255,255,1)]`).
  - Orbes atmosféricos adaptados a tonos pastel suaves (`bg-emerald-400/20`, `bg-rose-400/20`, `bg-indigo-400/20`).
  - Dock flotante con sustrato vítreo claro (`bg-white/85`), pestañas con cápsula ahumada y botón (+) gema esmeralda/índigo.
  - Tipografía oscura de alto contraste (`#0F172A` Slate 900) con preservación inteligente de texto blanco en botones de acción primarios.
- **Hook Unificado de Tema ([`useTheme.ts`](file:///c:/Users/santi/Documents/UNI/Fluo/src/hooks/useTheme.ts))**:
  - Gestión reactiva del estado `themeMode: 'system' | 'dark' | 'light'` persistido en Zustand (`fluo_finance_storage_v3`).
  - Sincronización automática de clases `dark` / `light` en `document.documentElement`, atributos `data-theme`, `color-scheme` y etiquetas `<meta name="theme-color">` (`#0B0F19` ↔ `#F1F5F9`).
  - Detección en vivo de cambios en las preferencias del sistema operativo (`window.matchMedia('(prefers-color-scheme: dark)')`).
- **Selector Triple en Centro de Ajustes ([`ProfileSettingsModal.tsx`](file:///c:/Users/santi/Documents/UNI/Fluo/src/components/profile/ProfileSettingsModal.tsx))**:
  - Nuevo bloque de *Apariencia / Tema* con segmented control estilo iOS:
    - *Claro* (`Sun` con acento ámbar).
    - *Oscuro* (`Moon` con acento índigo).
    - *Sistema* (`Monitor` con acento esmeralda).
### v0.5.22 (Calibración de Contraste Global y Distribución Espacial de Movimientos)
- **Calibración Óptica de Contraste ("Sin Pasarte")**:
  - **Modo Oscuro**: Borde perimetral elevado de `border-white/10` a `border-white/[0.18]` y fondos vítreos a `bg-white/[0.07] - bg-white/[0.08]` con bisel superior `shadow-inner` y relieve suave. Aplicado en `SwipeableTransactionItem`, `HeroBalance` (submétricas de ahorro y rendimiento), `MetricPillars`, `RecurrenceSummaryWidget` y reglas base de `index.css`.
  - **Modo Claro ("Blanco Perla iOS")**: Sustrato perla `rgba(255, 255, 255, 0.88 - 0.92)` y contornos nítidos `rgba(203, 213, 225, 0.85)` con luz cenital `inset 0 1px 0 rgba(255,255,255,1)` y sombra difusa, garantizando separación limpia de cada recuadro frente al lienzo `#F1F5F9`.
- **Alineación Ergonómica de Movimientos ([`SwipeableTransactionItem.tsx`](file:///c:/Users/santi/Documents/UNI/Fluo/src/components/home/SwipeableTransactionItem.tsx))**:
  - **Importe Pegado a la Derecha**: Padding perimetral `py-3 pl-3 pr-2.5 sm:pr-3` con el importe y fecha situados pegados al borde derecho (`text-right whitespace-nowrap`).
  - **Mayor Amplitud para el Concepto**: Margen del avatar reducido a `mr-2.5`, separación central a `mr-2` y supresión de límites artificiales de ancho (`max-w-[180px]`), otorgando entre 25px y 35px adicionales al nombre del comercio o movimiento antes de truncar.
  - **Adaptabilidad Móvil**: Botones de acción rápida de escritorio (`Pencil` y `Trash2`) encapsulados con `hidden sm:flex` para no robar espacio horizontal en pantallas táctiles.
- **Validación de Calidad**: `npx tsc -b` (0 errores), `npm test` (23/23 tests pasando) y `npx vite build` exitoso (570ms).

### v0.5.23 (Legibilidad y Alto Contraste en Carteles de Inversión en Modo Claro)
- **Eliminación del Efecto Claro sobre Claro**:
  - Se identificó que las pastillas de tipo de activo (`ETF`, `Acción`, `Fondo Indexado`, `Cripto`, `Renta Fija`, `Depósito`), identificadores de activo (`Ticker/ISIN`), badges de datos offline y porcentajes de P&L usaban tonalidades pastel claras (`*-300`, `*-200`), las cuales sobre el cristal perlado de modo claro resultaban casi ilegibles (ratios < 1.8:1).
- **Adaptación Cromática de Alta Definición**:
  - En [`InvestmentsView.tsx`](file:///c:/Users/santi/Documents/UNI/Fluo/src/components/investments/InvestmentsView.tsx), [`AddAssetModal.tsx`](file:///c:/Users/santi/Documents/UNI/Fluo/src/components/investments/AddAssetModal.tsx), [`QuickAddTransactionModal.tsx`](file:///c:/Users/santi/Documents/UNI/Fluo/src/components/forms/QuickAddTransactionModal.tsx) e [`index.css`](file:///c:/Users/santi/Documents/UNI/Fluo/src/index.css):
    - `ETF` / Índigo: `light:text-indigo-700 light:bg-indigo-500/10 light:border-indigo-500/30`.
    - `Acción` / Azul: `light:text-blue-700 light:bg-blue-500/10 light:border-blue-500/30`.
    - `Fondo Indexado` / Púrpura: `light:text-purple-700 light:bg-purple-500/10 light:border-purple-500/30`.
    - `Cripto` y Caché / Ámbar: `light:text-amber-800 light:bg-amber-500/15 light:border-amber-500/35`.
    - `Renta Fija` / Esmeralda: `light:text-emerald-700 light:bg-emerald-500/10 light:border-emerald-500/30`.
    - `Depósito` / Cerceta: `light:text-teal-700 light:bg-teal-500/10 light:border-teal-500/30`.
    - Ticker e ISIN: `light:bg-indigo-50/80 light:text-indigo-800 light:border-indigo-200/80`.
    - Botón "Cotizaciones": `light:text-indigo-700 light:bg-indigo-50 light:border-indigo-300 hover:light:bg-indigo-100`.
- **Validación de Calidad**: `npx tsc -b` (0 errores), `npm test` (23/23 tests pasando) y `npx vite build` exitoso (600ms).

### v0.5.24 (Ajuste Ergonómico de KPIs en Estadísticas & Dock Flotante Liquid Glass en Modo Claro)
- **Ajuste Espacial y Formateo en Estadísticas ([`AnalyticsView.tsx`](file:///c:/Users/santi/Documents/UNI/Fluo/src/components/analytics/AnalyticsView.tsx))**:
  - **Identidad de los 3 Cuadrados**: Las 3 tarjetas superiores reflejan inequívocamente los pilares de **Ingresos**, **Gastos** e **Inversiones**.
  - **Margen Compacto Sin Vacíos**: Reducción del padding a `p-2.5 sm:p-3` y eliminación de `justify-between`, unificando el título y su contenido con un espaciado vertical armónico (`gap-1`, `mt-0.5`).
  - **Eliminación de Saltos de Línea Forzados**:
    - Importes formateados con `formatCompactCurrency` y `whitespace-nowrap`, garantizando que nunca se desborden ni rompan en dos líneas en pantallas estrechas.
    - Subtextos condensados en una sola línea clara (`% ahorro`, `importe/día`, `% ROI`).
- **Auténtica Estética Liquid Glass en Barra de Navegación ([`FloatingNavbar.tsx`](file:///c:/Users/santi/Documents/UNI/Fluo/src/components/layout/FloatingNavbar.tsx), [`index.css`](file:///c:/Users/santi/Documents/UNI/Fluo/src/index.css))**:
  - **Translucidez Óptica Orgánica**: Reducción de la opacidad del dock en Modo Claro de `0.88` a `0.65` (`bg-white/65 backdrop-blur-2xl backdrop-saturate-200 border border-white/85`), permitiendo que el contenido refracte con fluidez al hacer scroll inferior.
  - **Pestaña Activa como Lente Elevada**: La pestaña activa pasa de un gris opaco a una lente vítrea blanca brillante `light:bg-white/85 light:text-indigo-600 light:border-white light:shadow-[0_2px_8px_rgba(15,23,42,0.08),inset_0_1px_1px_rgba(255,255,255,1)] font-bold`.
  - **Bisel Especular y Aura Atmosférica**: Destello cenital `light:via-white/90` y suspensión subsuperficial `light:bg-indigo-500/25 blur-xl`.
- **Validación de Calidad**: `npx tsc -b` (0 errores), `npm test` (23/23 tests pasando) y `npx vite build` exitoso (545ms).

### v0.5.25 (Refinamiento de Translucidez Liquid Glass en Barra de Navegación)
- **Incremento de Transparencia Óptica en Modo Claro**:
  - Calibración del sustrato del dock de `0.65` a `0.48` (`rgba(255, 255, 255, 0.48)` con `backdrop-blur-2xl` y `saturate(210%)`), logrando un efecto cristalino auténtico donde las tarjetas y colores del scroll inferior refractan con naturalidad e ingravidez.
  - Reducción del degradado interior `light:from-white/30` a `light:from-white/15` para eliminar cualquier velo lechoso residual.
  - Ajuste de la pastilla de pestaña activa a `light:bg-white/75` para integrarse armoniosamente sobre la base más translúcida.
- **Validación de Calidad**: `npx tsc -b` (0 errores), `npm test` (23/23 tests pasando) y `npx vite build` exitoso (584ms).

### v0.5.26 (Selector de Fecha Personalizado & Orden Cronológico Descendente de Transacciones)
- **Selector de Fecha Liquid Glass en [`QuickAddTransactionModal.tsx`](file:///c:/Users/Santino/Documents/Fluo/src/components/forms/QuickAddTransactionModal.tsx)**:
  - Campo "Fecha del movimiento" con iconografía Lucide (`Calendar`) integrada a la izquierda.
  - Valor por defecto inicializado a la fecha actual local (`YYYY-MM-DD`).
  - **Píldoras de Acceso Rápido Ergonómicas**: Pastillas translúcidas "Hoy", "Ayer" y "Elegir fecha" adaptadas semánticamente al pilar activo (esmeralda para ingresos, coral para gastos). Al pulsar "Elegir fecha", se dispara el selector de calendario nativo mediante `showPicker()`.
  - Transmisión estricta de la fecha elegida en formato ISO (`YYYY-MM-DDTHH:mm:ss.sssZ`), respetando la fecha original al editar y evitando fijar erróneamente siempre la hora actual.
- **Ordenación Cronológica Garantizada en [`useFinanceStore.ts`](file:///c:/Users/Santino/Documents/Fluo/src/store/useFinanceStore.ts) & [`dates.ts`](file:///c:/Users/Santino/Documents/Fluo/src/utils/dates.ts)**:
  - Nueva función utilitaria `sortTransactionsDesc` que ordena las transacciones por fecha descendente (las más recientes primero), usando `createdAt` como criterio secundario.
  - Aplicada de forma automática en `addTransaction`, `updateTransaction`, `setTransactions`, `triggerRecurrencesCheck`, `loadCloudData` y el `merge` de persistencia en `localStorage`.
  - Almacenamiento resiliente `safeStorage` con fallback a memoria para entornos de testing y runners aislados.
- **Coherencia en Gráficos, Estadísticas y Filtros**:
  - Validado que transacciones registradas en meses pasados o futuros se agrupan en su mes respectivo en el gráfico de barras comparativas y la dona de distribución de [`AnalyticsView.tsx`](file:///c:/Users/Santino/Documents/Fluo/src/components/analytics/AnalyticsView.tsx).
  - Los filtros temporales (`this_month`, `last_month`, `last_3_months`, etc.) reflejan los movimientos según su fecha real de apunte.
- **Suite de Pruebas Automatizadas (Vitest)**:
  - Creado el archivo [`useFinanceStore.test.ts`](file:///c:/Users/Santino/Documents/Fluo/src/store/useFinanceStore.test.ts) con 7 nuevas pruebas unitarias: preservación de fecha pasada, ordenación cronológica descendente ante inserciones desordenadas, actualización de fecha con reordenación, filtrado por rangos temporales y helpers de fechas.
  - Suite global incrementada a **30 tests unitarios pasando al 100%**.
- **Validación de Calidad**: `npx tsc -b` (0 errores), `npm test` (30/30 tests pasando) y `npx vite build` exitoso.

### v0.9.0 (Sistema Multicuenta "Fuentes", Carrusel Deslizante de Balance, Onboarding y Reordenación)
- **Modelado & Persistencia de Fuentes (`SourceAccount`)**:
  - Definida la entidad `SourceAccount` con soporte para bancos (`bank`) y efectivo (`cash`), `institution`, `initialBalance`, `orderIndex` y `color`.
  - Nueva tabla SQL `public.source_accounts` en Supabase con índices optimizados y 4 políticas RLS completas (`auth.uid() = user_id`).
  - Campo `sourceId?: string` añadido a `Transaction` y columna `source_id TEXT` en `public.transactions`.
  - Sincronización en la nube completa en [`cloudSyncService.ts`](file:///c:/Users/Santino/Documents/Fluo/src/services/cloudSyncService.ts) (`insertCloudSource`, `updateCloudSource`, `reorderCloudSources`, `deleteCloudSource`).
- **Carrusel Líquido Deslizante en Tarjeta Principal ([`HeroBalance.tsx`](file:///c:/Users/Santino/Documents/Fluo/src/components/home/HeroBalance.tsx))**:
  - Carrusel horizontal snap a 60/120 fps con aceleración por GPU (`snap-x snap-mandatory transform-gpu`).
  - **Slide 0**: "Patrimonio Neto Total" consolidado con submétricas de ahorro y rendimiento de cartera.
  - **Slides 1..N**: Tarjetas Liquid Glass para cada fuente ordenada por `orderIndex` con balance neto individual (`initialBalance + ingresos - gastos - inversiones salientes`) y conteo de movimientos.
  - **Indicador de Paginación**: Cápsulas translúcidas con resplandor índigo activo y microinteracciones de navegación suave.
- **Onboarding Guiado de Fuente Inicial ([`InitialSourceModal.tsx`](file:///c:/Users/Santino/Documents/Fluo/src/components/common/InitialSourceModal.tsx))**:
  - Detección automática al registrarse o tener 0 fuentes en cloud/local, forzando la creación de la primera cuenta o billetera.
- **Selector de Fuente en Transacciones ([`QuickAddTransactionModal.tsx`](file:///c:/Users/Santino/Documents/Fluo/src/components/forms/QuickAddTransactionModal.tsx))**:
  - Selector Liquid Glass integrado en los flujos de Gasto, Ingreso e Inversión con valor predeterminado en `orderIndex: 0`.
  - Guardado reactivo de `sourceId` con recálculo instantáneo de balances individuales y consolidados.
- **Gestión y Reordenación en Perfil ([`SourceAccountManager.tsx`](file:///c:/Users/Santino/Documents/Fluo/src/components/profile/SourceAccountManager.tsx))**:
  - Tarjetas compactas con botones de subida/bajada que actualizan `orderIndex` en tiempo real.
  - Modificación de nombre y saldo inicial, modal de alta de nueva fuente y borrado con confirmación preventiva ante movimientos asociados.
- **Suite de Tests Automatizados (Vitest)**:
  - Creado [`sourceAccounts.test.ts`](file:///c:/Users/Santino/Documents/Fluo/src/store/sourceAccounts.test.ts) con 9 nuevas pruebas unitarias: balance por fuente vs global, reordenación `orderIndex`, selección predeterminada, onboarding y operaciones CRUD.
  - Suite global incrementada a **39 tests unitarios pasando al 100%**.
- **Validación de Calidad**: `npx tsc -b` (0 errores) y `npm test` (39/39 tests pasando).

### v0.9.1 (Aislamiento Total por Cuenta, Logotipos Bancarios Oficiales e Indicador Integrado)
- **Aislamiento Estricto por Cuenta (`activeSourceId`)**:
  - `HeroBalance`: La diapositiva activa sincroniza bidireccionalmente `activeSourceId` en el store Zustand (`activeSlide === 0 ? null : source.id`).
  - `MetricPillars`: Al seleccionar una cuenta X, las estadísticas de Ingresos, Gastos e Inversión se aíslan exclusivamente a los apuntes de esa cuenta. El modo consolidado solo se muestra en Slide 0 ("Patrimonio Neto Total").
  - `RecentTransactionsList`: Filtra estrictamente los movimientos por `tx.sourceId === activeSourceId`, adapta el título dinámicamente (`Movimientos de {Cuenta}`), renderiza el `SourceAvatar` y muestra estados vacíos contextuales.
  - `AnalyticsView`: Añadido selector horizontal Liquid Glass de cuentas, aislando el cálculo de KPIs, distribución por categorías y flujo mensual según la cuenta activa o consolidada.
  - `QuickAddTransactionModal`: Preselección automática de la cuenta activa al abrir el modal (+) de nuevo movimiento.
- **Logotipos Oficiales Bancarios (`SourceAvatar.tsx`)**:
  - Componente Liquid Glass reutilizable que resuelve logotipos vectoriales de bancos (BBVA, Santander, Revolut, CaixaBank, Sabadell, ING, N26, Openbank, Bankinter, Wise, Trade Republic, MyInvestor) con cascada multi-CDN y fallback a `Landmark` o `Wallet` para efectivo.
  - Integrado en `HeroBalance`, `RecentTransactionsList`, `SourceAccountManager`, `QuickAddTransactionModal` y `AnalyticsView`.
- **Indicador de Paginación Integrado en Esquina Superior Derecha**:
  - Eliminado el indicador inferior redundante debajo de la tarjeta principal.
  - Integrado directamente dentro de la tarjeta de balance en la esquina superior derecha (`rounded-full bg-white/[0.08] border border-white/10 backdrop-blur-md px-2.5 py-1`).
- **Suite de Pruebas Automatizadas (Vitest)**:
  - 2 nuevas pruebas unitarias en [`sourceAccounts.test.ts`](file:///c:/Users/Santino/Documents/Fluo/src/store/sourceAccounts.test.ts) validando el reseteo de `activeSourceId` y alternancia de cuentas.
  - Suite global incrementada a **41 tests unitarios pasando al 100%**.
### v0.9.2 (Indicador Inferior Derecho, Paridad Dimensional, Limpieza de Movimientos y Portals en Perfil)
- **Indicador Interno en Esquina Inferior Derecha ([`HeroBalance.tsx`](file:///c:/Users/Santino/Documents/Fluo/src/components/home/HeroBalance.tsx))**:
  - Reubicación del indicador de diapositivas de la esquina superior derecha a la esquina inferior derecha de cada tarjeta (`flex items-center justify-end mt-2.5`).
  - Cápsula Liquid Glass integrada sin interferir con la botonera de privacidad ni acciones superiores.
- **Paridad Dimensional Estricta en Carrusel ([`HeroBalance.tsx`](file:///c:/Users/Santino/Documents/Fluo/src/components/home/HeroBalance.tsx))**:
  - `flex items-stretch` en la pista del carrusel con tarjetas fijadas en `h-full flex flex-col justify-between flex-1 min-h-[240px]`.
  - Equilibrio de submétricas a 3 líneas de contenido simétricas en todos los modos, eliminando discrepancias de altura que dejaban fondos expuestos debajo de la tarjeta principal.
- **Limpieza en Cabecera de Movimientos ([`RecentTransactionsList.tsx`](file:///c:/Users/Santino/Documents/Fluo/src/components/home/RecentTransactionsList.tsx))**:
  - Retirado el icono de tarjeta junto al título de movimientos recientes para máxima ligereza visual.
- **Aislamiento de Modales de Fuentes en Perfil ([`SourceAccountManager.tsx`](file:///c:/Users/Santino/Documents/Fluo/src/components/profile/SourceAccountManager.tsx))**:
  - Implementado `createPortal(..., document.body)` con capa `z-[100]` en los modales de alta, edición y eliminación de cuentas. Se erradica por completo la colisión con la sección de PIN de seguridad que se superponía al formulario.
  - Título del apartado renombrado estrictamente a **"Mis Fuentes"**.
- **Adaptabilidad Vertical en Onboarding Móvil ([`InitialSourceModal.tsx`](file:///c:/Users/Santino/Documents/Fluo/src/components/common/InitialSourceModal.tsx))**:
  - Implementada contención vertical dinámica con `max-h-[92dvh] overflow-y-auto no-scrollbar` y espaciado compacto. Resuelve el desbordamiento vertical en pantallas móviles (ej. Honor Magic 6 Pro) cuando se selecciona "Cuenta Bancaria" y se muestran los selectores de entidades, garantizando que el formulario y botón de acción siempre queden dentro de la pantalla y sean desplazables con suavidad.
- **Validación & Tests**: `npx tsc -b` limpio (0 errores), 41 tests unitarios pasando al 100% y bundle de producción validado con `npm run build`.

### v0.9.3 (Persistencia Resiliente de Fuentes, Reconciliación Offline-Cloud y Prevención de Purgas en Arranque)
- **Persistencia de `userId` en `partialize` y `merge` ([`useFinanceStore.ts`](file:///c:/Users/Santino/Documents/Fluo/src/store/useFinanceStore.ts))**:
  - Se añadió `userId` al middleware de persistencia en `localStorage` (`fluo_finance_storage_v3`).
  - Previene que al reabrir la web app `userId` arranque en `null` antes de la inicialización de sesión de Supabase.
- **Blindaje en Conmutación de Usuario (`setUserId`)**:
  - Se modificó la condición de purga: únicamente resetea las colecciones si existe un cambio genuino entre dos usuarios autenticados distintos (`prevId && userId && prevId !== userId`).
  - Elimina el borrado accidental del estado local que ocurría en cada recarga o reinicio de la aplicación cuando `prevId` era `null`.
- **Reconciliación Inteligente en `loadCloudData`**:
  - Si la nube retorna 0 fuentes (por ejemplo, si la tabla `source_accounts` aún no existe o el usuario configuró su cuenta offline), el store **preserva las fuentes locales** de `localStorage` y dispara una sincronización en segundo plano con `insertCloudSource`.
  - Si la nube contiene fuentes, se fusionan inteligentemente preservando cualquier fuente local pendiente de sincronización.
- **Tolerancia a Fallos en `fetchUserCloudData` ([`cloudSyncService.ts`](file:///c:/Users/Santino/Documents/Fluo/src/services/cloudSyncService.ts))**:
  - Un error en la consulta a `source_accounts` (ej. tabla pendiente de crear en Supabase) ya no invalida el fetch global si `transactions` e `investments` cargan correctamente, evitando falsos positivos de error de sincronización.
- **Suite de Tests Automatizados (Vitest)**:
  - 3 nuevos tests en [`sourceAccounts.test.ts`](file:///c:/Users/Santino/Documents/Fluo/src/store/sourceAccounts.test.ts) validando que `setUserId` no borre fuentes en el arranque en frío, preserve fuentes ante llamadas repetidas y solo purgue al cambiar entre usuarios distintos.
  - Suite global incrementada a **44 tests unitarios pasando al 100%**.
- **Validación de Compilación**: `npx tsc -b` limpio (0 errores), `vitest run` (44/44 pasando) y build de producción optimizado (`npm run build`).

### v0.9.4 (Módulo de Importe Ahorrado, Métricas Absolutas y Evolución Gráfica en Estadísticas)
- **Tarjeta Maestra de Ahorro Neto Real ([`AnalyticsView.tsx`](file:///c:/Users/Santino/Documents/Fluo/src/components/analytics/AnalyticsView.tsx))**:
  - Contenedor interactivo Liquid Glass (`bg-slate-900/60 backdrop-blur-2xl border border-white/15 rounded-3xl p-5 sm:p-6 shadow-[0_8px_32px_0_rgba(0,0,0,0.37)]`) situado de forma prominente en la cabecera analítica tras los selectores.
  - Reflector especular superior y orbe ambiental dinámico (`bg-emerald-500/15` para superávit, `bg-rose-500/15` para déficit).
  - Insignia semántica Liquid Glass con iconos `TrendingUp` ("Superávit") o `TrendingDown` ("Déficit").
  - Importe neto de alto impacto tipográfico (`text-3xl sm:text-4xl font-black`) con formato de divisa y resplandor neón esmeralda/coral.
  - Desglose secundario en cuadrícula de 3 celdas:
    - *Tasa de Ahorro*: Porcentaje relativo sobre los ingresos (`(netSavings / income) * 100`).
    - *Ahorro Medio Diario*: Ritmo diario de acumulación según días transcurridos (`/d`).
    - *Proyección de Cierre de Mes*: Estimación del ahorro final mensual al ritmo actual de gasto e ingreso.
- **Gráfico de Evolución del Ahorro Acumulado**:
  - Gráfico de área interactivo con spline `monotone`, gradiente esmeralda/coral `#savingsAreaGradient` (25% a 0%), `<ReferenceLine y={0} stroke="rgba(255,255,255,0.2)" strokeDasharray="3 3" />` y conmutador `[Acumulado | Neto]`.
  - Tooltip Liquid Glass (`SavingsCustomTooltip`) con desenfoque `backdrop-blur-xl bg-[#0F1626]/95 border border-white/20`, viñeta semántica y desglose punto a punto de ingresos, gastos, ahorro neto puntual y ahorro acumulado.
- **Motor Matemático de Ahorro ([`src/utils/finance.ts`](file:///c:/Users/Santino/Documents/Fluo/src/utils/finance.ts))**:
  - `computeSavingsMetrics`: cálculo seguro y normalizado de superávit, déficit, ritmos diarios y proyecciones.
  - `generateSavingsEvolution`: generador de series temporales continuas adaptable dinámicamente a todos los rangos (`this_month`, `last_month`, `last_3_months`, `last_6_months`, `this_year`, `all`).
- **Aislamiento Multicuenta Total**:
  - Reactividad instantánea al alternar entre el patrimonio consolidado o cuentas bancarias y de efectivo específicas.
- **Pestaña "Ahorro" en Switcher Analítico**:
  - Integrada la vista detallada de ahorro mensual comparativo en el conmutador de gráficos (`categories | comparison | savings | networth`).
- **Suite de Tests Automatizados (Vitest)**:
  - Creado [`src/utils/finance.test.ts`](file:///c:/Users/Santino/Documents/Fluo/src/utils/finance.test.ts) con 9 pruebas unitarias cubriendo cálculos de superávit, déficit, casos sin ingresos (-100% de déficit con ahorro negativo exacto al gasto), proyecciones y series temporales.
  - Suite global incrementada a **53 tests unitarios pasando al 100%**.
- **Validación de Compilación**: `npx tsc -b` limpio (0 errores) y build de producción optimizado (`npm run build`).

### v0.9.5 (Optimización Ergonómica de Estadísticas y Compactación de Scroll)
- **Unificación en Tarjeta Hero Compacta ([`AnalyticsView.tsx`](file:///c:/Users/Santino/Documents/Fluo/src/components/analytics/AnalyticsView.tsx))**:
  - Se fusionaron la tarjeta de ahorro y la fila separada de 3 KPIs en una sola **Tarjeta de Resumen y Balance** de ~160px de altura.
  - Insignias de *Superávit/Déficit* y *Tasa de Ahorro %* en la cabecera.
  - Tira integrada de 4 celdas micro-vítreas: *Ingresos*, *Gastos* (con media diaria), *Ritmo Diario de Ahorro* y *Proyección de Cierre de Mes*.
- **Hub de Visualización con Switcher Inteligente**:
  - Reubicado el gráfico de área interactivo de Evolución del Ahorro (`AreaChart` con spline `monotone`, toggle Acumulado/Neto, línea 0€ y resumen mensual en pastillas) en la pestaña `'savings'`, activa por defecto al abrir Estadísticas.
  - Se eliminó la duplicidad de gráficos apilados y listas redundantes, permitiendo alternar fluidamente entre `Ahorro`, `Categorías`, `Flujo Mensual` y `Patrimonio`.
  - Reducción de más de 650px de altura vertical total en la página (de ~1.550px a ~880px), eliminando el scroll infinito y adaptándose perfectamente a pantallas móviles.
- **Validación & Pruebas**: 53 tests unitarios pasando al 100%, 0 errores de compilación (`npx tsc -b`) y build de producción verificado con éxito.

### v0.9.6 (Revisión Exhaustiva Anti-Solapamiento Tipográfico & Contraste Modo Claro)
- **Corrección Integral del Contraste en Modo Claro ("Blanco Perla iOS")**:
  - **Botón de Perfil y Acciones de Cabecera ([`App.tsx`](file:///c:/Users/Santino/Documents/Fluo/src/App.tsx))**:
    - Se resolvió el problema del icono de perfil oscuro sobre fondo oscuro: añadido fondo perla explícito `light:bg-white/90`, borde sutil `light:border-slate-300/80`, sombra limpia y contraste tipográfico nítido (`light:text-indigo-600` para iniciales y `light:text-slate-700` para icono `User`).
    - Borde del indicador de estado adaptado a `light:border-[#F1F5F9]`.
    - Botón de bloqueo PIN y botón de simulador con variantes luminosas de alta visibilidad (`light:bg-white/90`, `light:text-slate-700`, `light:bg-indigo-50`, `light:border-indigo-200`).
  - **Mapeo Global en [`src/index.css`](file:///c:/Users/Santino/Documents/Fluo/src/index.css)**:
    - Adición de reglas para `.bg-slate-800/*` y `.bg-slate-900/*` en modo claro para que cualquier superficie ahumada se convierta automáticamente en cristal blanco translúcido (`rgba(255, 255, 255, 0.92-0.95)`).
    - Calibración de colores semánticos con contraste WCAG AA/AAA (>5.5:1): `.text-emerald-400/500` -> `#047857`, `.text-rose-400/500` -> `#BE123C`, `.text-indigo-400/500` -> `#4338CA`, `.text-amber-400/500` -> `#B45309`, `.text-blue-400/500` -> `#1D4ED8`.
    - Mapeo de fondos de insignias y píldoras con opacidad enriquecida y bordes a juego (`bg-*-500/10`, `/15`, `/20`, `/25`).
    - Supresión de resplandores neón en tipografía clara con `html.light [class*="drop-shadow-[0_0_"] { filter: none !important; }`.
    - Fondos de modales y hojas flotantes (`bg-slate-900/95`, `bg-[#0F1626]/95`) con fondo de cristal blanco y overlays con oscurecimiento suave (`rgba(15, 23, 42, 0.45)`).
  - **Indicadores de Diapositiva en Carrusel ([`HeroBalance.tsx`](file:///c:/Users/Santino/Documents/Fluo/src/components/home/HeroBalance.tsx))**:
    - Contenedor con `light:bg-slate-200/80 light:border-slate-300` y puntos inactivos en `light:bg-slate-400/50 hover:light:bg-slate-600/70`, garantizando perfecta legibilidad en fondos blancos.
- **Prevención Global de Superposiciones y Colisiones Tipográficas (Anti-Overlap)**:
  - **Carrusel de Balance ([`HeroBalance.tsx`](file:///c:/Users/Santino/Documents/Fluo/src/components/home/HeroBalance.tsx))**:
    - `min-w-0` y `truncate` en todas las submétricas (Tasa de ahorro, Rendimiento, Gastos e Ingresos recurrentes, P&L de inversión, balance inicial y conteo de movimientos).
    - Encabezados de cuenta con `min-w-0 flex-1 mr-2` para evitar colisiones con el botón de privacidad.
  - **Pillars de Métricas ([`MetricPillars.tsx`](file:///c:/Users/Santino/Documents/Fluo/src/components/home/MetricPillars.tsx))**:
    - Inclusión de `min-w-0` en los 3 botones de cuadrícula y `truncate` en títulos, números y subtítulos para evitar desbordamientos en terminales móviles de 360px.
  - **Estadísticas & Gráficos ([`AnalyticsView.tsx`](file:///c:/Users/Santino/Documents/Fluo/src/components/analytics/AnalyticsView.tsx))**:
    - `min-w-0 flex-1` y `truncate` en títulos de Evolución del Ahorro, Distribución de Gastos, Flujo Mensual Comparativo, Evolución de Patrimonio y Comercios & Marcas Top.
    - Leyenda de dona y lista de marcas con `min-w-0 flex-1` en nombres y `flex-shrink-0 whitespace-nowrap` en importes monetarios.
    - Cuadrícula de 5 meses con `min-w-0` y `truncate` en todas las pastillas mensuales de superávit/déficit.
  - **Gestor de Cuentas ([`SourceAccountManager.tsx`](file:///c:/Users/Santino/Documents/Fluo/src/components/profile/SourceAccountManager.tsx))**:
    - Nombres de cuentas con `min-w-0 flex-1 mr-2`, truncado y `flex-shrink-0` en etiquetas de entidad.
- **Validación de Calidad**:
  - Compilación TypeScript: `npx tsc -b` (0 errores).
  - Tests automatizados: 53 tests pasando en Vitest (6 suites).
  - Build de producción: `npm run build` generado y optimizado con gzip y brotli.

### v0.9.7 (Corrección Crítica: Persistencia de Fuentes al Re-Login)
- **Bug Crítico Resuelto: Pérdida de Fuentes al Cerrar Sesión y Volver a Iniciar**:
  - **Causa Raíz Identificada**: Race condition entre `purgeUserData()` (que borra `localStorage` y pone `sources: []` en memoria) y la carga asíncrona `loadCloudData()`. Entre el primer render tras `setUserId()` y la finalización de `loadCloudData()`, existía un gap donde `isCloudLoading === false` y `sources.length === 0`, provocando que el `InitialSourceModal` se mostrara falsamente.
  - **Nuevo Estado `hasHydratedFromCloud`** ([`useFinanceStore.ts`](file:///c:/Users/santi/Documents/UNI/Fluo/src/store/useFinanceStore.ts)):
    - Boolean que se inicializa en `false` y cambia a `true` únicamente cuando `loadCloudData` completa (éxito o error).
    - Se resetea a `false` en `purgeUserData()` y en `setUserId()` al detectar login fresco (`userId && !prevId`) o cambio de usuario.
  - **Cierre de Gap Síncrono en `setUserId`**: Cuando se detecta un login fresco (`prevId === null`, `userId !== null`), se establece inmediatamente `isCloudLoading: true` y `hasHydratedFromCloud: false` para evitar que el primer render muestre el modal de onboarding.
  - **Guardia Reforzada en `InitialSourceModal`** ([`App.tsx`](file:///c:/Users/santi/Documents/UNI/Fluo/src/App.tsx)):
    - Para usuarios autenticados, el modal solo se muestra si `hasHydratedFromCloud === true` Y `sources.length === 0`, asegurando que la decisión se tome DESPUÉS de haber consultado Supabase.
    - Para modo demo, se mantiene el comportamiento inmediato ya que opera enteramente en local.
- **Validación de Calidad**: Compilación TypeScript limpia (`npx tsc --noEmit`, 0 errores).

### v0.9.8 (Entrada Flexible de Inversiones & Validaciones en Tiempo de Ejecución)
- **Selector de Modo de Entrada (Segmented Control Liquid Glass)**:
  - Implementación en [`QuickAddTransactionModal.tsx`](file:///c:/Users/santi/Documents/UNI/Fluo/src/components/forms/QuickAddTransactionModal.tsx) del selector interactivo con dos pestañas vítreas:
    1. **"Por Importe Total (€)"**: El usuario solo especifica el capital total desembolsado y la aplicación calcula automáticamente las participaciones correspondientes (`total / price`) a 6 decimales de precisión.
    2. **"Por Cantidad de Títulos"**: Flujo clásico donde se indican las unidades o fracciones (ej. 0.045 BTC, 12.5 títulos) y se proyecta la inversión total resultante.
  - Indicador activo flotante con resplandor índigo (`bg-indigo-500/25 border-indigo-400/40 shadow-indigo-500/20`), iconos dedicados (`DollarSign`, `Hash`) y microanimaciones suaves.
- **Sincronización Bidireccional Reactiva**:
  - Al alternar de modo o modificar el precio unitario, los campos dependientes se recalculan y adaptan en tiempo real sin perder datos ni entrar en bucles infinitos.
  - Al obtener una cotización en vivo desde Yahoo Finance / CoinGecko / fallback (`marketDataService.ts`), si el modo activo es "Por Importe Total", se recalculan inmediatamente los títulos estimados.
- **Módulo de Validaciones Estrictas y Aritmética Financiera**:
  - Creación de [`src/utils/investmentValidation.ts`](file:///c:/Users/santi/Documents/UNI/Fluo/src/utils/investmentValidation.ts):
    - `normalizeDecimalInput`: Reemplazo transparente de comas (`12,50`) por puntos (`12.50`) adaptado a teclados numéricos españoles y móviles.
    - `parsePositiveNumber`: Validación estricta que descarta `NaN`, infinitos, ceros y negativos.
    - `calculateSharesFromTotal` & `calculateTotalFromShares`: Cálculos seguros con precisión flotante acotada.
    - `calculateAverageBuyPrice`: Deducción automática del coste base unitario medio.
    - `isValidMarketPrice`: Guardián de tipo en tiempo de ejecución para cotizaciones de mercado.
    - `validateInvestmentEntry`: Validador integral que recopila errores amigables antes del guardado.
- **Panel de Advertencias y Errores Liquid Glass**:
  - Alertas visuales con estilo `border-rose-500/20 bg-rose-500/10` para entradas inválidas.
  - Aviso contextual `border-amber-500/20 bg-amber-500/10` si una cotización no pudo verificarse en vivo, solicitando confirmación manual del precio de compra.
- **Suite de Pruebas Automatizadas (Vitest)**:
  - Creación de [`src/utils/investmentValidation.test.ts`](file:///c:/Users/santi/Documents/UNI/Fluo/src/utils/investmentValidation.test.ts) con 31 tests exhaustivos cubriendo normalización de comas/puntos, división por cero, redondeo fraccionario, coherencia bidireccional y guardias de mercado. Total global: 84 tests unitarios pasando.
- **Validación de Calidad**:
  - Compilación TypeScript: `tsc -b` (0 errores).
  - Build de producción: `vite build` completado y optimizado con gzip y brotli.

### v0.9.9 (Alineación Integral con el Esquema Real de Supabase & Persistencia Cloud Resiliente)
- **Diagnóstico y Corrección de Discrepancias de Esquema en Supabase**:
  - **Tabla `public.transactions`**: Adaptación estricta a las 11 columnas reales de la base de datos:
    - Mapeo de `pillar` a `type` con respeto estricto al check `CHECK (type IN ('income', 'expense'))`.
    - Mapeo de `categoryId` a `category`.
    - Codificación transparente de `brandId` y `concept` dentro de la columna `brand` (`brandId::concept`).
    - Eliminación de campos que causaban error 400 Bad Request en PostgREST (`concept`, `pillar`, `category_id`, `recurrence_id`, `is_recurring_generated`).
  - **Tabla `public.investments`**: Adaptación a las 8 columnas reales de la base de datos:
    - Mapeo de `identifier` / `ticker` / `isin` al campo canónico `symbol_or_isin`.
    - Eliminación de columnas inexistentes que bloqueaban los inserts (`ticker`, `isin`, `current_price`, `currency`, `platform`, `brand_id`, `last_updated`, `change_24h`, `initial_fee`, `acquisition_date`).
    - Resolución dinámica en tiempo real de cotizaciones desacoplada de la persistencia relacional.
  - **Tabla `public.source_accounts`**: Integración verificada con `upsert(..., { onConflict: 'id' })` para eliminar colisiones de clave primaria (error 409) durante reconciliaciones y altas de cuentas.
- **Generación Garantizada de UUIDs para PostgreSQL**:
  - Implementación de `generateUuid()` y `ensureValidUuid()` con fallback RFC4122 v4 en [`supabaseClient.ts`](file:///c:/Users/santi/Documents/UNI/Fluo/src/lib/supabaseClient.ts) para evitar errores de sintaxis de tipo UUID (`invalid input syntax for type uuid`).
- **Resiliencia en Consulta Cloud (`fetchUserCloudData`)**:
  - La respuesta de carga considera éxito si al menos una tabla responde correctamente (`!allFailed`), permitiendo la hidratación completa de fuentes aun si el usuario todavía no tiene transacciones o activos registrados.
- **Sincronización de `schema.sql` y Políticas RLS**:
  - Actualización de [`supabase/schema.sql`](file:///c:/Users/santi/Documents/UNI/Fluo/supabase/schema.sql) con las sentencias DDL exactas de producción y políticas completas de RLS para el rol `authenticated`.
- **Validación de Calidad**:
  - Vitest: 84/84 tests pasando (7 suites).
  - TypeScript: `tsc -b` limpio (0 errores de tipos).
  - Build: bundle de producción generado y comprimido con gzip y brotli.

### v0.9.10 (Refinamiento Estético Liquid Glass: Separación Lateral de Tarjetas, Eliminación de Barras de Scroll y Limpieza de Fuentes)
- **Centrado Perfecto, Separación Lateral de Tarjetas & Aislamiento de Sombras (`HeroBalance`)**:
  - Corrección de descentrado: Se eliminaron los márgenes negativos horizontales (`-mx-1`) que desplazaban la tarjeta respecto a la columna de contenido, y se restauró `snap-center` con `w-full` en cada diapositiva.
  - El contenedor ahora tiene `position: relative`, haciendo que `targetSlide.offsetLeft` sea una coordenada relativa directa y precisa (0px en Slide 0, exactamente el ancho + `gap-4` en las siguientes).
  - Separación elástica con `gap-4` (16px) entre tarjetas, aislando completamente las sombras difusas para evitar manchas oscuras sin alterar el centrado en pantalla.
  - Recalibración de sombras volumétricas suaves `shadow-[0_10px_28px_-6px_rgba(0,0,0,0.35)]` (eliminando definitivamente el excesivo `shadow-2xl shadow-black/50`).
- **Supresión Universal de Barras de Desplazamiento (`.no-scrollbar`)**:
  - Incorporación en [`src/index.css`](file:///c:/Users/santi/Documents/UNI/Fluo/src/index.css) de la clase `.no-scrollbar` y selector universal `[class*="no-scrollbar"]` con soporte cruzado: `::-webkit-scrollbar { display: none !important; width: 0 !important; height: 0 !important; }`, `scrollbar-width: none !important;` y `-ms-overflow-style: none !important;`.
  - Oculta todas las barras de scroll visibles en elementos horizontales (carrusel de tarjetas, listas de filtros, accesos rápidos de marcas y modales) manteniendo el desplazamiento táctil intacto.
- **Presentación Minimalista de Fuentes Financieras (`SourceAccountManager`)**:
  - Eliminación de la etiqueta de subtítulo "Banco" / "Efectivo" en el listado de fuentes en ajustes, conservando únicamente el nombre de la fuente (`source.name`) para máxima sobriedad y limpieza visual.
- **Identidad de Usuario Limpia (Extracción de Alias desde el Correo)**:
  - Formateo del nombre de usuario para mostrar únicamente el identificador antes del arroba (`user.email.split('@')[0]`, ej. `xxx` para `xxx@gmail.com`).
  - Implementado en la cabecera de [`ProfileSettingsModal.tsx`](file:///c:/Users/santi/Documents/UNI/Fluo/src/components/profile/ProfileSettingsModal.tsx) (con el correo completo como subtítulo discreto) y en el tooltip del avatar flotante en [`App.tsx`](file:///c:/Users/santi/Documents/UNI/Fluo/src/App.tsx).
- **Alto Contraste en Gestión de Fuentes (`SourceAccountManager`)**:
  - **Flechas de Prioridad**: Rediseño a cápsulas táctiles Liquid Glass con `bg-white/[0.08] light:bg-slate-100`, bordes claros definidos `light:border-slate-300`, glifos `ChevronUp` / `ChevronDown` con trazo `stroke-[2.5]` en `text-slate-200 light:text-slate-700 hover:light:text-indigo-600`.
  - **Icono de Papelera**: Sustitución del tono tenue por una cápsula vítrea en rojo coral de alto contraste (`bg-rose-500/20 light:bg-rose-50 text-rose-400 light:text-rose-600 border border-rose-500/40 light:border-rose-300 shadow-[0_0_12px_rgba(244,63,94,0.15)]`), con glifo `Trash2` reforzado (`stroke-[2.2]`).
- **Validación de Calidad**:
  - Vitest: 84/84 tests unitarios pasando.
  - TypeScript: compilación limpia (`tsc -b`).
  - Build: empaquetado de producción exitoso.

### v0.9.11 (Paridad Visual con Estadísticas & Restauración de Barra de Navegación Flotante)
- **Evaluación y Solución Definitiva de Sombras Cuadradas (`HeroBalance`)**:
  - **Diagnóstico de Raíz**:
    1. `src/index.css` sobreescribía de forma invasiva cualquier selector con `[class*="bg-white/[0.08]"]` imponiendo `box-shadow: 0 12px 32px -4px rgba(15,23,42,0.08) !important`, forzando un desplazamiento vertical excesivo.
    2. El carrusel `scrollRef` con `overflow-x: auto` establecía por especificación CSS un límite de recorte (*overflow clipping box*). Con un padding vertical exiguo (`py-3.5` = 14px), la sombra difusa de 32px quedaba truncada con un corte recto en la base y en los laterales.
    3. La clase `transform-gpu` rasterizaba el carrusel en una capa de textura de hardware estricta, acentuando el corte de la sombra en un contorno plano.
  - **Alineación con el Estándar de Estadísticas (`AnalyticsView`)**:
    - Superficie Liquid Glass de tarjeta unificada: `bg-slate-900/60 light:bg-white/85 backdrop-blur-2xl border border-white/15 light:border-slate-300/80`.
    - Sombra idéntica a `AnalyticsView`: `shadow-[0_8px_32px_0_rgba(0,0,0,0.37)] light:shadow-[0_8px_24px_rgba(15,23,42,0.08)]` (con variantes semánticas según pilar).
    - Espacio de difusión vertical: `py-6 -my-6` sin `transform-gpu`, garantizando que la sombra redondeada decaiga suavemente a opacidad 0 sin cortarse.
    - Centrado perfecto: Se mantienen diapositivas simétricas con `w-full shrink-0 snap-center`, garantizando que cada tarjeta quede centrada milimétricamente en pantalla.
- **Barra de Navegación Flotante en Modo Claro (`FloatingNavbar`)**:
  - Restauración completa y milimétrica del estado del commit anterior (`abd4470`):
    - Componente [`FloatingNavbar.tsx`](file:///c:/Users/santi/Documents/UNI/Fluo/src/components/layout/FloatingNavbar.tsx) restaurado directamente a su versión oficial con clases translúcidas `light:text-indigo-600`, `light:bg-white/75`, `light:border-white` y sombras internas perladas.
    - En [`src/index.css`](file:///c:/Users/santi/Documents/UNI/Fluo/src/index.css), restitución de la regla `html.light .bg-slate-900\/40` con sustrato translúcido `rgba(255, 255, 255, 0.48)`, desenfoque `blur(28px) saturate(210%)`, borde `rgba(255, 255, 255, 0.8)` y doble resalte especular `#FFFFFF`.
- **Eliminación del Conflicto de Recuadros en Opciones No Seleccionadas**:
  - Corrección de los selectores comodín `[class*="bg-white/..."]` en `src/index.css` que forzaban fondos y bordes permanentes sobre elementos con `hover:bg-white/...`.
  - Ahora las pestañas inactivas de [`FloatingNavbar.tsx`](file:///c:/Users/santi/Documents/UNI/Fluo/src/components/layout/FloatingNavbar.tsx) y los botones inactivos del selector de tema en [`ProfileSettingsModal.tsx`](file:///c:/Users/santi/Documents/UNI/Fluo/src/components/profile/ProfileSettingsModal.tsx) son 100% transparentes, mostrando el recuadro único y exclusivo en la opción seleccionada.
- **Validación de Calidad**:
  - Vitest: 84/84 tests pasando (7 suites).
  - TypeScript: 0 errores (`tsc -b`).
  - Build: empaquetado de producción exitoso con compresión gzip/brotli.

### v0.9.12 (Auditoría AppSec, Cabeceras HTTP A+, Core Web Vitals & Accesibilidad WCAG)
- **Migración Integral de CSP y Cabeceras de Servidor ([`vercel.json`](file:///c:/Users/santi/Documents/UNI/Fluo/vercel.json))**:
  - Configuración nativa de cabeceras HTTP de servidor con alcance `/(.*)`.
  - Content Security Policy (CSP) robusta (`script-src 'self' 'wasm-unsafe-eval'`), eliminando `'unsafe-inline'` y la penalización de navegadores y escáneres HTTP.
  - Orígenes de datos autorizados para APIs financieras (`Supabase`, `Binance`, `Yahoo Finance`, `Clearbit`, `CoinGecko`).
  - Cabeceras de endurecimiento: `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `Referrer-Policy: strict-origin-when-cross-origin`, `Permissions-Policy: camera=(), microphone=(), geolocation=()`, y `Strict-Transport-Security: max-age=63072000; includeSubDomains; preload` (cumplimiento A+ en Mozilla Observatory).
  - Eliminación de etiquetas meta CSP duplicadas e ignoradas en [`index.html`](file:///c:/Users/santi/Documents/UNI/Fluo/index.html).
- **Rastreadores y SEO Limpio ([`public/robots.txt`](file:///c:/Users/santi/Documents/UNI/Fluo/public/robots.txt))**:
  - Archivo físico estático en `/public` permitiendo rastreo controlado y evitando que `robots.txt` devuelva el SPA fallback (`index.html`) con errores de sintaxis en Lighthouse.
- **Optimización Crítica de LCP en Logo ([`public/fluo-wordmark.webp`](file:///c:/Users/santi/Documents/UNI/Fluo/public/fluo-wordmark.webp))**:
  - Conversión del logo oficial a WebP optimizado con compresión avanzada: reducción de 267 KB a 27.7 KB (~89.4% de reducción de peso).
  - Atributos explícitos añadidos en [`App.tsx`](file:///c:/Users/santi/Documents/UNI/Fluo/src/App.tsx) y [`AuthScreen.tsx`](file:///c:/Users/santi/Documents/UNI/Fluo/src/components/auth/AuthScreen.tsx): `width="194"`, `height="84"` y `fetchPriority="high"`, previniendo Cumulative Layout Shift (CLS) y acelerando el Largest Contentful Paint (LCP) en más de 1.3s.
- **Accesibilidad Móvil y Cumplimiento WCAG**:
  - **Habilitación de Zoom**: Eliminada la restricción `user-scalable=no` en el viewport de [`index.html`](file:///c:/Users/santi/Documents/UNI/Fluo/index.html) para cumplir WCAG 1.4.4 (Resize text).
  - **Landmarks Semánticos**: Contenedor maestro `<main>` implementado en [`AuthScreen.tsx`](file:///c:/Users/santi/Documents/UNI/Fluo/src/components/auth/AuthScreen.tsx) para garantizar navegación accesible con tecnologías asistivas (WCAG 1.3.1).
  - **Target Size Táctil**: Ampliación del botón de alternancia de contraseña en [`AuthScreen.tsx`](file:///c:/Users/santi/Documents/UNI/Fluo/src/components/auth/AuthScreen.tsx) a `w-8 h-8` (32×32 px), superando la norma WCAG 2.5.8 ($\ge 24\times24$ px).
- **Validación de Calidad**:
  - Vitest: 84/84 tests unitarios pasando.
  - TypeScript: compilación limpia (`tsc -b`).
  - Build: empaquetado de producción exitoso con generación de Service Worker y precaché de assets.

### v0.9.13 (Sincronización Automática de Fondos por ISIN, Tickers de Referencia & P&L en Tiempo Real)
- **Motor de Resolución Multiruta por ISIN ([`marketDataService.ts`](file:///c:/Users/santi/Documents/UNI/Fluo/src/services/marketDataService.ts))**:
  - Detección inteligente de identificadores ISIN mediante expresión regular estándar ISO 6166 (`^[A-Z]{2}[A-Z0-9]{9}[0-9]$`), activando el pipeline especializado para fondos indexados y fondos mutuos/UCITS.
  - **Ruta 1 (Yahoo Finance / Morningstar API)**: Consulta previa al endpoint de búsqueda `/v1/finance/search?q={ISIN}` para extraer el símbolo interno asignado en bolsas europeas (ej. `0P00000SUJ.F` para Vanguard US 500 `IE0032126645`, `0P00000RQ8.F` para Vanguard European Stock `IE0007987690`).
  - **Ruta 2 (Mapeo a Ticker / ETF Subyacente Equivalente)**: Tabla de equivalencias predefinida `FUND_ISIN_EQUIVALENCE_MAP` para los fondos indexados más habituales del mercado español y europeo (`IE0032126645` $\rightarrow$ `VUSA.AS`, `IE0007987690` $\rightarrow$ `VEUR.AS`, `IE00B03HD191` $\rightarrow$ `VWCE.DE`, etc.). Almacenamiento dual de `isin` y `quote_ticker` para consultas continuas ultrarrápidas.
  - **Ruta 3 (Fallback de NAV con Corte Temporal SWR)**: Si una llamada de red falla por cierre de mercado o fin de semana, utiliza la última cotización almacenada con su marca de tiempo (`lastUpdated`), garantizando que jamás se devuelva 0 € ni se resetee el valor patrimonial.
- **Sincronización Silenciosa en Segundo Plano & P&L Dinámico ([`useFinanceStore.ts`](file:///c:/Users/santi/Documents/UNI/Fluo/src/store/useFinanceStore.ts))**:
  - Función `syncStaleAssetQuotes(maxAgeHours = 6)` integrada al montar [`App.tsx`](file:///c:/Users/santi/Documents/UNI/Fluo/src/App.tsx) y abrir [`InvestmentsView.tsx`](file:///c:/Users/santi/Documents/UNI/Fluo/src/components/investments/InvestmentsView.tsx).
  - Preservación estricta e inmutable del precio de adquisición original (`averageBuyPrice`), actualizando exclusivamente el valor liquidativo actual (`currentPrice`), valor de mercado (`currentValue`), beneficio no realizado (`pnl = (currentPrice * shares) - (averageBuyPrice * shares)`) y porcentaje de retorno (`pnlPercentage`).
  - Recálculo reactivo e instantáneo del Patrimonio Neto consolidado en la tarjeta principal [`HeroBalance.tsx`](file:///c:/Users/santi/Documents/UNI/Fluo/src/components/dashboard/HeroBalance.tsx).
- **Persistencia en la Nube & Esquema Supabase ([`schema.sql`](file:///c:/Users/santi/Documents/UNI/Fluo/supabase/schema.sql) y [`cloudSyncService.ts`](file:///c:/Users/santi/Documents/UNI/Fluo/src/services/cloudSyncService.ts))**:
  - Añadidas columnas `quote_ticker`, `last_price_update` y `current_price` en la tabla `public.investments`.
  - Corrección de `updateCloudAssetPrice` para garantizar que no sobrescriba `average_buy_price` en Supabase.
- **Insignia Visual en Interfaz ([`InvestmentsView.tsx`](file:///c:/Users/santi/Documents/UNI/Fluo/src/components/investments/InvestmentsView.tsx))**:
  - Pastilla Liquid Glass que identifica el ticker de referencia bursátil (`Ref: VUSA.AS`) para fondos indexados resueltos mediante ETF subyacente.
- **Autocompletado Reactivo por ISIN / Ticker ([`AddAssetModal.tsx`](file:///c:/Users/santi/Documents/UNI/Fluo/src/components/investments/AddAssetModal.tsx) y [`QuickAddTransactionModal.tsx`](file:///c:/Users/santi/Documents/UNI/Fluo/src/components/forms/QuickAddTransactionModal.tsx))**:
  - Función [`findMatchingExistingAssets`](file:///c:/Users/santi/Documents/UNI/Fluo/src/services/marketDataService.ts) que evalúa dinámicamente en tiempo real si el valor introducido coincide con activos existentes en la cartera del usuario o en el catálogo de fondos indexados.
  - Menú desplegable flotante Liquid Glass con pastilla `"En cartera"` o clase de activo, datos del broker/plataforma, ticker de referencia y cotización actual.
  - Al hacer clic, **autocompleta todos los campos restantes de forma atómica** (nombre, identificador, tipo, divisa, broker, cotización y precio de compra).
- **Validación & Cobertura de Tests**:
  - Tests unitarios especializados para detección de ISIN, resolución multiruta, cálculo no destructivo de P&L y autocompletado reactivo de activos existentes.
  - Vitest: 97/97 tests unitarios pasando (7 suites completas).
  - TypeScript: 0 errores (`tsc -b`).

### v0.9.14 (Estabilidad de Inicio en PWA & Buscador de Movimientos en Home)
- **Corrección del Desplazamiento Involuntario en Carrusel PWA ([`HeroBalance.tsx`](file:///c:/Users/santi/Documents/UNI/Fluo/src/components/home/HeroBalance.tsx) y [`useFinanceStore.ts`](file:///c:/Users/santi/Documents/UNI/Fluo/src/store/useFinanceStore.ts))**:
  - **Diagnóstico**: Al abrir la PWA, `loadCloudData` hidrataba las cuentas desde Supabase y forzaba `validActiveSourceId` a la primera cuenta bancaria (`sources[0].id`) al comprobar erróneamente `some(s => s.id === null) === false`. Esto provocaba que `HeroBalance.tsx` recibiera un cambio externo de `activeSourceId` de `null` $\rightarrow$ `id`, disparando un scroll suave involuntario hacia la tarjeta de la derecha.
  - **Solución**: Preservación explícita de `currentActiveSourceId === null` durante la hidratación, anclando permanentemente la tarjeta de **Patrimonio Neto Total** en el arranque sin movimientos indeseados.
  - Se añadió anclaje determinista `scrollLeft = 0` al montar el componente.
- **Buscador de Movimientos en Home ([`RecentTransactionsList.tsx`](file:///c:/Users/santi/Documents/UNI/Fluo/src/components/home/RecentTransactionsList.tsx))**:
  - Botón Liquid Glass interactivo `[Buscar]` integrado en la fila de filtros justo al lado de la píldora de `Inversión`.
  - Campo de búsqueda expandible con icono, botón de borrado rápido (`X`) y filtrado en tiempo real sobre concepto, nombre comercial de marca (`Brand`), categoría financiera e importe.
- **Cobertura de Tests**:
  - 98 tests unitarios pasando al 100% en Vitest.

### v0.9.15 (Nuevas Categorías de Gastos, Flujo Cajero & Selector Dual en Estadísticas)
- **Nuevas Categorías Oficiales de Gasto ([`categoriesAndBrands.ts`](file:///c:/Users/santi/Documents/UNI/Fluo/src/data/categoriesAndBrands.ts))**:
  - Incorporadas 6 nuevas categorías oficiales: `Estudios / Formación` (`cat-education`), `Cajero` (`cat-atm`), `Bizum` (`cat-bizum-expense`), `Viajes` (`cat-travel`), `Regalos` (`cat-gifts`) y `Otros` (`cat-other-expense`).
  - Mapeo de nuevos iconos vectoriales Lucide en [`CategoryIcon.tsx`](file:///c:/Users/santi/Documents/UNI/Fluo/src/components/common/CategoryIcon.tsx): `GraduationCap`, `Banknote`, `Send`, `Plane` y `MoreHorizontal`.
- **Flujo Automatizado de Cajero & Regla de Cuenta Única en Efectivo ([`useFinanceStore.ts`](file:///c:/Users/santi/Documents/UNI/Fluo/src/store/useFinanceStore.ts) y [`SourceAccountManager.tsx`](file:///c:/Users/santi/Documents/UNI/Fluo/src/components/profile/SourceAccountManager.tsx))**:
  - Al añadir un gasto en la categoría `Cajero`, si el usuario cuenta con una fuente de tipo efectivo (`type === 'cash'`), se genera automáticamente y de forma atómica una transacción de ingreso gemela (`pillar: 'income'`) por el mismo importe en la cuenta de efectivo.
  - Se añade un banner informativo Liquid Glass en el formulario modal indicando la cuenta de destino del efectivo o avisando si aún no tiene una configurada.
  - Validación estricta que prohíbe tener más de una cuenta en efectivo tanto en el store (`addSource` / `updateSource`) como en la interfaz de gestión de fuentes (bloqueo reactivo del selector con mensaje explicativo).
- **Selector Dual Unificado en Una Sola Línea ([`AnalyticsView.tsx`](file:///c:/Users/santi/Documents/UNI/Fluo/src/components/analytics/AnalyticsView.tsx))**:
  - Integración en una sola fila (`w-full flex items-center gap-2`) del segmented control `[Periodo | Mes]` con opciones adaptativas.
  - Al seleccionar `Mes`: eliminación completa de las pastillas rápidas redundantes y expansión del selector `< Mes YYYY >` al ancho completo disponible de la pantalla (`flex-1 min-w-0 justify-between`) respetando los márgenes perimetrales. Chevrons en los extremos y título del mes centrado con selector nativo.
  - Al seleccionar `Periodo`: carrusel horizontal suave con píldoras de periodo (`Este Mes`, `Mes Pasado`, `Últimos 3 Meses`...).
  - Adaptación de la curva continua de ahorro acumulado y diario en [`finance.ts`](file:///c:/Users/santi/Documents/UNI/Fluo/src/utils/finance.ts) (`generateSavingsEvolution`) para computar exactamente los días del mes elegido.
- **Validación de Calidad**:
  - Vitest: 108/108 tests unitarios pasando.
  - TypeScript: compilación limpia (`tsc -b`).
  - Build de producción: exitoso con Service Worker y precaché PWA.

### v0.9.16 (Arquitectura Responsive Completa: Mobile + Tablet + Desktop/PC)
- **[x] Sistema de Navegación Dual** ([`DesktopSidebar.tsx`](file:///c:/Users/santi/Documents/UNI/Fluo/src/components/layout/DesktopSidebar.tsx) + [`FloatingNavbar.tsx`](file:///c:/Users/santi/Documents/UNI/Fluo/src/components/layout/FloatingNavbar.tsx)):
  - **Mobile/Tablet (`< lg`)**: Barra inferior flotante Liquid Glass `FloatingNavbar` preservada íntegramente.
  - **Desktop/PC (`≥ lg`)**: Nueva barra lateral fija `DesktopSidebar` (`w-64 h-screen fixed left-0 bg-slate-900/40 backdrop-blur-2xl border-r border-white/10`):
    - Logo + wordmark Fluo con indicador de estado de conexión segura (badge esmeralda) o sincronización (`Loader2` índigo pulsante).
    - CTA principal prominente "+ Nuevo Movimiento" con gradiente indigo→esmeralda y sombra `rgba(99,102,241,0.35)`.
    - Menú de navegación con pill activo translúcido (`bg-indigo-500/20 text-indigo-300 border-indigo-500/30`) e indicador neón activo.
    - Botón de PIN / bloqueo en la zona inferior.
    - Mini-tarjeta de perfil del usuario (avatar con initial, nombre de cuenta, email, badge de estado, acceso directo a ajustes).
  - `FloatingNavbar.tsx` añade `lg:hidden` para desaparecer exclusivamente en escritorio sin alterar `z-index` ni composición móvil.
- **[x] Layout Grid Multi-Columna en Desktop** ([`MobileContainer.tsx`](file:///c:/Users/santi/Documents/UNI/Fluo/src/components/layout/MobileContainer.tsx) y [`App.tsx`](file:///c:/Users/santi/Documents/UNI/Fluo/src/App.tsx)):
  - `MobileContainer.tsx` evoluciona de contenedor `max-w-md mx-auto` a contenedor responsive dual:
    - `< lg`: `max-w-md mx-auto px-4` + padding inferior de BottomNav → experiencia móvil intacta.
    - `≥ lg`: `ml-64 max-w-none px-10 xl:px-14 pb-10` → área de contenido fluida desplazada 256px por la sidebar.
  - **Dashboard Home (`activeTab === 'home'`)**: Grid `grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8`:
    - **Columna principal (8/12)**: HeroBalance → MetricPillars → RecurrenceSummaryWidget (solo mobile) → RecentTransactionsList.
    - **Columna lateral derecha sticky (4/12, solo desktop)**: RecurrenceSummaryWidget + tarjeta de acceso rápido "Registrar movimiento".
  - Barra de título de página solo desktop (`hidden lg:flex`) con subtítulo semántico por pestaña activa.
- **[x] Compatibilidad PWA y Mobile preservada**:
  - `safe-area-inset-top` y `safe-area-inset-bottom` mantenidos en contenedor para modo standalone iOS/Android.
  - Orbes ambientales reactivos al pilar activo preservados con `position: fixed` independientemente del layout.
- **Validación de Calidad**:
  - Vitest: 108/108 tests unitarios pasando.
  - TypeScript: 0 errores (`tsc -b`).
  - Funcionalidad móvil: intacta (barra flotante, carrusel, swipe-to-delete).

### v0.9.17 (Optimización de UX para Desktop: Interacción por Clic vs. Gestos Táctiles)
- **[x] HeroBalance — Carrusel móvil + Grid estático en desktop** ([`HeroBalance.tsx`](file:///c:/Users/santi/Documents/UNI/Fluo/src/components/home/HeroBalance.tsx)):
  - **Móvil (`< lg`)**: Carrusel deslizable (`snap-x snap-mandatory`) y dots paginados preservados íntegramente para gestos táctiles.
  - **Desktop (`≥ lg`)**: Carrusel eliminado. Sustituido por:
    - Tarjeta consolidada de patrimonio siempre visible (con sub-métricas en columna derecha `w-64`).
    - Fila de tabs clicables tipo pill para selección de cuenta/fuente (`Consolidado | Cuenta 1 | Cuenta 2 | ...`).
    - Botones de navegación `ChevronLeft` / `ChevronRight` para usuarios con teclado cuando hay ≥ 3 fuentes.
    - Tarjeta de cuenta activa renderizada directamente debajo, sin necesidad de arrastrar.
  - Función `selectDesktopSource(index)` gestiona el estado en desktop sin depender del `scrollRef`.
- **[x] SwipeableTransactionItem — Swipe táctil + Click en desktop** ([`SwipeableTransactionItem.tsx`](file:///c:/Users/santi/Documents/UNI/Fluo/src/components/home/SwipeableTransactionItem.tsx)):
  - Eliminados los handlers de mouse-drag (`handleMouseDown`, `handleMouseMove`, `handleMouseUp`) — los gestos de ratón ya no deslizaban nada naturalmente.
  - Cursors cambiados de `cursor-grab / active:cursor-grabbing` a `cursor-pointer` en desktop.
  - Botones de editar y eliminar (`Pencil` / `Trash2`) visibles vía `group-hover:opacity-100` al pasar el ratón — accesibles con un clic limpio.
  - `isMouseDown` ref eliminado (ya no se usa).
- **[x] Pill Filters — Scroll horizontal → Flex-wrap en desktop** (todos los componentes):
  - [`RecentTransactionsList.tsx`](file:///c:/Users/santi/Documents/UNI/Fluo/src/components/home/RecentTransactionsList.tsx): Filtros de pilares envuelven en líneas en `lg+` (`lg:flex-wrap lg:overflow-x-visible`).
  - [`InvestmentsView.tsx`](file:///c:/Users/santi/Documents/UNI/Fluo/src/components/investments/InvestmentsView.tsx): Tabs de clase de activo envuelven en `lg+`.
  - [`AnalyticsView.tsx`](file:///c:/Users/santi/Documents/UNI/Fluo/src/components/analytics/AnalyticsView.tsx): Selector de cuenta y opciones de periodo envuelven en `lg+`.
  - [`RecurrenceSummaryWidget.tsx`](file:///c:/Users/santi/Documents/UNI/Fluo/src/components/home/RecurrenceSummaryWidget.tsx): Tarjetas de recurrencia envuelven en `lg+`.
- **[x] Separación de paradigmas de interacción** documentada en wiki:
  - Móvil: gestos táctiles (swipe, scroll-snap horizontal, pull-to-refresh).
  - Desktop: clic directo, hover states, teclado (`Escape`, `Enter`, `Tab`), grids y botones explícitos.
- **Validación de Calidad**:
  - Vitest: 108/108 tests unitarios pasando.
  - TypeScript: 0 errores (`tsc -b`).
  - Funcionalidad táctil móvil: 100% intacta.

---

## Próximos Hitos (v1.0.0)
- [ ] **Presupuestos Mensuales & Metas de Ahorro**: Límites de gasto por categoría con barras de advertencia translúcidas.
- [ ] **Exportación / Importación de Datos**: Backups locales en formato JSON y exportación de movimientos en CSV/Excel.
- [ ] **Migración a IndexedDB**: Capacidad de soporte para miles de registros y series temporales históricas con `Dexie.js`.
- [x] **Widgets de PWA & Offline First**: Service Worker y manifiesto PWA para instalación nativa en dispositivos iOS/Android.
- [x] **Endurecimiento AppSec & Optimización LCP**: Cabeceras de seguridad HTTP en `vercel.json` (A+), robots.txt estático, logo WebP de alto rendimiento y accesibilidad WCAG.
- [x] **Arquitectura Responsive Desktop**: Sidebar Liquid Glass lateral, grid multi-columna en Dashboard y layout fluido en todas las vistas.

### v0.9.18 (Corrección de Cotizaciones en Móvil: CORS Proxy + SWR Bypass + Caché Expirable)

**Problema:** `IE0007987690` y otros fondos siempre mostraban "dato offline/en caché" en móvil, incluso tras pulsar el botón de refresh.

**Causas raíz identificadas y corregidas:**

- **[x] CORS en navegadores móviles** ([`api/quote.ts`](file:///c:/Users/santi/Documents/UNI/Fluo/api/quote.ts)):
  - Los navegadores (especialmente iOS Safari / Chrome móvil) bloquean las peticiones directas a `query1.finance.yahoo.com` por política CORS del browser.
  - **Fix:** Nueva **Vercel Serverless Function** `/api/quote` que actúa de proxy: recibe `?symbol=VEUR.AS`, llama a Yahoo desde Node.js (sin restricciones CORS), y devuelve `{ price, change24h, currency, symbol }`.
  - `fetchYahooChartQuote` ahora usa `typeof window !== 'undefined'` para detectar entorno: browser → `/api/quote`, Node/Vitest → directo a Yahoo.
  - La función añade `Cache-Control: s-maxage=300` (5 min caché Vercel CDN) y `Access-Control-Allow-Origin: *`.

- **[x] SWR (Stale-While-Revalidate) bloqueaba el botón de refresh** ([`marketDataService.ts`](file:///c:/Users/santi/Documents/UNI/Fluo/src/services/marketDataService.ts)):
  - `fetchCurrentPrice` tiene una ventana de frescura de 25s. Si el usuario pulsaba el botón en ese período, devolvía el caché sin llamar a la red.
  - **Fix:** Nueva función `resetSwrTimestamps()` que limpia los timestamps en memoria. Se llama al inicio de `refreshAllAssetPrices` para garantizar un fetch real cada vez que el usuario lo pida explícitamente.

- **[x] vercel.json — SPA rewrite interceptaba `/api/*`** ([`vercel.json`](file:///c:/Users/santi/Documents/UNI/Fluo/vercel.json)):
  - El catch-all `/(.*) → /index.html` redirigía las peticiones a `/api/quote` a la app React en lugar de a la Serverless Function.
  - **Fix:** Rewrite ajustado a `/((?!api/).*)` para excluir todas las rutas bajo `/api/`.

- **[x] Caché localStorage sin expiración** (fix de v0.9.17 completado):
  - `saveQuoteToCache` añade `cachedAt: Date.now()`.
  - `getQuoteFromCache` retorna `null` para entradas > 23h.
  - `pruneExpiredQuoteCache()` limpia entradas legacy (sin `cachedAt`) en cada arranque.
  - `syncStaleAssetQuotes` ya no avanza `lastPriceUpdate` cuando el quote es `isOfflineCached: true`.

- **Validación de Calidad**:
  - Vitest: 108/108 tests unitarios pasando.
  - TypeScript: 0 errores (`tsc -b`).
  - Tests de `marketDataService.ts` (live fetch via Vitest → Node, no CORS): 19/19 ✅.

### v0.9.19 (Acumulación Atómica de Fondos, Deducción al Borrar y Proxy Universal de Cotizaciones)

**Problemas Corregidos:**
1. Indicador "Dato offline / en caché" persistía en móvil y desktop debido a:
   - SWR early return: `fetchCurrentPrice` devolvía la entrada en caché prematuramente incluso al pulsar "Recargar cotizaciones" si la promesa en segundo plano aún estaba en vuelo.
   - Vite dev server no ejecutaba `/api/quote`, devolviendo `index.html` en pruebas locales y móviles sobre red local WiFi.
   - Ruta 1 ejecutaba consulta directa a Yahoo Finance Search desde el cliente expuesta a bloqueo CORS.
   - ISINs directos (`IE0007987690`) fallaban en Yahoo v8 Chart si no se resolvía previamente su ticker interno (`0P00000RQ8.F`).
2. Al dar de alta una nueva aportación sobre un fondo existente, se sustituía en lugar de sumarse y promediar el precio de compra.
3. Al borrar un movimiento de inversión, el fondo mantenía la cantidad aportada sin deducirla ni eliminarse.

**Soluciones Técnicas Implementadas:**
- **[x] Proxy Universal con Failover Dual y Resolución de ISINs** ([`api/quote.ts`](file:///c:/Users/santi/Documents/UNI/Fluo/api/quote.ts)):
  - Detección automática de formato ISIN (`/^[A-Z]{2}[A-Z0-9]{9}[0-9]$/`).
  - Consulta del ticker interno mediante Yahoo Search API en entorno Node (`query1.finance.yahoo.com` con failover a `query2.finance.yahoo.com`).
  - Fallback automático a ticker gemelo (`FUND_ISIN_EQUIVALENCE_MAP`).
- **[x] Middleware Dev Server en Vite** ([`vite.config.ts`](file:///c:/Users/santi/Documents/UNI/Fluo/vite.config.ts)):
  - Plugin `quoteDevProxyPlugin()` que atiende `/api/quote` localmente (`localhost` y red WiFi `192.168.x.x:5173`), garantizando que las pruebas en móvil local funcionen de inmediato sin depender de despliegue en Vercel.
- **[x] Bypass Forzado de Caché & SWR Offline Unlatching** ([`marketDataService.ts`](file:///c:/Users/santi/Documents/UNI/Fluo/src/services/marketDataService.ts)):
  - `forceRefresh = true` en `fetchCurrentPrice` y `batchUpdateMarketQuotes`: omite el retorno de caché y aguarda la resolución en red.
  - Detección de ISIN embebido en nombres/conceptos complejos (ej. `"SP500 IE0007987690"`).
- **[x] Acumulación Ponderada de Fondos (PMC)** ([`useFinanceStore.ts`](file:///c:/Users/santi/Documents/UNI/Fluo/src/store/useFinanceStore.ts), [`finance.ts`](file:///c:/Users/santi/Documents/UNI/Fluo/src/utils/finance.ts)):
  - Función `findMatchingAssetIndex` para localizar posiciones existentes por ISIN, ticker o nombre.
  - `addAsset`: si la posición ya existe, suma participaciones ($\text{shares}_{\text{total}} = \text{shares}_{\text{ant}} + \text{shares}_{\text{nuevas}}$) y recalcula el precio medio ponderado de adquisición.
- **[x] Deducción y Eliminación Automática al Borrar Transacción** ([`useFinanceStore.ts`](file:///c:/Users/santi/Documents/UNI/Fluo/src/store/useFinanceStore.ts)):
  - `deleteTransaction`: localiza el activo asociado a la transacción `pillar === 'invest'`, deduce los títulos y el importe aportado.
  - Si no restan títulos ($\le 0.0001$), elimina el activo por completo de la cartera y de Supabase (`deleteCloudAsset`).
  - `updateTransaction`: si se modifica el importe de un movimiento de inversión, reajusta las participaciones y el coste proporcionalmente.
- **[x] Reconciliación Multi-Movimiento** ([`finance.ts`](file:///c:/Users/santi/Documents/UNI/Fluo/src/utils/finance.ts)):
  - `reconcileAssetsFromTransactions` ahora agrupa y totaliza múltiples compras del mismo activo en lugar de descartar las transacciones posteriores.

- **[x] Ajuste Monolínea y Protección Responsiva de Posiciones Únicas (`InvestmentsView`)**:
  - En la cuadrícula cuádruple de métricas de inversión, el indicador de posiciones ("X índices/activos") incorpora `text-xs sm:text-sm lg:text-base font-bold whitespace-nowrap truncate tracking-tight` y `p-3 sm:p-3.5 min-w-0`.
  - Garantiza que el texto permanezca estrictamente en una única línea en cualquier ancho de pantalla (desde móviles de 375px hasta escritorios) sin saltos de línea antiestéticos ni desbordamiento de tarjeta.

**Validación de Calidad:**
- Vitest: 112/112 tests unitarios pasando (4 nuevos tests de acumulación y ciclo de vida de transacciones).
- TypeScript: 0 errores (`npx tsc -b`).
- Paridad: 100% en Web Desktop, Móvil standalone PWA y Local Dev Server.

### v0.9.20 (Auto-Sanación de Fondos Eclipsados, Papelera Táctil en Móvil y Purga de Huérfanos)

**Problemas Corregidos:**
1. **Fondo Eclipsado por Movimiento Borrado en Estado Previo**:
   - Un usuario tenía un movimiento activo en su libro de cuentas (ej. `"Inversión en SP500 IE0007987690"`), pero antes del parche de acumulación, un fondo introducido con el mismo ISIN o sustituido (`"Vanguard European Stock"`) había sobreescrito la posición en `state.assets`.
   - Al borrar posteriormente el movimiento del fondo sustituto, este quedó huérfano en `assets`, ocupando la ranura de coincidencia (`existingByIdent.has('IE0007987690')`), lo que impedía que `reconcileAssetsFromTransactions` mostrara el fondo que sí tenía movimientos activos en la cuenta.
2. **Detección de Cambios Silenciosa en `reconcileInvestments`**:
   - `reconcileInvestments` solo invocaba `set({ assets: reconciled })` si cambiaba la longitud del array (`reconciled.length !== assets.length`). Si un activo era corregido/renombrado pero la cantidad de activos era la misma, los cambios no se persistían ni se sincronizaban a Supabase.
3. **Inaccesibilidad del Botón de Papelera en Dispositivos Móviles**:
   - En [`InvestmentsView.tsx`](file:///c:/Users/santi/Documents/UNI/Fluo/src/components/investments/InvestmentsView.tsx), el botón de eliminar activo utilizaba `opacity-0 group-hover:opacity-100`, haciendo que en pantallas táctiles sin cursor de ratón fuera invisible e imposible de pulsar.

**Soluciones Técnicas Implementadas:**
- **[x] Auto-Sanación de Fondos Eclipsados en `reconcileAssetsFromTransactions`** ([`src/utils/finance.ts`](file:///c:/Users/santi/Documents/UNI/Fluo/src/utils/finance.ts)):
  - Al escanear activos existentes contra el libro de transacciones, si se detecta un activo cuyo nombre contradice los movimientos activos asociados al mismo identificador (ej. el activo se llama "European Stock" mientras las transacciones son para "SP500"):
    - Se restaura automáticamente el nombre del fondo según las transacciones reales (`primaryTxName`).
    - Se recalculan de inmediato las participaciones (`shares`), precio medio de compra (`averageBuyPrice`) y cotización de referencia (82.97 € para S&P 500).
    - Se actualiza `currentValue` y `pnl` latente a 0 €.
- **[x] Purga Automática de Activos Autogenerados Huérfanos** ([`src/utils/finance.ts`](file:///c:/Users/santi/Documents/UNI/Fluo/src/utils/finance.ts)):
  - Los activos con prefijo `reconciled-asset-*` que carezcan de transacciones activas en el libro son purgados automáticamente al reconciliar.
- **[x] Detección Exhaustiva de Mutaciones en `reconcileInvestments`** ([`src/store/useFinanceStore.ts`](file:///c:/Users/santi/Documents/UNI/Fluo/src/store/useFinanceStore.ts)):
  - Ahora compara cambios propiedad por propiedad (`id`, `name`, `shares`, `averageBuyPrice`, `identifier`), persistiendo y sincronizando a Supabase en cuanto un activo es sanado.
- **[x] Reconciliación Reactiva en `deleteAsset`** ([`src/store/useFinanceStore.ts`](file:///c:/Users/santi/Documents/UNI/Fluo/src/store/useFinanceStore.ts)):
  - Al borrar manualmente un activo de la cartera, se invoca de inmediato `reconcileInvestments()`, resucitando instantáneamente cualquier posición de movimientos activos que estuviera eclipsada.
- **[x] Botón de Papelera Visible y Táctil en Móvil** ([`src/components/investments/InvestmentsView.tsx`](file:///c:/Users/santi/Documents/UNI/Fluo/src/components/investments/InvestmentsView.tsx)):
  - Modificado a `opacity-80 hover:opacity-100 active:scale-95`, accesible y visible en cualquier teléfono, tablet o pantalla táctil.

- **[x] Ajuste Monolínea y Protección Responsiva de Posiciones Únicas (`InvestmentsView`)**:
  - En la cuadrícula cuádruple de métricas de inversión, el indicador de posiciones ("X índices/activos") incorpora `text-xs sm:text-sm lg:text-base font-bold whitespace-nowrap truncate tracking-tight` y `p-3 sm:p-3.5 min-w-0`.
  - Garantiza que el texto permanezca estrictamente en una única línea en cualquier ancho de pantalla (desde móviles de 375px hasta escritorios) sin saltos de línea antiestéticos ni desbordamiento de tarjeta.

**Validación de Calidad:**
- Vitest: 115/115 tests unitarios pasando (+3 nuevos tests específicos para auto-sanación de activos eclipsados y ciclo de vida de `deleteAsset`).
- TypeScript: 0 errores (`npx tsc -b`).
- Producción: `npm run build` compilado exitosamente.

### v0.9.25 (Ciclo de Vida de Recurrencias, Eliminación en Cascada y Auto-Sanación de Reglas Huérfanas)

**Problemas Corregidos:**
1. **Regla de Recurrencia Huérfana al Borrar la Transacción Inicial**:
   - Al crear un ingreso o gasto con recurrencia activa y eliminar posteriormente la transacción, la regla quedaba activa en `state.recurrences`. En consecuencia, al vencer los plazos futuros el motor de recurrencias continuaba generando de forma automática nuevos apuntes contables no deseados.
2. **Ambigüedad en la Eliminación de Recurrencias Subsiguientes (2ª en adelante)**:
   - Necesidad de definir si al eliminar una recurrencia devengada en un mes puntual (ej. mes 2) se debía o no eliminar la regla recurrente global.
3. **Persistencia Residual en Instalaciones Previas a la Actualización**:
   - Si un usuario ya había creado y eliminado una transacción recurrente en su app antes de esta corrección, la regla de recurrencia permanecía guardada en `fluo_finance_storage_v3` en su navegador o móvil sin un movimiento visible asociado.

**Soluciones Técnicas Implementadas:**
- **[x] Enlace Explícito y Atómico con `recurrenceId`** ([`src/components/forms/QuickAddTransactionModal.tsx`](file:///c:/Users/santi/Documents/UNI/Fluo/src/components/forms/QuickAddTransactionModal.tsx)):
  - Al registrar transacciones con periodicidad (tanto estándar como aportaciones DCA en inversiones), se pre-genera `recurrenceId` compartido por la transacción contable inicial y la regla periódica registrada en Zustand (`addRecurrence`).
- **[x] Eliminación en Cascada de Recurrencias en `deleteTransaction`** ([`src/store/useFinanceStore.ts`](file:///c:/Users/santi/Documents/UNI/Fluo/src/store/useFinanceStore.ts)):
  - Al borrar **cualquiera de las transacciones** pertenecientes a una serie recurrente (sea la inicial o cualquier recurrencia posterior):
    - Se elimina el apunte contable seleccionado.
    - Se cancela y **elimina automáticamente la regla de recurrencia** (`nextRecurrences = nextRecurrences.filter(...)`), garantizando que **no se generen más movimientos futuros** para dicha serie. Los apuntes anteriores ya devengados se mantienen como histórico en la cuenta.
- **[x] Auto-Sanación en Arranque (`triggerRecurrencesCheck`) para Estados Previos** ([`src/store/useFinanceStore.ts`](file:///c:/Users/santi/Documents/UNI/Fluo/src/store/useFinanceStore.ts)):
  - Al rehidratar el store al abrir la app (`onRehydrateStorage`), `triggerRecurrencesCheck` filtra y purga automáticamente cualquier regla periódica de usuario (excluyendo reglas de demostración `INITIAL_RECURRENCE_RULES`) que no posea ningún apunte asociado en el libro de transacciones (`transactions.some(...) === false`).
  - La purga se persiste de inmediato en `localStorage`, saneando la base de datos local de la versión anterior sin requerir ninguna acción por parte del usuario.
- **[x] Botón de Cancelación Directa en Widget de Home** ([`src/components/home/RecurrenceSummaryWidget.tsx`](file:///c:/Users/santi/Documents/UNI/Fluo/src/components/home/RecurrenceSummaryWidget.tsx)):
  - Se añadió un botón de papelera Liquid Glass con diálogo nativo de confirmación a cada tarjeta de cobro/pago próximo, permitiendo a los usuarios cancelar cualquier serie periódica directamente sin necesidad de borrar movimientos contables pasados.

- **[x] Ajuste Monolínea y Protección Responsiva de Posiciones Únicas (`InvestmentsView`)**:
  - En la cuadrícula cuádruple de métricas de inversión, el indicador de posiciones ("X índices/activos") incorpora `text-xs sm:text-sm lg:text-base font-bold whitespace-nowrap truncate tracking-tight` y `p-3 sm:p-3.5 min-w-0`.
  - Garantiza que el texto permanezca estrictamente en una única línea en cualquier ancho de pantalla (desde móviles de 375px hasta escritorios) sin saltos de línea antiestéticos ni desbordamiento de tarjeta.

**Validación de Calidad:**
- Vitest: 119/119 tests unitarios pasando (+4 nuevos tests para ciclo de vida de recurrencias, cascada al borrar apunte inicial, preservación en la 2ª recurrencia y auto-sanación de reglas huérfanas en `useFinanceStore.test.ts`).
- TypeScript: 0 errores (`npx tsc -b`).
- Producción: `npm run build` compilado exitosamente.

### v0.9.30 (Optimización Exhaustiva: Eliminación de Código Muerto, Importación Dinámica, Búsquedas O(1) y Consolidación de Bucles)

**Áreas Optimizadas:**
1. **Eliminación de Código Muerto (Dead Code Elimination)**:
   - Se eliminaron 5 archivos obsoletos/no referenciados en producción:
     - `src/services/priceFeedService.ts` (puente legado sustituido por `marketDataService.ts`).
     - `src/components/investments/AddAssetModal.tsx` (35.7 KB de modal independiente reemplazado por el flujo unificado `QuickAddTransactionModal.tsx`).
     - `src/components/common/GlassButton.tsx`, `src/components/common/GlassCard.tsx` y `src/components/common/PillarBadge.tsx` (primitivas legadas no consumidas).
2. **Importación Dinámica de Datos Demo (Code Splitting)**:
   - Se desacopló la importación estática de `initialMockData.ts` de [`src/store/useFinanceStore.ts`](file:///c:/Users/santi/Documents/UNI/Fluo/src/store/useFinanceStore.ts).
   - `loadDemoData` y `resetToInitialData` ahora cargan los 527 registros de demo bajo demanda mediante `await import('../data/initialMockData')`.
   - El bundle de demo (~9 kB / 2.2 kB gzip) queda completamente aislado en un chunk perezoso independiente, sin penalizar el tiempo de carga ni el consumo de datos de usuarios reales.
   - En `triggerRecurrencesCheck`, las reglas de demo se protegen mediante `DEMO_RECURRENCE_IDS = new Set(...)` en tiempo de ejecución.
3. **Mapas para Búsquedas O(1) en Memoria**:
   - En [`src/store/useFinanceStore.ts`](file:///c:/Users/santi/Documents/UNI/Fluo/src/store/useFinanceStore.ts), se crearon mapas de consulta en nivel de módulo (`getCategoryLookup`, `getBrandLookup`, `getSourceLookup`) que se re-indexan únicamente cuando las referencias de los arrays cambian.
   - `getCategoryById`, `getBrandById` y `getSourceById` se transformaron de escaneos lineales $O(N)$ repetidos en cada render de lista a accesos $O(1)$ inmediatos.
   - En [`src/components/home/RecentTransactionsList.tsx`](file:///c:/Users/santi/Documents/UNI/Fluo/src/components/home/RecentTransactionsList.tsx), la cuenta activa se resuelve vía `getSourceById` en $O(1)$.
   - En [`src/components/analytics/AnalyticsView.tsx`](file:///c:/Users/santi/Documents/UNI/Fluo/src/components/analytics/AnalyticsView.tsx), `categoryChartData` y `sortedBrands` consumen directamente las búsquedas por Map $O(1)$.
4. **Consolidación de Bucles en Pasadas Únicas**:
   - En [`src/utils/finance.ts`](file:///c:/Users/santi/Documents/UNI/Fluo/src/utils/finance.ts):
     - Nueva función `computeAllSourceBalances`: calcula los saldos y conteos de todas las fuentes en una sola pasada $O(N)$ sobre `transactions`.
     - `generateSavingsEvolution`: se erradicaron los bucles anidados en `last_3_months` y `last_6_months / this_year / all`, agrupando transacciones en intervalos precalculados en una sola pasada.
     - `reconcileAssetsFromTransactions`: filtrado de transacciones de inversión y agrupación por clave de activo consolidados en un único bucle.
   - En [`src/components/home/HeroBalance.tsx`](file:///c:/Users/santi/Documents/UNI/Fluo/src/components/home/HeroBalance.tsx):
     - 11 pasadas separadas de `.filter()`, `.reduce()` y `.length` para ingresos y gastos recurrentes y máximos consolidadas en un único `for` sobre `transactions`.
     - Las diapositivas de fuentes reutilizan el mapa precalculado de `computeAllSourceBalances`.
   - En [`src/components/home/RecentTransactionsList.tsx`](file:///c:/Users/santi/Documents/UNI/Fluo/src/components/home/RecentTransactionsList.tsx):
     - 3 pasadas encadenadas de `.filter()` consolidadas en una sola con evaluación temprana y conteo de fuente sin asignación de arrays intermedios.
   - En [`src/components/analytics/AnalyticsView.tsx`](file:///c:/Users/santi/Documents/UNI/Fluo/src/components/analytics/AnalyticsView.tsx):
     - Consolidación del filtrado temporal y acumulación de métricas en una única pasada con umbrales temporales precalculados fuera del bucle.

- **[x] Ajuste Monolínea y Protección Responsiva de Posiciones Únicas (`InvestmentsView`)**:
  - En la cuadrícula cuádruple de métricas de inversión, el indicador de posiciones ("X índices/activos") incorpora `text-xs sm:text-sm lg:text-base font-bold whitespace-nowrap truncate tracking-tight` y `p-3 sm:p-3.5 min-w-0`.
  - Garantiza que el texto permanezca estrictamente en una única línea en cualquier ancho de pantalla (desde móviles de 375px hasta escritorios) sin saltos de línea antiestéticos ni desbordamiento de tarjeta.

**Validación de Calidad:**
- Vitest: 119/119 tests unitarios pasando al 100% (7 suites).
- TypeScript: compilación limpia (`npx tsc -b`, 0 errores).
- Producción: `npm run build` compilado exitosamente con code splitting verificado (`initialMockData` en chunk perezoso independiente).

### v0.9.35 (Rediseño y Expansión Responsive para Pantallas Grandes / Desktop PC ≥ 1024px)

**Objetivo:** Adaptar y expandir la experiencia de usuario completa para pantallas grandes (PC / Desktop / Tablet horizontal, `≥ 1024px`), manteniendo intacta la barra de navegación flotante existente y la estética visual Liquid Glass, sin alterar la lógica de negocio ni crear nuevas capacidades, erradicando por completo cualquier interacción de arrastrar o deslizar con ratón en escritorio y preservando la experiencia móvil (`< 1024px`).

- **[x] Barra de Navegación y Header en PC**:
  - [`FloatingNavbar.tsx`](file:///c:/Users/santi/Documents/UNI/Fluo/src/components/layout/FloatingNavbar.tsx): Preservada la barra flotante Liquid Glass que ya existe en la app, calibrada con mayor transparencia y un sutil toque **Candy estilo Apple** (aura atmosférica iris suave, mayor transparencia de cristal `bg-slate-900/35 lg:bg-slate-900/45 light:bg-white/40`, pastillas activas volumétricas translúcidas, botón joya (+) con domo especular curvado y giro en hover), fijada y centrada horizontalmente como dock de escritorio (`fixed bottom-6 inset-x-4 max-w-xl mx-auto px-6 py-2.5 rounded-full backdrop-blur-2xl lg:backdrop-blur-3xl border border-white/15 lg:border-white/20 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.22),0_12px_32px_-8px_rgba(0,0,0,0.45)]`).
  - Header Superior ([`App.tsx`](file:///c:/Users/santi/Documents/UNI/Fluo/src/App.tsx)): Expandido a `w-full max-w-7xl mx-auto px-8 py-6 flex items-center justify-between` con wordmark oficial de Fluo y accesos de sincronización con Supabase, botón de PIN y avatar de perfil/ajustes. Eliminación de los títulos y subtítulos contextuales superiores (`hidden lg:flex` de Dashboard, Estadísticas e Inversiones) para una interfaz de escritorio despejada, limpia y sin redundancias.
- **[x] Contenedor Principal y Grid de Doble Columna en Home**:
  - [`MobileContainer.tsx`](file:///c:/Users/santi/Documents/UNI/Fluo/src/components/layout/MobileContainer.tsx): Reemplaza la restricción estrecha en PC con `w-full max-w-7xl mx-auto px-6 lg:px-10 pb-28 pt-2 min-h-screen`, manteniendo `max-w-md` y padding inferior seguro en móvil.
  - Cuadrícula de 12 columnas en Home ([`App.tsx`](file:///c:/Users/santi/Documents/UNI/Fluo/src/App.tsx)):
    - **Columna Principal (8 de 12 columnas)**:
      - [`HeroBalance.tsx`](file:///c:/Users/santi/Documents/UNI/Fluo/src/components/home/HeroBalance.tsx): Tarjeta de Patrimonio Neto Total a ancho completo + Bandeja de fuentes existentes en cuadrícula paralela estática (`grid grid-cols-2 xl:grid-cols-3 gap-4 mt-4`) con selección y deselección por clic directo (anillo activo índigo), erradicando el carrusel con ratón.
      - [`MetricPillars.tsx`](file:///c:/Users/santi/Documents/UNI/Fluo/src/components/home/MetricPillars.tsx): Fila horizontal de KPIs del mes (Ingresos, Gastos y Ahorro Neto).
      - [`RecentTransactionsList.tsx`](file:///c:/Users/santi/Documents/UNI/Fluo/src/components/home/RecentTransactionsList.tsx) y [`SwipeableTransactionItem.tsx`](file:///c:/Users/santi/Documents/UNI/Fluo/src/components/home/SwipeableTransactionItem.tsx): Historial de movimientos con acciones de editar y eliminar accesibles por hover y clic directo (sin requerir swipe).
    - **Columna Secundaria (4 de 12 columnas)**:
      - [`DesktopInvestmentWidget.tsx`](file:///c:/Users/santi/Documents/UNI/Fluo/src/components/home/DesktopInvestmentWidget.tsx): Resumen de valoración de mercado, coste invertido, rentabilidad no realizada (€ y %) y activos destacados con enlace directo a `/invest`.
      - [`DesktopBudgetsWidget.tsx`](file:///c:/Users/santi/Documents/UNI/Fluo/src/components/home/DesktopBudgetsWidget.tsx): Desglose de presupuestos y gasto del mes por categoría con barras de progreso Liquid Glass y porcentajes acumulados.
      - [`RecurrenceSummaryWidget.tsx`](file:///c:/Users/santi/Documents/UNI/Fluo/src/components/home/RecurrenceSummaryWidget.tsx): Compromisos periódicos con cancelación directa.
- **[x] Vistas de Estadísticas e Inversiones en PC**:
  - [`AnalyticsView.tsx`](file:///c:/Users/santi/Documents/UNI/Fluo/src/components/analytics/AnalyticsView.tsx): Despliegue de cuadrícula 2x2 amplia (`hidden lg:grid lg:grid-cols-2 lg:gap-6`) mostrando simultáneamente los 4 gráficos (Evolución Temporal, Ahorro Neto, Distribución por Categorías y Top Comercios) con tooltips activados por hover, preservando tabs en móvil.
  - [`InvestmentsView.tsx`](file:///c:/Users/santi/Documents/UNI/Fluo/src/components/investments/InvestmentsView.tsx): Cabecera métrica ampliada a 4 columnas (`grid-cols-2 lg:grid-cols-4`) y listado de activos organizado en cuadrícula espaciosa de 2 columnas (`grid-cols-1 lg:grid-cols-2`).
- **[x] Modales Flotantes en PC con Teclado y Clic Exterior**:
  - [`QuickAddTransactionModal.tsx`](file:///c:/Users/santi/Documents/UNI/Fluo/src/components/forms/QuickAddTransactionModal.tsx), [`ProfileSettingsModal.tsx`](file:///c:/Users/santi/Documents/UNI/Fluo/src/components/profile/ProfileSettingsModal.tsx), [`TimeSimulatorModal.tsx`](file:///c:/Users/santi/Documents/UNI/Fluo/src/components/common/TimeSimulatorModal.tsx), [`InitialSourceModal.tsx`](file:///c:/Users/santi/Documents/UNI/Fluo/src/components/common/InitialSourceModal.tsx), [`SignOutConfirmModal.tsx`](file:///c:/Users/santi/Documents/UNI/Fluo/src/components/auth/SignOutConfirmModal.tsx) y [`SourceAccountManager.tsx`](file:///c:/Users/santi/Documents/UNI/Fluo/src/components/profile/SourceAccountManager.tsx):
    - Apertura en PC como tarjetas flotantes centradas (`max-w-lg w-full backdrop-blur-3xl bg-slate-950/80 border border-white/15 rounded-3xl p-8 shadow-2xl`).
    - Cierre habilitado mediante tecla `Escape` y clic fuera del diálogo en el backdrop oscuro con desenfoque profundo.
    - Selectores internos desplegables por clic directo (`GlassSelect`) o contenedores con `flex-wrap` sin scroll horizontal forzado.
- **[x] Preservación de Móvil e Integridad de Lógica**:
  - La interfaz móvil (`< 1024px`) permanece 100% idéntica, conservando gestos táctiles, carruseles de fuentes y swipe en transacciones.
  - **[x] Pulido y Saneamiento Óptico del Dock Flotante (`FloatingNavbar.tsx`)**:
  - **Erradicación de Dobles Bordes y Ranuras en Botones**: Eliminación de líneas cáusticas internas (`top-0.5 h-[1px]`, `top-0.5 h-2`) que colisionaban con el bisel exterior generando bordes dobles/dentados.
  - **Corrección de Glitch de Compositor Chromium**: Eliminación de filtros `backdrop-blur-md` anidados dentro de `<button>` sobre un `<nav>` que ya aplica `backdrop-blur-2xl/3xl`, erradicando el halo oscuro rectangular que el compositor de Chromium proyectaba alrededor de las pastillas activas.
  - **Calibración de Densidad y Refracción**: Ajuste del sustrato vítreo a `bg-slate-900/55 lg:bg-slate-900/65` (modo oscuro) y `bg-white/55` (modo claro), preservando el toque candy sutil mientras se garantiza que los elementos de fondo en scroll no generen sombras o siluetas discordantes detrás del cristal.
  - **Refracción Continua Integral**: Sustitución de hairlines planas en los extremos por una máscara continua `inset-0 rounded-full bg-gradient-to-b from-white/[0.04] to-transparent` que acompaña la curvatura completa del dock sin cortes.

  - **[x] Conector de Alta Velocidad para Fondos Indexados por ISIN (`api/quote.ts`, `vite.config.ts`)**:
    - Integración de resolución prioritaria mediante **Financial Times Markets / Lipper** para activos con ISIN (`isIsinFormat`).
    - Erradicación del desfase de 24-36 horas de los feeds de fondos de Yahoo Finance Frankfurt, sincronizando los Valores Liquidativos diarios al instante con la misma inmediatez matinal que bancos custodios como MyInvestor / Inversis (ej. actualización a `84,74 €` en Vanguard S&P 500 al día siguiente de la sesión).
    - **Inversión de Prioridad en `resolveIsinQuote` & Soporte de Tickers Morningstar**: Corrección del pipeline en `marketDataService.ts` donde `candidateTicker` (`0P00000SUJ.F`) interceptaba la llamada antes que el ISIN limpio (`IE0032126645`) devolviendo el valor atrasado de Yahoo Finance (83,66 €). Se invirtió la prioridad (Ruta 1 para ISIN directo), se mapearon los tickers Morningstar `0P*` a su ISIN tanto en desarrollo (`vite.config.ts`) como en producción (`api/quote.ts`), y se añadió parámetro de cache-busting `_t` en el navegador.
    - **Verificación en Vivo**: Verificado que `/api/quote?symbol=IE0032126645` y `/api/quote?symbol=0P00000SUJ.F` retornan de inmediato `{ price: 84.74, change24h: 1.29, currency: 'EUR' }`.
    - Mantenimiento de fallback transparente a Yahoo Finance para acciones, criptomonedas y ETFs bursátiles estándar.

### v0.6.2 (Multi-Aportaciones a Índices, Fondos Externos Opcionales, Retiradas sin Borrado Directo y Gestos Swipe)
- **[x] Consolidación Visual en 1 Tarjeta por Índice**:
  - En la vista de inversiones ([`InvestmentsView.tsx`](file:///c:/Users/santi/Documents/UNI/Fluo/src/components/investments/InvestmentsView.tsx)), cualquier conjunto de posiciones que compartan el mismo ISIN o identificador (ej. múltiples compras del S&P 500 en fechas distintas) se agrupan en una única tarjeta mediante `ConsolidatedAssetGroup`.
  - Muestra la suma consolidada de títulos, el precio medio de compra ponderado (PMCP) inmutable, el valor de mercado total y una pastilla informativa con el recuento total de aportaciones registradas.
- **[x] Desglose Histórico de Aportaciones al Hacer Clic**:
  - Al pulsar sobre la tarjeta del índice (o en el botón de despliegue), se abre un cajón acordeón Liquid Glass que ejecuta `getTransactionsForAsset(asset, transactions)`.
  - Lista cronológica (de más reciente a más antigua) de cada aportación y retirada, con fecha formateada, concepto, broker y cuenta de origen (o insignia *"Fondos externos"*).
  - Al hacer clic sobre cualquier aportación individual se abre el modal de edición de movimiento para modificarla de inmediato.
- **[x] Inversiones con Fondos Externos Opcionales**:
  - En [`QuickAddTransactionModal.tsx`](file:///c:/Users/santi/Documents/UNI/Fluo/src/components/forms/QuickAddTransactionModal.tsx), el selector de cuenta de origen para inversiones incluye la opción *"Sin cuenta vinculada (Fondos externos)"*, estableciendo `sourceId: undefined`.
  - [`computeFinancialSummary`](file:///c:/Users/santi/Documents/UNI/Fluo/src/utils/finance.ts) omite la deducción de caja si `!tx.sourceId`, incorporando el activo a la cartera sin restar saldo de ninguna cuenta bancaria o de efectivo de la app.
  - Si el usuario selecciona una cuenta registrada, el importe se descuenta automáticamente como salida vinculada de dicha cuenta.
- **[x] Eliminación Directa Reemplazada por Retirada de Fondos**:
  - Se suprime por completo el botón de papelera/eliminación de inversiones.
  - Se implementa el modal [`WithdrawInvestmentModal.tsx`](file:///c:/Users/santi/Documents/UNI/Fluo/src/components/investments/WithdrawInvestmentModal.tsx) y la acción `withdrawAsset` en Zustand:
    - El usuario introduce el importe a retirar en euros (con accesos directos al 25%, 50%, 75% o 100% de liquidación).
    - Muestra desglose predictivo de títulos liquidados ($\text{shares} = \text{amount} / \text{currentPrice}$) y posición residual.
    - El usuario elige la cuenta de destino en la que se ingresa el dinero, generándose un movimiento de ingreso (`pillar: 'income'`, categoría `cat-dividends`).
    - Si se liquida la totalidad de títulos, el activo se retira de la cartera. En retiradas parciales, se reducen las participaciones manteniendo el precio medio original.
- **[x] Gestos Táctiles y Edición de Posición**:
  - Soporte de gestos táctiles tipo iOS en las tarjetas de inversión:
    - **Swipe a la derecha**: Revela capa índigo *"Editar posición"* y abre [`EditAssetModal.tsx`](file:///c:/Users/santi/Documents/UNI/Fluo/src/components/investments/EditAssetModal.tsx) para modificar nombre, participaciones, precio medio o custodio.
    - **Swipe a la izquierda**: Revela capa esmeralda *"Retirar fondos"* y abre [`WithdrawInvestmentModal.tsx`](file:///c:/Users/santi/Documents/UNI/Fluo/src/components/investments/WithdrawInvestmentModal.tsx).
    - En PC / escritorio: Botones dedicados de acción por clic directo en la tarjeta.

### v0.6.3 (Edición Integral de Inversiones, Autorrelleno 100%, Sincronización de Cuentas y Ajuste Monolínea)
- **[x] Autorrelleno Total al Editar Aportaciones de Inversión**:
  - Al editar cualquier aportación desde el historial del índice en [`InvestmentsView.tsx`](file:///c:/Users/santi/Documents/UNI/Fluo/src/components/investments/InvestmentsView.tsx) o desde [`RecentTransactionsList.tsx`](file:///c:/Users/santi/Documents/UNI/Fluo/src/components/home/RecentTransactionsList.tsx), [`QuickAddTransactionModal.tsx`](file:///c:/Users/santi/Documents/UNI/Fluo/src/components/forms/QuickAddTransactionModal.tsx) pre-rellena el 100% de los datos:
    - Nombre del activo e Identificador (ISIN / Ticker).
    - Tipo de instrumento y Divisa.
    - Participaciones/títulos y Precio medio de compra unitario.
    - Importe total desembolsado y Cotización oficial verificada.
    - Broker o plataforma seleccionada en `BrandPicker`.
    - Cuenta de cargo seleccionada (o la opción `Sin cuenta vinculada (Fondos externos)` si no usó fondos de la app).
    - Fecha exacta de compra en el selector de fecha.
- **[x] Sincronización Automática de Saldo en Cuenta ante Cambios de Importe**:
  - Si el usuario modifica el importe de la aportación (ej. de 100 € a 150 €), el apunte contable (`tx.amount`) se actualiza atómicamente.
  - El motor de balance [`computeSourceBalance`](file:///c:/Users/santi/Documents/UNI/Fluo/src/utils/finance.ts) deduce instantáneamente el nuevo importe (`investExpense = 150 €`), actualizando el saldo de la cuenta de origen.
  - Si se conmuta hacia *"Fondos externos"*, se elimina el vínculo (`sourceId: undefined`) y se restaura el saldo bancario.
- **[x] Sincronización de Fecha Original y Orden Cronológico**:
  - Si el usuario cambia la fecha de compra, el apunte contable original actualiza su propiedad `date`.
  - La colección se reordena cronológicamente en orden descendente mediante `sortTransactionsDesc`, situando el movimiento en su posición temporal exacta en el historial, estadísticas y gráficos.
- **[x] Recálculo Matemático Ponderado en Cartera (`updateTransaction`)**:
  - Calcula el diferencial de títulos ($\\Delta\\text{shares}$) y coste ($\\Delta\\text{cost}$) específico de la aportación modificada, recalculando con exactitud el nuevo PMC ponderado y la plusvalía no realizada del activo en Zustand y Supabase.
- **[x] Ajuste Monolínea y Protección Responsiva de Posiciones Únicas (`InvestmentsView`)**:
  - En la cuadrícula cuádruple de métricas de inversión, el indicador de posiciones ("X índices/activos") incorpora `text-xs sm:text-sm lg:text-base font-bold whitespace-nowrap truncate tracking-tight` y `p-3 sm:p-3.5 min-w-0`.
  - Garantiza que el texto permanezca estrictamente en una única línea en cualquier ancho de pantalla (desde móviles estrechos de 375px hasta escritorios) sin saltos de línea antiestéticos ni desbordamiento de tarjeta.

- **[x] Ajuste Monolínea y Protección Responsiva de Posiciones Únicas (`InvestmentsView`)**:
  - En la cuadrícula cuádruple de métricas de inversión, el indicador de posiciones ("X índices/activos") incorpora `text-xs sm:text-sm lg:text-base font-bold whitespace-nowrap truncate tracking-tight` y `p-3 sm:p-3.5 min-w-0`.
  - Garantiza que el texto permanezca estrictamente en una única línea en cualquier ancho de pantalla (desde móviles de 375px hasta escritorios) sin saltos de línea antiestéticos ni desbordamiento de tarjeta.

### v0.6.4 (Traspasos Entre Cuentas y Billetera de Efectivo, Interfaz Adaptativa y Doble Apunte Sincronizado)
- **[x] Conmutación Reactiva de Interfaz en Gasto (`cat-transfer`)**:
  - Al seleccionar la categoría *"Traspaso"* (`cat-transfer`, icono `ArrowLeftRight`) dentro del panel de gasto en [`QuickAddTransactionModal.tsx`](file:///c:/Users/santi/Documents/UNI/Fluo/src/components/forms/QuickAddTransactionModal.tsx), el formulario adapta instantáneamente sus controles:
    - Oculta el buscador de marcas comerciales (`BrandPicker`).
    - Convierte el concepto en opcional con placeholder descriptivo automático (`Ej. Traspaso a [Destino] (opcional)`).
    - Muestra la tarjeta de flujo visual y los selectores duales de cuenta de salida y cuenta de llegada.
- **[x] Tarjeta de Flujo Visual con Selectores *In-Place* Integrados (Sin Desplegables Redundantes)**:
  - Tarjeta translúcida Liquid Glass con `ArrowLeftRight`, indicador de importe dinámico y representación visual interactiva.
  - Al pulsar sobre el lado *"Desde"* o sobre el lado *"Hacia"*, se abre directamente un cajón selector integrado dentro de la propia tarjeta para cambiar la cuenta sin desplegables externos.
  - Eliminación completa de los desplegables inferiores para máxima limpieza y ergonomía móvil.
  - Botón central de swap interactivo para permutar origen y destino con un solo toque.
  - Filtrado reactivo (`s.id !== selectedSourceId`) y aviso de seguridad si el usuario dispone de solo 1 fuente registrada.
- **[x] Doble Apunte Contable Atómico (Gasto en Origen / Ingreso en Destino)**:
  - Genera simultáneamente dos transacciones enlazadas mediante `transferId` y punteros cruzados `companionTxId`:
    - Movimiento de salida (`pillar: 'expense'`, `sourceId: originSourceId`).
    - Movimiento de entrada (`pillar: 'income'`, `sourceId: destinationSourceId`).
  - El saldo de la cuenta de origen se descuenta, el saldo de la cuenta de destino se incrementa idéntico importe, y el patrimonio líquido total (`computeFinancialSummary`) se mantiene constante ($+X - X = 0$).
- **[x] Sincronización en Cascada en Edición y Borrado**:
  - Al actualizar el importe o fecha de una transferencia con `updateTransaction`, se actualiza atómicamente su contrapartida gemela en estado local y Supabase.
  - Al eliminar uno de los apuntes con `deleteTransaction`, se suprimen ambos de forma atómica para evitar desajustes o dinero fantasma en destino.
- **[x] Suite de Tests Unitarios Automatizados**:
  - 6 nuevos tests unitarios en [`transfers.test.ts`](file:///c:/Users/santi/Documents/UNI/Fluo/src/store/transfers.test.ts) validando transferencias Banco <-> Banco, Efectivo -> Banco, Banco -> Efectivo, actualización bidireccional y borrado atómico.

**Validación de Calidad:**
- Vitest: 135/135 tests unitarios pasando al 100% (8 suites).
- TypeScript: compilación limpia (`npx tsc -b`, 0 errores).
- Servidor de Desarrollo: Vite activo en segundo plano en `http://localhost:5173/`.
- Wiki: Sincronización completa de los 4 documentos en `/docs/wiki/`.
