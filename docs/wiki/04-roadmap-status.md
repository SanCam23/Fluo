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
| **Servicio de Precios en Vivo** | ✅ Completado | Simulación reactiva estocástica de cotizaciones en `priceFeedService.ts` |
| **Dashboard Home (Mobile-First)** | ✅ Completado | Hero Balance, 3 Pilares Liquid Glass y Movimientos Recientes con logos |
| **Barra de Navegación Flotante** | ✅ Completado | `bg-slate-950/40 backdrop-blur-2xl border-white/15 shadow-[0_12px_40px_rgba(0,0,0,0.5)]` y botón (+) central |
| **Módulo de Inversiones Completo** | ✅ Completado | Vista de Cartera, selector por tipos, P&L translúcido y modal `AddAssetModal` con búsqueda en vivo |
| **Módulo de Estadísticas y Métricas (/stats)** | ✅ Completado | Visualización con Recharts: Donut con centro hueco, Barras comparativas, Área de Patrimonio Neto y Ranking de Marcas |
| **Motor de Recurrencias & Catch-up** | ✅ Completado | Motor en cliente `recurringEngine.ts`, calendar clamping para meses cortos, generación histórica idempotente |
| **Formulario Granular de Recurrencias** | ✅ Completado | Modal Liquid Glass con switch iOS, periodicidad semanal/quincenal/mensual/anual, días de semana/mes y auto-registro |
| **Suite de Tests Unitarios (Vitest)** | ✅ Completado | 12 tests automatizados pasando: multi-month catch-up, leap years, clamps de fin de mes y deduplicación |
| **Simulador Temporal de Depuración** | ✅ Completado | Debug Tool `TimeSimulatorModal.tsx` con saltos de +1 semana, +1 mes, ejecución manual y badge reactivo |

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

---

## Próximos Hitos (v0.5.0)
- [ ] **Presupuestos Mensuales & Metas de Ahorro**: Límites de gasto por categoría con barras de advertencia translúcidas.
- [ ] **Exportación / Importación de Datos**: Backups locales en formato JSON y exportación de movimientos en CSV/Excel.
- [ ] **Migración a IndexedDB**: Capacidad de soporte para miles de registros y series temporales históricas con `Dexie.js`.
- [ ] **Widgets de PWA & Offline First**: Service Worker y manifiesto PWA para instalación nativa en dispositivos iOS/Android.
