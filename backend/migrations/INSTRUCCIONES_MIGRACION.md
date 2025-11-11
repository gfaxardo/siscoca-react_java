# 📋 Instrucciones para Ejecutar la Migración de Creativos

## Información de la Base de Datos

- **Host**: `168.119.226.236`
- **Puerto**: `5432`
- **Base de datos**: `siscoca_dev`
- **Usuario**: `yego_user`
- **Contraseña**: `37>MNA&-35+`

---

## 📝 Opción 1: Ejecutar desde psql (CLI de PostgreSQL)

### Paso 1: Conectarse a PostgreSQL

Si tienes PostgreSQL instalado localmente, puedes conectarte directamente:

```bash
psql -h 168.119.226.236 -p 5432 -U yego_user -d siscoca_dev
```

Cuando te pida la contraseña, ingresa: `37>MNA&-35+`

### Paso 2: Ejecutar el archivo SQL

Una vez conectado, ejecuta:

```sql
\i migrations/create_tabla_creativos.sql
```

O si estás en el directorio `backend`:

```sql
\i migrations/create_tabla_creativos.sql
```

### Paso 3: Verificar que se creó la tabla

```sql
\dt creativos
```

Deberías ver la tabla `creativos` listada.

### Paso 4: Verificar la estructura de la tabla

```sql
\d creativos
```

Deberías ver todas las columnas: `id`, `campana_id`, `archivo_creativo`, etc.

### Paso 5: Salir de psql

```sql
\q
```

---

## 📝 Opción 2: Ejecutar desde línea de comandos (sin entrar a psql)

Si prefieres ejecutar directamente sin entrar a la consola interactiva:

```bash
psql -h 168.119.226.236 -p 5432 -U yego_user -d siscoca_dev -f migrations/create_tabla_creativos.sql
```

Te pedirá la contraseña: `37>MNA&-35+`

---

## 📝 Opción 3: Usar pgAdmin o DBeaver (GUI)

### Con pgAdmin:

1. Abre pgAdmin
2. Conecta al servidor:
   - Host: `168.119.226.236`
   - Puerto: `5432`
   - Base de datos: `siscoca_dev`
   - Usuario: `yego_user`
   - Contraseña: `37>MNA&-35+`

3. Haz clic derecho en la base de datos `siscoca_dev`
4. Selecciona "Query Tool"
5. Abre el archivo `backend/migrations/create_tabla_creativos.sql`
6. Copia y pega el contenido en el Query Tool
7. Haz clic en "Execute" (F5)

### Con DBeaver:

1. Conecta a la base de datos con los mismos datos
2. Abre el archivo `backend/migrations/create_tabla_creativos.sql`
3. Selecciona toda la base de datos en el árbol
4. Ejecuta el script (Ctrl+Enter)

---

## 📝 Opción 4: Ejecutar desde el proyecto (PowerShell/CMD)

Si estás en Windows y estás en el directorio del proyecto:

```powershell
# Cambiar al directorio backend
cd backend

# Ejecutar con psql (si está instalado)
psql -h 168.119.226.236 -p 5432 -U yego_user -d siscoca_dev -f migrations/create_tabla_creativos.sql
```

---

## ✅ Verificación Post-Migración

Después de ejecutar la migración, verifica que todo esté correcto:

```sql
-- Verificar que la tabla existe
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name = 'creativos';

-- Verificar la estructura
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'creativos'
ORDER BY ordinal_position;

-- Verificar los índices
SELECT indexname, indexdef
FROM pg_indexes
WHERE tablename = 'creativos';
```

Deberías ver:
- ✅ Tabla `creativos` creada
- ✅ 9 columnas: id, campana_id, archivo_creativo, nombre_archivo_creativo, url_creativo_externo, activo, orden, fecha_creacion, fecha_actualizacion
- ✅ 3 índices: idx_creativos_campana, idx_creativos_activo, idx_creativos_orden
- ✅ Foreign key a la tabla `campanas`

---

## ⚠️ Notas Importantes

1. **Backup**: Aunque esta migración solo CREA una tabla nueva (no modifica datos existentes), siempre es buena práctica hacer un backup antes:
   ```bash
   pg_dump -h 168.119.226.236 -p 5432 -U yego_user -d siscoca_dev > backup_antes_creativos_$(date +%Y%m%d_%H%M%S).sql
   ```

2. **Si la tabla ya existe**: El script usa `CREATE TABLE IF NOT EXISTS`, así que es seguro ejecutarlo múltiples veces.

3. **Permisos**: Asegúrate de que el usuario `yego_user` tenga permisos para crear tablas e índices.

4. **Después de la migración**: Reinicia el backend de Spring Boot para que reconozca la nueva tabla.

---

## 🔄 Después de Ejecutar la Migración

1. **Reiniciar el Backend**:
   ```bash
   cd backend
   mvn spring-boot:run
   ```

2. **Verificar en los logs**: Deberías ver que Hibernate reconoce la tabla `creativos` (si `ddl-auto: update` está activo, verificará que la estructura coincida).

3. **Probar los endpoints**: Prueba crear un creativo desde el frontend o con Postman:
   ```
   POST http://localhost:8080/api/creativos/campana/{campanaId}
   ```

---

## 🆘 Solución de Problemas

### Error: "permission denied"
- Verifica que el usuario `yego_user` tenga permisos CREATE en la base de datos

### Error: "relation already exists"
- No es un error crítico, significa que la tabla ya existe. Puedes ignorarlo o verificar con `\d creativos`

### Error: "could not connect to server"
- Verifica que:
  - El servidor PostgreSQL esté accesible desde tu IP
  - El firewall permita conexiones al puerto 5432
  - Las credenciales sean correctas

---

## 📞 Si necesitas ayuda

Si encuentras algún problema, verifica:
1. La conexión a la base de datos funciona
2. El usuario tiene los permisos necesarios
3. La base de datos `siscoca_dev` existe
4. No hay conflictos con tablas existentes


