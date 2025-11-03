# 🚀 Guía de Instalación - SISCOCA

## ⚠️ Importante

No puedo ejecutar comandos directamente en tu sistema que modifiquen la base de datos. Necesitas ejecutar estos comandos manualmente.

## 📋 Pasos Manuales

### Opción 1: Scripts Automáticos (Recomendado)

Simplemente ejecuta:

```bash
# En Windows
INSTALACION_COMPLETA.bat

# En Linux/Mac
bash INSTALACION_COMPLETA.sh  # (si creas el archivo)
```

### Opción 2: Manual

#### Paso 1: Migraciones de Base de Datos

```bash
# Terminal de PostgreSQL (o pgAdmin)
psql -U postgres -d siscoca -f backend/migrations/add_iniciales_usuarios.sql
psql -U postgres -d siscoca -f backend/migrations/create_tareas_chat.sql
```

**O en pgAdmin:**
1. Conecta a la base `siscoca`
2. Abre `backend/migrations/add_iniciales_usuarios.sql`
3. Ejecuta (F5)
4. Abre `backend/migrations/create_tareas_chat.sql`
5. Ejecuta (F5)

#### Paso 2: Compilar Backend

```bash
cd backend
mvn clean install
```

#### Paso 3: Ejecutar Backend

```bash
mvn spring-boot:run
```

## ✅ Verificar Instalación

### 1. Verificar Usuarios Creados

Los usuarios se crean automáticamente al iniciar la aplicación. Verifica en los logs:

```
=== USUARIOS DE SISCOCA CREADOS ===
ADMIN:
  Gonzalo Fajardo (GF) - gfajardo:siscoca2024
...
```

### 2. Test de Login

```bash
# Prueba login
curl -X POST http://localhost:8080/auth/login ^
  -H "Content-Type: application/json" ^
  -d "{\"username\":\"acruz\",\"password\":\"siscoca2024\"}"
```

### 3. Ver Usuarios

```bash
# Obtener todos los usuarios (necesitas token de admin)
curl http://localhost:8080/usuarios ^
  -H "Authorization: Bearer [TU_TOKEN]"
```

## 🔧 Solución de Problemas

### Error: No encuentra psql

**Solución:**
Agrega PostgreSQL al PATH o usa la ruta completa:

```bash
"C:\Program Files\PostgreSQL\15\bin\psql.exe" -U postgres -d siscoca -f backend/migrations/add_iniciales_usuarios.sql
```

### Error: Tabla usuarios ya existe

**Solución:**
Es normal. Los campos se agregan solo si no existen (`ADD COLUMN IF NOT EXISTS`).

### Error: Contraseña de PostgreSQL

**Solución:**
Modifica los scripts .bat y agrega `PGPASSWORD=tu_password` o usa un archivo `.pgpass`.

### Error: Puerto 8080 en uso

**Solución:**
```bash
# Cambiar puerto en backend/src/main/resources/application.yml
server:
  port: 8081
```

## 📞 Siguiente Paso

Una vez instalado:
1. Prueba el login con `acruz:siscoca2024`
2. Verifica que veas las tareas
3. Crea una campaña de prueba
4. Verifica que se generen tareas automáticamente

---

**¿Listo para continuar con el frontend?** 🚀


