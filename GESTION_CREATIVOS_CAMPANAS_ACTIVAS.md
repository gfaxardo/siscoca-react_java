# 📋 Gestión de Creativos en Campañas Activas

## ✅ Funcionalidad Implementada

### 🎯 Respuesta a tus preguntas:

1. **¿Cómo cambiar los creativos en una campaña activa?**
   - ✅ Ya puedes hacerlo desde el modal de creativos
   - ✅ Abre el modal desde cualquier campaña (incluso activas)
   - ✅ Puedes agregar, modificar, activar, desactivar o eliminar creativos

2. **¿Cómo generar tareas pendientes cuando se agregan/modifican creativos?**
   - ✅ **Implementado automáticamente** - Se genera una tarea para el TRAFFICKER
   - ✅ La tarea se crea cuando:
     - Se agrega un nuevo creativo activo en campaña ACTIVA
     - Se modifica un creativo activo en campaña ACTIVA
     - Se activa un creativo en campaña ACTIVA

---

## 🔄 Flujo de Trabajo

### Escenario 1: Agregar Nuevo Creativo en Campaña Activa

1. **Usuario (MKT o Admin)** abre el modal de creativos de una campaña ACTIVA
2. **Usuario** sube un nuevo archivo o agrega una URL
3. **Sistema** crea el creativo y lo marca como activo
4. **Sistema automáticamente**:
   - Genera una tarea para el **TRAFFICKER** (Rayedel Ortega)
   - Tipo de tarea: "Enviar Creativo"
   - Descripción: "Gestionar creativos para: [Nombre Campaña] - Se ha agregado o modificado un creativo activo. Debe subirse/actualizarse en la plataforma de publicidad"
   - La tarea aparece en el dashboard del TRAFFICKER

### Escenario 2: Modificar Creativo Existente en Campaña Activa

1. **Usuario** modifica un creativo activo (cambia URL, activa/desactiva, etc.)
2. **Sistema automáticamente**:
   - Si el creativo queda activo, genera/actualiza la tarea para el TRAFFICKER
   - Actualiza la descripción de la tarea existente si ya existe
   - Actualiza la fecha de creación para que aparezca como reciente

### Escenario 3: Activar Creativo Descartado en Campaña Activa

1. **Usuario** activa un creativo que estaba descartado
2. **Sistema automáticamente**:
   - Genera tarea para el TRAFFICKER
   - El TRAFFICKER debe gestionar la subida del creativo en la plataforma

---

## 📝 Detalles Técnicos

### Backend - Generación Automática de Tareas

**Archivo**: `backend/src/main/java/com/siscoca/service/CreativoService.java`

#### Método `crearCreativo()` (líneas 171-180)
```java
// Si la campaña está ACTIVA y se agregó un nuevo creativo activo, generar tarea para trafficker
if (campana.getEstado() == EstadoCampana.ACTIVA && 
    creativo.getActivo() != null && creativo.getActivo() && 
    !esPrimerCreativoActivo) {
    try {
        tareaService.crearTareaParaNuevoCreativo(campana);
    } catch (Exception e) {
        logger.error("Error generando tarea para nuevo creativo: {}", e.getMessage());
    }
}
```

#### Método `actualizarCreativo()` (líneas 232-253)
```java
// Si la campaña está ACTIVA y se modificó un creativo activo, generar tarea para trafficker
if (campana.getEstado() == EstadoCampana.ACTIVA && 
    (creativoActualizado.getActivo() != null || 
     creativoActualizado.getUrlCreativoExterno() != null ||
     creativoActualizado.getNombreArchivoCreativo() != null)) {
    
    // Solo generar tarea si el creativo está o queda activo
    boolean quedaActivo = ...;
    if (quedaActivo) {
        tareaService.crearTareaParaNuevoCreativo(campana);
    }
}
```

#### Método `marcarComoActivo()` (líneas 329-338)
```java
// Si la campaña está ACTIVA y se activó un creativo, generar tarea para trafficker
if (campana.getEstado() == EstadoCampana.ACTIVA) {
    tareaService.crearTareaParaNuevoCreativo(campana);
}
```

### TareaService - Creación de Tareas

**Archivo**: `backend/src/main/java/com/siscoca/service/TareaService.java`

#### Método `crearTareaParaNuevoCreativo()` (líneas 265-294)

**Características**:
- ✅ Tipo de tarea: `ENVIAR_CREATIVO`
- ✅ Responsable: `TRAFFICKER` (Rol.TRAFFICKER)
- ✅ Asignado a: "Rayedel Ortega"
- ✅ Descripción clara indicando que debe gestionar la subida en la plataforma
- ✅ Si ya existe una tarea pendiente, la actualiza en lugar de duplicarla
- ✅ Actualiza la fecha para que aparezca como reciente

---

## 🎯 Responsabilidades

### TRAFFICKER (Rayedel Ortega)
- **Recibe tareas** cuando se agregan/modifican creativos en campañas activas
- **Debe**: Subir o actualizar el creativo en la plataforma de publicidad (Facebook Ads, Google Ads, etc.)
- **Acción**: Revisar la tarea, subir el creativo en la plataforma, y marcar la tarea como completada

### MKT (Marketing)
- **Puede**: Agregar, modificar, activar, desactivar creativos en campañas activas
- **Acción**: Usar el modal de creativos normalmente
- **No necesita**: Subir manualmente en la plataforma (eso lo hace el TRAFFICKER)

---

## ✅ Casos de Uso Cubiertos

### ✅ Caso 1: Agregar Nuevo Creativo
- **Acción**: Subir archivo o URL en campaña activa
- **Resultado**: Tarea generada para TRAFFICKER
- **Estado**: ✅ Implementado

### ✅ Caso 2: Modificar Creativo Existente
- **Acción**: Cambiar URL, nombre de archivo, activar/desactivar
- **Resultado**: Tarea generada/actualizada para TRAFFICKER
- **Estado**: ✅ Implementado

### ✅ Caso 3: Activar Creativo Descartado
- **Acción**: Activar un creativo que estaba descartado
- **Resultado**: Tarea generada para TRAFFICKER
- **Estado**: ✅ Implementado

### ✅ Caso 4: Descartar Creativo
- **Acción**: Descartar un creativo activo
- **Resultado**: Tarea generada para MKT (no TRAFFICKER, porque ya no hay creativo activo)
- **Estado**: ✅ Ya estaba implementado

---

## 🔍 Verificación

### Para verificar que funciona:

1. **Crear/Modificar Creativo en Campaña Activa**:
   - Abrir una campaña en estado "Activa"
   - Abrir modal de creativos
   - Agregar o modificar un creativo activo
   - Verificar en el dashboard de tareas que aparece una tarea para el TRAFFICKER

2. **Ver Tareas del TRAFFICKER**:
   - Iniciar sesión como TRAFFICKER (o usuario con rol TRAFFICKER)
   - Ir al dashboard de tareas
   - Debería aparecer la tarea: "Gestionar creativos para: [Campaña]"

3. **Verificar Logs del Backend**:
   - En los logs deberías ver:
   ```
   INFO - Tarea generada para trafficker por modificación de creativo X en campaña activa Y
   ```

---

## 📋 Resumen de Cambios

### Archivos Modificados:

1. **`CreativoService.java`**:
   - ✅ `crearCreativo()` - Genera tarea cuando se agrega creativo en campaña activa
   - ✅ `actualizarCreativo()` - Genera tarea cuando se modifica creativo en campaña activa
   - ✅ `marcarComoActivo()` - Genera tarea cuando se activa creativo en campaña activa

2. **`TareaService.java`**:
   - ✅ `crearTareaParaNuevoCreativo()` - Mejorado para generar tareas más descriptivas
   - ✅ Asigna correctamente al TRAFFICKER
   - ✅ Evita duplicados actualizando tareas existentes

---

## 🚀 Próximos Pasos

1. **Reiniciar Backend**:
   ```bash
   cd backend
   mvn spring-boot:run
   ```

2. **Probar la funcionalidad**:
   - Agregar/modificar creativo en campaña activa
   - Verificar que se genera la tarea
   - Verificar que el TRAFFICKER puede ver la tarea

3. **Completar el flujo**:
   - TRAFFICKER sube el creativo en la plataforma
   - TRAFFICKER marca la tarea como completada

---

## ✅ TODO IMPLEMENTADO Y LISTO

**El sistema ahora genera automáticamente tareas para el TRAFFICKER cuando se agregan o modifican creativos en campañas activas.**

**No se requiere intervención manual - todo es automático.**

