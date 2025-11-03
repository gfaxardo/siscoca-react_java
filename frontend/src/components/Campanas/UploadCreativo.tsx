import { useState } from 'react';
import { useCampanaStore } from '../../store/useCampanaStore';
import { Campana } from '../../types';

interface UploadCreativoProps {
  campana: Campana;
  onCerrar: () => void;
  onSubirCreativo: (campana: Campana, archivo: File) => Promise<{ exito: boolean; mensaje: string }>;
}

type ModoSubida = 'archivo' | 'url';

export default function UploadCreativo({ campana, onCerrar, onSubirCreativo }: UploadCreativoProps) {
  const { descargarCreativo, subirCreativoUrl } = useCampanaStore();
  const [modoSubida, setModoSubida] = useState<ModoSubida>('archivo');
  const [archivoSeleccionado, setArchivoSeleccionado] = useState<File | null>(null);
  const [urlExterna, setUrlExterna] = useState<string>(campana.urlCreativoExterno || '');
  const [subiendo, setSubiendo] = useState(false);
  const [vistaPrevia, setVistaPrevia] = useState<string>('');

  const tiposPermitidos = ['image/jpeg', 'image/png', 'image/gif', 'video/mp4', 'video/avi', 'video/mov'];
  const tamanoMaximo = 10 * 1024 * 1024; // 10MB

  const manejarSeleccionArchivo = (e: React.ChangeEvent<HTMLInputElement>) => {
    const archivo = e.target.files?.[0];
    
    if (!archivo) return;

    // Validar tipo de archivo
    if (!tiposPermitidos.includes(archivo.type)) {
      alert('❌ Tipo de archivo no permitido. Solo se aceptan imágenes (JPEG, PNG, GIF) y videos (MP4, AVI, MOV)');
      return;
    }

    // Validar tamaño
    if (archivo.size > tamanoMaximo) {
      alert('❌ El archivo es demasiado grande. Máximo 10MB');
      return;
    }

    setArchivoSeleccionado(archivo);

    // Crear vista previa
    if (archivo.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setVistaPrevia(e.target?.result as string);
      };
      reader.readAsDataURL(archivo);
    } else {
      setVistaPrevia(''); // Para videos no mostramos preview por simplicidad
    }
  };

  const comprimirImagen = (file: File, maxWidth: number = 800, quality: number = 0.7): Promise<File> => {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      
      img.onload = () => {
        // Calcular nuevas dimensiones manteniendo proporción
        const ratio = Math.min(maxWidth / img.width, maxWidth / img.height);
        canvas.width = img.width * ratio;
        canvas.height = img.height * ratio;
        
        // Dibujar imagen redimensionada
        ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);
        
        // Convertir a blob con compresión
        canvas.toBlob((blob) => {
          if (blob) {
            const archivoComprimido = new File([blob], file.name, {
              type: file.type,
              lastModified: Date.now()
            });
            resolve(archivoComprimido);
          } else {
            resolve(file); // Fallback al archivo original
          }
        }, file.type, quality);
      };
      
      img.src = URL.createObjectURL(file);
    });
  };

  const manejarSubirUrl = async () => {
    if (!urlExterna || !urlExterna.trim()) {
      alert('❌ Ingresa una URL válida');
      return;
    }

    // Verificar autenticación
    const userStr = localStorage.getItem('siscoca_user');
    const token = localStorage.getItem('token') || localStorage.getItem('siscoca_token');
    
    if (!userStr && !token) {
      const mensaje = '⚠️ No hay sesión activa. Por favor, recarga la página e inicia sesión nuevamente.';
      alert(mensaje);
      setTimeout(() => {
        window.location.reload();
      }, 2000);
      return;
    }

    setSubiendo(true);

    try {
      const resultado = await subirCreativoUrl(campana, urlExterna);
      
      if (resultado.exito) {
        alert(`✅ ${resultado.mensaje}`);
        onCerrar();
      } else {
        if (resultado.mensaje.includes('Sesión expirada') || resultado.mensaje.includes('autenticación') || resultado.mensaje.includes('403')) {
          const mensaje = `${resultado.mensaje}\n\nPor favor, recarga la página e inicia sesión nuevamente.`;
          alert(`❌ ${mensaje}`);
          setTimeout(() => {
            window.location.reload();
          }, 2000);
        } else {
          alert(`❌ ${resultado.mensaje}`);
        }
      }
    } catch (error) {
      console.error('Error en manejarSubirUrl:', error);
      const mensajeError = error instanceof Error ? error.message : String(error);
      alert(`❌ Error: ${mensajeError}`);
      
      if (mensajeError.includes('Sesión expirada') || mensajeError.includes('autenticación') || mensajeError.includes('403')) {
        setTimeout(() => {
          window.location.reload();
        }, 2000);
      }
    } finally {
      setSubiendo(false);
    }
  };

  const manejarSubir = async () => {
    if (!archivoSeleccionado) {
      alert('❌ Selecciona un archivo primero');
      return;
    }

    // Verificar autenticación antes de intentar subir
    const userStr = localStorage.getItem('siscoca_user');
    const token = localStorage.getItem('token') || localStorage.getItem('siscoca_token');
    
    if (!userStr && !token) {
      const mensaje = '⚠️ No hay sesión activa. Por favor, recarga la página e inicia sesión nuevamente.';
      alert(mensaje);
      console.error('❌ Intento de subir creativo sin autenticación');
      console.error('localStorage keys:', Object.keys(localStorage));
      // Recargar la página para que el usuario pueda iniciar sesión
      setTimeout(() => {
        window.location.reload();
      }, 2000);
      return;
    }

    setSubiendo(true);
    
    try {
      let archivoParaSubir = archivoSeleccionado;
      
      // Comprimir imagen si es mayor a 500KB
      if (archivoSeleccionado.size > 500000 && archivoSeleccionado.type.startsWith('image/')) {
        console.log('🔄 Comprimiendo imagen...');
        archivoParaSubir = await comprimirImagen(archivoSeleccionado, 600, 0.6);
        console.log(`✅ Archivo comprimido: ${formatearTamano(archivoSeleccionado.size)} → ${formatearTamano(archivoParaSubir.size)}`);
      }
      
      const resultado = await onSubirCreativo(campana, archivoParaSubir);
      
      if (resultado.exito) {
        alert(`✅ ${resultado.mensaje}`);
        onCerrar();
      } else {
        // Si el error menciona sesión expirada o autenticación, sugerir recargar
        if (resultado.mensaje.includes('Sesión expirada') || resultado.mensaje.includes('autenticación') || resultado.mensaje.includes('403')) {
          const mensaje = `${resultado.mensaje}\n\nPor favor, recarga la página e inicia sesión nuevamente.`;
          alert(`❌ ${mensaje}`);
          setTimeout(() => {
            window.location.reload();
          }, 2000);
        } else {
          alert(`❌ ${resultado.mensaje}`);
        }
      }
    } catch (error) {
      console.error('Error en manejarSubir:', error);
      const mensajeError = error instanceof Error ? error.message : String(error);
      alert(`❌ Error: ${mensajeError}`);
      
      // Si es error de autenticación, recargar página
      if (mensajeError.includes('Sesión expirada') || mensajeError.includes('autenticación') || mensajeError.includes('403')) {
        setTimeout(() => {
          window.location.reload();
        }, 2000);
      }
    } finally {
      setSubiendo(false);
    }
  };

  const formatearTamano = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full">
        <div className="bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center rounded-t-xl">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">📎 Subir Creativo</h2>
            <p className="text-sm text-gray-600 mt-1">Campaña: {campana.nombre}</p>
          </div>
          <button
            onClick={onCerrar}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Información de la campaña */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-semibold text-blue-900 mb-2">Información de la Campaña</h3>
            <div className="text-sm text-blue-800 space-y-1">
              <p><strong>ID:</strong> {campana.id}</p>
              <p><strong>Vertical:</strong> {campana.vertical}</p>
              <p><strong>Plataforma:</strong> {campana.plataforma}</p>
              <p><strong>Dueño:</strong> {campana.nombreDueno}</p>
            </div>
          </div>

          {/* Creativo actual si existe */}
          {(campana.archivoCreativo && campana.nombreArchivoCreativo) || campana.urlCreativoExterno ? (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h3 className="font-semibold text-green-900 mb-1">✅ Creativo Configurado</h3>
                  {campana.archivoCreativo && campana.nombreArchivoCreativo ? (
                    <p className="text-sm text-green-800">
                      <strong>Archivo:</strong> {campana.nombreArchivoCreativo}
                    </p>
                  ) : null}
                  {campana.urlCreativoExterno ? (
                    <p className="text-sm text-green-800">
                      <strong>URL Externa:</strong> <a href={campana.urlCreativoExterno} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">{campana.urlCreativoExterno}</a>
                    </p>
                  ) : null}
                </div>
                {campana.archivoCreativo && campana.nombreArchivoCreativo ? (
                  <button
                    onClick={() => {
                      const resultado = descargarCreativo(campana);
                      if (resultado.exito) {
                        alert('✅ Descarga iniciada');
                      } else {
                        alert(`❌ ${resultado.mensaje}`);
                      }
                    }}
                    className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition-colors flex items-center space-x-2"
                    title="Descargar creativo"
                  >
                    <span>⬇️</span>
                    <span>Descargar</span>
                  </button>
                ) : null}
              </div>
              {campana.archivoCreativo && campana.archivoCreativo.startsWith('data:image') && (
                <div className="mt-3 border border-green-300 rounded-lg p-2 bg-white">
                  <img
                    src={campana.archivoCreativo}
                    alt="Creativo actual"
                    className="max-w-full max-h-32 mx-auto rounded-lg"
                  />
                </div>
              )}
              <p className="text-xs text-green-700 mt-2">
                💡 Puedes reemplazar el creativo subiendo un nuevo archivo o URL
              </p>
            </div>
          ) : null}

          {/* Selector de modo de subida */}
          <div className="flex space-x-2 border-b border-gray-200">
            <button
              onClick={() => {
                setModoSubida('archivo');
                setArchivoSeleccionado(null);
                setVistaPrevia('');
              }}
              className={`flex-1 px-4 py-2 text-sm font-semibold transition-colors ${
                modoSubida === 'archivo'
                  ? 'border-b-2 border-primary-600 text-primary-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              📎 Subir Archivo
            </button>
            <button
              onClick={() => {
                setModoSubida('url');
                setArchivoSeleccionado(null);
                setVistaPrevia('');
              }}
              className={`flex-1 px-4 py-2 text-sm font-semibold transition-colors ${
                modoSubida === 'url'
                  ? 'border-b-2 border-primary-600 text-primary-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              🔗 URL Externa
            </button>
          </div>

          {/* Contenido según modo seleccionado */}
          {modoSubida === 'archivo' ? (
            <>

          {/* Zona de upload */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Seleccionar Archivo *
            </label>
            
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-primary-400 transition-colors">
              <input
                type="file"
                accept=".jpg,.jpeg,.png,.gif,.mp4,.avi,.mov"
                onChange={manejarSeleccionArchivo}
                className="hidden"
                id="file-upload"
                disabled={subiendo}
              />
              
              <label
                htmlFor="file-upload"
                className={`cursor-pointer ${subiendo ? 'pointer-events-none opacity-50' : ''}`}
              >
                <div className="text-4xl mb-4">📎</div>
                <p className="text-lg font-semibold text-gray-700 mb-2">
                  Haz clic para seleccionar archivo
                </p>
                <p className="text-sm text-gray-500">
                  Imágenes: JPEG, PNG, GIF • Videos: MP4, AVI, MOV
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  Máximo 10MB
                </p>
              </label>
            </div>
          </div>

          {/* Vista previa */}
          {vistaPrevia && (
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Vista Previa
              </label>
              <div className="border border-gray-300 rounded-lg p-4">
                <img
                  src={vistaPrevia}
                  alt="Vista previa"
                  className="max-w-full max-h-48 mx-auto rounded-lg"
                />
              </div>
            </div>
          )}

          {/* Información del archivo seleccionado */}
          {archivoSeleccionado && (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <h4 className="font-semibold text-gray-900 mb-2">Archivo Seleccionado</h4>
              <div className="text-sm text-gray-600 space-y-1">
                <p><strong>Nombre:</strong> {archivoSeleccionado.name}</p>
                <p><strong>Tamaño:</strong> {formatearTamano(archivoSeleccionado.size)}</p>
                <p><strong>Tipo:</strong> {archivoSeleccionado.type}</p>
              </div>
            </div>
          )}
            </>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  URL del Creativo Externo *
                </label>
                <input
                  type="url"
                  value={urlExterna}
                  onChange={(e) => setUrlExterna(e.target.value)}
                  placeholder="https://ejemplo.com/creativo.mp4"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  disabled={subiendo}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Ingresa la URL completa donde está alojado el creativo (ej: Google Drive, Dropbox, servidor externo)
                </p>
              </div>
              
              {urlExterna && urlExterna.trim() && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-semibold text-blue-900 mb-2">Vista previa de URL</h4>
                  <p className="text-sm text-blue-800 break-all">
                    <a href={urlExterna} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">
                      {urlExterna}
                    </a>
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Instrucciones */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <h4 className="font-semibold text-yellow-900 mb-2">📋 Instrucciones</h4>
            <ul className="text-sm text-yellow-800 space-y-1">
              <li>• {modoSubida === 'archivo' ? 'Sube el material creativo final de la campaña' : 'Ingresa la URL completa donde está alojado el creativo'}</li>
              <li>• {modoSubida === 'archivo' ? 'El archivo será visible para quien active la campaña' : 'Usa esta opción si el archivo no carga por problemas técnicos'}</li>
              <li>• {modoSubida === 'archivo' ? 'Asegúrate de que el archivo sea la versión final' : 'La URL debe ser accesible públicamente o desde un servicio compartido'}</li>
              <li>• Una vez guardado, el estado cambiará a "Creativo Enviado!"</li>
            </ul>
          </div>

          {/* Botones */}
          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onCerrar}
              disabled={subiendo}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-semibold transition-colors disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              onClick={modoSubida === 'archivo' ? manejarSubir : manejarSubirUrl}
              disabled={
                (modoSubida === 'archivo' && !archivoSeleccionado) ||
                (modoSubida === 'url' && (!urlExterna || !urlExterna.trim())) ||
                subiendo
              }
              className="px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {subiendo ? 'Guardando...' : modoSubida === 'archivo' ? 'Subir Creativo' : 'Guardar URL Externa'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

