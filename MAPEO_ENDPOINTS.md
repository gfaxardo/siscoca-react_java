# 🔗 Mapeo de Endpoints - SISCOCA 2.0

## 📋 Resumen de Endpoints Configurados

### **🔐 Autenticación (`/api/auth`)**
| Método | Endpoint | Descripción | Frontend |
|--------|----------|-------------|----------|
| POST | `/api/auth/login` | Iniciar sesión | `authService.login()` |
| POST | `/api/auth/logout` | Cerrar sesión | `authService.logout()` |

### **📊 Campañas (`/api/campanas`)**
| Método | Endpoint | Descripción | Frontend |
|--------|----------|-------------|----------|
| GET | `/api/campanas` | Obtener todas las campañas | `campanaService.obtenerCampanas()` |
| GET | `/api/campanas/{id}` | Obtener campaña por ID | `campanaService.obtenerCampanaPorId()` |
| POST | `/api/campanas` | Crear nueva campaña | `campanaService.crearCampana()` |
| PUT | `/api/campanas/{id}` | Actualizar campaña | `campanaService.actualizarCampana()` |
| DELETE | `/api/campanas/{id}` | Eliminar campaña | `campanaService.eliminarCampana()` |
| GET | `/api/campanas/estado/{estado}` | Campañas por estado | `campanaService.obtenerCampanasPorEstado()` |
| GET | `/api/campanas/dueno/{nombre}` | Campañas por dueño | `campanaService.obtenerCampanasPorDueno()` |

### **📁 Archivos (`/api/files`)**
| Método | Endpoint | Descripción | Frontend |
|--------|----------|-------------|----------|
| POST | `/api/files/upload` | Subir archivo creativo | `fileService.subirArchivo()` |
| GET | `/api/files/download/{filename}` | Descargar archivo | `fileService.descargarArchivo()` |
| DELETE | `/api/files/{filename}` | Eliminar archivo | `fileService.eliminarArchivo()` |

### **📈 Histórico (`/api/historico`)**
| Método | Endpoint | Descripción | Frontend |
|--------|----------|-------------|----------|
| GET | `/api/historico/campana/{campanaId}` | Histórico por campaña | `historicoService.obtenerHistoricoPorCampana()` |
| GET | `/api/historico/semana/{semanaISO}` | Histórico por semana | `historicoService.obtenerHistoricoPorSemana()` |
| POST | `/api/historico` | Crear registro histórico | `historicoService.crearRegistroHistorico()` |
| PUT | `/api/historico/{id}` | Actualizar registro | `historicoService.actualizarRegistroHistorico()` |
| DELETE | `/api/historico/{id}` | Eliminar registro | `historicoService.eliminarRegistroHistorico()` |

### **📝 Logging (`/api/logging`)**
| Método | Endpoint | Descripción | Frontend |
|--------|----------|-------------|----------|
| GET | `/api/logging` | Obtener logs con filtros | `loggingService.obtenerLogs()` |
| GET | `/api/logging/entidad/{entidadId}` | Logs por entidad | `loggingService.obtenerLogsPorEntidad()` |
| GET | `/api/logging/usuario/{usuario}` | Logs por usuario | `loggingService.obtenerLogsPorUsuario()` |
| GET | `/api/logging/recientes` | Logs recientes | `loggingService.obtenerLogsRecientes()` |
| GET | `/api/logging/estadisticas` | Estadísticas de logs | `loggingService.obtenerEstadisticas()` |
| DELETE | `/api/logging` | Limpiar todos los logs | `loggingService.limpiarLogs()` |

## 🔧 Configuración de Base de Datos

### **Conexión Actual:**
```yaml
datasource:
  url: jdbc:postgresql://168.119.226.236:5432/siscoca_dev
  username: yego_user
  password: 37>MNA&-35+
```

### **Tablas Principales:**
- `usuarios` - Usuarios del sistema
- `campanas` - Campañas publicitarias
- `log_entries` - Registros de auditoría
- `historico_semanal` - Histórico semanal de métricas

## 🚀 Servicios del Frontend

### **authService.ts**
- ✅ Conectado a `/api/auth`
- ✅ Manejo de tokens JWT
- ✅ Almacenamiento en localStorage

### **campanaService.ts**
- ✅ Conectado a `/api/campanas`
- ✅ CRUD completo de campañas
- ✅ Filtros por estado y dueño

### **loggingService.ts**
- ✅ Conectado a `/api/logging`
- ✅ Filtros avanzados
- ✅ Estadísticas

## 🔄 Flujo de Datos

```
Frontend (React) → API (Spring Boot) → Base de Datos (PostgreSQL)
     ↓                    ↓                      ↓
authService.ts    →   AuthController    →    UsuarioRepository
campanaService.ts →  CampanaController  →   CampanaRepository
loggingService.ts → LoggingController  →   LogEntryRepository
```

## ✅ Estado Actual

### **Completado:**
- ✅ Controladores del backend
- ✅ Servicios del backend
- ✅ Repositorios actualizados
- ✅ Servicios del frontend
- ✅ Mapeo de endpoints
- ✅ Configuración de base de datos

### **Pendiente:**
- ⏳ Pruebas de integración
- ⏳ Validación de endpoints
- ⏳ Configuración de CORS
- ⏳ Manejo de errores

## 🧪 Pruebas Recomendadas

1. **Probar autenticación:**
   ```bash
   curl -X POST http://localhost:8080/api/auth/login \
     -H "Content-Type: application/json" \
     -d '{"username":"test","password":"test"}'
   ```

2. **Probar campañas:**
   ```bash
   curl -X GET http://localhost:8080/api/campanas \
     -H "Authorization: Bearer YOUR_TOKEN"
   ```

3. **Probar logging:**
   ```bash
   curl -X GET http://localhost:8080/api/logging \
     -H "Authorization: Bearer YOUR_TOKEN"
   ```

## 📝 Notas Importantes

- Todos los endpoints requieren autenticación (excepto login)
- Los archivos se suben a `./uploads/creativos/`
- Los logs se almacenan en la base de datos
- CORS configurado para `localhost:3000` y `localhost:5173`
