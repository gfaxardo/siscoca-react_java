@echo off
echo 🚀 Iniciando despliegue de SISCOCA 2.0...

REM Verificar que Docker esté instalado
docker --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Docker no está instalado. Por favor instala Docker primero.
    exit /b 1
)

REM Verificar que Docker Compose esté instalado
docker-compose --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Docker Compose no está instalado. Por favor instala Docker Compose primero.
    exit /b 1
)

REM Crear archivo .env si no existe
if not exist .env (
    echo 📝 Creando archivo .env...
    echo # Base de datos > .env
    echo DATABASE_NAME=siscoca_prod >> .env
    echo DATABASE_USERNAME=siscoca_user >> .env
    echo DATABASE_PASSWORD=password_segura_123 >> .env
    echo. >> .env
    echo # JWT >> .env
    echo JWT_SECRET=siscoca_jwt_secret_key_2024_very_secure_key_for_production >> .env
    echo. >> .env
    echo # URLs >> .env
    echo FRONTEND_URL=https://siscoca.tudominio.com >> .env
    echo VITE_API_URL=https://api.siscoca.tudominio.com/api >> .env
    echo. >> .env
    echo # Uploads >> .env
    echo UPLOAD_DIR=/app/uploads/creativos >> .env
    echo LOG_FILE=/app/logs/siscoca.log >> .env
    echo ✅ Archivo .env creado. Por favor revisa y actualiza las URLs según tu dominio.
)

REM Construir imágenes
echo 🔨 Construyendo imágenes Docker...
docker-compose -f docker-compose.prod.yml build

REM Iniciar servicios
echo 🚀 Iniciando servicios...
docker-compose -f docker-compose.prod.yml up -d

echo ✅ Despliegue completado!
echo 🌐 Frontend: http://localhost:3000
echo 🔧 Backend: http://localhost:8080/api
echo 📊 Base de datos: localhost:5432

echo.
echo 📋 Para ver los logs:
echo docker-compose -f docker-compose.prod.yml logs -f
echo.
echo 🛑 Para detener:
echo docker-compose -f docker-compose.prod.yml down

pause
