import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Campana, Creativo } from '../../types';
import { creativoService } from '../../services/creativoService';
import { campanaService } from '../../services/campanaService';
import { useCampanaStore } from '../../store/useCampanaStore';
import { useNotification } from '../../hooks/useNotification';
import { 
  FileText, 
  X, 
  Upload, 
  Download, 
  Trash2, 
  Archive, 
  RotateCcw, 
  Link2, 
  Plus, 
  Eye, 
  Loader2,
  CheckCircle,
  XCircle,
  Image as ImageIcon,
  ZoomIn,
  Maximize2,
  PlayCircle,
  Video
} from 'lucide-react';

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
  // Hooks
  const notify = useNotification();
  const { obtenerCampanas } = useCampanaStore();
  
  // Estados
  const [archivosSeleccionados, setArchivosSeleccionados] = useState<ArchivoConVistaPrevia[]>([]);
  const [urlsExternas, setUrlsExternas] = useState<UrlExterna[]>([]);
  const [urlInputTemporal, setUrlInputTemporal] = useState<string>('');
  const [subiendo, setSubiendo] = useState(false);
  const [creativosExistentes, setCreativosExistentes] = useState<Creativo[]>([]);
  const [cargandoCreativos, setCargandoCreativos] = useState(true);
  const [imagenZoom, setImagenZoom] = useState<string | null>(null);
  const [videoZoom, setVideoZoom] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const tiposPermitidos = ['image/jpeg', 'image/png', 'image/gif', 'video/mp4', 'video/avi', 'video/mov'];
  const tamanoMaximo = 10 * 1024 * 1024; // 10MB
  const maxArchivos = 5;
  
  // Determinar si es solo lectura (campaña archivada)
  const esSoloLectura = campana.estado === 'Archivada';
  
  // Helper para detectar si es video
  const esVideo = (url: string, nombreArchivo?: string): boolean => {
    const videoExtensions = ['.mp4', '.avi', '.mov', '.webm', '.ogg'];
    const lowerUrl = url.toLowerCase();
    const lowerNombre = nombreArchivo?.toLowerCase() || '';
    
    // Verificar por data URL
    if (lowerUrl.startsWith('data:video')) return true;
    
    // Verificar por extensión en URL o nombre
    return videoExtensions.some(ext => lowerUrl.includes(ext) || lowerNombre.endsWith(ext));
  };
  
  // Helper para detectar si es imagen
  const esImagen = (url: string, nombreArchivo?: string): boolean => {
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
    const lowerUrl = url.toLowerCase();
    const lowerNombre = nombreArchivo?.toLowerCase() || '';
    
    // Verificar por data URL
    if (lowerUrl.startsWith('data:image')) return true;
    
    // Verificar por extensión en URL o nombre
    return imageExtensions.some(ext => lowerUrl.includes(ext) || lowerNombre.endsWith(ext));
  };

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
          // El estado fue corregido, actualizar en el store
          console.log(`Estado de campaña sincronizado: ${campana.estado} → ${campanaActualizada.estado}`);
          // Actualizar el store para refrescar la UI
          await obtenerCampanas();
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

  const procesarArchivos = (archivos: FileList | File[]) => {
    const archivosArray = Array.from(archivos);
    
    if (archivosArray.length === 0) return;

    // Validar cantidad máxima
    const totalDespues = archivosSeleccionados.length + archivosArray.length;
    if (totalDespues > maxArchivos) {
      notify.error(`Máximo ${maxArchivos} archivos permitidos. Ya tienes ${archivosSeleccionados.length} seleccionados.`);
      return;
    }

    // Validar cada archivo
    const archivosValidos: ArchivoConVistaPrevia[] = [];
    
    for (const archivo of archivosArray) {
      // Validar tipo
      if (!tiposPermitidos.includes(archivo.type)) {
        notify.error(` "${archivo.name}" no es un tipo permitido. Solo se aceptan imágenes (JPEG, PNG, GIF) y videos (MP4, AVI, MOV)`);
        continue;
      }

      // Validar tamaño
      if (archivo.size > tamanoMaximo) {
        notify.error(` "${archivo.name}" es demasiado grande. Máximo 10MB`);
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

  const manejarSeleccionArchivos = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      procesarArchivos(e.target.files);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    if (subiendo || activos.length >= maxArchivos) return;
    
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      procesarArchivos(files);
    }
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
      notify.error(' Ingresa una URL válida');
      return;
    }

    // Validar formato de URL básico
    try {
      new URL(urlInputTemporal.trim());
    } catch {
      notify.error(' La URL no tiene un formato válido');
      return;
    }

    // Verificar si ya existe
    if (urlsExternas.some(u => u.url === urlInputTemporal.trim())) {
      notify.error(' Esta URL ya está en la lista');
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
      notify.error(' No hay creativos para subir. Agrega archivos o URLs primero.');
      return;
    }

    const userStr = localStorage.getItem('siscoca_user');
    const token = localStorage.getItem('token') || localStorage.getItem('siscoca_token');
    
    if (!userStr && !token) {
      notify.warning(' No hay sesión activa. Por favor, recarga la página e inicia sesión nuevamente.');
      setTimeout(() => window.location.reload(), 2000);
      return;
    }

    setSubiendo(true);

    try {
      // Verificar límite de activos
      const activos = creativosExistentes.filter(c => c.activo);
      if (activos.length + totalItems > maxArchivos) {
        notify.error(` Solo puedes tener ${maxArchivos} creativos activos. Actualmente tienes ${activos.length} y estás intentando agregar ${totalItems}.`);
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
          notify.success(` ${itemsSubidos} creativo(s) agregado(s) exitosamente\n\n🎉 El estado de la campaña cambió a "${campanaActualizada.estado}"`);
        } else {
          notify.success(` ${itemsSubidos} creativo(s) agregado(s) exitosamente`);
        }
      } catch (error) {
        notify.success(` ${itemsSubidos} creativo(s) agregado(s) exitosamente`);
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
      notify.error(` Error: ${mensajeError}`);
    } finally {
      setSubiendo(false);
    }
  };

  const manejarActivarDescartar = async (creativo: Creativo) => {
    if (esSoloLectura) {
      notify.warning(' Esta campaña está archivada. Solo puedes ver y descargar creativos.');
      return;
    }
    
    try {
      if (creativo.activo) {
        // Descartar
        await creativoService.marcarComoDescartado(creativo.id);
        notify.success(' Creativo descartado');
      } else {
        // Activar - verificar límite
        const activos = creativosExistentes.filter(c => c.activo);
        if (activos.length >= maxArchivos) {
          notify.error(` Ya hay ${maxArchivos} creativos activos. Desactiva uno antes de activar otro.`);
          return;
        }
        await creativoService.marcarComoActivo(creativo.id);
        notify.success(' Creativo activado');
      }
      await cargarCreativosExistentes();
    } catch (error) {
      console.error('Error al cambiar estado:', error);
      const mensajeError = error instanceof Error ? error.message : String(error);
      notify.error(` Error: ${mensajeError}`);
    }
  };

  const manejarEliminar = async (creativo: Creativo) => {
    if (esSoloLectura) {
      notify.warning(' Esta campaña está archivada. Solo puedes ver y descargar creativos.');
      return;
    }
    
    if (!confirm(`¿Estás seguro de eliminar este creativo permanentemente?`)) {
      return;
    }

    try {
      await creativoService.eliminarCreativo(creativo.id);
      notify.success(' Creativo eliminado');
      await cargarCreativosExistentes();
    } catch (error) {
      console.error('Error al eliminar:', error);
      const mensajeError = error instanceof Error ? error.message : String(error);
      notify.error(` Error: ${mensajeError}`);
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

  return createPortal(
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-2 sm:p-4 animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-2xl max-w-5xl w-full max-h-[95vh] flex flex-col overflow-hidden">
        {/* Header moderno */}
        <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 px-6 py-5 flex justify-between items-center flex-shrink-0 border-b border-white/10">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div 
              className="w-12 h-12 rounded-xl flex items-center justify-center shadow-lg flex-shrink-0"
              style={{ background: 'linear-gradient(to bottom right, #ef0000, #dc0000)' }}
            >
              {esSoloLectura ? <Eye className="w-6 h-6 text-white" /> : <FileText className="w-6 h-6 text-white" />}
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-xl lg:text-2xl font-bold text-white">
                {esSoloLectura ? 'Ver Creativos' : 'Gestión de Creativos'}
              </h2>
              <p className="text-sm text-gray-400 truncate">{campana.nombre}</p>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs text-gray-400 font-medium">
                  {activos.length} / {maxArchivos} creativos activos
                </span>
                {esSoloLectura && (
                  <span className="px-2 py-0.5 bg-white/10 text-gray-300 rounded-lg text-xs font-bold">
                    Solo lectura
                  </span>
                )}
              </div>
            </div>
          </div>
          <button
            onClick={onCerrar}
            className="text-gray-400 hover:text-white transition-colors p-2 hover:bg-white/10 rounded-lg flex-shrink-0"
            aria-label="Cerrar"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Contenido con scroll */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 bg-gradient-to-br from-gray-50 to-gray-100">
          {/* Creativos existentes - Activos */}
          {cargandoCreativos ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 className="w-10 h-10 animate-spin mb-3" style={{ color: '#ef0000' }} />
              <p className="text-gray-700 font-medium">Cargando creativos...</p>
            </div>
          ) : (
            <>
              {activos.length > 0 && (
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <CheckCircle className="w-5 h-5" style={{ color: '#10b981' }} />
                    Creativos Activos ({activos.length})
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {activos.map((creativo) => (
                      <div key={creativo.id} className="bg-white border border-green-200 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1 min-w-0">
                            {creativo.nombreArchivoCreativo && (
                              <p className="font-bold text-gray-900 truncate flex items-center gap-2">
                                {esVideo(creativo.urlCreativoExterno || creativo.archivoCreativo || '', creativo.nombreArchivoCreativo) ? (
                                  <Video className="w-4 h-4" style={{ color: '#10b981' }} />
                                ) : (
                                  <ImageIcon className="w-4 h-4" style={{ color: '#10b981' }} />
                                )}
                                {creativo.nombreArchivoCreativo}
                              </p>
                            )}
                            <p className="text-xs text-gray-600 mt-1 font-medium">
                              Creado: {new Date(creativo.fechaCreacion).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="flex gap-1.5 ml-2">
                            <button
                              onClick={async () => {
                                try {
                                  await creativoService.descargarCreativo(creativo.id);
                                } catch (error) {
                                  notify.error(` Error al descargar: ${error instanceof Error ? error.message : String(error)}`);
                                }
                              }}
                              className="p-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-all duration-200 shadow hover:shadow-md"
                              title="Descargar"
                            >
                              <Download className="w-4 h-4" />
                            </button>
                            {!esSoloLectura && (
                              <>
                                <button
                                  onClick={() => manejarActivarDescartar(creativo)}
                                  className="p-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg transition-all duration-200 shadow hover:shadow-md"
                                  title="Descartar"
                                >
                                  <Archive className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => manejarEliminar(creativo)}
                                  className="p-2 text-white rounded-lg transition-all duration-200 shadow hover:shadow-md"
                                  style={{ background: 'linear-gradient(to right, #ef0000, #dc0000)' }}
                                  title="Eliminar"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </>
                            )}
                          </div>
                        </div>
                        {/* Mostrar video o imagen desde URL externa o base64 */}
                        {(creativo.urlCreativoExterno || creativo.archivoCreativo) && (
                          <>
                            {/* Video */}
                            {esVideo(creativo.urlCreativoExterno || creativo.archivoCreativo || '', creativo.nombreArchivoCreativo) && (
                              <div className="mt-2 border border-green-300 rounded-lg p-2 bg-black relative group overflow-hidden">
                                <video
                                  src={creativo.urlCreativoExterno || creativo.archivoCreativo}
                                  controls
                                  className="max-w-full max-h-48 mx-auto rounded object-contain"
                                  preload="metadata"
                                >
                                  Tu navegador no soporta el elemento de video.
                                </video>
                                {/* Botón para ver en pantalla completa */}
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setVideoZoom(creativo.urlCreativoExterno || creativo.archivoCreativo || '');
                                  }}
                                  className="absolute top-4 right-4 p-2 bg-black/60 hover:bg-black/80 text-white rounded-lg transition-all duration-200 opacity-0 group-hover:opacity-100"
                                  title="Ver en pantalla completa"
                                >
                                  <Maximize2 className="w-5 h-5" />
                                </button>
                              </div>
                            )}
                            
                            {/* Imagen */}
                            {esImagen(creativo.urlCreativoExterno || creativo.archivoCreativo || '', creativo.nombreArchivoCreativo) && (
                              <div 
                                className="mt-2 border border-green-300 rounded-lg p-2 bg-white relative group cursor-pointer overflow-hidden"
                                onClick={() => setImagenZoom(creativo.urlCreativoExterno || creativo.archivoCreativo || '')}
                              >
                                <img
                                  src={creativo.urlCreativoExterno || creativo.archivoCreativo}
                                  alt={creativo.nombreArchivoCreativo || "Preview"}
                                  className="max-w-full max-h-48 mx-auto rounded object-contain transition-transform duration-200 group-hover:scale-105"
                                  onError={(e) => {
                                    // Si falla cargar la imagen, mostrar un placeholder
                                    const target = e.target as HTMLImageElement;
                                    target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2YzZjRmNiIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTQiIGZpbGw9IiM5Y2EzYWYiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5JbWFnZW4gbm8gZGlzcG9uaWJsZTwvdGV4dD48L3N2Zz4=';
                                    target.onerror = null; // Prevenir bucle infinito
                                  }}
                                />
                                {/* Overlay con lupa */}
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center rounded-lg">
                                  <div className="bg-white/90 backdrop-blur-sm rounded-full p-3 shadow-lg">
                                    <ZoomIn className="w-6 h-6" style={{ color: '#ef0000' }} />
                                  </div>
                                </div>
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Creativos descartados */}
              {descartados.length > 0 && (
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <XCircle className="w-5 h-5 text-gray-500" />
                    Creativos Descartados ({descartados.length})
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {descartados.map((creativo) => (
                      <div key={creativo.id} className="bg-white border border-gray-300 rounded-xl p-4 opacity-75 hover:opacity-100 transition-opacity shadow-sm">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1 min-w-0">
                            {creativo.nombreArchivoCreativo && (
                              <p className="font-bold text-gray-700 truncate flex items-center gap-2">
                                {esVideo(creativo.urlCreativoExterno || creativo.archivoCreativo || '', creativo.nombreArchivoCreativo) ? (
                                  <Video className="w-4 h-4 text-gray-500" />
                                ) : (
                                  <ImageIcon className="w-4 h-4 text-gray-500" />
                                )}
                                {creativo.nombreArchivoCreativo}
                              </p>
                            )}
                            <p className="text-xs text-gray-500 mt-1 font-medium">
                              Creado: {new Date(creativo.fechaCreacion).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="flex gap-1.5 ml-2">
                            <button
                              onClick={async () => {
                                try {
                                  await creativoService.descargarCreativo(creativo.id);
                                } catch (error) {
                                  notify.error(` Error al descargar: ${error instanceof Error ? error.message : String(error)}`);
                                }
                              }}
                              className="p-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-all duration-200 shadow hover:shadow-md"
                              title="Descargar"
                            >
                              <Download className="w-4 h-4" />
                            </button>
                            {!esSoloLectura && (
                              <>
                                <button
                                  onClick={() => manejarActivarDescartar(creativo)}
                                  className="p-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-all duration-200 shadow hover:shadow-md"
                                  title="Activar"
                                >
                                  <RotateCcw className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => manejarEliminar(creativo)}
                                  className="p-2 text-white rounded-lg transition-all duration-200 shadow hover:shadow-md"
                                  style={{ background: 'linear-gradient(to right, #ef0000, #dc0000)' }}
                                  title="Eliminar"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </>
                            )}
                          </div>
                        </div>
                        {/* Mostrar video o imagen desde URL externa o base64 */}
                        {(creativo.urlCreativoExterno || creativo.archivoCreativo) && (
                          <>
                            {/* Video */}
                            {esVideo(creativo.urlCreativoExterno || creativo.archivoCreativo || '', creativo.nombreArchivoCreativo) && (
                              <div className="mt-2 border border-gray-300 rounded-lg p-2 bg-black relative group overflow-hidden">
                                <video
                                  src={creativo.urlCreativoExterno || creativo.archivoCreativo}
                                  controls
                                  className="max-w-full max-h-48 mx-auto rounded object-contain"
                                  preload="metadata"
                                >
                                  Tu navegador no soporta el elemento de video.
                                </video>
                                {/* Botón para ver en pantalla completa */}
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setVideoZoom(creativo.urlCreativoExterno || creativo.archivoCreativo || '');
                                  }}
                                  className="absolute top-4 right-4 p-2 bg-black/60 hover:bg-black/80 text-white rounded-lg transition-all duration-200 opacity-0 group-hover:opacity-100"
                                  title="Ver en pantalla completa"
                                >
                                  <Maximize2 className="w-5 h-5" />
                                </button>
                              </div>
                            )}
                            
                            {/* Imagen */}
                            {esImagen(creativo.urlCreativoExterno || creativo.archivoCreativo || '', creativo.nombreArchivoCreativo) && (
                              <div 
                                className="mt-2 border border-gray-300 rounded-lg p-2 bg-white relative group cursor-pointer overflow-hidden"
                                onClick={() => setImagenZoom(creativo.urlCreativoExterno || creativo.archivoCreativo || '')}
                              >
                                <img
                                  src={creativo.urlCreativoExterno || creativo.archivoCreativo}
                                  alt={creativo.nombreArchivoCreativo || "Preview"}
                                  className="max-w-full max-h-48 mx-auto rounded object-contain transition-transform duration-200 group-hover:scale-105"
                                  onError={(e) => {
                                    // Si falla cargar la imagen, mostrar un placeholder
                                    const target = e.target as HTMLImageElement;
                                    target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2YzZjRmNiIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTQiIGZpbGw9IiM5Y2EzYWYiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5JbWFnZW4gbm8gZGlzcG9uaWJsZTwvdGV4dD48L3N2Zz4=';
                                    target.onerror = null; // Prevenir bucle infinito
                                  }}
                                />
                                {/* Overlay con lupa */}
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center rounded-lg">
                                  <div className="bg-white/90 backdrop-blur-sm rounded-full p-3 shadow-lg">
                                    <ZoomIn className="w-6 h-6" style={{ color: '#ef0000' }} />
                                  </div>
                                </div>
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Sección de Subida Unificada - Solo si no es solo lectura */}
              {!esSoloLectura && (
                <div className="space-y-6 pt-6 border-t border-gray-200">
                  {/* Subir Archivos */}
                  <div>
                    <label className="block text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
                      <Upload className="w-4 h-4" style={{ color: '#ef0000' }} />
                      Subir Archivos (máximo {maxArchivos - activos.length} disponibles)
                    </label>
                    
                    <div 
                         className="border-2 border-dashed rounded-xl p-6 sm:p-8 text-center transition-all duration-200" 
                         style={{ 
                           borderColor: isDragging ? '#ef0000' : (subiendo || activos.length >= maxArchivos) ? '#d1d5db' : '#e5e7eb',
                           backgroundColor: isDragging ? '#fef2f2' : 'white'
                         }}
                         onDragOver={handleDragOver}
                         onDragLeave={handleDragLeave}
                         onDrop={handleDrop}
                         onMouseEnter={(e) => {
                           if (!subiendo && activos.length < maxArchivos && !isDragging) {
                             e.currentTarget.style.borderColor = '#ef0000';
                             e.currentTarget.style.backgroundColor = '#fef2f2';
                           }
                         }}
                         onMouseLeave={(e) => {
                           if (!isDragging) {
                             e.currentTarget.style.borderColor = '#e5e7eb';
                             e.currentTarget.style.backgroundColor = 'white';
                           }
                         }}
                    >
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
                        <div 
                          className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg"
                          style={{ background: 'linear-gradient(to bottom right, #ef0000, #dc0000)' }}
                        >
                          <Upload className="w-8 h-8 text-white" />
                        </div>
                        {isDragging ? (
                          <>
                            <p className="text-lg font-bold mb-2" style={{ color: '#ef0000' }}>
                              ¡Suelta los archivos aquí!
                            </p>
                            <p className="text-sm text-gray-600 font-medium">
                              Los archivos se agregarán automáticamente
                            </p>
                          </>
                        ) : (
                          <>
                            <p className="text-lg font-bold text-gray-900 mb-2">
                              Haz clic o arrastra archivos aquí
                            </p>
                            <p className="text-sm text-gray-600 font-medium">
                              Puedes seleccionar hasta {maxArchivos - activos.length} archivo(s) más
                            </p>
                            <p className="text-xs text-gray-500 mt-2">
                              Máximo 10MB por archivo • Formatos: JPG, PNG, GIF, MP4, AVI, MOV
                            </p>
                          </>
                        )}
                      </label>
                    </div>

                    {/* Lista de archivos seleccionados */}
                    {archivosSeleccionados.length > 0 && (
                      <div className="mt-4 space-y-3">
                        <h4 className="font-bold text-gray-900 text-sm flex items-center gap-2">
                          <CheckCircle className="w-4 h-4" style={{ color: '#10b981' }} />
                          Archivos Seleccionados:
                        </h4>
                        {archivosSeleccionados.map((item, index) => (
                          <div key={index} className="bg-white border border-gray-200 rounded-xl p-3 flex items-center justify-between shadow-sm hover:shadow-md transition-shadow">
                            <div className="flex items-center space-x-3 flex-1 min-w-0">
                              {item.preview && (
                                <img src={item.preview} alt="Preview" className="w-16 h-16 object-cover rounded-lg shadow-sm" />
                              )}
                              <div className="flex-1 min-w-0">
                                <p className="font-bold text-gray-900 truncate text-sm">{item.file.name}</p>
                                <p className="text-xs text-gray-600 font-medium">{formatearTamano(item.file.size)}</p>
                              </div>
                            </div>
                            <button
                              onClick={() => eliminarArchivoSeleccionado(index)}
                              className="p-2 text-white rounded-lg transition-all duration-200 shadow hover:shadow-md ml-2"
                              style={{ background: 'linear-gradient(to right, #ef0000, #dc0000)' }}
                              disabled={subiendo}
                              title="Eliminar"
                            >
                              <X className="w-4 h-4" />
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
                      <span className="px-3 py-1 bg-gradient-to-br from-gray-50 to-gray-100 text-gray-600 font-bold rounded-lg shadow-sm">O</span>
                    </div>
                  </div>

                  {/* Agregar URLs Externas */}
                  <div>
                    <label className="block text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
                      <Link2 className="w-4 h-4" style={{ color: '#ef0000' }} />
                      Agregar URLs Externas
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
                        className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm font-medium hover:border-gray-400 transition-all"
                        disabled={subiendo || activos.length >= maxArchivos}
                      />
                      <button
                        onClick={agregarUrl}
                        disabled={!urlInputTemporal || !urlInputTemporal.trim() || subiendo || activos.length >= maxArchivos}
                        className="px-6 py-3 text-white rounded-xl font-bold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:scale-105 disabled:transform-none flex items-center gap-2 whitespace-nowrap"
                        style={{ background: (!urlInputTemporal || !urlInputTemporal.trim() || subiendo || activos.length >= maxArchivos) ? '#9ca3af' : 'linear-gradient(to right, #ef0000, #dc0000)' }}
                      >
                        <Plus className="w-4 h-4" />
                        Agregar
                      </button>
                    </div>
                    <p className="text-xs text-gray-600 mt-2 font-medium">
                      Ingresa la URL completa donde está alojado el creativo (imagen o video)
                    </p>

                    {/* Lista de URLs agregadas */}
                    {urlsExternas.length > 0 && (
                      <div className="mt-4 space-y-3">
                        <h4 className="font-bold text-gray-900 text-sm flex items-center gap-2">
                          <CheckCircle className="w-4 h-4" style={{ color: '#10b981' }} />
                          URLs Agregadas:
                        </h4>
                        {urlsExternas.map((urlItem, index) => (
                          <div key={index} className="bg-white border border-gray-200 rounded-xl p-3 flex items-center justify-between shadow-sm hover:shadow-md transition-shadow">
                            <div className="flex-1 min-w-0 flex items-center gap-2">
                              <Link2 className="w-4 h-4 text-blue-600 flex-shrink-0" />
                              <div className="flex-1 min-w-0">
                                <p className="font-bold text-gray-900 truncate text-sm">{urlItem.url}</p>
                                <p className="text-xs text-gray-600 font-medium">URL Externa</p>
                              </div>
                            </div>
                            <button
                              onClick={() => eliminarUrl(index)}
                              className="p-2 text-white rounded-lg transition-all duration-200 shadow hover:shadow-md ml-2"
                              style={{ background: 'linear-gradient(to right, #ef0000, #dc0000)' }}
                              disabled={subiendo}
                              title="Eliminar"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Resumen de items a subir */}
                  {(archivosSeleccionados.length > 0 || urlsExternas.length > 0) && (
                    <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-xl p-5 shadow-sm">
                      <h4 className="font-bold text-blue-900 mb-3 text-sm flex items-center gap-2">
                        <FileText className="w-4 h-4" />
                        Items a Subir ({archivosSeleccionados.length + urlsExternas.length})
                      </h4>
                      <div className="space-y-2 text-sm">
                        {archivosSeleccionados.map((item, index) => (
                          <div key={`file-${index}`} className="text-blue-800 font-medium flex items-center gap-2">
                            <Upload className="w-3 h-3 flex-shrink-0" />
                            <span className="truncate">{item.file.name}</span>
                          </div>
                        ))}
                        {urlsExternas.map((urlItem, index) => (
                          <div key={`url-${index}`} className="text-blue-800 font-medium flex items-center gap-2">
                            <Link2 className="w-3 h-3 flex-shrink-0" />
                            <span className="truncate">{urlItem.url}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Mensaje informativo para solo lectura */}
              {esSoloLectura && (
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-xl p-5 shadow-sm">
                  <h4 className="font-bold text-blue-900 mb-2 flex items-center gap-2">
                    <Eye className="w-4 h-4" />
                    Información
                  </h4>
                  <p className="text-sm text-blue-800 font-medium">
                    Esta campaña está archivada. Solo puedes ver y descargar los creativos. 
                    Para modificar o agregar creativos, primero debes reactivar la campaña.
                  </p>
                </div>
              )}

              {/* Instrucciones - Solo si no es solo lectura */}
              {!esSoloLectura && (
                <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 border border-yellow-200 rounded-xl p-5 shadow-sm">
                  <h4 className="font-bold text-yellow-900 mb-3 flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    Instrucciones
                  </h4>
                  <ul className="text-sm text-yellow-800 space-y-2 font-medium">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                      Puedes tener hasta {maxArchivos} creativos activos por campaña
                    </li>
                    <li className="flex items-start gap-2">
                      <RotateCcw className="w-4 h-4 mt-0.5 flex-shrink-0" />
                      Los creativos descartados pueden reactivarse más tarde
                    </li>
                    <li className="flex items-start gap-2">
                      <Trash2 className="w-4 h-4 mt-0.5 flex-shrink-0" />
                      Puedes eliminar creativos incluso cuando la campaña está activa
                    </li>
                    <li className="flex items-start gap-2">
                      <FileText className="w-4 h-4 mt-0.5 flex-shrink-0" />
                      Los creativos se ordenan por fecha de creación
                    </li>
                  </ul>
                </div>
              )}
            </>
          )}
        </div>

        {/* Botones fijos */}
        <div className="flex flex-col sm:flex-row justify-end gap-3 px-6 py-4 border-t border-gray-200 bg-gradient-to-r from-gray-50 to-white flex-shrink-0">
          <button
            type="button"
            onClick={onCerrar}
            disabled={subiendo}
            className="w-full sm:w-auto px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-100 font-bold transition-all duration-200 disabled:opacity-50 shadow hover:shadow-md flex items-center justify-center gap-2"
          >
            <X className="w-4 h-4" />
            Cerrar
          </button>
          {(archivosSeleccionados.length > 0 || urlsExternas.length > 0) && (
            <button
              onClick={manejarSubirTodo}
              disabled={subiendo || activos.length + archivosSeleccionados.length + urlsExternas.length > maxArchivos}
              className="w-full sm:w-auto px-8 py-3 text-white rounded-xl font-bold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:scale-105 disabled:transform-none flex items-center justify-center gap-2"
              style={{ background: (subiendo || activos.length + archivosSeleccionados.length + urlsExternas.length > maxArchivos) ? '#9ca3af' : 'linear-gradient(to right, #ef0000, #dc0000)' }}
            >
              {subiendo ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Guardando...
                </>
              ) : (
                <>
                  <Upload className="w-5 h-5" />
                  Subir {archivosSeleccionados.length + urlsExternas.length} Item(s)
                </>
              )}
            </button>
          )}
        </div>
      </div>

      {/* Modal de Zoom de Imagen */}
      {imagenZoom && (
        <div 
          className="fixed inset-0 bg-black/90 backdrop-blur-sm z-[200] flex items-center justify-center p-4 animate-fadeIn"
          onClick={() => setImagenZoom(null)}
        >
          <div className="relative max-w-7xl max-h-[95vh] w-full h-full flex flex-col">
            {/* Header del modal de zoom */}
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-2 text-white">
                <Maximize2 className="w-5 h-5" />
                <span className="font-bold">Vista Ampliada - Imagen</span>
              </div>
              <button
                onClick={() => setImagenZoom(null)}
                className="text-white hover:text-gray-300 transition-colors p-2 hover:bg-white/10 rounded-lg"
                title="Cerrar"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            {/* Imagen ampliada */}
            <div 
              className="flex-1 flex items-center justify-center overflow-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={imagenZoom}
                alt="Vista ampliada"
                className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
                onClick={(e) => e.stopPropagation()}
              />
            </div>
            
            {/* Indicación */}
            <p className="text-center text-white/70 mt-4 text-sm font-medium">
              Haz clic fuera de la imagen para cerrar
            </p>
          </div>
        </div>
      )}

      {/* Modal de Zoom de Video */}
      {videoZoom && (
        <div 
          className="fixed inset-0 bg-black/95 backdrop-blur-sm z-[200] flex items-center justify-center p-4 animate-fadeIn"
          onClick={() => setVideoZoom(null)}
        >
          <div className="relative max-w-7xl max-h-[95vh] w-full h-full flex flex-col">
            {/* Header del modal de zoom */}
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-2 text-white">
                <PlayCircle className="w-5 h-5" />
                <span className="font-bold">Reproductor de Video</span>
              </div>
              <button
                onClick={() => setVideoZoom(null)}
                className="text-white hover:text-gray-300 transition-colors p-2 hover:bg-white/10 rounded-lg"
                title="Cerrar"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            {/* Video ampliado */}
            <div 
              className="flex-1 flex items-center justify-center overflow-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <video
                src={videoZoom}
                controls
                autoPlay
                className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
                onClick={(e) => e.stopPropagation()}
              >
                Tu navegador no soporta el elemento de video.
              </video>
            </div>
            
            {/* Indicación */}
            <p className="text-center text-white/70 mt-4 text-sm font-medium">
              Haz clic fuera del video para cerrar
            </p>
          </div>
        </div>
      )}
    </div>,
    document.body
  );
}
