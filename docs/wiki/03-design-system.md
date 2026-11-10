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
- **Contenedor Simétrico Equidistante**: `fixed bottom-4 inset-x-4 max-w-sm mx-auto z-50 bg-slate-950/70 backdrop-blur-2xl border border-white/15 rounded-3xl p-1.5 shadow-[0_12px_40px_rgba(0,0,0,0.5)]`.
- **Estructura en Cuadrícula 4 Columnas**: Organizada con `grid grid-cols-4 items-stretch gap-1.5`, garantizando una anchura e idéntica altura en todas las columnas con separación matemáticamente uniforme entre todos los botones.
- **Botón de Acción Rápida (+)**: Cápsula Liquid Glass prominente con gradiente tricolor `bg-gradient-to-tr from-indigo-500/90 via-indigo-600/90 to-emerald-500/80`, glifo central `Plus` de 24px (`h-6 w-6 stroke-[2.5]`) sin etiqueta textual inferior, destello especular superior en la cresta del cristal y micro-interacción háptica `active:scale-90`.
- **Pestañas Activas / Inactivas**: Las pestañas activas presentan cápsula refractiva `bg-white/[0.12] text-white shadow-sm border border-white/20`, mientras que las inactivas utilizan `text-slate-400 hover:text-slate-200 hover:bg-white/[0.04]`.

### 4.1. Fila de Movimiento Deslizable Bidireccional (`SwipeableTransactionItem`)
- **Superficie Deslizable**: Tarjeta Liquid Glass `bg-white/[0.05] hover:bg-white/[0.08] backdrop-blur-xl border border-white/10 hover:border-white/20 rounded-2xl p-3.5` con amortiguación elástica tras sobrepasar el umbral de 100px.
- **Deslizamiento hacia la Izquierda (Eliminar)**: Revela un sustrato rojo coral `bg-rose-500/80` (o `bg-rose-600/90` al rebasar 80px) con icono `Trash2` y texto dinámico *"Eliminar"* / *"Soltar para eliminar"*.
- **Deslizamiento hacia la Derecha (Editar)**: Revela un sustrato índigo Liquid Glass `bg-indigo-500/80` (o `bg-indigo-600/90` al rebasar 80px) con icono `Pencil` y texto dinámico *"Editar"* / *"Soltar para editar"*. Al soltar tras superar el umbral, abre automáticamente el modal de edición pre-cargado.
- **Acceso en Escritorio**: Botones de acción rápida (`Pencil` y `Trash2`) visibles al hacer *hover* sobre el registro.

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
- **Glifo**: Iconos de Lucide React renderizados en tamaño proporcional con color semántico según la categoría financiera asociada:
  - Ingresos: `Briefcase`, `ArrowDownLeft`, `Coins`, `Laptop`, `Sparkles`, `Building2`, `Percent`, `RotateCcw`, `Gift`, `Wallet`.
  - Gastos: `ShoppingBag`, `Tv`, `Home`, `Car`, `Utensils`, `HeartPulse`, `GraduationCap` (Estudios), `Banknote` (Cajero), `Send` (Bizum), `Plane` (Viajes), `Gift` (Regalos), `MoreHorizontal` (Otros).
  - Inversiones: `TrendingUp`, `LineChart`, `Bitcoin`, `ShieldCheck`, `Landmark`.

### 9. Selector Desplegable de Cristal (`GlassSelect`)
- **Disparador Liquid Glass**: `bg-white/[0.06] hover:bg-white/[0.1] border border-white/15 backdrop-blur-xl rounded-2xl px-3.5 py-2.5 shadow-[inset_0_1px_1px_rgba(255,255,255,0.12)] active:scale-[0.99]` con chevron rotatorio `transition-transform duration-200`.
- **Menú Flotante Revestido**: `bg-[#0D1527]/95 backdrop-blur-2xl border border-white/20 rounded-2xl p-1.5 shadow-[0_20px_50px_rgba(0,0,0,0.8),inset_0_1px_1px_rgba(255,255,255,0.15)]` con destello especular superior.
- **Filas de Selección**: Resplandor activo `bg-indigo-600/25 border border-indigo-500/40 text-white shadow-[0_0_12px_rgba(99,102,241,0.25)]` con checkmark `Check` y soporte para iconos semánticos (`CategoryIcon`, clases de activo, divisas).
- **Control de Foco y Cierre**: Cierre automático al hacer clic fuera o pulsar la tecla `Escape`.

### 10. Gráficos y Métricas Visuales (`Recharts` adaptado a Liquid Glass)
- **Contenedores de Gráfico**: `rounded-3xl bg-white/[0.07] backdrop-blur-2xl border border-white/15 p-5 shadow-2xl` con línea especular superior `h-px bg-gradient-to-r from-transparent via-white/50 to-transparent`.
- **Tooltips Flotantes (`GlassTooltip` y `SavingsCustomTooltip`)**: `rounded-2xl bg-[#0F1626]/95 border border-white/20 p-3 shadow-2xl backdrop-blur-2xl text-xs z-50` con viñetas coloreadas, badges de estado y tipografía de alto contraste.
- **Tarjeta Unificada de Ahorro y Balance (`AnalyticsView.tsx`)**:
  - Superficie Liquid Glass compacta (~160px de altura): `bg-slate-900/60 backdrop-blur-2xl border border-white/15 rounded-3xl p-5 shadow-[0_8px_32px_0_rgba(0,0,0,0.37)]`.
  - Reflector especular cenital y halo ambiental dinámico (`bg-emerald-500/15` para superávit, `bg-rose-500/15` para déficit).
  - Insignias semánticas Liquid Glass en cabecera: Tasa de Ahorro (`+42.5% tasa`) y estado con icono `TrendingUp` ("Superávit") o `TrendingDown` ("Déficit").
  - Importe neto de alto impacto tipográfico: `text-3xl sm:text-4xl font-black` con resplandor neón (`drop-shadow-[0_0_24px_rgba(16,185,129,0.35)]`).
  - Cuadrícula vítrea integrada de 4 celdas (`grid-cols-2 sm:grid-cols-4`):
    - *Ingresos*: Total del periodo con flecha diagonal `ArrowUpRight` en verde esmeralda.
    - *Gastos*: Total del periodo con flecha diagonal `ArrowDownRight` y media diaria `/día`.
    - *Ritmo Ahorro*: Ahorro medio diario en euros/día (`/d`) según días transcurridos.
    - *Cierre Mes (Est.)*: Proyección calculada de ahorro al ritmo actual para final de mes.
- **Hub Analítico con Conmutador de 4 Vistas (`[Ahorro | Categorías | Mensual | Patrimonio]`)**:
  - Pestaña predeterminada `Ahorro`: Despliega el gráfico interactivo de área (`AreaChart` h-60) con spline `monotone`, gradiente `#savingsAreaGradient`, `<ReferenceLine y={0} />`, conmutador de modo `[Acumulado | Neto]`, tooltip enriquecido `SavingsCustomTooltip` y cinta inferior de 5 pastillas mensuales de superávit/déficit en un solo bloque no invasivo.
  - Elimina redundancias de tarjetas apiladas intermedias, reduciendo la altura vertical de la página de ~1.550px a ~880px para una navegación ligera y óptima en móviles.
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
- **Pureza Visual Simétrica**: Se erradican iconos decorativos redundantes (como el glifo `Sparkles` previo a "Rendimiento"), garantizando simetría visual pura con la celda de "Tasa de ahorro", eliminando colisiones y saltos de línea inoportunos.

### 10.1. Avatar de Perfil y Cabecera Minimalista (`App.tsx`)
- **Avatar Circular Ampliado**: Botón táctil `w-10 h-10` con sustrato Liquid Glass `bg-white/[0.08] hover:bg-white/[0.12] border border-white/20 rounded-full`.
- **Monograma de Alta Legibilidad**: Inicial del usuario renderizada en tipografía destacada `text-base sm:text-lg font-black text-white leading-none tracking-tight` (icono `User` fallback ampliado a `h-5 w-5`).
- **Despeje de Cabecera**:
  - Eliminación de iconos de estado superfluos (como el icono de nube `Cloud`), preservando el indicador de sincronización activa exclusivamente en momentos de mutación en red.
  - Ocultación del botón de depuración `Simular` en cuentas con sesión iniciada (manteniéndolo activo únicamente en modo Demo no autenticado).

### 11. Tarjeta de Transacción Reciente (`RecentTransactionsList`)
- **Estructura en Doble Eje Paralelo**:
  - **Eje Izquierdo**: Avatar de marca (`BrandAvatar`) con separación ergonómica `mr-3 flex-shrink-0`.
  - **Eje Central (`flex-1 min-w-0 pr-3`)**:
    - Fila 1: Concepto de la transacción (`text-sm font-semibold text-white tracking-tight truncate block`), con espacio horizontal expandido (hasta 45px adicionales al desacoplar botones de escritorio en móvil) para evitar truncamientos prematuros.
    - Fila 2: Categoría (`text-xs text-slate-400 truncate max-w-[180px]`) + Badge vítreo de recurrencia si aplica (`Auto` / `Recurrente`).
  - **Eje Derecho (`flex items-center gap-1 flex-shrink-0 text-right`)**:
    - Fila 1: Importe en `text-[15px] font-bold tracking-tight` alineado de forma pura hacia el límite derecho de la tarjeta.
    - Fila 2: Fecha relativa (`formatRelativeDate`) en `text-xs text-slate-400 font-medium mt-0.5`.
    - Botones de acción rápida en escritorio (`Pencil` y `Trash2`): configurados con `hidden sm:flex` para no consumir ancho útil en pantallas móviles.
  - **Gesto de Deslizar para Eliminar (`Swipe-to-Delete`)**:
    - Reconocimiento táctil con `touch-action: pan-y` para permitir scroll vertical nativo y captura horizontal precisa.
    - Fondo de acción reactivo: capa roja (`bg-rose-600/90 backdrop-blur-xl`) oculta al reposo (`visibility: hidden, opacity: 0`) para erradicar cualquier fuga o sombreado rojo a través del cristal translúcido de la tarjeta (`bg-white/[0.05]`). Solo se hace visible y proporcional al arrastre cuando `offsetX < 0`.
    - Umbral de activación: al superar los -80px y soltar, dispara una animación cinematográfica de expulsión (`translateX(-100%)`) y colapso de fila (`max-h-0 opacity-0 my-0 py-0 scale-95 duration-300`).
    - Si se libera antes del umbral, regresa con resorte suave (`cubic-bezier(0.16, 1, 0.3, 1)`).
    - Botón de papelera accesible en hover de escritorio como método alternativo sin alterar el espaciado.

### 12. Tarjetas Cuádruples de Métricas de Inversión (`InvestmentsView`)
- **Jerarquía Vertical Estricta y Prevención de Saltos de Línea**:
  - Evita saturar el eje horizontal en anchos reducidos dividiendo la información en 3 niveles:
    1. Etiqueta superior en mayúsculas (`text-[10px] tracking-wider text-slate-400`).
    2. Importe monetario principal en `text-base font-bold tracking-tight` (blanco en coste base, esmeralda/carmesí en P&L).
    3. Metadato contextual inferior (`Coste base total` o porcentaje ROI con icono vectorial `TrendingUp`/`TrendingDown` en `text-[11px]`).
- **Simetría Volumétrica y Contención Grid**: Todas las tarjetas comparten altura, aislamiento de columna y padding idéntico (`p-3 sm:p-3.5 rounded-2xl flex flex-col justify-between min-w-0`). La tarjeta de `Posiciones Únicas` aplica `text-xs sm:text-sm lg:text-base font-bold whitespace-nowrap truncate tracking-tight` para garantizar que la descripción `"2 índices/activos"` no se divida en dos líneas en pantallas estrechas.

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

### 15. Modo Claro Liquid Glass: "Blanco Perla iOS"
- **Lienzo Base**: `#F1F5F9` (Slate-100 frío), sustituyendo el negro obsidiana `#0B0F19` con una atmósfera luminosa, limpia y elegante.
- **Superficie de Cristal Perla (`Pearl Glass Cards`)**:
  - `bg-white/[0.88] backdrop-blur-2xl backdrop-saturate-180 border border-slate-300/80`: Las tarjetas adoptan un cristal translúcido de aspecto lechoso y refracción nítida con contorno definido.
  - Luz Cenital y Sombra Suave: `box-shadow: inset 0 1px 1px 0 rgba(255, 255, 255, 1), 0 4px 20px -2px rgba(15, 23, 42, 0.07)`.
- **Dock Flotante en Modo Claro (Auténtico Liquid Glass con Mayor Translucidez)**:
  - Material vítreo con 52% de translucidez (`bg-white/48 backdrop-blur-2xl backdrop-saturate-210 border border-white/80`), permitiendo que el contenido refracte con fluidez y viveza al desplazarse por detrás del dock.
  - Biselado especular continuo: `box-shadow: inset 0 1.5px 1px 0 #FFFFFF, inset 0 -1px 1px 0 rgba(0,0,0,0.03), 0 16px 40px -8px rgba(15,23,42,0.12), 0 4px 12px -2px rgba(15,23,42,0.06)`.
  - Pestañas activas con lente de cristal blanco óptico elevado: `light:bg-white/75 light:text-indigo-600 light:border-white light:shadow-[0_2px_8px_rgba(15,23,42,0.07),inset_0_1px_1px_rgba(255,255,255,0.9)] font-bold`.
  - Botón central (+) gema con resplandor subsuperficial `light:shadow-[0_4px_16px_rgba(99,102,241,0.45),inset_0_1px_1px_rgba(255,255,255,0.6)]`.
- **Orbes Ambientales en Modo Claro**:
  - Difusiones en tonos pastel suaves (`bg-emerald-400/20`, `bg-rose-400/20`, `bg-indigo-400/20 blur-[140px]`) que refractan sutilmente a través del cristal perlado al hacer scroll.
- **Jerarquía Tipográfica y Contraste**:
  - Títulos principales: `text-slate-900` (`#0F172A`) con nitidez absoluta.
  - Subtítulos y metadatos: `text-slate-600` (`#475569`) y `text-slate-400` (`#94A3B8`).
  - Colores semánticos vibrantes calibrados para fondos claros: Esmeralda esmerilado para ingresos, Carmesí para gastos y Violeta/Índigo para inversión.
- **Selector Triple en Ajustes**:
  - Segmented control estilo iOS con 3 pastillas: *Claro* (`Sun`), *Oscuro* (`Moon`) y *Sistema* (`Monitor`).
- **Carteles y Badges de Activos con Alto Contraste**:
  - Sustitución de tonos pastel claros (`*-300`, `*-200`) por variantes saturadas de alta legibilidad (`light:text-indigo-700`, `light:text-blue-700`, `light:text-purple-700`, `light:text-amber-800`, `light:text-emerald-700`, `light:text-teal-700`).
  - Fondos de cápsula calibrados a `12-15%` de opacidad con bordes definidos (`light:border-indigo-200`, `light:bg-indigo-50`), garantizando ratios de contraste superiores a 6:1 (AAA/AA) sobre cristal perlado y fondos claros en carteles como `ETF`, `Acción`, `Cripto`, `Fondo Indexado`, `ISIN/Ticker` y `P&L`.

### 17. Carrusel Deslizante de Balance Liquid Glass (`HeroBalance`)
- **Contenedor Deslizable Snap Horizontal**:
  - `flex items-stretch overflow-x-auto snap-x snap-mandatory no-scrollbar scroll-smooth w-full transform-gpu`.
  - Aceleración por hardware para deslizamiento táctil a 60/120 fps en iOS y Android.
  - Cada tarjeta ocupa el ancho completo `w-full shrink-0 snap-center flex flex-col`.
  - **Paridad Dimensional Estricta**: Todas las tarjetas (Slide 0 consolidado y Slides 1..N individuales) implementan `h-full flex flex-col justify-between flex-1 min-h-[240px] p-5 sm:p-6`, eliminando saltos de altura y desajustes de fondo entre diapositivas.
- **Estructura de Diapositivas**:
  - **Slide 0**: Tarjeta Consolidada ("Patrimonio Neto Total" o Pilar Activo) con luz cenital especular y submétricas dinámicas en cuadrícula simétrica de 2 columnas con 3 líneas por celda.
  - **Slides 1..N**: Tarjetas individuales de cada `SourceAccount` con logotipo oficial bancario o billetera (`SourceAvatar`), nombre de cuenta, balance neto específico y métricas de actividad (movimientos vinculados y balance inicial).
- **Indicador de Paginación en Esquina Inferior Derecha**:
  - Ubicado en la esquina inferior derecha de cada tarjeta en una fila de pie alineada al extremo: `flex items-center justify-end mt-2.5`.
  - Cápsula Liquid Glass: `rounded-full bg-white/[0.08] border border-white/10 backdrop-blur-md px-2 py-0.5`.
  - Cápsula inactiva: esfera sutil de 6px `w-1.5 h-1.5 bg-white/30 hover:bg-white/50`.
  - Cápsula activa: píldora expandida con resplandor neón `w-4 h-1.5 bg-gradient-to-r from-indigo-400 to-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.8)]`.

### 18. Avatar Oficial de Fuente Financiera (`SourceAvatar`)
- **Resolución Vectorial Multi-CDN de Logotipos Bancarios**:
  - Mapeo automático de entidades españolas e internacionales (BBVA, Santander, Revolut, CaixaBank, Sabadell, ING, N26, Openbank, Bankinter, Wise, Trade Republic, MyInvestor) con cascada HD vector/SVG libre de bordes blancos.
  - Cuentas de tipo `cash` (Efectivo): Glifo Lucide `Wallet` esmeralda sobre cristal translúcido `bg-emerald-500/10 border-emerald-500/25 text-emerald-400`.
  - Fallback bancario: Glifo `Landmark` con el color corporativo asignado a la cuenta.

### 19. Selector y Gestor de Fuentes (`GlassSelect`, `SourceAccountManager`)
- **Selector Desplegable Líquido (`GlassSelect`)**:
  - Menú modal/dropdown con desenfoque de fondo `backdrop-blur-2xl bg-[#0E1526]/95 border border-white/15`.
  - Opciones enriquecidas con `SourceAvatar` de entidad, nombre de cuenta y subtítulo (`Banco` o `Efectivo`).
- **Gestor de Cuentas en Perfil (`SourceAccountManager`)**:
  - Título depurado y unificado a **"Mis Fuentes"**.
  - Tarjetas compactas con botones de reordenación ordinal arriba/abajo, avatar oficial y saldo neto (eliminado el indicador de cantidad de movimientos para mantener máxima limpieza visual).
  - **Aislamiento en Portal DOM (`createPortal`)**: Modales de alta/edición y confirmación de borrado montados directamente en `document.body` con capa `z-[100]` y `bg-slate-950/80 backdrop-blur-xl`, garantizando que la sección del PIN de seguridad y elementos del perfil queden estrictamente por debajo sin superposiciones ni colisiones de apilamiento CSS.

### 20. Modal de Onboarding de Primera Fuente (`InitialSourceModal`)
- **Contención Vertical Dinámica (`max-h-[92dvh] overflow-y-auto`)**:
  - Contenedor con soporte dinámico de viewport móvil (`max-h-[92dvh]`) y desplazamiento con inercia sin scrollbar visible (`no-scrollbar`), previniendo desbordamientos verticales en pantallas de teléfonos móviles (como el Honor Magic 6 Pro con barras de navegación activas) cuando se selecciona "Cuenta Bancaria" y emergen campos adicionales de entidad y botones de selección rápida.
  - Ajuste ergonómico en proporciones de icono central, textos, inputs compactados y botón de envío principal siempre visible y accesible.

### 21. Reglas Anti-Solapamiento y Sistema de Alto Contraste en Modo Claro
- **Normas de Disposición Tipográfica Anti-Solapamiento**:
  - **Flexbox Bounded Children**: Todo bloque con hijos dinámicos adyacentes a botones de acción, iconos o importes monetarios debe implementar `min-w-0 flex-1 mr-2` en el contenedor de texto.
  - **Truncado Asistido**: Propiedad `truncate block` en títulos, conceptos, nombres de fuentes bancarias y etiquetas de categorías para asegurar un recorte limpio con puntos suspensivos sin empujar ni deformar componentes vecinos en resoluciones ultraestrechas (<380px).
  - **Inmutabilidad de Importes Numéricos**: Todos los valores de moneda, porcentajes y fechas relativas en el extremo derecho incorporan `flex-shrink-0 whitespace-nowrap text-right`, garantizando que jamás se dividan en múltiples líneas ni sean solapados por textos largos.
- **Mapeo Universal de Contraste en Modo Claro (`src/index.css`)**:
  - **Superficies Ahumadas Invertidas**: Elementos con `bg-slate-800/60`, `bg-slate-800/80`, `bg-slate-900/85`, `bg-slate-900/95` y `bg-slate-900` se transforman en cristal blanco perla (`rgba(255, 255, 255, 0.92-0.95)` con borde `rgba(203, 213, 225, 0.85)` y sombra suave `rgba(15, 23, 42, 0.08)`), eliminando parches oscuros y evitando texto oscuro sobre fondo oscuro en el botón de perfil o modal de ajustes.
  - **Colores Semánticos Pilares Calibrados (WCAG AA/AAA > 5.5:1)**:
    - *Ingresos*: `.text-emerald-400`, `.text-emerald-500` -> `#047857` (Emerald 700).
    - *Gastos*: `.text-rose-400`, `.text-rose-500` -> `#BE123C` (Rose 700).
    - *Inversión*: `.text-indigo-400`, `.text-indigo-500` -> `#4338CA` (Indigo 700).
    - *Avisos / Alertas*: `.text-amber-400`, `.text-amber-500` -> `#B45309` (Amber 700).
    - *Secundarios*: `.text-blue-400` -> `#1D4ED8`, `.text-purple-400` -> `#6D28D9`, `.text-teal-400` -> `#0F766E`.
  - **Fondos de Insignias y Píldoras**: Mapeo sistemático de `[class*="bg-*-500/10"]`, `/15`, `/20` y `/25` a fondos tintados legibles con bordes a juego (`rgba(..., 0.12-0.14)`).
  - **Filtro de Resplandores Neón**: Neutralización de `drop-shadow-[0_0_...]` en modo claro (`filter: none !important`), evitando que las sombras de halo oscuro manchen la tipografía sobre fondos blancos o perlados.
  - **Indicadores de Diapositiva (`HeroBalance`)**: Cápsula exterior `light:bg-slate-200/80 light:border-slate-300` y puntos inactivos `light:bg-slate-400/50 hover:light:bg-slate-600/70` con contraste óptimo en modo claro.

### 22. Control Segmentado Liquid Glass (`Segmented Control`)
- **Aplicación**: Conmutadores de modo en formularios, como el selector de entrada de inversiones (Importe Total vs Número de Títulos) en [`QuickAddTransactionModal.tsx`](file:///c:/Users/santi/Documents/UNI/Fluo/src/components/forms/QuickAddTransactionModal.tsx).
- **Riel / Contenedor Base**:
  - `p-1 rounded-2xl bg-white/[0.04] light:bg-slate-100 border border-white/10 light:border-slate-200 grid grid-cols-2 gap-1 backdrop-blur-xl`.
- **Segmento Activo**:
  - `bg-indigo-500/25 light:bg-indigo-50 border border-indigo-400/40 light:border-indigo-300 text-indigo-200 light:text-indigo-700 shadow-[0_2px_12px_rgba(99,102,241,0.2)] font-semibold transition-all duration-200`.
- **Segmento Inactivo**:
  - `text-slate-400 light:text-slate-500 hover:text-white light:hover:text-slate-900 hover:bg-white/[0.04] light:hover:bg-slate-200/60 border border-transparent font-medium transition-all duration-200`.
- **Iconografía**: Glifo representativo del modo (`DollarSign` para total monetario, `Hash` para títulos numéricos) a la izquierda de la etiqueta.

### 23. Calibración Óptica de Sombras y Paridad con Estadísticas (`HeroBalance` & `AnalyticsView`)
- **Evaluación Causa Raíz de las Sombras Cuadradas**:
  1. **Regla invasiva en CSS Global**: `index.css` forzaba `box-shadow: 0 12px 32px -4px rgba(15,23,42,0.08) !important` sobre cualquier selector que contuviera `bg-white/[0.08]`. El desplazamiento vertical desmedido de 12px proyectaba una base oscura muy pronunciada.
  2. **Recorte Rectangular por Desbordamiento (`overflow-x: auto`)**: Por especificación del W3C, un contenedor con desplazamiento horizontal establece automáticamente una caja de recorte (*clipping boundary*) en ambos ejes. Con un padding vertical insuficiente (`py-3.5` = 14px), la sombra difusa de 32px se truncaba en una línea horizontal plana en la parte inferior y líneas rectas a los lados, creando la silueta de un rectángulo o cuadrado.
  3. **Capa GPU Aislada (`transform-gpu`)**: Forzaba la rasterización del contenedor en una textura fija, haciendo que los bordes de recorte de la sombra fueran cortantes en lugar de degradarse suavemente.
  4. **Contraste con Estadísticas (`AnalyticsView`)**: En `AnalyticsView`, la tarjeta no está dentro de un contenedor `overflow`, usa `bg-slate-900/60 light:bg-white/85` y su sombra es `shadow-[0_8px_32px_0_rgba(0,0,0,0.37)] light:shadow-[0_8px_24px_rgba(15,23,42,0.08)]`, permitiendo que el desenfoque redondeado siga orgánicamente el contorno de `rounded-3xl`.
- **Solución y Paridad Absoluta con `AnalyticsView`**:
  - **Superficie y Borde**: Homogeneizado a `bg-slate-900/60 light:bg-white/85 backdrop-blur-2xl border border-white/15 light:border-slate-300/80` (con variantes semánticas según pilar).
  - **Sombra Suave No Invasiva**: `shadow-[0_8px_32px_0_rgba(0,0,0,0.37)] light:shadow-[0_8px_24px_rgba(15,23,42,0.08)]`.
  - **Margen de Difusión Óptico**: `py-6 -my-6` en el contenedor `scrollRef` (24px de respiro vertical) sin `transform-gpu`, garantizando que la sombra de 24px de radio decaiga hasta opacidad 0 antes de tocar cualquier límite de recorte.
  - **Centrado Perfecto y Diapositivas Simétricas**: Cada diapositiva utiliza `w-full shrink-0 snap-center`, garantizando que la tarjeta activa quede 100% centrada en pantalla en cualquier resolución móvil o escritorio, alineada con el resto de componentes del dashboard.

### 23.1. Barra de Navegación Flotante en Modo Claro (`FloatingNavbar`)
- **Dock Flotante Liquid Glass Perlado**:
  - En modo claro, la barra de navegación flotante [`FloatingNavbar.tsx`](file:///c:/Users/santi/Documents/UNI/Fluo/src/components/layout/FloatingNavbar.tsx) implementa el material vítreo translúcido de alta gama:
    - Sustrato: `background-color: rgba(255, 255, 255, 0.48) !important;` con `backdrop-filter: blur(28px) saturate(210%)`.
    - Borde especular: `border-color: rgba(255, 255, 255, 0.8)` con resalte interior `inset 0 1.5px 1px 0 #FFFFFF` y destello superior `light:via-white/90`.
    - Sombras suaves multicapa: `0 16px 40px -8px rgba(15, 23, 42, 0.12), 0 4px 12px -2px rgba(15, 23, 42, 0.06)`.
    - Aura atmosférica subsuperficial: `light:bg-indigo-500/25 blur-xl`.
- **Pestañas y Acciones Interiores**:
  - Pestaña activa: Única con recuadro y cáustica vítrea perlada `light:text-indigo-600 light:bg-white/75 border light:border-white shadow-[0_2px_8px_rgba(15,23,42,0.07),inset_0_1px_1px_rgba(255,255,255,0.9)] font-bold`.
  - Pestañas inactivas: Estrictamente transparentes (`background-color: transparent !important; border-color: transparent !important; box-shadow: none !important`), sin recuadro ni contorno hasta que el cursor interactúa (`light:text-slate-600 light:hover:text-slate-900 light:hover:bg-white/40`).
  - Botón de Acción (+): Joya translúcida degradada con sombra de acento índigo `light:shadow-[0_4px_16px_rgba(99,102,241,0.45),inset_0_1px_1px_rgba(255,255,255,0.6)]` y bisel `light:border-white/40`.

### 23.2. Aislamiento Estricto de Selectores de Modo y Pestañas Segmentadas
- **Eliminación de Conflictos de Subcadena en CSS**:
  - Los selectores comodín `[class*="bg-white/[0.0X]"]` colisionaban con pseudo-clases `hover:bg-white/[0.0X]` de elementos inactivos, provocando que botones no seleccionados (en barra flotante y selector de tema en ajustes) quedaran envueltos permanentemente en recuadros blancos.
  - Se sustituyeron por selectores exactos de clase `.bg-white\/\[0\.0X\]` y selectores de palabra completa `[class~="bg-white/[0.0X]"]`, blindando los estados de reposo.
  - Regla de salvaguarda universal para botones no activos en modo claro: `html.light button.border-transparent:not([class*="light:bg-white"]):not([class*="bg-white"]):not(:hover)`, garantizando que únicamente la opción seleccionada proyecte un recuadro elevado.

### 24. Identidad y Nombre de Usuario Limpio
- **Extracción de Nombre de Usuario**: Para usuarios registrados con cuenta de correo (`xxx@dominio.com`), la interfaz extrae y presenta prioritariamente el alias principal `user.email.split('@')[0]` (`xxx`) como nombre de cabecera en [`ProfileSettingsModal.tsx`](file:///c:/Users/santi/Documents/UNI/Fluo/src/components/profile/ProfileSettingsModal.tsx) y en el tooltip del botón de perfil en [`App.tsx`](file:///c:/Users/santi/Documents/UNI/Fluo/src/App.tsx), manteniendo la dirección de correo completa en tipografía secundaria (`text-xs text-slate-400 light:text-slate-500`).

### 25. Acciones y Limpieza de Fuentes Financieras (`SourceAccountManager`)
- **Presentación Minimalista de Título**:
  - Eliminación de la etiqueta redundante "Banco" / "Efectivo" en cada fila, conservando únicamente el nombre de la cuenta (`source.name`) para una jerarquía tipográfica mucho más limpia y despejada.
- **Flechas de Prioridad (Subir / Bajar)**:
  - Cápsulas Liquid Glass táctiles (`p-1.5 rounded-lg bg-white/[0.08] light:bg-slate-100 border border-white/15 light:border-slate-300`).
  - Iconos `ChevronUp` y `ChevronDown` reforzados a `h-3.5 w-3.5 stroke-[2.5]` en `text-slate-200 light:text-slate-700 hover:light:text-indigo-600` para visibilidad inmediata tanto en fondos claros como oscuros.
- **Botón de Eliminación (Papelera)**:
  - Cápsula prominente en rojo coral `p-2 rounded-xl bg-rose-500/20 light:bg-rose-50 hover:bg-rose-500/30 light:hover:bg-rose-100 border border-rose-500/40 light:border-rose-300 text-rose-400 light:text-rose-600 shadow-[0_0_12px_rgba(244,63,94,0.15)] light:shadow-sm`.
  - Icono `Trash2` con trazo `stroke-[2.2]`, resolviendo la falta de contraste sobre sustratos de cristal claro.

### 26. Supresión Universal de Barras de Desplazamiento (`.no-scrollbar`)
- **Regla Global en `src/index.css`**:
  - Implementación de la utilidad `.no-scrollbar` y `[class*="no-scrollbar"]` con soporte cruzado total:
    - WebKit (Chrome, Safari, iOS, Opera, Edge): `::-webkit-scrollbar { display: none !important; width: 0 !important; height: 0 !important; }`.
    - Firefox: `scrollbar-width: none !important;`.
    - Internet Explorer / Edge clásico: `-ms-overflow-style: none !important;`.
  - Elimina las barras de desplazamiento antiestéticas en carruseles horizontales, modales y listas de chips sin impedir el gesto de desplazamiento táctil ni la interacción de rueda con inercia.

---

## 4. Microinteracciones y Haptic Feedback Visual

- **Active State**: Cada botón o tarjeta interactiva implementa `active:scale-[0.97]` con curva suave `cubic-bezier(0.16, 1, 0.3, 1)`.
- **Luces Ambientales**: Tres orbes difusos de color en el fondo (`blur-3xl`) se sitúan detrás de la capa de interfaz, permitiendo que el efecto de cristal cobre vida al hacer scroll y refractar diferentes colores.

---

## 5. Paradigmas de Interacción: Táctil (Móvil) vs. Determinista (Desktop)

Fluo mantiene dos paradigmas de interacción diferenciados por breakpoint. El breakpoint frontera es `lg` (≥ 1024px).

### 5.1. Móvil / Tablet (`< lg`) — Gestos Táctiles

| Patrón | Implementación | Componentes |
| :--- | :--- | :--- |
| **Carrusel deslizable** | `overflow-x-auto snap-x snap-mandatory no-scrollbar` + dots de paginación | `HeroBalance.tsx` |
| **Swipe para eliminar** | Touch handlers (`touchstart/move/end`) + umbral -80px | `SwipeableTransactionItem.tsx` |
| **Swipe para editar** | Touch handlers + umbral +80px | `SwipeableTransactionItem.tsx` |
| **Scroll horizontal de pills** | `overflow-x-auto no-scrollbar` con `flex-shrink-0` en cada pill | `RecentTransactionsList`, `InvestmentsView`, `AnalyticsView` |
| **Scroll horizontal de cards** | `overflow-x-auto flex gap-2.5 no-scrollbar` | `RecurrenceSummaryWidget.tsx` |

### 5.2. Desktop / PC (`≥ lg`) — Clic, Hover y Teclado

| Patrón | Implementación | Componentes |
| :--- | :--- | :--- |
| **Bandeja estática paralela de fuentes** | `grid grid-cols-2 xl:grid-cols-3 gap-4 mt-4` con clic directo para seleccionar/deseleccionar | `HeroBalance.tsx` |
| **Tarjeta de patrimonio neto** | Tarjeta completa ocupando todo el ancho de la columna principal | `HeroBalance.tsx` |
| **Dock flotante centrado** | Barra Liquid Glass fija centrada horizontalmente `max-w-xl mx-auto px-6 py-2.5 rounded-full` con estados `:hover` sutiles | `FloatingNavbar.tsx` |
| **Header superior completo** | Barra superior expandida `max-w-7xl mx-auto px-8 py-6` con wordmark y perfil/PIN/sync | `App.tsx` |
| **Eliminar / Editar por hover/clic** | `lg:opacity-60 lg:group-hover:opacity-100` y clic directo para editar | `SwipeableTransactionItem.tsx` |
| **Filtros wrap sin scroll** | `lg:overflow-x-visible lg:flex-wrap` | `RecentTransactionsList`, `InvestmentsView`, `AnalyticsView`, `RecurrenceSummaryWidget` |
| **Cursor** | `cursor-pointer` (estrictamente prohibido `cursor-grab`) | Todos los componentes de lista e interacción |
| **Navegación teclado** | `Escape` para cerrar modales, `Tab` para navegación de foco, `Enter` para confirmar | Modales Liquid Glass |
| **Widgets de Columna Secundaria** | Cartera de inversiones y Presupuestos activos en cuadrícula fija | `DesktopInvestmentWidget.tsx`, `DesktopBudgetsWidget.tsx` |

### 5.3. Reglas Obligatorias

1. **Nunca usar `cursor-grab` o `active:cursor-grabbing` en desktop.** Los elementos deslizables en móvil deben ser interacciones táctiles exclusivas; el cursor de ratón siempre debe ser `pointer`.
2. **Nunca ocultar opciones de acción detrás de swipe en desktop.** Toda acción debe ser accesible por clic directo en estado visible o por hover (`group-hover:opacity-100`).
3. **`overflow-x-auto` sin barra visible es un antipatrón de UX en desktop.** Siempre complementar con `lg:overflow-x-visible lg:flex-wrap` para que el ratón pueda acceder a todos los elementos sin arrastrar.
4. **Tooltips y detalles de gráficos se activan con `mouseover/hover`** en recharts — no requieren clics mantenidos ni arrastres.
5. **Todos los modales deben soportar tecla `Escape` y clic fuera del diálogo** para su cierre inmediato en escritorio.

---

## 27. Especificaciones Liquid Glass para Pantallas Grandes (Desktop / PC ≥ 1024px)

### 27.1. Dock Flotante Centrado Estilo Apple Candy (`FloatingNavbar`)
- **Geometría y Posicionamiento**:
  - `fixed bottom-4 lg:bottom-6 inset-x-4 max-w-sm lg:max-w-xl mx-auto z-50 p-1.5 lg:px-5 lg:py-2 rounded-full select-none`
  - **Aura Atmosférica Iris Sutil**: Gradiente difuso contenido `bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-indigo-500/10 light:bg-indigo-500/15` con desenfoque suave `blur-xl` que aporta una luminiscencia cromática limpia y sin sobrecargar.
  - **Sustrato Cristalino Calibrado**: `bg-slate-900/55 lg:bg-slate-900/65 light:bg-white/55 backdrop-blur-2xl lg:backdrop-blur-3xl backdrop-saturate-150 border border-white/15 lg:border-white/20 light:border-white/80`.
  - **Sombra y Relieve Vítreo Continuo**: `shadow-[inset_0_1px_0_0_rgba(255,255,255,0.2),0_16px_36px_-8px_rgba(0,0,0,0.5)]` y en modo claro `light:shadow-[inset_0_1px_1px_0_rgba(255,255,255,0.9),0_12px_32px_-8px_rgba(15,23,42,0.12)]`.
  - **Refracción Continua Interior**: Sheen uniforme `bg-gradient-to-b from-white/[0.04] light:from-white/20 via-transparent to-transparent` sobre todo el arco orgánico `rounded-full`, eliminando líneas cáusticas planas `h-px` que generaban recortes angulares en los bordes.
  - **Pastilla Activa Translúcida de Borde Limpio**: Superficie nítida `bg-white/12 light:bg-white/80 border border-white/20 light:border-white/90 shadow-[inset_0_1px_0_rgba(255,255,255,0.25),0_2px_8px_rgba(0,0,0,0.25)]`. Erradicación de `backdrop-blur-md` anidado y hairlines internas desalineadas que causaban dobles bordes y halos oscuros en Chromium.
  - **Botón Joya de Acción (+)**: Degradado refinado `from-indigo-500/95 via-indigo-600/90 to-emerald-500/80 text-white`, contorno limpio `border-white/25 light:border-white/40` y resplandor controlado `shadow-[0_4px_14px_rgba(99,102,241,0.35),inset_0_1px_0_rgba(255,255,255,0.45)]` sin lentes flotantes disonantes.
  - **Micro-interacción**: Giro de 90° con transición elástica en hover del icono `+`, hover sutil en pestañas inactivas (`hover:bg-white/[0.05]` / `light:hover:bg-white/40`) y respuesta háptica `active:scale-95`.

### 27.2. Bandeja de Fuentes en Paralelo (`HeroBalance`)
- **Sustitución del Carrusel**:
  - En lugar de forzar el arrastre con ratón sobre el carrusel táctil, en escritorio se presentan todas las cuentas registradas en una cuadrícula estática: `grid grid-cols-2 xl:grid-cols-3 gap-4 mt-4`.
  - Cada tarjeta individual muestra:
    - Avatar vítreo de la entidad (`SourceAvatar`).
    - Nombre de la fuente y etiqueta de tipo (`Banco` / `Efectivo`).
    - Saldo formateado en tipografía semibold destacada.
    - Indicador de estado activo con anillo refractivo índigo (`ring-2 ring-indigo-500/50 bg-white/[0.09]`) al hacer clic directo.
    - Botón para restablecer la vista al patrimonio consolidado cuando una fuente específica está seleccionada.

### 27.3. Columna Secundaria de Widgets (4 de 12 Columnas en Home)
- **Cartera de Inversiones (`DesktopInvestmentWidget`)**:
  - Tarjeta Liquid Glass (`p-5 rounded-3xl bg-white/[0.05] backdrop-blur-2xl border border-white/10 shadow-xl`).
  - Muestra valor actual de mercado, capital total invertido y rentabilidad no realizada (€ y %).
  - Listado de principales activos en cartera con insignia de tipo de activo y acceso directo a la pestaña `/invest`.
- **Presupuestos Activos (`DesktopBudgetsWidget`)**:
  - Tarjeta Liquid Glass con desglose de gasto del mes por categorías principales.
  - Barras de progreso visuales con color de categoría y porcentaje respecto al gasto acumulado total.
- **Próximos Pagos y Cobros (`RecurrenceSummaryWidget`)**:
  - Tarjetas de compromisos periódicos accesibles y cancelables con un solo clic.

### 27.4. Modales Flotantes en PC (`QuickAddTransactionModal`, `ProfileSettingsModal`, `TimeSimulatorModal`)
- **Contenedor y Capa de Enfoque**:
  - Tarjeta flotante centrada: `max-w-lg w-full bg-slate-950/80 backdrop-blur-3xl border border-white/15 rounded-3xl p-8 shadow-2xl`.
  - Capa de fondo oscura con desenfoque profundo: `bg-slate-950/80 backdrop-blur-3xl`.
  - Cierre universal: Listener global para tecla `Escape` y evento `onClick` sobre el backdrop (con detención de propagación en la tarjeta).
  - Selectores internos desplegables mediante clic directo (`GlassSelect`) o pastillas flexibles con ajuste de línea (`flex-wrap gap-2`), erradicando cualquier contenedor con scroll horizontal forzado.

---

## 28. Componentes Visuales de Inversión y Gestualidad Táctil

### 28.1. Tarjeta Consolidada de Índice (`AssetCard` en `InvestmentsView`)
- **Estructura Visual**:
  - `group relative p-4 rounded-3xl bg-white/[0.05] hover:bg-white/[0.08] backdrop-blur-xl border border-white/10 hover:border-white/20 transition-all duration-200 shadow-lg`
  - Cabecera: Nombre del activo, píldora con identificador/ISIN, etiqueta de tipo (`AssetType`) y valoración de mercado con badge dinámico de P&L (`bg-emerald-500/15` o `bg-rose-500/15`).
  - Fila inferior: Importe invertido consolidado, desglose de participaciones a 6 decimales, cotización viva y botones de acción rápida.
  - Insignia de aportaciones múltiples: `px-1.5 py-0.5 rounded-full bg-indigo-500/20 border border-indigo-500/30 text-[10px] font-bold text-indigo-300` cuando existen múltiples entradas al mismo índice.

### 28.2. Desglose Expansible de Aportaciones
- **Cajón Acordeón Liquid Glass**:
  - Al hacer clic en la tarjeta o en el chevron indicador, se despliega con animación suave `animate-fadeIn` el listado de aportaciones (`getTransactionsForAsset`).
  - Cada apunte se presenta en una cápsula vítrea `p-2.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10`.
  - Incluye icono de dirección (compra `ArrowUpRight` en índigo, retirada `ArrowDownRight` en esmeralda), fecha formateada, concepto, cuenta de origen (o badge `Fondos externos`) e importe, con indicación hover para editar.

### 28.3. Gestualidad Táctil Bidireccional (Swipe)
- **Capa Deslizable con Resistencia Elástica**:
  - **Swipe Derecho (> 80px - Editar)**: Revela capa vítrea índigo `bg-indigo-600/90 text-white backdrop-blur-xl` con icono `Pencil` y texto *"Soltar para editar"*.
  - **Swipe Izquierdo (< -80px - Retirar)**: Revela capa vítrea esmeralda `bg-emerald-600/90 text-white backdrop-blur-xl` con icono `ArrowDownRight` y texto *"Soltar para retirar"*.
  - Sin botón de papelera/borrado: La eliminación directa no está disponible para proteger la integridad de las aportaciones.

### 28.4. Modal de Retirada (`WithdrawInvestmentModal`)
- Contenedor vítreo `max-w-lg rounded-3xl bg-[#0F172A]/90 backdrop-blur-2xl border border-white/20 p-6 shadow-2xl`.
- Selector numérico destacado en euros con chips de porcentaje rápido (25%, 50%, 75%, 100% liquidación total).
- Desglose predictivo de títulos a liquidar y posición restante.
- Selector Liquid Glass de cuenta destino (`GlassSelect`) y fecha de operación.

---

## 29. Interfaz Adaptativa de Traspasos Liquid Glass (`QuickAddTransactionModal`)

Para transferir fondos entre cuentas bancarias o billetera de efectivo de forma fluida e intuitiva, el modal de creación de movimientos implementa una interfaz adaptativa condicional:

### 29.1. Conmutación Reactiva
- En el panel de gasto (`pillar === 'expense'`), al seleccionar la categoría **Traspaso** (`cat-transfer`, icono `ArrowLeftRight`, color índigo neón `#6366F1`), la interfaz se transforma automáticamente:
  - Se sustituye el buscador de marcas comerciales (`BrandPicker`) por selectores duales de cuentas.
  - El campo de concepto se convierte en opcional con placeholder contextual auto-generado (`Ej. Traspaso a [Destino] (opcional)`).
  - El botón de acción principal adopta la leyenda *"Confirmar Traspaso"* con el glifo vectorial `ArrowLeftRight`.

### 29.2. Tarjeta Visual de Flujo Monetario Liquid Glass
- Contenedor orgánico `bg-indigo-500/10 light:bg-indigo-50/70 border border-indigo-500/20 light:border-indigo-200/80 backdrop-blur-xl rounded-2xl p-4 shadow-[0_8px_32px_0_rgba(99,102,241,0.15)] animate-fadeIn`.
- **Cabecera**: Pastilla índigo con `ArrowLeftRight`, título y subtítulo explicativo de neutralidad patrimonial (*"El saldo se mueve sin alterar tu patrimonio total"*).
- **Visualizador de Transferencia**: Despliega un carril de balance horizontal con:
  - Extremo izquierdo: Avatar de origen (`SourceAvatar`) y nombre de la cuenta o billetera de salida.
  - Centro: Pastilla circular flotante `w-7 h-7 rounded-full bg-indigo-500/20 border border-indigo-400/40 text-indigo-300` con flecha direccional `ArrowRight` y badge con el importe en euros.
  - Extremo derecho: Avatar de destino (`SourceAvatar`) y nombre de la cuenta bancaria o billetera de efectivo receptora.

### 29.3. Selectores Integrados en la Tarjeta (*In-Place Pickers*)
- **Erradicación de Desplegables Redundantes**: Se suprimen los desplegables inferiores independientes; la propia tarjeta visual actúa como interfaz de selección táctil interactiva.
- **Botón "Desde"**: Botón vítreo interactivo con avatar, etiqueta, nombre de la cuenta y chevron. Al pulsar, abre un cajón Liquid Glass desplegable integrado que lista todas las cuentas y billeteras disponibles.
- **Botón "Hacia"**: Botón simétrico en el extremo derecho. Al pulsar, despliega únicamente las cuentas receptoras válidas con exclusión reactiva (`s.id !== selectedSourceId`).
- **Botón Central de Swap**: Pastilla circular central con flecha que permite permutar origen y destino con un solo toque.
- **Protección de Cuenta Única**: Si el usuario cuenta con una sola fuente registrada, la tarjeta muestra una alerta ámbar Liquid Glass (`bg-amber-500/10 border-amber-500/25 text-amber-300`) inhabilitando la apertura de selectores y la confirmación hasta disponer de dos o más fuentes.


---

## 30. Aislamiento de Capas Modales (`createPortal`) y Jerarquía de Stacking (Z-Index)

Para evitar interferencias visuales y conflictos de apilamiento entre modales de acción y elementos flotantes persistentes (como el dock de navegación `FloatingNavbar`), el sistema implementa una jerarquía rigurosa de z-index combinada con aislamiento en el DOM:

### 30.1. Jerarquía de Apilamiento Global (Stacking Order)
| Capa Visual | Z-Index | Componentes |
| :--- | :--- | :--- |
| **Lienzo y Fondos** | `z-0` | Fondo obsidiana, orbes ambientales difusos (`blur-[150px]`) |
| **Contenido Principal** | `z-10` | Tarjetas maestras, carrusel de balance, listas de transacciones |
| **Desplegables en Tarjeta** | `z-20` - `z-40` | Selectores de filtros, menús contextuales en vistas |
| **Dock Flotante Inferior** | `z-50` | Barra de navegación flotante (`FloatingNavbar`) |
| **Modales & Overlays** | `z-[100]` | Modales de pantalla completa montados en `document.body` mediante `createPortal` |
| **Menús Dentro de Modales** | `z-50` (local) | Desplegables de `GlassSelect`, `BrandPicker` y autocompletado dentro del modal |

### 30.2. Aislamiento con `createPortal` en `document.body`
- **Problema Resuelto**: Cuando un modal se renderizaba dentro de vistas anidadas (por ejemplo, al editar una aportación específica en `InvestmentsView`), su árbol DOM quedaba encapsulado dentro de `<main>`. Dado que `FloatingNavbar` se renderizaba posteriormente en `App.tsx` con `z-50`, el dock flotante se superponía visualmente a la base del modal, ocultando el botón *"Guardar Cambios"*.
- **Solución Técnica**:
  - Todos los modales interactivos (`QuickAddTransactionModal`, `EditAssetModal`, `WithdrawInvestmentModal`, etc.) transportan su árbol al nivel raíz del DOM con `createPortal(modalContent, document.body)`.
  - Capa de telón de fondo (`backdrop`) con `z-[100] bg-black/80 backdrop-blur-md lg:backdrop-blur-3xl`, que atenúa y cubre visualmente la barra de navegación (`z-50`).
  - Margen inferior ergonómico (`pb-6 sm:pb-2`) en el contenedor del formulario para evitar que el botón de confirmación quede pegado al borde del dispositivo o bloqueado por barras del navegador móvil.


---

## 31. Vista Especializada de Cuentas Broker & Inversión (`InvestmentAccountView`)

El componente `InvestmentAccountView.tsx` traslada la experiencia de brokers de vanguardia (MyInvestor, Trade Republic, Scalable) al sistema de diseño Liquid Glass:

### 31.1. Tarjeta Maestra de Desglose Patrimonial
- **Cabecera**: Avatar de la entidad (`SourceAvatar`), nombre de la cuenta y badge de alta jerarquía `Broker & Inversión` con orbe pulsante índigo (`bg-indigo-400`).
- **Métricas Cuádruples**:
  1. *Patrimonio en Cuenta*: Tipografía extrabold con total consolidado (Efectivo + Cartera).
  2. *Capital Invertido*: Desembolso total en coste de adquisición.
  3. *Cuánto está dando*: Indicador semántico de rentabilidad con glifo dinámico `TrendingUp` o `TrendingDown` y color esmeralda (`text-emerald-400`) o coral (`text-rose-400`).
  4. *Efectivo Disponible*: Liquidez líquida no invertida lista para operar.
- **Barra de Distribución de Activos**: Carril vítreo con gradiente índigo-violeta para activos invertidos y esmeralda-turquesa para liquidez, con porcentajes dinámicos calibrados al 100%.

### 31.2. Selector de Pestañas Integrado
- Conmutador táctil `[ Mis Inversiones (N) ]` y `[ Traspasos y Movimientos (M) ]` con cápsulas Liquid Glass reactivas.

### 31.3. Tarjetas de Posición y Desglose de Aportaciones al Índice
- Cada activo asociado despliega su tarjeta Liquid Glass con ticker, títulos en custodia, cotización viva, valor total y rendimiento en euros y porcentaje.
- Al hacer clic en la posición o en el chevron indicador, despliega un cajón acordeón con el **historial de aportaciones realizadas a ese índice en dicha cuenta**, permitiendo visualizar y editar cada entrada con un solo toque.

### 31.4. Módulo de Analítica Especializada de Inversiones (`InvestmentAnalyticsView`)
El componente `InvestmentAnalyticsView.tsx` aplica el lenguaje Liquid Glass a las estadísticas de carteras de inversión:
- **Master Hero Card de Rendimiento**:
  - Sustrato `bg-gradient-to-br from-indigo-500/10 via-white/[0.04] to-emerald-500/10 backdrop-blur-2xl border border-white/15 rounded-3xl p-5 shadow-2xl`.
  - Muestra en posición estelar el badge *"Cuánto está dando"* con glifos vectoriales dinámicos `TrendingUp` / `TrendingDown`, colores semánticos (`text-emerald-400` / `text-rose-400`) y halo translúcido.
  - Submétricas de Liquidez, Capital Invertido y Aportaciones del periodo en pastillas vítreas `bg-white/[0.04] rounded-2xl p-3 border border-white/5`.
- **Selector Segmentado de 4 Vistas**:
  - Cápsula horizontal `flex items-center gap-1.5 p-1 rounded-2xl bg-white/[0.04] border border-white/10 backdrop-blur-xl`.
  - Pestañas con glifo Lucide y rótulo responsive:
    - *Distribución* (`PieChart`)
    - *Posiciones* (`Layers`)
    - *Flujo Mensual* (`BarChart3`)
    - *Evolución* (`TrendingUp`)
  - Estado activo con lente elevada `bg-indigo-500/25 text-indigo-300 border border-indigo-500/40 shadow-[0_2px_10px_rgba(99,102,241,0.2)]`.
- **Paleta Cromática de Clases de Activo (`ASSET_TYPE_CONFIG`)**:
  - `ETF`: `#6366F1` (Índigo neón)
  - `Fondo Indexado`: `#8B5CF6` (Violeta)
  - `Acción`: `#3B82F6` (Azul eléctrico)
  - `Criptomoneda`: `#F59E0B` (Ámbar)
  - `Renta Fija`: `#10B981` (Esmeralda)
  - `Depósito`: `#14B8A6` (Cerceta)
  - `Efectivo / Liquidez`: `#06B6D4` (Cian brillante)
- **Tarjeta de Diagnóstico de Salud y Liquidez**:
  - Contenedor con brillo tenue `bg-indigo-500/5 border border-indigo-500/15 rounded-2xl p-4`.
  - Evalúa *Cash Drag* frente a *Despliegue de Capital* mediante un medidor visual horizontal continuo y recomendaciones cuantitativas.

### 31.5. Componente Visual de Progresión Multi-Línea (`AssetProgressionLineChart`)
Traslada la experiencia de terminales financieras profesionales (Google Finance, TradingView) al lenguaje estético Liquid Glass:
- **Sustrato y Relieve Vítreo**:
  - Contenedor `bg-slate-900/60 light:bg-white/85 backdrop-blur-2xl border border-white/15 light:border-slate-300/80 p-5 rounded-3xl shadow-[0_8px_32px_0_rgba(0,0,0,0.37)]`.
  - Destello cenital especular: `pointer-events-none absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-white/50 to-transparent`.
- **Líneas Recharts Dinámicas**:
  - Curvas spline suaves `type="monotone"` con grosor óptico calibrado `strokeWidth={2.4}`.
  - Puntos de anclaje con bisel exterior translúcido `dot={{ r: 2.5 }}` y `activeDot={{ r: 5.5, stroke: '#fff', strokeWidth: 1.5 }}`.
  - Trazado vectorial independiente para cada activo activo, eliminando saturación visual mediante el selector de visibilidad.
- **Paleta Cromática de Progresión (`ASSET_PROGRESSION_PALETTE`)**:
  - Identidad garantizada: Bitcoin (`#F59E0B` Dorado), Ethereum (`#8B5CF6` Violeta neón), ETFs bursátiles principales (`#6366F1` Índigo).
  - Rotación armónica en 12 tonalidades contrastadas para carteras multiactivo.
- **Píldoras Interactivas de Control Táctil**:
  - Cada activo cuenta con una cápsula vítrea que indica su punto cromático, nombre, ticker, valoración en euros y badge de P&L.
  - Al pulsar sobre la cápsula: conmuta la visibilidad de su línea (activa/inactiva con atenuación óptica a `opacity-40`).
  - Botón de ojo (`Eye`): aísla esa posición para inspeccionar su línea de forma individual sin interferencia de otros activos.
- **Tooltip Vítreo de Precisión (`AssetProgressionTooltip`)**:
  - `rounded-2xl bg-[#0F1626]/95 light:bg-white/95 border border-white/20 p-3.5 shadow-2xl backdrop-blur-2xl`.
  - Ordena automáticamente las posiciones de mayor a menor valor en ese punto temporal y desglosa el sumatorio total en la cabecera.

### 31.6. Calibración Ergonómica de Barras Segmentadas y Pestañas Tipográficas
Para erradicar por completo truncados antiestéticos con puntos suspensivos (*"Aho...", "Cat...", "Me..."*) y amontonamiento en móviles:
- **Supresión de Iconos Redundantes**:
  - Los selectores de estadísticas adoptan un diseño puramente tipográfico estilo Apple Segmented Control. Al prescindir de glifos vectoriales que consumían ~20px por pestaña, cada rótulo dispone del 100% de su espacio natural.
- **Nombres Completos Garantizados (Sin Truncar)**:
  - Se eliminan las clases `truncate` y `min-w-0` forzadas.
  - Regla CSS estricta: `min-w-max whitespace-nowrap` en cada botón. Ninguna palabra es recortada con puntos suspensivos ("Ahorro", "Categorías", "Mensual", "Patrimonio", "Activos", "Distribución", "Posiciones", "Flujos", "Evolución").
- **Amplitud y Desplazamiento Fluido en Pantallas Estrechas**:
  - Contenedor con `overflow-x-auto scrollbar-none` y `gap-1 p-1`.
  - En smartphones de ancho estándar (≥390px), las pestañas se distribuyen equitativamente (`flex-1`). En dispositivos más estrechos (<380px), el contenedor permite un deslizamiento táctil horizontal sin deformar las palabras.

### 31.7. Contextualización Visual de Cuentas de Efectivo en Estadísticas
- **Ocultación Dinámica de Módulos Bursátiles**:
  - Al inspeccionar una cuenta de efectivo (`activeSource.type === 'cash'`), la pestaña *"Activos"* se retira de la barra segmentada móvil (`lg:hidden`).
  - El gráfico inferior a ancho completo `<AssetProgressionLineChart />` queda condicionado por `!isCashAccount`, evitando ruido visual con ETFs o criptomonedas ajenos al efectivo físico.
- **Transformación de Tarjeta de Evolución**:
  - La tarjeta de patrimonio adapta su titular a *"Evolución de Saldo en Efectivo"* y subtítulo a *"Saldo acumulado disponible en efectivo"*, mientras que el selector móvil muestra la píldora concisa *"Saldo"* en lugar de *"Patrimonio"*.

### 31.8. Calibración Óptica de Márgenes de Eje Y en Gráficos Móviles (`formatAxisCurrency`)
- **Erradicación de Recortes Laterales (Clipping por `overflow-hidden`)**:
  - Anteriormente, márgenes negativos como `margin={{ left: -20 }}` desplazaban las etiquetas del eje Y fuera del lienzo SVG, provocando que la tarjeta vítrea recortara el primer dígito en pantallas de smartphone estrechas (ej. *"63,9 mil €"* se leía truncado).
  - Se calibró `margin={{ top: 10, right: 10, left: 4, bottom: 0 }}` junto a `width={48}` y `tickMargin={4}` en `<YAxis />`, garantizando un colchón interior de 10-20px que impide cualquier recorte perimetral.
- **Formateador Compacto Especializado para Ejes (`formatAxisCurrency`)**:
  - Sustituye la notación extendida de `Intl` (`"mil €"`, 10 caracteres) por un estándar financiero conciso europeo (`"k€"` y `"M€"`, 4-5 caracteres: `500€`, `1,2k€`, `64k€`, `125k€`, `1M€`).
  - Reduce el ancho requerido por número en más del 55%, liberando espacio horizontal para las curvas de datos sin sacrificar legibilidad.

### 31.9. Erradicación del Warning de Dimensiones en Recharts (`width(0) and height(0)`)
- **Causa Raíz de Recharts en Contenedores Ocultos**:
  - Cuando Recharts (`ResponsiveContainer`) se monta dentro de un elemento con `display: none` (`hidden` en Tailwind), `ResizeObserver` registra dimensiones de $0 \times 0$ píxeles y emite una advertencia en la consola del navegador.
- **Renderizado Reactivo Condicional con Hook `useMediaQuery`**:
  - Se sustituyó la ocultación visual pasiva por CSS (`hidden lg:flex` y `lg:hidden`) por renderizado condicional desacoplado (`!isDesktop ? <MobileCharts /> : <DesktopCharts />`) gobernado por `useMediaQuery('(min-width: 1024px)')`.
  - Los gráficos de escritorio no se montan en el DOM si el usuario está en móvil, y viceversa, erradicando por completo el cálculo de contenedores con dimensiones cero y optimizando el rendimiento de renderizado en smartphones.
  - Se añadió la propiedad `minWidth={0}` a todos los componentes `<ResponsiveContainer />` para prevenir problemas de desbordamiento en contenedores flex/grid.

### 31.10. Calibración de Anchura Máxima y Canvas Horizontal en Gráficos Móviles
- **Optimización de Padding en Tarjetas Contenedoras**:
  - Para maximizar el ancho disponible del gráfico en pantallas de smartphone sin comprimir los elementos visuales, se sustituyó el padding uniforme `p-5` (20px por lado) por un padding asimétrico responsivo `px-3.5 sm:px-5 py-4 sm:py-5` en [`InvestmentAnalyticsView.tsx`](file:///c:/Users/santi/Documents/UNI/Fluo/src/components/analytics/InvestmentAnalyticsView.tsx) y [`AnalyticsView.tsx`](file:///c:/Users/santi/Documents/UNI/Fluo/src/components/analytics/AnalyticsView.tsx) (y `px-3 sm:px-5` en [`AssetProgressionLineChart.tsx`](file:///c:/Users/santi/Documents/UNI/Fluo/src/components/analytics/AssetProgressionLineChart.tsx)).
  - Esta reducción controlada gana instantáneamente entre 10px y 14px de anchura neta para el lienzo SVG.
- **Ajuste de Márgenes SVG de Recharts**:
  - Márgenes horizontales del gráfico reducidos a `margin={{ top: 10, right: 4, left: 0, bottom: 0 }}` (antes `right: 10, left: 4`).
- **Compactación del Eje Y**:
  - Gracias al formateador compacto `formatAxisCurrency` (que requiere típicamente solo 24-28px para cifras como `64k€` o `1,2k€`), el ancho reservado para el eje vertical se redujo de `width={48}` a `width={38} tickMargin={2}`.
- **Ganancia Neta Acumulada**:
  - Los gráficos obtienen más de 30px horizontales extra en pantallas móviles (~10-12% de incremento de superficie trazable), permitiendo curvas más suaves, mayor separación entre nodos de datos y una lectura notablemente más espaciosa sin recortes.

