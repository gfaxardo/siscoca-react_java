# Estados de Campaña - Definición y Flujo

## 📊 Diagrama de Estados

```
┌─────────────┐
│  PENDIENTE  │ ← Nueva campaña creada
└──────┬──────┘
       │ Enviar Creativo (Trafficker)
       ▼
┌─────────────────────┐
│ CREATIVO_ENVIADO    │
└──────┬──────────────┘
       │ Activar Campaña (Dueño/Admin)
       ▼
┌─────────────┐
│   ACTIVA    │
└──────┬──────┘
       │
       ├─→ Subir Métricas Trafficker (Trafficker)
       │   - Alcance, Clics, Leads, Costo Semanal
       │
       └─→ Subir Métricas Dueño (Dueño)
           - Conductores Registrados, Primer Viaje
       │
       │ Archivar (Cuando ambas métricas están)
       ▼
┌─────────────┐
│ ARCHIVADA   │
└─────────────┘
       │
       └─→ Reactivar (Dueño/Admin) → ACTIVA
```

## 🔄 Flujo Detallado de Estados

### 1️⃣ **PENDIENTE** - "Pendiente"

**Descripción:** Estado inicial de la campaña recién creada.

**Responsable:** Trafficker

**Acciones Disponibles:**
- ✅ **Enviar Creativo** (Trafficker)
  - Subir archivo creativo a la campaña
  - Cambia a estado: **CREATIVO_ENVIADO**

**Siguiente Estado:** `CREATIVO_ENVIADO`

---

### 2️⃣ **CREATIVO_ENVIADO** - "Creativo Enviado"

**Descripción:** El creativo ha sido enviado y está pendiente de activación.

**Responsable:** Dueño/Admin

**Acciones Disponibles:**
- ✅ **Activar Campaña** (Dueño/Admin)
  - Marca la campaña como activa y lista para ejecutarse
  - Cambia a estado: **ACTIVA**
- ⬇️ **Descargar Creativo** (Cualquiera)
  - Si el creativo está disponible

**Siguiente Estado:** `ACTIVA`

---

### 3️⃣ **ACTIVA** - "Activa"

**Descripción:** La campaña está ejecutándose y recibiendo tráfico.

**Responsables:** **Trafficker** y **Dueño** (ambos)

**Acciones Disponibles:**

**Por parte del Trafficker:**
- 📊 **Subir Métricas Trafficker**
  - Alcance
  - Clics
  - Leads
  - Costo Semanal (USD)
  - URL del Informe

**Por parte del Dueño:**
- 👥 **Subir Métricas Dueño**
  - Conductores Registrados
  - Conductores Primer Viaje
  - (Se calculan automáticamente los costos por conductor)

**Otras acciones:**
- 📅 **Ver Histórico de Semanas** (Cualquiera)
- ⬇️ **Descargar Creativo** (Cualquiera)
- 📊 **Ver Métricas Globales** (Cualquiera)
- 📁 **Archivar Campaña** (Dueño/Admin)
  - Solo disponible cuando ambas métricas están completas
  - Guarda las métricas en histórico semanal
  - Cambia a estado: **ARCHIVADA**

**Siguiente Estado:** `ARCHIVADA` (cuando se completa el ciclo)

---

### 4️⃣ **ARCHIVADA** - "Archivada"

**Descripción:** La campaña ha sido archivada y sus métricas guardadas en histórico.

**Responsable:** Dueño/Admin

**Acciones Disponibles:**
- ♻️ **Reactivar Campaña** (Dueño/Admin)
  - Vuelve a poner la campaña en estado activo
  - Cambia a estado: **ACTIVA**
- 📅 **Ver Histórico de Semanas** (Cualquiera)
- ⬇️ **Descargar Creativo** (Cualquiera)

**Siguiente Estado:** `ACTIVA` (si se reactiva)

---

## 📋 Resumen de Responsabilidades

| Estado | Responsable Principal | Acción Principal | Siguiente Estado |
|--------|----------------------|------------------|------------------|
| **PENDIENTE** | Trafficker | Enviar Creativo | CREATIVO_ENVIADO |
| **CREATIVO_ENVIADO** | Dueño/Admin | Activar Campaña | ACTIVA |
| **ACTIVA** | Trafficker + Dueño | Subir Métricas | ARCHIVADA |
| **ARCHIVADA** | Dueño/Admin | Reactivar (opcional) | ACTIVA |

---

## 🔍 Características Técnicas

### Creación Automática de Histórico
- Cuando se suben métricas en estado **ACTIVA**, se guardan automáticamente en el histórico semanal
- El histórico se asocia con la **semana ISO anterior** a la actual
- Permite llevar un registro semanal de todas las campañas activas

### Validaciones
- Para **archivar** una campaña: requiere métricas del Trafficker Y del Dueño
- No se permiten valores negativos en las métricas
- El sistema calcula automáticamente:
  - Costo por Lead (costoSemanal / leads)
  - Costo por Conductor Registrado (costoSemanal / conductoresRegistrados)
  - Costo por Conductor Primer Viaje (costoSemanal / conductoresPrimerViaje)

### Persistencia
- Cada cambio de estado se registra con fecha y hora
- Se mantiene un log de auditoría de todos los cambios
- Las campañas archivadas pueden ser reactivadas en cualquier momento

---

## 📝 Notas Importantes

1. **Métricas Semanales:** El sistema está diseñado para actualizar métricas semanalmente
2. **Responsabilidad Dual:** En estado ACTIVA, tanto el Trafficker como el Dueño deben completar sus métricas
3. **Archivado Automático:** El archivado guarda las métricas en histórico antes de cambiar el estado
4. **Reactivable:** Las campañas archivadas pueden volver a estado ACTIVA si es necesario


