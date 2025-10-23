# 🚀 Guía de Despliegue - SISCOCA 2.0

## Opciones de Despliegue

### 1. DigitalOcean App Platform (RECOMENDADA)

#### Ventajas:
- ✅ Configuración simple
- ✅ SSL automático
- ✅ Escalado automático
- ✅ Precio: ~$12-25/mes
- ✅ Soporte nativo para Docker

#### Pasos:
1. **Crear cuenta en DigitalOcean**
   - Ve a https://digitalocean.com
   - Crea una cuenta gratuita

2. **Conectar repositorio**
   - Ve a App Platform
   - Conecta tu repositorio GitHub
   - Selecciona el repositorio SISCOCA

3. **Configurar servicios**
   - **Frontend**: Usar el Dockerfile del frontend
   - **Backend**: Usar el Dockerfile del backend
   - **Base de datos**: Crear una base de datos PostgreSQL

4. **Variables de entorno**
   ```
   DATABASE_URL=jdbc:postgresql://db:5432/siscoca_prod
   DATABASE_USERNAME=siscoca_user
   DATABASE_PASSWORD=tu_password_seguro
   JWT_SECRET=tu_jwt_secret_muy_seguro
   FRONTEND_URL=https://tu-app.ondigitalocean.app
   ```

### 2. VPS DigitalOcean (Alternativa)

#### Ventajas:
- ✅ Control total
- ✅ Precio fijo (~$5-20/mes)
- ✅ Flexibilidad completa

#### Pasos:
1. **Crear Droplet**
   - Ubuntu 22.04 LTS
   - Mínimo 2GB RAM, 1 CPU
   - Habilitar backups

2. **Configurar servidor**
   ```bash
   # Actualizar sistema
   sudo apt update && sudo apt upgrade -y
   
   # Instalar Docker
   curl -fsSL https://get.docker.com -o get-docker.sh
   sudo sh get-docker.sh
   sudo usermod -aG docker $USER
   
   # Instalar Docker Compose
   sudo curl -L "https://github.com/docker/compose/releases/download/v2.20.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
   sudo chmod +x /usr/local/bin/docker-compose
   ```

3. **Clonar y desplegar**
   ```bash
   git clone https://github.com/tu-usuario/siscoca.git
   cd siscoca
   ./deploy.sh
   ```

4. **Configurar dominio**
   - Apuntar tu dominio al IP del servidor
   - Configurar SSL con Let's Encrypt

### 3. Heroku (Simple pero limitado)

#### Ventajas:
- ✅ Muy fácil
- ✅ SSL automático
- ✅ Despliegue con Git

#### Desventajas:
- ❌ Más caro
- ❌ Limitaciones de recursos
- ❌ No soporte nativo para Docker

## Configuración de Dominio

### 1. Comprar dominio
- Recomendado: Namecheap, GoDaddy, o Google Domains
- Precio: ~$10-15/año

### 2. Configurar DNS
```
A     @           tu-ip-servidor
A     www         tu-ip-servidor
A     api         tu-ip-servidor
CNAME siscoca     tu-app.ondigitalocean.app
```

### 3. SSL automático
- DigitalOcean App Platform: Automático
- VPS: Usar Let's Encrypt con Certbot

## Variables de Entorno Necesarias

```bash
# Base de datos
DATABASE_NAME=siscoca_prod
DATABASE_USERNAME=siscoca_user
DATABASE_PASSWORD=password_muy_seguro_123

# JWT
JWT_SECRET=clave_jwt_muy_segura_de_64_caracteres_minimo

# URLs
FRONTEND_URL=https://siscoca.tudominio.com
VITE_API_URL=https://api.siscoca.tudominio.com/api

# Uploads
UPLOAD_DIR=/app/uploads/creativos
LOG_FILE=/app/logs/siscoca.log
```

## Comandos Útiles

### Desarrollo local
```bash
# Iniciar desarrollo
docker-compose up -d

# Ver logs
docker-compose logs -f

# Detener
docker-compose down
```

### Producción
```bash
# Desplegar
./deploy.sh

# Ver logs
docker-compose -f docker-compose.prod.yml logs -f

# Detener
docker-compose -f docker-compose.prod.yml down

# Actualizar
git pull
docker-compose -f docker-compose.prod.yml up -d --build
```

## Monitoreo y Mantenimiento

### 1. Logs
- Revisar logs regularmente
- Configurar alertas por errores

### 2. Backups
- Backup automático de base de datos
- Backup de archivos subidos

### 3. Actualizaciones
- Actualizar dependencias regularmente
- Aplicar parches de seguridad

## Costos Estimados

### DigitalOcean App Platform
- **Básico**: $12/mes (1 CPU, 512MB RAM)
- **Estándar**: $24/mes (1 CPU, 1GB RAM)
- **Base de datos**: $15/mes adicional

### VPS DigitalOcean
- **Droplet básico**: $5/mes (1 CPU, 512MB RAM)
- **Droplet estándar**: $10/mes (1 CPU, 1GB RAM)
- **Dominio**: $10-15/año

### Total estimado: $15-40/mes
