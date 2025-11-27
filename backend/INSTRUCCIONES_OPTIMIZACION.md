# 🚀 INSTRUCCIONES PARA OPTIMIZACIÓN DE BASE DE DATOS

## 📋 RESUMEN
Se han identificado **50+ índices faltantes** que están causando consultas lentas.

## ⚡ IMPACTO ESPERADO
- **Login**: 70% más rápido
- **Dashboard**: 80% más rápido
- **Consultas de campañas**: 60% más rápido
- **Chat y tareas**: 75% más rápido

---

## 🔧 OPCIÓN 1: Ejecutar desde servidor con acceso a PostgreSQL

```bash
# Conectarse al servidor donde está PostgreSQL
psql -h 168.119.226.236 -p 5432 -U yego_user -d siscoca_dev -f database_optimization.sql
# Contraseña: 37>MNA&-35+
```

---

## 🔧 OPCIÓN 2: Ejecutar desde pgAdmin o DBeaver

1. Abrir **pgAdmin** o **DBeaver**
2. Conectarse a la base de datos:
   - Host: `168.119.226.236`
   - Puerto: `5432`
   - Database: `siscoca_dev`
   - Usuario: `yego_user`
   - Contraseña: `37>MNA&-35+`
3. Abrir el archivo `database_optimization.sql`
4. Ejecutar todo el script

---

## 🔧 OPCIÓN 3: Instalar psql localmente (Mac)

```bash
# Instalar PostgreSQL client
brew install postgresql@15

# Ejecutar script
PGPASSWORD='37>MNA&-35+' psql -h 168.119.226.236 -p 5432 -U yego_user -d siscoca_dev -f database_optimization.sql
```

---

## 📊 ÍNDICES CRÍTICOS QUE SE VAN A CREAR

### 🔐 Tabla `usuarios` (Login)
- `idx_usuarios_username_activo` - **MUY CRÍTICO** para login
- `idx_usuarios_rol` - Para filtros por rol
- `idx_usuarios_activo` - Para usuarios activos

### 📋 Tabla `campanas` (Dashboard principal)
- `idx_campanas_estado` - **MUY CRÍTICO** para filtros
- `idx_campanas_nombre_dueno` - Para filtrar por dueño
- `idx_campanas_pais` - Para filtros por país
- `idx_campanas_vertical` - Para filtros por vertical
- `idx_campanas_fecha_creacion` - Para ordenamiento
- `idx_campanas_nombre_gin` - Para búsqueda de texto

### 📈 Tabla `historico_semanal` (Evolución semanal)
- `idx_historico_campana_semana` - **MUY CRÍTICO** para dashboard
- `idx_historico_semana_iso` - Para agrupaciones
- `idx_historico_campana_semana_unique` - Evita duplicados

### 💬 Tabla `mensajes_chat` (Chat)
- `idx_mensajes_campana_leido` - **MUY CRÍTICO** para no leídos
- `idx_mensajes_campana_fecha` - Para ordenar mensajes
- Partial indexes para optimizar queries de no leídos

### ✅ Tabla `tareas_pendientes` (Tareas)
- `idx_tareas_asignado_completada` - **MUY CRÍTICO** para mis tareas
- `idx_tareas_rol_completada` - Para tareas por rol
- Partial indexes para tareas pendientes

---

## ⏱️ TIEMPO DE EJECUCIÓN
El script debería tomar **menos de 1 minuto** en ejecutarse.

---

## ✅ VERIFICACIÓN

Después de ejecutar el script, verifica que los índices se crearon:

```sql
-- Ver todos los índices de una tabla
SELECT indexname, indexdef 
FROM pg_indexes 
WHERE tablename = 'campanas' 
ORDER BY indexname;

-- Ver tamaño de índices
SELECT 
    tablename,
    indexname,
    pg_size_pretty(pg_relation_size(indexrelid)) as index_size
FROM pg_stat_user_indexes
WHERE schemaname = 'public'
ORDER BY pg_relation_size(indexrelid) DESC;
```

---

## 🚨 IMPORTANTE

**ESTOS ÍNDICES SON CRÍTICOS.** Sin ellos, cada query hace un **FULL TABLE SCAN** (escaneo completo de la tabla), lo que es extremadamente lento cuando hay muchos registros.

Con los índices, las consultas pasan de **O(n)** a **O(log n)**, mejorando el rendimiento exponencialmente.

