# ✅ Verificación de Migraciones

## 🔍 Qué verificar

### 1. Campo `iniciales` en tabla `usuarios`
- Debe existir la columna
- Los usuarios deben tener iniciales asignadas

**Resultado esperado:**
```
username    | nombre             | iniciales | rol
------------|-------------------|-----------|-----------
gfajardo    | Gonzalo Fajardo   | GF        | ADMIN
acruz       | Ariana de la Cruz | AC        | MKT
rortega     | Rayedel Ortega    | RO        | TRAFFICKER
...
```

### 2. Tabla `tareas_pendientes` creada
- Tabla debe existir
- Debe tener 11 columnas
- Debe tener 4 índices

**Columnas esperadas:**
- id, tipo_tarea, campana_id, asignado_a, responsable_rol
- descripcion, urgente, completada, fecha_completada
- fecha_creacion, fecha_actualizacion

**Índices esperados:**
- idx_tareas_campana
- idx_tareas_completada
- idx_tareas_responsable
- idx_tareas_asignado

### 3. Tabla `mensajes_chat` creada
- Tabla debe existir
- Debe tener 6 columnas
- Debe tener 4 índices

**Columnas esperadas:**
- id, campana_id, remitente, mensaje
- leido, urgente, fecha_creacion

**Índices esperados:**
- idx_mensajes_campana
- idx_mensajes_leido
- idx_mensajes_remitente
- idx_mensajes_fecha

---

## 📋 Pasos para verificar

1. **Abre pgAdmin**
2. **Conecta a `siscoca_dev`**
3. **Abre Query Tool (F5)**
4. **Carga `VERIFICAR_MIGRACIONES.sql`**
5. **Ejecuta (F5)**
6. **Compárteme el resultado**

---

## ⚠️ Errores comunes

### Si dice "tabla no existe"
→ La migración no se ejecutó correctamente. Ejecuta `migration_completa.sql` de nuevo.

### Si dice "columna iniciales no existe"
→ Ejecuta solo la PARTE 1 de `migration_completa.sql`.

### Si hay errores de "violación de restricción"
→ Las tablas ya existen con datos. Normal, continúa.

---

## ✅ Resultado exitoso

Si todo está bien, verás:
- ✓ Campo iniciales verificado
- ✓ Usuarios con iniciales listados
- ✓ Tablas `tareas_pendientes` y `mensajes_chat` existen
- ✓ Todas las columnas presentes
- ✓ Índices creados
- ✓ RESUMEN: 1, 1, 1, 8+


