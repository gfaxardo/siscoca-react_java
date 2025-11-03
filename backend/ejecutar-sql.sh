#!/bin/bash
# Script para ejecutar migración SQL en PostgreSQL
# Requiere tener psql instalado y en el PATH

echo "============================================"
echo "Ejecutando migración de base de datos..."
echo "============================================"

# Establecer variable de entorno para la contraseña
export PGPASSWORD='37>MNA&-35+'

# Ejecutar el script SQL
psql -h 168.119.226.236 -p 5432 -U yego_user -d siscoca_dev -f ejecutar-fix-columnas.sql

# Limpiar variable de entorno
unset PGPASSWORD

echo "============================================"
echo "Migración completada"
echo "============================================"

