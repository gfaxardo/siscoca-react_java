import { Creativo } from '../types';

import { API_BASE_URL } from '../config/api';

class CreativoService {
  private getAuthHeaders(): HeadersInit {
    let token: string | null = null;
    
    const userStr = localStorage.getItem('siscoca_user');
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        token = user?.token || null;
        if (token && (token === 'null' || token === 'undefined' || token.trim() === '')) {
          token = null;
        }
      } catch (error) {
        console.error('Error parsing user from localStorage:', error);
      }
    }
    
    if (!token) {
      token = localStorage.getItem('token') || localStorage.getItem('siscoca_token');
      if (token && (token === 'null' || token === 'undefined' || token.trim() === '')) {
        token = null;
      }
    }
    
    const headers: HeadersInit = {
      'Content-Type': 'application/json'
    };
    
    if (token && token !== 'null' && token !== 'undefined' && token.trim() !== '') {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    return headers;
  }

  async obtenerCreativosPorCampana(campanaId: string): Promise<Creativo[]> {
    const response = await fetch(`${API_BASE_URL}/creativos/campana/${campanaId}`, {
      method: 'GET',
      headers: this.getAuthHeaders()
    });

    if (!response.ok) {
      throw new Error(`Error al obtener creativos: ${response.statusText}`);
    }

    const data = await response.json();
    return data.map((c: any) => ({
      id: c.id.toString(),
      campanaId: c.campana?.id?.toString() || campanaId,
      archivoCreativo: c.archivoCreativo,
      nombreArchivoCreativo: c.nombreArchivoCreativo,
      urlCreativoExterno: c.urlCreativoExterno,
      activo: c.activo !== false,
      orden: c.orden || 0,
      fechaCreacion: c.fechaCreacion ? new Date(c.fechaCreacion) : new Date(),
      fechaActualizacion: c.fechaActualizacion ? new Date(c.fechaActualizacion) : undefined
    }));
  }

  /**
   * Sube una imagen directamente a la API externa de media
   * @param archivo Archivo a subir
   * @returns URL pública de la imagen subida
   */
  async subirImagenAMedia(archivo: File): Promise<string> {
    const formData = new FormData();
    formData.append('bucket', 'siscoca');
    formData.append('file', archivo);

    const response = await fetch('http://178.156.204.129:3000/media', {
      method: 'POST',
      body: formData
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Error al subir imagen: ${response.statusText} - ${errorText}`);
    }

    const data = await response.json();
    if (data.url) {
      return data.url;
    } else {
      throw new Error('La API no devolvió una URL válida');
    }
  }

  async crearCreativo(campanaId: string, creativo: Partial<Creativo>): Promise<Creativo> {
    const response = await fetch(`${API_BASE_URL}/creativos/campana/${campanaId}`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({
        // Ya no enviamos archivoCreativo (base64), solo urlCreativoExterno
        nombreArchivoCreativo: creativo.nombreArchivoCreativo,
        urlCreativoExterno: creativo.urlCreativoExterno,
        activo: creativo.activo !== false,
        orden: creativo.orden || 0
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Error al crear creativo: ${response.statusText}`);
    }

    const data = await response.json();
    return {
      id: data.id.toString(),
      campanaId: data.campana?.id?.toString() || campanaId,
      archivoCreativo: data.archivoCreativo,
      nombreArchivoCreativo: data.nombreArchivoCreativo,
      urlCreativoExterno: data.urlCreativoExterno,
      activo: data.activo !== false,
      orden: data.orden || 0,
      fechaCreacion: data.fechaCreacion ? new Date(data.fechaCreacion) : new Date(),
      fechaActualizacion: data.fechaActualizacion ? new Date(data.fechaActualizacion) : undefined
    };
  }

  async actualizarCreativo(id: string, creativo: Partial<Creativo>): Promise<Creativo> {
    const response = await fetch(`${API_BASE_URL}/creativos/${id}`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({
        archivoCreativo: creativo.archivoCreativo,
        nombreArchivoCreativo: creativo.nombreArchivoCreativo,
        urlCreativoExterno: creativo.urlCreativoExterno,
        activo: creativo.activo,
        orden: creativo.orden
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Error al actualizar creativo: ${response.statusText}`);
    }

    const data = await response.json();
    return {
      id: data.id.toString(),
      campanaId: data.campana?.id?.toString() || '',
      archivoCreativo: data.archivoCreativo,
      nombreArchivoCreativo: data.nombreArchivoCreativo,
      urlCreativoExterno: data.urlCreativoExterno,
      activo: data.activo !== false,
      orden: data.orden || 0,
      fechaCreacion: data.fechaCreacion ? new Date(data.fechaCreacion) : new Date(),
      fechaActualizacion: data.fechaActualizacion ? new Date(data.fechaActualizacion) : undefined
    };
  }

  async eliminarCreativo(id: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/creativos/${id}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders()
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Error al eliminar creativo: ${response.statusText}`);
    }
  }

  async marcarComoDescartado(id: string): Promise<Creativo> {
    const response = await fetch(`${API_BASE_URL}/creativos/${id}/descartar`, {
      method: 'PATCH',
      headers: this.getAuthHeaders()
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Error al descartar creativo: ${response.statusText}`);
    }

    const data = await response.json();
    return {
      id: data.id.toString(),
      campanaId: data.campana?.id?.toString() || '',
      archivoCreativo: data.archivoCreativo,
      nombreArchivoCreativo: data.nombreArchivoCreativo,
      urlCreativoExterno: data.urlCreativoExterno,
      activo: false,
      orden: data.orden || 0,
      fechaCreacion: data.fechaCreacion ? new Date(data.fechaCreacion) : new Date(),
      fechaActualizacion: data.fechaActualizacion ? new Date(data.fechaActualizacion) : undefined
    };
  }

  async marcarComoActivo(id: string): Promise<Creativo> {
    const response = await fetch(`${API_BASE_URL}/creativos/${id}/activar`, {
      method: 'PATCH',
      headers: this.getAuthHeaders()
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Error al activar creativo: ${response.statusText}`);
    }

    const data = await response.json();
    return {
      id: data.id.toString(),
      campanaId: data.campana?.id?.toString() || '',
      archivoCreativo: data.archivoCreativo,
      nombreArchivoCreativo: data.nombreArchivoCreativo,
      urlCreativoExterno: data.urlCreativoExterno,
      activo: true,
      orden: data.orden || 0,
      fechaCreacion: data.fechaCreacion ? new Date(data.fechaCreacion) : new Date(),
      fechaActualizacion: data.fechaActualizacion ? new Date(data.fechaActualizacion) : undefined
    };
  }

  async descargarCreativo(id: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/creativos/${id}/descargar`, {
      method: 'GET',
      headers: this.getAuthHeaders()
    });

    if (!response.ok) {
      throw new Error(`Error al descargar creativo: ${response.statusText}`);
    }

    // Obtener el nombre del archivo del header Content-Disposition
    const contentDisposition = response.headers.get('Content-Disposition');
    let nombreArchivo = `creativo_${id}`;
    if (contentDisposition) {
      const matches = contentDisposition.match(/filename="?(.+)"?/);
      if (matches && matches[1]) {
        nombreArchivo = matches[1];
      }
    }

    // Obtener el blob del archivo
    const blob = await response.blob();
    
    // Crear URL temporal y descargar
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = nombreArchivo;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  }

  async sincronizarEstadoCampana(campanaId: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/creativos/campana/${campanaId}/sincronizar-estado`, {
      method: 'POST',
      headers: this.getAuthHeaders()
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Error al sincronizar estado: ${response.statusText}`);
    }
  }
}

export const creativoService = new CreativoService();

