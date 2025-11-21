# 🎯 SISCOCA 2.0 - Frontend (React)

![React](https://img.shields.io/badge/React-18.3-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38bdf8)
![Vite](https://img.shields.io/badge/Vite-6.0-646cff)

Frontend del Sistema de Gestión de Campañas desarrollado con React, TypeScript y Tailwind CSS.

## 📋 Características

### ✅ Funcionalidades Principales

- **Gestión de Campañas**: Crear, editar y eliminar campañas
- **Métricas de Trafficker**: Alcance, clics, leads, costos
- **Métricas del Dueño**: Conductores registrados y primer viaje
- **Dashboard Interactivo**: Visualización de estadísticas en tiempo real
- **Histórico Semanal**: Archivo automático de datos
- **Cálculos Automáticos**: Costos por lead y conductor
- **Estados de Campaña**: Pendiente, Creativo Enviado, Activa, Archivada

### 🎨 Diseño y UX

- **Interfaz Moderna**: UI/UX optimizada con Tailwind CSS v3
- **Responsive Design**: Adaptado a todos los dispositivos
- **Componentes Reutilizables**: Arquitectura modular
- **Validación de Formularios**: Con React Hook Form + Zod
- **Gestión de Estado**: Zustand con persistencia en localStorage

## 🚀 Tecnologías

### Frontend
- **React 18.3** - Framework UI
- **TypeScript 5.7** - Tipado estático
- **Tailwind CSS 3.4** - Framework CSS utility-first
- **Vite 6.0** - Build tool y dev server
- **Zustand 5.0** - Gestión de estado
- **React Hook Form 7.54** - Manejo de formularios
- **Zod 3.24** - Validación de esquemas

### Backend
- **Java 18** - Lenguaje de programación
- **Spring Boot 3.2.0** - Framework de aplicación
- **PostgreSQL** - Base de datos
- **Spring Security** - Autenticación y autorización
- **JWT** - Tokens de sesión
- **Maven** - Gestión de dependencias

## 📦 Instalación y Configuración

### 1. Backend (Java)

```bash
cd siscoca-backend

# Configurar base de datos PostgreSQL
# Crear base de datos: siscoca_db
# Usuario: siscoca_user
# Contraseña: siscoca_password

# Ejecutar backend
./start-backend.sh  # Linux/Mac
# o
start-backend.bat   # Windows
```

### 2. Frontend (React)

```bash
# En el directorio raíz del proyecto
npm install
npm run dev
```

## 🗄️ Configuración de Base de Datos

1. Instalar PostgreSQL
2. Crear base de datos:
   ```sql
   CREATE DATABASE siscoca_db;
   CREATE USER siscoca_user WITH PASSWORD 'siscoca_password';
   GRANT ALL PRIVILEGES ON DATABASE siscoca_db TO siscoca_user;
   ```
3. El backend creará las tablas automáticamente

## 🔐 Usuarios por defecto

| Usuario | Contraseña | Rol |
|---------|------------|-----|
| admin | password123 | Admin |
| trafficker1 | password123 | Trafficker |
| dueno1 | password123 | Dueño |

## 📡 API Endpoints

### Autenticación
- `POST /api/auth/login` - Iniciar sesión
- `POST /api/auth/logout` - Cerrar sesión

### Campañas
- `GET /api/campanas` - Obtener todas las campañas
- `GET /api/campanas/{id}` - Obtener campaña por ID
- `POST /api/campanas` - Crear nueva campaña
- `PUT /api/campanas/{id}` - Actualizar campaña
- `DELETE /api/campanas/{id}` - Eliminar campaña
- `GET /api/campanas/estado/{estado}` - Obtener campañas por estado
- `GET /api/campanas/dueno/{nombreDueno}` - Obtener campañas por dueño

## 🏗️ Estructura del Proyecto

```
siscoca-react/
├── src/                    # Frontend React
│   ├── components/         # Componentes React
│   │   ├── Layout/        # Layout principal
│   │   ├── Campanas/      # Gestión de campañas
│   │   ├── Dashboard/     # Panel principal
│   │   └── Historico/     # Vista histórica
│   ├── services/          # Servicios de API
│   ├── store/             # Estado global (Zustand)
│   └── types/             # Tipos TypeScript
└── siscoca-backend/       # Backend Java
    ├── src/main/java/     # Código Java
    │   ├── config/        # Configuraciones
    │   ├── controller/    # Controladores REST
    │   ├── dto/           # Data Transfer Objects
    │   ├── model/         # Entidades JPA
    │   ├── repository/    # Repositorios de datos
    │   └── service/       # Lógica de negocio
    ├── src/main/resources/ # Configuración
    └── pom.xml           # Dependencias Maven
```

## 📖 Uso del Sistema

### Crear Nueva Campaña

1. Ir a la vista "Campañas"
2. Clic en "Nueva Campaña"
3. Llenar el formulario con:
   - País, Vertical, Plataforma
   - Segmento (Adquisición, Retención, Retorno)
   - Dueño y descripción
4. Clic en "Crear Campaña"

### Subir Métricas del Trafficker

1. Seleccionar una campaña en estado "Activa"
2. Clic en "📊 Trafficker"
3. Completar:
   - URL del informe (opcional)
   - Alcance, Clics, Leads
   - Costo Semanal (en USD)
4. Clic en "Subir Métricas"

### Completar Métricas del Dueño

1. Seleccionar una campaña con métricas de trafficker
2. Clic en "👥 Dueño"
3. Ingresar:
   - Conductores Registrados
   - Conductores con Primer Viaje
4. Clic en "Completar Métricas"
5. Los costos se calculan automáticamente en USD

## 🔧 Scripts Disponibles

### Frontend
```bash
npm run dev      # Modo desarrollo
npm run build    # Build para producción
npm run preview  # Preview del build
npm run lint     # Linting
```

### Backend
```bash
mvn spring-boot:run  # Ejecutar en modo desarrollo
mvn clean package    # Compilar para producción
mvn test            # Ejecutar tests
```

## 🚀 Deploy

### Frontend
```bash
npm run build
# Los archivos se generan en /dist
```

### Backend
```bash
mvn clean package
# El JAR se genera en /target
java -jar target/siscoca-backend-2.0.0.jar
```

## 🔧 Variables de Entorno

### Frontend
Crear archivo `.env`:
```env
VITE_API_URL=http://localhost:8081/api
VITE_APP_TITLE=SISCOCA 2.0
```

### Backend
Editar `src/main/resources/application.yml`:
```yaml
spring:
  datasource:
    url: jdbc:postgresql://localhost:5432/siscoca_db
    username: siscoca_user
    password: siscoca_password
```

## 🤝 Contribuir

1. Fork el proyecto
2. Crear branch de feature (`git checkout -b feature/AmazingFeature`)
3. Commit cambios (`git commit -m 'Add AmazingFeature'`)
4. Push al branch (`git push origin feature/AmazingFeature`)
5. Abrir Pull Request

## 📝 Notas Importantes

- El frontend se conecta al backend en `http://localhost:8081/api`
- El backend está configurado para CORS con los puertos 3000 y 5173
- Las contraseñas se almacenan encriptadas con BCrypt
- La autenticación se realiza mediante JWT tokens
- La base de datos se crea automáticamente al iniciar el backend
- **Todas las cantidades monetarias se manejan en USD (Dólares)**

## 📄 Licencia

Este proyecto está bajo la Licencia MIT.

## 👥 Equipo

Desarrollado para modernizar el sistema SISCOCA original de Google Apps Script.

---

**¿Preguntas o sugerencias?** Abre un issue en el repositorio.