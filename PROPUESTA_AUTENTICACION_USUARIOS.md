# 🔐 Propuesta: Sistema de Autenticación y Gestión de Usuarios

## 📋 Situación Actual

Actualmente tienes **DOS sistemas de autenticación** funcionando:

1. **Login con API de Yego** (`/auth/login`)
   - Valida credenciales en `https://api-int.yego.pro/api/auth/login`
   - Crea usuarios temporales
   - Asigna rol `TRAFFICKER` por defecto
   - **Problema:** No persiste usuarios ni roles reales

2. **Login local** (en `UsuarioService` pero no expuesto)
   - Autentica contra BD local
   - Tiene usuarios con roles definidos
   - **Problema:** No se usa en producción

## ✅ Recomendación: Sistema de Autenticación Local Unificado

### Arquitectura Propuesta

```
┌─────────────────────────────────────────────────────────────────┐
│                    SISTEMA DE USUARIOS                          │
└─────────────────────────────────────────────────────────────────┘

Usuario (Tabla en BD)
├── id
├── username (único)
├── password (hasheado)
├── nombre_completo (ej: "Gonzalo Fajardo")
├── iniciales (ej: "GF")
├── rol (ADMIN, TRAFFICKER, DUEÑO, MKT)
├── activo
└── creado_por
```

### Roles del Sistema

```java
public enum Rol {
    ADMIN("Admin"),           // Acceso total
    TRAFFICKER("Trafficker"), // Gestión de creativos y métricas
    DUEÑO("Dueño"),           // Gestión de métricas de conductores
    MKT("Marketing");         // Nuevo rol - Análisis y reporting
}
```

---

## 🎯 Implementación Recomendada

### Opción 1: Autenticación Local Pura (Recomendada)

**Ventajas:**
- ✅ Control total sobre usuarios y roles
- ✅ Seguridad: contraseñas hasheadas con BCrypt
- ✅ Persistencia en BD
- ✅ No depende de servicios externos
- ✅ Asignación de tareas automática según rol
- ✅ Chat asociado a usuarios reales

**Desventajas:**
- ❌ Necesitas crear/cambiar contraseñas manualmente
- ❌ No hay SSO (Single Sign-On) con Yego

**Implementación:**
```java
@PostMapping("/auth/login")
public ResponseEntity<LoginResponse> login(@RequestBody LoginRequest request) {
    Usuario usuario = usuarioRepository
        .findByUsernameAndActivoTrue(request.getUsername())
        .orElseThrow(() -> new UnauthorizedException());
    
    if (!passwordEncoder.matches(request.getPassword(), usuario.getPassword())) {
        throw new UnauthorizedException();
    }
    
    String token = jwtService.generateToken(usuario.getUsername());
    UserDto userDto = UserDto.from(usuario);
    
    return ResponseEntity.ok(new LoginResponse(true, token, userDto));
}
```

### Opción 2: Autenticación Híbrida (Fallback)

**Ventajas:**
- ✅ Mantiene acceso a usuarios de Yego
- ✅ Permite usuarios locales con roles definidos
- ✅ Flexibilidad

**Desventajas:**
- ❌ Mayor complejidad
- ❌ Dos fuentes de verdad

**Implementación:**
```java
@PostMapping("/auth/login")
public ResponseEntity<LoginResponse> login(@RequestBody LoginRequest request) {
    // Intentar login local primero
    Optional<Usuario> usuarioLocal = usuarioRepository
        .findByUsernameAndActivoTrue(request.getUsername());
    
    if (usuarioLocal.isPresent()) {
        // Autenticación local
        Usuario usuario = usuarioLocal.get();
        if (passwordEncoder.matches(request.getPassword(), usuario.getPassword())) {
            return loginExitoso(usuario);
        }
    }
    
    // Fallback: Intentar con API de Yego
    try {
        Map<String, Object> yegoResponse = autenticarConYego(request);
        if (yegoResponse != null) {
            // Crear usuario temporal o buscar existente
            return loginExitosoUsuarioYego(request.getUsername());
        }
    } catch (Exception e) {
        // Error de conexión
    }
    
    return ResponseEntity.status(401).build();
}
```

### Opción 3: SSO con Mapeo de Usuarios (Más Complejo)

**Ventajas:**
- ✅ Los usuarios usan sus credenciales de Yego
- ✅ Mapeo automático username → Rol
- ✅ Mantiene seguridad de Yego

**Desventajas:**
- ❌ Requiere tabla de mapeo
- ❌ Sincronización compleja

---

## 🏆 Mi Recomendación: Opción 1 (Autenticación Local)

### ¿Por qué?

1. **Control Total:** Tienes control sobre quién puede acceder
2. **Roles Definidos:** Asignas roles específicos a usuarios reales
3. **Tareas Automáticas:** El sistema genera tareas según rol
4. **Chat Personalizado:** Mensajes asociados a usuarios reales
5. **Simplicidad:** Un solo sistema de autenticación
6. **Seguridad:** BCrypt + JWT tokens

### Ejemplo de Usuarios

```sql
INSERT INTO usuarios (username, password, nombre_completo, iniciales, rol, activo) VALUES
('gfajardo', '$2a$10$...', 'Gonzalo Fajardo', 'GF', 'DUEÑO', true),
('acruz', '$2a$10$...', 'Ariana de la Cruz', 'AC', 'DUEÑO', true),
('maria.garcia', '$2a$10$...', 'María García', 'MG', 'TRAFFICKER', true),
('juan.perez', '$2a$10$...', 'Juan Pérez', 'JP', 'TRAFFICKER', true),
('rosa.mkt', '$2a$10$...', 'Rosa López', 'RL', 'MKT', true),
('admin', '$2a$10$...', 'Administrador', 'ADM', 'ADMIN', true);
```

---

## 🔧 Implementación Paso a Paso

### 1. Actualizar Modelo Usuario

```java
@Entity
@Table(name = "usuarios")
public class Usuario {
    // ... campos existentes ...
    
    @Column(name = "nombre_completo")
    private String nombreCompleto;
    
    @Column(name = "iniciales")
    private String iniciales;
    
    // Agregar iniciales del dueño del sistema de campañas
}
```

### 2. Actualizar Enum Rol

```java
public enum Rol {
    ADMIN("Admin"),
    TRAFFICKER("Trafficker"),
    DUEÑO("Dueño"),
    MKT("Marketing");  // ← Nuevo rol
}
```

### 3. Crear Usuarios Iniciales

```java
@Component
@Order(1)
public class DataInitializer implements CommandLineRunner {
    
    @Override
    public void run(String... args) {
        // Usuarios por defecto
        crearUsuario("gfajardo", "Gonzalo Fajardo", "GF", Rol.DUEÑO);
        crearUsuario("acruz", "Ariana de la Cruz", "AC", Rol.DUEÑO);
        crearUsuario("maria.garcia", "María García", "MG", Rol.TRAFFICKER);
        crearUsuario("juan.perez", "Juan Pérez", "JP", Rol.TRAFFICKER);
        crearUsuario("rosa.mkt", "Rosa López", "RL", Rol.MKT);
        crearUsuario("admin", "Administrador", "ADM", Rol.ADMIN);
    }
}
```

### 4. Actualizar AuthController

```java
@PostMapping("/login")
public ResponseEntity<LoginResponse> login(@Valid @RequestBody LoginRequest request) {
    return usuarioService.login(request);
}
```

### 5. Actualizar TareaService

Las tareas ya se generan automáticamente según rol ✅

---

## 📊 Tabla de Comparación

| Aspecto | Opción 1: Local | Opción 2: Híbrida | Opción 3: SSO |
|---------|----------------|-------------------|---------------|
| **Complejidad** | 🟢 Baja | 🟡 Media | 🔴 Alta |
| **Control** | 🟢 Total | 🟡 Parcial | 🔴 Limitado |
| **Seguridad** | 🟢 Alta | 🟡 Media | 🟢 Alta |
| **Mantenimiento** | 🟢 Fácil | 🔴 Difícil | 🔴 Difícil |
| **Tareas Auto** | 🟢 Sí | 🟡 Parcial | 🟡 Parcial |
| **Chat Usuario** | 🟢 Sí | 🟡 Parcial | 🟡 Parcial |

---

## 🚀 Plan de Migración

### Si eliges Opción 1 (Recomendada):

1. ✅ Actualizar `AuthController` para usar login local
2. ✅ Agregar campo `iniciales` a modelo Usuario
3. ✅ Crear usuarios iniciales con roles
4. ✅ Actualizar `TareaService` para asignar por nombre/iniciales
5. ✅ Probar sistema completo
6. ✅ Cambiar contraseñas a usuarios finales

### Si eliges Opción 2 (Híbrida):

1. ✅ Implementar lógica de fallback
2. ✅ Crear usuarios críticos localmente
3. ✅ Mantener API de Yego para usuarios temporales
4. ✅ Mapear roles según origen

---

## 💡 Recomendación Final

**Implementa la Opción 1 (Autenticación Local)** porque:

1. El sistema de tareas y chat necesita usuarios con nombres e iniciales definidos
2. Tienes un grupo pequeño y conocido de usuarios
3. La relación username → rol → tareas es crítica
4. Más simple de mantener y debuggear
5. No dependes de servicios externos

**Próximos pasos si aceptas:**
1. Actualizar modelo Usuario con `iniciales`
2. Crear usuarios de ejemplo
3. Actualizar AuthController
4. Probar login completo
5. Conectar con sistema de tareas y chat

---

## ❓ Preguntas para ti

1. **¿Cuántos usuarios tendrás aproximadamente?** (Para saber si local es viable)
2. **¿Los usuarios necesitan usar las mismas credenciales de Yego?** (Decide entre Opción 1 o 2)
3. **¿Quieres que agregue el rol MKT?** (Para analistas de marketing)
4. **¿Tienes ya las iniciales de todos los usuarios?** (Para completar el modelo)

---

**¿Procedo con la implementación de la Opción 1?**


