# 📋 Guía: Cómo Cambiar Creativos en una Campaña Activa

## ✅ Pasos para Cambiar Creativos

### Paso 1: Acceder a la Campaña Activa

1. Ve a la vista de **"Campañas"** en el sistema
2. Busca la campaña que está en estado **"Activa"**
3. En la tarjeta de la campaña, verás un botón de **menú de acciones** (tres puntos `⋯` o un ícono de menú)

### Paso 2: Abrir el Modal de Gestión de Creativos

**Opción A: Desde el Menú de Acciones**
1. Haz clic en el botón de **menú de acciones** de la campaña activa
2. En el menú desplegable, busca la opción **"📎 Enviar Creativo"** o **"📎 Gestión de Creativos"**
3. Haz clic en esa opción

**Opción B: Desde el Botón de Creativos (si está visible)**
- Si hay un botón directo de creativos en la tarjeta de la campaña, haz clic en él

### Paso 3: Gestionar los Creativos

Una vez abierto el modal **"📎 Gestión de Creativos"**, podrás:

#### ✅ **Ver Creativos Existentes**
- **Creativos Activos**: Se muestran en verde con un ✓
- **Creativos Descartados**: Se muestran en gris con un ⊘

#### ✅ **Agregar Nuevos Creativos**

**Opción 1: Subir Archivos**
1. En la sección **"📎 Subir Archivos"**
2. Haz clic en el área de selección de archivos
3. Selecciona uno o varios archivos (máximo 5 activos en total)
4. Los archivos aparecerán en la lista de "Archivos Seleccionados"

**Opción 2: Agregar URLs Externas**
1. En la sección **"🔗 Agregar URLs Externas"**
2. Ingresa la URL completa del creativo
3. Haz clic en **"Agregar"**
4. La URL aparecerá en la lista de "URLs Agregadas"

**Puedes combinar ambas opciones**: Subir archivos Y agregar URLs al mismo tiempo.

#### ✅ **Modificar Creativos Existentes**

**Activar/Desactivar**:
- Haz clic en el botón **🗑️** (Descartar) en un creativo activo para desactivarlo
- Haz clic en el botón **✓** (Activar) en un creativo descartado para reactivarlo

**Eliminar Permanentemente**:
- Haz clic en el botón **✕** (Eliminar) para eliminar un creativo permanentemente

**Descargar**:
- Haz clic en el botón **⬇️** (Descargar) para descargar un creativo

#### ✅ **Subir los Cambios**

1. Revisa la lista de **"📋 Items a Subir"** que muestra todos los archivos y URLs que agregaste
2. Haz clic en el botón **"Subir X Item(s)"**
3. El sistema procesará todos los items simultáneamente
4. Verás un mensaje de confirmación cuando se complete

---

## 🎯 Funcionalidades Disponibles

### ✅ Lo que SÍ puedes hacer:
- ✅ **Agregar nuevos creativos** (archivos o URLs)
- ✅ **Activar creativos descartados**
- ✅ **Descartar creativos activos**
- ✅ **Eliminar creativos permanentemente**
- ✅ **Subir múltiples archivos y URLs simultáneamente**
- ✅ **Ver todos los creativos existentes** (activos y descartados)

### ⚠️ Límites:
- **Máximo 5 creativos activos** por campaña
- **Máximo 10MB** por archivo
- **Tipos permitidos**: Imágenes (JPEG, PNG, GIF) y Videos (MP4, AVI, MOV)

---

## 🔄 ¿Qué Sucede Automáticamente?

### Cuando Agregas o Modificas Creativos:

1. **Sincronización de Estado**:
   - Si agregas el primer creativo activo y la campaña está en "Pendiente" → cambia a "Creativo Enviado"
   - Si eliminas todos los creativos activos → el estado retrocede a "Pendiente"

2. **Generación de Tareas**:
   - Si la campaña está **ACTIVA** y agregas/modificas un creativo activo
   - Se genera **automáticamente** una tarea para el **TRAFFICKER** (Rayedel Ortega)
   - La tarea indica: "Gestionar creativos para: [Campaña] - Se ha agregado o modificado un creativo activo. Debe subirse/actualizarse en la plataforma de publicidad"

3. **Actualización de Lista**:
   - Los creativos se recargan automáticamente después de cada operación
   - La lista se actualiza inmediatamente

---

## 📝 Ejemplo Paso a Paso

### Ejemplo: Cambiar un Creativo en una Campaña Activa

```
1. Abres la lista de campañas
   ↓
2. Encuentras la campaña "Campaña Verano 2025" (Estado: Activa)
   ↓
3. Haces clic en el menú de acciones (⋮)
   ↓
4. Seleccionas "📎 Enviar Creativo"
   ↓
5. Se abre el modal "📎 Gestión de Creativos"
   ↓
6. Ves los creativos actuales:
   - Creativo 1 (activo) ✓
   - Creativo 2 (activo) ✓
   - Creativo 3 (descartado) ⊘
   ↓
7. Agregas un nuevo archivo:
   - Haces clic en "Subir Archivos"
   - Seleccionas "nuevo-creativo.jpg"
   - Aparece en "Archivos Seleccionados"
   ↓
8. También agregas una URL:
   - Ingresas: "https://ejemplo.com/creativo.mp4"
   - Haces clic en "Agregar"
   - Aparece en "URLs Agregadas"
   ↓
9. Descartas un creativo antiguo:
   - Haces clic en 🗑️ en "Creativo 1"
   - Se marca como descartado
   ↓
10. Haces clic en "Subir 2 Item(s)"
    ↓
11. El sistema:
    - Sube el archivo a la API externa
    - Crea los nuevos creativos
    - Descarta el creativo antiguo
    - Genera tarea para TRAFFICKER
    - Muestra mensaje de éxito
    ↓
12. El TRAFFICKER recibe una tarea:
    "Gestionar creativos para: Campaña Verano 2025 - Se ha agregado 
    o modificado un creativo activo. Debe subirse/actualizarse en la 
    plataforma de publicidad"
```

---

## 🎨 Interfaz del Modal

```
┌─────────────────────────────────────────┐
│ 📎 Gestión de Creativos          [X]    │
│ Campaña: [Nombre Campaña]               │
│ 2 / 5 creativos activos                 │
├─────────────────────────────────────────┤
│                                         │
│ ✓ Creativos Activos (2)                │
│ ┌─────────────┐ ┌─────────────┐        │
│ │ Creativo 1  │ │ Creativo 2  │        │
│ │ [⬇️] [🗑️] [✕] │ │ [⬇️] [🗑️] [✕] │        │
│ └─────────────┘ └─────────────┘        │
│                                         │
│ ⊘ Creativos Descartados (1)            │
│ ┌─────────────┐                        │
│ │ Creativo 3  │                        │
│ │ [⬇️] [✓] [✕] │                        │
│ └─────────────┘                        │
│                                         │
│ 📎 Subir Archivos                      │
│ [Drag & Drop area]                     │
│ • archivo1.jpg                         │
│                                         │
│ 🔗 Agregar URLs Externas               │
│ [Input URL] [Agregar]                  │
│ • https://ejemplo.com/video.mp4        │
│                                         │
│ 📋 Items a Subir (2)                   │
│ • 📎 archivo1.jpg                      │
│ • 🔗 https://ejemplo.com/video.mp4     │
│                                         │
│ [Cerrar] [Subir 2 Item(s)]             │
└─────────────────────────────────────────┘
```

---

## ✅ Resumen

**Para cambiar creativos en una campaña activa:**

1. **Abre el menú de acciones** de la campaña activa
2. **Selecciona "📎 Enviar Creativo"**
3. **Agrega, modifica o elimina creativos** según necesites
4. **Haz clic en "Subir X Item(s)"** para guardar los cambios
5. **El sistema genera automáticamente una tarea** para el TRAFFICKER

**¡Es así de simple!** 🚀



