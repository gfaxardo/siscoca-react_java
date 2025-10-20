@echo off
echo ========================================
echo    SISCOCA 2.0 - Sistema Completo
echo ========================================
echo.

echo Iniciando Backend...
echo.
cd backend
start "SISCOCA Backend" cmd /k "start-backend.bat"
echo Backend iniciado en http://localhost:8080/api
echo.

echo Esperando 5 segundos para que el backend se inicie...
timeout /t 5 /nobreak >nul

echo.
echo Iniciando Frontend...
echo.
cd ..\frontend
start "SISCOCA Frontend" cmd /k "npm run dev"
echo Frontend iniciado en http://localhost:5173
echo.

echo ========================================
echo    Sistema iniciado correctamente
echo ========================================
echo.
echo Backend:  http://localhost:8080/api
echo Frontend: http://localhost:5173
echo.
echo Presiona cualquier tecla para cerrar...
pause >nul
