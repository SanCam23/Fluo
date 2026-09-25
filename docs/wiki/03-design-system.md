# 03 - Sistema de Diseño "Liquid Glass": Fluo

El sistema visual de **Fluo** traslada la sofisticada física visual de materiales vítreos (*Apple Liquid Glass iOS 26+*) al entorno web móvil con **Tailwind CSS v4** y **CSS3**.

---

## 1. Paleta de Colores y Tokens Principales

### Colores de Lienzo y Contraste
- **Background Principal**: `#0B0F19` (Negro obsidiana con matiz índigo espacial profundo).
- **Texto Principal**: `#F8FAFC` (Slate 50 para legibilidad máxima).
- **Texto Secundario**: `#94A3B8` (Slate 400 para etiquetas y metadatos).
- **Texto Terciario / Bordes Mudos**: `#64748B` (Slate 500 / Alpha 0.2).

### Los 3 Pilares Semánticos
| Pilar | Token CSS | Valor Hex | Significado Financiero |
| :--- | :--- | :--- | :--- |
| **Ingresos** | `--color-fluo-income` | `#10B981` (Esmeralda Neón) | Entradas de dinero, nóminas, rendimientos positivos |
| **Gastos** | `--color-fluo-expense` | `#EF4444` (Rojo Coral) | Salidas de dinero, compras, suscripciones |
| **Inversiones**| `--color-fluo-invest` | `#6366F1` (Índigo Eléctrico) | Capital asignado a activos, revalorización |

---

## 2. Anatomía de una Superficie "Liquid Glass"

Una superficie de cristal legítima en Fluo se compone de 4 capas ópticas:

```
┌────────────────────────────────────────────────────────┐  ◄─── 1. Borde Especular (1px white/15 + Inset highlight)
│  ┌──────────────────────────────────────────────────┐  │
│  │                                                  │  │  ◄─── 2. Sustrato Translúcido (bg-white/[0.07])
│  │             Contenido del Componente             │  │
│  │                                                  │  │  ◄─── 3. Refracción de Fondo (backdrop-blur-xl saturate-150)
│  └──────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────┘  ◄─── 4. Sombra de Profundidad (shadow-2xl shadow-black/50)
```

### Clase de Utilidad Primaria (`.glass-card`)
```css
.glass-card {
  background: rgba(255, 255, 255, 0.07);
  backdrop-filter: blur(24px) saturate(160%);
  -webkit-backdrop-filter: blur(24px) saturate(160%);
  border: 1px solid rgba(255, 255, 255, 0.15);
  box-shadow: 
    inset 0 1px 1px 0 rgba(255, 255, 255, 0.2),
    0 20px 40px -15px rgba(0, 0, 0, 0.6);
}
```

---

## 3. Primitivas de Componentes

### 1. Tarjetas de Cristal (`GlassCard`)
- **Radio de curvatura**: `rounded-3xl` (24px) para tarjetas maestras; `rounded-2xl` (16px) para subelementos.
- **Resplandor interior**: `before:bg-gradient-to-b before:from-white/10 before:to-transparent` para simular la luz que incide desde la arista superior.

### 2. Botón Neutro de Cristal (`GlassButton` / `.buttonStyle(.glass)`)
- Clases: `bg-white/10 hover:bg-white/15 active:scale-[0.98] border border-white/20 backdrop-blur-md rounded-full px-5 py-2.5 text-white transition-all duration-200`
- Aplicación: Filtros, selectores secundarios, botones de cancelar.

### 3. Botón Prominente (`GlassProminentButton` / `.buttonStyle(.glassProminent)`)
- Clases: `bg-indigo-600/85 hover:bg-indigo-600 active:scale-[0.98] border border-indigo-400/30 backdrop-blur-md rounded-full px-5 py-2.5 text-white shadow-lg shadow-indigo-600/30 transition-all duration-200`
- Aplicación: Llamadas a la acción (CTA), registrar transacción, confirmar inversión.

### 4. Barra de Navegación Flotante (`FloatingDock` / `.safeAreaBar(.bottom)`)
- Clases: `fixed bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-1 bg-[#0B0F19]/80 backdrop-blur-2xl border border-white/15 rounded-full p-2 shadow-2xl shadow-black/60 z-50`
- Comportamiento: 4 secciones (Home, Estadísticas, Inversiones, Añadir con botón central elevado).

### 5. Chips y Badges de Pilares
- **Ingreso**: `bg-emerald-500/10 border border-emerald-500/25 text-emerald-400`
- **Gasto**: `bg-rose-500/10 border border-rose-500/25 text-rose-400`
- **Inversión**: `bg-indigo-500/10 border border-indigo-500/25 text-indigo-400`

---

## 4. Microinteracciones y Haptic Feedback Visual

- **Active State**: Cada botón o tarjeta interactiva implementa `active:scale-[0.97]` con curva suave `cubic-bezier(0.16, 1, 0.3, 1)`.
- **Luces Ambientales**: Tres orbes difusos de color en el fondo (`blur-3xl`) se sitúan detrás de la capa de interfaz, permitiendo que el efecto de cristal cobre vida al hacer scroll y refractar diferentes colores.
