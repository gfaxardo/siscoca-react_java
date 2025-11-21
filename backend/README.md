# 🎯 SISCOCA 2.0 - Backend (Java)

![Java](https://img.shields.io/badge/Java-18-orange)
![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.2-green)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-12-blue)
![Maven](https://img.shields.io/badge/Maven-3.6+-red)

Backend del Sistema de Gestión de Campañas desarrollado en Java 18 con Spring Boot.

## Características

- **Java 18** con Spring Boot 3.2.0
- **Base de datos**: PostgreSQL
- **Autenticación**: JWT (JSON Web Tokens)
- **Seguridad**: Spring Security
- **API REST**: Endpoints para gestión de campañas
- **CORS**: Configurado para frontend React
- **Moneda**: Todas las cantidades monetarias en USD (Dólares)

## Requisitos

- Java 18 o superior
- Maven 3.6+
- PostgreSQL 12+

## Configuración

### 1. Base de datos

Crear la base de datos PostgreSQL:

```sql
CREATE DATABASE siscoca_db;
CREATE USER siscoca_user WITH PASSWORD 'siscoca_password';
GRANT ALL PRIVILEGES ON DATABASE siscoca_db TO siscoca_user;
```

### 2. Configuración de aplicación

Editar `src/main/resources/application.yml` con tus configuraciones:

```yaml
spring:
  datasource:
    url: jdbc:postgresql://localhost:5432/siscoca_db
    username: siscoca_user
    password: siscoca_password
```

## Instalación y ejecución

### 1. Clonar y compilar

```bash
cd siscoca-backend
mvn clean install
```

### 2. Ejecutar la aplicación

```bash
mvn spring-boot:run
```

La API estará disponible en: `http://localhost:8081/api`

## Endpoints disponibles

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

## Usuarios por defecto

| Usuario | Contraseña | Rol |
|---------|------------|-----|
| admin | password123 | Admin |
| trafficker1 | password123 | Trafficker |
| dueno1 | password123 | Dueño |

## Estructura del proyecto

```
src/main/java/com/siscoca/
├── config/          # Configuraciones (Security, CORS)
├── controller/      # Controladores REST
├── dto/            # Data Transfer Objects
├── model/          # Entidades JPA
├── repository/     # Repositorios de datos
├── service/        # Lógica de negocio
└── SiscocaBackendApplication.java
```

## Tecnologías utilizadas

- **Spring Boot 3.2.0**
- **Spring Security 6**
- **Spring Data JPA**
- **PostgreSQL**
- **JWT (jjwt)**
- **Maven**
- **Jakarta Validation**

## Desarrollo

### Ejecutar en modo desarrollo

```bash
mvn spring-boot:run -Dspring-boot.run.profiles=dev
```

### Ejecutar tests

```bash
mvn test
```

## Notas importantes

- El backend está configurado para CORS con los puertos 3000 y 5173 (Vite)
- La autenticación se realiza mediante JWT tokens
- Las contraseñas se almacenan encriptadas con BCrypt
- La base de datos se crea automáticamente al iniciar la aplicación
