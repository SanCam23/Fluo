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

---

## Próximos Hitos (v1.0.0)
- [ ] **Presupuestos Mensuales & Metas de Ahorro**: Límites de gasto por categoría con barras de advertencia translúcidas.
- [ ] **Exportación / Importación de Datos**: Backups locales en formato JSON y exportación de movimientos en CSV/Excel.
- [ ] **Migración a IndexedDB**: Capacidad de soporte para miles de registros y series temporales históricas con `Dexie.js`.
- [x] **Widgets de PWA & Offline First**: Service Worker y manifiesto PWA para instalación nativa en dispositivos iOS/Android.
