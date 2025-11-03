@echo off
REM Script para ejecutar migración SQL en PostgreSQL
REM Requiere tener psql en el PATH o ajustar la ruta completa

echo ============================================
echo Ejecutando migración de base de datos...
echo ============================================

REM Establecer variable de entorno para la contraseña
set PGPASSWORD=37>MNA&-35+

REM Ejecutar el script SQL
psql -h 168.119.226.236 -p 5432 -U yego_user -d siscoca_dev -f ejecutar-fix-columnas.sql

REM Limpiar variable de entorno
set PGPASSWORD=

echo ============================================
echo Migración completada
echo ============================================
pause

