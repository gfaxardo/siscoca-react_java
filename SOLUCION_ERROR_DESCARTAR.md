# 🔧 SOLUCIÓN: Error al Descartar Creativos

## ❌ ERROR REPORTADO

```
PATCH http://localhost:8081/api/creativos/57/descartar net::ERR_FAILED
TypeError: Failed to fetch
```

---

## ✅ PROBLEMAS YA CORREGIDOS

### **1. Modal de Confirmación Moderno** ✅

**ANTES:**
- `confirm()` nativo del navegador
- Diseño feo y genérico

**AHORA:**
- Modal moderno personalizado
- Icono Trash2 en header rojo
- Muestra tipo (Video/Imagen) del creativo
- Muestra nombre del archivo
- Advertencia: "Esta acción no se puede deshacer"
- Botones: Cancelar (gris) / Eliminar (rojo)

### **2. Manejo de Errores Mejorado** ✅

Ahora los errores muestran mensajes específicos:
- ✅ "No se pudo conectar con el servidor" → Backend no corriendo
- ✅ "Creativo no encontrado" → Error 404
- ✅ "Ya hay 5 creativos activos" → Límite alcanzado

### **3. Auto-Refresh Implementado** ✅

Después de activar/descartar:
- ✅ `await cargarCreativosExistentes()` → Refresca creativos
- ✅ `await obtenerCampanas()` → Actualiza estado de campaña

---

## 🔍 DIAGNÓSTICO DEL ERROR ERR_FAILED

### **Causa Más Probable:**

El error `net::ERR_FAILED` ocurre cuando:
1. ❌ **Backend NO está corriendo**
2. ❌ **Backend se cayó/crasheó**
3. ❌ **Error 500 en el backend** (excepción no manejada)

---

## 🚀 SOLUCIÓN PASO A PASO

### **PASO 1: Verificar si el Backend Está Corriendo**

Abre el navegador y ve a:
```
http://localhost:8081/api/campanas
```

**Si responde con JSON** → Backend está corriendo ✅  
**Si no carga o da error** → Backend está caído ❌

---

### **PASO 2: Reiniciar el Backend**

#### **Opción A: Desde Terminal**

```bash
cd backend
./mvnw spring-boot:run
```

#### **Opción B: Desde IntelliJ IDEA**

1. Click derecho en `SiscocaApplication.java`
2. "Run 'SiscocaApplication'"

#### **Opción C: Desde VS Code**

1. Ir a "Run and Debug"
2. Click en "Run Java"

---

### **PASO 3: Verificar que el Backend Inició Correctamente**

Busca en los logs del backend:

```
✅ CORRECTO:
Started SiscocaApplication in X seconds
Tomcat started on port(s): 8081 (http)

❌ ERROR:
Exception in thread...
Error creating bean...
```

---

### **PASO 4: Probar Nuevamente**

1. Abre el modal de Gestión de Creativos
2. Intenta **descartar** un creativo
3. Debería funcionar ahora ✅

---

## 🐛 SI SIGUE FALLANDO

### **Revisar Logs del Backend**

Busca en la consola del backend errores como:

```java
ERROR [...] CreativoService - Error al descartar creativo...
```

### **Posibles Causas:**

1. **Base de datos desconectada:**
   - Verifica conexión PostgreSQL
   - URL: `168.119.226.236:5432`
   - Database: `siscoca_dev`

2. **Transacción fallida:**
   - `@Transactional` puede estar causando rollback
   - Verifica constraint violations

3. **AuditLogger fallando:**
   - El método llama `auditLogger.log()`
   - Si falla el audit, puede fallar toda la operación

---

## 📝 CÓDIGO VERIFICADO

### **Backend: CreativoController.java (líneas 100-110)**

```java
@PatchMapping("/{id}/descartar")
public ResponseEntity<Creativo> marcarComoDescartado(@PathVariable Long id) {
    try {
        creativoService.marcarComoDescartado(id);
        return creativoService.obtenerCreativoPorId(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    } catch (RuntimeException e) {
        return ResponseEntity.notFound().build();
    }
}
```

### **Backend: CreativoService.java (líneas 319-355)**

```java
@Transactional
public void marcarComoDescartado(Long id) {
    Optional<Creativo> creativoOpt = creativoRepository.findById(id);
    if (creativoOpt.isEmpty()) {
        throw new RuntimeException("Creativo no encontrado");
    }
    
    Creativo creativo = creativoOpt.get();
    Campana campana = creativo.getCampana();
    Long campanaId = campana.getId();
    creativo.setActivo(false);
    creativoRepository.save(creativo);
    
    // ... audit log ...
    // ... verificar estado ...
}
```

### **Frontend: creativoService.ts (líneas 177-200)**

```typescript
async marcarComoDescartado(id: string): Promise<Creativo> {
    const response = await fetch(`${API_BASE_URL}/creativos/${id}/descartar`, {
      method: 'PATCH',
      headers: this.getAuthHeaders()
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Error al descartar creativo: ${response.statusText}`);
    }

    const data = await response.json();
    return { ...data };
  }
```

---

## ✅ CHECKLIST DE VERIFICACIÓN

- [ ] Backend está corriendo (`http://localhost:8081/api/campanas` responde)
- [ ] PostgreSQL está conectado (verificar en logs backend)
- [ ] No hay errores en consola del backend
- [ ] Modal de confirmación se ve moderno (NO es alert nativo)
- [ ] Mensaje de error es específico y útil

---

## 🎯 RESULTADO ESPERADO

Cuando funcione correctamente:

1. Click en botón **Descartar** (📦 amarillo)
2. Creativo pasa de **Activos** a **Descartados**
3. Notificación verde: **"Creativo descartado exitosamente"**
4. UI se actualiza automáticamente (sin F5)
5. Estado de la campaña se sincroniza si es necesario

---

## 📞 SI NECESITAS AYUDA

Comparte:
1. **Logs del backend** (últimas 20 líneas)
2. **Error exacto** en consola del navegador (F12)
3. **ID del creativo** que intentas descartar
4. **Estado de la campaña** (Pendiente/Activa/etc.)

Con eso puedo identificar el problema exacto.

