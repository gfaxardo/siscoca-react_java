#!/bin/bash
# Script para ejecutar la migración de creativos en PostgreSQL
# Ejecutar desde terminal: bash ejecutar-migracion-creativos.sh

echo "=========================================="
echo "   MIGRACIÓN: CREAR TABLA CREATIVOS"
echo "=========================================="
echo ""

# Configuración de la base de datos
HOST="168.119.226.236"
PORT="5432"
DATABASE="siscoca_dev"
USERNAME="yego_user"
PASSWORD="37>MNA&-35+"
ARCHIVO_MIGRACION="create_tabla_creativos.sql"

# Obtener el directorio del script
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
RUTA_ARCHIVO="$SCRIPT_DIR/$ARCHIVO_MIGRACION"

# Verificar que el archivo de migración existe
if [ ! -f "$RUTA_ARCHIVO" ]; then
    echo "❌ Error: No se encontró el archivo $ARCHIVO_MIGRACION"
    echo "   Ruta esperada: $RUTA_ARCHIVO"
    exit 1
fi

echo "✅ Archivo de migración encontrado: $RUTA_ARCHIVO"
echo ""

# Verificar si psql está instalado
if ! command -v psql &> /dev/null; then
    echo "❌ Error: psql no está instalado o no está en el PATH"
    echo ""
    echo "Instala PostgreSQL desde: https://www.postgresql.org/download/"
    echo ""
    echo "O ejecuta manualmente:"
    echo "   psql -h $HOST -p $PORT -U $USERNAME -d $DATABASE -f \"$RUTA_ARCHIVO\""
    exit 1
fi

echo "✅ psql encontrado: $(which psql)"
echo ""

# Crear variable de entorno temporal para la contraseña
export PGPASSWORD="$PASSWORD"

echo "Conectando a la base de datos..."
echo "   Host: $HOST"
echo "   Puerto: $PORT"
echo "   Base de datos: $DATABASE"
echo "   Usuario: $USERNAME"
echo ""

# Ejecutar la migración
echo "Ejecutando migración..."
echo ""

if psql -h "$HOST" -p "$PORT" -U "$USERNAME" -d "$DATABASE" -f "$RUTA_ARCHIVO"; then
    echo ""
    echo "=========================================="
    echo "   ✅ MIGRACIÓN EJECUTADA EXITOSAMENTE"
    echo "=========================================="
    echo ""
    echo "La tabla 'creativos' ha sido creada correctamente."
    echo ""
    echo "Próximos pasos:"
    echo "1. Reinicia el backend de Spring Boot"
    echo "2. Verifica que la aplicación se conecte correctamente"
    echo "3. Prueba crear un creativo desde el frontend"
else
    echo ""
    echo "=========================================="
    echo "   ❌ ERROR EN LA MIGRACIÓN"
    echo "=========================================="
    echo ""
    echo "Verifica:"
    echo "- La conexión a la base de datos"
    echo "- Los permisos del usuario"
    echo "- Que la base de datos exista"
fi

# Limpiar la variable de entorno
unset PGPASSWORD

echo ""



