import { useState, useEffect } from 'react';
import { Campana, Creativo } from '../../types';
import { creativoService } from '../../services/creativoService';
import { campanaService } from '../../services/campanaService';

interface UploadCreativoProps {
  campana: Campana;
  onCerrar: () => void;
}

interface ArchivoConVistaPrevia {
  file: File;
  preview: string;
  orden: number;
}

interface UrlExterna {
  url: string;
  orden: number;
}

export default function UploadCreativo({ campana, onCerrar }: UploadCreativoProps) {
  const [archivosSeleccionados, setArchivosSeleccionados] = useState<ArchivoConVistaPrevia[]>([]);
  const [urlsExternas, setUrlsExternas] = useState<UrlExterna[]>([]);
  const [urlInputTemporal, setUrlInputTemporal] = useState<string>('');
  const [subiendo, setSubiendo] = useState(false);
  const [creativosExistentes, setCreativosExistentes] = useState<Creativo[]>([]);
  const [cargandoCreativos, setCargandoCreativos] = useState(true);

  const tiposPermitidos = ['image/jpeg', 'image/png', 'image/gif', 'video/mp4', 'video/avi', 'video/mov'];
  const tamanoMaximo = 10 * 1024 * 1024; // 10MB
  const maxArchivos = 5;
  
  // Determinar si es solo lectura (campaña archivada)
  const esSoloLectura = campana.estado === 'Archivada';

  // Cargar creativos existentes al abrir el modal
  useEffect(() => {
    cargarCreativosExistentes();
  }, [campana.id]);

  const cargarCreativosExistentes = async () => {
    try {
      setCargandoCreativos(true);
      const creativos = await creativoService.obtenerCreativosPorCampana(campana.id);
      setCreativosExistentes(creativos);
      
      // Sincronizar estado automáticamente al cargar (para corregir estados desincronizados)
      try {
        await creativoService.sincronizarEstadoCampana(campana.id);
        // Recargar la campaña para obtener el estado actualizado
        const campanaActualizada = await campanaService.obtenerCampanaPorId(Number(campana.id));
        if (campanaActualizada && campanaActualizada.estado !== campana.estado) {
          // El estado fue corregido, pero no mostrar alert para no molestar
          console.log(`Estado de campaña sincronizado: ${campana.estado} → ${campanaActualizada.estado}`);
        }
      } catch (syncError) {
        // Si falla la sincronización, no es crítico, solo loguear
        console.warn('Error sincronizando estado (no crítico):', syncError);
      }
    } catch (error) {
      console.error('Error cargando creativos:', error);
      // Si falla, usar los creativos del objeto campana si existen
      if (campana.creativos) {
        setCreativosExistentes(campana.creativos);
      }
    } finally {
      setCargandoCreativos(false);
    }
  };

  const manejarSeleccionArchivos = (e: React.ChangeEvent<HTMLInputElement>) => {
    const archivos = Array.from(e.target.files || []);
    
    if (archivos.length === 0) return;

    // Validar cantidad máxima
    const totalDespues = archivosSeleccionados.length + archivos.length;
    if (totalDespues > maxArchivos) {
      alert(`❌ Máximo ${maxArchivos} archivos permitidos. Ya tienes ${archivosSeleccionados.length} seleccionados.`);
      return;
    }

    // Validar cada archivo
    const archivosValidos: ArchivoConVistaPrevia[] = [];
    
    for (const archivo of archivos) {
      // Validar tipo
      if (!tiposPermitidos.includes(archivo.type)) {
        alert(`❌ "${archivo.name}" no es un tipo permitido. Solo se aceptan imágenes (JPEG, PNG, GIF) y videos (MP4, AVI, MOV)`);
        continue;
      }

      // Validar tamaño
      if (archivo.size > tamanoMaximo) {
        alert(`❌ "${archivo.name}" es demasiado grande. Máximo 10MB`);
        continue;
      }

      // Crear vista previa
      let preview = '';
      if (archivo.type.startsWith('image/')) {
        preview = URL.createObjectURL(archivo);
      }

      archivosValidos.push({
        file: archivo,
        preview,
        orden: archivosSeleccionados.length + archivosValidos.length
      });
    }

    setArchivosSeleccionados([...archivosSeleccionados, ...archivosValidos]);
  };

  const eliminarArchivoSeleccionado = (index: number) => {
    const archivo = archivosSeleccionados[index];
    if (archivo.preview) {
      URL.revokeObjectURL(archivo.preview);
    }
    const nuevosArchivos = archivosSeleccionados.filter((_, i) => i !== index);
    // Reordenar
    nuevosArchivos.forEach((a, i) => {
      a.orden = i;
    });
    setArchivosSeleccionados(nuevosArchivos);
  };

  const comprimirImagen = (file: File, maxWidth: number = 800, quality: number = 0.7): Promise<File> => {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      
      img.onload = () => {
        const ratio = Math.min(maxWidth / img.width, maxWidth / img.height);
        canvas.width = img.width * ratio;
        canvas.height = img.height * ratio;
        
        ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);
        
        canvas.toBlob((blob) => {
          if (blob) {
            const archivoComprimido = new File([blob], file.name, {
              type: file.type,
              lastModified: Date.now()
            });
            resolve(archivoComprimido);
          } else {
            resolve(file);
          }
        }, file.type, quality);
      };
      
      img.src = URL.createObjectURL(file);
    });
  };

  const agregarUrl = () => {
    if (!urlInputTemporal || !urlInputTemporal.trim()) {
      alert('❌ Ingresa una URL válida');
      return;
    }

    // Validar formato de URL básico
    try {
      new URL(urlInputTemporal.trim());
    } catch {
      alert('❌ La URL no tiene un formato válido');
      return;
    }

    // Verificar si ya existe
    if (urlsExternas.some(u => u.url === urlInputTemporal.trim())) {
      alert('❌ Esta URL ya está en la lista');
      return;
    }

    setUrlsExternas([
      ...urlsExternas,
      {
        url: urlInputTemporal.trim(),
        orden: urlsExternas.length + archivosSeleccionados.length
      }
    ]);
    setUrlInputTemporal('');
  };

  const eliminarUrl = (index: number) => {
    const nuevasUrls = urlsExternas.filter((_, i) => i !== index);
    // Reordenar
    nuevasUrls.forEach((u, i) => {
      u.orden = archivosSeleccionados.length + i;
    });
    setUrlsExternas(nuevasUrls);
  };

  const manejarSubirTodo = async () => {
    const totalItems = archivosSeleccionados.length + urlsExternas.length;
    
    if (totalItems === 0) {
      alert('❌ No hay creativos para subir. Agrega archivos o URLs primero.');
      return;
    }

    const userStr = localStorage.getItem('siscoca_user');
    const token = localStorage.getItem('token') || localStorage.getItem('siscoca_token');
    
    if (!userStr && !token) {
      alert('⚠️ No hay sesión activa. Por favor, recarga la página e inicia sesión nuevamente.');
      setTimeout(() => window.location.reload(), 2000);
      return;
    }

    setSubiendo(true);

    try {
      // Verificar límite de activos
      const activos = creativosExistentes.filter(c => c.activo);
      if (activos.length + totalItems > maxArchivos) {
        alert(`❌ Solo puedes tener ${maxArchivos} creativos activos. Actualmente tienes ${activos.length} y estás intentando agregar ${totalItems}.`);
        setSubiendo(false);
        return;
      }

      // Guardar estado anterior de la campaña
      const estadoAnterior = campana.estado;
      let ordenBase = creativosExistentes.length;
      let itemsSubidos = 0;

      // Subir archivos
      for (let i = 0; i < archivosSeleccionados.length; i++) {
        const item = archivosSeleccionados[i];
        let archivoParaSubir = item.file;
        
        // Comprimir imagen si es necesario
        if (archivoParaSubir.size > 500000 && archivoParaSubir.type.startsWith('image/')) {
          archivoParaSubir = await comprimirImagen(archivoParaSubir, 600, 0.6);
        }
        
        // Subir imagen directamente a la API externa de media
        const urlPublica = await creativoService.subirImagenAMedia(archivoParaSubir);
        
        // Crear creativo con la URL pública
        await creativoService.crearCreativo(campana.id, {
          urlCreativoExterno: urlPublica,
          nombreArchivoCreativo: archivoParaSubir.name,
          activo: true,
          orden: ordenBase + i
        });
        itemsSubidos++;
      }

      // Subir URLs
      for (let i = 0; i < urlsExternas.length; i++) {
        const urlItem = urlsExternas[i];
        await creativoService.crearCreativo(campana.id, {
          urlCreativoExterno: urlItem.url,
          activo: true,
          orden: ordenBase + archivosSeleccionados.length + i
        });
        itemsSubidos++;
      }
      
      // Recargar creativos y verificar si cambió el estado
      await cargarCreativosExistentes();
      
      // Recargar la campaña para verificar el estado actualizado
      try {
        const campanaActualizada = await campanaService.obtenerCampanaPorId(Number(campana.id));
        if (campanaActualizada && campanaActualizada.estado !== estadoAnterior) {
          alert(`✅ ${itemsSubidos} creativo(s) agregado(s) exitosamente\n\n🎉 El estado de la campaña cambió a "${campanaActualizada.estado}"`);
        } else {
          alert(`✅ ${itemsSubidos} creativo(s) agregado(s) exitosamente`);
        }
      } catch (error) {
        alert(`✅ ${itemsSubidos} creativo(s) agregado(s) exitosamente`);
      }
      
      // Limpiar todo
      archivosSeleccionados.forEach(item => {
        if (item.preview) {
          URL.revokeObjectURL(item.preview);
        }
      });
      setArchivosSeleccionados([]);
      setUrlsExternas([]);
      setUrlInputTemporal('');
    } catch (error) {
      console.error('Error en manejarSubirTodo:', error);
      const mensajeError = error instanceof Error ? error.message : String(error);
      alert(`❌ Error: ${mensajeError}`);
    } finally {
      setSubiendo(false);
    }
  };

  const manejarActivarDescartar = async (creativo: Creativo) => {
    if (esSoloLectura) {
      alert('⚠️ Esta campaña está archivada. Solo puedes ver y descargar creativos.');
      return;
    }
    
    try {
      if (creativo.activo) {
        // Descartar
        await creativoService.marcarComoDescartado(creativo.id);
        alert('✅ Creativo descartado');
      } else {
        // Activar - verificar límite
        const activos = creativosExistentes.filter(c => c.activo);
        if (activos.length >= maxArchivos) {
          alert(`❌ Ya hay ${maxArchivos} creativos activos. Desactiva uno antes de activar otro.`);
          return;
        }
        await creativoService.marcarComoActivo(creativo.id);
        alert('✅ Creativo activado');
      }
      await cargarCreativosExistentes();
    } catch (error) {
      console.error('Error al cambiar estado:', error);
      const mensajeError = error instanceof Error ? error.message : String(error);
      alert(`❌ Error: ${mensajeError}`);
    }
  };

  const manejarEliminar = async (creativo: Creativo) => {
    if (esSoloLectura) {
      alert('⚠️ Esta campaña está archivada. Solo puedes ver y descargar creativos.');
      return;
    }
    
    if (!confirm(`¿Estás seguro de eliminar este creativo permanentemente?`)) {
      return;
    }

    try {
      await creativoService.eliminarCreativo(creativo.id);
      alert('✅ Creativo eliminado');
      await cargarCreativosExistentes();
    } catch (error) {
      console.error('Error al eliminar:', error);
      const mensajeError = error instanceof Error ? error.message : String(error);
      alert(`❌ Error: ${mensajeError}`);
    }
  };

  const formatearTamano = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const activos = creativosExistentes.filter(c => c.activo);
  const descartados = creativosExistentes.filter(c => !c.activo);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[95vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-4 sm:px-6 py-3 sm:py-4 flex justify-between items-start sm:items-center rounded-t-xl flex-shrink-0">
          <div className="flex-1 min-w-0 pr-2">
            <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900">
              {esSoloLectura ? '👁️ Ver Creativos' : '📎 Gestión de Creativos'}
            </h2>
            <p className="text-xs sm:text-sm text-gray-600 mt-1 truncate">Campaña: {campana.nombre}</p>
            <p className="text-xs text-gray-500 mt-1">
              {activos.length} / {maxArchivos} creativos activos
              {esSoloLectura && (
                <span className="ml-2 px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-xs font-semibold">
                  (Solo lectura)
                </span>
              )}
            </p>
          </div>
          <button
            onClick={onCerrar}
            className="text-gray-400 hover:text-gray-600 transition-colors flex-shrink-0"
            aria-label="Cerrar"
          >
            <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Contenido con scroll */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 sm:space-y-6">
          {/* Creativos existentes - Activos */}
          {cargandoCreativos ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
              <p className="text-gray-600 mt-2">Cargando creativos...</p>
            </div>
          ) : (
            <>
              {activos.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                    <span className="text-green-500 mr-2">✓</span>
                    Creativos Activos ({activos.length})
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {activos.map((creativo) => (
                      <div key={creativo.id} className="bg-green-50 border border-green-200 rounded-lg p-4">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1 min-w-0">
                            {creativo.nombreArchivoCreativo && (
                              <p className="font-semibold text-green-900 truncate">{creativo.nombreArchivoCreativo}</p>
                            )}
                            <p className="text-xs text-green-700 mt-1">
                              Creado: {new Date(creativo.fechaCreacion).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="flex gap-2 ml-2">
                            <button
                              onClick={async () => {
                                try {
                                  await creativoService.descargarCreativo(creativo.id);
                                } catch (error) {
                                  alert(`❌ Error al descargar: ${error instanceof Error ? error.message : String(error)}`);
                                }
                              }}
                              className="px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white text-xs rounded transition-colors"
                              title="Descargar"
                            >
                              ⬇️
                            </button>
                            {!esSoloLectura && (
                              <>
                                <button
                                  onClick={() => manejarActivarDescartar(creativo)}
                                  className="px-3 py-1 bg-yellow-500 hover:bg-yellow-600 text-white text-xs rounded transition-colors"
                                  title="Descartar"
                                >
                                  🗑️
                                </button>
                                <button
                                  onClick={() => manejarEliminar(creativo)}
                                  className="px-3 py-1 bg-red-500 hover:bg-red-600 text-white text-xs rounded transition-colors"
                                  title="Eliminar"
                                >
                                  ✕
                                </button>
                              </>
                            )}
                          </div>
                        </div>
                        {/* Mostrar imagen desde URL externa o base64 */}
                        {(creativo.urlCreativoExterno || (creativo.archivoCreativo && creativo.archivoCreativo.startsWith('data:image'))) && (
                          <div className="mt-2 border border-green-300 rounded p-2 bg-white">
                            <img
                              src={creativo.urlCreativoExterno || creativo.archivoCreativo}
                              alt={creativo.nombreArchivoCreativo || "Preview"}
                              className="max-w-full max-h-48 mx-auto rounded object-contain"
                              onError={(e) => {
                                // Si falla cargar la imagen, mostrar un placeholder
                                const target = e.target as HTMLImageElement;
                                target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2YzZjRmNiIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTQiIGZpbGw9IiM5Y2EzYWYiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5JbWFnZW4gbm8gZGlzcG9uaWJsZTwvdGV4dD48L3N2Zz4=';
                                target.onerror = null; // Prevenir bucle infinito
                              }}
                            />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Creativos descartados */}
              {descartados.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                    <span className="text-gray-500 mr-2">⊘</span>
                    Creativos Descartados ({descartados.length})
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {descartados.map((creativo) => (
                      <div key={creativo.id} className="bg-gray-50 border border-gray-300 rounded-lg p-4 opacity-75">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1 min-w-0">
                            {creativo.nombreArchivoCreativo && (
                              <p className="font-semibold text-gray-700 truncate">{creativo.nombreArchivoCreativo}</p>
                            )}
                            <p className="text-xs text-gray-500 mt-1">
                              Creado: {new Date(creativo.fechaCreacion).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="flex gap-2 ml-2">
                            <button
                              onClick={async () => {
                                try {
                                  await creativoService.descargarCreativo(creativo.id);
                                } catch (error) {
                                  alert(`❌ Error al descargar: ${error instanceof Error ? error.message : String(error)}`);
                                }
                              }}
                              className="px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white text-xs rounded transition-colors"
                              title="Descargar"
                            >
                              ⬇️
                            </button>
                            {!esSoloLectura && (
                              <>
                                <button
                                  onClick={() => manejarActivarDescartar(creativo)}
                                  className="px-3 py-1 bg-green-500 hover:bg-green-600 text-white text-xs rounded transition-colors"
                                  title="Activar"
                                >
                                  ✓
                                </button>
                                <button
                                  onClick={() => manejarEliminar(creativo)}
                                  className="px-3 py-1 bg-red-500 hover:bg-red-600 text-white text-xs rounded transition-colors"
                                  title="Eliminar"
                                >
                                  ✕
                                </button>
                              </>
                            )}
                          </div>
                        </div>
                        {/* Mostrar imagen desde URL externa o base64 */}
                        {(creativo.urlCreativoExterno || (creativo.archivoCreativo && creativo.archivoCreativo.startsWith('data:image'))) && (
                          <div className="mt-2 border border-gray-300 rounded p-2 bg-white">
                            <img
                              src={creativo.urlCreativoExterno || creativo.archivoCreativo}
                              alt={creativo.nombreArchivoCreativo || "Preview"}
                              className="max-w-full max-h-48 mx-auto rounded object-contain"
                              onError={(e) => {
                                // Si falla cargar la imagen, mostrar un placeholder
                                const target = e.target as HTMLImageElement;
                                target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2YzZjRmNiIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTQiIGZpbGw9IiM5Y2EzYWYiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5JbWFnZW4gbm8gZGlzcG9uaWJsZTwvdGV4dD48L3N2Zz4=';
                                target.onerror = null; // Prevenir bucle infinito
                              }}
                            />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Sección de Subida Unificada - Solo si no es solo lectura */}
              {!esSoloLectura && (
                <div className="space-y-6 pt-4">
                  {/* Subir Archivos */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      📎 Subir Archivos (máximo {maxArchivos - activos.length} disponibles)
                    </label>
                    
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 sm:p-6 text-center hover:border-primary-400 transition-colors">
                      <input
                        type="file"
                        accept=".jpg,.jpeg,.png,.gif,.mp4,.avi,.mov"
                        onChange={manejarSeleccionArchivos}
                        className="hidden"
                        id="file-upload-multiple"
                        multiple
                        disabled={subiendo || activos.length >= maxArchivos}
                      />
                      
                      <label
                        htmlFor="file-upload-multiple"
                        className={`cursor-pointer block ${subiendo || activos.length >= maxArchivos ? 'pointer-events-none opacity-50' : ''}`}
                      >
                        <div className="text-3xl sm:text-4xl mb-3 sm:mb-4">📎</div>
                        <p className="text-base sm:text-lg font-semibold text-gray-700 mb-2">
                          Haz clic para seleccionar archivos
                        </p>
                        <p className="text-xs sm:text-sm text-gray-500">
                          Puedes seleccionar hasta {maxArchivos - activos.length} archivo(s) más
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          Máximo 10MB por archivo
                        </p>
                      </label>
                    </div>

                    {/* Lista de archivos seleccionados */}
                    {archivosSeleccionados.length > 0 && (
                      <div className="mt-4 space-y-2">
                        <h4 className="font-semibold text-gray-900 text-sm">Archivos Seleccionados:</h4>
                        {archivosSeleccionados.map((item, index) => (
                          <div key={index} className="bg-gray-50 border border-gray-200 rounded-lg p-3 flex items-center justify-between">
                            <div className="flex items-center space-x-3 flex-1 min-w-0">
                              {item.preview && (
                                <img src={item.preview} alt="Preview" className="w-16 h-16 object-cover rounded" />
                              )}
                              <div className="flex-1 min-w-0">
                                <p className="font-medium text-gray-900 truncate text-sm">{item.file.name}</p>
                                <p className="text-xs text-gray-600">{formatearTamano(item.file.size)}</p>
                              </div>
                            </div>
                            <button
                              onClick={() => eliminarArchivoSeleccionado(index)}
                              className="px-3 py-1 bg-red-500 hover:bg-red-600 text-white rounded transition-colors ml-2 text-sm"
                              disabled={subiendo}
                            >
                              ✕
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Separador */}
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-gray-300"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="px-2 bg-white text-gray-500">O</span>
                    </div>
                  </div>

                  {/* Agregar URLs Externas */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      🔗 Agregar URLs Externas
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="url"
                        value={urlInputTemporal}
                        onChange={(e) => setUrlInputTemporal(e.target.value)}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            agregarUrl();
                          }
                        }}
                        placeholder="https://ejemplo.com/creativo.mp4"
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
                        disabled={subiendo || activos.length >= maxArchivos}
                      />
                      <button
                        onClick={agregarUrl}
                        disabled={!urlInputTemporal || !urlInputTemporal.trim() || subiendo || activos.length >= maxArchivos}
                        className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm whitespace-nowrap"
                      >
                        Agregar
                      </button>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Ingresa la URL completa donde está alojado el creativo
                    </p>

                    {/* Lista de URLs agregadas */}
                    {urlsExternas.length > 0 && (
                      <div className="mt-4 space-y-2">
                        <h4 className="font-semibold text-gray-900 text-sm">URLs Agregadas:</h4>
                        {urlsExternas.map((urlItem, index) => (
                          <div key={index} className="bg-gray-50 border border-gray-200 rounded-lg p-3 flex items-center justify-between">
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-gray-900 truncate text-sm">{urlItem.url}</p>
                              <p className="text-xs text-gray-600 mt-1">URL Externa</p>
                            </div>
                            <button
                              onClick={() => eliminarUrl(index)}
                              className="px-3 py-1 bg-red-500 hover:bg-red-600 text-white rounded transition-colors ml-2 text-sm"
                              disabled={subiendo}
                            >
                              ✕
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Resumen de items a subir */}
                  {(archivosSeleccionados.length > 0 || urlsExternas.length > 0) && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <h4 className="font-semibold text-blue-900 mb-2 text-sm">
                        📋 Items a Subir ({archivosSeleccionados.length + urlsExternas.length})
                      </h4>
                      <div className="space-y-1 text-sm">
                        {archivosSeleccionados.map((item, index) => (
                          <div key={`file-${index}`} className="text-blue-800">
                            • 📎 {item.file.name}
                          </div>
                        ))}
                        {urlsExternas.map((urlItem, index) => (
                          <div key={`url-${index}`} className="text-blue-800 truncate">
                            • 🔗 {urlItem.url}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Mensaje informativo para solo lectura */}
              {esSoloLectura && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
                  <h4 className="font-semibold text-blue-900 mb-2">ℹ️ Información</h4>
                  <p className="text-sm text-blue-800">
                    Esta campaña está archivada. Solo puedes ver y descargar los creativos. 
                    Para modificar o agregar creativos, primero debes reactivar la campaña.
                  </p>
                </div>
              )}

              {/* Instrucciones - Solo si no es solo lectura */}
              {!esSoloLectura && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <h4 className="font-semibold text-yellow-900 mb-2">📋 Instrucciones</h4>
                  <ul className="text-sm text-yellow-800 space-y-1">
                    <li>• Puedes tener hasta {maxArchivos} creativos activos por campaña</li>
                    <li>• Los creativos descartados pueden reactivarse más tarde</li>
                    <li>• Puedes eliminar creativos incluso cuando la campaña está activa</li>
                    <li>• Los creativos se ordenan por fecha de creación</li>
                  </ul>
                </div>
              )}
            </>
          )}
        </div>

        {/* Botones fijos */}
        <div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-3 px-4 sm:px-6 py-3 sm:py-4 border-t border-gray-200 bg-white rounded-b-xl flex-shrink-0">
          <button
            type="button"
            onClick={onCerrar}
            disabled={subiendo}
            className="w-full sm:w-auto px-4 sm:px-6 py-2 sm:py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-semibold transition-colors disabled:opacity-50 text-sm sm:text-base"
          >
            Cerrar
          </button>
          {(archivosSeleccionados.length > 0 || urlsExternas.length > 0) && (
            <button
              onClick={manejarSubirTodo}
              disabled={subiendo || activos.length + archivosSeleccionados.length + urlsExternas.length > maxArchivos}
              className="w-full sm:w-auto px-4 sm:px-6 py-2 sm:py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
            >
              {subiendo ? 'Guardando...' : `Subir ${archivosSeleccionados.length + urlsExternas.length} Item(s)`}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
