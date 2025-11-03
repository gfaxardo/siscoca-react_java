@echo off
echo ============================================
echo   EJECUTANDO MIGRACIONES DE SISCOCA
echo ============================================
echo.

echo [1/2] Agregando campo iniciales a usuarios...
psql -U postgres -d siscoca -f backend/migrations/add_iniciales_usuarios.sql

echo.
echo [2/2] Creando tablas de tareas y chat...
psql -U postgres -d siscoca -f backend/migrations/create_tareas_chat.sql

echo.
echo ============================================
echo   MIGRACIONES COMPLETADAS
echo ============================================
pause


