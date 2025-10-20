@echo off
echo Iniciando SISCOCA Backend...
echo.

REM Verificar si Java está instalado
java -version >nul 2>&1
if %errorlevel% neq 0 (
    echo Error: Java no está instalado o no está en el PATH
    echo Por favor instala Java 18 o superior
    pause
    exit /b 1
)

REM Verificar si Maven está instalado
mvn -version >nul 2>&1
if %errorlevel% neq 0 (
    echo Error: Maven no está instalado o no está en el PATH
    echo Por favor instala Maven 3.6 o superior
    pause
    exit /b 1
)

echo Compilando proyecto...
call mvn clean compile

if %errorlevel% neq 0 (
    echo Error en la compilación
    pause
    exit /b 1
)

echo.
echo Iniciando servidor en http://localhost:8080/api
echo Presiona Ctrl+C para detener el servidor
echo.

call mvn spring-boot:run

pause
