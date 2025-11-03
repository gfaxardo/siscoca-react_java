# 🧪 Cómo Probar el Sistema Completo

## 📋 Checklist de Pruebas

### ✅ 1. Login
```bash
# Probar con diferentes usuarios
Username: acruz
Password: siscoca2024

# Verificar:
- [ ] Login exitoso
- [ ] Token guardado
- [ ] Info de usuario correcta
- [ ] Redirección al dashboard
```

### ✅ 2. Ver Tareas Pendientes
```
1. Click en icono de tareas 📋 en el Header
2. Ver lista de tareas
3. Verificar:
   - [ ] Se cargan tareas del usuario actual
   - [ ] Iconos correctos por tipo
   - [ ] Descriptions claras
   - [ ] Botón "Completar" funciona
```

### ✅ 3. Ver Inbox
```
1. Click en icono de inbox 📨 en el Header
2. Ver lista de mensajes
3. Verificar:
   - [ ] Contador de no leídos
   - [ ] Agrupación por campaña
   - [ ] Preview de mensajes
```

### ✅ 4. Chatear por Campaña
```
1. Ver lista de campañas
2. Click en icono de chat 💬 en una campaña
3. Verificar:
   - [ ] Modal se abre
   - [ ] Lista de mensajes se carga
   - [ ] Puedo escribir mensaje
   - [ ] Puedo enviar mensaje
   - [ ] Mensaje aparece en la lista
   - [ ] Opción "urgente" funciona
```

### ✅ 5. Flujo Completo de Trabajo

#### MKT (Ariana)
```
1. Login con acruz:siscoca2024
2. Ver tareas:
   - [ ] "Enviar Creativo" - Campaña X
   - [ ] "Activar Campaña" - Campaña Y
3. Completar una tarea
4. Verificar:
   - [ ] Tarea desaparece de la lista
   - [ ] Nueva tarea aparece si aplica
```

#### TRAFFICKER (Rayedel)
```
1. Login con rortega:siscoca2024
2. Ver tareas:
   - [ ] "Subir Métricas Trafficker" - Varias campañas
3. Click en chat de una campaña
4. Enviar mensaje: "¿Qué tal va?"
5. Verificar:
   - [ ] Mensaje se envía
   - [ ] Aparece en el chat
```

#### DUEÑO (Gonzalo)
```
1. Login con gfajardo2:siscoca2024
2. Ver tareas:
   - [ ] "Subir Métricas Dueño" - Sus campañas
   - [ ] "Archivar Campaña" - Si aplica
3. Click en inbox
4. Verificar:
   - [ ] Ve mensaje de Rayedel
   - [ ] Contador de no leídos
   - [ ] Click en campaña abre chat
```

### ✅ 6. Actualizaciones Automáticas
```
1. Abrir inbox
2. En otra pestaña enviar mensaje
3. Esperar 30 segundos
4. Verificar:
   - [ ] Contador se actualiza
   - [ ] Nuevo mensaje aparece
```

### ✅ 7. Responsive Design
```
1. Abrir en desktop
2. Verificar:
   - [ ] Grid de 3 columnas
   - [ ] Modales centrados
3. Abrir en móvil
4. Verificar:
   - [ ] Grid de 1 columna
   - [ ] Botones táctiles
   - [ ] Modal full-screen
```

---

## 🐛 Problemas Comunes y Soluciones

### Error: "No se pueden cargar tareas"
**Causa:** Backend no está ejecutándose
**Solución:** Ejecutar `mvn spring-boot:run` en backend

### Error: "Tabla no existe"
**Causa:** Migraciones no ejecutadas
**Solución:** Ejecutar `migration_completa.sql` en pgAdmin

### Error: "Invalid token"
**Causa:** Token expirado
**Solución:** Hacer logout y login de nuevo

### Badges no se actualizan
**Causa:** Usuario cerrado la sesión
**Solución:** Verificar que esté autenticado

---

## 📊 Datos de Prueba

### Crear Campaña de Prueba
```json
{
  "pais": "PE",
  "vertical": "MOTOPER",
  "plataforma": "FB",
  "segmento": "Adquisición",
  "nombreDueno": "Gonzalo Fajardo",
  "inicialesDueno": "GF",
  "descripcionCorta": "Test de tareas",
  "objetivo": "Probar sistema",
  "beneficio": "Validar funcionalidad",
  "descripcion": "Campaña de prueba para el sistema de tareas"
}
```

---

## ✅ Pruebas de Integración

### Test 1: Flujo MKT
```
1. Login MKT
2. Ver tarea "Enviar Creativo"
3. Subir creativo
4. Ver nueva tarea "Activar Campaña"
5. Activar campaña
6. Verificar tareas generadas para otros roles
```

### Test 2: Flujo Completo
```
1. Crear campaña
2. MKT envía creativo
3. MKT activa campaña
4. TRAFFICKER sube métricas
5. DUEÑO sube métricas
6. DUEÑO archiva campaña
7. Verificar todo en histórico
```

### Test 3: Comunicación
```
1. TRAFFICKER envía mensaje urgente
2. DUEÑO ve notificación
3. DUEÑO abre chat
4. DUEÑO responde
5. TRAFFICKER ve respuesta
6. Verificar contadores
```

---

## 🎯 Criterios de Éxito

✅ **Login funciona con todos los usuarios**  
✅ **Tareas se generan automáticamente**  
✅ **Asignación correcta por rol**  
✅ **Chat funciona en tiempo real**  
✅ **Notificaciones se actualizan**  
✅ **UI es responsive**  
✅ **Sin errores en consola**  
✅ **API responde correctamente**  

---

**¡Sistema listo para probar!** 🚀


