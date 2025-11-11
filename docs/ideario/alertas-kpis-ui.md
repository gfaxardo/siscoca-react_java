<!-- Documento: Alertas, KPIs y bosquejo UI para Ideario -->

# Alertas, KPIs y propuesta de UI

Este documento compila las reglas de seguimiento clave, métricas y un bosquejo de experiencia de usuario para el módulo **Ideario**.

## Alertas y automatizaciones

| Alerta | Condición | Destinatarios | Acción sugerida |
| --- | --- | --- | --- |
| `PROMOCION_SIN_CAMPANA` | Promoción `LISTA_PARA_EJECUCION` sin campaña creada en 14 días. | Responsable de promoción, líder marketing. | Revisar recursos, agendar lanzamiento o descartar idea. |
| `IDEARIO_SIN_PROMOCIONES` | Ideario en `EN_EVALUACION` sin promociones nuevas en 7 días. | Responsable ideario, patrocinador. | Convocar nueva sesión de ideación. |
| `IDEARIO_ESTANCADO` | Ideario `PRIORIZADO` sin campaña nueva en 30 días. | Comité de marketing. | Repriorizar o cerrar ideario. |
| `CAMPANA_SIN_RESULTADOS` | Campaña vinculada sin cierre de KPIs tras 5 días de finalizada. | Owner campaña. | Cargar resultados o justificar retraso. |
| `HIPOTESIS_NO_VALIDADA` | Tres campañas consecutivas marcadas como `hipotesisValidada = false`. | Responsable promoción, patrocinador. | Revisar supuestos, considerar descarte. |

### Configuración técnica

- Persistir alertas en tabla `alerta_promocion` con campos: `tipo`, `entidadId`, `estado`, `fechaGeneracion`, `fechaResolucion`.
- Scheduler (Spring) para evaluar condiciones cada noche; alternativa: eventos desde triggers de base de datos.
- Integrar con módulo de notificaciones existente (email, in-app, Slack opcional).

## KPIs clave

| Métrica | Descripción | Fuente | Visualización |
| --- | --- | --- | --- |
| `Ratio idearios → campañas` | % de idearios que generan al menos una campaña. | Conteo en `Ideario` y `Campana`. | Tarjeta resumen + tendencia mensual. |
| `Tiempo de maduración` | Días desde creación de ideario hasta primera campaña lanzada. | Timestamps de `Ideario` y `Campana`. | Gráfico de cajas + promedio. |
| `Promociones activas` | Número en `LISTA_PARA_EJECUCION` sin campaña. | Tabla `Promocion`. | Indicador con color semafórico. |
| `Eficacia de promociones` | % de campañas con `hipotesisValidada = true` por promoción. | Tabla `Campana`. | Tabla ranking + sparkline. |
| `ROI esperado vs real` | Comparar KPIs esperados vs resultados reales por ideario. | Campo `kpisEsperados` vs KPIs de campañas. | Gráfico de barras dual o radar. |

Sugerencias:
- Integrar con dashboards existentes (`frontend/src/components/Campanas/MetricasGlobales.tsx`).
- Permitir filtros por ciudad, horizonte, responsable.

## Bosquejo de UI (panel Ideario)

### Vista general

```
┌────────────────────────────────────────────┐
│ Header: KPIs principales (tarjetas)        │
├────────────────────────────────────────────┤
│ Filtros: Estado, Ciudad, Horizonte, Score  │
├──────────────┬─────────────────────────────┤
│ Idearios     │ Detalle seleccionado         │
│ (Kanban o    │ - Resumen ideario            │
│  lista)      │ - KPIs esperados            │
│              │ - Alertas activas           │
│ [BORRADOR]   │ - Promociones (tabla)       │
│ [EVALUACION] │ - Botones: Nueva promoción, │
│ [PRIORIZADO] │   Crear campaña             │
│ [CERRADO]    │                             │
└──────────────┴─────────────────────────────┘
```

### Detalle promoción

```
┌───────────────────────────────┐
│ Header: Título + estado + ICE │
├───────────────────────────────┤
│ Brief                        │
│ Público objetivo             │
│ Canales sugeridos            │
│ Recursos / Presupuesto       │
├───────────────────────────────┤
│ Alertas activas              │
│ - Sin campaña (14d)          │
│ - Resultados pendientes      │
├───────────────────────────────┤
│ Campañas relacionadas        │
│ [Campaña Q4 Lima] KPI ✔      │
│ [Campaña Universidades] KPI ✖│
│ + Crear nueva campaña        │
└───────────────────────────────┘
```

### Interacciones clave

- **Crear ideario**: modal/formulario con campos básicos y opción de guardar como borrador.
- **Sesión de ideación**: vista colaborativa (comentarios en tiempo real opcional).
- **Puntuación ICE**: controles tipo sliders o inputs numéricos con ayuda contextual.
- **Alertas**: badge en tarjetas + panel lateral con listado, permitiendo marcar como resuelto o snooze.
- **Historial**: timeline con cambios de estado y decisiones, reutilizando componentes de `Audit/HistorialCambios`.

## Experiencia móvil

- Vista lista en móviles mostrando indicadores mínimos.
- Acciones principales accesibles mediante menú flotante (crear promoción, registrar comentario).

## Accesibilidad y UX

- Indicadores de estado con colores y texto (no solo color).
- Confirmaciones para cambios de estado críticos.
- Tooltips explicando métricas y scores.

## Próximos pasos de diseño

1. Validar con usuarios clave el tablero propuesto (workshop corto).
2. Crear wireframes de alta fidelidad en herramienta de diseño (Figma).
3. Derivar componentes reutilizables en `frontend/src/components` (cards, paneles).



