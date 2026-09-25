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
| **Directorio de Marcas (40+ marcas)** | ✅ Completado | Catálogo extendido de marcas cotidianas (alimentación, streaming, delivery, bancos...) |
| **Buscador Interactivo de Marcas** | ✅ Completado | Componente `BrandPicker.tsx` con input de búsqueda en vivo y pills rápidas |
| **Resolución de Logos Vectoriales (SVG)** | ✅ Completado | Mapeo SVG puro (`image/svg+xml`) sin rebabas blancas superiores |
| **Servicio de Precios en Vivo** | ✅ Completado | Simulación reactiva estocástica de cotizaciones en `priceFeedService.ts` |
| **Dashboard Home (Mobile-First)** | ✅ Completado | Hero Balance, 3 Pilares Liquid Glass y Movimientos Recientes con logos |
| **Barra de Navegación Flotante** | ✅ Completado | `bg-slate-950/40 backdrop-blur-2xl border-white/15 shadow-[0_12px_40px_rgba(0,0,0,0.5)]` y botón (+) central |
| **Módulo de Inversiones Completo** | ✅ Completado | Vista de Cartera, selector por tipos, P&L translúcido y modal `AddAssetModal` con búsqueda en vivo |
| **Módulo de Estadísticas y Filtros** | ✅ Completado | Selector multimodal de periodos (Septiembre 2026, Agosto 2026...), distribución por categoría y top marcas |
| **Gestión de Recurrencias** | ✅ Completado | Widget de próximos cargos/abonos con cálculo dinámico de días restantes |
| **Formulario de Nueva Transacción** | ✅ Completado | Modal Liquid Glass con `BrandPicker` interactivo para registrar movimientos |

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
- **Catálogo de 40+ Marcas Oficiales**: Integración de supermercados (Lidl, Dia, Alcampo, El Corte Inglés, Costco), streaming (Disney+, YouTube, Twitch, PlayStation), delivery/restauración (McDonald's, Burger King, Starbucks, Glovo, Just Eat, Uber Eats), movilidad (Cepsa, Uber, Cabify, Renfe, Iberia, Vueling), compras (Zara, IKEA, Decathlon, AliExpress), telecomunicaciones (Movistar, Vodafone, Orange) y fintechs/bancos/exchanges (BBVA, Santander, Revolut, Trade Republic, Binance, Coinbase, Kraken).
- **Depuración Visual**: Eliminación de cualquier línea o halo blanco en los avatares de marcas.
