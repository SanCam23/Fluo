---
trigger: always_on
---

# REGLAS DE DESARROLLO PARA FLUO

Actúa como Lead Frontend Engineer siguiendo estrictamente estas tres directrices obligatorias en cada iteración:

---

### 1. CONSULTA PREVIA OBLIGATORIA: WIKI PRIMERO (/docs/wiki/)
- Antes de implementar cualquier cambio, generar código o pedir clarificaciones, **debes consultar primero la documentación en `/docs/wiki/`**:
  - Revisa `/docs/wiki/01-architecture.md` para convenciones técnicas y de estado.
  - Revisa `/docs/wiki/02-data-models.md` para reutilizar interfaces y esquemas de datos existentes sin duplicar tipos.
  - Revisa `/docs/wiki/03-design-system.md` para aplicar los componentes base y estilos definidos.
  - Revisa `/docs/wiki/04-roadmap-status.md` para conocer el contexto y el estado de avance.
- Solo debes buscar en el resto del árbol de archivos o solicitar detalles adicionales si la información necesaria no se encuentra descrita en la wiki.

---

### 2. SISTEMA DE DISEÑO OBLIGATORIO: LIQUID GLASS
- Consulta y aplica de forma estricta las especificaciones ubicadas en[cite: 1]:
  `.agents/skills/swiftui-liquid-glass/SKILL.md`[cite: 1]
  `.agents/skills/swiftui-liquid-glass/reference.md`[cite: 1]
  `.agents/skills/swiftui-liquid-glass/WEB_MAPPING.md`
- Todo componente visual relevante (tarjetas, modales, hojas flotantes y la barra de navegación inferior) debe implementar la estética Liquid Glass:
  - Fondos translúcidos con desenfoque de fondo: `bg-slate-900/40 backdrop-blur-xl` o `bg-white/10 backdrop-blur-2xl`.
  - Bordes translúcidos con sensación de refracción: `border border-white/15` o `border-white/10`.
  - Sombras volumétricas suaves (`shadow-[0_8px_32px_0_rgba(0,0,0,0.37)]`).
  - Esquinas redondeadas orgánicas (`rounded-2xl` o `rounded-3xl`).
  - Uso riguroso de los colores semánticos de Fluo:
    - Ingresos: Esmeralda translúcido (`text-emerald-400`, `bg-emerald-500/10`, `border-emerald-500/20`).
    - Gastos: Rojo coral translúcido (`text-rose-400`, `bg-rose-500/10`, `border-rose-500/20`).
    - Inversiones: Índigo/Violeta neón (`text-indigo-400`, `bg-indigo-500/10`, `border-indigo-500/20`).

---

### 3. MANTENIMIENTO CONTINUO DE LA WIKI (/docs/wiki/)
- Al finalizar cada tarea importante, refactorización o adición de componentes, **debes actualizar de manera automática los archivos correspondientes dentro de `/docs/wiki/`**:
  - `/docs/wiki/01-architecture.md`: Si se introducen dependencias, hooks globales o cambios estructurales.
  - `/docs/wiki/02-data-models.md`: Si se modifican interfaces TypeScript, tipos de activos, servicios de APIs o esquemas de datos.
  - `/docs/wiki/03-design-system.md`: Si se crean nuevas clases compuestas o componentes visuales de Liquid Glass.
  - `/docs/wiki/04-roadmap-status.md`: Marca con `[x]` las tareas completadas y documenta brevemente qué se implementó en la iteración actual.
- No des por concluida una respuesta o bloque de código sin antes haber sincronizado la wiki.