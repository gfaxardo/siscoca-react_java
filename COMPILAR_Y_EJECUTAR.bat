@echo off
echo ============================================
echo   COMPILANDO Y EJECUTANDO SISCOCA BACKEND
echo ============================================
echo.

cd backend

echo [1/2] Compilando proyecto...
call mvn clean install -DskipTests

echo.
echo [2/2] Ejecutando aplicación...
call mvn spring-boot:run

pause


