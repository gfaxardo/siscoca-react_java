@echo off
echo ============================================
echo   INSTALACION COMPLETA DE SISCOCA
echo ============================================
echo.

echo PASO 1: Ejecutar migraciones de base de datos
echo ------------------------------------------------
call EJECUTAR_MIGRACIONES.bat

echo.
echo PASO 2: Compilar y ejecutar backend
echo ------------------------------------------------
call COMPILAR_Y_EJECUTAR.bat

pause


