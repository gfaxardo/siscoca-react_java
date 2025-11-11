# 🚀 INSTRUCCIONES PARA REINICIAR BACKEND Y FRONTEND

## ✅ VERIFICACIÓN COMPLETA REALIZADA

Todas las correcciones críticas han sido **implementadas, verificadas y compiladas correctamente**.

### ✅ Backend
- ✅ Compilación exitosa sin errores
- ✅ Todos los métodos implementados
- ✅ Lógica de límite de 5 activos corregida y consistente
- ✅ Logging apropiado (sin System.out.println)
- ✅ Endpoint de sincronización manual disponible

### ✅ Frontend
- ✅ Sin errores de TypeScript
- ✅ Interfaz unificada implementada (sin pestañas)
- ✅ Sincronización automática implementada
- ✅ Props no usadas eliminadas

---

## 📋 PASOS PARA REINICIAR

### 1️⃣ REINICIAR BACKEND

**Opción A: Desde la terminal actual**
```bash
cd "C:\Users\Pc\Documents\Cursor Proyectos\siscoca-react_java\backend"
mvn spring-boot:run
```

**Opción B: Si ya está corriendo**
1. Detener el proceso actual (Ctrl+C)
2. Ejecutar: `mvn spring-boot:run`

**Verificar que el backend esté corriendo:**
- Debería mostrar: "Started SiscocaBackendApplication"
- API disponible en: `http://localhost:8080/api`

---

### 2️⃣ REINICIAR FRONTEND

**Abrir una nueva terminal y ejecutar:**
```bash
cd "C:\Users\Pc\Documents\Cursor Proyectos\siscoca-react_java\frontend"
npm run dev
```

**Verificar que el frontend esté corriendo:**
- Debería mostrar la URL del servidor de desarrollo (ej: `http://localhost:5173`)

---

### 3️⃣ LIMPIAR CACHÉ DEL NAVEGADOR

**Opción A: Limpiar caché**
1. Presiona `Ctrl + Shift + Delete`
2. Selecciona "Caché" o "Imágenes y archivos en caché"
3. Limpiar datos

**Opción B: Modo incógnito (recomendado para pruebas)**
1. Presiona `Ctrl + Shift + N` (Chrome/Edge) o `Ctrl + Shift + P` (Firefox)
2. Navegar a la aplicación en modo incógnito

---

## 🧪 PRUEBAS RECOMENDADAS

### Prueba 1: Sincronización Automática
1. Abrir una campaña en estado "Pendiente" que tenga creativos activos
2. Abrir el modal de creativos
3. **Verificar**: 
   - Abrir consola del navegador (F12)
   - Debería mostrar: "Estado de campaña sincronizado: Pendiente → Creativo Enviado"
   - El estado de la campaña debería cambiar automáticamente

### Prueba 2: Retroceso de Estado
1. Tener una campaña con creativos activos en estado "Activa" o "Creativo Enviado"
2. Eliminar o descartar todos los creativos activos
3. **Verificar**: El estado debería retroceder automáticamente a "Pendiente"

### Prueba 3: Interfaz Unificada
1. Abrir el modal de creativos
2. **Verificar**:
   - Sección de archivos visible
   - Sección de URLs visible
   - Ambas funcionan simultáneamente
   - Puedes agregar archivos y URLs al mismo tiempo
   - Lista unificada muestra todos los items

### Prueba 4: Límite de 5 Activos
1. Intentar activar un creativo cuando ya hay 5 activos
2. **Verificar**: Debe mostrar error "No se pueden tener más de 5 creativos activos"

---

## 🔍 VERIFICACIÓN DE LOGS

### Backend
Al realizar acciones, deberías ver en la consola del backend:
```
INFO - Campaña X sincronizada: PENDIENTE → CREATIVO_ENVIADO (1 creativos activos)
INFO - Creativo Y eliminado de la campaña X
INFO - Campaña X sincronizada: CREATIVO_ENVIADO → PENDIENTE (sin creativos activos)
```

### Frontend
En la consola del navegador (F12):
```
Estado de campaña sincronizado: Pendiente → Creativo Enviado
```

---

## ⚠️ SI NO SE VEN LOS CAMBIOS

### 1. Verificar que el backend se reinició
- Debe mostrar "Started SiscocaBackendApplication"
- Verificar que la versión compilada es la correcta

### 2. Verificar que el frontend se reinició
- Debe mostrar la URL del servidor de desarrollo
- Verificar que no hay errores en la consola

### 3. Limpiar caché del navegador
- Usar modo incógnito para pruebas
- O limpiar caché manualmente

### 4. Verificar logs
- Revisar consola del backend para errores
- Revisar consola del navegador (F12) para errores JavaScript

### 5. Verificar endpoints
- Probar manualmente: `POST http://localhost:8080/api/creativos/campana/{id}/sincronizar-estado`
- Debe retornar: "Estado de la campaña sincronizado correctamente"

---

## 📝 NOTAS IMPORTANTES

1. **El backend debe reiniciarse** después de compilar para que los cambios se apliquen
2. **El frontend puede tener caché** - siempre limpiar caché o usar modo incógnito
3. **Verificar logs** para confirmar que las operaciones se están ejecutando
4. **Los cambios son automáticos** - no requieren intervención manual del usuario

---

## ✅ TODO LISTO

**Todas las correcciones críticas están implementadas y verificadas.**

**El sistema está listo para reiniciar y probar.**

🧹 **Limpia caché del navegador antes de probar**

🔄 **Reinicia ambos servicios (backend y frontend)**

🧪 **Prueba los casos de prueba mencionados arriba**



