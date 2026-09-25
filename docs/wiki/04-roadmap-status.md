# 04 - Hoja de Ruta y Estado de Módulos (Roadmap): Fluo

Control de hitos, módulos completados, en desarrollo y planificados para la aplicación de finanzas personales Fluo.

---

## Estado Actual de Módulos

| Módulo / Característica | Estado | Detalle Técnico |
| :--- | :---: | :--- |
| **Auditoría & Setup Inicial** | ✅ Completado | Vite 8 + React 19 + Tailwind CSS v4 + Skill Liquid Glass |
| **Wiki Interna de Arquitectura** | ✅ Completado | Documentación viva en `/docs/wiki/` (01 al 04) |
| **Modelado de Tipos TypeScript** | ✅ Completado | Contratos oficiales en `src/types/finance.ts` |
| **Store Central & Persistencia** | ✅ Completado | Zustand con middleware `persist` en `localStorage` y selectores |
| **Directorio de Marcas y Tickers** | ✅ Completado | Marcas reales (Mercadona, Netflix, DAZN...) y activos con Ticker/ISIN |
| **Servicio de Precios en Vivo** | ✅ Completado | Simulación reactiva y estocástica de cotizaciones en `priceFeedService.ts` |
| **Dashboard Home (Mobile-First)** | ✅ Completado | Hero Balance, 3 Pilares Liquid Glass y Movimientos Recientes |
| **Barra de Navegación Flotante** | ✅ Completado | Floating Dock translúcido con navegación por pestañas y botón CTA |
| **Módulo de Inversiones** | ✅ Completado | Vista de Cartera para Acciones, Fondos, ETFs, Cripto, Renta Fija y Depósitos |
| **Módulo de Estadísticas & Gráficos** | ✅ Completado | Distribución por categoría, tasa de ahorro y gasto por marca |
| **Gestión de Recurrencias** | ✅ Completado | Widget de próximos cargos/abonos con cálculo de días restantes |
| **Formulario de Nueva Transacción** | ✅ Completado | Modal Liquid Glass interactivo para registrar movimientos |

---

## Registro de Versiones

### v0.1.0 (Entorno y Fundamentos)
- Inicialización con `@tailwindcss/vite` v4.
- Smoke test de compilación y verificación de tokens oficiales.
- Instalación de `lucide-react` y `zustand`.
- Creación de la Wiki Interna con diseño de arquitectura y modelos de datos.

### v0.2.0 (Core Data, Liquid Glass Design System & Mobile Views)
- Modelado exhaustivo de entidades en [`finance.ts`](file:///c:/Users/santi/Documents/UNI/Fluo/src/types/finance.ts).
- Store reactivo [`useFinanceStore.ts`](file:///c:/Users/santi/Documents/UNI/Fluo/src/store/useFinanceStore.ts) con persistencia local.
- Primitivas visuales Liquid Glass ([`GlassCard`](file:///c:/Users/santi/Documents/UNI/Fluo/src/components/common/GlassCard.tsx), [`GlassButton`](file:///c:/Users/santi/Documents/UNI/Fluo/src/components/common/GlassButton.tsx), [`BrandAvatar`](file:///c:/Users/santi/Documents/UNI/Fluo/src/components/common/BrandAvatar.tsx)).
- Dashboard Home interactivo con Hero Balance, 3 Pilares, Próximas Recurrencias y Movimientos Recientes.
- Pestaña de Cartera de Inversiones con cotización en vivo y métricas de rendimiento.
- Pestaña de Estadísticas con tasa de ahorro, distribución por categoría y marcas con mayor gasto.
- Modal flotante con soporte para ingresos, gastos, inversiones y recurrencias.
- Verificación de tipos estricta y paso limpio de `tsc -b && vite build` y `eslint .`.
