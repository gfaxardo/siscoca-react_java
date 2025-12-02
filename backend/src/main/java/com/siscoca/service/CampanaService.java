package com.siscoca.service;

import com.siscoca.dto.CampanaDto;
import com.siscoca.model.*;
import com.siscoca.model.AuditEntity;
import com.siscoca.repository.CampanaRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.temporal.WeekFields;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.LinkedHashMap;
import java.util.stream.Collectors;

@Service
public class CampanaService {
    
    @Autowired
    private CampanaRepository campanaRepository;
    
    @Autowired
    private HistoricoService historicoService;
    
    @Autowired
    private TareaService tareaService;
    
    @Autowired
    private com.siscoca.repository.UsuarioRepository usuarioRepository;
    
    @Autowired
    private AuditLogger auditLogger;
    
    public List<CampanaDto> getAllCampanas() {
        // Optimizado: Usa findAll() simple porque el DTO no necesita relaciones
        // Si necesitas historicos/creativos, usa findAllWithRelations()
        return campanaRepository.findAll().stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }
    
    public CampanaDto getCampanaById(Long id) {
        // Optimizado: Usa findById() simple para DTOs
        return campanaRepository.findById(id)
                .map(this::convertToDto)
                .orElse(null);
    }
    
    public CampanaDto createCampana(CampanaDto campanaDto, String username) {
        Campana campana = convertToEntity(campanaDto);
        campana.setEstado(EstadoCampana.PENDIENTE);
        campana.setFechaCreacion(LocalDateTime.now());
        campana.setFechaActualizacion(LocalDateTime.now());
        // Las campañas se crean con la semana anterior (semana actual - 1)
        campana.setSemanaISO(getPreviousWeekISO());
        
        // Si no se especificó un dueño en el DTO, usar el usuario autenticado como dueño por defecto
        if (campanaDto.getNombreDueno() == null || campanaDto.getNombreDueno().trim().isEmpty()) {
            if (username != null && !username.trim().isEmpty()) {
                // Intentar obtener el nombre completo del usuario desde la base de datos
                com.siscoca.model.Usuario usuario = usuarioRepository.findByUsername(username).orElse(null);
                if (usuario != null) {
                    campana.setNombreDueno(usuario.getNombre());
                    // Si el usuario tiene iniciales, usarlas; si no, generar desde el nombre
                    if (usuario.getIniciales() != null && !usuario.getIniciales().trim().isEmpty()) {
                        campana.setInicialesDueno(usuario.getIniciales());
                    } else {
                        // Generar iniciales automáticamente desde el nombre
                        campana.setInicialesDueno(generarIniciales(usuario.getNombre()));
                    }
                } else {
                    // Si no se encuentra el usuario en la BD, usar el username como nombre
                    campana.setNombreDueno(username);
                    campana.setInicialesDueno(generarIniciales(username));
                }
            }
        }
        
        Campana savedCampana = campanaRepository.save(campana);
        
        // Generar tarea pendiente para la nueva campaña
        try {
            tareaService.generarTareasPendientes();
        } catch (Exception e) {
            // Si falla la generación de tareas, no fallar la creación de la campaña
            System.err.println("Error generando tareas para nueva campaña: " + e.getMessage());
        }
        
        Map<String, Object> detalles = new LinkedHashMap<>();
        detalles.put("campana", resumenCampana(savedCampana));
        if (username != null) {
            detalles.put("creadoPor", username);
        }
        auditLogger.log(
                AuditEntity.CAMPANAS,
                "Crear",
                String.valueOf(savedCampana.getId()),
                "Campaña creada",
                detalles
        );
        
        return convertToDto(savedCampana);
    }
    
    /**
     * Genera iniciales automáticamente desde un nombre
     * Ejemplo: "Juan Pérez" -> "JP"
     */
    private String generarIniciales(String nombre) {
        if (nombre == null || nombre.trim().isEmpty()) {
            return "";
        }
        
        String[] partes = nombre.trim().split("\\s+");
        if (partes.length == 0) {
            return "";
        }
        
        StringBuilder iniciales = new StringBuilder();
        iniciales.append(partes[0].charAt(0));
        
        if (partes.length > 1) {
            iniciales.append(partes[partes.length - 1].charAt(0));
        }
        
        return iniciales.toString().toUpperCase();
    }
    
    public CampanaDto updateCampana(Long id, CampanaDto campanaDto) {
        return campanaRepository.findById(id)
                .map(existingCampana -> {
                    Map<String, Object> datosAntes = resumenCampana(existingCampana);
                    EstadoCampana estadoAnterior = existingCampana.getEstado();
                    
                    // Detectar si se están actualizando métricas (trafficker o dueño)
                    // Nota: verificar explícitamente si los campos están presentes (incluyendo 0)
                    boolean actualizandoMetricasTrafficker = campanaDto.getAlcance() != null || 
                                                           campanaDto.getClics() != null || 
                                                           campanaDto.getLeads() != null || 
                                                           campanaDto.getCostoSemanal() != null ||
                                                           campanaDto.getUrlInforme() != null;
                    
                    // Para métricas del dueño, verificar si los campos están presentes en el DTO
                    // Necesitamos verificar si las propiedades Long están presentes (no null)
                    // pero también permitir 0 como valor válido
                    boolean actualizandoMetricasDueno = campanaDto.getConductoresRegistrados() != null || 
                                                       campanaDto.getConductoresPrimerViaje() != null;
                    
                    updateCampanaFromDto(existingCampana, campanaDto);
                    existingCampana.setFechaActualizacion(LocalDateTime.now());
                    Campana campanaGuardada = campanaRepository.save(existingCampana);
                    
                    // Si cambió el estado, registrar log específico de cambio de estado
                    if (campanaDto.getEstado() != null && campanaGuardada.getEstado() != estadoAnterior) {
                        Map<String, Object> detallesEstado = new LinkedHashMap<>();
                        detallesEstado.put("estadoAnterior", estadoAnterior.getDisplayName());
                        detallesEstado.put("estadoNuevo", campanaGuardada.getEstado().getDisplayName());
                        detallesEstado.put("motivo", "Cambio manual de estado");
                        auditLogger.log(
                                AuditEntity.CAMPANAS,
                                "Cambiar estado",
                                String.valueOf(campanaGuardada.getId()),
                                "Estado cambiado: " + estadoAnterior.getDisplayName() + " → " + campanaGuardada.getEstado().getDisplayName(),
                                detallesEstado
                        );
                    }
                    
                    // Si se actualizaron métricas, guardar automáticamente en histórico semanal de la semana anterior
                    if (actualizandoMetricasTrafficker || actualizandoMetricasDueno) {
                        guardarMetricasEnHistoricoSemanal(campanaGuardada, actualizandoMetricasTrafficker, actualizandoMetricasDueno);
                    }
                    
                    // Actualizar tareas pendientes
                    try {
                        tareaService.verificarTareasActivas(campanaGuardada);
                    } catch (Exception e) {
                        System.err.println("Error actualizando tareas: " + e.getMessage());
                    }
                    
                    Map<String, Object> detalles = new LinkedHashMap<>();
                    detalles.put("antes", datosAntes);
                    detalles.put("despues", resumenCampana(campanaGuardada));
                    if (actualizandoMetricasTrafficker || actualizandoMetricasDueno) {
                        detalles.put("metricasActualizadas", true);
                    }
                    auditLogger.log(
                            AuditEntity.CAMPANAS,
                            "Actualizar",
                            String.valueOf(campanaGuardada.getId()),
                            "Campaña actualizada",
                            detalles
                    );
                    
                    return convertToDto(campanaGuardada);
                })
                .orElse(null);
    }
    
    /**
     * Guarda las métricas de la campaña en el histórico semanal de la semana anterior
     * Ejecuta las operaciones realmente, guardando en la base de datos como si fuera el dueño
     */
    private void guardarMetricasEnHistoricoSemanal(Campana campana, boolean actualizandoTrafficker, boolean actualizandoDueno) {
        try {
            int semanaAnterior = getPreviousWeekISO();
            
            // Verificar si ya existe un registro histórico para esta campaña y semana anterior
            List<HistoricoSemanal> historicosExistentes = historicoService.obtenerHistoricoPorCampana(campana.getId());
            HistoricoSemanal historicoExistente = historicosExistentes.stream()
                .filter(h -> h.getSemanaISO().equals(semanaAnterior))
                .findFirst()
                .orElse(null);
            
            HistoricoSemanal historico;
            
            if (historicoExistente != null) {
                // Actualizar registro existente
                historico = historicoExistente;
            } else {
                // Crear nuevo registro
                historico = new HistoricoSemanal();
                historico.setCampana(campana);
                historico.setSemanaISO(semanaAnterior);
                historico.setFechaSemana(LocalDateTime.now());
            }
            
            // Establecer quién registró la actualización
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            String usuarioActual = authentication != null ? authentication.getName() : "Sistema";
            historico.setRegistradoPor(usuarioActual);
            
            // Actualizar métricas según lo que se esté actualizando
            if (actualizandoTrafficker) {
                if (campana.getAlcance() != null) historico.setAlcance(campana.getAlcance());
                if (campana.getClics() != null) historico.setClics(campana.getClics());
                if (campana.getLeads() != null) historico.setLeads(campana.getLeads());
                if (campana.getCostoSemanal() != null) historico.setCostoSemanal(campana.getCostoSemanal());
                if (campana.getCostoLead() != null) historico.setCostoLead(campana.getCostoLead());
            }
            
            if (actualizandoDueno) {
                if (campana.getConductoresRegistrados() != null) historico.setConductoresRegistrados(campana.getConductoresRegistrados());
                if (campana.getConductoresPrimerViaje() != null) historico.setConductoresPrimerViaje(campana.getConductoresPrimerViaje());
                
                // Calcular costos por conductor
                if (campana.getCostoSemanal() != null) {
                    if (historico.getConductoresRegistrados() != null && historico.getConductoresRegistrados() > 0) {
                        historico.setCostoConductorRegistrado(campana.getCostoSemanal() / historico.getConductoresRegistrados());
                    }
                    if (historico.getConductoresPrimerViaje() != null && historico.getConductoresPrimerViaje() > 0) {
                        historico.setCostoConductorPrimerViaje(campana.getCostoSemanal() / historico.getConductoresPrimerViaje());
                    }
                }
            }
            
            // Guardar o actualizar realmente en la base de datos
            if (historicoExistente != null) {
                historicoService.actualizarRegistroHistorico(historicoExistente.getId(), historico);
            } else {
                historicoService.crearRegistroHistorico(historico);
            }
        } catch (Exception e) {
            // Log del error pero no fallar la actualización de la campaña
            System.err.println("Error guardando métricas en histórico semanal: " + e.getMessage());
            e.printStackTrace();
        }
    }
    
    public boolean deleteCampana(Long id) {
        return campanaRepository.findById(id)
                .map(campana -> {
                    campanaRepository.deleteById(id);
                    Map<String, Object> detalles = new LinkedHashMap<>();
                    detalles.put("campana", resumenCampana(campana));
                    auditLogger.log(
                            AuditEntity.CAMPANAS,
                            "Eliminar",
                            String.valueOf(id),
                            "Campaña eliminada",
                            detalles
                    );
                    return true;
                })
                .orElse(false);
    }
    
    /**
     * Archiva una campaña: guarda las métricas en el histórico semanal y cambia el estado a ARCHIVADA
     * @param id ID de la campaña a archivar
     * @return CampanaDto con el estado actualizado, o null si no se encontró la campaña
     */
    public CampanaDto archivarCampana(Long id) {
        return campanaRepository.findById(id)
                .map(campana -> {
                    // Refrescar la campaña desde la BD para asegurar datos actualizados
                    campana = campanaRepository.findById(id).orElse(campana);
                    
                    // Log para depuración - mostrar valores actuales de las métricas
                    System.out.println("DEBUG - Archivando campaña ID: " + id);
                    System.out.println("DEBUG - Alcance: " + campana.getAlcance());
                    System.out.println("DEBUG - Clics: " + campana.getClics());
                    System.out.println("DEBUG - Leads: " + campana.getLeads());
                    System.out.println("DEBUG - Costo Semanal: " + campana.getCostoSemanal());
                    System.out.println("DEBUG - Conductores Registrados: " + campana.getConductoresRegistrados());
                    System.out.println("DEBUG - Conductores Primer Viaje: " + campana.getConductoresPrimerViaje());
                    
                    // Validación más flexible: permitir archivar incluso sin métricas completas
                    // Solo validar que no haya valores negativos (que serían inválidos)
                    boolean tieneValoresInvalidos = false;
                    StringBuilder valoresInvalidos = new StringBuilder();
                    
                    if (campana.getCostoSemanal() != null && campana.getCostoSemanal() < 0) {
                        valoresInvalidos.append("- Costo Semanal (negativo)\n");
                        tieneValoresInvalidos = true;
                    }
                    if (campana.getConductoresRegistrados() != null && campana.getConductoresRegistrados() < 0) {
                        valoresInvalidos.append("- Conductores Registrados (negativo)\n");
                        tieneValoresInvalidos = true;
                    }
                    if (campana.getConductoresPrimerViaje() != null && campana.getConductoresPrimerViaje() < 0) {
                        valoresInvalidos.append("- Conductores Primer Viaje (negativo)\n");
                        tieneValoresInvalidos = true;
                    }
                    
                    // Solo bloquear si hay valores negativos (inválidos)
                    if (tieneValoresInvalidos) {
                        String mensaje = "No se puede archivar: La campaña tiene valores inválidos (negativos).\n\nValores inválidos:\n" + valoresInvalidos.toString();
                        throw new IllegalArgumentException(mensaje);
                    }
                    
                    // Advertencia (pero no bloqueo) si faltan métricas importantes
                    boolean faltanMetricas = (campana.getAlcance() == null || campana.getClics() == null || 
                                             campana.getLeads() == null || campana.getCostoSemanal() == null ||
                                             campana.getConductoresRegistrados() == null || 
                                             campana.getConductoresPrimerViaje() == null);
                    if (faltanMetricas) {
                        System.out.println("ADVERTENCIA - La campaña se está archivando sin métricas completas");
                    }
                    
                    // Guardar en histórico semanal de la semana anterior
                    int semanaAnterior = getPreviousWeekISO();
                    
                    // Verificar si ya existe un registro histórico para esta campaña y semana anterior
                    List<HistoricoSemanal> historicosExistentes = historicoService.obtenerHistoricoPorCampana(campana.getId());
                    HistoricoSemanal historicoExistente = historicosExistentes.stream()
                        .filter(h -> h.getSemanaISO().equals(semanaAnterior))
                        .findFirst()
                        .orElse(null);
                    
                    HistoricoSemanal historico;
                    
                    if (historicoExistente != null) {
                        // Actualizar registro existente
                        historico = historicoExistente;
                    } else {
                        // Crear nuevo registro
                        historico = new HistoricoSemanal();
                        historico.setCampana(campana);
                        historico.setSemanaISO(semanaAnterior);
                        historico.setFechaSemana(LocalDateTime.now());
                    }
                    
                    // Actualizar todas las métricas (solo si no son null)
                    if (campana.getAlcance() != null) historico.setAlcance(campana.getAlcance());
                    if (campana.getClics() != null) historico.setClics(campana.getClics());
                    if (campana.getLeads() != null) historico.setLeads(campana.getLeads());
                    if (campana.getCostoSemanal() != null) historico.setCostoSemanal(campana.getCostoSemanal());
                    if (campana.getCostoLead() != null) historico.setCostoLead(campana.getCostoLead());
                    if (campana.getConductoresRegistrados() != null) historico.setConductoresRegistrados(campana.getConductoresRegistrados());
                    if (campana.getConductoresPrimerViaje() != null) historico.setConductoresPrimerViaje(campana.getConductoresPrimerViaje());
                    if (campana.getCostoConductorRegistrado() != null) historico.setCostoConductorRegistrado(campana.getCostoConductorRegistrado());
                    if (campana.getCostoConductorPrimerViaje() != null) historico.setCostoConductorPrimerViaje(campana.getCostoConductorPrimerViaje());
                    
                    // Guardar o actualizar el histórico
                    if (historicoExistente != null) {
                        historicoService.actualizarRegistroHistorico(historicoExistente.getId(), historico);
                    } else {
                        historicoService.crearRegistroHistorico(historico);
                    }
                    
                    // Cambiar estado a ARCHIVADA
                    campana.setEstado(EstadoCampana.ARCHIVADA);
                    campana.setFechaActualizacion(LocalDateTime.now());
                    Campana campanaGuardada = campanaRepository.save(campana);
                    
                    Map<String, Object> detalles = new LinkedHashMap<>();
                    detalles.put("campana", resumenCampana(campanaGuardada));
                    detalles.put("faltanMetricas", faltanMetricas);
                    auditLogger.log(
                            AuditEntity.CAMPANAS,
                            "Archivar",
                            String.valueOf(campanaGuardada.getId()),
                            "Campaña archivada",
                            detalles
                    );
                    
                    return convertToDto(campanaGuardada);
                })
                .orElse(null);
    }
    
    /**
     * Reactiva una campaña archivada: cambia el estado a ACTIVA
     * @param id ID de la campaña a reactivar
     * @return Campaña reactivada o null si no se encuentra
     */
    public CampanaDto reactivarCampana(Long id) {
        return campanaRepository.findById(id)
                .map(campana -> {
                    // Solo permitir reactivar campañas archivadas
                    if (campana.getEstado() != EstadoCampana.ARCHIVADA) {
                        throw new IllegalArgumentException("Solo se pueden reactivar campañas archivadas. Estado actual: " + campana.getEstado().getDisplayName());
                    }
                    
                    // Cambiar estado a ACTIVA
                    campana.setEstado(EstadoCampana.ACTIVA);
                    campana.setFechaActualizacion(LocalDateTime.now());
                    Campana campanaGuardada = campanaRepository.save(campana);
                    
                    Map<String, Object> detalles = new LinkedHashMap<>();
                    detalles.put("campana", resumenCampana(campanaGuardada));
                    auditLogger.log(
                            AuditEntity.CAMPANAS,
                            "Reactivar",
                            String.valueOf(campanaGuardada.getId()),
                            "Campaña reactivada",
                            detalles
                    );
                    
                    return convertToDto(campanaGuardada);
                })
                .orElse(null);
    }
    
    public List<CampanaDto> getCampanasByEstado(String estado) {
        try {
            EstadoCampana estadoEnum = EstadoCampana.valueOf(estado.toUpperCase());
            return campanaRepository.findByEstado(estadoEnum).stream()
                    .map(this::convertToDto)
                    .collect(Collectors.toList());
        } catch (IllegalArgumentException e) {
            return List.of();
        }
    }
    
    public List<CampanaDto> getCampanasByDueno(String nombreDueno) {
        return campanaRepository.findByNombreDueno(nombreDueno).stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }
    
    private CampanaDto convertToDto(Campana campana) {
        CampanaDto dto = new CampanaDto();
        dto.setId(campana.getId());
        dto.setNombre(campana.getNombre());
        dto.setPais(campana.getPais().name());
        dto.setVertical(campana.getVertical().name());
        dto.setPlataforma(campana.getPlataforma().name());
        dto.setSegmento(campana.getSegmento() != null ? campana.getSegmento().getDisplayName() : null);
        dto.setIdPlataformaExterna(campana.getIdPlataformaExterna());
        dto.setNombreDueno(campana.getNombreDueno());
        dto.setInicialesDueno(campana.getInicialesDueno());
        dto.setDescripcionCorta(campana.getDescripcionCorta());
        dto.setObjetivo(campana.getObjetivo());
        dto.setBeneficio(campana.getBeneficio());
        dto.setDescripcion(campana.getDescripcion());
        dto.setTipoAterrizaje(campana.getTipoAterrizaje() != null ? campana.getTipoAterrizaje().name() : null);
        dto.setUrlAterrizaje(campana.getUrlAterrizaje());
        dto.setDetalleAterrizaje(campana.getDetalleAterrizaje());
        dto.setNombrePlataforma(campana.getNombrePlataforma());
        dto.setEstado(campana.getEstado().getDisplayName());
        dto.setArchivoCreativo(campana.getArchivoCreativo());
        dto.setNombreArchivoCreativo(campana.getNombreArchivoCreativo());
        dto.setUrlCreativoExterno(campana.getUrlCreativoExterno());
        dto.setUrlInforme(campana.getUrlInforme());
        dto.setAlcance(campana.getAlcance());
        dto.setClics(campana.getClics());
        dto.setLeads(campana.getLeads());
        dto.setCostoSemanal(campana.getCostoSemanal());
        dto.setCostoLead(campana.getCostoLead());
        dto.setConductoresRegistrados(campana.getConductoresRegistrados());
        dto.setConductoresPrimerViaje(campana.getConductoresPrimerViaje());
        dto.setCostoConductorRegistrado(campana.getCostoConductorRegistrado());
        dto.setCostoConductorPrimerViaje(campana.getCostoConductorPrimerViaje());
        // Calcular costoConductor dinámicamente (no está almacenado en el modelo)
        if (campana.getCostoSemanal() != null && campana.getConductoresPrimerViaje() != null && campana.getConductoresPrimerViaje() > 0) {
            dto.setCostoConductor(campana.getCostoSemanal() / campana.getConductoresPrimerViaje());
        } else {
            dto.setCostoConductor(null);
        }
        dto.setFechaCreacion(campana.getFechaCreacion());
        dto.setFechaActualizacion(campana.getFechaActualizacion());
        dto.setSemanaISO(campana.getSemanaISO());
        return dto;
    }
    
    private Campana convertToEntity(CampanaDto dto) {
        Campana campana = new Campana();
        // Asignar valor por defecto si el nombre está vacío o es null
        if (dto.getNombre() == null || dto.getNombre().trim().isEmpty()) {
            campana.setNombre("Campaña sin nombre");
        } else {
            campana.setNombre(dto.getNombre().trim());
        }
        
        // Validar campos obligatorios
        if (dto.getPais() == null || dto.getPais().trim().isEmpty()) {
            throw new IllegalArgumentException("El país es obligatorio");
        }
        if (dto.getVertical() == null || dto.getVertical().trim().isEmpty()) {
            throw new IllegalArgumentException("El vertical es obligatorio");
        }
        if (dto.getPlataforma() == null || dto.getPlataforma().trim().isEmpty()) {
            throw new IllegalArgumentException("La plataforma es obligatoria");
        }
        if (dto.getSegmento() == null || dto.getSegmento().trim().isEmpty()) {
            throw new IllegalArgumentException("El segmento es obligatorio");
        }
        // Validación opcional: tipo de aterrizaje puede ser null si la columna no existe aún en la BD
        // if (dto.getTipoAterrizaje() == null || dto.getTipoAterrizaje().trim().isEmpty()) {
        //     throw new IllegalArgumentException("El tipo de aterrizaje es obligatorio");
        // }
        
        campana.setPais(Pais.fromDisplayName(dto.getPais()));
        campana.setVertical(Vertical.fromDisplayName(dto.getVertical()));
        campana.setPlataforma(Plataforma.fromDisplayName(dto.getPlataforma()));
        campana.setSegmento(Segmento.fromDisplayName(dto.getSegmento()));
        campana.setIdPlataformaExterna(dto.getIdPlataformaExterna());
        if (dto.getTipoAterrizaje() != null && !dto.getTipoAterrizaje().trim().isEmpty()) {
            try {
                campana.setTipoAterrizaje(TipoAterrizaje.valueOf(dto.getTipoAterrizaje().trim().toUpperCase()));
            } catch (IllegalArgumentException ex) {
                campana.setTipoAterrizaje(null);
            }
        } else {
            campana.setTipoAterrizaje(null);
        }
        campana.setUrlAterrizaje(dto.getUrlAterrizaje());
        campana.setDetalleAterrizaje(dto.getDetalleAterrizaje());
        campana.setNombrePlataforma(dto.getNombrePlataforma());
        campana.setNombreDueno(dto.getNombreDueno());
        campana.setInicialesDueno(dto.getInicialesDueno());
        campana.setDescripcionCorta(dto.getDescripcionCorta());
        campana.setObjetivo(dto.getObjetivo());
        campana.setBeneficio(dto.getBeneficio());
        campana.setDescripcion(dto.getDescripcion());
        // Campos de aterrizaje removidos del modelo - ignorar en conversión
        // tipoAterrizaje, urlAterrizaje, nombrePlataforma ya no existen en el modelo
        campana.setArchivoCreativo(dto.getArchivoCreativo());
        campana.setNombreArchivoCreativo(dto.getNombreArchivoCreativo());
        campana.setUrlCreativoExterno(dto.getUrlCreativoExterno());
        campana.setUrlInforme(dto.getUrlInforme());
        campana.setAlcance(dto.getAlcance());
        campana.setClics(dto.getClics());
        campana.setLeads(dto.getLeads());
        campana.setCostoSemanal(dto.getCostoSemanal());
        campana.setCostoLead(dto.getCostoLead());
        campana.setConductoresRegistrados(dto.getConductoresRegistrados());
        campana.setConductoresPrimerViaje(dto.getConductoresPrimerViaje());
        campana.setCostoConductorRegistrado(dto.getCostoConductorRegistrado());
        campana.setCostoConductorPrimerViaje(dto.getCostoConductorPrimerViaje());
        
        // Calcular costo por lead automáticamente si se proporcionan costoSemanal y leads
        if (dto.getCostoSemanal() != null && dto.getLeads() != null && dto.getLeads() > 0) {
            campana.setCostoLead(dto.getCostoSemanal() / dto.getLeads());
        }
        
        // costoConductor ya no está almacenado en el modelo - se calcula dinámicamente
        
        return campana;
    }
    
    private void updateCampanaFromDto(Campana campana, CampanaDto dto) {
        if (dto.getNombre() != null) campana.setNombre(dto.getNombre());
        if (dto.getPais() != null) campana.setPais(Pais.fromDisplayName(dto.getPais()));
        if (dto.getVertical() != null) campana.setVertical(Vertical.fromDisplayName(dto.getVertical()));
        if (dto.getPlataforma() != null) campana.setPlataforma(Plataforma.fromDisplayName(dto.getPlataforma()));
        if (dto.getSegmento() != null) campana.setSegmento(Segmento.fromDisplayName(dto.getSegmento()));
        if (dto.getIdPlataformaExterna() != null) campana.setIdPlataformaExterna(dto.getIdPlataformaExterna());
        if (dto.getNombreDueno() != null) campana.setNombreDueno(dto.getNombreDueno());
        if (dto.getInicialesDueno() != null) campana.setInicialesDueno(dto.getInicialesDueno());
        if (dto.getDescripcionCorta() != null) campana.setDescripcionCorta(dto.getDescripcionCorta());
        if (dto.getObjetivo() != null) campana.setObjetivo(dto.getObjetivo());
        if (dto.getBeneficio() != null) campana.setBeneficio(dto.getBeneficio());
        if (dto.getDescripcion() != null) campana.setDescripcion(dto.getDescripcion());
        if (dto.getTipoAterrizaje() != null) {
            try {
                campana.setTipoAterrizaje(TipoAterrizaje.valueOf(dto.getTipoAterrizaje().trim().toUpperCase()));
            } catch (IllegalArgumentException ex) {
                // Ignorar valores inválidos
            }
        }
        if (dto.getUrlAterrizaje() != null) campana.setUrlAterrizaje(dto.getUrlAterrizaje());
        if (dto.getDetalleAterrizaje() != null) campana.setDetalleAterrizaje(dto.getDetalleAterrizaje());
        if (dto.getNombrePlataforma() != null) campana.setNombrePlataforma(dto.getNombrePlataforma());
        if (dto.getEstado() != null) campana.setEstado(EstadoCampana.fromString(dto.getEstado()));
        if (dto.getArchivoCreativo() != null) campana.setArchivoCreativo(dto.getArchivoCreativo());
        if (dto.getNombreArchivoCreativo() != null) campana.setNombreArchivoCreativo(dto.getNombreArchivoCreativo());
        if (dto.getUrlCreativoExterno() != null) campana.setUrlCreativoExterno(dto.getUrlCreativoExterno());
        if (dto.getUrlInforme() != null) campana.setUrlInforme(dto.getUrlInforme());
        if (dto.getAlcance() != null) campana.setAlcance(dto.getAlcance());
        if (dto.getClics() != null) campana.setClics(dto.getClics());
        if (dto.getLeads() != null) campana.setLeads(dto.getLeads());
        if (dto.getCostoSemanal() != null) campana.setCostoSemanal(dto.getCostoSemanal());
        if (dto.getCostoLead() != null) campana.setCostoLead(dto.getCostoLead());
        // Para métricas del dueño, permitir valores 0 como válidos
        // Verificar si el campo está presente en el DTO (no null)
        if (dto.getConductoresRegistrados() != null) {
            campana.setConductoresRegistrados(dto.getConductoresRegistrados());
        }
        if (dto.getConductoresPrimerViaje() != null) {
            campana.setConductoresPrimerViaje(dto.getConductoresPrimerViaje());
        }
        if (dto.getCostoConductorRegistrado() != null) campana.setCostoConductorRegistrado(dto.getCostoConductorRegistrado());
        if (dto.getCostoConductorPrimerViaje() != null) campana.setCostoConductorPrimerViaje(dto.getCostoConductorPrimerViaje());
        
        // Recalcular costo por lead automáticamente si cambian costoSemanal o leads
        if ((dto.getCostoSemanal() != null || dto.getLeads() != null) && 
            campana.getCostoSemanal() != null && campana.getLeads() != null && 
            campana.getLeads() > 0) {
            campana.setCostoLead(campana.getCostoSemanal() / campana.getLeads());
        }
        
        // costoConductor ya no está almacenado en el modelo - se calcula dinámicamente en convertToDto
    }
    
    private Map<String, Object> resumenCampana(Campana campana) {
        Map<String, Object> data = new LinkedHashMap<>();
        if (campana == null) {
            return data;
        }
        data.put("id", campana.getId());
        data.put("nombre", campana.getNombre());
        data.put("estado", campana.getEstado() != null ? campana.getEstado().getDisplayName() : null);
        data.put("dueno", campana.getNombreDueno());
        data.put("inicialesDueno", campana.getInicialesDueno());
        data.put("semanaISO", campana.getSemanaISO());
        data.put("pais", campana.getPais() != null ? campana.getPais().getDisplayName() : null);
        data.put("vertical", campana.getVertical() != null ? campana.getVertical().getDisplayName() : null);
        data.put("plataforma", campana.getPlataforma() != null ? campana.getPlataforma().getDisplayName() : null);
        data.put("segmento", campana.getSegmento() != null ? campana.getSegmento().getDisplayName() : null);
        data.put("fechaCreacion", campana.getFechaCreacion());
        data.put("fechaActualizacion", campana.getFechaActualizacion());
        return data;
    }
    
    private int getCurrentWeekISO() {
        WeekFields weekFields = WeekFields.ISO;
        LocalDateTime ahora = LocalDateTime.now();
        return ahora.get(weekFields.weekOfWeekBasedYear());
    }
    
    /**
     * Obtiene la semana ISO anterior (semana actual - 1)
     * Si estamos en la semana 1, retorna la última semana del año anterior
     */
    public int getPreviousWeekISO() {
        WeekFields weekFields = WeekFields.ISO;
        LocalDateTime ahora = LocalDateTime.now();
        int semanaActual = ahora.get(weekFields.weekOfWeekBasedYear());
        int añoActual = ahora.getYear();
        
        // Si estamos en la semana 1, retornar la última semana del año anterior
        if (semanaActual == 1) {
            // Calcular cuántas semanas tiene el año anterior
            LocalDateTime ultimoDiaAñoAnterior = LocalDateTime.of(añoActual - 1, 12, 31, 23, 59);
            return ultimoDiaAñoAnterior.get(weekFields.weekOfWeekBasedYear());
        }
        
        return semanaActual - 1;
    }
}
