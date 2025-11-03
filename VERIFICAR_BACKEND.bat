@echo off
echo ==========================================
echo VERIFICACION DEL BACKEND SISCOCA
echo ==========================================
echo.

echo [1] Verificando proceso Java...
tasklist | findstr java.exe
if %errorlevel% == 0 (
    echo [OK] Proceso Java encontrado
) else (
    echo [ERROR] No hay procesos Java corriendo
)
echo.

echo [2] Verificando puerto 8080 (configurado en application.yml)...
netstat -ano | findstr :8080
if %errorlevel% == 0 (
    echo [OK] Puerto 8080 esta en uso
) else (
    echo [ERROR] Puerto 8080 no esta en uso
)
echo.

echo [3] Verificando puerto 8000...
netstat -ano | findstr :8000
if %errorlevel% == 0 (
    echo [OK] Puerto 8000 esta en uso
) else (
    echo [INFO] Puerto 8000 no esta en uso
)
echo.

echo [4] Intentando conexion HTTP al backend...
curl -s -o nul -w "Status: %%{http_code}\n" http://localhost:8080/api/auth/login
if %errorlevel% == 0 (
    echo [OK] Backend responde en puerto 8080
) else (
    echo [ERROR] Backend no responde en puerto 8080
)
echo.

echo ==========================================
echo CONFIGURACION ESPERADA:
echo - Puerto: 8080 (según application.yml)
echo - URL Base: http://localhost:8080/api
echo - Endpoint Login: http://localhost:8080/api/auth/login
echo ==========================================
pause


