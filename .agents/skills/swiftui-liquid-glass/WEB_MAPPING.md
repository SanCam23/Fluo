# Web Mapping: SwiftUI Liquid Glass to Tailwind CSS v4 & Modern CSS

Este documento define la traducción arquitectónica de los principios de diseño de **Liquid Glass (iOS 26+)** al ecosistema web moderno utilizando **CSS3 (Backdrop Filter, Inset Shadows)** y **Tailwind CSS v4**.

---

## 1. Principios Fundamentales del "Liquid Glass" en la Web

Liquid Glass no es simplemente opacidad baja con desenfoque; se caracteriza por 5 capas ópticas combinadas:

1. **Sustrato Translúcido (Base Material):** Fondos semi-transparentes de muy baja opacidad (`rgba(255, 255, 255, 0.05)` a `0.12` en fondos oscuros).
2. **Refracción & Difusión (Backdrop Blur & Saturation):** Desenfoque del contenido inferior con realce sutil de saturación (`backdrop-filter: blur(20px) saturate(160%)`).
3. **Borde Especular (Hairline Reflection):** Borde subpíxel o fino (`1px`) con gradiente o transparencia blanca (`border-white/15` o `border-white/20`) que simula la reflexión en la arista de un vidrio biselado.
4. **Resplandor Volumétrico (Inner Highlight & Drop Shadow):** Una sombra interior superior (`inset 0 1px 0 rgba(255, 255, 255, 0.25)`) combinada con una sombra ambiental difusa (`box-shadow: 0 20px 40px -15px rgba(0, 0, 0, 0.5)`).
5. **Comportamiento Táctil/Interactivo:** Transiciones fluidas en hover/active (`scale`, aumento leve de brillo o dispersión).

---

## 2. Matriz de Equivalencias (SwiftUI ↔ Web / Tailwind v4)

| Primitiva SwiftUI (iOS 26+) | Concepto de Diseño | Clases Tailwind CSS v4 Equivalentes |
| :--- | :--- | :--- |
| `.glassEffect(.regular, in: shape)` | Superficie o tarjeta de cristal estándar | `bg-white/[0.08] backdrop-blur-xl border border-white/15 shadow-[inset_0_1px_1px_rgba(255,255,255,0.2),0_8px_32px_rgba(0,0,0,0.37)] rounded-3xl` |
| `.glassEffect(.regular.tint(color))` | Superficie tintada con color de acento | `bg-emerald-500/10 border border-emerald-500/25 backdrop-blur-xl shadow-lg shadow-emerald-500/5` |
| `.buttonStyle(.glass)` | Botón neutro interactivo de cristal | `bg-white/10 hover:bg-white/15 active:scale-[0.98] border border-white/20 backdrop-blur-md rounded-full px-5 py-2.5 text-white transition-all duration-200` |
| `.buttonStyle(.glassProminent)` | Botón principal de cristal tintado | `bg-indigo-600/80 hover:bg-indigo-600 active:scale-[0.98] border border-indigo-400/30 backdrop-blur-md rounded-full px-5 py-2.5 text-white shadow-lg shadow-indigo-600/30 transition-all duration-200` |
| `.buttonBorderShape(.capsule)` | Forma capsular para botones | `rounded-full` |
| `.buttonBorderShape(.roundedRectangle(16))` | Rectángulo redondeado continuo | `rounded-2xl` (o `rounded-3xl`) |
| `GlassEffectContainer` | Contenedor con agrupación visual y fusión de bordes | Contenedor flex/grid con superficie de cristal unificada o elementos hijos con `isolate`, `gap-2` y acoplamiento óptico |
| `.safeAreaBar(.bottom)` | Barra inferior flotante anclada | `fixed bottom-6 left-1/2 -translate-x-1/2 bg-[#0B0F19]/70 backdrop-blur-2xl border border-white/15 rounded-full shadow-2xl px-6 py-3 z-50` |
| `.sharedBackgroundVisibility(.hidden)` | Ítem de barra sin pastilla de cristal | Elemento sin clases de background ni borde (`p-2 text-white/70 hover:text-white transition-colors`) |

---

## 3. Tokens de Diseño "Fluo" en Tailwind v4

En `src/index.css`, se integran los tokens oficiales con la directiva `@theme` de Tailwind v4:

```css
@import "tailwindcss";

@theme {
  /* Lienzo y superficies de cristal */
  --color-fluo-dark: #0B0F19;
  --color-fluo-card: rgba(255, 255, 255, 0.07);
  --color-fluo-card-hover: rgba(255, 255, 255, 0.11);
  --color-fluo-border: rgba(255, 255, 255, 0.15);
  --color-fluo-border-glow: rgba(255, 255, 255, 0.25);

  /* Categorías financieras */
  --color-fluo-income: #10B981;
  --color-fluo-expense: #EF4444;
  --color-fluo-invest: #6366F1;
}
```

---

## 4. Recetas de Componentes Clave

### A. Tarjeta de Cristal Primaria (Card)
```html
<div class="relative overflow-hidden rounded-3xl bg-white/[0.08] backdrop-blur-2xl border border-white/15 p-6 shadow-2xl shadow-black/40 before:pointer-events-none before:absolute before:inset-0 before:bg-gradient-to-b before:from-white/10 before:to-transparent before:opacity-50">
  <!-- Contenido -->
</div>
```

### B. Botón de Cristal Prominente (CTA)
```html
<button class="inline-flex items-center justify-center gap-2 rounded-full bg-indigo-600/85 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-600/30 backdrop-blur-md border border-indigo-400/30 hover:bg-indigo-600 hover:shadow-indigo-600/40 active:scale-95 transition-all duration-200">
  Nueva Transacción
</button>
```

### C. Badge / Chip de Estado Tintado
```html
<!-- Ingreso -->
<span class="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/25 px-3 py-1 text-xs font-medium text-emerald-400 backdrop-blur-md">
  + $3,450.00
</span>

<!-- Gasto -->
<span class="inline-flex items-center gap-1.5 rounded-full bg-rose-500/10 border border-rose-500/25 px-3 py-1 text-xs font-medium text-rose-400 backdrop-blur-md">
  - $120.00
</span>

<!-- Inversión -->
<span class="inline-flex items-center gap-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/25 px-3 py-1 text-xs font-medium text-indigo-400 backdrop-blur-md">
  +14.8% Retorno
</span>
```

### D. Barra Flotante Inferior (Bottom Bar / Dock)
```html
<nav class="fixed bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2 rounded-full bg-[#0B0F19]/80 backdrop-blur-2xl border border-white/15 p-2 shadow-2xl shadow-black/50 z-50">
  <!-- Ítems de navegación -->
</nav>
```

---

## 5. Reglas de Desempeño y Accesibilidad

1. **Evitar anidamiento excesivo de `backdrop-blur`:** En listas largas de transacciones (scrolling virtualizado), no aplicar `backdrop-blur` a cada fila individual; aplicar el filtro de desenfoque al contenedor general y usar `bg-white/[0.03]` plano con bordes finos en las filas.
2. **Contraste de Texto:** Usar tipografía en blanco puro (`text-white`) para títulos o valores principales, y `text-zinc-300` / `text-zinc-400` para metadatos, garantizando legibilidad sobre fondos oscuros o desenfocados.
3. **Reducción de Movimiento:** Si el usuario tiene `prefers-reduced-motion`, evitar transiciones de escala complejas.
