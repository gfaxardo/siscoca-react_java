# Sistema de Tareas Pendientes y Chat por Campaña

## 📋 Descripción General

Sistema completo de gestión de tareas pendientes y comunicación por campaña que permite:
- **Generación automática de tareas** según el estado y rol del usuario
- **Chat por campaña** para comunicación entre equipos
- **Dashboard de pendientes** personalizado por usuario
- **Inbox** de mensajes no leídos

---

## 🏗️ Arquitectura

### Backend (Java Spring Boot)

#### Modelos de Datos

**1. TipoTarea (Enum)**
```java
ENVIAR_CREATIVO          → Rol: TRAFFICKER, Estado: PENDIENTE
ACTIVAR_CAMPANA          → Rol: DUEÑO, Estado: CREATIVO_ENVIADO
SUBIR_METRICAS_TRAFFICKER → Rol: TRAFFICKER, Estado: ACTIVA
SUBIR_METRICAS_DUENO     → Rol: DUEÑO, Estado: ACTIVA
ARCHIVAR_CAMPANA         → Rol: DUEÑO, Estado: ACTIVA
```

**2. TareaPendiente**
- `id`: Identificador único
- `tipoTarea`: Tipo de tarea a realizar
- `campana`: Campaña relacionada
- `asignadoA`: Usuario asignado
- `responsableRol`: Rol responsable
- `descripcion`: Descripción de la tarea
- `urgente`: Si es urgente o no
- `completada`: Estado de completitud
- `fechaCreacion` / `fechaCompletada`: Fechas

**3. MensajeChat**
- `id`: Identificador único
- `campana`: Campaña relacionada
- `remitente`: Usuario que envía
- `mensaje`: Contenido del mensaje
- `leido`: Estado de lectura
- `urgente`: Si es urgente
- `fechaCreacion`: Fecha de creación

#### Servicios

**TareaService**
- `generarTareasPendientes()`: Genera tareas para todas las campañas
- `verificarTareasActivas(Campana)`: Verifica y crea tareas para campañas activas
- `getTareasPendientesPorUsuario(String, Rol)`: Obtiene tareas del usuario
- `completarTarea(Long)`: Marca tarea como completada

**ChatService**
- `enviarMensaje(Long, String, String, Boolean)`: Envía mensaje a campaña
- `getMensajesPorCampana(Long)`: Obtiene mensajes de campaña
- `marcarTodosComoLeidos(Long, String)`: Marca mensajes como leídos
- `getMensajesNoLeidosPorUsuario(String)`: Obtiene mensajes sin leer

#### Controladores REST

**TareaController**
- `GET /tareas/pendientes` - Obtiene tareas del usuario autenticado
- `GET /tareas/todas` - Obtiene todas las tareas (ADMIN)
- `GET /tareas/campana/{id}` - Obtiene tareas de una campaña
- `PUT /tareas/{id}/completar` - Marca tarea como completada
- `POST /tareas/generar` - Genera tareas automáticamente

**ChatController**
- `POST /chat/enviar` - Envía mensaje
- `GET /chat/campana/{id}` - Obtiene mensajes de campaña
- `PUT /chat/mensaje/{id}/leer` - Marca mensaje como leído
- `PUT /chat/campana/{id}/marcar-leidos` - Marca todos como leídos
- `GET /chat/no-leidos` - Cuenta mensajes no leídos
- `GET /chat/mensajes-no-leidos` - Lista mensajes no leídos

---

## 🔄 Flujo de Trabajo

### Generación Automática de Tareas

```
1. Usuario crea campaña → Estado: PENDIENTE
   ↓
2. Sistema genera tarea: "ENVIAR_CREATIVO"
   Asignada a: TRAFFICKER
   
3. Trafficker sube creativo → Estado: CREATIVO_ENVIADO
   ↓
4. Sistema genera tarea: "ACTIVAR_CAMPANA"
   Asignada a: DUEÑO
   
5. Dueño activa campaña → Estado: ACTIVA
   ↓
6. Sistema genera tareas:
   - "SUBIR_METRICAS_TRAFFICKER" (Trafficker)
   - "SUBIR_METRICAS_DUENO" (Dueño)
   
7. Cuando ambas métricas están:
   ↓
8. Sistema genera: "ARCHIVAR_CAMPANA"
   Asignada a: DUEÑO
```

### Chat por Campaña

```
Usuario → Envía mensaje → Campaña
          ↓
        Otros usuarios reciben notificación
          ↓
        Marcan como leído
          ↓
        Responden en el chat
```

---

## 📊 Integración con CampanaService

El sistema se integra automáticamente:

```java
// Al crear campaña
Campana savedCampana = campanaRepository.save(campana);
tareaService.generarTareasPendientes(); // ← Genera tareas

// Al actualizar campaña con métricas
tareaService.verificarTareasActivas(campana); // ← Actualiza tareas
```

---

## 🎯 Casos de Uso

### Caso 1: Trafficker entra al sistema

**Dashboard muestra:**
```
📋 Tareas Pendientes (2)
━━━━━━━━━━━━━━━━━━━━
1. Enviar Creativo - Campaña: "Facebook Ads Moto"
2. Subir Métricas - Campaña: "TikTok Ads Cargo"

📨 Inbox (3 mensajes sin leer)
━━━━━━━━━━━━━━━━━━━━
- Campaña "Facebook Ads Moto": 2 mensajes
- Campaña "TikTok Ads Cargo": 1 mensaje
```

### Caso 2: Dueño entra al sistema

**Dashboard muestra:**
```
📋 Tareas Pendientes (3)
━━━━━━━━━━━━━━━━━━━━
1. Activar Campaña - Campaña: "Facebook Ads Moto"
2. Subir Métricas Dueño - Campaña: "TikTok Ads Cargo"
3. Archivar Campaña - Campaña: "Google Ads Auto"

📨 Inbox (1 mensaje sin leer)
━━━━━━━━━━━━━━━━━━━━
- Campaña "TikTok Ads Cargo": 1 mensaje
```

### Caso 3: Comunicación en campaña

```
Usuario abre campaña → Ve chat lateral
                   ↓
                 Escribe: "¿Qué tal va la campaña?"
                   ↓
                 Envía mensaje
                   ↓
        Otros usuarios reciben notificación
```

---

## 🔧 Configuración

### Base de Datos

Ejecutar migration:
```bash
psql -U usuario -d siscoca -f backend/migrations/create_tareas_chat.sql
```

### Backend

Los servicios se autoconfiguran con `@Autowired`:
- TareaService
- ChatService
- CampanaService (actualizado)

---

## 📱 Frontend (Próximos Pasos)

### Componentes a Crear

1. **DashboardTareas.tsx**
   - Lista de tareas pendientes
   - Contador de mensajes sin leer
   - Badges de urgencia

2. **ChatCampana.tsx**
   - Interfaz de chat
   - Lista de mensajes
   - Input de envío
   - Indicadores de lectura

3. **InboxMessages.tsx**
   - Lista de campañas con mensajes
   - Vista previa de últimos mensajes
   - Marcar como leído

### Servicios Frontend

```typescript
// tareaService.ts
getTareasPendientes()
completarTarea(id)

// chatService.ts
enviarMensaje(campanaId, mensaje, urgente)
getMensajesPorCampana(id)
marcarComoLeido(mensajeId)
```

---

## ✅ Testing

### Pruebas Backend

```bash
# Compilar
mvn clean install

# Ejecutar tests
mvn test
```

### Pruebas Manuales

1. Crear campaña → Verificar generación de tarea
2. Subir creativo → Verificar cambio de tarea
3. Activar campaña → Verificar tareas activas
4. Enviar mensaje → Verificar en chat
5. Marcar tarea completada → Verificar actualización

---

## 🚀 Próximas Mejoras

- [ ] Notificaciones en tiempo real (WebSockets)
- [ ] Recordatorios de tareas vencidas
- [ ] Filtros avanzados de tareas
- [ ] Priorización automática de tareas
- [ ] Adjuntos en chat
- [ ] Búsqueda de mensajes
- [ ] Exportar reporte de tareas

---

## 📝 Notas Técnicas

### Dependencias Circulares

Se resolvieron las dependencias entre `TareaService` y `CampanaService` usando `@Lazy` donde fue necesario.

### Optimizaciones

- Índices en BD para consultas rápidas
- Lazy loading de relaciones
- Caché de tareas frecuentes (futuro)

### Seguridad

- Autenticación JWT requerida
- Filtrado por rol en endpoints
- Validación de permisos

---

## 🤝 Contribución

Para agregar nuevas tareas:
1. Agregar tipo en enum `TipoTarea`
2. Implementar lógica en `TareaService`
3. Actualizar flujo en `CampanaService`
4. Crear componentes frontend

---

**Fecha de creación:** 2024
**Versión:** 1.0
**Estado:** Backend completado, Frontend pendiente


