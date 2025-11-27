#!/bin/bash

# Script para reemplazar todos los alert() por notificaciones modernas
# Actualiza automáticamente todos los componentes

cd "$(dirname "$0")/src/components"

# Lista de archivos a procesar
FILES=(
  "Campanas/FormularioCrearCampana.tsx"
  "Campanas/FormularioEditarCampana.tsx"
  "Campanas/FormularioMetricasTrafficker.tsx"
  "Campanas/FormularioMetricasDueno.tsx"
  "Campanas/HistoricoSemanasCampana.tsx"
  "Campanas/ImportarCampanas.tsx"
  "Campanas/ListaCampanasArchivadas.tsx"
  "Campanas/ConfigurarMetricasIdeales.tsx"
  "Chat/ChatCampana.tsx"
  "Tareas/DashboardTareas.tsx"
  "Audit/HistorialCambios.tsx"
  "Admin/GestionUsuarios.tsx"
)

for file in "${FILES[@]}"; do
  if [ -f "$file" ]; then
    echo "Procesando $file..."
    
    # Crear copia de respaldo
    cp "$file" "${file}.bak"
    
    # Reemplazar alert() por notify según el emoji
    cat "$file" | \
      sed 's/alert(`❌/notify.error(`/g' | \
      sed 's/alert(`⚠️/notify.warning(`/g' | \
      sed 's/alert(`✅/notify.success(`/g' | \
      sed "s/alert('❌/notify.error('/g" | \
      sed "s/alert('⚠️/notify.warning('/g" | \
      sed "s/alert('✅/notify.success('/g" | \
      sed 's/alert(❌/notify.error(/g' | \
      sed 's/alert(⚠️/notify.warning(/g' | \
      sed 's/alert(✅/notify.success(/g' | \
      sed 's/alert("❌/notify.error("/g' | \
      sed 's/alert("⚠️/notify.warning("/g' | \
      sed 's/alert("✅/notify.success("/g' \
      > "${file}.tmp"
    
    # Mover el archivo temporal al original
    mv "${file}.tmp" "$file"
    
    echo "  ✅ $file actualizado"
  else
    echo "  ⚠️ $file no encontrado"
  fi
done

# Limpiar respaldos
# rm -f **/*.bak

echo ""
echo "✅ Reemplazo completado en todos los archivos"
echo "📝 Archivos .bak creados como respaldo"
echo ""
echo "PRÓXIMO PASO MANUAL:"
echo "Agregar imports necesarios en cada archivo:"
echo "  import { useNotification } from '../../hooks/useNotification';"
echo "  import { useCampanaStore } from '../../store/useCampanaStore';"
echo ""
echo "Y en el componente:"
echo "  const notify = useNotification();"
echo "  const { obtenerCampanas } = useCampanaStore();"

