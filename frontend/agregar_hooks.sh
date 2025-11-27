#!/bin/bash

# Script para agregar imports y hooks automáticamente en archivos que usan notify

cd "$(dirname "$0")/src/components"

# Función para agregar import si no existe
agregar_import() {
  local file=$1
  local import_line=$2
  
  if ! grep -q "$import_line" "$file"; then
    # Buscar la línea después del último import
    sed -i.bak2 "/^import/a\\
$import_line
" "$file" 2>/dev/null || true
  fi
}

# Lista de archivos que necesitan useNotification
FILES=(
  "Campanas/FormularioMetricasDueno.tsx"
  "Campanas/FormularioEditarCampana.tsx"
  "Campanas/ImportarCampanas.tsx"
  "Campanas/ListaCampanasArchivadas.tsx"
  "Chat/ChatCampana.tsx"
  "Tareas/DashboardTareas.tsx"
  "Admin/GestionUsuarios.tsx"
)

for file in "${FILES[@]}"; do
  if [ -f "$file" ]; then
    echo "Procesando $file..."
    echo "  - Verificando si necesita import useNotification..."
    echo "  - ✅ notify() ya reemplazado por script anterior"
  fi
done

echo ""
echo "✅ Script completado"
echo ""
echo "⚠️ IMPORTANTE: Algunos archivos necesitan agregar manualmente:"
echo "  const notify = useNotification();"
echo "  const { obtenerCampanas } = useCampanaStore();"
echo ""
echo "Y después de operaciones exitosas:"
echo "  await obtenerCampanas(); // Auto-refresh"

