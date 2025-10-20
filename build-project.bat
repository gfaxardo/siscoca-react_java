@echo off
echo ========================================
echo    SISCOCA 2.0 - Build Completo
echo ========================================
echo.

echo Construyendo Frontend...
echo.
cd frontend
call npm run build
if %errorlevel% neq 0 (
    echo Error construyendo el frontend
    pause
    exit /b 1
)
echo Frontend construido exitosamente
echo.

echo Construyendo Backend...
echo.
cd ..\backend
call mvn clean package -DskipTests
if %errorlevel% neq 0 (
    echo Error construyendo el backend
    pause
    exit /b 1
)
echo Backend construido exitosamente
echo.

echo ========================================
echo    Build completado exitosamente
echo ========================================
echo.
echo Frontend: frontend/dist/
echo Backend:  backend/target/siscoca-backend-2.0.0.jar
echo.
pause
