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

### 4. Barra de Navegación Flotante (`FloatingNavbar` / `.safeAreaBar(.bottom)`)
- Clases: `fixed bottom-4 inset-x-4 max-w-sm mx-auto z-50 bg-slate-950/40 backdrop-blur-2xl border border-white/15 rounded-3xl p-2 shadow-[0_12px_40px_rgba(0,0,0,0.5)]`
- **Botón Central Elevado (+)**: `bg-gradient-to-tr from-indigo-500 to-indigo-400 text-white shadow-lg shadow-indigo-500/30 active:scale-90 transition-all rounded-2xl`
- **Pestañas Activas**: Indicador con resplandor índigo sutil y texto `text-white font-medium`, inactivas en `text-slate-400 hover:text-slate-200`.

### 5. Chips y Badges de Pilares
- **Ingreso**: `bg-emerald-500/10 border border-emerald-500/25 text-emerald-400`
- **Gasto**: `bg-rose-500/10 border border-rose-500/25 text-rose-400`
- **Inversión**: `bg-indigo-500/10 border border-indigo-500/25 text-indigo-400`

### 6. Contenedor de Identidad de Marca (`BrandAvatar`)
- **Base Neutra**: `bg-[#111726] border border-white/10 rounded-xl overflow-hidden`
- **Política de Fidelidad de Marca (Sin Halos Blancos)**: A diferencia de las tarjetas decorativas, los avatares de marca **no** deben incluir iluminaciones especulares ni degradados superiores en blanco (`before:bg-gradient-to-b from-white/50...`), ya que distorsionan el color oficial de las marcas y generan líneas parasitarias.
- **Ajuste Vectorial**: `w-full h-full object-contain p-2` con transición suave `opacity-100` y soporte de cascada SVG.

### 7. Buscador de Marcas Flotante (`BrandPicker`)
- **Input de Búsqueda**: `bg-slate-900/60 backdrop-blur-xl border border-white/15 focus:border-indigo-500/50 rounded-2xl text-white placeholder-slate-500` con spinner `Loader2` animado en `text-indigo-400`.
- **Insignia "Global"**: `bg-indigo-500/10 text-indigo-400 text-[10px] font-normal px-1.5 py-0.5 rounded-full border border-indigo-500/20` junto a la etiqueta superior.
- **Menú Flotante Desplegable**: `bg-slate-950/98 backdrop-blur-2xl border border-white/20 rounded-2xl shadow-[0_16px_48px_rgba(0,0,0,0.7)]` con separadores sutiles `border-white/10`.
- **Filas de Directorio Global**: `bg-indigo-500/[0.04] hover:bg-indigo-500/[0.15] border border-indigo-500/15 rounded-xl` con pastilla reflectante de acción rápida `bg-indigo-500/20 text-indigo-300`.
- **Fila de Creación Personalizada**: `bg-white/[0.04] hover:bg-white/[0.09] rounded-xl` con icono `Plus` encerrado en un badge vítreo `bg-indigo-600/20 border border-indigo-500/30 text-indigo-400`.
- **Pastillas de Selección Rápida (Pills)**: `bg-white/5 hover:bg-white/10 border border-white/10 rounded-full px-2.5 py-1 text-[11px] text-slate-300 active:scale-95`.
- **Tarjeta de Marca Seleccionada**: `bg-white/[0.08] backdrop-blur-md border border-white/20 rounded-2xl p-2.5 shadow-sm` con botón de deselección directa.

### 8. Insignias de Categoría (`CategoryIcon`)
- **Contenedor**: `bg-white/5 border border-white/10 rounded-xl flex items-center justify-center`
- **Glifo**: Iconos de Lucide React renderizados en tamaño proporcional con color semántico según la categoría financiera asociada.

### 9. Gráficos y Métricas Visuales (`Recharts` adaptado a Liquid Glass)
- **Contenedores de Gráfico**: `rounded-3xl bg-white/[0.07] backdrop-blur-2xl border border-white/15 p-5 shadow-2xl` con línea especular superior `h-px bg-gradient-to-r from-transparent via-white/50 to-transparent`.
- **Tooltips Flotantes (`GlassTooltip`)**: `rounded-2xl bg-[#0F1626]/95 border border-white/20 p-3 shadow-2xl backdrop-blur-2xl text-xs z-50` con viñetas coloreadas y tipografía de alto contraste.
- **Gráfico de Dona (Distribución de Gastos)**:
  - Centro hueco (`innerRadius={68}`, `outerRadius={92}`).
  - Contador central en doble capa tipográfica ("Total Gastado" + importe en `text-lg font-black text-white`).
  - Leyenda inferior interactiva en pastillas `bg-white/[0.04] hover:bg-white/[0.08]`.
- **Gráfico de Barras Comparativas**:
  - Barras redondeadas en aristas superiores `radius={[4, 4, 0, 0]}`.
  - Paleta semántica: Ingreso (`#10B981`), Gasto (`#EF4444`), Ahorro (`#6366F1`).
  - Ejes atenuados `stroke="#94A3B8"` y líneas de referencia en `rgba(255, 255, 255, 0.1)`.
- **Gráfico de Área (Evolución de Patrimonio)**:
  - Curva suave (`type="monotone"`).
  - Gradiente SVG translúcido `#gradientNetWorth` con degradado vertical de `rgba(99, 102, 241, 0.6)` a transparente.
- **Ranking de Marcas (Barras Horizontales)**:
  - Podio con insignias de medallas (#1 Oro, #2 Plata, #3 Bronce).
  - Barras de progreso horizontales con degradado tricolor `from-rose-500 via-pink-500 to-indigo-500`.

### 10. Sub-Métricas de Balance (`HeroBalance`)
- **Cuadrícula Aislada de 2 Columnas**: `grid grid-cols-2 gap-2 text-xs` sobre `border-t border-white/10`.
- **Celdas Vítreas Independientes**: `flex flex-col justify-center rounded-2xl bg-white/[0.04] border border-white/10 px-3 py-2`.
- **Ventaja Ergonómica**: Erradica el quiebre de palabras ("Tasa de ahorro") y asegura márgenes amplios y lectura limpia de la Tasa de Ahorro y el Rendimiento latente sin solapamientos.

### 11. Tarjeta de Transacción Reciente (`RecentTransactionsList`)
- **Estructura en Doble Eje Paralelo**:
  - **Eje Izquierdo**: Avatar de marca (`BrandAvatar`) con separación clara `mr-3.5 flex-shrink-0`.
  - **Eje Central (`flex-1 min-w-0 pr-2`)**:
    - Fila 1: Concepto de la transacción (`text-sm font-semibold text-white tracking-tight truncate block`).
    - Fila 2: Categoría (`text-xs text-slate-400 truncate`) + Badge vítreo de recurrencia si aplica (`Auto` / `Recurrente`).
  - **Eje Derecho (`flex-shrink-0 text-right`)**:
    - Fila 1: Importe en `text-[15px] font-bold tracking-tight` con coloración semántica exclusiva (sin etiqueta textual `EXPENSE`/`INCOME`/`INVEST` redundante).
    - Fila 2: Fecha relativa (`formatRelativeDate`) en `text-xs text-slate-400 font-medium mt-0.5`.
  - **Gesto de Deslizar para Eliminar (`Swipe-to-Delete`)**:
    - Reconocimiento táctil con `touch-action: pan-y` para permitir scroll vertical nativo y captura horizontal precisa.
    - Fondo de acción reactivo: capa roja (`bg-rose-600/90 backdrop-blur-xl`) oculta al reposo (`visibility: hidden, opacity: 0`) para erradicar cualquier fuga o sombreado rojo a través del cristal translúcido de la tarjeta (`bg-white/[0.05]`). Solo se hace visible y proporcional al arrastre cuando `offsetX < 0`.
    - Umbral de activación: al superar los -80px y soltar, dispara una animación cinematográfica de expulsión (`translateX(-100%)`) y colapso de fila (`max-h-0 opacity-0 my-0 py-0 scale-95 duration-300`).
    - Si se libera antes del umbral, regresa con resorte suave (`cubic-bezier(0.16, 1, 0.3, 1)`).
    - Botón de papelera accesible en hover de escritorio como método alternativo sin alterar el espaciado.

### 12. Tarjetas Duales de Métricas de Inversión (`InvestmentsView`)
- **Jerarquía Vertical Estricta**:
  - Evita saturar el eje horizontal en anchos reducidos dividiendo la información en 3 niveles:
    1. Etiqueta superior en mayúsculas (`text-[10px] tracking-wider text-slate-400`).
    2. Importe monetario principal en `text-base font-bold tracking-tight` (blanco en coste base, esmeralda/carmesí en P&L).
    3. Metadato contextual inferior (`Coste base total` o porcentaje ROI con icono vectorial `TrendingUp`/`TrendingDown` en `text-[11px]`).
- **Simetría Volumétrica**: Ambas tarjetas (`Patrimonio Invertido` y `P&L No Realizado`) comparten altura y padding idénticos (`p-3 rounded-2xl flex flex-col justify-between`).

### 13. Iluminación Atmosférica Reactiva Ultra-Suave (`MobileContainer`)
- **Preservación del Lienzo Obsidiana**: El fondo base `#0B0F19` se mantiene puro, evitando tintes completos o filtros invasivos que afecten a la legibilidad.
- **Focos Difusos de Máxima Atenuación**: Orbes ambientales con desenfoque extremo (`blur-[150px]-blur-[160px]`) y opacidades mínimas (`10%-14%`), generando una presencia de luz etérea que no satura:
  - *Ingresos*: Orbe superior en verde esmeralda ultraligero (`bg-emerald-500/12`).
  - *Gastos*: Orbe superior en rojo coral ultraligero (`bg-rose-500/10`).
  - *Inversión*: Orbe superior en índigo ultraligero (`bg-indigo-500/14`).
- **Spotlight Superior Sutil (`h-64`)**: Degradado cenital acotado a la cabecera (`from-.../[0.04] to-transparent`) que aporta una delicada caricia lumínica exclusivamente detrás del balance principal.

### 14. Dock Flotante Liquid Glass Suave & Refinado (`FloatingNavbar`)
- **Sustrato y Difusión Cromática (`Backdrop Refraction`)**:
  - `bg-slate-900/40 backdrop-blur-2xl backdrop-saturate-150`: Material ahumado de alta gama con mayor translucidez (`40%`), absorbiendo suavemente el fondo sin lechosidad y permitiendo que los elementos y focos refracten a través del dock con fluidez orgánica.
- **Biselado Especular Orgánico (Luz Inset Atenuada)**:
  - `shadow-[inset_0_1px_0_0_rgba(255,255,255,0.18),0_16px_36px_-8px_rgba(0,0,0,0.45)]`:
    - Borde superior interior: bisel suave de cristal pulido que atrapa la luz cenital (`rgba(255,255,255,0.18)`).
    - Sombra ambiental: desenfoque gradual de 36px que eleva el dock de forma natural.
  - Borde perimetral: `border-white/10 hover:border-white/20`.
- **Aura Atmosférica Subsuperficial Atenuada**:
  - `absolute -bottom-1 inset-x-12 h-4 bg-indigo-500/10 blur-xl rounded-full`: Suspensión sutil e ingrávida que no satura el pie de pantalla.
- **Línea Especular Cenital (`Hairline Glint`)**:
  - Hilo ultrafino de 1px (`h-px bg-gradient-to-r from-transparent via-white/30 to-transparent`).
- **Cápsula de Pestaña Activa en Cristal Ahumado**:
  - `bg-white/10 backdrop-blur-md border border-white/15 shadow-[inset_0_1px_0_rgba(255,255,255,0.2),0_2px_8px_rgba(0,0,0,0.25)] font-medium`.
  - Transición fluida con respuesta táctil elástica `active:scale-95`.
- **Botón Central (+) Gema de Cristal Suave**:
  - Gradiente enriquecido `bg-gradient-to-tr from-indigo-500/90 via-indigo-600/90 to-emerald-500/80`.
  - Resplandor controlado `shadow-[0_4px_16px_rgba(99,102,241,0.3),inset_0_1px_1px_rgba(255,255,255,0.35)]` con destello cenital atenuado `via-white/50` y pulsación `active:scale-95`.

---

## 4. Microinteracciones y Haptic Feedback Visual

- **Active State**: Cada botón o tarjeta interactiva implementa `active:scale-[0.97]` con curva suave `cubic-bezier(0.16, 1, 0.3, 1)`.
- **Luces Ambientales**: Tres orbes difusos de color en el fondo (`blur-3xl`) se sitúan detrás de la capa de interfaz, permitiendo que el efecto de cristal cobre vida al hacer scroll y refractar diferentes colores.


