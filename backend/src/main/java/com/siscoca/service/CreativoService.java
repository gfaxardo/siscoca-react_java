package com.siscoca.service;

import com.siscoca.model.AuditEntity;
import com.siscoca.model.Campana;
import com.siscoca.model.Creativo;
import com.siscoca.model.EstadoCampana;
import com.siscoca.repository.CampanaRepository;
import com.siscoca.repository.CreativoRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Optional;
import java.util.Map;

@Service
public class CreativoService {
    
    private static final Logger logger = LoggerFactory.getLogger(CreativoService.class);
    
    @Autowired
    private CreativoRepository creativoRepository;
    
    @Autowired
    private CampanaRepository campanaRepository;
    
    @Autowired
    private TareaService tareaService;
    
    @Autowired
    private AuditLogger auditLogger;
    
    public List<Creativo> obtenerCreativosPorCampana(Long campanaId) {
        return creativoRepository.findByCampanaIdOrderByOrdenAsc(campanaId);
    }
    
    public List<Creativo> obtenerCreativosActivosPorCampana(Long campanaId) {
        return creativoRepository.findActivosByCampanaId(campanaId);
    }
    
    public List<Creativo> obtenerCreativosDescartadosPorCampana(Long campanaId) {
        return creativoRepository.findDescartadosByCampanaId(campanaId);
    }
    
    public Optional<Creativo> obtenerCreativoPorId(Long id) {
        return creativoRepository.findById(id);
    }
    
    /**
     * Verifica y sincroniza el estado de la campaña basándose en los creativos activos
     * - Si hay creativos activos y está en PENDIENTE → cambiar a CREATIVO_ENVIADO
     * - Si NO hay creativos activos y está en ACTIVA o CREATIVO_ENVIADO → cambiar a PENDIENTE
     */
    @Transactional
    public void verificarYSincronizarEstadoCampana(Long campanaId) {
        Optional<Campana> campanaOpt = campanaRepository.findById(campanaId);
        if (campanaOpt.isEmpty()) {
            logger.warn("No se encontró la campaña con ID: {}", campanaId);
            return;
        }
        
        Campana campana = campanaOpt.get();
        long activosCount = creativoRepository.countByCampana_IdAndActivoTrue(campanaId);
        EstadoCampana estadoActual = campana.getEstado();
        boolean cambioRealizado = false;
        
        // Si hay creativos activos pero está en PENDIENTE → cambiar a CREATIVO_ENVIADO
        if (activosCount > 0 && estadoActual == EstadoCampana.PENDIENTE) {
            campana.setEstado(EstadoCampana.CREATIVO_ENVIADO);
            campana.setFechaActualizacion(LocalDateTime.now());
            campanaRepository.save(campana);
            cambioRealizado = true;
            logger.info("Campaña {} sincronizada: PENDIENTE → CREATIVO_ENVIADO ({} creativos activos)", 
                campanaId, activosCount);
            
            // Generar tarea de activar campaña
            try {
                tareaService.generarTareasPendientes();
            } catch (Exception e) {
                logger.error("Error generando tareas después de sincronizar estado: {}", e.getMessage());
            }
        }
        // Si NO hay creativos activos pero está en ACTIVA o CREATIVO_ENVIADO → cambiar a PENDIENTE
        else if (activosCount == 0 && 
                 (estadoActual == EstadoCampana.ACTIVA || 
                  estadoActual == EstadoCampana.CREATIVO_ENVIADO)) {
            campana.setEstado(EstadoCampana.PENDIENTE);
            campana.setFechaActualizacion(LocalDateTime.now());
            campanaRepository.save(campana);
            cambioRealizado = true;
            logger.info("Campaña {} sincronizada: {} → PENDIENTE (sin creativos activos)", 
                campanaId, estadoActual.getDisplayName());
        }
        
        if (!cambioRealizado) {
            logger.debug("Campaña {} ya tiene estado correcto: {} ({} creativos activos)", 
                campanaId, estadoActual.getDisplayName(), activosCount);
        }
    }
    
    @Transactional
    public Creativo crearCreativo(Long campanaId, Creativo creativo) {
        Optional<Campana> campanaOpt = campanaRepository.findById(campanaId);
        if (campanaOpt.isEmpty()) {
            throw new RuntimeException("Campaña no encontrada");
        }
        
        Campana campana = campanaOpt.get();
        
        // Verificar límite de 5 creativos activos
        long activosCount = creativoRepository.countByCampana_IdAndActivoTrue(campanaId);
        if (activosCount >= 5 && creativo.getActivo() != null && creativo.getActivo()) {
            throw new RuntimeException("No se pueden tener más de 5 creativos activos por campaña");
        }
        
        // Si no se especifica orden, usar el siguiente disponible
        if (creativo.getOrden() == null) {
            long totalCount = creativoRepository.countByCampana_Id(campanaId);
            creativo.setOrden((int) totalCount);
        }
        
        // Nota: Las imágenes ahora se suben directamente desde el frontend a la API externa
        // El frontend envía solo la URL pública en urlCreativoExterno
        // Ya no procesamos archivoCreativo (base64) aquí
        
        // Determinar si este será el primer creativo activo
        // Considerar creativo activo si tiene urlCreativoExterno o archivoCreativo (legacy)
        boolean tieneContenido = (creativo.getUrlCreativoExterno() != null && !creativo.getUrlCreativoExterno().isEmpty()) ||
                                 (creativo.getArchivoCreativo() != null && !creativo.getArchivoCreativo().isEmpty());
        boolean esPrimerCreativoActivo = (creativo.getActivo() != null && creativo.getActivo()) && 
                                         activosCount == 0 && tieneContenido;
        
        // Si es el primer creativo activo y la campaña está en PENDIENTE, cambiar estado a CREATIVO_ENVIADO
        boolean cambioEstado = false;
        if (esPrimerCreativoActivo && campana.getEstado() == EstadoCampana.PENDIENTE) {
            campana.setEstado(EstadoCampana.CREATIVO_ENVIADO);
            campana.setFechaActualizacion(LocalDateTime.now());
            campanaRepository.save(campana);
            cambioEstado = true;
        }
        
        // Asegurar que archivoCreativo sea null si no viene (para evitar guardar null explícito)
        // Solo si viene urlCreativoExterno, asegurar que archivoCreativo sea null
        if (creativo.getUrlCreativoExterno() != null && !creativo.getUrlCreativoExterno().isEmpty()) {
            // Si viene URL externa, no debería venir archivoCreativo
            if (creativo.getArchivoCreativo() == null || creativo.getArchivoCreativo().trim().isEmpty()) {
                creativo.setArchivoCreativo(null);
            }
        }
        
        creativo.setCampana(campana);
        
        Creativo creativoGuardado = creativoRepository.save(creativo);
        
        // Refrescar la entidad desde la BD para asegurar que tenemos los datos actualizados
        creativoRepository.flush();
        creativoGuardado = creativoRepository.findById(creativoGuardado.getId()).orElse(creativoGuardado);
        
        logger.debug("Creativo creado para campaña {}: ID={}, activo={}, urlExterna={}", 
            campanaId, creativoGuardado.getId(), creativoGuardado.getActivo(), 
            creativoGuardado.getUrlCreativoExterno() != null);
        
        Map<String, Object> detalles = new LinkedHashMap<>();
        detalles.put("campanaId", campanaId);
        detalles.put("creativo", resumenCreativo(creativoGuardado));
        detalles.put("cambioEstadoCampana", cambioEstado);
        auditLogger.log(
                AuditEntity.CREATIVOS,
                "Crear",
                String.valueOf(creativoGuardado.getId()),
                "Creativo creado",
                detalles
        );
        
        // Si cambió el estado, generar tarea de ACTIVAR_CAMPANA
        if (cambioEstado) {
            try {
                tareaService.generarTareasPendientes();
            } catch (Exception e) {
                logger.error("Error generando tareas después de cambiar estado: {}", e.getMessage());
            }
        }
        
        // Si la campaña está ACTIVA y se agregó un nuevo creativo activo, generar tarea para trafficker
        if (campana.getEstado() == EstadoCampana.ACTIVA && 
            creativo.getActivo() != null && creativo.getActivo() && 
            !esPrimerCreativoActivo) {
            try {
                tareaService.crearTareaParaNuevoCreativo(campana);
            } catch (Exception e) {
                logger.error("Error generando tarea para nuevo creativo: {}", e.getMessage());
            }
        }
        
        // Siempre verificar y sincronizar estado después de crear (por si ya había creativos)
        verificarYSincronizarEstadoCampana(campanaId);
        
        return creativoGuardado;
    }
    
    @Transactional
    public Creativo actualizarCreativo(Long id, Creativo creativoActualizado) {
        Optional<Creativo> creativoOpt = creativoRepository.findById(id);
        if (creativoOpt.isEmpty()) {
            throw new RuntimeException("Creativo no encontrado");
        }
        
        Creativo creativo = creativoOpt.get();
        Map<String, Object> datosAntes = resumenCreativo(creativo);
        
        // Si se está activando, verificar límite de 5 activos
        if (creativoActualizado.getActivo() != null && 
            creativoActualizado.getActivo() && 
            !creativo.getActivo()) {
            // Contar activos excluyendo el que se está actualizando (ya que aún no está activo)
            long activosCount = creativoRepository.countByCampana_IdAndActivoTrue(creativo.getCampana().getId());
            if (activosCount >= 5) {
                throw new RuntimeException("No se pueden tener más de 5 creativos activos por campaña");
            }
        }
        
        // Actualizar campos
        // Nota: Las imágenes ahora se suben directamente desde el frontend a la API externa
        // Solo actualizamos urlCreativoExterno si viene en el request
        if (creativoActualizado.getNombreArchivoCreativo() != null) {
            creativo.setNombreArchivoCreativo(creativoActualizado.getNombreArchivoCreativo());
        }
        if (creativoActualizado.getUrlCreativoExterno() != null) {
            creativo.setUrlCreativoExterno(creativoActualizado.getUrlCreativoExterno());
        }
        if (creativoActualizado.getActivo() != null) {
            creativo.setActivo(creativoActualizado.getActivo());
        }
        if (creativoActualizado.getOrden() != null) {
            creativo.setOrden(creativoActualizado.getOrden());
        }
        
        Creativo actualizado = creativoRepository.save(creativo);
        Campana campana = creativo.getCampana();
        
        Map<String, Object> detalles = new LinkedHashMap<>();
        detalles.put("antes", datosAntes);
        detalles.put("despues", resumenCreativo(actualizado));
        detalles.put("campanaId", campana.getId());
        auditLogger.log(
                AuditEntity.CREATIVOS,
                "Actualizar",
                String.valueOf(actualizado.getId()),
                "Creativo actualizado",
                detalles
        );
        
        // Si cambió el estado activo, verificar sincronización
        if (creativoActualizado.getActivo() != null) {
            verificarYSincronizarEstadoCampana(campana.getId());
        }
        
        // Si la campaña está ACTIVA y se modificó un creativo activo, generar tarea para trafficker
        // Esto incluye: actualizar URL, activar/desactivar, cambiar contenido
        if (campana.getEstado() == EstadoCampana.ACTIVA && 
            (creativoActualizado.getActivo() != null || 
             creativoActualizado.getUrlCreativoExterno() != null ||
             creativoActualizado.getNombreArchivoCreativo() != null)) {
            
            // Solo generar tarea si el creativo está o queda activo
            boolean estabaActivo = creativo.getActivo();
            boolean quedaActivo = creativoActualizado.getActivo() != null ? 
                                  creativoActualizado.getActivo() : estabaActivo;
            
            if (quedaActivo) {
                try {
                    tareaService.crearTareaParaNuevoCreativo(campana);
                    logger.info("Tarea generada para trafficker por modificación de creativo {} en campaña activa {}", 
                        id, campana.getId());
                } catch (Exception e) {
                    logger.error("Error generando tarea por modificación de creativo: {}", e.getMessage());
                }
            }
        }
        
        return actualizado;
    }
    
    @Transactional
    public void eliminarCreativo(Long id) {
        Optional<Creativo> creativoOpt = creativoRepository.findById(id);
        if (creativoOpt.isEmpty()) {
            throw new RuntimeException("Creativo no encontrado");
        }
        
        Creativo creativo = creativoOpt.get();
        Long campanaId = creativo.getCampana().getId();
        Map<String, Object> detalles = new LinkedHashMap<>();
        detalles.put("campanaId", campanaId);
        detalles.put("creativo", resumenCreativo(creativo));
        
        // Eliminar el creativo
        creativoRepository.deleteById(id);
        logger.info("Creativo {} eliminado de la campaña {}", id, campanaId);
        
        auditLogger.log(
                AuditEntity.CREATIVOS,
                "Eliminar",
                String.valueOf(id),
                "Creativo eliminado",
                detalles
        );
        
        // Verificar y sincronizar estado después de eliminar
        verificarYSincronizarEstadoCampana(campanaId);
    }
    
    @Transactional
    public void marcarComoDescartado(Long id) {
        Optional<Creativo> creativoOpt = creativoRepository.findById(id);
        if (creativoOpt.isEmpty()) {
            throw new RuntimeException("Creativo no encontrado");
        }
        
        Creativo creativo = creativoOpt.get();
        Campana campana = creativo.getCampana();
        Long campanaId = campana.getId();
        creativo.setActivo(false);
        creativoRepository.save(creativo);
        
        logger.info("Creativo {} descartado de la campaña {}", id, campanaId);
        
        Map<String, Object> detalles = new LinkedHashMap<>();
        detalles.put("campanaId", campanaId);
        detalles.put("creativo", resumenCreativo(creativo));
        auditLogger.log(
                AuditEntity.CREATIVOS,
                "Descartar",
                String.valueOf(id),
                "Creativo marcado como descartado",
                detalles
        );
        
        // Si la campaña está ACTIVA y se descartó un creativo, generar tarea para MKT
        if (campana.getEstado() == EstadoCampana.ACTIVA) {
            try {
                tareaService.crearTareaParaDescartarCreativo(campana);
            } catch (Exception e) {
                logger.error("Error generando tarea por descarte de creativo: {}", e.getMessage());
            }
        }
        
        // Verificar y sincronizar estado después de descartar
        verificarYSincronizarEstadoCampana(campanaId);
    }
    
    @Transactional
    public void marcarComoActivo(Long id) {
        Optional<Creativo> creativoOpt = creativoRepository.findById(id);
        if (creativoOpt.isEmpty()) {
            throw new RuntimeException("Creativo no encontrado");
        }
        
        Creativo creativo = creativoOpt.get();
        Campana campana = creativo.getCampana();
        Long campanaId = campana.getId();
        
        // Verificar límite de 5 activos
        long activosCount = creativoRepository.countByCampana_IdAndActivoTrue(campanaId);
        if (activosCount >= 5) {
            throw new RuntimeException("No se pueden tener más de 5 creativos activos por campaña");
        }
        
        creativo.setActivo(true);
        creativoRepository.save(creativo);
        
        logger.info("Creativo {} activado en la campaña {}", id, campanaId);
        
        Map<String, Object> detalles = new LinkedHashMap<>();
        detalles.put("campanaId", campanaId);
        detalles.put("creativo", resumenCreativo(creativo));
        auditLogger.log(
                AuditEntity.CREATIVOS,
                "Activar",
                String.valueOf(id),
                "Creativo marcado como activo",
                detalles
        );
        
        // Verificar y sincronizar estado después de activar
        verificarYSincronizarEstadoCampana(campanaId);
        
        // Si la campaña está ACTIVA y se activó un creativo, generar tarea para trafficker
        if (campana.getEstado() == EstadoCampana.ACTIVA) {
            try {
                tareaService.crearTareaParaNuevoCreativo(campana);
                logger.info("Tarea generada para trafficker por activación de creativo {} en campaña activa {}", 
                    id, campanaId);
            } catch (Exception e) {
                logger.error("Error generando tarea por activación de creativo: {}", e.getMessage());
            }
        }
    }
    
    @Transactional
    public void actualizarOrden(Long id, Integer nuevoOrden) {
        Optional<Creativo> creativoOpt = creativoRepository.findById(id);
        if (creativoOpt.isEmpty()) {
            throw new RuntimeException("Creativo no encontrado");
        }
        
        Creativo creativo = creativoOpt.get();
        creativo.setOrden(nuevoOrden);
        creativoRepository.save(creativo);
        
        Map<String, Object> detalles = new LinkedHashMap<>();
        detalles.put("campanaId", creativo.getCampana().getId());
        detalles.put("creativo", resumenCreativo(creativo));
        detalles.put("nuevoOrden", nuevoOrden);
        auditLogger.log(
                AuditEntity.CREATIVOS,
                "Reordenar",
                String.valueOf(id),
                "Orden de creativo actualizado",
                detalles
        );
    }
    
    private Map<String, Object> resumenCreativo(Creativo creativo) {
        Map<String, Object> data = new LinkedHashMap<>();
        if (creativo == null) {
            return data;
        }
        data.put("id", creativo.getId());
        data.put("nombreArchivo", creativo.getNombreArchivoCreativo());
        data.put("urlExterna", creativo.getUrlCreativoExterno());
        data.put("activo", creativo.getActivo());
        data.put("orden", creativo.getOrden());
        data.put("campanaId", creativo.getCampana() != null ? creativo.getCampana().getId() : null);
        return data;
    }
}

