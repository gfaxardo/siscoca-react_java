#!/bin/bash

echo "🚀 Iniciando despliegue de SISCOCA 2.0..."

# Verificar que Docker esté instalado
if ! command -v docker &> /dev/null; then
    echo "❌ Docker no está instalado. Por favor instala Docker primero."
    exit 1
fi

# Verificar que Docker Compose esté instalado
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose no está instalado. Por favor instala Docker Compose primero."
    exit 1
fi

# Crear archivo .env si no existe
if [ ! -f .env ]; then
    echo "📝 Creando archivo .env..."
    cat > .env << EOF
# Base de datos
DATABASE_NAME=siscoca_prod
DATABASE_USERNAME=siscoca_user
DATABASE_PASSWORD=$(openssl rand -base64 32)

# JWT
JWT_SECRET=$(openssl rand -base64 64)

# URLs
FRONTEND_URL=https://siscoca.tudominio.com
VITE_API_URL=https://api.siscoca.tudominio.com/api

# Uploads
UPLOAD_DIR=/app/uploads/creativos
LOG_FILE=/app/logs/siscoca.log
EOF
    echo "✅ Archivo .env creado. Por favor revisa y actualiza las URLs según tu dominio."
fi

# Construir imágenes
echo "🔨 Construyendo imágenes Docker..."
docker-compose -f docker-compose.prod.yml build

# Iniciar servicios
echo "🚀 Iniciando servicios..."
docker-compose -f docker-compose.prod.yml up -d

echo "✅ Despliegue completado!"
echo "🌐 Frontend: http://localhost:3000"
echo "🔧 Backend: http://localhost:8080/api"
echo "📊 Base de datos: localhost:5432"

echo ""
echo "📋 Para ver los logs:"
echo "docker-compose -f docker-compose.prod.yml logs -f"
echo ""
echo "🛑 Para detener:"
echo "docker-compose -f docker-compose.prod.yml down"
